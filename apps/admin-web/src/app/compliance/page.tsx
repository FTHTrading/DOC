export default function ComplianceAdminPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Compliance</h1>
        <p className="text-white/40 text-sm">Exception flags, KYC cases, supervisory reviews</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1 w-fit">
        {["Exceptions", "KYC Cases", "Supervisory Reviews", "Gates"].map((t) => (
          <button
            key={t}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              t === "Exceptions" ? "bg-[#dc2626]/20 text-[#dc2626]" : "text-white/40 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Exception flags */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#dc2626]">Open Exception Flags</h2>
          <button className="text-sm text-[#dc2626] border border-[#dc2626]/30 px-3 py-1.5 rounded-lg hover:bg-[#dc2626]/10 transition-colors">
            + Raise Exception
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white/30">
          No open exceptions. System is compliant.
        </div>
      </div>
    </div>
  );
}
