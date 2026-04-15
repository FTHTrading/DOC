/**
 * DOC OS — Communications Service
 * FINRA Rule 4511 compliant: all communications retained for 7 years.
 * Off-platform communications MUST be flagged and logged.
 * NO message may be deleted — only archived with expiry markers.
 */
import { prisma } from "@doc/db";
import { writeAuditEvent } from "@doc/audit-log";
import { RETENTION_YEARS } from "@doc/domain";

function retentionDate(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() + RETENTION_YEARS);
  return d;
}

export interface SendMessageInput {
  channelId?: string;
  dealRoomId?: string;
  senderId: string;
  recipientIds: string[];
  subject?: string;
  body: string;
  isInternal?: boolean;
  isOffPlatform?: boolean;
  attachmentIds?: string[];
}

/**
 * Record a platform message with mandatory 7-year retention timestamp.
 * Returns the created message ID.
 */
export async function recordMessage(input: SendMessageInput): Promise<{ id: string }> {
  if (input.isOffPlatform) {
    // Off-platform comms must still be logged with a supervisory note
    await writeAuditEvent({
      eventType: "message_sent",
      targetType: "participant",
      targetId: input.senderId,
      summary: "Off-platform communication logged. Supervisory review required.",
      metadata: { subject: input.subject, isOffPlatform: true, recipientIds: input.recipientIds },
    });
  }

  const message = await prisma.message.create({
    data: {
      channelId: input.channelId,
      dealRoomId: input.dealRoomId,
      senderId: input.senderId,
      recipientIds: input.recipientIds,
      subject: input.subject,
      body: input.body,
      isInternal: input.isInternal ?? false,
      isOffPlatform: input.isOffPlatform ?? false,
      retainedUntil: retentionDate(),
      attachmentIds: input.attachmentIds ?? [],
    },
  });

  await writeAuditEvent({
    eventType: "message_sent",
    targetType: "message",
    targetId: message.id,
    summary: `Message sent by ${input.senderId} to ${input.recipientIds.length} recipient(s)`,
    metadata: { isOffPlatform: input.isOffPlatform, hasSubject: !!input.subject },
  });

  return { id: message.id };
}

/**
 * Retrieve messages for a participant (both sent and received), sorted by recency.
 */
export async function getParticipantMessages(
  participantId: string,
  limit = 50,
  cursor?: string
) {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: participantId },
        { recipientIds: { has: participantId } },
      ],
    },
    orderBy: { sentAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();

  return {
    messages,
    hasMore,
    nextCursor: hasMore ? messages[messages.length - 1]?.id : undefined,
  };
}

/**
 * Flag a message for eDiscovery review.
 */
export async function flagForEDiscovery(
  messageId: string,
  tag: string,
  flaggedById?: string
): Promise<void> {
  await prisma.message.update({
    where: { id: messageId },
    data: { eDiscoveryTag: tag },
  });

  await writeAuditEvent({
    eventType: "record_updated",
    actorId: flaggedById,
    targetType: "message",
    targetId: messageId,
    summary: `Message flagged for eDiscovery: ${tag}`,
    metadata: { tag },
  });
}

/**
 * Create a communication channel (direct, deal room, broadcast).
 */
export async function createChannel(input: {
  name: string;
  channelType: string;
  dealRoomId?: string;
  participantIds?: string[];
}): Promise<{ id: string }> {
  const channel = await prisma.communicationChannel.create({
    data: {
      name: input.name,
      channelType: input.channelType as any,
      dealRoomId: input.dealRoomId,
      participantIds: input.participantIds ?? [],
      isRetained: true,
      retentionExpiresAt: retentionDate(),
    },
  });

  return { id: channel.id };
}
