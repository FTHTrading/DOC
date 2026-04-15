export default function CommunicationsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Communications</h1>
          <p className="text-white/40 text-sm">Channels, messages, and 7-year retention archive</p>
        </div>
        <button className="px-4 py-2 bg-[#64748b]/20 text-[#94a3b8] border border-[#64748b]/30 rounded-xl text-sm font-medium hover:bg-[#64748b]/30 transition-colors">
          + New Channel
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active Channels", value: "—", color: "#94a3b8" },
          { label: "Messages (30d)", value: "—", color: "#94a3b8" },
          { label: "eDiscovery Flags", value: "—", color: "#dc2626" },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-sm text-white/40">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold text-sm text-white/60">Channels</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Channel</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Participant</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Type</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Last Message</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Retain Until</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center text-white/30">
                No channels created yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
