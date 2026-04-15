/**
 * DOC OS — Compliance Engine
 * Evaluates compliance gates for participants across KYC, KYB, accreditation,
 * suitability, sanctions, and disclosure completeness.
 */
import { prisma } from "@doc/db";
import { writeAuditEvent } from "@doc/audit-log";
import type {
  ComplianceGateInput,
  ComplianceGateOutput,
} from "@doc/domain";
import {
  RETENTION_YEARS,
  SUITABILITY_EXPIRY_MONTHS,
  ACCREDITATION_EXPIRY_MONTHS,
  SANCTIONS_CHECK_DAYS,
} from "@doc/domain";

/**
 * Evaluate a participant's compliance gate.
 * Returns a structured gate result with blocking/conditional reasons.
 * Each evaluation is persisted as a ComplianceGate record for audit.
 *
 * POLICY: No payout, subscription, or deal room access may proceed unless
 * the gate returns "cleared". "conditional" requires supervisor sign-off.
 */
export async function evaluateComplianceGate(
  input: ComplianceGateInput
): Promise<ComplianceGateOutput> {
  const { participantId } = input;

  const [participant, kycCase, kybCase, accreditation, suitability, recentSanctions, disclosures, formCrs] =
    await Promise.all([
      prisma.participant.findUnique({ where: { id: participantId } }),
      prisma.kycCase.findUnique({ where: { participantId } }),
      prisma.kybCase.findUnique({ where: { participantId } }),
      prisma.accreditationRecord.findUnique({ where: { participantId } }),
      prisma.suitabilityProfile.findUnique({ where: { participantId } }),
      prisma.sanctionsCheck.findFirst({
        where: { participantId },
        orderBy: { screenedAt: "desc" },
      }),
      prisma.disclosureAcknowledgment.findMany({ where: { participantId } }),
      prisma.formCRSDelivery.findFirst({ where: { participantId }, orderBy: { deliveredAt: "desc" } }),
    ]);

  if (!participant) throw new Error(`Participant not found: ${participantId}`);

  const now = new Date();
  const blockingReasons: string[] = [];
  const conditionalReasons: string[] = [];

  // ── KYC check ───────────────────────────────────────────────────────────────
  const kycStatus = kycCase?.status ?? "not_started";
  if (kycStatus !== "approved") {
    if (kycStatus === "rejected") {
      blockingReasons.push("KYC: rejected");
    } else if (kycStatus === "not_started" || kycStatus === "pending_docs") {
      blockingReasons.push("KYC: not completed");
    } else if (kycStatus === "escalated") {
      blockingReasons.push("KYC: escalated — requires compliance review");
    } else {
      conditionalReasons.push(`KYC: ${kycStatus}`);
    }
  }
  if (kycCase?.expiresAt && kycCase.expiresAt < now) {
    blockingReasons.push("KYC: expired");
  }

  // ── KYB check (entities only) ────────────────────────────────────────────────
  const kybStatus = kybCase?.status ?? "not_started";
  if (participant.isEntityKyb) {
    if (kybStatus !== "approved") {
      if (kybStatus === "rejected") {
        blockingReasons.push("KYB: rejected");
      } else if (kybStatus === "not_started") {
        blockingReasons.push("KYB: not started for entity participant");
      } else {
        conditionalReasons.push(`KYB: ${kybStatus}`);
      }
    }
  }

  // ── Accreditation check ──────────────────────────────────────────────────────
  let accreditationStatus = accreditation?.status ?? "not_verified";
  if (accreditation?.expiresAt && accreditation.expiresAt < now) {
    accreditationStatus = "expired";
  }
  if (accreditationStatus !== "verified") {
    if (accreditationStatus === "expired") {
      blockingReasons.push("Accreditation: expired — must re-verify");
    } else if (accreditationStatus === "not_verified") {
      blockingReasons.push("Accreditation: not verified");
    } else {
      conditionalReasons.push(`Accreditation: ${accreditationStatus}`);
    }
  }

  // ── Suitability check ────────────────────────────────────────────────────────
  const suitabilityStatus = suitability?.status ?? "not_assessed";
  const suitabilityExpiry = suitability?.expiresAt;
  if (suitabilityStatus !== "complete" || (suitabilityExpiry && suitabilityExpiry < now)) {
    conditionalReasons.push("Suitability: assessment incomplete or expired");
  }

  // ── Sanctions check ──────────────────────────────────────────────────────────
  const sanctionsDaysAgo = recentSanctions
    ? Math.floor((now.getTime() - recentSanctions.screenedAt.getTime()) / 86400000)
    : Infinity;
  let sanctionsClear = false;
  if (!recentSanctions || sanctionsDaysAgo > SANCTIONS_CHECK_DAYS) {
    blockingReasons.push(`Sanctions: screening required (last screen: ${recentSanctions ? `${sanctionsDaysAgo}d ago` : "never"})`);
  } else if (recentSanctions.result !== "clear") {
    blockingReasons.push(`Sanctions: ${recentSanctions.result} — cannot proceed`);
  } else {
    sanctionsClear = true;
  }

  // ── Disclosure check ─────────────────────────────────────────────────────────
  const hasRegBi = disclosures.some((d) => d.disclosureType === "reg_bi");
  const hasFormCrs = formCrs !== null;
  let disclosuresComplete = true;

  if (!hasRegBi) {
    conditionalReasons.push("Disclosure: Reg BI acknowledgment missing");
    disclosuresComplete = false;
  }
  if (!hasFormCrs) {
    conditionalReasons.push("Disclosure: Form CRS delivery missing");
    disclosuresComplete = false;
  }

  // ── Determine gate result ───────────────────────────────────────────────────
  let result: "blocked" | "conditional" | "cleared";
  if (blockingReasons.length > 0) {
    result = "blocked";
  } else if (conditionalReasons.length > 0) {
    result = "conditional";
  } else {
    result = "cleared";
  }

  // ── Persist gate result ──────────────────────────────────────────────────────
  prisma.complianceGate
    .create({
      data: {
        participantId,
        result,
        kycStatus: kycCase?.status ?? "not_started",
        kybStatus: kybCase?.status,
        accreditationStatus: accreditation?.status ?? "not_verified",
        suitabilityStatus: suitability?.status ?? "not_assessed",
        sanctionsClear,
        disclosuresComplete,
        blockingReasons,
        conditionalReasons,
      },
    })
    .catch((e) => console.error("[compliance-engine] Failed to persist gate:", e));

  await writeAuditEvent({
    eventType: "compliance_gate_evaluated",
    targetType: "participant",
    targetId: participantId,
    summary: `Compliance gate: ${result} — ${blockingReasons.length} blocking, ${conditionalReasons.length} conditional`,
    metadata: { result, blockingReasons, conditionalReasons },
  });

  return {
    participantId,
    result,
    blockingReasons,
    conditionalReasons,
    checkedAt: now,
  };
}

