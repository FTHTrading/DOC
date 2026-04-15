# DOC OS — Architecture Overview

## System Identity

**DOC OS** — Broker-Dealer Distribution, Compliance, and Orchestration Platform  
Built for Doc Lisa. Institutional-grade. SEC/FINRA-ready.

---

## Repository Layout

```
DOC/
├── apps/
│   ├── api/            Fastify 4 REST API              :4000
│   ├── orchestrator/   BullMQ workflow processor       (background)
│   ├── worker/         BullMQ job runner               (background)
│   ├── public-web/     Next.js 14 public portal        :3000
│   └── admin-web/      Next.js 14 admin dashboard      :3001
├── packages/
│   ├── db/             Prisma 5 schema + PrismaClient
│   ├── domain/         Shared TypeScript types, colors, constants
│   ├── audit-log/      7-year retention audit writer
│   ├── ui/             Design tokens + component utilities
│   ├── claude-adapter/ Anthropic SDK wrapper
│   ├── model-router/   Multi-provider LLM routing
│   ├── prompt-registry/ Versioned prompt templates
│   ├── mcp-runtime/    Agent + tool execution engine
│   ├── compliance-engine/  6-check parallel compliance gate
│   ├── identity-graph/ Rep → participant relationship BFS graph
│   ├── communications/ Channel + message + eDiscovery
│   ├── intake-engine/  Intake classification + routing
│   ├── orchestrator-core/ BullMQ queue factory + workflow triggers
│   ├── reporting/      8 report type generators
│   ├── treasury-adapter/ Pool NAV + treasury balances
│   ├── btc-adapter/    mempool.space BTC watch-only balance
│   └── settlement-adapter/ ACH/Wire/USDF/ATP payout dispatch
└── docs/               This directory
```

---

## Port Map

| Service | Port | Protocol |
|---|---|---|
| API (Fastify) | 4000 | HTTP |
| Public Web (Next.js) | 3000 | HTTP |
| Admin Web (Next.js) | 3001 | HTTP |
| PostgreSQL | 5432 | TCP |
| Redis | 6379 | TCP |
| Orchestrator | — | BullMQ consumer |
| Worker | — | BullMQ consumer |

---

## 8-Domain Color System

Every UI surface and data category maps to a color:

| Domain | Color | Hex | Covers |
|---|---|---|---|
| Core / Identity / Executive | Deep Navy | `#1e3a5f` | Users, org, reps, admin |
| Relationships / Pipeline | Emerald | `#10b981` | Identity graph, investors, issuers |
| Treasury / RWA / Comp | Gold | `#f59e0b` | Deals, payouts, pool NAV |
| BTC / Settlement | Bitcoin Orange | `#f97316` | BTC wallet, settlement rails |
| AI / MCP / Orchestration | Royal Purple | `#7c3aed` | Agents, workflows, tools |
| Compliance / Supervisory | Crimson | `#dc2626` | KYC, exceptions, gates |
| Communications / Intake | Steel Gray | `#64748b` | Messages, channels, intake |
| Analytics / Reporting | Ice Blue | `#0ea5e9` | Reports, metrics, health |

---

## Data Flow

```
User Action / Webhook
       │
       ▼
  apps/api (Fastify)
       │  authenticates (JWT), validates, calls package business logic
       │  writes AuditEvent for every mutation
       │
       ├──► Direct response (reads, compliance gates, agent runs via mcp-runtime)
       │
       └──► Enqueue to Redis (complex, async, multi-step)
                   │
         ┌─────────┴──────────┐
         ▼                    ▼
  apps/orchestrator      apps/worker
  (workflow runner)      (job runner)
  doc:workflows          doc:agents
  doc:compliance         doc:notifications
         │
         ▼
  Prisma → PostgreSQL (all durable state)
```

---

## Package Dependency Graph

```
domain (no deps)
  └── audit-log
  └── ui
  └── db
        └── compliance-engine
        └── identity-graph
        └── communications
        └── intake-engine
        └── claude-adapter
              └── model-router
                    └── prompt-registry
                          └── mcp-runtime
                                └── orchestrator-core
                                      └── reporting
                                      └── treasury-adapter
                                      └── btc-adapter
                                      └── settlement-adapter
```

---

## Technology Stack

| Concern | Technology |
|---|---|
| Runtime | Node.js 20+ LTS |
| Language | TypeScript 5.5 strict |
| Package manager | pnpm 9.4 workspaces |
| Build orchestration | Turborepo 2 |
| API framework | Fastify 4 |
| Frontend | Next.js 14 App Router |
| Styling | Tailwind CSS 3 |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Queue | Redis 7 + BullMQ 5 |
| AI | Anthropic Claude claude-opus-4-5 |
| Auth | JWT (RS256), API keys |

---

## Security Model

- All API routes require Bearer JWT except `GET /health` and `POST /intake`
- Intake webhook optionally validates `X-Intake-Secret` header
- Rate limiting on all routes (100/min global, 10/min on intake)
- `@fastify/helmet` sets security headers
- Audit log writes are fire-and-forget and never throw — compliance integrity is separate from audit availability
- BTC adapter is watch-only (no private key custody in DOC OS)
- Comp events require explicit supervisor approval before payout dispatch
