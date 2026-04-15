/**
 * DOC OS — Shared Domain Types
 * Mirrors Prisma enums + adds API/service-layer interfaces.
 */

// ─── Re-export Prisma enums ──────────────────────────────────────────────────
export type {
  User,
  Organization,
  Representative,
  Participant,
  KycCase,
  KybCase,
  AccreditationRecord,
  SuitabilityProfile,
  DealRoom,
  Product,
  Offering,
  AuditEvent,
  WorkflowRun,
  AgentRun,
  AgentDefinition,
  ToolDefinition,
  PromptTemplate,
  CompPlan,
  CompEvent,
  IntakeSubmission,
  Message,
} from "@prisma/client";

export {
  UserRole,
  ParticipantType,
  KycStatus,
  KybStatus,
  AccreditationStatus,
  SuitabilityStatus,
  SuitabilityRisk,
  ComplianceGateResult,
  ProductType,
  OfferingStatus,
  DealRoomStatus,
  IntakeChannel,
  IntakeStatus,
  IntakeType,
  TaskStatus,
  TaskPriority,
  ApprovalStatus,
  ExceptionSeverity,
  ExceptionStatus,
  WorkflowStatus,
  AgentRunStatus,
  ModelProvider,
  CompEventStatus,
  RelationshipEdgeType,
  AuditEventType,
  MessageChannel,
} from "@prisma/client";

// ─── Color System Tokens ─────────────────────────────────────────────────────
export const COLOR = {
  navy: {
    50: "#f0f4f8",
    500: "#1e3a5f",
    900: "#0f1e30",
    DEFAULT: "#1e3a5f",
  },
  emerald: {
    50: "#ecfdf5",
    500: "#10b981",
    900: "#064e3b",
    DEFAULT: "#10b981",
  },
  gold: {
    50: "#fffbeb",
    500: "#f59e0b",
    900: "#78350f",
    DEFAULT: "#f59e0b",
  },
  orange: {
    50: "#fff7ed",
    500: "#f97316",
    900: "#7c2d12",
    DEFAULT: "#f97316",
  },
  purple: {
    50: "#f5f3ff",
    500: "#7c3aed",
    900: "#2e1065",
    DEFAULT: "#7c3aed",
  },
  crimson: {
    50: "#fff1f2",
    500: "#dc2626",
    900: "#7f1d1d",
    DEFAULT: "#dc2626",
  },
  steel: {
    50: "#f8fafc",
    500: "#64748b",
    900: "#0f172a",
    DEFAULT: "#64748b",
  },
  ice: {
    50: "#f0f9ff",
    500: "#0ea5e9",
    900: "#0c4a6e",
    DEFAULT: "#0ea5e9",
  },
} as const;

// ─── Domain colour tag assignments ──────────────────────────────────────────
export const DOMAIN_COLORS = {
  identity: COLOR.navy,
  relationship: COLOR.emerald,
  treasury: COLOR.gold,
  bitcoin: COLOR.orange,
  ai: COLOR.purple,
  compliance: COLOR.crimson,
  communications: COLOR.steel,
  analytics: COLOR.ice,
} as const;

// ─── API response shapes ─────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
  code?: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Pagination ──────────────────────────────────────────────────────────────
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextCursor?: string;
}

// ─── Compliance gate ─────────────────────────────────────────────────────────
export interface ComplianceGateInput {
  participantId: string;
  /** Slug of the product/offering being accessed */
  productSlug?: string;
  /** Force re-evaluation even if a recent gate exists */
  forceRefresh?: boolean;
}

export interface ComplianceGateOutput {
  participantId: string;
  result: "blocked" | "conditional" | "cleared";
  blockingReasons: string[];
  conditionalReasons: string[];
  checkedAt: Date;
}

// ─── Relationship graph ──────────────────────────────────────────────────────
export interface GraphNode {
  id: string;
  type: "participant" | "representative" | "product" | "deal_room";
  label: string;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  fromId: string;
  toId: string;
  edgeType: string;
  strength?: number;
}

export interface RelationshipGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ─── MCP tool call ───────────────────────────────────────────────────────────
export interface ToolCall {
  toolSlug: string;
  input: Record<string, unknown>;
  agentRunId?: string;
}

export interface ToolResult {
  success: boolean;
  output?: unknown;
  error?: string;
  latencyMs: number;
  requiresApproval?: boolean;
}

// ─── Orchestrator event ──────────────────────────────────────────────────────
export interface OrchestratorEventPayload {
  eventType: string;
  sourceService: string;
  payload: Record<string, unknown>;
  workflowRunId?: string;
}

// ─── Workflow trigger ────────────────────────────────────────────────────────
export interface WorkflowTrigger {
  workflowType: string;
  triggerType: "intake" | "compliance" | "message" | "manual" | "schedule";
  triggerId?: string;
  input: Record<string, unknown>;
}

// ─── Comp event submit ───────────────────────────────────────────────────────
export interface CompEventSubmission {
  transactionRef: string;
  transactionType: string;
  beneficiaryId: string;
  proposedById: string;
  grossAmount: number;
  currency?: string;
  basisJson: Record<string, unknown>;
}

// ─── Service-level const ─────────────────────────────────────────────────────
export const SERVICE_PORTS = {
  api: 4000,
  orchestrator: 4001,
  worker: 4002,
  publicWeb: 3000,
  adminWeb: 3001,
} as const;

export const RETENTION_YEARS = 7; // FINRA Rule 4511 — 7 year communication retention
export const SUITABILITY_EXPIRY_MONTHS = 24;
export const ACCREDITATION_EXPIRY_MONTHS = 12;
export const SANCTIONS_CHECK_DAYS = 30; // Re-screen every 30 days
