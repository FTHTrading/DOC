"use client";
import { useState } from "react";
import Link from "next/link";

export default function OnboardPage() {
  const [type, setType] = useState<"investor" | "issuer" | "partner">("investor");
  const [step, setStep] = useState<"form" | "submitted">("form");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    content: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const typeMap: Record<typeof type, "investor_inquiry" | "issuer_inquiry" | "partner_request"> = {
      investor: "investor_inquiry",
      issuer: "issuer_inquiry",
      partner: "partner_request",
    };

    try {
      const apiUrl = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";
      const res = await fetch(`${apiUrl}/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submitterName: form.name,
          submitterEmail: form.email,
          submitterPhone: form.phone || undefined,
          intakeType: typeMap[type],
          channel: "web",
          content: form.content,
        }),
      });

      if (res.ok) {
        setStep("submitted");
      } else {
        alert("Submission failed. Please try again or email us directly.");
      }
    } catch {
      alert("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "submitted") {
    return (
      <div className="max-w-lg mx-auto px-6 pt-24 pb-24 text-center">
        <div className="w-16 h-16 bg-[#10b981]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
        <h1 className="text-3xl font-bold mb-4 text-[#10b981]">Inquiry Received</h1>
        <p className="text-white/60 leading-relaxed mb-8">
          Thank you for your interest. A licensed representative will review your submission and
          contact you within one business day. All inquiries are handled confidentially.
        </p>
        <Link href="/" className="text-[#0ea5e9] hover:underline">← Return to home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pt-16 pb-24">
      <h1 className="text-4xl font-bold mb-2">Get Started</h1>
      <p className="text-white/60 mb-8">Tell us about yourself and how we can help.</p>

      {/* Type selector */}
      <div className="flex gap-2 mb-8">
        {(["investor", "issuer", "partner"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              type === t
                ? "bg-[#1e3a5f] text-white"
                : "border border-white/20 text-white/50 hover:border-white/40"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm text-white/70 mb-2">Full Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#0ea5e9] transition-colors"
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-2">Email Address *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#0ea5e9] transition-colors"
            placeholder="jane@example.com"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-2">Phone Number</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#0ea5e9] transition-colors"
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-2">
            {type === "investor"
              ? "Tell us about your investment objectives and accreditation status *"
              : type === "issuer"
              ? "Describe your offering and capital raise goals *"
              : "Describe your firm and how you'd like to partner *"}
          </label>
          <textarea
            required
            rows={5}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#0ea5e9] transition-colors resize-none"
            placeholder="Please provide details..."
          />
        </div>
        <p className="text-xs text-white/40 leading-relaxed">
          By submitting, you acknowledge this is preliminary inquiry only and does not constitute
          an offer to purchase securities. All submissions are subject to our Privacy Policy.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#1e3a5f] hover:bg-[#1e3a5f]/80 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {submitting ? "Submitting…" : "Submit Inquiry"}
        </button>
      </form>
    </div>
  );
}
