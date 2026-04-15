export default function AgentsPage() {
  const agentTypes = [
    { slug: "intake-agent", name: "Intake Classifier", type: "Classification", color: "#64748b" },
    { slug: "compliance-agent", name: "Compliance Evaluator", type: "Regulatory", color: "#dc2626" },
    { slug: "identity-agent", name: "Identity Resolver", type: "KYC/KYB", color: "#1e3a5f" },
    { slug: "deal-agent", name: "Deal Coordinator", type: "Orchestration", color: "#f59e0b" },
    { slug: "comms-agent", name: "Communications Manager", type: "Messaging", color: "#94a3b8" },
    { slug: "comp-agent", name: "Comp Calculator", type: "Finance", color: "#f59e0b" },
    { slug: "reporting-agent", name: "Report Generator", type: "Analytics", color: "#0ea5e9" },
    { slug: "supervisor-agent", name: "Supervisory Monitor", type: "Oversight", color: "#dc2626" },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">AI Agents</h1>
          <p className="text-white/40 text-sm">Claude-powered agent definitions and run history</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {agentTypes.map((agent) => (
          <div
            key={agent.slug}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div
                  className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2"
                  style={{ background: `${agent.color}20`, color: agent.color }}
                >
                  {agent.type}
                </div>
                <h3 className="font-semibold">{agent.name}</h3>
                <p className="text-xs text-white/40 font-mono mt-0.5">{agent.slug}</p>
              </div>
              <button
                className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
                style={{ borderColor: `${agent.color}40`, color: agent.color }}
              >
                Run
              </button>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/30">
              <span>Last run: —</span>
              <span>Total runs: 0</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
