import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "InternetBillboard vs SpotWars — Product Competition Comparison",
  description:
    "Compare InternetBillboard.space and SpotWars. Learn the differences in product competition, visibility, and leaderboard mechanics.",
};

export default function CompareSpotWarsPage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 w-full">
        <header className="mb-12 border-b border-bg-border pb-8 text-center sm:text-left">
          <Link href="/" className="text-xs font-bold text-ink hover:text-ink-muted transition-colors mb-4 inline-block uppercase tracking-wider">
            ← Back to Home
          </Link>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight mb-4 uppercase">
            InternetBillboard vs SpotWars
          </h1>
          <p className="text-ink-muted text-base font-bold uppercase tracking-wider leading-relaxed max-w-2xl">
            Comparing two platforms built for product competition and visibility.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="font-display font-black text-2xl text-ink mb-6 uppercase border-b border-bg-border pb-2">Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-display font-black text-xl text-ink mb-3 uppercase">SpotWars</h3>
              <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed">
                SpotWars focuses on head-to-head competition between products for specific spots or positions. It gamifies the product promotion space.
              </p>
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-ink mb-3 uppercase">InternetBillboard.space</h3>
              <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed">
                InternetBillboard is a broader live billboard. It includes gamified leaderboard mechanics but focuses heavily on overarching product discovery, categories, and momentum tracking.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12 border border-bg-border bg-bg-surface overflow-hidden">
          <div className="px-6 py-4 border-b border-bg-border bg-bg">
            <h3 className="text-sm font-black text-ink uppercase tracking-widest">Key Differences</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg text-ink uppercase tracking-widest text-xs border-b border-bg-border">
                <tr>
                  <th className="px-6 py-4 font-black">Feature</th>
                  <th className="px-6 py-4 font-black border-l border-bg-border">InternetBillboard</th>
                  <th className="px-6 py-4 font-black border-l border-bg-border">SpotWars</th>
                </tr>
              </thead>
              <tbody className="font-bold uppercase tracking-wider text-ink-muted">
                <tr className="border-b border-bg-border">
                  <td className="px-6 py-4 text-ink font-black">Primary Focus</td>
                  <td className="px-6 py-4 border-l border-bg-border">Live Billboard & Discovery</td>
                  <td className="px-6 py-4 border-l border-bg-border">Gamified spot competition</td>
                </tr>
                <tr className="border-b border-bg-border">
                  <td className="px-6 py-4 text-ink font-black">Categories</td>
                  <td className="px-6 py-4 border-l border-bg-border">Rich category filtering</td>
                  <td className="px-6 py-4 border-l border-bg-border">Usually limited to global board</td>
                </tr>
                <tr className="border-b border-bg-border">
                  <td className="px-6 py-4 text-ink font-black">Product Pages</td>
                  <td className="px-6 py-4 border-l border-bg-border">Dedicated profile pages</td>
                  <td className="px-6 py-4 border-l border-bg-border">Varies by implementation</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="text-center sm:text-left border-t border-bg-border pt-8 mt-12">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <Link href="/" className="btn-primary px-8 py-3">
              Explore InternetBillboard
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
