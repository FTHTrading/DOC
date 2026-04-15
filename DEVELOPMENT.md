# DOC OS — Local Development Guide

## Prerequisites

- Node.js 20+ (check: `node -v`)
- pnpm 9.4+ (check: `pnpm -v`)
- Docker + Docker Compose (check: `docker --version`)
- Git

---

## Quick Start

### 1. Install dependencies

```bash
cd C:\Users\Kevan\DOC
pnpm install
```

### 2. Start infrastructure (Postgres + Redis)

```bash
docker compose up -d
```

Verify services are running:

```bash
docker compose ps
```

Expected output:
```
doc-postgres    running (port 5432)
doc-redis       running (port 6379)
```

### 3. Set up database

```bash
pnpm db:push        # Apply Prisma schema
pnpm db:seed        # Insert seed data
```

Verify with:

```bash
pnpm db:studio      # Opens Prisma Studio at localhost:5555
```

You should see:
- `seed_timestamp` in `_prisma_migrations`
- 8 agents in `AgentDefinition`
- 1 supervisor + 1 rep in `User`
- 3 participants in `Participant`

---

## 4. Start dev servers

Open 3 terminals in `C:\Users\Kevan\DOC`:

**Terminal 1: API**
```bash
pnpm dev --filter @doc/api
```
Expected: `[Fastify] listening on 4000`

**Terminal 2: Orchestrator**
```bash
pnpm dev --filter @doc/orchestrator
```
Expected: `[orchestrator] Workers ready. Waiting for jobs…`

**Terminal 3: Worker**
```bash
pnpm dev --filter @doc/worker
```
Expected: `[worker] Agent worker ready. Waiting for jobs…`

**Terminal 4: Public Web**
```bash
pnpm dev --filter @doc/public-web
```
Expected: `ready - started server on 0.0.0.0:3000`

**Terminal 5: Admin Web**
```bash
pnpm dev --filter @doc/admin-web
```
Expected: `ready - started server on 0.0.0.0:3001`

Or run all in parallel:

```bash
pnpm dev
```

---

## 5. Test the System

### ✅ Test 1: API Health Check

```bash
curl http://localhost:4000/health
```

Expected:
```json
{
  "status": "ok",
  "service": "doc-api"
}
```

### ✅ Test 2: Intake Submission (Public)

Open browser: `http://localhost:3000/onboard`

Fill form:
- Name: "Test Investor"
- Email: "test@example.com"
- Type: "Investor"

Click "Submit". You should see success message.

Check admin (`http://localhost:3001`):
- Look at `/intake` page
- Should show your submission

### ✅ Test 3: Orchestrator Processing

After intake submission, check orchestrator terminal:

```
[orchestrator] Processing workflow intake_classify (run=XXXXX)
[orchestrator] Workflow intake_classify completed
```

Check logs in database (Prisma Studio):
- New `IntakeSubmission` should exist with status `classified`
- New `WorkflowRun` should exist with status `completed`
- New `AuditEvent` should log the classification

### ✅ Test 4: Participant Creation

In admin dashboard (`http://localhost:3001/participants`):
- Click "Create Participant"
- Fill form with same email from intake
- Submit

Should create participant with Navy color coding, compliance status visible.

### ✅ Test 5: Compliance Gate

In admin dashboard → `/compliance`:
- Open participant detail
- Button to "Run Compliance Gate"

Should trigger workflow. Check orchestrator logs:

```
[orchestrator] Compliance gate evaluated → [checks results]
```

### ✅ Test 6: Message Flow

In admin → `/communications`:
- Create channel
- Send test message

Check:
- Message persists in DB
- Timestamp and retention date set correctly
- Audit log written

---

## Troubleshooting

### Port already in use

```bash
# Find and kill process on port 4000
lsof -i :4000
kill -9 <PID>
```

On Windows PowerShell:

```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process
```

### Database connection error

```bash
# Check Postgres is running
docker compose logs postgres

# Restart
docker compose restart postgres
```

### "Cannot find module @doc/xxx"

```bash
# Reinstall
pnpm install
# Then try again
pnpm dev
```

### AI features disabled (no ANTHROPIC_API_KEY)

System will still work. Agents will return stub responses. To enable:

1. Get API key from https://console.anthropic.com
2. Add to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxx
   ```
3. Restart API + orchestrator

---

## Database Reset

To start fresh:

```bash
# Stop services
docker compose down

# Delete volume
docker volume rm doc_postgres_data

# Restart
docker compose up -d

# Re-seed
pnpm db:push
pnpm db:seed
```

---

## Key Endpoints

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/health` | GET | No | Service status |
| `/participants` | GET/POST | JWT | Manage participants |
| `/deals` | GET/POST | JWT | Create deal rooms |
| `/compliance/exceptions` | GET/POST | JWT | View + raise exceptions |
| `/intake` | POST | No | Public intake submission |
| `/workflows` | GET/POST | JWT | View + trigger workflows |
| `/agents/:slug/run` | POST | JWT | Run an agent |
| `/reports/generate` | POST | JWT | Generate reports |

---

## Admin Dashboard

Open: `http://localhost:3001`

Expected pages:
- Dashboard (executive summary)
- Participants (all contacts + qualification)
- Deals (deal rooms + status)
- Compliance (exceptions + KYC cases)
- Intake (inbound submissions)
- Communications (channels + messages)
- Compensation (comp events + payouts)
- Workflows (orchestration runs)
- Agents (agent definitions + run history)
- Reports (compliance + pipeline + intake)

---

## Monitoring Queues

Check BullMQ state in real-time:

```bash
# Install Bull Board (optional web UI for queue inspection)
pnpm add -D @bull-board/api @bull-board/express
```

Then visit: `http://localhost:4000/admin/queues` (after wiring Bull Board)

Or check directly in Redis:

```bash
# List queue keys
redis-cli KEYS "doc:*"

# View queue size
redis-cli LLEN "bull:doc:workflows:jobs"
```

---

## Next Steps

Once system is running locally and all tests pass:

1. **Deploy to production** — Vercel (webs) + Railway (API) + Managed Postgres/Redis
2. **Wire real KYC provider** — Sumsub or Persona instead of stubs
3. **Add email/SMS capture** — SendGrid or Twilio for communications
4. **Enable S3 storage** — File upload for documents
5. **Activate AI features** — Full Claude integration for deal analysis

---

## Support

Check logs:

```bash
# API logs (Terminal 1)
# Orchestrator logs (Terminal 2)
# Worker logs (Terminal 3)
# Database logs
docker compose logs postgres
# Redis logs
docker compose logs redis
```

All interactions are logged in `AuditEvent` table — check Prisma Studio to debug.
