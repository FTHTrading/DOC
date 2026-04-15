export default function ParticipantsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Participants</h1>
          <p className="text-white/40 text-sm">Investors, issuers, partners, and referral sources</p>
        </div>
        <a
          href="/participants/new"
          className="bg-[#10b981] hover:bg-[#10b981]/80 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add Participant
        </a>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["All", "Investor", "Issuer", "Broker", "Partner", "Referral"].map((f) => (
          <button
            key={f}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
              f === "All"
                ? "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30"
                : "border border-white/10 text-white/40 hover:border-white/30"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/40">
              <th className="px-5 py-3 text-left font-medium">Name</th>
              <th className="px-5 py-3 text-left font-medium">Type</th>
              <th className="px-5 py-3 text-left font-medium">KYC Status</th>
              <th className="px-5 py-3 text-left font-medium">Accreditation</th>
              <th className="px-5 py-3 text-left font-medium">Rep</th>
              <th className="px-5 py-3 text-left font-medium">Added</th>
              <th className="px-5 py-3 text-left font-medium"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="px-5 py-12 text-center text-white/30">
                No participants yet. Connect to the API to load data.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
