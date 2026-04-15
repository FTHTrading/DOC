import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { triggerWorkflow, updateWorkflowStatus } from "@doc/orchestrator-core";
import { prisma } from "@doc/db";

const triggerBody = z.object({
  workflowType: z.string().min(1),
  triggerType: z.enum(["manual", "intake_submitted", "kyc_completed", "deal_opened", "comp_event_submitted", "scheduled"]),
  triggerId: z.string().optional(),
  input: z.record(z.unknown()).optional(),
});

export async function workflowsRoutes(app: FastifyInstance) {
  // List workflow runs
  app.get<{ Querystring: { status?: string; type?: string; limit?: string } }>(
    "/",
    async (req) => {
      const runs = await prisma.workflowRun.findMany({
        where: {
          status: req.query.status ? (req.query.status as "pending" | "running" | "completed" | "failed" | "paused") : undefined,
          workflowType: req.query.type ?? undefined,
        },
        orderBy: { createdAt: "desc" },
        take: Math.min(Number(req.query.limit ?? 50), 200),
        include: {
          steps: { orderBy: { startedAt: "asc" } },
        },
      });
      return { ok: true, data: runs };
    }
  );

  // Get workflow run detail
  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const run = await prisma.workflowRun.findUnique({
      where: { id: req.params.id },
      include: {
        steps: { orderBy: { startedAt: "asc" } },
        events: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!run) return reply.status(404).send({ ok: false, error: "Not found" });
    return { ok: true, data: run };
  });

  // Manually trigger a workflow
  app.post<{ Body: z.infer<typeof triggerBody> }>(
    "/trigger",
    async (req, reply) => {
      const parsed = triggerBody.safeParse(req.body);
      if (!parsed.success) return reply.status(400).send({ ok: false, error: parsed.error.flatten() });

      const result = await triggerWorkflow({
        workflowType: parsed.data.workflowType,
        triggerType: parsed.data.triggerType,
        triggerId: parsed.data.triggerId,
        input: parsed.data.input ?? {},
      });

      return reply.status(202).send({ ok: true, data: result });
    }
  );

  // Cancel a running workflow
  app.post<{ Params: { id: string } }>("/:id/cancel", async (req) => {
    await updateWorkflowStatus(req.params.id, "failed", { errorMessage: "Cancelled by user" });
    return { ok: true };
  });
}
