/**
 * DOC OS — BTC Adapter
 * Watch-only Bitcoin treasury interface.
 * DOC OS holds BTC reserves but does NOT custody private keys here.
 * BTC Address: 17M4J6sXEgGz13hzuYDNLQkrpLRNxGV2YJ (watch-only)
 */
import { writeAuditEvent } from "@doc/audit-log";

const BTC_TREASURY_ADDRESS = "17M4J6sXEgGz13hzuYDNLQkrpLRNxGV2YJ";
const MEMPOOL_API = "https://mempool.space/api";

export interface UtxoSummary {
  address: string;
  confirmedSats: number;
  unconfirmedSats: number;
  confirmedBtc: number;
  unconfirmedBtc: number;
  usdEstimate?: number;
}

// ─── Get BTC balance (watch-only) ─────────────────────────────────────────────
export async function getBtcBalance(address = BTC_TREASURY_ADDRESS): Promise<UtxoSummary> {
  try {
    const res = await fetch(`${MEMPOOL_API}/address/${address}`, {
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) throw new Error(`mempool.space status ${res.status}`);

    const data = (await res.json()) as {
      chain_stats: { funded_txo_sum: number; spent_txo_sum: number };
      mempool_stats: { funded_txo_sum: number; spent_txo_sum: number };
    };

    const confirmedSats =
      data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
    const unconfirmedSats =
      data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum;

    return {
      address,
      confirmedSats,
      unconfirmedSats,
      confirmedBtc: confirmedSats / 100_000_000,
      unconfirmedBtc: unconfirmedSats / 100_000_000,
    };
  } catch (err) {
    console.error("[btc-adapter] Failed to fetch balance:", err);
    return {
      address,
      confirmedSats: 0,
      unconfirmedSats: 0,
      confirmedBtc: 0,
      unconfirmedBtc: 0,
    };
  }
}

// ─── Get current BTC price ────────────────────────────────────────────────────
export async function getBtcUsdPrice(): Promise<number | undefined> {
  try {
    const res = await fetch(`${MEMPOOL_API}/v1/prices`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { USD: number };
    return data.USD;
  } catch {
    return undefined;
  }
}

// ─── Enrich balance with USD estimate ────────────────────────────────────────
export async function getBtcBalanceWithUsd(address = BTC_TREASURY_ADDRESS): Promise<UtxoSummary> {
  const [summary, price] = await Promise.all([
    getBtcBalance(address),
    getBtcUsdPrice(),
  ]);

  return {
    ...summary,
    usdEstimate: price != null ? summary.confirmedBtc * price : undefined,
  };
}

// ─── Audit-log a BTC observation ─────────────────────────────────────────────
export async function auditBtcBalanceCheck(
  actorId: string,
  summary: UtxoSummary
): Promise<void> {
  await writeAuditEvent({
    actorId,
    eventType: "btc_balance_check",
    targetType: "btc_wallet",
    targetId: summary.address,
    summary: `BTC balance checked: ${summary.confirmedBtc} BTC confirmed`,
    metadata: { ...summary },
  });
}

export { BTC_TREASURY_ADDRESS };
