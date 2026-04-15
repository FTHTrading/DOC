import Link from "next/link";

export default function IssuersPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 pt-16 pb-24">
      <div className="mb-12">
        <div className="text-[#f59e0b] text-sm font-medium mb-3 uppercase tracking-wider">Issuer Services</div>
        <h1 className="text-4xl font-bold mb-4">Capital Formation &amp; Distribution</h1>
        <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
          DOC Platform provides institutional broker-dealer distribution services for Regulation D,
          Regulation A+, and Regulation CF offerings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { label: "Reg D 506(c)", desc: "General solicitation to accredited investors. No dollar cap.", color: "#f59e0b" },
          { label: "Reg D 506(b)", desc: "Private placement up to 35 non-accredited investors.", color: "#f59e0b" },
          { label: "Reg A+ Tier 2", desc: "Mini-IPO up to $75M annually. Non-accredited investors permitted.", color: "#0ea5e9" },
        ].map((r) => (
          <div key={r.label} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="font-mono text-sm mb-2" style={{ color: r.color }}>{r.label}</div>
            <p className="text-white/60 text-sm leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-2xl p-8 mb-12">
        <h2 className="text-xl font-semibold mb-4">What We Provide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/70">
          {[
            "Registered broker-dealer distribution",
            "Deal room with investor data room",
            "KYC/AML and accreditation verification",
            "Investor communications compliance",
            "FINRA filing and compliance oversight",
            "AI-powered offering classification",
            "Compensation structure design",
            "Post-close cap table management",
          ].map((item) => (
            <div key={item} className="flex gap-3">
              <span className="text-[#f59e0b]">✓</span> {item}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/onboard?type=issuer"
          className="inline-block bg-[#f59e0b] hover:bg-[#f59e0b]/80 text-black font-semibold px-10 py-3 rounded-xl transition-colors"
        >
          Apply as an Issuer
        </Link>
      </div>
    </div>
  );
}
