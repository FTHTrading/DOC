import { prisma } from "@doc/db";
import type { AuditEventType } from "@doc/domain";

export interface AuditEventInput {
  eventType: AuditEventType;
  actorId?: string;
  actorEmail?: string;
  targetType: string;
  targetId: string;
  summary: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  organizationId?: string;
}

/**
 * Write a structured audit event. Fire-and-forget safe — logs error to stderr
 * but never throws, so calling code is never interrupted by audit failures.
 */
export async function writeAuditEvent(input: AuditEventInput): Promise<void> {
  try {
    await prisma.auditEvent.create({
      data: {
        eventType: input.eventType,
        actorId: input.actorId,
        actorEmail: input.actorEmail,
        targetType: input.targetType,
        targetId: input.targetId,
        summary: input.summary,
        metadata: input.metadata,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        organizationId: input.organizationId,
      },
    });
  } catch (err) {
    // Audit failure must never break the primary operation
    console.error("[audit-log] Failed to write audit event:", err);
  }
}

/**
 * Paginated audit trail query for a specific target.
 */
export async function getAuditTrail(
  targetType: string,
  targetId: string,
  limit = 50,
  cursor?: string
) {
  const events = await prisma.auditEvent.findMany({
    where: { targetType, targetId },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = events.length > limit;
  if (hasMore) events.pop();

  return {
    events,
    hasMore,
    nextCursor: hasMore ? events[events.length - 1]?.id : undefined,
  };
}

/**
 * Get recent audit events for an actor (user).
 */
export async function getActorAuditLog(actorId: string, limit = 100) {
  return prisma.auditEvent.findMany({
    where: { actorId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export type { AuditEventType };
