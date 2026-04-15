import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { triggerWorkflow } from "@doc/orchestrator-core";
import { writeAuditEvent } from "@doc/audit-log";

const executeBody = z.object({
  command: z.string().min(3),
  mode: z.enum(["plan", "execute"]).default("execute"),
  context: z.record(z.unknown()).optional(),
});

const SAFE_DENY_PATTERNS = [
  /bypass\s+approval/i,
  /disable\s+audit/i,
  /delete\s+audit/i,
  /external\s+withdraw/i,
  /transfer\s+to\s+unknown/i,
];

type CommandIntent =
  | "wallet_issue"
  | "wallet_batch_issue"
  | "payment_request"
  | "compliance_start"
  | "onboarding_start"
  | "message_dispatch"
  | "unknown";

function parseIntent(command: string): {
  intent: CommandIntent;
  requiresApproval: boolean;
  risk: "low" | "medium" | "high";
  extracted: Record<string, unknown>;
} {
  const text = command.trim();

  const batchIssue = text.match(/create\s+(\d+)\s+investor\s+wallets?/i);
  if (batchIssue) {
    return {
      intent: "wallet_batch_issue",
      requiresApproval: true,
      risk: "high",
      extracted: {
        count: Number(batchIssue[1]),
        walletClass: "investor",
        fthPayEnabled: /fth\s*pay/i.test(text),
        initialState: /internal[-\s]*only/i.test(text) ? "INTERNAL_ONLY" : undefined,
      },
    };
  }

  if (/create\s+.*wallet/i.test(text) || /issue\s+.*wallet/i.test(text)) {
    return {
      intent: "wallet_issue",
      requiresApproval: true,
      risk: "medium",
      extracted: {
        fthPayEnabled: /fth\s*pay/i.test(text),
        initialState: /internal[-\s]*only/i.test(text) ? "INTERNAL_ONLY" : undefined,
        role: /broker/i.test(text) ? "broker_dealer" : /issuer/i.test(text) ? "issuer" : /investor/i.test(text) ? "investor" : "participant",
      },
    };
  }

  if (/send\s+\$?\d|transfer\s+/i.test(text)) {
    return {
      intent: "payment_request",
      requiresApproval: true,
      risk: "high",
      extracted: {
        route: /fth\s*pay/i.test(text) ? "FTH_PAY" : "INTERNAL",
      },
    };
  }

  if (/compliance|kyc|kyb|suitability/i.test(text)) {
    return {
      intent: "compliance_start",
      requiresApproval: false,
      risk: "low",
      extracted: {},
    };
  }

  if (/onboard|onboarding|intake/i.test(text)) {
    return {
      intent: "onboarding_start",
      requiresApproval: false,
      risk: "low",
      extracted: {},
    };
  }

  if (/message|notify|send\s+note|secure\s+chat/i.test(text)) {
    return {
      intent: "message_dispatch",
      requiresApproval: false,
      risk: "low",
      extracted: {},
    };
  }

  return {
    intent: "unknown",
    requiresApproval: true,
    risk: "medium",
    extracted: {},
  };
}

function workflowTypeForIntent(intent: CommandIntent): string {
  switch (intent) {
    case "wallet_issue":
      return "wallet_issue";
    case "wallet_batch_issue":
      return "wallet_batch_issue";
    case "payment_request":
      return "transfer_request";
    case "compliance_start":
      return "compliance_gate";
    case "onboarding_start":
      return "onboarding_start";
    case "message_dispatch":
      return "message_dispatch";
    default:
      return "command_review";
  }
}

export async function aiCommandRoutes(app: FastifyInstance) {
  app.post<{ Body: z.infer<typeof executeBody> }>("/execute", async (req, reply) => {
    const parsed = executeBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ ok: false, error: parsed.error.flatten() });
    }

    const actor = (req.user as { sub?: string } | undefined)?.sub;
    const command = parsed.data.command;
    const commandRunId = randomUUID();

    for (const denyPattern of SAFE_DENY_PATTERNS) {
      if (denyPattern.test(command)) {
        await writeAuditEvent({
          eventType: "agent_run_failed",
          ...(actor ? { actorId: actor } : {}),
          targetType: "ai_command",
          targetId: commandRunId,
          summary: "AI command rejected by policy gate",
          metadata: { command, pattern: String(denyPattern) },
        });
        return reply.status(403).send({
          ok: false,
          error: "Command violates execution policy",
          data: { commandRunId },
        });
      }
    }

    const parsedIntent = parseIntent(command);

    await writeAuditEvent({
      eventType: "agent_run_started",
      ...(actor ? { actorId: actor } : {}),
      targetType: "ai_command",
      targetId: commandRunId,
      summary: `AI command received (${parsedIntent.intent})`,
      metadata: {
        command,
        mode: parsed.data.mode,
        intent: parsedIntent.intent,
        risk: parsedIntent.risk,
        requiresApproval: parsedIntent.requiresApproval,
      },
    });

    if (parsed.data.mode === "plan") {
      return reply.send({
        ok: true,
        data: {
          commandRunId,
          mode: "plan",
          intent: parsedIntent.intent,
          risk: parsedIntent.risk,
          requiresApproval: parsedIntent.requiresApproval,
          extracted: parsedIntent.extracted,
          workflowType: workflowTypeForIntent(parsedIntent.intent),
        },
      });
    }

    const workflowType = workflowTypeForIntent(parsedIntent.intent);
    const wf = await triggerWorkflow({
      workflowType,
      triggerType: "manual",
      ...(actor ? { triggerId: actor } : {}),
      input: {
        commandRunId,
        command,
        intent: parsedIntent.intent,
        extracted: parsedIntent.extracted,
        requiresApproval: parsedIntent.requiresApproval,
        context: parsed.data.context ?? {},
      },
    });

    await writeAuditEvent({
      eventType: "workflow_started",
      ...(actor ? { actorId: actor } : {}),
      targetType: "workflow_run",
      targetId: wf.workflowRunId,
      summary: `AI command dispatched to workflow ${workflowType}`,
      metadata: { commandRunId, intent: parsedIntent.intent },
    });

    return reply.status(202).send({
      ok: true,
      data: {
        commandRunId,
        intent: parsedIntent.intent,
        requiresApproval: parsedIntent.requiresApproval,
        risk: parsedIntent.risk,
        workflowRunId: wf.workflowRunId,
        workflowType,
      },
    });
  });
}
