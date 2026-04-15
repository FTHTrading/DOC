# Master VS Code Prompt — Genesis Wallet + Internal Issuance Network

Copy everything in this file and paste into VS Code Copilot Chat (Agent mode) at the root of the DOC repository.

---

You are GPT-5.3-Codex acting as principal architect and implementation lead for a production financial platform.

Build a single integrated product called **UnyKorn Genesis Issuance Network** inside this monorepo, extending existing DOC OS.

## Mission

Implement **Doc-controlled internal wallet issuance** as a native system power, with external chains as optional exits.

Default operating model:

Issue -> onboard -> fund -> operate -> approve -> release externally only if policy allows.

## Non-Negotiable Product Model

- This is not a retail wallet.
- UX target: private bank wallet + broker-dealer terminal + elite treasury app.
- Internal-first ledger and governance are the source of truth.
- External chain execution is routed and policy-gated.
- Every issued wallet is identity-linked, policy-governed, auditable, and AI-operable.

## Build Scope

Create the following apps:

- apps/genesis-web
- apps/genesis-extension
- apps/genesis-mobile
- apps/wallet-api
- apps/fth-pay-router
- apps/signer-orchestrator

Create the following packages:

- packages/wallet-core
- packages/fth-pay
- packages/device-registry
- packages/policy-engine
- packages/ai-wallet-agent
- packages/chain-adapters
- packages/contacts
- packages/notifications

Integrate with existing packages already present in repo:

- @doc/db
- @doc/domain
- @doc/audit-log
- @doc/compliance-engine
- @doc/communications
- @doc/orchestrator-core
- @doc/mcp-runtime
- @doc/model-router
- @doc/claude-adapter

## Wallet Classes (Required)

Implement first-class wallet classes:

- DOC_MASTER
- INTERNAL_STAFF
- BROKER_DEALER
- INVESTOR
- ISSUER
- TREASURY
- SETTLEMENT
- DEAL
- AGENT

Each class must have:

- default permissions
- default chain access profile
- default transfer guardrails
- default approval policy
- UI surface flags

## Wallet Control States (Required)

Implement wallet operational states:

- INTERNAL_ONLY
- INTERNAL_PLUS_APPROVED_COUNTERPARTIES
- APPROVED_EXTERNAL_RAIL_ACCESS
- RESTRICTED
- FROZEN
- SETTLEMENT_ONLY

State changes require audit logging and policy validation.

## Core Domain Features

For each issued wallet automatically create and link:

- identity profile
- namespace
- wallet account
- internal FTH Pay account
- contact card
- communication inbox/channel
- policy profile (limits + restrictions)
- device registry entry
- AI assistant capability profile
- compliance linkage
- audit root record

## End-to-End Issuance Workflow

Implement command-driven issuance workflow:

Example command:

Create a broker wallet for Lisa Carter with internal-only permissions and FTH Pay enabled.

System execution steps:

1. create identity
2. issue wallet
3. assign role and wallet class
4. generate namespace
5. attach communications channel
6. configure policy and limits
7. enable FTH Pay profile
8. register initial trusted device placeholder
9. persist audit trail and receipts
10. notify issuer and assignee

## AI Wallet Command Layer

Add command bar UX label:

Ask Genesis AI...

Implement commands with real workflow actions:

- Send 25000 USDF to Sravan after approval
- Convert USDC to FTH USD
- Show all pending payouts
- Create wallet for new investor
- Prepare treasury subscription packet
- Route this payment through FTH Pay
- Lock this wallet to stablecoin-only
- Generate compliance summary for this account
- Issue 5 investor wallets for this group, set internal-only, preload disclosures, enable FTH Pay, send onboarding

Requirements:

- natural language parser
- intent to action mapping
- policy pre-check
- approval orchestration
- execution plan display
- user confirmation step for sensitive actions
- full audit trail of plan, approval, execution, result

## FTH Pay Routing Layer

Build internal-first payment rail:

- internal transfer routing
- payment request and invoice primitive
- broker compensation release pipeline
- role-based route selection
- approval-aware routing
- settlement abstraction across chains