/**
 * Quick check: is participant cleared for product access?
 * Uses latest stored gate result if fresh (< 1 hour), otherwise re-evaluates.
 */
export async function isParticipantCleared(participantId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 3600000);
  const latestGate = await prisma.complianceGate.findFirst({
    where: { participantId, evaluatedAt: { gte: oneHourAgo } },
    orderBy: { evaluatedAt: "desc" },
  });

  if (latestGate) return latestGate.result === "cleared";

  const result = await evaluateComplianceGate({ participantId });
  return result.result === "cleared";
}

/** Raise an exception flag for a compliance violation. */
export async function raiseException(input: {
  participantId?: string;
  targetType: string;
  targetId: string;
  severity: "low" | "medium" | "high" | "critical";
  flagType: string;
  description: string;
  raisedById?: string;
}): Promise<{ id: string }> {
  const flag = await prisma.exceptionFlag.create({
    data: input,
  });

  await writeAuditEvent({
    eventType: "compliance_exception_raised",
    targetType: input.targetType,
    targetId: input.targetId,
    summary: `Exception raised [${input.severity}]: ${input.description}`,
    metadata: { flagType: input.flagType, severity: input.severity },
  });

  return { id: flag.id };
}

export { RETENTION_YEARS, SUITABILITY_EXPIRY_MONTHS, ACCREDITATION_EXPIRY_MONTHS };
