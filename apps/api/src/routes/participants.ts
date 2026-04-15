import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@doc/db";
import { evaluateComplianceGate } from "@doc/compliance-engine";
import { writeAuditEvent } from "@doc/audit-log";
import type { ParticipantType } from "@doc/domain";

const createBody = z.object({
  legalName: z.string().min(1),
  participantType: z.enum(["investor", "issuer", "broker", "partner", "referral", "internal"]),
  taxId: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  originRepId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function participantsRoutes(app: FastifyInstance) {
  // List participants (paginated)
  app.get<{ Querystring: { limit?: string; cursor?: string; type?: string } }>(
    "/",
    async (req) => {
      const limit = Math.min(Number(req.query.limit ?? 50), 200);
      const participants = await prisma.participant.findMany({
        where: req.query.type ? { participantType: req.query.type as ParticipantType } : undefined,
        take: limit,
        skip: req.query.cursor ? 1 : 0,
        cursor: req.query.cursor ? { id: req.query.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          originRep: { select: { id: true, displayName: true } },
          kycCases: { orderBy: { openedAt: "desc" }, take: 1, select: { status: true } },
        },
      });
      return { ok: true, data: participants, count: participants.length };
    }
  );

  // Get single participant with compliance snapshot
  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const participant = await prisma.participant.findUnique({
      where: { id: req.params.id },
      include: {
        originRep: { select: { id: true, displayName: true } },
        kycCases: { orderBy: { openedAt: "desc" }, take: 3 },
        suitabilityProfiles: { orderBy: { assessedAt: "desc" }, take: 1 },
        accreditationRecords: { orderBy: { verifiedAt: "desc" }, take: 1 },
        deals: { include: { dealRoom: { select: { id: true, name: true, status: true } } } },
      },
    });
    if (!participant) return reply.status(404).send({ ok: false, error: "Not found" });
    return { ok: true, data: participant };
  });

  // Create participant
  app.post<{ Body: z.infer<typeof createBody> }>(
    "/",
    async (req, reply) => {
      const parsed = createBody.safeParse(req.body);
      if (!parsed.success) return reply.status(400).send({ ok: false, error: parsed.error.flatten() });

      const participant = await prisma.participant.create({
        data: {
          legalName: parsed.data.legalName,
          participantType: parsed.data.participantType,
          taxId: parsed.data.taxId,
          email: parsed.data.email,
          phone: parsed.data.phone,
          originRepId: parsed.data.originRepId ?? null,
          metadata: parsed.data.metadata ?? {},
        },
      });

      const user = req.user as { sub: string } | undefined;

      await writeAuditEvent({
        actorId: user?.sub,
        eventType: "participant_created",
        targetType: "participant",
        targetId: participant.id,
        summary: `New ${participant.participantType} created: ${participant.legalName}`,
      });

      return reply.status(201).send({ ok: true, data: participant });
    }
  );

  // Run compliance gate
  app.post<{ Params: { id: string }; Body: { productId?: string; offeringId?: string } }>(
    "/:id/compliance-gate",
    async (req) => {
      const user = req.user as { sub: string } | undefined;
      const gate = await evaluateComplianceGate({
        participantId: req.params.id,
        productId: req.body.productId,
        offeringId: req.body.offeringId,
        evaluatedById: user?.sub,
      });
      return { ok: true, data: gate };
    }
  );
}
