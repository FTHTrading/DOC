import type { Metadata } from "next";
import "./globals.css";
import { AdminSidebar } from "../components/AdminSidebar";

export const metadata: Metadata = {
  title: "DOC Admin — Broker-Dealer Operations",
  description: "Internal operations dashboard for DOC platform.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#060b14] text-white antialiased flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 ml-64 min-h-screen overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
