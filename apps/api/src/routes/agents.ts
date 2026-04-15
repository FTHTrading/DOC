import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { runAgent } from "@doc/mcp-runtime";

const runBody = z.object({
  userMessage: z.string().min(1),
  systemContext: z.record(z.unknown()).optional(),
  threadId: z.string().optional(),
});

export async function agentsRoutes(app: FastifyInstance) {
  // List available agent definitions
  app.get("/", async () => {
    const { prisma } = await import("@doc/db");
    const agents = await prisma.agentDefinition.findMany({
      where: { isActive: true },
      orderBy: { slug: "asc" },
    });
    return { ok: true, data: agents };
  });

  // Run an agent by slug
  app.post<{ Params: { slug: string }; Body: z.infer<typeof runBody> }>(
    "/:slug/run",
    async (req, reply) => {
      const parsed = runBody.safeParse(req.body);
      if (!parsed.success) return reply.status(400).send({ ok: false, error: parsed.error.flatten() });

      const user = req.user as { sub: string } | undefined;
      const result = await runAgent({
        agentSlug: req.params.slug,
        userMessage: parsed.data.userMessage,
        systemContext: parsed.data.systemContext,
        triggeredById: user?.sub,
      });

      return { ok: true, data: result };
    }
  );

  // Get agent run history
  app.get<{ Params: { slug: string }; Querystring: { limit?: string } }>(
    "/:slug/runs",
    async (req) => {
      const { prisma } = await import("@doc/db");
      const runs = await prisma.agentRun.findMany({
        where: { agentSlug: req.params.slug },
        orderBy: { startedAt: "desc" },
        take: Math.min(Number(req.query.limit ?? 20), 100),
      });
      return { ok: true, data: runs };
    }
  );
}
