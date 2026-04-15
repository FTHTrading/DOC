import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { acceptIntake, routeIntake } from "@doc/intake-engine";
import { prisma } from "@doc/db";

const intakeBody = z.object({
  submitterName: z.string().min(1),
  submitterEmail: z.string().email(),
  submitterPhone: z.string().optional(),
  intakeType: z.enum(["investor_inquiry", "issuer_inquiry", "partner_request", "support", "general"]),
  channel: z.enum(["web", "email", "phone", "referral", "direct"]).default("web"),
  content: z.string().min(10),
  metadata: z.record(z.unknown()).optional(),
});

export async function intakeRoutes(app: FastifyInstance) {
  // Public intake endpoint (no auth — webhook)
  app.post<{ Body: z.infer<typeof intakeBody> }>(
    "/",
    {
      config: { rateLimit: { max: 10, timeWindow: "5 minutes" } },
    },
    async (req, reply) => {
      // Validate webhook secret if set
      const secret = process.env["INTAKE_WEBHOOK_SECRET"];
      if (secret) {
        const provided = req.headers["x-doc-webhook-secret"];
        if (provided !== secret) return reply.status(401).send({ ok: false, error: "Unauthorized" });
      }

      const parsed = intakeBody.safeParse(req.body);
      if (!parsed.success) return reply.status(400).send({ ok: false, error: parsed.error.flatten() });

      const submission = await acceptIntake(parsed.data);
      return reply.status(202).send({ ok: true, data: { submissionId: submission.id, status: "received" } });
    }
  );

  // List intake submissions (admin — requires auth)
  app.get<{ Querystring: { status?: string; type?: string; limit?: string } }>(
    "/submissions",
    async (req) => {
      const submissions = await prisma.intakeSubmission.findMany({
        where: {
          status: req.query.status ? (req.query.status as "pending" | "classified" | "routed" | "in_progress" | "resolved" | "rejected") : undefined,
          intakeType: req.query.type ? (req.query.type as "investor_inquiry" | "issuer_inquiry" | "partner_request" | "support" | "general") : undefined,
        },
        orderBy: { submittedAt: "desc" },
        take: Math.min(Number(req.query.limit ?? 50), 200),
        include: {
          routedToRep: { select: { id: true, displayName: true } },
        },
      });
      return { ok: true, data: submissions, count: submissions.length };
    }
  );

  // Route intake to a representative
  app.post<{ Params: { id: string }; Body: { repId: string } }>(
    "/submissions/:id/route",
    async (req) => {
      const user = req.user as { sub: string };
      const submission = await routeIntake(req.params.id, req.body.repId, user.sub);
      return { ok: true, data: submission };
    }
  );
}
