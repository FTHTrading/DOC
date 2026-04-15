# DOC OS — Compliance Model

## Regulatory Basis

DOC OS is designed to support operations of a FINRA-registered broker-dealer and SEC-registered investment adviser. Key applicable rules:

| Rule | Coverage |
|---|---|
| FINRA Rule 4511 | Books and records — 6-year retention minimum (DOC uses 7) |
| FINRA Rule 3110 | Supervisory procedures — approval workflows |
| SEC Rule 17a-4 | Electronic records preservation |
| FINRA Rule 2111 | Suitability — quantitative and qualitative |
| Reg BI (17 CFR 240.15l-1) | Best interest obligation for retail customers |
| Form CRS | Relationship summary disclosure delivery |

---

## ComplianceGate Evaluation

The `evaluateComplianceGate()` function in `packages/compliance-engine` runs **6 parallel checks**. All must pass for a `CLEARED` result. Any failure produces a `BLOCKED` or `CONDITIONAL` result.

### Check 1: KYC Status

```
PASS  → KycCase exists AND status = APPROVED
FAIL  → No case / status = PENDING / FAILED / REJECTED
```

### Check 2: KYB (Entity Verification)

```
Applies to: Participant type = ISSUER, BROKER_DEALER, INSTITUTION
PASS  → KybCase exists AND status = APPROVED
SKIP  → Individual investors (type = INVESTOR, PARTNER, REFERRAL)
```

### Check 3: Accreditation Status

```
PASS  → AccreditationRecord exists AND status = VERIFIED AND NOT expired
FAIL  → No record / status = PENDING / EXPIRED
Note: Required for Reg D offerings only — context.offeringType determines if check is active
```

### Check 4: Suitability Assessment

```
PASS  → SuitabilityProfile exists AND lastAssessedAt < 12 months ago
FAIL  → No profile / stale / risk mismatch with product
```

### Check 5: Sanctions Screening

```
PASS  → No active sanction flags on participant
FAIL  → ExceptionFlag with type = SANCTIONS_MATCH exists and is OPEN
```

### Check 6: Disclosure Acknowledgments

```
PASS  → Form CRS acknowledged AND ADV Part 2 acknowledged (where applicable)
FAIL  → Required disclosures not signed
```

---

## Gate Results

| Result | Meaning | Effect |
|---|---|---|
| `CLEARED` | All 6 checks pass | Participant may proceed |
| `CONDITIONAL` | Minor issues (e.g., stale suitability) | Limited access, supervisor notified |
| `BLOCKED` | Critical failure (KYC, sanctions) | Access denied, ExceptionFlag raised |

---

## Exception Flags

`ExceptionFlag` records are created automatically on BLOCKED gates and can also be raised manually via `raiseException()`.

Severity levels:
- **LOW** — informational, no immediate action
- **MEDIUM** — supervisor review within 5 business days
- **HIGH** — supervisor review within 24 hours
- **CRITICAL** — immediate action required, escalate to CCO

Statuses: `OPEN → UNDER_REVIEW → RESOLVED | ESCALATED`

---

## Supervisory Reviews

All HIGH and CRITICAL exceptions trigger a `SupervisoryReview` record. Reviews must be completed by a user with `isSupervisor = true`. The `ApprovalRequest` model tracks multi-party approval chains.

---

## KYC Case Lifecycle

```
PENDING (case opened)
  │
  ├── identity-agent reviews docs
  │
  ├── APPROVED → compliance gate re-evaluated
  ├── ACTION_REQUIRED → additional docs requested
  └── FAILED → ExceptionFlag raised, participant BLOCKED
```

---

## Disclosure System

`FormCRSDelivery` and `DisclosureAcknowledgment` records track:
- Delivery timestamp
- Delivery method (email, portal, in-person)
- Acknowledgment timestamp
- Document version

These are immutable once created. 7-year retention enforced via `retainUntil` timestamp.

---

## Retention Policy

FINRA Rule 4511 requires 6-year retention. DOC OS uses **7 years** for additional safety margin.

```
retainUntil = createdAt + 7 years
```

Applied to: AuditEvent, Message, IntakeSubmission, ComplianceGate, FormCRSDelivery, DisclosureAcknowledgment, KycCase, KybCase.

The `RETENTION_YEARS = 7` constant in `packages/domain` must be used for all retention calculations. Never hardcode.
