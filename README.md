# DOC OS

**Broker-Dealer Distribution, Compliance, and Orchestration Platform**

> The dedicated operating environment for Doc Lisa inside the UnyKorn / FTH Trading ecosystem.

---

## Deployments

| Environment | URL |
|---|---|
| Public portal | `https://doc.unykorn.org` |
| Admin portal | `https://admin.doc.unykorn.org` |
| API | `https://api.doc.unykorn.org` |

---

## System Overview

DOC OS is a production-grade institutional broker-dealer operating system covering:

| Domain | Color | Function |
|---|---|---|
| Core infrastructure | Deep Navy | Global shell, settings, audit |
| Relationships & growth | Emerald | Investors, issuers, pipeline, partners |
| Treasury & RWA | Gold | Centrifuge, tokenized products, subscriptions |
| Bitcoin workflows | Orange | BTC access, wallet, custody, settlement |
| AI & orchestration | Royal Purple | MCP runtime, Claude, task graph, agent runs |
| Compliance | Crimson | KYC/KYB, accreditation, supervisory, exception queue |
| Communications | Steel Gray | Intake, messaging, archives, eDiscovery |
| Analytics | Ice Blue | Dashboards, revenue, attribution, health |

---

## Monorepo Structure

```
DOC/
  apps/
    public-web/         Next.js 14 — doc.unykorn.org
    admin-web/          Next.js 14 — admin.doc.unykorn.org
    api/                Fastify 4  — api.doc.unykorn.org
    orchestrator/       Orchestrator service
    worker/             BullMQ background worker
  packages/
    db/                 Prisma 5 schema + client
    domain/             Shared TypeScript domain types
    ui/                 Shared React component library + design tokens
    identity-graph/     Participant + relationship attribution
    compliance-engine/  KYC/KYB/accreditation/suitability gate
    communications/     Messaging, intake, retention
    intake-engine/      Intake classification + routing
    orchestrator-core/  Event bus + workflow engine
    mcp-runtime/        MCP tool registry + agent runner
    model-router/       Model provider abstraction
    claude-adapter/     Anthropic Claude adapter
    prompt-registry/    Versioned prompt templates
    audit-log/          Immutable audit event writer
    reporting/          Revenue, attribution, analytics
    treasury-adapter/   Centrifuge / RWA rail connector
    btc-adapter/        Bitcoin workflow connector
    settlement-adapter/ Settlement + stablecoin tracking
  docs/
    architecture.md
    workflows.md
    compliance-model.md
    ai-orchestration.md
    communications-intake.md
  .env.example
  turbo.json
  package.json
  README.md
```

---

## Prerequisites

- Node.js 20+
- pnpm 9.4+
- PostgreSQL 16
- Redis 7

---

## Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment
cp .env.example .env
# Edit .env with your local values

# 3. Generate Prisma client
pnpm db:generate

# 4. Run migrations
pnpm db:migrate

# 5. Seed demo data
pnpm db:seed

# 6. Start all services
pnpm dev
```

Individual services:

```bash
# API only
pnpm --filter @doc/api dev

# Admin web only
pnpm --filter @doc/admin-web dev

# Public web only
pnpm --filter @doc/public-web dev

# Orchestrator
pnpm --filter @doc/orchestrator dev

# Worker
pnpm --filter @doc/worker dev
```

---

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full system design and deployment topology.

---

## Non-Negotiable Operating Rules

1. No consequential action without audit record
2. No payout without explicit supervisory approval
3. No product progression without required compliance checkpoints
4. No unmanaged communications in regulated workflows
5. No AI action beyond registered tool permissions
6. No silent model/tool invocation — every AI call is logged
7. Every intake, communication, and workflow event is attributable
8. Every participant relationship preserves its origin linkage to the originating representative

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5.5 (strict) |
| Monorepo | Turborepo 2 + pnpm workspaces |
| API | Fastify 4 |
| Frontend | Next.js 14 App Router |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 + BullMQ 5 |
| Storage | S3 / MinIO compatible |
| AI | Anthropic Claude (adapter pattern — multi-provider ready) |
| Observability | OpenTelemetry + structured logging |

---

*DOC OS — built for institutional-grade broker-dealer operations.*
