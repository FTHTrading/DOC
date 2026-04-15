"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard", icon: "◉", color: "#1e3a5f" },
  { href: "/participants", label: "Participants", icon: "👥", color: "#10b981" },
  { href: "/deals", label: "Deal Rooms", icon: "🏛", color: "#f59e0b" },
  { href: "/compliance", label: "Compliance", icon: "⚖️", color: "#dc2626" },
  { href: "/intake", label: "Intake", icon: "📥", color: "#64748b" },
  { href: "/communications", label: "Communications", icon: "✉️", color: "#64748b" },
  { href: "/compensation", label: "Compensation", icon: "💰", color: "#f59e0b" },
  { href: "/workflows", label: "Workflows", icon: "⚡", color: "#7c3aed" },
  { href: "/agents", label: "AI Agents", icon: "🤖", color: "#7c3aed" },
  { href: "/reports", label: "Reports", icon: "📊", color: "#0ea5e9" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0f1e] border-r border-white/10 flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
            <span className="text-[#0ea5e9] font-bold">D</span>
          </div>
          <div>
            <div className="font-semibold text-sm">DOC Admin</div>
            <div className="text-white/40 text-xs">Operations Center</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-0.5">
          {NAV.map((item) => {
            const active = item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
                {active && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <div className="text-white/30 text-xs">DOC OS v0.1.0</div>
        <div className="text-white/20 text-xs">admin.doc.unykorn.org</div>
      </div>
    </aside>
  );
}
