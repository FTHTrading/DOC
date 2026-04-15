import type { Metadata } from "next";
import Link from "next/link";
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
      <body className="text-white antialiased">
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#081121]/85 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="pulse-border flex h-9 w-9 items-center justify-center rounded-lg border border-[#1cc5d8]/30 bg-[#12324b]">
                <span className="text-sm font-extrabold text-[#1cc5d8]">D</span>
              </div>
              <div>
                <div className="text-base font-semibold tracking-tight">DOC Platform</div>
                <div className="text-xs text-white/45">Programmable Financial Execution System</div>
              </div>
            </Link>
            <Link
              href="/onboard"
              className="rounded-lg border border-[#1cc5d8]/40 bg-[#1cc5d8]/10 px-4 py-2 text-sm font-semibold text-[#93f5ff] transition-colors hover:bg-[#1cc5d8]/20"
            >
              Request Access
            </Link>
          </div>
          <div className="overflow-x-auto border-t border-white/5">
            <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-6 py-3 text-sm text-white/70">
              <Link href="/" className="rounded-md px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white">Home</Link>
              <Link href="/system" className="rounded-md px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white">System</Link>
              <Link href="/investors" className="rounded-md px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white">Investors</Link>
              <Link href="/issuers" className="rounded-md px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white">Issuers</Link>
              <Link href="/partners" className="rounded-md px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white">Partners</Link>
              <Link href="/compliance" className="rounded-md px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white">Disclosures</Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="mt-24 border-t border-white/10 px-6 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 text-xs text-white/45 md:flex-row md:items-center">
            <div>
              <div className="text-white/80 font-semibold mb-2">Legal and Disclosures</div>
              <p className="max-w-3xl leading-relaxed">
                DOC Platform is a broker-dealer operating surface. Securities products are not FDIC insured,
                not bank guaranteed, and may lose value. Past performance is not indicative of future results.
              </p>
            </div>
            <div className="flex items-center gap-4 text-white/60">
              <Link href="/compliance" className="hover:text-white transition-colors">Disclosures</Link>
              <Link href="/compliance#crs" className="hover:text-white transition-colors">Form CRS</Link>
              <Link href="/compliance#adv" className="hover:text-white transition-colors">ADV Part 2</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
