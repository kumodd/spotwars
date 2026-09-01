import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "For Founders — InternetBillboard.space",
  description:
    "Why product founders list on InternetBillboard.space. Exposure, competitive discovery, live traffic, and analytics.",
};

const reasons = [
  {
    title: "Exposure",
    body: "Your product is visible to every visitor who lands on the live board — no targeting required. The board itself is the discovery surface.",
  },
  {
    title: "Product discovery",
    body: "Founders, investors, and early adopters browse the board looking for new tools. Your listing works as a permanent, active presence.",
  },
  {
    title: "Competitive positioning",
    body: "See exactly how your product compares against competitors in the same category. Know their spend, rank, and momentum in real time.",
  },
  {
    title: "Traffic",
    body: "Higher position generates significantly more outbound clicks. The top 5 positions capture the majority of daily click volume.",
  },
  {
    title: "Real-time analytics",
    body: "Track clicks, impressions, CTR, position history, and momentum score. All data updates live — no waiting for reports.",
  },
  {
    title: "Public credibility",
    body: "A visible board position signals active traction. A product actively competing for attention is more credible than a static listing.",
  },
];

export default function ForFoundersPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16">

        {/* Header */}
        <div className="border-b border-bg-border pb-8 mb-12">
          <p className="text-xs text-ink uppercase tracking-widest font-black mb-3">
            For founders
          </p>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight mb-4 uppercase">
            Why list your product?
          </h1>
          <p className="text-ink-muted text-base font-bold uppercase tracking-wider leading-relaxed max-w-xl">
            InternetBillboard.space is not an ad platform. It is a live competitive board where
            products fight for position. Founders use it for exposure, intelligence,
            and traffic.
          </p>
        </div>

        {/* Reasons */}
        <div className="mb-16 border-t border-bg-border pt-4">
          {reasons.map((r, i) => (
            <div
              key={r.title}
              className={`flex flex-col sm:flex-row gap-2 sm:gap-6 py-6 ${i < reasons.length - 1 ? "border-b border-bg-border" : "border-b border-bg-border"
                }`}
            >
              <div className="flex-shrink-0 sm:w-10 pt-1">
                <span className="font-display font-black text-xl text-ink num">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <h2 className="font-display font-black text-xl text-ink mb-2 uppercase tracking-wide">
                  {r.title}
                </h2>
                <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed">{r.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard preview */}
        <div className="border border-bg-border bg-bg-surface overflow-hidden mb-12">
          <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border bg-bg">
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="text-xs font-black text-ink uppercase tracking-widest">
                Dashboard preview
              </span>
            </div>
            <span className="badge">Your product</span>
          </div>

          {/* Mock stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-b border-bg-border bg-bg">
            {[
              { label: "Board Rank", value: "#4", sub: "Global board" },
              { label: "Clicks today", value: "218", sub: "↑12% vs yesterday" },
              { label: "Impressions", value: "4.2K", sub: "from board views" },
              { label: "Attention spent", value: "₹2,840", sub: "total budget" },
            ].map((s, i, arr) => (
              <div key={s.label} className={`px-5 py-5 bg-bg-surface ${i < arr.length - 1 ? "border-r border-bg-border" : ""} ${i === 1 && "max-sm:border-r-0"} border-b sm:border-b-0 border-bg-border last:border-b-0`}>
                <div className="text-[10px] font-black uppercase tracking-widest text-ink mb-2">
                  {s.label}
                </div>
                <div className="stat-value text-2xl text-ink">{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Mock board position alert */}
          <div className="px-6 py-4 bg-bg">
            <p className="text-xs text-ink font-bold uppercase tracking-wider">
              <span className="text-ink font-black">⚠ Competitor alert:</span>{" "}
              <span className="text-ink-muted mx-1">Product X is ₹200 away from taking your position #4.</span>{" "}
              <button className="text-ink underline underline-offset-2 hover:text-ink-muted transition-colors">
                Boost budget →
              </button>
            </p>
          </div>
        </div>

        {/* Transparency notice */}
        <div className="border border-bg-border bg-bg-surface p-6 mb-12 text-center sm:text-left">
          <h3 className="text-sm font-black text-ink mb-3 uppercase tracking-widest">Transparency</h3>
          <p className="text-sm text-ink-muted font-bold uppercase tracking-wider leading-relaxed">
            <strong className="text-ink font-black">
              Paid placement determines board position. It is not a quality rating or
              endorsement.
            </strong>{" "}
            This is displayed publicly on every product page. Users who browse InternetBillboard.space
            understand the mechanic. We believe transparency builds trust.
          </p>
        </div>

        {/* Pricing */}
        <div className="border border-bg-border bg-bg-surface overflow-hidden mb-12">
          <div className="px-6 py-4 border-b border-bg-border bg-bg">
            <h3 className="text-sm font-black text-ink uppercase tracking-widest">Pricing</h3>
          </div>
          {[
            ["Entry fee", "₹49 minimum to list and enter the board"],
            ["Attention budget", "Your spend determines your rank. Start from ₹49."],
            ["Overtake", "Pay ₹1 more than the product above you to move up"],
            ["No subscription", "Pay only when you choose to compete or defend"],
            ["No monthly fees", "Your listing stays active as long as you have budget"],
          ].map(([term, val], i, arr) => (
            <div
              key={term}
              className={`flex flex-col sm:flex-row items-start gap-2 sm:gap-6 px-6 py-4 ${i < arr.length - 1 ? "border-b border-bg-border" : ""}`}
            >
              <dt className="text-xs font-black text-ink uppercase tracking-widest w-full sm:w-36 flex-shrink-0 pt-0.5">
                {term}
              </dt>
              <dd className="text-xs text-ink-muted font-bold uppercase tracking-wider leading-relaxed">{val}</dd>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-4">
          <div>
            <h3 className="font-display font-black text-2xl text-ink mb-2 uppercase tracking-tight">
              Enter the board
            </h3>
            <p className="text-ink-muted text-xs font-bold uppercase tracking-wider">
              ₹49 entry. Live immediately. No setup.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/how-it-works"
              className="text-xs font-bold text-ink hover:text-ink-muted transition-colors uppercase tracking-wider"
            >
              How it works →
            </Link>
            <Link
              href="/submit"
              id="founders-submit-btn"
              className="btn-primary px-6 py-3"
            >
              List Your Product
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
