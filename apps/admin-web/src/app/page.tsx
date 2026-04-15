// Executive dashboard — server component fetches metrics from API
const API = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";

async function fetchMetric<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      next: { revalidate: 60 },
      headers: { Authorization: `Bearer ${process.env["INTERNAL_API_TOKEN"] ?? ""}` },
    });
    if (!res.ok) return null;
    const data = await res.json() as { ok: boolean; data: T };
    return data.data ?? null;
  } catch {
    return null;
  }
}

const TILES = [
  { key: "participants", label: "Participants", color: "#10b981", icon: "👥", href: "/participants" },
  { key: "deals", label: "Deal Rooms", color: "#f59e0b", icon: "🏛", href: "/deals" },
  { key: "compliance", label: "Open Exceptions", color: "#dc2626", icon: "⚖️", href: "/compliance" },
  { key: "intake", label: "Pending Intake", color: "#64748b", icon: "📥", href: "/intake" },
  { key: "agents", label: "Agent Runs Today", color: "#7c3aed", icon: "🤖", href: "/agents" },
  { key: "workflows", label: "Active Workflows", color: "#7c3aed", icon: "⚡", href: "/workflows" },
  { key: "payouts", label: "Pending Payouts", color: "#f59e0b", icon: "💰", href: "/compensation" },
  { key: "btc", label: "BTC Reserve", color: "#f97316", icon: "₿", href: "/reports" },
];

export default async function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Operations Dashboard</h1>
        <p className="text-white/40 text-sm">DOC OS — Broker-Dealer Operations Center</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {TILES.map((tile) => (
          <a
            key={tile.key}
            href={tile.href}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 hover:bg-white/8 transition-all group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
              style={{ backgroundColor: tile.color + "20" }}
            >
              {tile.icon}
            </div>
            <div className="text-2xl font-bold mb-1">—</div>
            <div className="text-white/50 text-sm group-hover:text-white/70 transition-colors">
              {tile.label}
            </div>
          </a>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e3a5f]/20 border border-[#1e3a5f]/40 rounded-2xl p-6">
          <h2 className="font-semibold mb-4 text-[#0ea5e9]">Recent Intake</h2>
          <p className="text-white/40 text-sm">No recent submissions</p>
          <a href="/intake" className="text-[#0ea5e9] text-sm mt-4 block hover:underline">
            View all intake →
          </a>
        </div>
        <div className="bg-[#dc2626]/10 border border-[#dc2626]/20 rounded-2xl p-6">
          <h2 className="font-semibold mb-4 text-[#dc2626]">Open Exceptions</h2>
          <p className="text-white/40 text-sm">No open exceptions</p>
          <a href="/compliance" className="text-[#dc2626] text-sm mt-4 block hover:underline">
            View compliance →
          </a>
        </div>
        <div className="bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-2xl p-6">
          <h2 className="font-semibold mb-4 text-[#7c3aed]">AI Agent Activity</h2>
          <p className="text-white/40 text-sm">No recent runs</p>
          <a href="/agents" className="text-[#7c3aed] text-sm mt-4 block hover:underline">
            View agents →
          </a>
        </div>
      </div>
    </div>
  );
}
