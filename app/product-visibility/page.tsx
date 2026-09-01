import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Product Visibility Platform",
  description:
    "Get your startup discovered on our product visibility platform. Compete on the live internet billboard and drive traffic to your product.",
};

export default function ProductVisibilityPage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-16 w-full">
        <header className="mb-12 border-b border-bg-border pb-8 text-center sm:text-left">
          <p className="text-xs text-ink uppercase tracking-widest font-black mb-3">
            InternetBillboard.space
          </p>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight mb-4 uppercase">
            Product Visibility Platform
          </h1>
          <p className="text-ink-muted text-base font-bold uppercase tracking-wider leading-relaxed max-w-2xl">
            A competitive arena designed specifically for product discoverability.
          </p>
        </header>

        <section className="mb-12">
          <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed mb-6">
            Getting visibility for a new product is harder than ever. Social media feeds are algorithmically throttled, and ads are expensive. InternetBillboard.space offers a direct, transparent way to buy attention.
          </p>
          <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed mb-6">
            When you list your product on the board, you immediately gain visibility among founders, investors, and early adopters who actively browse the platform looking for new SaaS, apps, and tools.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="border border-bg-border bg-bg-surface p-6">
            <h3 className="font-display font-black text-xl text-ink mb-3 uppercase">Live Rankings</h3>
            <p className="text-ink-muted text-xs font-bold uppercase tracking-wider leading-relaxed">
              Your position is live and public. Everyone sees exactly where your product stands and how much momentum it has.
            </p>
          </div>
          <div className="border border-bg-border bg-bg-surface p-6">
            <h3 className="font-display font-black text-xl text-ink mb-3 uppercase">Targeted Traffic</h3>
            <p className="text-ink-muted text-xs font-bold uppercase tracking-wider leading-relaxed">
              Visitors to the board are high-intent users actively searching for new products to try, buy, or invest in.
            </p>
          </div>
        </div>

        <div className="text-center sm:text-left border-t border-bg-border pt-8">
          <h2 className="font-display font-black text-2xl text-ink mb-4 uppercase">
            Ready to get seen?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center mt-6">
            <Link href="/submit" className="btn-primary px-8 py-3">
              List Your Product
            </Link>
            <Link href="/" className="text-xs font-bold text-ink-muted hover:text-ink uppercase tracking-wider">
              See Current Rankings →
            </Link>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
