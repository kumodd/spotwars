import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Product Promotion Platform",
  description:
    "Promote your product on a live public board. Compete for position, capture attention, and get discovered by early adopters.",
};

export default function ProductPromotionPage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-16 w-full">
        <header className="mb-12 border-b border-bg-border pb-8 text-center sm:text-left">
          <p className="text-xs text-ink uppercase tracking-widest font-black mb-3">
            InternetBillboard.space
          </p>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight mb-4 uppercase">
            Product Promotion Platform
          </h1>
          <p className="text-ink-muted text-base font-bold uppercase tracking-wider leading-relaxed max-w-2xl">
            Put your product on a live public board, compete for position, and get discovered.
          </p>
        </header>

        <section className="mb-12">
          <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed mb-6">
            Promoting a startup shouldn't require complex ad campaigns. InternetBillboard.space simplifies product promotion by letting you directly buy rank on a public billboard.
          </p>
          
          <h2 className="font-display font-black text-2xl text-ink mt-10 mb-4 uppercase">
            How Promotion Works
          </h2>
          <ul className="space-y-4">
            {[
              "Pay an entry fee (starting at ₹49) to list your product.",
              "Your spend determines your exact rank on the billboard.",
              "Pay just ₹1 more than the product above you to overtake them.",
              "Gain exposure, traffic, and credibility by maintaining a high position."
            ].map((step, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span className="font-display font-black text-lg text-ink pt-0.5">{i+1}.</span>
                <span className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="text-center sm:text-left border-t border-bg-border pt-8 mt-12">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <Link href="/submit" className="btn-primary px-8 py-3">
              List Your Product
            </Link>
            <Link href="/how-it-works" className="text-xs font-bold text-ink-muted hover:text-ink uppercase tracking-wider">
              Read How It Works →
            </Link>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
