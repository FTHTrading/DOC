# DOC OS — AI & Orchestration

## Architecture

DOC OS uses **Anthropic Claude claude-opus-4-5** as its primary AI model, routed through a layered stack:

```
Request
  │
  ▼
mcp-runtime / runAgent()
  │  resolves agent definition from DB
  │  enforces policy (allowedTools, forbiddenActions, requiresApproval)
  ▼
model-router / routeCompletion()
  │  selects provider: Claude (default) | OpenAI (fallback)
  ▼
claude-adapter / claudeComplete()
  │  Anthropic SDK → claude-opus-4-5
  │  persists ModelInvocation record
  ▼
Response → stored in AgentRun
```

---

## Agent Definitions (8 Registered)

All agents are seeded via `packages/db/src/seed.ts` and stored in the `AgentDefinition` table.

| Slug | Name | Type | Color |
|---|---|---|---|
| `intake-agent` | Intake Classifier | CLASSIFICATION | Steel Gray |
| `compliance-agent` | Compliance Evaluator | REGULATORY | Crimson |
| `identity-agent` | Identity Resolver | KYC_KYB | Navy |
| `deal-agent` | Deal Coordinator | ORCHESTRATION | Gold |
| `comms-agent` | Communications Manager | MESSAGING | Steel Gray |
| `comp-agent` | Comp Calculator | FINANCE | Gold |
| `reporting-agent` | Report Generator | ANALYTICS | Ice Blue |
| `supervisor-agent` | Supervisory Monitor | OVERSIGHT | Crimson |

---

## Tool Registry (11 Registered)

Tools are seeded and stored in `ToolDefinition` records. Each tool has:
- `name` — unique slug
- `description` — passed to agent system prompt
- `schema` — JSON Schema for input validation
- `category` — COMPLIANCE | COMMUNICATION | IDENTITY | FINANCIAL | ORCHESTRATION | REPORTING | SYSTEM
- `requiresApproval` — blocks execution until human approves

| Tool | Category | Requires Approval |
|---|---|---|
| `evaluate_kyc` | COMPLIANCE | No |
| `run_sanctions_check` | COMPLIANCE | No |
| `send_message` | COMMUNICATION | No |
| `create_channel` | COMMUNICATION | No |
| `look_up_participant` | IDENTITY | No |
| `build_rep_graph` | IDENTITY | No |
| `calculate_comp` | FINANCIAL | Yes |
| `dispatch_payout` | FINANCIAL | Yes |
| `trigger_workflow` | ORCHESTRATION | No |
| `generate_report` | REPORTING | No |
| `write_audit_event` | SYSTEM | No |

---

## Policy Enforcement

`executeTool()` in `packages/mcp-runtime` checks:

1. **allowedTools** — If agent definition specifies `allowedTools`, only those tools may be called
2. **forbiddenActions** — Explicit denies applied before allowed list
3. **requiresApproval** — Tool marked `requiresApproval = true` → creates `ApprovalRequest`, throws until approved

```typescript
// Policy check order:
// 1. forbiddenActions deny  → PolicyViolationError
// 2. allowedTools allow     → PolicyViolationError if not in list
// 3. requiresApproval check → ApprovalRequest created, rethrown
// 4. Execute tool
```

---

## Prompt Registry

Prompts are versioned and stored in PostgreSQL via `packages/prompt-registry`.

```typescript
// Fetch and render:
const prompt = await getPrompt("intake-classify");
const rendered = await renderTemplate(prompt.template, { content: submission });
```

- `upsertPrompt()` creates or versions prompts
- Templates use `{{variable}}` interpolation
- Prompts are linked to `AgentRun` via `promptVersionId`

---

## MCP Protocol

`mcp-runtime` implements a lightweight Model Context Protocol:

1. `registerTool(def)` — adds ToolDefinition to registry
2. `executeTool({ toolName, input, invokedBy })` — executes with policy enforcement, writes ToolInvocation
3. `runAgent({ agentSlug, triggeredBy, inputContext })` — full agent lifecycle:
   - Create AgentRun record (status: `running`)
   - Load AgentDefinition + ToolDefinitions
   - Fetch or build system prompt
   - Call model-router
   - Parse tool calls from model response
   - Execute each tool (with policy enforcement)
   - Update AgentRun record (status: `completed` | `failed`)
   - Return `{ agentRunId, status, output, tokensUsed }`

---

## Model Router

`packages/model-router` routes requests to providers:

```typescript
// Default routing:
// 1. If ANTHROPIC_API_KEY set → claude-adapter (claude-opus-4-5)
// 2. Fallback → OpenAI (GPT-4o) if OPENAI_API_KEY set
// 3. Error if no providers available
```

The router selects provider based on:
- `provider` hint in request
- Task type preference (`regulatory`, `classification`, etc.)
- Token budget and latency requirements

---

## Observability

Every AI interaction writes:

| Record | When |
|---|---|
| `ModelInvocation` | Every LLM API call (provider, model, prompt tokens, completion tokens, latency ms) |
| `ToolInvocation` | Every tool execution (success, output, error) |
| `AgentRun` | Every full agent run (linked invocations, status, triggeredBy) |
| `AuditEvent` | AGENT_RUN_COMPLETED, TOOL_INVOKED (via audit-log package) |
