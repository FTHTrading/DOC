import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { writeAuditEvent } from "@doc/audit-log";
import { updateWorkflowStatus } from "@doc/orchestrator-core";
import { evaluateComplianceGate } from "@doc/compliance-engine";
import { classifyIntake, routeIntake } from "@doc/intake-engine";
import { runAgent } from "@doc/mcp-runtime";
import { prisma } from "@doc/db";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

console.log("[orchestrator] Starting DOC Orchestrator on pid", process.pid);

// ─── Workflow Queue Worker ────────────────────────────────────────────────────

const workflowWorker = new Worker(
  "doc:workflows",
  async (job: Job) => {
    const { workflowRunId, workflowType, payload } = job.data as {
      workflowRunId: string;
      workflowType: string;
      payload: Record<string, unknown>;
    };

    console.log(`[orchestrator] Processing workflow ${workflowType} (run=${workflowRunId})`);

    await updateWorkflowStatus(workflowRunId, "running");

    try {
      switch (workflowType) {
        case "intake_classify":
          await handleIntakeClassify(payload);
          break;
        case "compliance_gate":
          await handleComplianceGate(payload);
          break;
        case "deal_notification":
          await handleDealNotification(payload);
          break;
        case "comp_event_review":
          await handleCompEventReview(payload);
          break;
        case "kyc_verification":
          await handleKycVerification(payload);
          break;
        default:
          console.warn(`[orchestrator] Unknown workflow type: ${workflowType}`);
      }

      await updateWorkflowStatus(workflowRunId, "completed", { completedAt: new Date().toISOString() });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[orchestrator] Workflow ${workflowRunId} failed:`, message);
      await updateWorkflowStatus(workflowRunId, "failed", { error: message });
      throw err;
    }
  },
  {
    connection,
    concurrency: 5,
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 500 },
  }
);

// ─── Workflow Handlers ────────────────────────────────────────────────────────

async function handleIntakeClassify(payload: Record<string, unknown>) {
  const { submissionId } = payload as { submissionId: string };
  if (!submissionId) return;

  await classifyIntake(submissionId);

  await writeAuditEvent({
    actor: "orchestrator",
    action: "INTAKE_CLASSIFIED",
    resource: "IntakeSubmission",
    resourceId: submissionId,
    detail: { via: "workflow" },
  });
}

async function handleComplianceGate(payload: Record<string, unknown>) {
  const { participantId, context } = payload as {
    participantId: string;
    context: Record<string, unknown>;
  };
  if (!participantId) return;

  const result = await evaluateComplianceGate({
    participantId,
    context: context ?? {},
  });

  await writeAuditEvent({
    actor: "orchestrator",
    action: "COMPLIANCE_GATE_EVALUATED",
    resource: "Participant",
    resourceId: participantId,
    detail: { result: result.result, failedChecks: result.failedChecks },
  });
}

async function handleDealNotification(payload: Record<string, unknown>) {
  const { dealRoomId, eventType } = payload as { dealRoomId: string; eventType: string };
  if (!dealRoomId) return;

  // Look up deal participants and use comms agent to notify them
  const result = await runAgent({
    agentSlug: "comms-agent",
    triggeredBy: "orchestrator",
    inputContext: { dealRoomId, eventType },
  });

  await writeAuditEvent({
    actor: "orchestrator",
    action: "DEAL_NOTIFICATIONS_SENT",
    resource: "DealRoom",
    resourceId: dealRoomId,
    detail: { agentRunId: result.agentRunId, eventType },
  });
}

async function handleCompEventReview(payload: Record<string, unknown>) {
  const { compEventId } = payload as { compEventId: string };
  if (!compEventId) return;

  const result = await runAgent({
    agentSlug: "comp-agent",
    triggeredBy: "orchestrator",
    inputContext: { compEventId, task: "review_comp_event" },
  });

  await writeAuditEvent({
    actor: "orchestrator",
    action: "COMP_EVENT_REVIEWED",
    resource: "CompEvent",
    resourceId: compEventId,
    detail: { agentRunId: result.agentRunId },
  });
}

async function handleKycVerification(payload: Record<string, unknown>) {
  const { participantId } = payload as { participantId: string };
  if (!participantId) return;

  const result = await runAgent({
    agentSlug: "identity-agent",
    triggeredBy: "orchestrator",
    inputContext: { participantId, task: "kyc_verification" },
  });

  await writeAuditEvent({
    actor: "orchestrator",
    action: "KYC_VERIFICATION_INITIATED",
    resource: "Participant",
    resourceId: participantId,
    detail: { agentRunId: result.agentRunId },
  });
}

// ─── Compliance Queue Worker ──────────────────────────────────────────────────

const complianceWorker = new Worker(
  "doc:compliance",
  async (job: Job) => {
    const { eventType, payload } = job.data as { eventType: string; payload: Record<string, unknown> };

    console.log(`[orchestrator] Compliance event: ${eventType}`);

    if (eventType === "re_evaluate_gate" && payload.participantId) {
      await evaluateComplianceGate({
        participantId: payload.participantId as string,
        context: (payload.context as Record<string, unknown>) ?? {},
      });
    }
  },
  {
    connection,
    concurrency: 3,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  }
);

// ─── Notifications Worker ─────────────────────────────────────────────────────

const notificationWorker = new Worker(
  "doc:notifications",
  async (job: Job) => {
    const { recipientId, message, channel } = job.data as {
      recipientId: string;
      message: string;
      channel: string;
    };

    console.log(`[orchestrator] Notification → ${channel}:${recipientId}: ${message.slice(0, 60)}…`);
    // In production: integrate email/SMS/webhook delivery here
  },
  {
    connection,
    concurrency: 10,
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 200 },
  }
);

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

async function shutdown() {
  console.log("[orchestrator] Shutting down workers…");
  await Promise.all([
    workflowWorker.close(),
    complianceWorker.close(),
    notificationWorker.close(),
  ]);
  await connection.quit();
  await prisma.$disconnect();
  console.log("[orchestrator] Shutdown complete.");
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

workflowWorker.on("error", (err) => console.error("[orchestrator] workflowWorker error:", err));
complianceWorker.on("error", (err) => console.error("[orchestrator] complianceWorker error:", err));
notificationWorker.on("error", (err) => console.error("[orchestrator] notificationWorker error:", err));

console.log("[orchestrator] Workers ready. Waiting for jobs…");
