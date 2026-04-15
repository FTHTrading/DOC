export default function PartnersPage() {
  const tracks = [
    {
      title: "Referral Partners",
      color: "#0ea5e9",
      points: [
        "Coordinated investor introductions",
        "Attribution and deal-level reporting",
        "Compliant compensation workflows",
      ],
    },
    {
      title: "Broker Network",
      color: "#f59e0b",
      points: [
        "Structured co-broker workflows",
        "Shared supervision standards",
        "Route-level compliance checkpoints",
      ],
    },
    {
      title: "Institutional Integrators",
      color: "#10b981",
      points: [
        "API and workflow integration",
        "Operational controls and audit alignment",
        "Deployment-grade support model",
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 pt-16 pb-24">
      <div className="mb-12">
        <div className="text-[#0ea5e9] text-sm font-medium mb-3 uppercase tracking-wider">Partner Services</div>
        <h1 className="text-4xl font-bold mb-4">Partnership Programs</h1>
        <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
          Structured partner tracks for referrals, co-broker relationships, and institutional integrations,
          with compliance-first workflow controls and transparent attribution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {tracks.map((track) => (
          <div key={track.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-3" style={{ color: track.color }}>
              {track.title}
            </h2>
            <ul className="space-y-2 text-sm text-white/70">
              {track.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 rounded-2xl p-8 mb-10">
        <h3 className="text-xl font-semibold mb-3">Program Intake</h3>
        <p className="text-sm text-white/70 leading-relaxed mb-4">
          Submit your partner profile to be evaluated for distribution fit, compliance readiness, and operational alignment.
          Approved partners are onboarded into a structured routing and reporting workflow.
        </p>
        <a
          href="/onboard?type=partner"
          className="inline-block bg-[#0ea5e9] hover:bg-[#0ea5e9]/80 text-black font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Apply as a Partner
        </a>
      </div>
    </div>
  );
}
