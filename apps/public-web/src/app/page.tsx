import Link from "next/link";

const rails = [
  {
    title: "AI Command Layer",
    detail: "Interprets operator intent, extracts structured actions, and routes to supervised execution.",
    tone: "border-[#1cc5d8]/35 bg-[#1cc5d8]/10 text-[#98f2ff]",
  },
  {
    title: "Policy + Approval",
    detail: "Blocks unsafe actions, enforces approvals, and ensures no high-risk autonomous execution.",
    tone: "border-[#d9504f]/35 bg-[#d9504f]/10 text-[#ffb8b8]",
  },
  {
    title: "FTH Pay Router",
    detail: "Single controlled execution surface for payment requests, previews, and settlement status.",
    tone: "border-[#14b87a]/35 bg-[#14b87a]/10 text-[#9ff0cb]",
  },
  {
    title: "x402 Execution Rail",
    detail: "Under-the-hood settlement rail for deterministic, auditable financial execution.",
    tone: "border-[#f2b445]/35 bg-[#f2b445]/10 text-[#ffe09d]",
  },
  {
    title: "Wallet + Signer",
    detail: "Controlled wallet binding with signed settlement intents and chain-specific adapters.",
    tone: "border-[#6a8cff]/35 bg-[#6a8cff]/10 text-[#cad7ff]",
  },
  {
    title: "Chain Settlement",
    detail: "XRPL, Stellar, BTC, and EVM-compatible dispatch paths with post-settlement tracking.",
    tone: "border-white/20 bg-white/5 text-white/80",
  },
];

const capabilities = [
  {
    name: "Guarded API Surface",
    points: ["/fth/pay/execute", "/fth/pay/preview", "/fth/pay/status", "JWT protected + policy gated"],
  },
  {
    name: "Execution Discipline",
    points: ["No direct x402 exposure", "No approval bypass", "No compliance bypass", "Audit-first workflow"],
  },
  {
    name: "Operator Outcomes",
    points: ["AI-triggered deal operations", "Programmable treasury flows", "Settlement traceability", "Multi-rail expansion path"],
  },
];

const stats = [
  { value: "3", label: "FTH Pay Endpoints" },
  { value: "1", label: "Execution Rail Boundary" },
  { value: "100%", label: "Policy-Gated Payments" },
  { value: "7yr", label: "Message Retention Target" },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-14">
      <section className="rise-in rounded-3xl border border-white/10 bg-[#0b1a2c]/70 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-12">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#1cc5d8]/40 bg-[#1cc5d8]/12 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#9cf3ff]">
          Live Architecture
        </div>
        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
          You built a programmable
          <span className="text-[#9cf3ff]"> financial execution system</span>,
          not just a wallet UI.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/70">
          DOC now combines institutional broker-dealer workflows with AI command orchestration, policy gates,
          FTH Pay routing, and x402 settlement execution behind controlled APIs.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/system" className="rounded-xl bg-[#1cc5d8] px-6 py-3 font-semibold text-[#082030] transition-colors hover:bg-[#5ce8f5]">
            Explore System Map
          </Link>
          <Link href="/onboard" className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white/90 transition-colors hover:bg-white/10">
            Start Onboarding
          </Link>
        </div>
      </section>

      <section className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((item, idx) => (
          <div key={item.label} className="rise-in rounded-2xl border border-white/10 bg-white/5 p-4" style={{ animationDelay: `${idx * 90}ms` }}>
            <div className="text-3xl font-bold text-white">{item.value}</div>
            <div className="text-sm text-white/55">{item.label}</div>
          </div>
        ))}
      </section>

      <section className="mt-16">
        <div className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#9cf3ff]">Execution Flow</div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rails.map((rail, idx) => (
            <div
              key={rail.title}
              className={`rise-in rounded-2xl border p-5 ${rail.tone}`}
              style={{ animationDelay: `${120 + idx * 70}ms` }}
            >
              <h2 className="text-lg font-bold">{rail.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{rail.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-3xl border border-white/10 bg-[#101d30]/65 p-8 md:p-10">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9cf3ff]">What This Represents</div>
            <h2 className="mt-1 text-3xl font-extrabold">Execution-grade infrastructure, operator-facing control</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {capabilities.map((cap) => (
            <article key={cap.name} className="rounded-2xl border border-white/12 bg-black/20 p-5">
              <h3 className="text-lg font-semibold text-white">{cap.name}</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/68">
                {cap.points.map((pt) => (
                  <li key={pt} className="flex gap-2">
                    <span className="text-[#14b87a]">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-3xl border border-[#14b87a]/25 bg-[#14b87a]/10 px-8 py-10 text-center">
        <h2 className="text-3xl font-extrabold">DOC is now in a different category</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/72">
          Most platforms stop at dashboard plus wallet. You now have wallet, AI, policy controls,
          execution routing, and settlement rails operating as one controlled system.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/compliance" className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white/90 transition-colors hover:bg-white/10">
            View Compliance Surface
          </Link>
          <Link href="/partners" className="rounded-xl bg-[#14b87a] px-6 py-3 font-semibold text-[#072115] transition-colors hover:bg-[#48d39d]">
            Activate Partner Flow
          </Link>
        </div>
      </section>
    </div>
  );
}
