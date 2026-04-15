"use client";
import { useState } from "react";

const REPORT_TYPES = [
  { key: "compliance_summary", label: "Compliance Summary", color: "#dc2626", desc: "Exception counts, gate results, KYC status distribution" },
  { key: "pipeline_snapshot", label: "Pipeline Snapshot", color: "#10b981", desc: "Rep pipeline by stage, conversion rates, deal velocity" },
  { key: "agent_activity", label: "Agent Activity", color: "#7c3aed", desc: "Agent run counts, success rates, token consumption" },
  { key: "payout_register", label: "Payout Register", color: "#f59e0b", desc: "Approved and pending payouts by rep and deal" },
  { key: "intake_funnel", label: "Intake Funnel", color: "#64748b", desc: "Intake volume, classification accuracy, routing time" },
  { key: "audit_trail", label: "Audit Trail Export", color: "#1e3a5f", desc: "Full actor+action audit log for regulatory reporting" },
];

export default function ReportsPage() {
  const [selected, setSelected] = useState("compliance_summary");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const selectedReport = REPORT_TYPES.find((r) => r.key === selected);

  async function handleGenerate() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selected, dateRange: "last_30_days" }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Failed to generate report — API unreachable." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Reports</h1>
        <p className="text-white/40 text-sm">Generate compliance, pipeline, and operational reports</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {REPORT_TYPES.map((r) => (
          <button
            key={r.key}
            onClick={() => setSelected(r.key)}
            className={`text-left p-5 rounded-2xl border transition-all ${
              selected === r.key
                ? "border-opacity-60 bg-opacity-10"
                : "border-white/10 bg-white/5 hover:bg-white/8"
            }`}
            style={selected === r.key ? { borderColor: r.color, backgroundColor: `${r.color}15` } : {}}
          >
            <div
              className="text-xs font-semibold mb-2 px-2 py-0.5 rounded-full w-fit"
              style={{ background: `${r.color}20`, color: r.color }}
            >
              {r.label}
            </div>
            <p className="text-xs text-white/40 leading-relaxed">{r.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60">
          Date range: Last 30 days
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          style={{ background: `${selectedReport?.color}20`, color: selectedReport?.color, border: `1px solid ${selectedReport?.color}40` }}
        >
          {loading ? "Generating…" : "Generate Report"}
        </button>
      </div>

      {result && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 mb-4">Report Output</h3>
          <pre className="text-xs text-white/70 overflow-auto max-h-96 font-mono whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
