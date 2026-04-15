/**
 * DOC OS — Shared UI Kit
 * Design tokens, utility helpers, and minimal shared components.
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export { COLOR, DOMAIN_COLORS } from "@doc/domain";

// ─── Tailwind class merge utility ────────────────────────────────────────────
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Design tokens (Tailwind-compatible class strings) ───────────────────────
export const tokens = {
  // Backgrounds
  bg: {
    page: "bg-slate-950",
    card: "bg-slate-900",
    cardHover: "hover:bg-slate-800",
    navy: "bg-[#1e3a5f]",
    emerald: "bg-emerald-600",
    gold: "bg-amber-500",
    orange: "bg-orange-500",
    purple: "bg-violet-600",
    crimson: "bg-red-600",
    steel: "bg-slate-600",
    ice: "bg-sky-500",
  },
  // Text
  text: {
    primary: "text-white",
    secondary: "text-slate-300",
    muted: "text-slate-500",
    navy: "text-[#1e3a5f]",
    emerald: "text-emerald-400",
    gold: "text-amber-400",
    orange: "text-orange-400",
    purple: "text-violet-400",
    crimson: "text-red-400",
    steel: "text-slate-400",
    ice: "text-sky-400",
  },
  // Borders
  border: {
    default: "border-slate-800",
    navy: "border-[#1e3a5f]",
    emerald: "border-emerald-600",
    gold: "border-amber-500",
    orange: "border-orange-500",
    purple: "border-violet-600",
    crimson: "border-red-600",
  },
  // Status badges
  badge: {
    cleared: "bg-emerald-900 text-emerald-300 border border-emerald-700",
    blocked: "bg-red-900 text-red-300 border border-red-700",
    conditional: "bg-amber-900 text-amber-300 border border-amber-700",
    pending: "bg-slate-800 text-slate-300 border border-slate-600",
    active: "bg-emerald-900 text-emerald-300 border border-emerald-700",
    closed: "bg-slate-800 text-slate-400 border border-slate-600",
    draft: "bg-slate-900 text-slate-400 border border-slate-700",
    failed: "bg-red-900 text-red-300 border border-red-700",
  },
  // Typography scale
  type: {
    display: "text-4xl font-bold tracking-tight text-white",
    h1: "text-2xl font-bold text-white",
    h2: "text-xl font-semibold text-white",
    h3: "text-lg font-medium text-white",
    body: "text-sm text-slate-300 leading-relaxed",
    caption: "text-xs text-slate-500",
    mono: "font-mono text-sm text-slate-300",
  },
  // Layout
  layout: {
    page: "min-h-screen bg-slate-950 text-white",
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    card: "bg-slate-900 rounded-xl border border-slate-800 p-6",
    section: "py-8 space-y-6",
  },
  // Button variants
  button: {
    primary: "bg-[#1e3a5f] hover:bg-[#2a4d7f] text-white font-medium px-4 py-2 rounded-lg transition-colors",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-4 py-2 rounded-lg transition-colors border border-slate-700",
    danger: "bg-red-700 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-colors",
    ghost: "text-slate-300 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors",
    emerald: "bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg transition-colors",
    gold: "bg-amber-600 hover:bg-amber-500 text-white font-medium px-4 py-2 rounded-lg transition-colors",
    purple: "bg-violet-600 hover:bg-violet-500 text-white font-medium px-4 py-2 rounded-lg transition-colors",
  },
} as const;

// ─── KYC/compliance status helpers ──────────────────────────────────────────
export function kycStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    not_started: "Not Started",
    pending_docs: "Awaiting Documents",
    under_review: "Under Review",
    escalated: "Escalated",
    approved: "Approved",
    rejected: "Rejected",
    expired: "Expired",
  };
  return labels[status] ?? status;
}

export function kycStatusClass(status: string): string {
  switch (status) {
    case "approved": return tokens.badge.cleared;
    case "rejected": return tokens.badge.blocked;
    case "escalated": return tokens.badge.blocked;
    case "under_review": return tokens.badge.conditional;
    default: return tokens.badge.pending;
  }
}

export function participantTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    investor: "Investor",
    issuer: "Issuer",
    partner: "Partner",
    broker: "Broker",
    introducer: "Introducer",
    advisor: "Advisor",
    compliance_reviewer: "Compliance Reviewer",
  };
  return labels[type] ?? type;
}

export function participantTypeColor(type: string): string {
  switch (type) {
    case "investor": return "text-emerald-400";
    case "issuer": return "text-amber-400";
    case "partner": return "text-sky-400";
    case "broker": return "text-violet-400";
    case "introducer": return "text-orange-400";
    case "advisor": return "text-slate-300";
    default: return "text-slate-400";
  }
}

// ─── Navigation items for admin shell ───────────────────────────────────────
export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "🏛", color: "navy" },
  { label: "Participants", href: "/participants", icon: "🌿", color: "emerald" },
  { label: "Deal Rooms", href: "/deals", icon: "💰", color: "gold" },
  { label: "Compliance", href: "/compliance", icon: "⚖", color: "crimson" },
  { label: "AI Agents", href: "/agents", icon: "🤖", color: "purple" },
  { label: "Communications", href: "/communications", icon: "📡", color: "steel" },
  { label: "Compensation", href: "/compensation", icon: "💎", color: "gold" },
  { label: "Workflows", href: "/workflows", icon: "⚡", color: "purple" },
  { label: "Reports", href: "/reports", icon: "📊", color: "ice" },
  { label: "Settings", href: "/settings", icon: "⚙", color: "steel" },
] as const;

export const PUBLIC_NAV_ITEMS = [
  { label: "Platform", href: "/" },
  { label: "Investors", href: "/investors" },
  { label: "Issuers", href: "/issuers" },
  { label: "Partners", href: "/partners" },
  { label: "Compliance", href: "/compliance" },
  { label: "Onboard", href: "/onboard" },
] as const;
