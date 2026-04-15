# DOC OS — Quick Reference

## System Architecture (One Diagram)

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                       │
│  Public Portal (3000) │ Admin Dashboard (3001)              │
│             Next.js 14 App Router + Tailwind                │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                      API LAYER (Fastify)                     │
│  Port 4000 │ JWT Auth │ 10 Routes │ Rate Limiting           │
│  /health /particles /deals /compliance /intake /workflows   │
│  /agents /communications /compensation /reports             │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
┌───────▼────┐ ┌──▼────────┐ ┌───▼──────────┐
│ Orchestrator│ │  Worker  │ │  PostgreSQL  │
│  BullMQ    │ │ BullMQ   │ │  + Prisma    │
│ Port: — (bg)│ │ Port: — (bg) │  Port: 5432 │
└──────┬─────┘ └───┬──────┘ └──────────────┘
       │           │
┌──────▼─────────────▼──────────────────────┐
│          Redis (Queue Backend)             │
│              Port: 6379                    │
└────────────────────────────────────────────┘
```

---

## Local Startup (Copy-Paste)

```bash
cd C:\Users\Kevan\DOC

# 1. Infrastructure
docker compose up -d

# 2. Database
pnpm install
pnpm db:push
pnpm db:seed

# 3. Servers (all in parallel, or 1 per terminal)
pnpm dev
```

URLs:
- **API**: `http://localhost:4000`
- **Admin**: `http://localhost:3001`
- **Public**: `http://localhost:3000`
- **Prisma Studio**: `http://localhost:5555` (after `pnpm db:studio`)

---

## Test Flow (Complete End-to-End)

### Automated Test (Recommended)

```bash
# After docker compose + pnpm install + pnpm db:push + pnpm db:seed
pnpm validate:local
```

This runs 6 automated tests:
1. ✓ API health check
2. ✓ Intake submission acceptance
3. ✓ Intake appears in queue
4. ✓ Database connectivity
5. ✓ Audit log accessible
6. ✓ Workflow processed

Expected output:
```
✅ All tests passed!

Next steps:
1. Open http://localhost:3001 (admin dashboard)
2. Navigate to /intake page
3. Verify your test submission appears
4. Open Prisma Studio: pnpm db:studio
5. Check AuditEvent table for classification logs
```

### Manual Walkthrough (If Preferred)

#### 1️⃣ Intake Submission
```
Browser → http://localhost:3000/onboard
→ Fill form (type: Investor)
→ Submit
→ See success message
```

#### 2️⃣ Check Admin
```
Browser → http://localhost:3001/intake
→ See new submission appear
→ Status: "classified"
```

#### 3️⃣ Create Participant
```
Admin → /participants
→ "+ Create Participant"
→ Use same email from step 1
→ Submit
```

#### 4️⃣ Run Compliance Gate
```
Admin → /compliance
→ Find participant
→ "Run Gate" button
→ Wait for result
```

#### 5️⃣ Check Audit Log
```
Prisma Studio → http://localhost:5555
→ AuditEvent table
→ Filter by resource: "Participant"
→ See all actions logged with timestamps
```

---

## Core Packages (What Each Does)

| Package | Purpose | Key Export |
|---|---|---|
| `@doc/db` | Prisma schema + client | `prisma` singleton |
| `@doc/domain` | Types, colors, constants | `COLOR`, `RETENTION_YEARS` |
| `@doc/audit-log` | 7-year-retained audit events | `writeAuditEvent()` |
| `@doc/compliance-engine` | 6-check compliance gate | `evaluateComplianceGate()` |
| `@doc/identity-graph` | Rep→participant relationships BFS | `buildRepGraph()` |
| `@doc/communications` | Message capture + eDiscovery | `recordMessage()` |
| `@doc/intake-engine` | Intake classification + routing | `classifyIntake()` |
| `@doc/orchestrator-core` | BullMQ queue + workflow triggers | `triggerWorkflow()` |
| `@doc/mcp-runtime` | Agent + tool execution | `runAgent()` |
| `@doc/claude-adapter` | Anthropic SDK wrapper | `claudeComplete()` |
| `@doc/model-router` | Multi-provider LLM routing | `routeCompletion()` |
| `@doc/reporting` | 8 report types (compliance, pipeline, etc.) | `generateReport()` |
| `@doc/ui` | Design tokens + utilities | `cn()`, `tokens`, nav config |

---

## API Endpoints (Quick Reference)

### Public (No Auth)
```
POST /health
→ { status: "ok", service: "doc-api" }

POST /intake
→ Creates IntakeSubmission
→ Triggers async classification workflow
```

### Authenticated (JWT Required)

**Participants**
```
GET /participants
POST /participants
GET /participants/:id
POST /participants/:id/compliance-gate
```

**Deals**
```
GET /deals
POST /deals
PATCH /deals/:id/status
POST /deals/:id/participants
```

