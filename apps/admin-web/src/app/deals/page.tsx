export default function DealsPage() {
  const statuses = ["All", "Setup", "Open", "Closing", "Closed", "Cancelled"];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Deal Rooms</h1>
          <p className="text-white/40 text-sm">Private offering rooms and deal lifecycle management</p>
        </div>
        <button className="px-4 py-2 bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 rounded-xl text-sm font-medium hover:bg-[#f59e0b]/30 transition-colors">
          + Create Deal Room
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
        {statuses.map((s) => (
          <button
            key={s}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              s === "All" ? "bg-[#f59e0b]/20 text-[#f59e0b]" : "text-white/40 hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Deal Room</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Offering</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Participants</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Target</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-6 py-16 text-center text-white/30">
                No deal rooms created yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
