/**
 * DOC OS — MCP Runtime
 * Tool registry, agent runner, and execution policy enforcement.
 */
import { prisma } from "@doc/db";
import { writeAuditEvent } from "@doc/audit-log";
import { routeCompletion } from "@doc/model-router";
import type { ToolCall, ToolResult } from "@doc/domain";

// ─── Tool handler type ───────────────────────────────────────────────────────
export type ToolHandler = (input: Record<string, unknown>, context: ToolContext) => Promise<unknown>;

export interface ToolContext {
  agentRunId: string;
  agentSlug: string;
  invokedById?: string;
}

// ─── Tool registry ───────────────────────────────────────────────────────────
const toolHandlers = new Map<string, ToolHandler>();

export function registerTool(slug: string, handler: ToolHandler): void {
  if (toolHandlers.has(slug)) {
    console.warn(`[mcp-runtime] Overriding existing tool handler for: ${slug}`);
  }
  toolHandlers.set(slug, handler);
}

export function getRegisteredTools(): string[] {
  return Array.from(toolHandlers.keys());
}

// ─── Tool execution ──────────────────────────────────────────────────────────
export async function executeTool(
  call: ToolCall,
  context: ToolContext
): Promise<ToolResult> {
  const startTime = Date.now();

  // Validate tool exists in DB
  const toolDef = await prisma.toolDefinition.findUnique({
    where: { slug: call.toolSlug },
  });

  if (!toolDef || !toolDef.isActive) {
    return { success: false, error: `Tool not found or inactive: ${call.toolSlug}`, latencyMs: Date.now() - startTime };
  }

  // Check if this agent is allowed to use the tool
  const agentDef = await prisma.agentDefinition.findUnique({
    where: { slug: context.agentSlug },
  });

  if (!agentDef) {
    return { success: false, error: `Agent not found: ${context.agentSlug}`, latencyMs: Date.now() - startTime };
  }

  if (!agentDef.allowedTools.includes(call.toolSlug)) {
    await writeAuditEvent({
      eventType: "agent_run_failed",
      targetType: "agent_run",
      targetId: context.agentRunId,
      summary: `Agent ${context.agentSlug} attempted disallowed tool: ${call.toolSlug}`,
      metadata: { toolSlug: call.toolSlug, agentSlug: context.agentSlug },
    });
    return { success: false, error: `Agent '${context.agentSlug}' is not authorized to use tool '${call.toolSlug}'`, latencyMs: Date.now() - startTime };
  }

  // Check if forbidden action is attempted
  if (agentDef.forbiddenActions.some((action) => call.toolSlug.includes(action))) {
    return { success: false, error: `Tool '${call.toolSlug}' is a forbidden action for agent '${context.agentSlug}'`, latencyMs: Date.now() - startTime };
  }

  // Check if approval is required
  if (toolDef.requiresApproval) {
    return {
      success: false,
      error: `Tool '${call.toolSlug}' requires human approval — this request has been queued`,
      requiresApproval: true,
      latencyMs: Date.now() - startTime,
    };
  }

  // Get handler
  const handler = toolHandlers.get(call.toolSlug);
  if (!handler) {
    return { success: false, error: `No handler registered for tool: ${call.toolSlug}`, latencyMs: Date.now() - startTime };
  }

  let output: unknown;
  let success = false;
  let errorMessage: string | undefined;

  try {
    output = await handler(call.input, context);
    success = true;
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err);
  }

  const latencyMs = Date.now() - startTime;

  // Persist invocation record
  prisma.toolInvocation
    .create({
      data: {
        agentRunId: context.agentRunId,
        toolDefinitionId: toolDef.id,
        inputJson: call.input,
        outputJson: output as Record<string, unknown> | undefined,
        success,
        errorMessage,
        latencyMs,
      },
    })
    .catch((e) => console.error("[mcp-runtime] Failed to persist tool invocation:", e));

  await writeAuditEvent({
    eventType: "tool_invoked",
    targetType: "tool_invocation",
    targetId: toolDef.id,
    summary: `Tool ${call.toolSlug} invoked by agent ${context.agentSlug} — ${success ? "ok" : "failed"}`,
    metadata: { toolSlug: call.toolSlug, agentSlug: context.agentSlug, success, latencyMs },
  });

  return { success, output, error: errorMessage, latencyMs };
}

// ─── Agent runner ─────────────────────────────────────────────────────────────
export interface AgentRunInput {
  agentSlug: string;
  input: Record<string, unknown>;
  workflowRunId?: string;
  triggeredById?: string;
  systemPromptOverride?: string;
}

export interface AgentRunOutput {
  agentRunId: string;
  completion: string;
  status: string;
  toolsUsed: string[];
  tokenCount: number;
  latencyMs: number;
}

export async function runAgent(request: AgentRunInput): Promise<AgentRunOutput> {
  const startTime = Date.now();

  const agentDef = await prisma.agentDefinition.findUnique({
    where: { slug: request.agentSlug },
  });

  if (!agentDef || !agentDef.isActive) {
    throw new Error(`Agent not found or inactive: ${request.agentSlug}`);
  }

  // Create agent run record
  const agentRun = await prisma.agentRun.create({
    data: {
      agentDefinitionId: agentDef.id,
      workflowRunId: request.workflowRunId,
      triggeredById: request.triggeredById,
      status: "running",
      startedAt: new Date(),
      inputJson: request.input,
    },
  });

  await writeAuditEvent({
    eventType: "agent_run_started",
    targetType: "agent_run",
    targetId: agentRun.id,
    summary: `Agent ${request.agentSlug} started`,
    metadata: { agentSlug: request.agentSlug, workflowRunId: request.workflowRunId },
  });

  const systemMessage = request.systemPromptOverride ?? agentDef.systemPrompt ?? `You are ${agentDef.name}. ${agentDef.purpose}`;
  const userMessage = JSON.stringify(request.input);

  let completion: string;
  let inputTokens = 0;
  let outputTokens = 0;

  try {
    const result = await routeCompletion({
      systemMessage,
      userMessage,
      agentRunId: agentRun.id,
      invokedById: request.triggeredById,
    });

    completion = result.completion;
    inputTokens = result.inputTokens;
    outputTokens = result.outputTokens;

    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        outputJson: { completion },
        tokenCount: inputTokens + outputTokens,
        latencyMs: Date.now() - startTime,
      },
    });

    await writeAuditEvent({
      eventType: "agent_run_completed",
      targetType: "agent_run",
      targetId: agentRun.id,
      summary: `Agent ${request.agentSlug} completed`,
      metadata: { agentSlug: request.agentSlug, tokens: inputTokens + outputTokens },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: "failed",
        completedAt: new Date(),
        errorMessage,
        latencyMs: Date.now() - startTime,
      },
    });

    await writeAuditEvent({
      eventType: "agent_run_failed",
      targetType: "agent_run",
      targetId: agentRun.id,
      summary: `Agent ${request.agentSlug} failed: ${errorMessage}`,
    });

    throw err;
  }

  return {
    agentRunId: agentRun.id,
    completion,
    status: "completed",
    toolsUsed: [],
    tokenCount: inputTokens + outputTokens,
    latencyMs: Date.now() - startTime,
  };
}

export { executeTool as runTool };
export type { ToolCall, ToolResult };
