import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "How It Works — InternetBillboard.space",
  description:
    "InternetBillboard.space is a live attention market where products compete for position. Learn how the ranking, bidding, and overtake mechanics work.",
};

const steps = [
  {
    n: "01",
    title: "LIST",
    body: "Put your product on the board. Submit your product profile with a ₹49 minimum entry. Your product goes live on the global board immediately.",
  },
  {
    n: "02",
    title: "COMPETE",
    body: "Products fight for position. Choose your starting attention budget. Your spend directly determines your rank — higher spend, higher position.",
  },
  {
    n: "03",
    title: "GET SEEN",
    body: "People discover products through the board. Higher position = more visibility = more clicks.",
  },
  {
    n: "04",
    title: "DEFEND",
    body: "When another product overtakes you, fight back. You can increase your spend to reclaim or defend your position.",
  },
  {
    n: "05",
    title: "WIN",
    body: "Climb the board and become one of the most visible products on the internet. Strategy and timing matter as much as budget.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16">

        {/* Header */}
        <div className="border-b border-bg-border pb-8 mb-12">
          <p className="text-xs text-ink uppercase tracking-widest font-black mb-3">
            Platform guide
          </p>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight mb-4 uppercase">
            How It Works
          </h1>
          <p className="text-ink-muted text-base font-bold uppercase tracking-wider leading-relaxed max-w-xl">
            InternetBillboard.space is a live attention market. Products compete for board position.
            Position is determined by spend. The market moves in real time.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-0 mb-16">
          {steps.map((step, i) => (
            <div
              key={step.n}
              className={`flex flex-col sm:flex-row gap-2 sm:gap-6 py-8 ${i < steps.length - 1 ? "border-b border-bg-border" : "border-b border-bg-border"
                }`}
            >
              <div className="flex-shrink-0 sm:w-12">
                <span className="font-display font-black text-xl text-ink">
                  {step.n}
                </span>
              </div>
              <div>
                <h2 className="font-display font-black text-2xl text-ink mb-2 uppercase tracking-wide">
                  — {step.title}
                </h2>
                <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Key mechanics */}
        <div className="border border-bg-border bg-bg-surface overflow-hidden mb-16">
          <div className="px-6 py-4 border-b border-bg-border">
            <h3 className="text-sm font-black text-ink uppercase tracking-widest">Key mechanics</h3>
          </div>
          {[
            ["Ranking", "Entirely determined by spend_on_board. Highest spend = highest position."],
            ["Overtake", "Pay ₹1 more than the product above you to take their position."],
            ["Defense", "You can defend your position by increasing your spend when attacked."],
            ["Live updates", "The board updates in real time — no page refresh needed."],
            ["Transparency", "Rank reflects spend, not product quality or editorial endorsement."],
            ["Clicks", "Click counts are publicly tracked. All data is visible on the board."],
          ].map(([term, def], i, arr) => (
            <div
              key={term}
              className={`flex flex-col sm:flex-row items-start gap-2 sm:gap-6 px-6 py-4 ${i < arr.length - 1 ? "border-b border-bg-border" : ""}`}
            >
              <dt className="text-xs font-black text-ink uppercase tracking-widest sm:w-32 flex-shrink-0 pt-0.5">
                {term}
              </dt>
              <dd className="text-xs text-ink-muted font-bold uppercase tracking-wider leading-relaxed">{def}</dd>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-4">
          <div>
            <h3 className="font-display font-black text-2xl text-ink uppercase tracking-tight mb-2">Ready to compete?</h3>
            <p className="text-ink-muted text-xs font-bold uppercase tracking-wider">
              List your product for ₹49. Enter the board. Start climbing.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-bold text-ink hover:text-ink-muted transition-colors uppercase tracking-wider"
            >
              See the board →
            </Link>
            <Link
              href="/submit"
              id="hiw-submit-btn"
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
