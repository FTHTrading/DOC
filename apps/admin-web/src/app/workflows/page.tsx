export default function WorkflowsPage() {
  const statuses = ["All", "Pending", "Running", "Completed", "Failed", "Cancelled"];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Workflows</h1>
          <p className="text-white/40 text-sm">Orchestrated automation runs and lifecycle events</p>
        </div>
        <button className="px-4 py-2 bg-[#7c3aed]/20 text-[#a78bfa] border border-[#7c3aed]/30 rounded-xl text-sm font-medium hover:bg-[#7c3aed]/30 transition-colors">
          + Trigger Workflow
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
        {statuses.map((s) => (
          <button
            key={s}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              s === "All" ? "bg-[#7c3aed]/20 text-[#a78bfa]" : "text-white/40 hover:text-white"
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
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Workflow Type</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Triggered By</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Started</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Completed</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Detail</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-6 py-16 text-center text-white/30">
                No workflow runs yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
