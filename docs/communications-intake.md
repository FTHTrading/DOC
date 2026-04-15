# DOC OS — Communications & Intake

## Communications

### Architecture

All broker-dealer communications must be captured, retained, and made available for eDiscovery per FINRA Rule 4511 and SEC Rule 17a-4.

DOC OS implements this via `packages/communications`:

```
Message
  ├── channelId → CommunicationChannel
  ├── senderId → User (rep or admin)
  ├── participantId → Participant (investor/issuer)
  ├── content (full text, never truncated)
  ├── retainUntil = createdAt + 7 years  (immutable)
  ├── eDiscoveryFlag (boolean)
  └── metadata (platform, thread ID, etc.)
```

### Channels

A `CommunicationChannel` represents a thread of communication between the firm and a participant. Types:

| Type | Use |
|---|---|
| `EMAIL` | Off-platform email capture |
| `PORTAL` | In-platform messaging |
| `PHONE_LOG` | Phone call notes |
| `TEXT` | SMS/text records |
| `MEETING_NOTES` | Advisor meeting summaries |

### Message Retention

- `retainUntil` is set at write time to `now + RETENTION_YEARS` (7 years)
- Records are **never deleted** — they can only be marked `eDiscoveryFlag = true` or archived
- The `RETENTION_YEARS` constant in `packages/domain` is the single source of truth

### eDiscovery

`flagForEDiscovery(messageId, flaggedBy, reason)` marks a message for legal review:
- Sets `eDiscoveryFlag = true`
- Writes AuditEvent: `MESSAGE_FLAGGED_EDISCOVERY`
- Once flagged, messages cannot be unflagged without supervisor authorization

### API Endpoints

```
GET  /communications/channels            List channels (paginated)
POST /communications/channels            Create channel
POST /communications/messages            Record message
GET  /communications/participants/:id    Get all messages for participant
POST /communications/messages/:id/ediscovery   Flag for eDiscovery
```

---

## Intake

### Architecture

Intake is the primary inbound funnel — every prospect, referral, or partnership inquiry enters DOC OS through the intake system.

```
IntakeSubmission
  ├── submitterName, submitterEmail, submitterPhone
  ├── intendedType (INVESTOR | ISSUER | BROKER_DEALER | PARTNER | REFERRAL)
  ├── channel (WEBFORM | EMAIL | API | PHONE | MANUAL)
  ├── content (full text of inquiry)
  ├── status: pending → classified → routed → converted | rejected
  ├── classification (set by intake-agent)
  ├── confidence (0.0–1.0, set by intake-agent)
  └── routedToRepId (set by routeIntake)
```

### Intake Flow

```
1. POST /intake (public, no auth)
   └── acceptIntake() creates IntakeSubmission (status: pending)
   └── triggerWorkflow("intake_classify") fires async

2. classifyIntake() [async, fire-and-forget from acceptIntake]
   └── intake-agent evaluates content
   └── Sets classification + confidence on submission
   └── Status: classified

3. routeIntake()
   └── Finds best-matched rep by participant type
   └── Sets routedToRepId
   └── Creates CommunicationChannel for intro thread
   └── Status: routed

4. Manual or automated conversion
   └── Status: converted (creates Participant record)
   └── Status: rejected (dead end — retained 7 years)
```

### Classification Labels

The `intake-agent` assigns one of:

| Classification | Description |
|---|---|
| `investor_accredited` | High-net-worth individual, Reg D eligible |
| `investor_retail` | Retail customer, Reg BI applies |
| `issuer_reg_d` | Company seeking Reg D raise |
| `issuer_reg_a` | Company seeking Reg A+ offering |
| `broker_dealer` | Another BD seeking correspondent relationship |
| `referral_agent` | Referral source / affiliate |
| `partner` | Strategic partner |
| `spam` | Not a real inquiry |
| `unknown` | Confidence < 0.5, needs manual review |

### Routing Logic

`routeIntake()` selects an assigned rep by:

1. Active rep with fewest open pipeline items matching `intendedType`
2. If no rep available → routes to default intake queue (rep slug: `intake-queue`)

### Webhook Security

The `POST /intake` endpoint accepts an optional `X-Intake-Secret` header for webhook validation. Set `INTAKE_WEBHOOK_SECRET` in `.env` to enable. Requests without the correct secret are rejected with 401 if the env var is set.

Rate limiting: 10 requests/minute on `/intake` to prevent abuse.
