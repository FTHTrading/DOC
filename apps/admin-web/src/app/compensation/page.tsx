export default function CompensationPage() {
  const tabs = ["Comp Events", "Payouts", "Comp Plans"];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Compensation</h1>
          <p className="text-white/40 text-sm">Rep comp events, payout approvals, and plan management</p>
        </div>
        <button className="px-4 py-2 bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 rounded-xl text-sm font-medium hover:bg-[#f59e0b]/30 transition-colors">
          + Submit Comp Event
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              t === "Comp Events" ? "bg-[#f59e0b]/20 text-[#f59e0b]" : "text-white/40 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Rep</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Description</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Amount</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Submitted</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-6 py-16 text-center text-white/30">
                No comp events pending.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
