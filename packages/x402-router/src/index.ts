import { randomUUID } from "node:crypto";
import { writeAuditEvent } from "@doc/audit-log";

export type X402PolicyState = "controlled" | "open";

export interface X402WalletBinding {
  walletId: string;
  x402Endpoint: "enabled" | "disabled";
  x402Policy: X402PolicyState;
}

export interface X402PaymentRequestInput {
  actorId?: string;
  fromWalletId: string;
  toWalletId: string;
  amountUsd: number;
  memo?: string;
  complianceClear: boolean;
  approvalGranted: boolean;
}

export interface X402PaymentRequest {
  requestId: string;
  rail: "x402";
  status: "pending_approval" | "ready_to_settle";
  fromWalletId: string;
  toWalletId: string;
  amountUsd: number;
  memo?: string;
  createdAt: string;
}

export interface X402SettlementInput {
  requestId: string;
  actorId?: string;
  complianceClear: boolean;
  approvalGranted: boolean;
}

export interface X402SettlementResult {
  settlementId: string;
  requestId: string;
  rail: "x402";
  status: "settled";
  facilitatorRef: string;
  settledAt: string;
}

export interface X402StatusResult {
  id: string;
  rail: "x402";
  status: "pending" | "settled" | "unknown";
  source: "local" | "facilitator";
}

const requestCache = new Map<string, X402PaymentRequest>();
const settlementCache = new Map<string, X402SettlementResult>();

function ensurePositiveAmount(amountUsd: number): void {
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    throw new Error("amountUsd must be a positive number");
  }
}

function ensureControlledExecution(input: { approvalGranted: boolean; complianceClear: boolean }): void {
  if (!input.approvalGranted) {
    throw new Error("approval_required");
  }
  if (!input.complianceClear) {
    throw new Error("compliance_blocked");
  }
}

export async function bindWalletToX402(walletId: string): Promise<X402WalletBinding> {
  return {
    walletId,
    x402Endpoint: "enabled",
    x402Policy: "controlled",
  };
}

export async function createX402PaymentRequest(input: X402PaymentRequestInput): Promise<X402PaymentRequest> {
  ensurePositiveAmount(input.amountUsd);

  const request: X402PaymentRequest = {
    requestId: randomUUID(),
    rail: "x402",
    status: input.approvalGranted && input.complianceClear ? "ready_to_settle" : "pending_approval",
    fromWalletId: input.fromWalletId,
    toWalletId: input.toWalletId,
    amountUsd: input.amountUsd,
    ...(input.memo ? { memo: input.memo } : {}),
    createdAt: new Date().toISOString(),
  };

  requestCache.set(request.requestId, request);

  await writeAuditEvent({
    eventType: "workflow_started",
    ...(input.actorId ? { actorId: input.actorId } : {}),
    targetType: "x402_request",
    targetId: request.requestId,
    summary: `x402 payment request created (${request.status})`,
    metadata: {
      rail: "x402",
      fromWalletId: request.fromWalletId,
      toWalletId: request.toWalletId,
      amountUsd: request.amountUsd,
      requiresApproval: !input.approvalGranted,
      complianceClear: input.complianceClear,
    },
  });

  return request;
}

async function settleViaFacilitator(request: X402PaymentRequest): Promise<{ facilitatorRef: string }> {
  const baseUrl = process.env["X402_FACILITATOR_URL"];
  if (!baseUrl) {
    return { facilitatorRef: `local-${request.requestId.slice(0, 8)}` };
  }

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/settle`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      requestId: request.requestId,
      fromWalletId: request.fromWalletId,
      toWalletId: request.toWalletId,
      amountUsd: request.amountUsd,
      memo: request.memo,
      rail: "x402",
    }),
  });

  if (!res.ok) {
    throw new Error(`facilitator_error_${res.status}`);
  }

  const payload = (await res.json()) as { facilitatorRef?: string };
  return { facilitatorRef: payload.facilitatorRef ?? `x402-${request.requestId.slice(0, 8)}` };
}

export async function settleX402Payment(input: X402SettlementInput): Promise<X402SettlementResult> {
  ensureControlledExecution(input);

  const request = requestCache.get(input.requestId);
  if (!request) {
    throw new Error("x402_request_not_found");
  }

  const upstream = await settleViaFacilitator(request);

  const settled: X402SettlementResult = {
    settlementId: randomUUID(),
    requestId: request.requestId,
    rail: "x402",
    status: "settled",
    facilitatorRef: upstream.facilitatorRef,
    settledAt: new Date().toISOString(),
  };

  settlementCache.set(settled.settlementId, settled);

  await writeAuditEvent({
    eventType: "workflow_completed",
    ...(input.actorId ? { actorId: input.actorId } : {}),
    targetType: "x402_settlement",
    targetId: settled.settlementId,
    summary: "x402 settlement completed",
    metadata: {
      requestId: settled.requestId,
      facilitatorRef: settled.facilitatorRef,
      rail: "x402",
    },
  });

  return settled;
}

export async function getX402Status(id: string): Promise<X402StatusResult> {
  const settled = settlementCache.get(id);
  if (settled) {
    return {
      id,
      rail: "x402",
      status: "settled",
      source: "local",
    };
  }

  const req = requestCache.get(id);
  if (req) {
    return {
      id,
      rail: "x402",
      status: "pending",
      source: "local",
    };
  }

  return {
    id,
    rail: "x402",
    status: "unknown",
    source: process.env["X402_FACILITATOR_URL"] ? "facilitator" : "local",
  };
}