**Compliance**
```
GET /compliance/exceptions
POST /compliance/exceptions
GET /compliance/kyc
PATCH /compliance/kyc/:id
```

**Workflows**
```
GET /workflows
POST /workflows/trigger
POST /workflows/:id/cancel
```

**Agents**
```
GET /agents (list definitions)
POST /agents/:slug/run (execute)
GET /agents/:slug/runs (history)
```

**Communications**
```
GET /communications/channels
POST /communications/channels
POST /communications/messages
POST /communications/messages/:id/ediscovery
```

**Compensation**
```
GET /compensation/plans
POST /compensation/events
POST /compensation/events/:id/approve
POST /compensation/payouts/settle
```

**Reporting**
```
POST /reports/generate
→ { reportId, type, generatedAt, data }
```

---

## Workflows (What Triggers What)

| Trigger | Workflow | Handlers |
|---|---|---|
| `POST /intake` | `intake_classify` | AI classifies intent, routes to rep |
| New participant | `kyc_verification` | AI reviews KYC docs |
| Participant onboard | `compliance_gate` | 6 parallel checks (KYC, accreditation, etc.) |
| Deal status change | `deal_notification` | Sends messages to participants |
| Comp event submit | `comp_event_review` | AI scores, supervisor approves |

---

## Database Models (Key Tables)

### Participants & Relationships
- `User` — reps, supervisors, admin
- `Participant` — investors, issuers, brokers
- `Relationship` — who connected whom, pipeline stage
- `Namespace` — rep's dealer territory

### Compliance
- `KycCase` — documents, verification status
- `ComplianceGate` — gate run results (CLEARED/BLOCKED/CONDITIONAL)
- `ExceptionFlag` — compliance issues needing resolution
- `SupervisoryReview` — manager sign-off on exceptions

### Workflow & Operations
- `IntakeSubmission` — inbound inquiries
- `WorkflowRun` — orchestration tracking
- `AgentRun` — AI execution logs
- `Message` — all captured communications (7-year retention)
- `CompEvent` — proposed comp (must be approved before payout)
- `ApprovedPayout` — ready for dispatch

### Audit Trail
- `AuditEvent` — immutable, never deleted, 7-year retention
- `ModelInvocation` — every LLM call (provider, tokens, latency)
- `ToolInvocation` — every tool execution (name, input, output)

---

## Troubleshooting (Most Common Issues)

### "Cannot connect to database"
```bash
docker compose logs postgres
docker compose restart postgres
pnpm db:push
```

### "Port 4000 already in use"
```powershell
# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process -Force
```

### "Module @doc/xxx not found"
```bash
pnpm install
pnpm db:push  # Ensure Prisma client is generated
```

### "Orchestrator not processing jobs"
```bash
# Check Redis connection
docker compose logs redis
# Check orchestrator logs in terminal

# Manually test queue
redis-cli LLEN "bull:doc:workflows:jobs"
```

### "AI features disabled"
Add to `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
```
Restart API + orchestrator.

---

## Where to Find Things

| Need | Location |
|---|---|
| Business logic | `packages/*/src/index.ts` |
| API routes | `apps/api/src/routes/*.ts` |
| Admin UI | `apps/admin-web/src/app/**/*.tsx` |
| Public UI | `apps/public-web/src/app/**/*.tsx` |
| Database schema | `packages/db/prisma/schema.prisma` |
| Seed data | `packages/db/src/seed.ts` |
| Workflows | `apps/orchestrator/src/index.ts` |
| Job processing | `apps/worker/src/index.ts` |
| Documentation | `docs/*.md` |

---

## Next Steps (After Local Validation)

### You can now:
✅ Onboard investors + issuers  
✅ Capture all communications  
✅ Track relationship graph  
✅ Run compliance gates  
✅ Execute AI agents  
✅ Generate compliance reports  
✅ Log everything auditably  

### To go production:
1. **Deploy to Vercel** (admin-web + public-web)
2. **Deploy to Railway** (api + orchestrator + worker)
3. **Managed DB** (Railway Postgres or AWS RDS)
4. **Managed Redis** (Upstash or AWS ElastiCache)
5. **Wire real KYC** (Sumsub / Persona)
6. **Wire email** (SendGrid or Postmark)

---

## Support Commands

```bash
# Check all services
docker compose ps

# View logs (all)
docker compose logs -f

# View specific service
docker compose logs postgres -f
docker compose logs redis -f

# Kill + restart all
docker compose down
docker compose up -d

# Reset database
docker volume rm doc_postgres_data
docker compose up -d
pnpm db:push && pnpm db:seed

# Check TS compilation
pnpm type-check

# Lint
pnpm lint

# Build for production
pnpm build
```

---

## Git Commits

```bash
# View history
git log --oneline

# Current branch status
git status

# Push to GitHub
git push origin main

# All changes
git diff
```

---

**You're live. System ready. Ready to activate.** 🚀
