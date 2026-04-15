import { Worker, Job, Queue } from "bullmq";
import IORedis from "ioredis";
import { writeAuditEvent } from "@doc/audit-log";
import { runAgent, executeTool } from "@doc/mcp-runtime";
import { generateReport } from "@doc/reporting";
import { prisma } from "@doc/db";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Re-enqueue deferred notifications here
const notifQueue = new Queue("doc:notifications", { connection });

console.log("[worker] Starting DOC Worker on pid", process.pid);

// ─── Agent Job Worker ─────────────────────────────────────────────────────────
// Processes jobs from doc:agents queue.
// Expected job shapes:
//   type: "run-agent"      → { agentSlug, triggeredBy, inputContext }
//   type: "tool-invocation" → { toolName, input, triggeredBy, agentRunId? }
//   type: "generate-report" → { reportType, requestedBy, params }
//   type: "send-notification" → { recipientId, message, channel }

const agentWorker = new Worker(
  "doc:agents",
  async (job: Job) => {
    const { type } = job.data as { type: string };

    switch (type) {
      case "run-agent":
        await processAgentRun(job);
        break;
      case "tool-invocation":
        await processToolInvocation(job);
        break;
      case "generate-report":
        await processReportGeneration(job);
        break;
      case "send-notification":
        await processSendNotification(job);
        break;
      default:
        console.warn(`[worker] Unknown job type: ${type}`);
    }
  },
  {
    connection,
    concurrency: 8,
    removeOnComplete: { count: 300 },
    removeOnFail: { count: 500 },
  }
);

// ─── Job Handlers ─────────────────────────────────────────────────────────────

async function processAgentRun(job: Job) {
  const { agentSlug, triggeredBy, inputContext } = job.data as {
    agentSlug: string;
    triggeredBy: string;
    inputContext: Record<string, unknown>;
  };

  console.log(`[worker] Running agent ${agentSlug} triggered by ${triggeredBy}`);

  const result = await runAgent({ agentSlug, triggeredBy, inputContext });

  await writeAuditEvent({
    actor: triggeredBy,
    action: "AGENT_RUN_COMPLETED",
    resource: "AgentRun",
    resourceId: result.agentRunId,
    detail: { agentSlug, status: result.status, tokensUsed: result.tokensUsed },
  });

  return result;
}

async function processToolInvocation(job: Job) {
  const { toolName, input, triggeredBy, agentRunId } = job.data as {
    toolName: string;
    input: Record<string, unknown>;
    triggeredBy: string;
    agentRunId?: string;
  };

  console.log(`[worker] Tool invocation ${toolName} by ${triggeredBy}`);

  const result = await executeTool({ toolName, input, invokedBy: triggeredBy });

  await writeAuditEvent({
    actor: triggeredBy,
    action: "TOOL_INVOKED",
    resource: "ToolInvocation",
    resourceId: result.invocationId ?? toolName,
    detail: { toolName, success: result.success, agentRunId },
  });

  return result;
}

async function processReportGeneration(job: Job) {
  const { reportType, requestedBy, params } = job.data as {
    reportType: string;
    requestedBy: string;
    params: Record<string, unknown>;
  };

  console.log(`[worker] Generating report: ${reportType}`);

  const result = await generateReport({
    type: reportType as Parameters<typeof generateReport>[0]["type"],
    requestedBy,
    params: params ?? {},
  });

  // Enqueue notification to the requestor with the result ID
  await notifQueue.add("report-ready", {
    recipientId: requestedBy,
    message: `Your ${reportType} report is ready.`,
    channel: "internal",
    metadata: { reportId: result.reportId },
  });

  return result;
}

async function processSendNotification(job: Job) {
  const { recipientId, message, channel, metadata } = job.data as {
    recipientId: string;
    message: string;
    channel: string;
    metadata?: Record<string, unknown>;
  };

  console.log(`[worker] Notification → ${channel}:${recipientId}`);

  // Resolve recipient contact info
  const user = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { email: true, name: true },
  }).catch(() => null);

  if (!user) {
    console.warn(`[worker] Notification target ${recipientId} not found — skipping`);
    return;
  }

  // In production: plug in SendGrid / SES / Twilio here
  console.log(`[worker] → Email to ${user.email}: ${message}`);

  await writeAuditEvent({
    actor: "worker",
    action: "NOTIFICATION_SENT",
    resource: "User",
    resourceId: recipientId,
    detail: { channel, metadata },
  });
}

// ─── Scheduled Health Check ───────────────────────────────────────────────────

async function healthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await connection.ping();
    console.log(`[worker] Health OK at ${new Date().toISOString()}`);
  } catch (err) {
    console.error("[worker] Health check failed:", err);
  }
}

const healthInterval = setInterval(healthCheck, 60_000);

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

async function shutdown() {
  console.log("[worker] Shutting down…");
  clearInterval(healthInterval);
  await agentWorker.close();
  await notifQueue.close();
  await connection.quit();
  await prisma.$disconnect();
  console.log("[worker] Shutdown complete.");
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

agentWorker.on("error", (err) => console.error("[worker] agentWorker error:", err));
agentWorker.on("failed", (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err.message);
});

console.log("[worker] Agent worker ready. Waiting for jobs…");
