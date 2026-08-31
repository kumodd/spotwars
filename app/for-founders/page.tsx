import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "For Founders — SpotWars",
  description:
    "Why product founders list on SpotWars. Exposure, competitive discovery, live traffic, and analytics.",
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
    <div className="min-h-screen bg-[#0C0C0C]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-16">

        {/* Header */}
        <div className="border-b border-[#1A1A1A] pb-8 mb-10">
          <p className="text-xs text-[#555555] uppercase tracking-wider font-semibold mb-3">
            For founders
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight mb-3">
            Why list your product?
          </h1>
          <p className="text-[#666666] text-base leading-relaxed max-w-xl">
            SpotWars is not an ad platform. It is a live competitive board where
            products fight for position. Founders use it for exposure, intelligence,
            and traffic.
          </p>
        </div>

        {/* Reasons */}
        <div className="mb-10">
          {reasons.map((r, i) => (
            <div
              key={r.title}
              className={`flex gap-6 py-5 ${
                i < reasons.length - 1 ? "border-b border-[#1A1A1A]" : ""
              }`}
            >
              <div className="flex-shrink-0 w-10">
                <span className="text-xs text-[#333333] font-semibold num">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <h2 className="font-display font-semibold text-base text-white mb-1.5">
                  {r.title}
                </h2>
                <p className="text-[#777777] text-sm leading-relaxed">{r.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard preview */}
        <div className="border border-[#1A1A1A] rounded-sm bg-[#111111] overflow-hidden mb-10">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="text-xs font-semibold text-[#888888] uppercase tracking-wide">
                Dashboard preview
              </span>
            </div>
            <span className="badge">Your product</span>
          </div>

          {/* Mock stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1A1A1A]">
            {[
              { label: "Board Rank", value: "#4", sub: "Global board" },
              { label: "Clicks today", value: "218", sub: "↑12% vs yesterday" },
              { label: "Impressions", value: "4.2K", sub: "from board views" },
              { label: "Attention spent", value: "₹2,840", sub: "total budget" },
            ].map((s) => (
              <div key={s.label} className="px-4 py-4 bg-[#111111]">
                <div className="text-[10px] uppercase tracking-wider text-[#444444] mb-1 font-semibold">
                  {s.label}
                </div>
                <div className="stat-value text-lg text-[#F0F0F0]">{s.value}</div>
                <div className="text-[10px] text-[#3A3A3A] mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Mock board position alert */}
          <div className="px-4 py-3 border-t border-[#1A1A1A] bg-[#0E0E0E]">
            <p className="text-xs text-[#666666]">
              <span className="text-[#EF4444] font-semibold">⚠ Competitor alert:</span>{" "}
              <span className="text-[#888888]">Product X is ₹200 away from taking your position #4.</span>{" "}
              <button className="text-[#E85D27] hover:text-[#D44E1E] font-medium transition-colors">
                Boost budget →
              </button>
            </p>
          </div>
        </div>

        {/* Transparency notice */}
        <div className="border border-[#2A2A2A] rounded-sm bg-[#111111] p-5 mb-10">
          <h3 className="text-sm font-semibold text-[#CCCCCC] mb-2">Transparency</h3>
          <p className="text-sm text-[#666666] leading-relaxed">
            <strong className="text-[#AAAAAA]">
              Paid placement determines board position. It is not a quality rating or
              endorsement.
            </strong>{" "}
            This is displayed publicly on every product page. Users who browse SpotWars
            understand the mechanic. We believe transparency builds trust.
          </p>
        </div>

        {/* Pricing */}
        <div className="border border-[#1A1A1A] rounded-sm overflow-hidden bg-[#111111] mb-10">
          <div className="px-5 py-3 border-b border-[#1A1A1A]">
            <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Pricing</h3>
          </div>
          {[
            ["Entry fee", "₹49 minimum to list and enter the board"],
            ["Attention budget", "Your spend determines your rank. Start from ₹49."],
            ["Overtake", "Pay ₹1 more than the product above you to move up"],
            ["No subscription", "Pay only when you choose to compete or defend"],
            ["No monthly fees", "Your listing stays active as long as you have budget"],
          ].map(([term, val]) => (
            <div
              key={term}
              className="flex items-start gap-4 px-5 py-3.5 border-b border-[#0C0C0C] last:border-b-0"
            >
              <dt className="text-xs font-semibold text-[#CCCCCC] w-28 flex-shrink-0 pt-0.5">
                {term}
              </dt>
              <dd className="text-xs text-[#666666] leading-relaxed">{val}</dd>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-[#1A1A1A] pt-8">
          <div>
            <h3 className="font-display font-semibold text-white mb-1">
              Enter the board
            </h3>
            <p className="text-[#555555] text-sm">
              ₹49 entry. Live immediately. No setup.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/how-it-works"
              className="text-sm text-[#555555] hover:text-[#CCCCCC] transition-colors"
            >
              How it works →
            </Link>
            <Link
              href="/submit"
              id="founders-submit-btn"
              className="btn-primary px-4 py-2 rounded-sm text-sm font-semibold"
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
