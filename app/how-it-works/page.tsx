import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "How It Works — SpotWars",
  description:
    "SpotWars is a live attention market where products compete for position. Learn how the ranking, bidding, and overtake mechanics work.",
};

const steps = [
  {
    n: "01",
    title: "List your product",
    body: "Submit your product profile with a ₹49 minimum entry. Your product goes live on the global board immediately.",
  },
  {
    n: "02",
    title: "Enter the board",
    body: "Choose your starting attention budget. Your spend directly determines your rank — higher spend, higher position.",
  },
  {
    n: "03",
    title: "Compete",
    body: "Other products can outbid your position at any time. The board updates live. Positions are never permanent.",
  },
  {
    n: "04",
    title: "Defend",
    body: "When a competitor challenges your rank, you can increase your spend to reclaim or defend your position.",
  },
  {
    n: "05",
    title: "Get discovered",
    body: "Users browse the live board and click through to products. Higher position = more visibility = more clicks.",
  },
  {
    n: "06",
    title: "Win attention",
    body: "Rise through the rankings. Reach #1. The board is a live market — strategy and timing matter as much as budget.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-16">

        {/* Header */}
        <div className="border-b border-[#1A1A1A] pb-8 mb-10">
          <p className="text-xs text-[#555555] uppercase tracking-wider font-semibold mb-3">
            Platform guide
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight mb-3">
            How SpotWars Works
          </h1>
          <p className="text-[#666666] text-base leading-relaxed max-w-xl">
            SpotWars is a live attention market. Products compete for board position.
            Position is determined by spend. The market moves in real time.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-0 mb-12">
          {steps.map((step, i) => (
            <div
              key={step.n}
              className={`flex gap-6 py-6 ${
                i < steps.length - 1 ? "border-b border-[#1A1A1A]" : ""
              }`}
            >
              <div className="flex-shrink-0 w-10">
                <span className="font-display font-bold text-sm text-[#333333] num">
                  {step.n}
                </span>
              </div>
              <div>
                <h2 className="font-display font-semibold text-lg text-white mb-1.5">
                  {step.title}
                </h2>
                <p className="text-[#777777] text-sm leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Position example */}
        <div className="border border-[#1A1A1A] rounded-sm bg-[#111111] p-6 mb-10">
          <p className="text-xs text-[#555555] uppercase tracking-wider font-semibold mb-5">
            Example — a product climbing the board
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {["#14", "#9", "#5", "#2", "#1"].map((pos, i, arr) => (
              <div key={pos} className="flex items-center gap-2">
                <div
                  className={`px-3 py-2 rounded-sm border text-sm font-display font-bold num ${
                    pos === "#1"
                      ? "border-[#D4A017] bg-[#D4A01710] text-[#D4A017]"
                      : pos === "#2"
                      ? "border-[#3A3A3A] bg-[#181818] text-[#94A3B8]"
                      : "border-[#242424] bg-[#181818] text-[#555555]"
                  }`}
                >
                  {pos}
                </div>
                {i < arr.length - 1 && (
                  <span className="text-[#333333] text-sm">→</span>
                )}
              </div>
            ))}
            <span className="text-[#D4A017] text-sm font-semibold ml-2">👑</span>
          </div>
          <p className="text-xs text-[#444444] mt-4">
            Each upward move requires outbidding the product currently at that position.
          </p>
        </div>

        {/* Key mechanics */}
        <div className="border border-[#1A1A1A] rounded-sm bg-[#111111] overflow-hidden mb-12">
          <div className="px-5 py-3 border-b border-[#1A1A1A]">
            <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Key mechanics</h3>
          </div>
          {[
            ["Ranking", "Entirely determined by spend_on_board. Highest spend = highest position."],
            ["Overtake", "Pay ₹1 more than the product above you to take their position."],
            ["Defense", "You can defend your position by increasing your spend when attacked."],
            ["Live updates", "The board updates in real time — no page refresh needed."],
            ["Transparency", "Rank reflects spend, not product quality or editorial endorsement."],
            ["Clicks", "Click counts are publicly tracked. All data is visible on the board."],
          ].map(([term, def]) => (
            <div
              key={term}
              className="flex items-start gap-4 px-5 py-3.5 border-b border-[#0C0C0C] last:border-b-0"
            >
              <dt className="text-xs font-semibold text-[#CCCCCC] w-24 flex-shrink-0 pt-0.5">
                {term}
              </dt>
              <dd className="text-xs text-[#666666] leading-relaxed">{def}</dd>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-[#1A1A1A] pt-8">
          <div>
            <h3 className="font-display font-semibold text-white mb-1">Ready to compete?</h3>
            <p className="text-[#555555] text-sm">
              List your product for ₹49. Enter the board. Start climbing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-[#555555] hover:text-[#CCCCCC] transition-colors"
            >
              See the board →
            </Link>
            <Link
              href="/submit"
              id="hiw-submit-btn"
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
