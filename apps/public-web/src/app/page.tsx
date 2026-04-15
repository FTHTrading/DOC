export default function HomePage() {
  const domains = [
    {
      icon: "👥",
      title: "Investor Relations",
      desc: "Accredited investor onboarding, KYC/AML compliance, and access to premium offerings.",
      color: "#10b981",
      href: "/investors",
    },
    {
      icon: "🏢",
      title: "Issuer Services",
      desc: "Regulated securities distribution, Reg D/A+ structuring, and deal room management.",
      color: "#f59e0b",
      href: "/issuers",
    },
    {
      icon: "🤝",
      title: "Partner Network",
      desc: "Referral agreements, co-broker arrangements, and white-label distribution partnerships.",
      color: "#0ea5e9",
      href: "/partners",
    },
    {
      icon: "⚖️",
      title: "Compliance Engine",
      desc: "AI-powered compliance gate, Form CRS delivery, and supervisory workflow automation.",
      color: "#dc2626",
      href: "/compliance",
    },
    {
      icon: "🤖",
      title: "AI Orchestration",
      desc: "8 specialized agents for intake, classification, compliance, and relationship intelligence.",
      color: "#7c3aed",
      href: "#",
    },
    {
      icon: "₿",
      title: "Digital Assets",
      desc: "BTC treasury reserve monitoring, USDF stablecoin settlement, and ATP on-chain compensation.",
      color: "#f97316",
      href: "#",
    },
  ];

  const stats = [
    { label: "Compliance Gates", value: "100%", sub: "automated evaluation" },
    { label: "Message Retention", value: "7yr", sub: "FINRA Rule 4511" },
    { label: "AI Agents", value: "8", sub: "specialized BD agents" },
    { label: "Settlement Rails", value: "5", sub: "ACH, wire, USDF, ATP, check" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Hero */}
      <section className="pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-[#1e3a5f]/40 border border-[#1e3a5f] rounded-full px-4 py-1.5 mb-8 text-sm text-[#0ea5e9]">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          Registered Broker-Dealer Platform
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Institutional Distribution,{" "}
          <span className="text-[#10b981]">Compliance &amp; Orchestration</span>
        </h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          DOC Platform is a production-grade broker-dealer operating system with AI-powered compliance,
          regulated securities distribution, and on-chain settlement.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/onboard"
            className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/80 text-white font-medium px-8 py-3 rounded-xl transition-colors"
          >
            Start Onboarding
          </a>
          <a
            href="/compliance"
            className="border border-white/20 text-white/80 hover:border-white/40 hover:text-white font-medium px-8 py-3 rounded-xl transition-colors"
          >
            View Disclosures
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-12 border-y border-white/10 mb-20">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
            <div className="text-[#0ea5e9] text-sm font-medium">{s.label}</div>
            <div className="text-white/40 text-xs mt-0.5">{s.sub}</div>
          </div>
        ))}
      </section>

      {/* Domain cards */}
      <section className="mb-24">
        <h2 className="text-3xl font-bold mb-4 text-center">
          One Platform, Eight Domains
        </h2>
        <p className="text-white/50 text-center mb-12">
          Built for the complete lifecycle of institutional securities distribution.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {domains.map((d) => (
            <a
              key={d.title}
              href={d.href}
              className="group block bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/8 transition-all"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ backgroundColor: d.color + "20" }}
              >
                {d.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-white transition-colors">
                {d.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">{d.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-20 bg-[#1e3a5f]/20 border border-[#1e3a5f]/50 rounded-3xl mb-24 px-8">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-white/60 mb-8 max-w-lg mx-auto">
          Complete our onboarding form and our team will reach out within one business day.
          All submissions are reviewed by a licensed representative.
        </p>
        <a
          href="/onboard"
          className="inline-block bg-[#10b981] hover:bg-[#10b981]/80 text-white font-semibold px-10 py-3 rounded-xl transition-colors"
        >
          Begin Onboarding →
        </a>
      </section>
    </div>
  );
}
