import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { recordMessage, getParticipantMessages, flagForEDiscovery, createChannel } from "@doc/communications";

const messageBody = z.object({
  channelId: z.string().uuid().optional(),
  senderId: z.string().uuid(),
  recipientIds: z.array(z.string().uuid()),
  content: z.string().min(1),
  channel: z.enum(["email", "sms", "platform", "phone", "mail", "other"]).default("platform"),
  isOffPlatform: z.boolean().default(false),
});

const channelBody = z.object({
  name: z.string().min(1),
  participantIds: z.array(z.string().uuid()),
  representativeId: z.string().uuid().optional(),
});

export async function communicationsRoutes(app: FastifyInstance) {
  // List channels
  app.get("/channels", async () => {
    const { prisma } = await import("@doc/db");
    const channels = await prisma.communicationChannel.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { ok: true, data: channels };
  });

  // Create channel
  app.post<{ Body: z.infer<typeof channelBody> }>(
    "/channels",
    async (req, reply) => {
      const parsed = channelBody.safeParse(req.body);
      if (!parsed.success) return reply.status(400).send({ ok: false, error: parsed.error.flatten() });
      const user = req.user as { sub: string };
      const channel = await createChannel({ ...parsed.data, createdById: user.sub });
      return reply.status(201).send({ ok: true, data: channel });
    }
  );

  // Record a message
  app.post<{ Body: z.infer<typeof messageBody> }>(
    "/messages",
    async (req, reply) => {
      const parsed = messageBody.safeParse(req.body);
      if (!parsed.success) return reply.status(400).send({ ok: false, error: parsed.error.flatten() });
      const message = await recordMessage(parsed.data);
      return reply.status(201).send({ ok: true, data: message });
    }
  );

  // Get participant messages
  app.get<{ Params: { participantId: string }; Querystring: { limit?: string } }>(
    "/participants/:participantId",
    async (req) => {
      const msgs = await getParticipantMessages(
        req.params.participantId,
        Math.min(Number(req.query.limit ?? 50), 200)
      );
      return { ok: true, data: msgs };
    }
  );

  // Flag for e-discovery
  app.post<{ Params: { id: string }; Body: { tag: string } }>(
    "/messages/:id/ediscovery",
    async (req) => {
      const user = req.user as { sub: string };
      const msg = await flagForEDiscovery(req.params.id, req.body.tag, user.sub);
      return { ok: true, data: msg };
    }
  );
}
