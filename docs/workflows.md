# DOC OS — Workflow Model

## Overview

All asynchronous multi-step processes in DOC OS are represented as **WorkflowRuns** persisted in PostgreSQL and processed by the `apps/orchestrator` service via BullMQ. Each run has a status lifecycle and produces audit events at each transition.

---

## Workflow Status Lifecycle

```
pending → running → completed
                 └→ failed
                 └→ cancelled
```

A WorkflowRun transitions through these states exactly once. Failed runs can be retriggered via `POST /workflows/trigger` with the same trigger payload.

---

## Workflow Types

### `intake_classify`
**Trigger:** `POST /intake` webhook receives new submission.  
**Steps:**
1. `IntakeSubmission` created with status `pending`
2. WorkflowRun enqueued
3. Orchestrator calls `classifyIntake(submissionId)` → MCP `intake-agent` runs
4. Agent sets `classification` and `confidence` on submission
5. `routeIntake(submissionId)` assigns to rep or queue
6. WorkflowRun set to `completed`

**Failure mode:** Agent timeout → WorkflowRun `failed`, submission stays `pending` for manual review.

---

### `compliance_gate`
**Trigger:** Participant onboarding, deal room entry, or periodic re-review.  
**Steps:**
1. WorkflowRun enqueued with `participantId` + `context`
2. Orchestrator calls `evaluateComplianceGate()` — 6 parallel checks:
   - KYC status verification
   - KYB (entity) verification
   - Accreditation status
   - Suitability assessment
   - Sanctions screening (OFAC)
   - Disclosure acknowledgments
3. Gate result written to `ComplianceGate` record
4. If any check fails → `ExceptionFlag` raised
5. AuditEvent written
6. WorkflowRun `completed`

---

### `deal_notification`
**Trigger:** DealRoom status change (open, closing, closed).  
**Steps:**
1. WorkflowRun enqueued with `dealRoomId` + `eventType`
2. Orchestrator calls `comms-agent`
3. Agent fetches DealRoom → participants → sends channel messages via `recordMessage()`
4. AuditEvent written per notification
5. WorkflowRun `completed`

---

### `comp_event_review`
**Trigger:** Rep submits `POST /compensation/events` (proposed).  
**Steps:**
1. `CompEvent` created with status `proposed`
2. WorkflowRun enqueued
3. Orchestrator calls `comp-agent`
4. Agent evaluates comp plan rules → generates recommendation
5. Recommendation stored on CompEvent
6. Supervisor review required before status → `approved`
7. On approval → `ApprovedPayout` created
8. Settlement dispatched via `settlement-adapter`

---

### `kyc_verification`
**Trigger:** New participant created, or KYC case opened.  
**Steps:**
1. WorkflowRun enqueued with `participantId`
2. Orchestrator calls `identity-agent`
3. Agent performs identity documentation review
4. `KycCase` updated with result
5. Compliance gate re-evaluated if KYC passes
6. WorkflowRun `completed`

---

## Full Onboarding Lifecycle

```
Prospect submits form (public-web /onboard)
  │
  ▼
POST /intake → IntakeSubmission created
  │
  ▼
intake_classify workflow → AI classifies intent
  │  (investor / issuer / partner / referral)
  ▼
Rep assignment + intro channel created
  │
  ▼
kyc_verification workflow → identity-agent reviews docs
  │
  ▼
compliance_gate workflow → 6-check evaluation
  │   ├─ CLEARED → Participant status = active
  │   └─ BLOCKED → ExceptionFlag raised, supervisor review required
  ▼
DealRooms available for cleared participants
  │
  ▼
deal_notification workflow on status changes
  │
  ▼
comp_event_review workflow on deal close
  │
  ▼
ApprovedPayout → settlement-adapter dispatches via ACH/Wire/USDF/ATP
```

---

## BullMQ Queue Configuration

| Queue | Workers | Concurrency | Use |
|---|---|---|---|
| `doc:workflows` | orchestrator | 5 | Workflow lifecycle |
| `doc:compliance` | orchestrator | 3 | Async compliance re-evaluations |
| `doc:notifications` | orchestrator | 10 | Notification delivery |
| `doc:agents` | worker | 8 | Agent runs, tool calls, reports |
