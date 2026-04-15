/**
 * DOC OS — Orchestrator Core
 * Event bus (Redis/BullMQ) + workflow engine.
 * Every significant system action MUST emit an event here.
 */
import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "@doc/db";
import { writeAuditEvent } from "@doc/audit-log";
import type { WorkflowTrigger, OrchestratorEventPayload } from "@doc/domain";

// ─── Redis connection ─────────────────────────────────────────────────────────
let _redis: IORedis | undefined;

export function getRedis(): IORedis {
  if (!_redis) {
    const url = process.env["REDIS_URL"] ?? "redis://localhost:6379";
    _redis = new IORedis(url, { maxRetriesPerRequest: null });
  }
  return _redis;
}

// ─── Event bus queues ─────────────────────────────────────────────────────────
const QUEUES = {
  workflow: "doc:workflows",
  agent: "doc:agents",
  compliance: "doc:compliance",
  notifications: "doc:notifications",
} as const;

type QueueName = keyof typeof QUEUES;

const queues = new Map<QueueName, Queue>();

export function getQueue(name: QueueName): Queue {
  if (!queues.has(name)) {
    queues.set(name, new Queue(QUEUES[name], { connection: getRedis() }));
  }
  return queues.get(name)!;
}

// ─── Publish event ────────────────────────────────────────────────────────────
export async function publishEvent(
  queue: QueueName,
  eventType: string,
  payload: OrchestratorEventPayload["payload"],
  options?: { delay?: number; priority?: number }
): Promise<string> {
  const q = getQueue(queue);
  const job = await q.add(eventType, payload, {
    delay: options?.delay,
    priority: options?.priority,
    removeOnComplete: 100,
    removeOnFail: 500,
  });

  // Persist event to DB for audit
  prisma.orchestratorEvent
    .create({
      data: {
        eventType,
        sourceService: "orchestrator",
        payload,
        workflowRunId: typeof payload["workflowRunId"] === "string" ? payload["workflowRunId"] : undefined,
      },
    })
    .catch((e) => console.error("[orchestrator-core] Failed to persist event:", e));

  return job.id ?? eventType;
}

// ─── Trigger a workflow ───────────────────────────────────────────────────────
export async function triggerWorkflow(trigger: WorkflowTrigger): Promise<{ workflowRunId: string }> {
  const run = await prisma.workflowRun.create({
    data: {
      workflowType: trigger.workflowType,
      status: "pending",
      triggerType: trigger.triggerType,
      triggerId: trigger.triggerId,
      inputJson: trigger.input,
    },
  });

  await publishEvent("workflow", trigger.workflowType, {
    workflowRunId: run.id,
    workflowType: trigger.workflowType,
    triggerType: trigger.triggerType,
    triggerId: trigger.triggerId,
    input: trigger.input,
  });

  await writeAuditEvent({
    eventType: "workflow_started",
    targetType: "workflow_run",
    targetId: run.id,
    summary: `Workflow triggered: ${trigger.workflowType}`,
    metadata: { workflowType: trigger.workflowType, triggerType: trigger.triggerType },
  });

  return { workflowRunId: run.id };
}

// ─── Workflow step helpers ────────────────────────────────────────────────────
export async function updateWorkflowStatus(
  workflowRunId: string,
  status: "running" | "completed" | "failed" | "paused",
  data?: { outputJson?: Record<string, unknown>; errorMessage?: string }
): Promise<void> {
  await prisma.workflowRun.update({
    where: { id: workflowRunId },
    data: {
      status,
      startedAt: status === "running" ? new Date() : undefined,
      completedAt: status === "completed" ? new Date() : undefined,
      failedAt: status === "failed" ? new Date() : undefined,
      outputJson: data?.outputJson,
      errorMessage: data?.errorMessage,
    },
  });

  await writeAuditEvent({
    eventType: status === "completed" ? "workflow_completed" : status === "failed" ? "workflow_failed" : "system_event",
    targetType: "workflow_run",
    targetId: workflowRunId,
    summary: `Workflow ${status}`,
    metadata: { status, errorMessage: data?.errorMessage },
  });
}

// ─── Worker registration ──────────────────────────────────────────────────────
export type JobProcessor = (job: Job) => Promise<void>;

export function registerWorker(
  queue: QueueName,
  processor: JobProcessor,
  concurrency = 5
): Worker {
  const worker = new Worker(QUEUES[queue], processor, {
    connection: getRedis(),
    concurrency,
  });

  worker.on("failed", (job, err) => {
    console.error(`[orchestrator-core] Job failed in ${queue}:`, job?.id, err.message);
  });

  return worker;
}

export type { WorkflowTrigger, OrchestratorEventPayload, Job };
