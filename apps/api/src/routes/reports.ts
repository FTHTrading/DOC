import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { generateReport } from "@doc/reporting";

const reportBody = z.object({
  reportType: z.enum([
    "compliance_summary",
    "pipeline_snapshot",
    "agent_activity",
    "payout_register",
    "intake_funnel",
    "audit_trail",
    "kyc_status",
    "workflow_performance",
  ]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  repId: z.string().uuid().optional(),
});

export async function reportsRoutes(app: FastifyInstance) {
  app.post<{ Body: z.infer<typeof reportBody> }>(
    "/generate",
    async (req, reply) => {
      const parsed = reportBody.safeParse(req.body);
      if (!parsed.success) return reply.status(400).send({ ok: false, error: parsed.error.flatten() });
      const user = req.user as { sub: string };

      const report = await generateReport({
        reportType: parsed.data.reportType,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        repId: parsed.data.repId,
        requestedById: user.sub,
      });

      return { ok: true, data: report };
    }
  );
}
