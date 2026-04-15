import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@doc/db";
import { raiseException } from "@doc/compliance-engine";
import { writeAuditEvent } from "@doc/audit-log";

const exceptionBody = z.object({
  participantId: z.string().uuid().optional(),
  description: z.string().min(10),
  severity: z.enum(["low", "medium", "high", "critical"]),
  metadata: z.record(z.unknown()).optional(),
});

const reviewBody = z.object({
  notes: z.string().min(5),
  outcome: z.enum(["approved", "rejected", "escalated"]),
});

export async function complianceRoutes(app: FastifyInstance) {
  // List open exception flags
  app.get<{ Querystring: { status?: string; severity?: string } }>(
    "/exceptions",
    async (req) => {
      const exceptions = await prisma.exceptionFlag.findMany({
        where: {
          status: req.query.status ? (req.query.status as "open" | "escalated" | "resolved") : "open",
          severity: req.query.severity ? (req.query.severity as "low" | "medium" | "high" | "critical") : undefined,
        },
        include: {
          participant: { select: { id: true, legalName: true } },
          raisedBy: { select: { id: true, email: true, fullName: true } },
        },
        orderBy: [{ severity: "desc" }, { raisedAt: "desc" }],
        take: 100,
      });
      return { ok: true, data: exceptions, count: exceptions.length };
    }
  );

  // Raise a new exception
  app.post<{ Body: z.infer<typeof exceptionBody> }>(
    "/exceptions",
    async (req, reply) => {
      const parsed = exceptionBody.safeParse(req.body);
      if (!parsed.success) return reply.status(400).send({ ok: false, error: parsed.error.flatten() });

      const user = req.user as { sub: string };
      const flag = await raiseException({
        ...parsed.data,
        raisedById: user.sub,
      });
      return reply.status(201).send({ ok: true, data: flag });
    }
  );

  // List KYC cases
  app.get<{ Querystring: { status?: string } }>(
    "/kyc",
    async (req) => {
      const cases = await prisma.kycCase.findMany({
        where: req.query.status ? { status: req.query.status as "pending" | "in_review" | "approved" | "rejected" | "expired" } : undefined,
        include: {
          participant: { select: { id: true, legalName: true, participantType: true } },
          reviewedBy: { select: { id: true, email: true } },
        },
        orderBy: { openedAt: "desc" },
        take: 100,
      });
      return { ok: true, data: cases, count: cases.length };
    }
  );

  // Update KYC case status
  app.patch<{ Params: { id: string }; Body: { status: string; notes?: string } }>(
    "/kyc/:id",
    async (req, reply) => {
      const user = req.user as { sub: string };
      const updated = await prisma.kycCase.update({
        where: { id: req.params.id },
        data: {
          status: req.body.status as "pending" | "in_review" | "approved" | "rejected" | "expired",
          reviewedById: user.sub,
          reviewNotes: req.body.notes,
          reviewedAt: new Date(),
          approvedAt: req.body.status === "approved" ? new Date() : undefined,
          rejectedAt: req.body.status === "rejected" ? new Date() : undefined,
        },
      });

      await writeAuditEvent({
        actorId: user.sub,
        eventType: "kyc_status_updated",
        targetType: "kyc_case",
        targetId: req.params.id,
        summary: `KYC case ${req.params.id} → ${req.body.status}`,
      });

      return { ok: true, data: updated };
    }
  );

  // List supervisory reviews
  app.get("/supervisory-reviews", async () => {
    const reviews = await prisma.supervisoryReview.findMany({
      include: {
        supervisor: { select: { id: true, displayName: true } },
        representative: { select: { id: true, displayName: true } },
      },
      orderBy: { reviewedAt: "desc" },
      take: 100,
    });
    return { ok: true, data: reviews };
  });

  // Submit supervisory review
  app.post<{ Body: z.infer<typeof reviewBody> & { representativeId: string; reviewType: string } }>(
    "/supervisory-reviews",
    async (req, reply) => {
      const parsed = reviewBody.extend({
        representativeId: z.string().uuid(),
        reviewType: z.string(),
      }).safeParse(req.body);
      if (!parsed.success) return reply.status(400).send({ ok: false, error: parsed.error.flatten() });

      const user = req.user as { sub: string };
      const review = await prisma.supervisoryReview.create({
        data: {
          supervisorId: user.sub,
          representativeId: parsed.data.representativeId,
          reviewType: parsed.data.reviewType,
          reviewNotes: parsed.data.notes,
          outcome: parsed.data.outcome,
        },
      });

      await writeAuditEvent({
        actorId: user.sub,
        eventType: "supervisory_review_submitted",
        targetType: "supervisory_review",
        targetId: review.id,
        summary: `Supervisory review: ${parsed.data.outcome}`,
      });

      return reply.status(201).send({ ok: true, data: review });
    }
  );

  // List disclosure acknowledgments
  app.get<{ Querystring: { participantId?: string } }>(
    "/disclosures",
    async (req) => {
      const docs = await prisma.disclosureAcknowledgment.findMany({
        where: req.query.participantId ? { participantId: req.query.participantId } : undefined,
        orderBy: { acknowledgedAt: "desc" },
        take: 200,
      });
      return { ok: true, data: docs };
    }
  );
}
