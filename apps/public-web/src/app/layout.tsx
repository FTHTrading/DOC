import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DOC — Institutional Broker-Dealer Platform",
  description: "Institutional-grade distribution, compliance, and orchestration for securities offerings.",
  metadataBase: new URL(process.env["NEXT_PUBLIC_URL"] ?? "https://doc.unykorn.org"),
  openGraph: {
    title: "DOC Platform",
    description: "Regulated securities distribution with AI-powered compliance.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0f1e] text-white font-sans antialiased">
        <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-[#0a0f1e]/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <span className="text-[#0ea5e9] font-bold text-sm">D</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">DOC Platform</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <a href="/investors" className="hover:text-white transition-colors">Investors</a>
            <a href="/issuers" className="hover:text-white transition-colors">Issuers</a>
            <a href="/partners" className="hover:text-white transition-colors">Partners</a>
            <a href="/compliance" className="hover:text-white transition-colors">Disclosures</a>
            <a
              href="/onboard"
              className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#1e3a5f]/80 transition-colors"
            >
              Get Started
            </a>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-white/10 px-6 py-12 mt-24">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-white/40">
            <div>
              <div className="text-white font-semibold mb-3">DOC Platform</div>
              <p>Institutional broker-dealer services. Securities offered through registered representatives.</p>
            </div>
            <div>
              <div className="text-white/70 font-medium mb-3">Platform</div>
              <div className="space-y-2">
                <a href="/investors" className="block hover:text-white transition-colors">For Investors</a>
                <a href="/issuers" className="block hover:text-white transition-colors">For Issuers</a>
                <a href="/partners" className="block hover:text-white transition-colors">For Partners</a>
              </div>
            </div>
            <div>
              <div className="text-white/70 font-medium mb-3">Compliance</div>
              <div className="space-y-2">
                <a href="/compliance" className="block hover:text-white transition-colors">Disclosures</a>
                <a href="/compliance#crs" className="block hover:text-white transition-colors">Form CRS</a>
                <a href="/compliance#adv" className="block hover:text-white transition-colors">ADV Part 2</a>
              </div>
            </div>
            <div>
              <div className="text-white/70 font-medium mb-3">Legal</div>
              <p className="text-xs leading-relaxed">
                DOC Platform is a registered broker-dealer. Securities products are not FDIC insured,
                not bank guaranteed, and may lose value. Past performance is not indicative of future results.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
