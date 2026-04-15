export default function CompliancePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-16 pb-24">
      <div className="mb-12">
        <div className="text-[#dc2626] text-sm font-medium mb-3 uppercase tracking-wider">Legal &amp; Compliance</div>
        <h1 className="text-4xl font-bold mb-4">Disclosures &amp; Regulatory Documents</h1>
        <p className="text-white/60 max-w-2xl leading-relaxed">
          DOC Platform operates as a registered broker-dealer. The following disclosures are
          provided in accordance with SEC and FINRA requirements.
        </p>
      </div>

      <div className="space-y-6">
        {[
          {
            id: "crs",
            title: "Form CRS — Customer Relationship Summary",
            date: "Effective: January 1, 2025",
            desc: "Required disclosure under SEC Regulation Best Interest describing the types of client relationships and services we offer, the fees we charge, conflicts of interest, applicable legal standards, and disciplinary history.",
          },
          {
            id: "adv",
            title: "ADV Part 2 — Firm Brochure",
            date: "Annual Amendment: March 31, 2025",
            desc: "Detailed description of our advisory services, fees and compensation, performance-based fees, types of clients, methods of analysis, investment strategies, risks, disciplinary information, and other financial industry activities.",
          },
          {
            id: "best-interest",
            title: "Regulation Best Interest Disclosure",
            date: "Effective: June 30, 2020",
            desc: "Disclosure of all material facts about conflicts of interest associated with recommendations, including how conflicts are mitigated in the best interest of retail customers.",
          },
          {
            id: "privacy",
            title: "Privacy Policy — Regulation S-P Notice",
            date: "Updated: January 2025",
            desc: "Annual privacy notice describing how we collect, use, and protect personal financial information and our opt-out procedures for sharing with non-affiliated third parties.",
          },
          {
            id: "finra",
            title: "FINRA Investor Resources",
            date: "",
            desc: "FINRA provides educational resources for investors including the BrokerCheck tool to verify registration and disciplinary history of broker-dealer firms and representatives.",
            link: "https://www.finra.org/investors",
          },
        ].map((doc) => (
          <div
            key={doc.id}
            id={doc.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-lg mb-1">{doc.title}</h2>
                {doc.date && <div className="text-[#dc2626] text-xs mb-3">{doc.date}</div>}
                <p className="text-white/60 text-sm leading-relaxed">{doc.desc}</p>
                {doc.link && (
                  <a
                    href={doc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-[#0ea5e9] text-sm hover:underline"
                  >
                    Visit FINRA →
                  </a>
                )}
              </div>
              {!doc.link && (
                <button className="shrink-0 border border-white/20 text-white/60 hover:border-white/40 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors">
                  Download PDF
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-[#dc2626]/10 border border-[#dc2626]/20 rounded-2xl p-6">
        <h3 className="font-semibold mb-2 text-[#dc2626]">Important Disclosures</h3>
        <p className="text-sm text-white/60 leading-relaxed">
          Securities products are not FDIC insured, not bank guaranteed, and may lose value.
          Investing in private securities involves significant risks, including illiquidity and
          potential loss of principal. Past performance is not indicative of future results.
          All investments are subject to risk including the risk of complete loss. This is not
          an offer to buy or sell securities.
        </p>
      </div>
    </div>
  );
}
