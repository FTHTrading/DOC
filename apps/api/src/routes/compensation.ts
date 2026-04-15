import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@doc/db";
import { getPendingPayouts, dispatchSettlement } from "@doc/settlement-adapter";
import { writeAuditEvent } from "@doc/audit-log";

const compEventBody = z.object({
  representativeId: z.string().uuid(),
  compPlanId: z.string().uuid(),
  description: z.string().min(5),
  amount: z.number().positive(),
  eventDate: z.string().datetime(),
  productId: z.string().uuid().optional(),
  participantId: z.string().uuid().optional(),
});

const settlementBody = z.object({
  payoutId: z.string().uuid(),
  rail: z.enum(["ach", "wire", "usdf", "atp", "check"]),
  bankRoutingNumber: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  walletAddress: z.string().optional(),
  memo: z.string().optional(),
});

export async function compensationRoutes(app: FastifyInstance) {
  // List comp plans
  app.get("/plans", async () => {
    const plans = await prisma.compPlan.findMany({
      include: { rules: true, _count: { select: { events: true, payouts: true } } },
      orderBy: { createdAt: "desc" },
    });
    return { ok: true, data: plans };
  });

  // Submit a comp event (proposed — requires approval)
  app.post<{ Body: z.infer<typeof compEventBody> }>(
    "/events",
    async (req, reply) => {
      const parsed = compEventBody.safeParse(req.body);
      if (!parsed.success) return reply.status(400).send({ ok: false, error: parsed.error.flatten() });
      const user = req.user as { sub: string };

      const event = await prisma.compEvent.create({
        data: {
          representativeId: parsed.data.representativeId,
          compPlanId: parsed.data.compPlanId,
          submittedById: user.sub,
          description: parsed.data.description,
          amount: parsed.data.amount,
          eventDate: new Date(parsed.data.eventDate),
          productId: parsed.data.productId,
          participantId: parsed.data.participantId,
          status: "proposed",
        },
      });

      await writeAuditEvent({
        actorId: user.sub,
        eventType: "comp_event_submitted",
        targetType: "comp_event",
        targetId: event.id,
        summary: `Comp event proposed: $${parsed.data.amount} by ${parsed.data.representativeId}`,
      });

      return reply.status(201).send({ ok: true, data: event });
    }
  );

  // Approve a comp event (compliance/supervisor only)
  app.post<{ Params: { id: string }; Body: { notes?: string } }>(
    "/events/:id/approve",
    async (req) => {
      const user = req.user as { sub: string };
      const event = await prisma.compEvent.findUniqueOrThrow({ where: { id: req.params.id } });

      const approved = await prisma.approvedCompEvent.create({
        data: {
          compEventId: event.id,
          approvedById: user.sub,
          amount: event.amount,
          description: event.description ?? "",
        },
      });

      await prisma.compEvent.update({
        where: { id: req.params.id },
        data: { status: "approved", approvedById: user.sub },
      });

      await writeAuditEvent({
        actorId: user.sub,
        eventType: "comp_event_approved",
        targetType: "comp_event",
        targetId: req.params.id,
        summary: `Comp event approved: $${event.amount}`,
      });

      return { ok: true, data: approved };
    }
  );

  // List pending payouts
  app.get<{ Querystring: { repId?: string } }>(
    "/payouts/pending",
    async (req) => {
      const payouts = await getPendingPayouts(req.query.repId);
      return { ok: true, data: payouts };
    }
  );

  // Dispatch settlement
  app.post<{ Body: z.infer<typeof settlementBody> }>(
    "/payouts/settle",
    async (req, reply) => {
      const parsed = settlementBody.safeParse(req.body);
      if (!parsed.success) return reply.status(400).send({ ok: false, error: parsed.error.flatten() });
      const user = req.user as { sub: string };

      const payout = await prisma.payout.findUnique({ where: { id: parsed.data.payoutId } });
      if (!payout) return reply.status(404).send({ ok: false, error: "Payout not found" });

      const result = await dispatchSettlement({
        ...parsed.data,
        representativeId: payout.representativeId,
        amountUsd: Number(payout.amount),
        authorizedById: user.sub,
      });

      return { ok: result.success, data: result };
    }
  );
}
