export default function DocOSPublicSite() {
  type ActivityTone = "emerald" | "amber" | "blue" | "purple";

  const stats = [
    { label: "Issued Wallets", value: "128", sub: "internal network" },
    { label: "Pending Approvals", value: "07", sub: "requires review" },
    { label: "AI Directives", value: "19", sub: "running now" },
    { label: "FTH Pay Routed", value: "$4.2M", sub: "30d volume" },
  ];

  const actions = [
    { title: "Issue Wallet", sub: "create internal participant wallet" },
    { title: "Run AI Directive", sub: "route command into orchestration" },
    { title: "Start Onboarding", sub: "investor / issuer / broker" },
    { title: "Send Payment", sub: "FTH Pay -> x402 execution" },
    { title: "Open Deal Room", sub: "controlled distribution workspace" },
    { title: "Review Approvals", sub: "compliance and settlement gates" },
  ];

  const activity: Array<{ time: string; title: string; meta: string; tone: ActivityTone }> = [
    { time: "09:42", title: "Investor wallet issued", meta: "Meridian Capital - Internal Only", tone: "emerald" },
    { time: "09:35", title: "Payment awaiting approval", meta: "$25,000 - FTH Pay -> x402", tone: "amber" },
    { time: "09:26", title: "Compliance review completed", meta: "Issuer onboarding packet cleared", tone: "blue" },
    { time: "09:11", title: "AI executed intake classification", meta: "3 new counterparties routed", tone: "purple" },
  ];

  const rails = [
    {
      title: "Centrifuge Treasuries",
      tag: "RWA / T-Bills",
      desc: "Institutional treasury and real-world asset rails with subscription, allocation, and reporting paths.",
      href: "https://doc.unykorn.org",
    },
    {
      title: "Aave Liquidity",
      tag: "DeFi / Lending",
      desc: "On-chain lending, collateralized borrowing, and yield routing integrated into treasury workflows.",
      href: "https://doc.unykorn.org",
    },
    {
      title: "Bitcoin Access",
      tag: "BTC / Treasury",
      desc: "Direct BTC policy-gated exposure, reserve visibility, wallet routing, and payment-triggered execution.",
      href: "https://doc.unykorn.org",
    },
    {
      title: "XRPL Settlement",
      tag: "XRPL",
      desc: "Fast issuance, trust-line aware transfers, deterministic audit state, and controlled operator movement.",
      href: "https://api.doc.unykorn.org",
    },
    {
      title: "Bond / Fixed Income",
      tag: "Debt / Structured",
      desc: "Broker-dealer distribution surfaces for bonds, fixed income programs, and controlled internal onboarding.",
      href: "https://admin.doc.unykorn.org",
    },
  ];

  const systemLinks = [
    { title: "Treasuries", sub: "Centrifuge / RWA", href: "https://doc.unykorn.org" },
    { title: "Aave", sub: "Liquidity Routing", href: "https://doc.unykorn.org" },
    { title: "Bitcoin", sub: "Reserve Controls", href: "https://doc.unykorn.org" },
    { title: "XRPL", sub: "Settlement Paths", href: "https://api.doc.unykorn.org" },
  ];

  const commandExamples = [
    "Issue 2 investor wallets and preload onboarding.",
    "Prepare a $250k treasury movement for approval.",
    "Open a broker-dealer deal room and route disclosures.",
    "Summarize pending compliance exceptions and next actions.",
  ];

  const glowByTone = {
    emerald: "from-emerald-400/25 to-cyan-400/10",
    amber: "from-amber-400/25 to-orange-400/10",
    blue: "from-blue-400/25 to-sky-400/10",
    purple: "from-violet-400/25 to-fuchsia-400/10",
  } as const;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020611] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(40,93,255,0.35),transparent_26%),radial-gradient(circle_at_80%_0%,rgba(15,52,122,0.32),transparent_28%),radial-gradient(circle_at_50%_75%,rgba(0,178,255,0.14),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:110px_110px]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-0 h-[32rem] w-[32rem] rounded-full bg-cyan-400/10 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <header className="mb-10 flex items-center justify-between rounded-[30px] border border-white/10 bg-white/[0.08] px-5 py-4 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div>
            <div className="text-[11px] uppercase tracking-[0.42em] text-blue-100/45">Doc OS</div>
            <div className="mt-1 text-lg font-semibold text-white/95">Abyss Runtime / Institutional Control Surface</div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-white/65 md:flex">
            <a href="#system" className="transition hover:text-cyan-200">System</a>
            <a href="#rails" className="transition hover:text-cyan-200">Rails</a>
            <a href="#activity" className="transition hover:text-cyan-200">Activity</a>
            <a href="#network" className="transition hover:text-cyan-200">Network</a>
            <a href="#access" className="transition hover:text-cyan-200">Access</a>
          </nav>
          <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200 backdrop-blur-xl">
            LIVE EDGE SURFACE
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-blue-200/10 bg-white/[0.07] px-3 py-1 text-xs uppercase tracking-[0.32em] text-blue-100/55 shadow-xl shadow-black/20 backdrop-blur-xl">
              private financial operating environment
            </div>
            <h1 className="max-w-5xl text-5xl font-semibold leading-[0.9] tracking-tight text-white md:text-7xl">
              Darker. Sharper. Liquid-glass control over wallets, treasuries, BTC, XRPL, and broker-dealer execution.
            </h1>
            <p className="mt-5 max-w-3xl text-base text-blue-50/65 md:text-lg">
              Public front door into the DOC network built to feel like an abyss-blue command deck with live issuance, directives, payments, approvals, and institutional routing surfaces.
            </p>

            <div className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl">
              <div className="mb-3 text-xs uppercase tracking-[0.28em] text-blue-100/40">AI Command Surface</div>
              <div className="group rounded-[24px] border border-white/10 bg-gradient-to-r from-white/10 via-white/[0.06] to-cyan-400/5 px-4 py-4 text-base text-white/80 transition hover:border-cyan-300/20 hover:bg-white/[0.1] md:text-lg">
                Ask Doc AI to execute across issuance, payments, compliance, treasuries, and routing...
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {commandExamples.map((item) => (
                  <button
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-blue-50/60 transition hover:border-cyan-300/20 hover:bg-cyan-300/10 hover:text-cyan-100"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[34px] border border-white/10 bg-white/[0.08] p-5 shadow-2xl shadow-black/25 backdrop-blur-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-blue-100/40">Operator Preview</div>
                <div className="mt-1 text-xl font-semibold text-white/95">Genesis / FTH Pay / x402</div>
              </div>
              <div className="rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1 text-xs text-blue-200">Guard Active</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300/20">
                  <div className="text-xs uppercase tracking-[0.22em] text-blue-100/38">{stat.label}</div>
                  <div className="mt-2 text-3xl font-semibold text-white">{stat.value}</div>
                  <div className="mt-1 text-sm text-blue-50/45">{stat.sub}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-blue-100/38">Execution Path</div>
                  <div className="mt-2 text-lg font-medium text-white/95">AI -&gt; Policy -&gt; FTH Pay -&gt; x402 -&gt; Settlement</div>
                </div>
                <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs text-amber-200">Approval First</div>
              </div>
            </div>
          </div>
        </section>

        <section id="system" className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={`${stat.label}-strip`}
              className="group rounded-[30px] border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/20 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/[0.08]"
            >
              <div className="text-xs uppercase tracking-[0.24em] text-blue-100/38">{stat.label}</div>
              <div className="mt-3 text-4xl font-semibold text-white">{stat.value}</div>
              <div className="mt-2 text-sm text-blue-50/45">{stat.sub}</div>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/20 backdrop-blur-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.26em] text-blue-100/40">Action Grid</div>
                <div className="mt-1 text-2xl font-semibold text-white/95">Immediate Control</div>
              </div>
              <div className="text-sm text-blue-50/45">interactive surface</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {actions.map((action) => (
                <button
                  key={action.title}
                  className="group rounded-[24px] border border-white/10 bg-black/20 px-4 py-5 text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-cyan-300/10"
                >
                  <div className="text-sm font-medium text-white/90">{action.title}</div>
                  <div className="mt-2 text-xs leading-5 text-blue-50/45">{action.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div id="activity" className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/20 backdrop-blur-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.26em] text-blue-100/40">Live Activity</div>
                <div className="mt-1 text-2xl font-semibold text-white/95">Recent System Movement</div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-blue-50/45">real-time style</div>
            </div>
            <div className="space-y-3">
              {activity.map((item) => (
                <div
                  key={`${item.time}-${item.title}`}
                  className={`flex gap-4 rounded-[24px] border border-white/10 bg-gradient-to-r ${glowByTone[item.tone]} p-[1px]`}
                >
                  <div className="flex w-full gap-4 rounded-[23px] bg-[#07101d]/95 p-4 backdrop-blur-xl transition hover:bg-[#091526]/95">
                    <div className="w-16 shrink-0 text-sm font-medium text-blue-50/45">{item.time}</div>
                    <div>
                      <div className="font-medium text-white/92">{item.title}</div>
                      <div className="mt-1 text-sm text-blue-50/50">{item.meta}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="rails" className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.26em] text-blue-100/40">Treasuries / BTC / Rails</div>
              <div className="mt-1 text-3xl font-semibold text-white/95">Real asset lanes and broker-dealer pathways.</div>
            </div>
            <div className="text-sm text-blue-50/45">click through surfaces</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {rails.map((rail) => (
              <a
                key={rail.title}
                href={rail.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-[30px] border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/20 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-cyan-300/10"
              >
                <div className="inline-flex rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-cyan-100/85">
                  {rail.tag}
                </div>
                <div className="mt-4 text-xl font-semibold text-white/95">{rail.title}</div>
                <p className="mt-3 text-sm leading-6 text-blue-50/52">{rail.desc}</p>
                <div className="mt-5 text-sm font-medium text-cyan-200/90">Open Surface -&gt;</div>
              </a>
            ))}
          </div>
        </section>

        <section id="network" className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[34px] border border-white/10 bg-gradient-to-br from-blue-500/12 via-white/[0.04] to-cyan-500/10 p-6 shadow-2xl shadow-black/25 backdrop-blur-2xl">
            <div className="text-xs uppercase tracking-[0.26em] text-blue-100/40">AI / Network</div>
            <div className="mt-1 text-3xl font-semibold text-white/95">The badass AI system should feel alive here.</div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-50/58">
              Doc AI should look like a dedicated internal team command interpretation, compliance review, routing, treasury prep, wallet issuance, and execution supervision in one visible layer.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {systemLinks.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-cyan-300/10"
                >
                  <div className="text-base font-medium text-white/92">{item.title}</div>
                  <div className="mt-1 text-sm text-blue-50/48">{item.sub}</div>
                </a>
              ))}
            </div>
          </div>

          <div id="access" className="rounded-[34px] border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/20 backdrop-blur-2xl">
            <div className="text-xs uppercase tracking-[0.26em] text-blue-100/40">Execution Controls</div>
            <div className="mt-1 text-2xl font-semibold text-white/95">Non-negotiable gates</div>
            <ul className="mt-5 space-y-3 text-sm text-blue-50/58">
              <li className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4">No payment execution without required approvals.</li>
              <li className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4">No compliance bypass in automated workflows.</li>
              <li className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4">No audit suppression during routing or settlement.</li>
              <li className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4">x402 operates under FTH Pay control only.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="https://doc.unykorn.org" target="_blank" rel="noopener noreferrer" className="rounded-[22px] bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90">
                Enter Runtime
              </a>
              <a href="/compliance" className="rounded-[22px] border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08]">
                Disclosures
              </a>
            </div>
          </div>
        </section>

        <footer className="mt-12 border-t border-white/10 py-8 text-sm text-blue-50/36">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold text-white/78">DOC OS</div>
              <div className="mt-1 max-w-2xl text-blue-50/36">
                Abyss-blue command-center front door for issuance, AI directives, FTH Pay, XRPL, BTC, treasuries, and controlled broker-dealer execution.
              </div>
            </div>
            <div className="max-w-xl text-right text-xs leading-6 text-blue-50/30">
              Securities, payments, treasury products, and digital asset workflows remain subject to policy, approval, and legal controls. Public site is informational; live runtime access is controlled.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
