import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "InternetBillboard vs OwnSpot — Product Visibility Comparison",
  description:
    "Compare InternetBillboard.space and OwnSpot. Which is the better platform for product visibility, live rankings, and internet billboard discovery?",
};

export default function CompareOwnSpotPage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 w-full">
        <header className="mb-12 border-b border-bg-border pb-8 text-center sm:text-left">
          <Link href="/" className="text-xs font-bold text-ink hover:text-ink-muted transition-colors mb-4 inline-block uppercase tracking-wider">
            ← Back to Home
          </Link>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight mb-4 uppercase">
            InternetBillboard vs OwnSpot
          </h1>
          <p className="text-ink-muted text-base font-bold uppercase tracking-wider leading-relaxed max-w-2xl">
            A transparent feature comparison between InternetBillboard.space and OwnSpot for product promotion.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="font-display font-black text-2xl text-ink mb-6 uppercase border-b border-bg-border pb-2">Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-display font-black text-xl text-ink mb-3 uppercase">OwnSpot</h3>
              <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed">
                OwnSpot is a platform that allows founders to buy "spots" for their products. 
                It generally operates on a static pricing grid where users own specific pixels or grid locations.
              </p>
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-ink mb-3 uppercase">InternetBillboard.space</h3>
              <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed">
                InternetBillboard is a dynamic, competitive live board. Products compete for ranking (1st, 2nd, 3rd, etc.) 
                based on attention spend. It functions like a live leaderboard where products can overtake each other.
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
                  <th className="px-6 py-4 font-black border-l border-bg-border">OwnSpot</th>
                </tr>
              </thead>
              <tbody className="font-bold uppercase tracking-wider text-ink-muted">
                <tr className="border-b border-bg-border">
                  <td className="px-6 py-4 text-ink font-black">Ranking Mechanic</td>
                  <td className="px-6 py-4 border-l border-bg-border">Dynamic competitive leaderboard</td>
                  <td className="px-6 py-4 border-l border-bg-border">Static grid/spot placement</td>
                </tr>
                <tr className="border-b border-bg-border">
                  <td className="px-6 py-4 text-ink font-black">Competition</td>
                  <td className="px-6 py-4 border-l border-bg-border">Live (Overtake competitors instantly)</td>
                  <td className="px-6 py-4 border-l border-bg-border">Fixed spot ownership</td>
                </tr>
                <tr className="border-b border-bg-border">
                  <td className="px-6 py-4 text-ink font-black">Analytics</td>
                  <td className="px-6 py-4 border-l border-bg-border">Live impressions, clicks, momentum</td>
                  <td className="px-6 py-4 border-l border-bg-border">Basic click tracking</td>
                </tr>
                <tr className="border-b border-bg-border">
                  <td className="px-6 py-4 text-ink font-black">Entry Cost</td>
                  <td className="px-6 py-4 border-l border-bg-border">Minimum ₹49</td>
                  <td className="px-6 py-4 border-l border-bg-border">Varies by spot</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-ink font-black">Product Discovery</td>
                  <td className="px-6 py-4 border-l border-bg-border">Sorted by category, trending, rising</td>
                  <td className="px-6 py-4 border-l border-bg-border">Visual grid discovery</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-display font-black text-2xl text-ink mb-6 uppercase">Which should you choose?</h2>
          <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed mb-6">
            If you want a static, permanent link placement on a grid, OwnSpot is a great choice. 
          </p>
          <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed">
            If you prefer an active, competitive environment where you can adjust your budget, 
            overtake competitors, and get ranked on a dynamic leaderboard, then InternetBillboard.space 
            is built for you.
          </p>
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
