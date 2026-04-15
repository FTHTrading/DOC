const sections = [
  {
    id: "toc",
    title: "Table of Contents",
    color: "#0ea5e9",
    items: [
      "System Overview",
      "Color-Coded Domain Layers",
      "Execution and Settlement Rails",
      "Approval and Compliance Control Gates",
      "Page Surface Map",
    ],
  },
  {
    id: "domains",
    title: "Color-Coded Domain Layers",
    color: "#10b981",
    items: [
      "Navy: Core orchestration and API",
      "Emerald: Investor and participant operations",
      "Gold: Issuer and distribution operations",
      "Crimson: Compliance and disclosures",
      "Ice: Partner and integration tracks",
    ],
  },
  {
    id: "rails",
    title: "Execution Rails",
    color: "#f59e0b",
    items: [
      "AI command intake and workflow trigger",
      "Policy and approval validation",
      "Wallet and payment execution routing",
      "Settlement event emission",
      "Audit trail persistence",
    ],
  },
  {
    id: "controls",
    title: "Control and Governance",
    color: "#dc2626",
    items: [
      "No autonomous high-risk execution without approval",
      "No compliance bypass pathways",
      "No audit write suppression",
      "Structured supervisory visibility",
      "Deterministic state transitions",
    ],
  },
];

const pages = [
  { path: "/", name: "Home", purpose: "Platform overview and launch path" },
  { path: "/system", name: "System", purpose: "Architecture and TOC" },
  { path: "/investors", name: "Investors", purpose: "Investor onboarding and qualifications" },
  { path: "/issuers", name: "Issuers", purpose: "Capital formation and distribution" },
  { path: "/partners", name: "Partners", purpose: "Partner tracks and intake" },
  { path: "/compliance", name: "Compliance", purpose: "Regulatory disclosures" },
  { path: "/onboard", name: "Onboard", purpose: "Unified intake form" },
];

export default function SystemPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-16 pb-24">
      <div className="mb-12">
        <div className="text-[#0ea5e9] text-sm font-medium mb-3 uppercase tracking-wider">System Design</div>
        <h1 className="text-4xl font-bold mb-4">DOC System Architecture</h1>
        <p className="text-white/60 text-lg max-w-3xl leading-relaxed">
          SR-engineered, color-coded platform structure with deterministic execution rails and
          compliance-gated operations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-14">
        <aside className="lg:col-span-1 rounded-2xl border border-white/10 bg-white/5 p-5 h-fit lg:sticky lg:top-24">
          <h2 className="text-sm uppercase tracking-wider text-white/60 mb-3">Contents</h2>
          <div className="space-y-2 text-sm">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="block rounded-lg border border-white/10 bg-[#0a0f1e] px-3 py-2 text-white/70 hover:text-white hover:border-white/30 transition-colors">
                {section.title}
              </a>
            ))}
            <a href="#pages" className="block rounded-lg border border-white/10 bg-[#0a0f1e] px-3 py-2 text-white/70 hover:text-white hover:border-white/30 transition-colors">
              Page Surface Map
            </a>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: section.color }}>
                {section.title}
              </h2>
              <ul className="space-y-2 text-sm text-white/70">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}

          <section id="pages" className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold mb-4 text-[#7c3aed]">Page Surface Map</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pages.map((page) => (
                <a key={page.path} href={page.path} className="rounded-xl border border-white/10 bg-[#0a0f1e] p-4 hover:border-white/30 transition-colors">
                  <div className="text-sm text-[#0ea5e9] mb-1">{page.path}</div>
                  <div className="font-semibold mb-1">{page.name}</div>
                  <div className="text-xs text-white/60">{page.purpose}</div>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
