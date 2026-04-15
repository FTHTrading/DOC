/**
 * DOC OS — Identity Graph Engine
 * Builds and traverses the participant relationship graph.
 */
import { prisma } from "@doc/db";
import type { RelationshipGraph, GraphNode, GraphEdge } from "@doc/domain";

/**
 * Build the full relationship graph for a given representative's namespace.
 * Includes all participants originated by this rep and their inter-connections.
 */
export async function buildRepGraph(repId: string): Promise<RelationshipGraph> {
  const participants = await prisma.participant.findMany({
    where: { originRepId: repId, isActive: true },
    select: {
      id: true,
      legalName: true,
      participantType: true,
      email: true,
      edgesFrom: { select: { toParticipantId: true, edgeType: true, strengthScore: true } },
    },
  });

  const nodes: GraphNode[] = participants.map((p) => ({
    id: p.id,
    type: "participant" as const,
    label: p.legalName,
    metadata: { type: p.participantType, email: p.email },
  }));

  const edges: GraphEdge[] = participants.flatMap((p) =>
    p.edgesFrom.map((e) => ({
      fromId: p.id,
      toId: e.toParticipantId,
      edgeType: e.edgeType,
      strength: e.strengthScore ?? undefined,
    }))
  );

  return { nodes, edges };
}

/**
 * Get all participants connected to a given participant within N hops.
 */
export async function getConnectedParticipants(
  participantId: string,
  maxHops = 2
): Promise<Array<{ id: string; legalName: string; participantType: string; hops: number }>> {
  const visited = new Set<string>([participantId]);
  const result: Array<{ id: string; legalName: string; participantType: string; hops: number }> = [];
  let frontier = [participantId];

  for (let hop = 1; hop <= maxHops; hop++) {
    const edges = await prisma.relationshipEdge.findMany({
      where: {
        OR: [{ fromParticipantId: { in: frontier } }, { toParticipantId: { in: frontier } }],
        isActive: true,
      },
      select: {
        fromParticipantId: true,
        toParticipantId: true,
        fromParticipant: { select: { id: true, legalName: true, participantType: true } },
        toParticipant: { select: { id: true, legalName: true, participantType: true } },
      },
    });

    const nextFrontier: string[] = [];
    for (const edge of edges) {
      for (const p of [edge.fromParticipant, edge.toParticipant]) {
        if (!visited.has(p.id)) {
          visited.add(p.id);
          nextFrontier.push(p.id);
          result.push({ ...p, hops: hop });
        }
      }
    }
    frontier = nextFrontier;
    if (frontier.length === 0) break;
  }

  return result;
}

/**
 * Add a relationship edge between two participants.
 * Immutable — edges are never deleted, only deactivated.
 */
export async function addRelationshipEdge(input: {
  fromParticipantId: string;
  toParticipantId: string;
  edgeType: string;
  originRepId: string;
  strengthScore?: number;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string }> {
  const edge = await prisma.relationshipEdge.upsert({
    where: {
      fromParticipantId_toParticipantId_edgeType: {
        fromParticipantId: input.fromParticipantId,
        toParticipantId: input.toParticipantId,
        edgeType: input.edgeType,
      },
    },
    update: { isActive: true, strengthScore: input.strengthScore },
    create: {
      fromParticipantId: input.fromParticipantId,
      toParticipantId: input.toParticipantId,
      edgeType: input.edgeType,
      originRepId: input.originRepId,
      strengthScore: input.strengthScore,
      metadata: input.metadata,
    },
  });

  return { id: edge.id };
}

/**
 * Get pipeline stats for a representative.
 */
export async function getRepPipelineStats(repId: string): Promise<{
  totalParticipants: number;
  byType: Record<string, number>;
  kycBreakdown: Record<string, number>;
  activeDeals: number;
}> {
  const [participants, kycCases] = await Promise.all([
    prisma.participant.groupBy({
      by: ["participantType"],
      where: { originRepId: repId, isActive: true },
      _count: true,
    }),
    prisma.kycCase.groupBy({
      by: ["status"],
      where: { participant: { originRepId: repId } },
      _count: true,
    }),
  ]);

  const totalParticipants = participants.reduce((s, p) => s + p._count, 0);
  const byType = Object.fromEntries(participants.map((p) => [p.participantType, p._count]));
  const kycBreakdown = Object.fromEntries(kycCases.map((k) => [k.status, k._count]));

  const activeDeals = await prisma.dealParticipant.count({
    where: {
      participant: { originRepId: repId },
      dealRoom: { status: "active" },
    },
  });

  return { totalParticipants, byType, kycBreakdown, activeDeals };
}
