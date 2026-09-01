import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Online Billboard for Products",
  description:
    "An online digital billboard built specifically for products, SaaS, and startups to gain visibility and traffic.",
};

export default function OnlineBillboardPage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-16 w-full">
        <header className="mb-12 border-b border-bg-border pb-8 text-center sm:text-left">
          <p className="text-xs text-ink uppercase tracking-widest font-black mb-3">
            InternetBillboard.space
          </p>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight mb-4 uppercase">
            Online Billboard Platform
          </h1>
          <p className="text-ink-muted text-base font-bold uppercase tracking-wider leading-relaxed max-w-2xl">
            The digital billboard for internet products.
          </p>
        </header>

        <section className="mb-12">
          <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed mb-6">
            A traditional physical billboard costs thousands of dollars and reaches people driving down a highway who can't easily click to view your product.
          </p>
          <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed mb-6">
            InternetBillboard.space is a modern <strong>online billboard</strong>. It reaches a targeted audience of early adopters, tech enthusiasts, and investors. Because it's digital, viewers are just one click away from your website.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="border border-bg-border bg-bg-surface p-6">
            <h3 className="font-display font-black text-xl text-ink mb-3 uppercase">Instant ROI</h3>
            <p className="text-ink-muted text-xs font-bold uppercase tracking-wider leading-relaxed">
              See live traffic and clicks directly from the board. Monitor exactly how your spend translates into attention.
            </p>
          </div>
          <div className="border border-bg-border bg-bg-surface p-6">
            <h3 className="font-display font-black text-xl text-ink mb-3 uppercase">Competitive</h3>
            <p className="text-ink-muted text-xs font-bold uppercase tracking-wider leading-relaxed">
              Don't just rent space. Overtake your competitors and claim the top spot to prove your momentum.
            </p>
          </div>
        </div>

        <div className="text-center sm:text-left border-t border-bg-border pt-8">
          <Link href="/" className="btn-primary px-8 py-3">
            Explore The Live Board
          </Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}
