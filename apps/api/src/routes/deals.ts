import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@doc/db";
import { writeAuditEvent } from "@doc/audit-log";

const createBody = z.object({
  name: z.string().min(1),
  offeringId: z.string().uuid(),
  description: z.string().optional(),
  targetAmountUsd: z.number().positive().optional(),
});

export async function dealsRoutes(app: FastifyInstance) {
  // List deal rooms
  app.get<{ Querystring: { status?: string } }>(
    "/",
    async (req) => {
      const rooms = await prisma.dealRoom.findMany({
        where: req.query.status ? { status: req.query.status as "setup" | "open" | "closing" | "closed" | "cancelled" } : undefined,
        include: {
          offering: { select: { id: true, name: true, status: true } },
          _count: { select: { participants: true, documents: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return { ok: true, data: rooms };
    }
  );

  // Get deal room detail
  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const room = await prisma.dealRoom.findUnique({
      where: { id: req.params.id },
      include: {
        offering: true,
        participants: {
          include: { participant: { select: { id: true, legalName: true, participantType: true } } },
        },
        documents: { orderBy: { uploadedAt: "desc" } },
      },
    });
    if (!room) return reply.status(404).send({ ok: false, error: "Deal room not found" });
    return { ok: true, data: room };
  });

  // Create deal room
  app.post<{ Body: z.infer<typeof createBody> }>(
    "/",
    async (req, reply) => {
      const parsed = createBody.safeParse(req.body);
      if (!parsed.success) return reply.status(400).send({ ok: false, error: parsed.error.flatten() });

      const user = req.user as { sub: string };
      const room = await prisma.dealRoom.create({
        data: {
          name: parsed.data.name,
          offeringId: parsed.data.offeringId,
          description: parsed.data.description,
          targetAmountUsd: parsed.data.targetAmountUsd,
          status: "setup",
          createdById: user.sub,
        },
      });

      await writeAuditEvent({
        actorId: user.sub,
        eventType: "deal_room_created",
        targetType: "deal_room",
        targetId: room.id,
        summary: `Deal room created: ${room.name}`,
      });

      return reply.status(201).send({ ok: true, data: room });
    }
  );

  // Update deal room status
  app.patch<{ Params: { id: string }; Body: { status: string } }>(
    "/:id/status",
    async (req) => {
      const user = req.user as { sub: string };
      const room = await prisma.dealRoom.update({
        where: { id: req.params.id },
        data: {
          status: req.body.status as "setup" | "open" | "closing" | "closed" | "cancelled",
          closedAt: req.body.status === "closed" ? new Date() : undefined,
        },
      });

      await writeAuditEvent({
        actorId: user.sub,
        eventType: "deal_room_status_updated",
        targetType: "deal_room",
        targetId: req.params.id,
        summary: `Deal room → ${req.body.status}`,
      });

      return { ok: true, data: room };
    }
  );

  // Add participant to deal room
  app.post<{ Params: { id: string }; Body: { participantId: string; role?: string } }>(
    "/:id/participants",
    async (req, reply) => {
      const user = req.user as { sub: string };
      const dp = await prisma.dealParticipant.create({
        data: {
          dealRoomId: req.params.id,
          participantId: req.body.participantId,
          role: req.body.role ?? "investor",
          addedById: user.sub,
        },
      });
      return reply.status(201).send({ ok: true, data: dp });
    }
  );
}
