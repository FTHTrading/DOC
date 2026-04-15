import Link from "next/link";

export default function InvestorsPage() {
  const steps = [
    { n: "01", title: "Submit Inquiry", desc: "Complete our intake form with your investment objectives and accreditation status." },
    { n: "02", title: "KYC / AML Review", desc: "Our compliance team verifies your identity, net worth, and regulatory status." },
    { n: "03", title: "Suitability Assessment", desc: "A licensed representative conducts a suitability interview aligned to your profile." },
    { n: "04", title: "Deal Room Access", desc: "Approved investors receive access to current offerings with full disclosure documents." },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 pt-16 pb-24">
      <div className="mb-12">
        <div className="text-[#10b981] text-sm font-medium mb-3 uppercase tracking-wider">Investor Services</div>
        <h1 className="text-4xl font-bold mb-4">For Accredited Investors</h1>
        <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
          Access institutional-quality private securities offerings. All investments are subject to
          full regulatory compliance including FINRA/SEC suitability requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {steps.map((s) => (
          <div key={s.n} className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-2xl p-6">
            <div className="text-[#10b981] font-mono text-sm mb-3">{s.n}</div>
            <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
            <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12">
        <h2 className="text-xl font-semibold mb-4">Investor Qualifications</h2>
        <div className="space-y-3 text-sm text-white/70">
          <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Accredited investor status (net worth &gt;$1M or income &gt;$200K/$300K joint)</div>
          <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Qualified purchaser status for select offerings (&gt;$5M investable assets)</div>
          <div className="flex gap-3"><span className="text-[#10b981]">✓</span> US person or qualified foreign investor with appropriate documentation</div>
          <div className="flex gap-3"><span className="text-[#10b981]">✓</span> Completion of KYC/AML review and suitability assessment</div>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/onboard?type=investor"
          className="inline-block bg-[#10b981] hover:bg-[#10b981]/80 text-white font-semibold px-10 py-3 rounded-xl transition-colors"
        >
          Apply as an Investor
        </Link>
      </div>
    </div>
  );
}
