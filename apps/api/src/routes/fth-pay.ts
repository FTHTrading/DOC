/**
 * FTH Pay — execution rail routes
 *
 * All x402 access is gated through this module only.
 * Nothing in the system calls x402 directly — only FTH Pay.
 *
 * Routes:
 *   POST /fth/pay/execute  — create + settle payment via x402
 *   POST /fth/pay/preview  — simulation (no settlement)
 *   GET  /fth/pay/status/:id — track settlement by requestId or settlementId
 */
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  bindWalletToX402,
  createX402PaymentRequest,
  settleX402Payment,
  getX402Status,
} from "@doc/x402-router";

// ─── Schemas ────────────────────────────────────────────────────────────────

const executeBody = z.object({
  fromWalletId: z.string().uuid("fromWalletId must be a UUID"),
  toWalletId: z.string().uuid("toWalletId must be a UUID"),
  amountUsd: z.number().positive("amountUsd must be positive"),
  memo: z.string().max(256).optional(),
  approvalGranted: z.boolean(),
  complianceClear: z.boolean(),
});

const previewBody = z.object({
  fromWalletId: z.string().uuid("fromWalletId must be a UUID"),
  toWalletId: z.string().uuid("toWalletId must be a UUID"),
  amountUsd: z.number().positive("amountUsd must be positive"),
  memo: z.string().max(256).optional(),
});

// ─── Route plugin ────────────────────────────────────────────────────────────

export async function fthPayRoutes(app: FastifyInstance) {
  /**
   * POST /fth/pay/execute
   *
   * Execute a payment via FTH Pay → x402.
   * Requires both approvalGranted and complianceClear to settle.
   * If either is false, returns 202 with status=pending_approval.
   */
  app.post<{ Body: z.infer<typeof executeBody> }>("/execute", async (req, reply) => {
    const parsed = executeBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ ok: false, error: parsed.error.flatten() });
    }

    const actor = (req.user as { sub?: string } | undefined)?.sub;
    const { fromWalletId, toWalletId, amountUsd, memo, approvalGranted, complianceClear } = parsed.data;

    // Bind both wallets to x402 in controlled mode
    await bindWalletToX402(fromWalletId);
    await bindWalletToX402(toWalletId);

    // Create the x402 payment request
    let payReq: Awaited<ReturnType<typeof createX402PaymentRequest>>;
    try {
      payReq = await createX402PaymentRequest({
        ...(actor ? { actorId: actor } : {}),
        fromWalletId,
        toWalletId,
        amountUsd,
        ...(memo ? { memo } : {}),
        approvalGranted,
        complianceClear,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "payment_request_failed";
      const code = msg === "approval_required" || msg === "compliance_blocked" ? 403 : 400;
      return reply.status(code).send({ ok: false, error: msg });
    }

    // Return early if not yet approved
    if (payReq.status === "pending_approval") {
      return reply.status(202).send({
        ok: true,
        data: {
          ...payReq,
          executionRail: "FTH_PAY_x402",
          message: "Payment request queued — awaiting approval before settlement",
        },
      });
    }

    // Settle via x402
    try {
      const settled = await settleX402Payment({
        requestId: payReq.requestId,
        ...(actor ? { actorId: actor } : {}),
        approvalGranted,
        complianceClear,
      });
      return reply.status(200).send({
        ok: true,
        data: { ...settled, executionRail: "FTH_PAY_x402" },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "settlement_failed";
      return reply.status(500).send({ ok: false, error: msg });
    }
  });

  /**
   * POST /fth/pay/preview
   *
   * Simulate a payment — no x402 call, no ledger changes.
   * Returns estimated fee, required checks, and execution path.
   */
  app.post<{ Body: z.infer<typeof previewBody> }>("/preview", async (req, reply) => {
    const parsed = previewBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ ok: false, error: parsed.error.flatten() });
    }

    const { fromWalletId, toWalletId, amountUsd, memo } = parsed.data;

    return reply.send({
      ok: true,
      data: {
        simulation: true,
        rail: "x402",
        fromWalletId,
        toWalletId,
        amountUsd,
        ...(memo ? { memo } : {}),
        estimatedFeeUsd: parseFloat((amountUsd * 0.0025).toFixed(4)),
        requiresApproval: true,
        complianceCheckRequired: true,
        executionPath: ["AI_COMMAND", "POLICY_GATE", "FTH_PAY", "x402", "SETTLEMENT"],
        previewedAt: new Date().toISOString(),
      },
    });
  });

  /**
   * GET /fth/pay/status/:id
   *
   * Look up settlement status by requestId or settlementId.
   */
  app.get<{ Params: { id: string } }>("/status/:id", async (req, reply) => {
    const { id } = req.params;
    if (!id || id.length < 8) {
      return reply.status(400).send({ ok: false, error: "invalid_id" });
    }
    const result = await getX402Status(id);
    return reply.send({ ok: true, data: result });
  });
}
