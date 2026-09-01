import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Best SpotWars Alternatives for Product Competition",
  description:
    "Looking for alternatives to SpotWars? Learn why InternetBillboard.space is the premier live board for product competition and visibility.",
};

export default function SpotWarsAlternativesPage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-16 w-full">
        <header className="mb-12 border-b border-bg-border pb-8 text-center sm:text-left">
          <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight mb-4 uppercase">
            Best SpotWars Alternatives
          </h1>
          <p className="text-ink-muted text-base font-bold uppercase tracking-wider leading-relaxed max-w-2xl">
            Finding the right platform to showcase your product in a competitive environment.
          </p>
        </header>

        <section className="mb-12">
          <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed mb-6">
            If you enjoy the gamified, competitive aspects of SpotWars but want a broader product discovery experience, <strong>InternetBillboard.space</strong> offers a transparent alternative.
          </p>
        </section>

        <div className="space-y-8 mb-12">
          <div className="border border-bg-border bg-bg-surface p-6">
            <h3 className="font-display font-black text-xl text-ink mb-3 uppercase">1. InternetBillboard.space</h3>
            <p className="text-ink-muted text-xs font-bold uppercase tracking-wider leading-relaxed mb-4">
              InternetBillboard combines the thrill of a competitive leaderboard with the utility of a product directory. You can overtake competitors, track your momentum, and rank in specific categories.
            </p>
            <ul className="list-disc pl-5 mb-4 text-ink-muted text-xs font-bold uppercase tracking-wider leading-relaxed space-y-2">
              <li>Category-specific leaderboards (e.g., AI, SaaS)</li>
              <li>Real-time traffic and click analytics</li>
              <li>Detailed product profiles for better conversion</li>
              <li>Trending and fastest-rising algorithms</li>
            </ul>
            <Link href="/compare/internetbillboard-vs-spotwars" className="text-xs font-bold text-ink underline underline-offset-4 hover:text-ink-muted uppercase tracking-wider">
              Read the full comparison →
            </Link>
          </div>
        </div>

        <div className="text-center sm:text-left border-t border-bg-border pt-8 mt-12">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
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
