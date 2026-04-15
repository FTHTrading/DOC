/**
 * DOC OS — Reporting Package
 * Generates structured reports across all BD domains.
 */
import { prisma } from "@doc/db";
import { writeAuditEvent } from "@doc/audit-log";
import type { PaginationParams } from "@doc/domain";

export type ReportType =
  | "compliance_summary"
  | "pipeline_snapshot"
  | "agent_activity"
  | "payout_register"
  | "intake_funnel"
  | "audit_trail"
  | "kyc_status"
  | "workflow_performance";

export interface ReportRequest {
  reportType: ReportType;
  startDate: Date;
  endDate: Date;
  orgId?: string;
  repId?: string;
  requestedById: string;
}

export interface ReportResult {
  reportType: ReportType;
  generatedAt: Date;
  params: Omit<ReportRequest, "requestedById">;
  data: Record<string, unknown>;
}

// ─── Compliance Summary ───────────────────────────────────────────────────────
async function complianceSummary(req: ReportRequest): Promise<Record<string, unknown>> {
  const [kycStats, exceptionStats, gateStats] = await Promise.all([
    prisma.kycCase.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.exceptionFlag.groupBy({
      by: ["severity", "status"],
      _count: { id: true },
    }),
    prisma.complianceGate.groupBy({
      by: ["result"],
      _count: { id: true },
      where: { createdAt: { gte: req.startDate, lte: req.endDate } },
    }),
  ]);

  return { kycStats, exceptionStats, gateStats };
}

// ─── Pipeline Snapshot ────────────────────────────────────────────────────────
async function pipelineSnapshot(req: ReportRequest): Promise<Record<string, unknown>> {
  const [participantCounts, dealRoomCounts, intakeCounts] = await Promise.all([
    prisma.participant.groupBy({
      by: ["participantType", "kycStatus"],
      _count: { id: true },
    }),
    prisma.dealRoom.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.intakeSubmission.groupBy({
      by: ["status", "intakeType"],
      _count: { id: true },
      where: { submittedAt: { gte: req.startDate, lte: req.endDate } },
    }),
  ]);

  return { participantCounts, dealRoomCounts, intakeCounts };
}

// ─── Agent Activity ───────────────────────────────────────────────────────────
async function agentActivity(req: ReportRequest): Promise<Record<string, unknown>> {
  const [agentRuns, toolInvocations] = await Promise.all([
    prisma.agentRun.groupBy({
      by: ["agentSlug", "status"],
      _count: { id: true },
      where: { startedAt: { gte: req.startDate, lte: req.endDate } },
    }),
    prisma.toolInvocation.groupBy({
      by: ["toolSlug", "status"],
      _count: { id: true },
      where: { startedAt: { gte: req.startDate, lte: req.endDate } },
    }),
  ]);

  const avgLatency = await prisma.modelInvocation.aggregate({
    where: { createdAt: { gte: req.startDate, lte: req.endDate } },
    _avg: { latencyMs: true },
    _sum: { inputTokens: true, outputTokens: true },
  });

  return { agentRuns, toolInvocations, avgLatency };
}

// ─── Payout Register ──────────────────────────────────────────────────────────
async function payoutRegister(req: ReportRequest): Promise<Record<string, unknown>> {
  const payouts = await prisma.payout.findMany({
    where: {
      createdAt: { gte: req.startDate, lte: req.endDate },
      representative: req.repId ? { id: req.repId } : undefined,
    },
    include: {
      representative: { select: { id: true, displayName: true, crdNumber: true } },
      approvedCompEvent: { select: { id: true, description: true, amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totals = payouts.reduce(
    (acc, p) => {
      acc.totalAmount += Number(p.amount);
      acc.count += 1;
      return acc;
    },
    { totalAmount: 0, count: 0 }
  );

  return { payouts, totals };
}

// ─── Intake Funnel ────────────────────────────────────────────────────────────
async function intakeFunnel(req: ReportRequest): Promise<Record<string, unknown>> {
  const submissions = await prisma.intakeSubmission.groupBy({
    by: ["status", "intakeType", "channel"],
    _count: { id: true },
    where: { submittedAt: { gte: req.startDate, lte: req.endDate } },
  });

  return { submissions };
}

// ─── Audit Trail ─────────────────────────────────────────────────────────────
async function auditTrailReport(
  req: ReportRequest,
  pagination: PaginationParams
): Promise<Record<string, unknown>> {
  const events = await prisma.auditEvent.findMany({
    where: {
      createdAt: { gte: req.startDate, lte: req.endDate },
      actorId: req.requestedById,
    },
    orderBy: { createdAt: "desc" },
    take: pagination.limit,
    skip: pagination.cursor ? 1 : 0,
    cursor: pagination.cursor ? { id: pagination.cursor } : undefined,
  });

  return { events, count: events.length };
}

// ─── Main Report Generator ────────────────────────────────────────────────────
export async function generateReport(
  req: ReportRequest,
  pagination?: PaginationParams
): Promise<ReportResult> {
  const pag: PaginationParams = pagination ?? { limit: 500 };

  let data: Record<string, unknown>;
  switch (req.reportType) {
    case "compliance_summary":
      data = await complianceSummary(req);
      break;
    case "pipeline_snapshot":
      data = await pipelineSnapshot(req);
      break;
    case "agent_activity":
      data = await agentActivity(req);
      break;
    case "payout_register":
      data = await payoutRegister(req);
      break;
    case "intake_funnel":
      data = await intakeFunnel(req);
      break;
    case "audit_trail":
      data = await auditTrailReport(req, pag);
      break;
    default:
      data = { message: "report type not yet implemented" };
  }

  const result: ReportResult = {
    reportType: req.reportType,
    generatedAt: new Date(),
    params: { ...req, requestedById: undefined as never },
    data,
  };

  await writeAuditEvent({
    actorId: req.requestedById,
    eventType: "report_generated",
    targetType: "report",
    targetId: req.reportType,
    summary: `Report generated: ${req.reportType}`,
    metadata: { startDate: req.startDate, endDate: req.endDate },
  });

  return result;
}