Routing order:

1. internal ledger transfer if eligible
2. internal approved-counterparty path
3. external rail only if policy allows and approvals complete

## Security and Signing

Implement signer orchestrator with pluggable strategy:

- software signer for local dev
- MPC adapter interface for production
- per-wallet signing policy
- device binding hooks
- recovery workflow skeleton

Never hardcode secrets. Use env vars and secure config providers.

## API Contracts

Create wallet-api endpoints for:

- issuance
- wallet state transitions
- policy updates
- device registration
- internal transfers
- payment requests
- approvals
- external release requests
- command execution (AI)
- wallet activity and audit receipts

Add OpenAPI spec generation for new endpoints.

## UI Requirements

### Genesis Web

Main areas:

- balances
- send and receive
- convert
- treasury assets
- stablecoins
- BTC
- internal FTH Pay
- approvals
- transaction history
- AI command bar
- contacts
- compliance state
- wallet permissions
- linked devices

### Genesis Extension

Flows:

- connect app
- sign request
- approve request
- view balances
- switch chain
- quick FTH Pay send
- policy-aware prompts
- notifications

### Genesis Mobile (iOS + Android)

Flows:

- biometric login
- wallet overview
- send and request
- QR pay
- approval actions
- AI assistant
- secure chat
- compliance alerts
- treasury visibility
- stablecoin conversion
- contacts
- notifications

## Data Model Changes (Prisma)

Add new models and enums to support:

- wallet class
- wallet state
- issuer relationship
- internal ledger account
- internal ledger transaction
- payment request
- routing decision
- approval chain for transfers
- device registry
- signer policy
- command execution log
- wallet notification records

Create safe migration and seed updates with realistic demo data.

## Required Demo Seed Scenario

Seed data must include:

- Doc master issuer account
- Lisa broker wallet (internal-only)
- investor wallets (at least 3)
- issuer wallet (at least 1)
- treasury wallet
- settlement wallet
- pending approvals queue
- internal transfer history
- one blocked external release due to policy

## Orchestration Integration

Use existing orchestrator and worker patterns.

Add workflow types for:

- wallet_issue
- wallet_batch_issue
- wallet_policy_update
- transfer_request
- transfer_approval
- external_release
- command_execute

## Engineering Standards

- TypeScript strict mode throughout
- runtime validation with zod for new API inputs
- unit tests for policy and routing logic
- integration tests for issuance and transfer workflows
- no TODO stubs in core path
- graceful error handling with typed error envelopes
- all mutations must write audit events

## Delivery Plan (execute in phases)

Phase 1:

- scaffold apps and packages
- wire package dependencies
- add base models and migrations

Phase 2:

- implement issuance domain logic
- implement wallet classes and states
- implement internal ledger + FTH Pay core routing

Phase 3:

- implement wallet-api endpoints
- integrate orchestrator workflows
- integrate AI command layer

Phase 4:

- build genesis-web primary dashboard and flows
- build extension core flows
- scaffold mobile app and critical flows

Phase 5:

- tests, docs, and runbooks
- seed full demo scenario
- verify end-to-end command-driven issuance and transfer

## Acceptance Criteria

Project is done only when all pass:

1. Doc can issue single wallet and batch wallets from API and web UI.
2. Issued wallets default to INTERNAL_ONLY and can be transitioned by policy.
3. Internal transfers settle without external chain dependency.
4. External release requires explicit approvals and policy pass.
5. AI command bar can execute at least 8 commands end-to-end.
6. All wallet mutations produce immutable audit records.
7. Extension can approve signing request with policy prompts.
8. Mobile app can perform biometric auth and approval action flow.
9. Seed scenario loads and is demoable from clean environment.
10. Documentation includes architecture, APIs, workflow diagrams, and ops commands.

## Output Requirements

While implementing:

- show file-by-file changes
- run type checks and tests after each major phase
- fix discovered errors before moving on
- provide final run commands for local demo
- provide a short operator checklist for Doc

Start implementation now inside this repository and complete all phases.
