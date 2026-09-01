import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Best OwnSpot Alternatives for Product Visibility & Internet Billboards",
  description:
    "Looking for alternatives to OwnSpot? Discover how InternetBillboard.space provides a transparent, dynamic live board for product promotion and visibility.",
};

export default function OwnSpotAlternativesPage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-16 w-full">
        <header className="mb-12 border-b border-bg-border pb-8 text-center sm:text-left">
          <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight mb-4 uppercase">
            Best OwnSpot Alternatives
          </h1>
          <p className="text-ink-muted text-base font-bold uppercase tracking-wider leading-relaxed max-w-2xl">
            Evaluating the best platforms for internet billboards and product visibility.
          </p>
        </header>

        <section className="mb-12">
          <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed mb-6">
            If you are exploring alternatives to OwnSpot to promote your startup, SaaS, or new app, you likely want a platform that offers transparent pricing, excellent visibility, and a fair competitive mechanic.
          </p>
          <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed mb-6">
            Here is why many founders are turning to <strong>InternetBillboard.space</strong> as their primary product visibility platform.
          </p>
        </section>

        <div className="space-y-8 mb-12">
          <div className="border border-bg-border bg-bg-surface p-6">
            <h3 className="font-display font-black text-xl text-ink mb-3 uppercase">1. InternetBillboard.space</h3>
            <p className="text-ink-muted text-xs font-bold uppercase tracking-wider leading-relaxed mb-4">
              InternetBillboard is designed as a live, competitive billboard. Rather than claiming a static grid spot, products compete for positions on a live leaderboard. 
            </p>
            <ul className="list-disc pl-5 mb-4 text-ink-muted text-xs font-bold uppercase tracking-wider leading-relaxed space-y-2">
              <li>Transparent competitive rankings</li>
              <li>Live activity and momentum metrics</li>
              <li>Dedicated product profile pages</li>
              <li>Categorized discovery for targeted audiences</li>
            </ul>
            <Link href="/compare/internetbillboard-vs-ownspot" className="text-xs font-bold text-ink underline underline-offset-4 hover:text-ink-muted uppercase tracking-wider">
              Read the full comparison →
            </Link>
          </div>
        </div>

        <div className="text-center sm:text-left border-t border-bg-border pt-8 mt-12">
          <h2 className="font-display font-black text-2xl text-ink mb-4 uppercase">
            Ready to try the Live Board?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center mt-6">
            <Link href="/submit" className="btn-primary px-8 py-3">
              List Your Product
            </Link>
            <Link href="/" className="text-xs font-bold text-ink-muted hover:text-ink uppercase tracking-wider">
              Explore The Board →
            </Link>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
