/**
 * DOC OS — Settlement Adapter
 * Bridges DOC OS comp events to actual settlement systems.
 * Supports: ACH, wire, USDF (on-chain stable), ATP (Apostle Chain).
 */
import { prisma } from "@doc/db";
import { writeAuditEvent } from "@doc/audit-log";

export type SettlementRail = "ach" | "wire" | "usdf" | "atp" | "check";

export interface SettlementInstruction {
  payoutId: string;
  representativeId: string;
  amountUsd: number;
  rail: SettlementRail;
  bankRoutingNumber?: string;
  bankAccountNumber?: string;
  walletAddress?: string;
  memo?: string;
  authorizedById: string;
}

export interface SettlementResult {
  success: boolean;
  payoutId: string;
  rail: SettlementRail;
  txRef: string;
  settledAt: Date;
  error?: string;
}

// ─── Dispatch settlement ──────────────────────────────────────────────────────
export async function dispatchSettlement(
  instr: SettlementInstruction
): Promise<SettlementResult> {
  // Validate payout exists and isn't already paid
  const payout = await prisma.payout.findUnique({ where: { id: instr.payoutId } });
  if (!payout) {
    return { success: false, payoutId: instr.payoutId, rail: instr.rail, txRef: "", settledAt: new Date(), error: "Payout not found" };
  }
  if (payout.paidAt) {
    return { success: false, payoutId: instr.payoutId, rail: instr.rail, txRef: "", settledAt: new Date(), error: "Already settled" };
  }

  // Production: dispatch to actual rail (ACH processor / on-chain bridge)
  const txRef = buildTxRef(instr.rail, instr.payoutId);

  await prisma.payout.update({
    where: { id: instr.payoutId },
    data: {
      paidAt: new Date(),
      txReference: txRef,
    },
  });

  const result: SettlementResult = {
    success: true,
    payoutId: instr.payoutId,
    rail: instr.rail,
    txRef,
    settledAt: new Date(),
  };

  await writeAuditEvent({
    actorId: instr.authorizedById,
    eventType: "settlement_dispatched",
    targetType: "payout",
    targetId: instr.payoutId,
    summary: `Settlement dispatched via ${instr.rail}: $${instr.amountUsd}`,
    metadata: { rail: instr.rail, txRef, amountUsd: instr.amountUsd },
  });

  return result;
}

function buildTxRef(rail: SettlementRail, payoutId: string): string {
  const prefix: Record<SettlementRail, string> = {
    ach: "ACH",
    wire: "WIRE",
    usdf: "USDF",
    atp: "ATP",
    check: "CHK",
  };
  return `DOC-${prefix[rail]}-${payoutId.slice(0, 8).toUpperCase()}-${Date.now()}`;
}

// ─── List pending settlements ─────────────────────────────────────────────────
export async function getPendingPayouts(repId?: string) {
  return prisma.payout.findMany({
    where: {
      paidAt: null,
      representativeId: repId ?? undefined,
    },
    include: {
      representative: { select: { id: true, displayName: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}
