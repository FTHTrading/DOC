export default function IntakePage() {
  const channels = ["All", "Web Form", "Email", "API", "Manual"];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Intake Queue</h1>
          <p className="text-white/40 text-sm">Inbound submissions pending classification and routing</p>
        </div>
        <button className="px-4 py-2 bg-[#64748b]/20 text-[#94a3b8] border border-[#64748b]/30 rounded-xl text-sm font-medium hover:bg-[#64748b]/30 transition-colors">
          + Manual Entry
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
        {channels.map((c) => (
          <button
            key={c}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              c === "All" ? "bg-[#64748b]/20 text-[#94a3b8]" : "text-white/40 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Submitter</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Channel</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Content Preview</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Classification</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Submitted</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-6 py-16 text-center text-white/30">
                Intake queue is empty.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
