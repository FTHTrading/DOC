/**
 * DOC OS — Treasury Adapter
 * Interface to Centrifuge-style RWA pool treasury + cash management.
 * Keeps DOC OS clean of chain-specific logic.
 */
import { prisma } from "@doc/db";
import { writeAuditEvent } from "@doc/audit-log";

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface TreasuryBalance {
  assetType: string;
  amount: number;
  currency: "USD" | "BTC" | "ATP";
  lastRefreshed: Date;
}

export interface PoolInfo {
  poolId: string;
  poolName: string;
  totalValue: number;
  availableLiquidity: number;
  nav: number;
  currency: string;
}

// ─── Read pool NAV ────────────────────────────────────────────────────────────
export async function getPoolNav(poolId: string): Promise<PoolInfo> {
  // Production: call Centrifuge/RWA pool API here
  // Dev: return mock data
  return {
    poolId,
    poolName: `DOC Treasury Pool ${poolId}`,
    totalValue: 0,
    availableLiquidity: 0,
    nav: 0,
    currency: "USD",
  };
}

// ─── Record treasury event ────────────────────────────────────────────────────
export async function recordTreasuryEvent(
  eventType: "deposit" | "withdraw" | "rebalance" | "nav_update",
  data: {
    poolId?: string;
    amount?: number;
    currency?: string;
    metadata?: Record<string, unknown>;
    authorizedById: string;
  }
): Promise<void> {
  await writeAuditEvent({
    actorId: data.authorizedById,
    eventType: "treasury_event",
    targetType: "treasury_pool",
    targetId: data.poolId ?? "global",
    summary: `Treasury event: ${eventType}`,
    metadata: {
      eventType,
      amount: data.amount,
      currency: data.currency,
      ...data.metadata,
    },
  });
}

// ─── Get aggregate balances ───────────────────────────────────────────────────
export async function getTreasuryBalances(_orgId: string): Promise<TreasuryBalance[]> {
  // Future: fetch real chain/pool balances
  return [
    { assetType: "cash", amount: 0, currency: "USD", lastRefreshed: new Date() },
    { assetType: "btc", amount: 0, currency: "BTC", lastRefreshed: new Date() },
    { assetType: "atp", amount: 0, currency: "ATP", lastRefreshed: new Date() },
  ];
}

// ─── Payout processing ────────────────────────────────────────────────────────
export async function processPayout(
  payoutId: string,
  authorizedById: string
): Promise<{ success: boolean; txRef?: string; error?: string }> {
  const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
  if (!payout) return { success: false, error: "Payout not found" };

  // Production: initiate ACH/wire/on-chain transfer here
  const txRef = `DOC-PAY-${Date.now()}`;

  await prisma.payout.update({
    where: { id: payoutId },
    data: { paidAt: new Date(), txReference: txRef },
  });

  await writeAuditEvent({
    actorId: authorizedById,
    eventType: "payout_processed",
    targetType: "payout",
    targetId: payoutId,
    summary: `Payout processed: $${payout.amount}`,
    metadata: { txRef, amount: payout.amount.toString() },
  });

  return { success: true, txRef };
}
