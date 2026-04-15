"use client";

import { useMemo, useState } from "react";

type ActivityItem = {
  id: string;
  text: string;
  level: "info" | "success" | "warning";
  at: string;
};

type CommandLog = {
  id: string;
  command: string;
  status: "queued" | "executed";
  output: string;
  at: string;
};

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const initialActivity: ActivityItem[] = [
  { id: "a1", text: "Investor onboarded", level: "success", at: nowTime() },
  { id: "a2", text: "Payment pending approval", level: "warning", at: nowTime() },
  { id: "a3", text: "AI executed compliance check", level: "info", at: nowTime() },
];

const initialLogs: CommandLog[] = [
  {
    id: "c1",
    command: "Send 25000 to investor wallet",
    status: "executed",
    output: "Created payment request and routed to approval queue.",
    at: nowTime(),
  },
  {
    id: "c2",
    command: "Preview payout to partner account",
    status: "executed",
    output: "Preview generated with controls: approval_required, compliance_clearance_required.",
    at: nowTime(),
  },
];

export default function HomePage() {
  const [command, setCommand] = useState("");
  const [wallets, setWallets] = useState(124);
  const [approvals, setApprovals] = useState(7);
  const [tasks, setTasks] = useState(3);
  const [activity, setActivity] = useState<ActivityItem[]>(initialActivity);
  const [logs, setLogs] = useState<CommandLog[]>(initialLogs);

  const stats = useMemo(
    () => [
      { label: "Active Wallets", value: wallets, tone: "text-[#7bf4c3]" },
      { label: "Pending Approvals", value: approvals, tone: "text-[#ffd48a]" },
      { label: "AI Tasks Running", value: tasks, tone: "text-[#9adfff]" },
      { label: "Recent Activity", value: activity.length, tone: "text-[#ffbab8]" },
    ],
    [wallets, approvals, tasks, activity.length],
  );

  const pushActivity = (text: string, level: ActivityItem["level"]) => {
    setActivity((prev) => [{ id: crypto.randomUUID(), text, level, at: nowTime() }, ...prev].slice(0, 8));
  };

  const runCommand = () => {
    const next = command.trim();
    if (!next) return;

    const log: CommandLog = {
      id: crypto.randomUUID(),
      command: next,
      status: "executed",
      output: "Intent parsed. Policy checks passed. Added to supervised execution queue.",
      at: nowTime(),
    };

    setLogs((prev) => [log, ...prev].slice(0, 8));
    pushActivity(`Command executed: ${next}`, "info");
    setTasks((n) => Math.max(1, n + 1));

    if (/send|payment|transfer/i.test(next)) {
      setApprovals((n) => n + 1);
      pushActivity("Payment request created and awaiting approval", "warning");
    }

    if (/wallet|issue/i.test(next)) {
      setWallets((n) => n + 1);
      pushActivity("Wallet issued under controlled execution policy", "success");
    }

    setCommand("");
  };

  const quickAction = (action: "wallet" | "ai" | "onboard" | "payment" | "deal") => {
    if (action === "wallet") {
      setWallets((n) => n + 1);
      pushActivity("Wallet issued", "success");
      const walletLog: CommandLog = {
        id: crypto.randomUUID(),
        command: "Issue wallet",
        status: "executed",
        output: "Wallet created and bound to controlled policy mode.",
        at: nowTime(),
      };
      setLogs((prev) => [
        walletLog,
        ...prev,
      ].slice(0, 8));
      return;
    }

    if (action === "ai") {
      setTasks((n) => n + 1);
      pushActivity("AI command started", "info");
      const aiLog: CommandLog = {
        id: crypto.randomUUID(),
        command: "Run AI command",
        status: "queued",
        output: "Queued for supervised execution.",
        at: nowTime(),
      };
      setLogs((prev) => [
        aiLog,
        ...prev,
      ].slice(0, 8));
      return;
    }

    if (action === "onboard") {
      pushActivity("Onboarding flow opened", "info");
      return;
    }

    if (action === "payment") {
      setApprovals((n) => n + 1);
      pushActivity("Payment prepared and awaiting approval", "warning");
      const paymentLog: CommandLog = {
        id: crypto.randomUUID(),
        command: "Send payment",
        status: "queued",
        output: "Payment request queued at FTH Pay gate.",
        at: nowTime(),
      };
      setLogs((prev) => [
        paymentLog,
        ...prev,
      ].slice(0, 8));
      return;
    }

    pushActivity("Deal room opened", "info");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 pb-24 pt-12">
      <section className="rounded-3xl border border-white/10 bg-[#081628]/85 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.45)] md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-[#96e8ff]">DOC OS</div>
            <h1 className="mt-2 text-5xl font-extrabold leading-none text-white md:text-7xl">Command Surface</h1>
            <p className="mt-3 text-lg text-white/65">Institutional Operating System</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="rounded-xl border border-[#14b87a]/35 bg-[#14b87a]/12 px-4 py-2 text-sm font-semibold text-[#a6f5d2]">
              Controlled Execution Active
            </div>
            <div className="rounded-lg border border-[#f2b445]/35 bg-[#f2b445]/10 px-3 py-1 text-xs uppercase tracking-[0.12em] text-[#ffe09d]">
              Static Demo Mode (Pages)
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runCommand();
            }}
            placeholder="Ask Doc AI to execute..."
            className="h-14 w-full rounded-xl border border-white/20 bg-[#0a1e34] px-5 text-base text-white outline-none transition focus:border-[#5ce8f5]"
          />
          <button
            onClick={runCommand}
            className="h-14 rounded-xl bg-[#1cc5d8] px-6 text-sm font-bold text-[#072030] transition hover:bg-[#64e9f7]"
          >
            Run
          </button>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <article key={s.label} className="rounded-2xl border border-white/10 bg-[#0b1a2c]/80 p-5">
            <div className="text-xs uppercase tracking-[0.14em] text-white/45">{s.label}</div>
            <div className={`mt-2 text-4xl font-bold ${s.tone}`}>{s.value}</div>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-white/10 bg-[#0b1a2c]/80 p-6">
          <h2 className="text-sm uppercase tracking-[0.14em] text-[#9adfff]">Action Grid</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <button onClick={() => quickAction("wallet")} className="rounded-xl border border-[#7bf4c3]/35 bg-[#7bf4c3]/10 p-4 text-left transition hover:bg-[#7bf4c3]/18">
              <div className="text-lg font-semibold">Issue Wallet</div>
              <div className="mt-1 text-sm text-white/65">Create and bind controlled wallet policy</div>
            </button>
            <button onClick={() => quickAction("ai")} className="rounded-xl border border-[#9adfff]/35 bg-[#9adfff]/10 p-4 text-left transition hover:bg-[#9adfff]/18">
              <div className="text-lg font-semibold">Run AI Command</div>
              <div className="mt-1 text-sm text-white/65">Queue supervised instruction execution</div>
            </button>
            <button onClick={() => quickAction("onboard")} className="rounded-xl border border-[#c8b4ff]/35 bg-[#c8b4ff]/10 p-4 text-left transition hover:bg-[#c8b4ff]/18">
              <div className="text-lg font-semibold">Start Onboarding</div>
              <div className="mt-1 text-sm text-white/65">Open investor or issuer intake flow</div>
            </button>
            <button onClick={() => quickAction("payment")} className="rounded-xl border border-[#ffd48a]/35 bg-[#ffd48a]/10 p-4 text-left transition hover:bg-[#ffd48a]/18">
              <div className="text-lg font-semibold">Send Payment</div>
              <div className="mt-1 text-sm text-white/65">Create payment request at FTH Pay gate</div>
            </button>
            <button onClick={() => quickAction("deal")} className="rounded-xl border border-[#ffbab8]/35 bg-[#ffbab8]/10 p-4 text-left transition hover:bg-[#ffbab8]/18 md:col-span-2">
              <div className="text-lg font-semibold">Open Deal Room</div>
              <div className="mt-1 text-sm text-white/65">Launch controlled deal operations workspace</div>
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#0b1a2c]/80 p-6">
          <h2 className="text-sm uppercase tracking-[0.14em] text-[#9adfff]">Activity Feed</h2>
          <div className="mt-4 space-y-3">
            {activity.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-white/85">{item.text}</p>
                  <span className="text-xs text-white/45">{item.at}</span>
                </div>
                <div className="mt-2">
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${
                      item.level === "success"
                        ? "bg-[#14b87a]/25 text-[#98f2cf]"
                        : item.level === "warning"
                          ? "bg-[#f2b445]/25 text-[#ffe09d]"
                          : "bg-[#1cc5d8]/25 text-[#9cf3ff]"
                    }`}
                  >
                    {item.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-[#0b1a2c]/80 p-6">
        <h2 className="text-sm uppercase tracking-[0.14em] text-[#9adfff]">AI Panel</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium">Command</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Output</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-white/5">
                  <td className="px-3 py-3 text-white/55">{log.at}</td>
                  <td className="px-3 py-3 text-white/90">{log.command}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${
                        log.status === "executed"
                          ? "bg-[#14b87a]/25 text-[#98f2cf]"
                          : "bg-[#f2b445]/25 text-[#ffe09d]"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-white/65">{log.output}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
