import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Discover New Products",
  description:
    "Discover new products, SaaS, and startups competing on the live internet billboard. See what's trending and find your next favorite tool.",
};

export default function ProductDiscoveryPage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-16 w-full">
        <header className="mb-12 border-b border-bg-border pb-8 text-center sm:text-left">
          <p className="text-xs text-ink uppercase tracking-widest font-black mb-3">
            InternetBillboard.space
          </p>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight mb-4 uppercase">
            Product Discovery
          </h1>
          <p className="text-ink-muted text-base font-bold uppercase tracking-wider leading-relaxed max-w-2xl">
            Find the next big thing before it goes mainstream.
          </p>
        </header>

        <section className="mb-12">
          <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed mb-6">
            InternetBillboard.space is a transparent marketplace of attention. Products aren't ranked by hidden algorithms—they're ranked by the founders who believe in them enough to pay for visibility.
          </p>
          <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed mb-6">
            For early adopters, investors, and tech enthusiasts, the live board serves as a curated discovery engine for new tools, apps, and platforms.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <Link href="/trending" className="block border border-bg-border bg-bg-surface p-6 hover:border-ink transition-colors group">
            <h3 className="font-display font-black text-xl text-ink mb-3 uppercase group-hover:underline decoration-2 underline-offset-4">Trending Products →</h3>
            <p className="text-ink-muted text-xs font-bold uppercase tracking-wider leading-relaxed">
              See which products have the most momentum and are climbing the ranks fastest.
            </p>
          </Link>
          <Link href="/new-products" className="block border border-bg-border bg-bg-surface p-6 hover:border-ink transition-colors group">
            <h3 className="font-display font-black text-xl text-ink mb-3 uppercase group-hover:underline decoration-2 underline-offset-4">New Arrivals →</h3>
            <p className="text-ink-muted text-xs font-bold uppercase tracking-wider leading-relaxed">
              Discover the latest startups and tools that just joined the internet billboard.
            </p>
          </Link>
        </div>

        <div className="text-center sm:text-left border-t border-bg-border pt-8 mt-12">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <Link href="/" className="btn-primary px-8 py-3">
              Explore The Live Board
            </Link>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
