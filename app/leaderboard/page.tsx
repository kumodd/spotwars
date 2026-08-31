import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatINR, formatNumber } from "@/lib/utils";
import type { BoardEntry, Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Leaderboard — InternetBillboard.space",
  description:
    "Comprehensive rankings across all boards — Overall, Trending, Most Clicked, and Champions.",
};

async function getLeaderboardData() {
  const supabase = await createClient();

  const { data: board } = await supabase
    .from("boards")
    .select("id, name, slug")
    .eq("slug", "global")
    .single();

  if (!board) return { board: null, entries: [] };

  const { data: positions } = await supabase
    .from("board_positions")
    .select(`
      position, previous_position, spend_on_board,
      product:products (
        id, name, url, logo_url, tagline, category,
        click_count, impression_count, spot_score, momentum_score,
        total_spend, status, founder_id
      )
    `)
    .eq("board_id", board.id)
    .order("position", { ascending: true })
    .limit(100);

  const entries: BoardEntry[] = (positions || [])
    .filter((row) => row.product)
    .map((row: unknown) => {
      const r = row as {
        position: number;
        previous_position?: number;
        spend_on_board: number;
        product: Product;
      };
      return {
        position: r.position,
        previous_position: r.previous_position,
        spend_on_board: r.spend_on_board,
        product: r.product,
        movement: (r.previous_position ?? r.position) - r.position,
      };
    });

  return { board, entries };
}

function RankCell({ position }: { position: number }) {
  const cls =
    position === 1
      ? "rank-gold"
      : position === 2
      ? "rank-silver"
      : position === 3
      ? "rank-bronze"
      : "text-ink";
  return <span className={`text-base font-display font-black num ${cls}`}>#{position}</span>;
}

function MoveCell({ movement }: { movement: number }) {
  if (movement > 0) return <span className="move-up text-xs font-bold num">↑{movement}</span>;
  if (movement < 0) return <span className="move-down text-xs font-bold num">↓{Math.abs(movement)}</span>;
  return <span className="move-flat text-xs font-bold">—</span>;
}

export default async function LeaderboardPage() {
  const { entries } = await getLeaderboardData();

  const byClicks = [...entries].sort(
    (a, b) => b.product.click_count - a.product.click_count
  );
  const byMomentum = [...entries].sort(
    (a, b) => b.product.momentum_score - a.product.momentum_score
  );
  const rising = [...entries]
    .filter((e) => e.movement > 0)
    .sort((a, b) => b.movement - a.movement);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16">

        {/* Header */}
        <div className="border-b border-bg-border pb-8 mb-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
            <span className="live-dot" />
            <span className="text-xs text-ink font-black uppercase tracking-widest">Global board</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight mb-3 uppercase">
            Leaderboard
          </h1>
          <p className="text-ink-muted text-sm font-bold uppercase tracking-wider">
            Comprehensive rankings across multiple dimensions.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

          {/* Overall — full board */}
          <div className="xl:col-span-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <h2 className="text-sm font-black text-ink uppercase tracking-widest border-b border-bg-border pb-1 inline-block">
                Overall — Top 25
              </h2>
              <Link href="/board" className="text-xs font-bold text-ink hover:text-ink-muted transition-colors uppercase tracking-wider">
                View Full Board →
              </Link>
            </div>

            <div className="border border-bg-border bg-bg-surface overflow-hidden">
              {/* Column headers */}
              <div className="hidden sm:flex items-center px-4 py-3 border-b border-bg-border bg-bg">
                <div className="w-12 text-right pr-3 flex-shrink-0">
                  <span className="text-[10px] uppercase tracking-widest text-ink font-black">Rank</span>
                </div>
                <div className="w-10 mr-3 flex-shrink-0" />
                <div className="flex-1 mr-4 min-w-0">
                  <span className="text-[10px] uppercase tracking-widest text-ink font-black">Product</span>
                </div>
                <div className="w-24 text-right flex-shrink-0">
                  <span className="text-[10px] uppercase tracking-widest text-ink font-black">Attention</span>
                </div>
                <div className="w-12 text-right ml-4 flex-shrink-0">
                  <span className="text-[10px] uppercase tracking-widest text-ink font-black">Move</span>
                </div>
                <div className="w-16 text-right ml-4 flex-shrink-0">
                  <span className="text-[10px] uppercase tracking-widest text-ink font-black">Clicks</span>
                </div>
              </div>

              {entries.slice(0, 25).map((entry, i) => (
                <div
                  key={entry.product.id}
                  className={`board-row px-4 py-3 ${i < entries.slice(0, 25).length - 1 ? "border-b border-bg-border" : "border-none"}`}
                >
                  <div className="w-12 flex-shrink-0 text-right pr-3">
                    <RankCell position={entry.position} />
                  </div>
                  <div className="w-10 h-10 flex-shrink-0 mr-4 border border-bg-border bg-bg flex items-center justify-center font-black text-ink text-sm">
                    {entry.product.logo_url ? (
                      <img
                        src={entry.product.logo_url}
                        alt={entry.product.name}
                        className="w-full h-full object-cover grayscale opacity-90"
                      />
                    ) : (
                      entry.product.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0 mr-4">
                    <Link
                      href={`/product/${entry.product.id}`}
                      className="text-sm font-bold text-ink hover:underline uppercase tracking-wide truncate block"
                    >
                      {entry.product.name}
                    </Link>
                    <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">{entry.product.category}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                    <div className="w-24 text-right">
                      <span className="text-sm font-bold text-ink num">{formatINR(entry.spend_on_board, true)}</span>
                    </div>
                    <div className="w-12 text-right">
                      <MoveCell movement={entry.movement} />
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm font-bold text-ink num">{formatNumber(entry.product.click_count)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {entries.length > 25 && (
                <div className="px-4 py-4 border-t border-bg-border text-center bg-bg">
                  <Link
                    href="/board"
                    className="text-xs font-bold text-ink hover:text-ink-muted transition-colors uppercase tracking-wider"
                  >
                    See all {entries.length} products →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar rankings */}
          <div className="space-y-8 mt-8 xl:mt-0">

            {/* Fastest Rising */}
            <div>
              <h2 className="text-sm font-black text-ink uppercase tracking-widest border-b border-bg-border pb-1 inline-block mb-4">
                Fastest Rising
              </h2>
              <div className="border border-bg-border overflow-hidden bg-bg-surface">
                {rising.slice(0, 8).length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs font-bold uppercase tracking-wider text-ink-muted">No rising products yet.</div>
                ) : (
                  rising.slice(0, 8).map((entry, i) => (
                    <div key={entry.product.id} className="flex items-center gap-4 px-4 py-3 border-b border-bg-border last:border-none hover:bg-bg transition-colors">
                      <span className="text-xs font-black text-ink-muted w-5 text-right num">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${entry.product.id}`} className="text-xs font-bold text-ink uppercase tracking-wider hover:underline truncate block">
                          {entry.product.name}
                        </Link>
                      </div>
                      <span className="move-up text-xs font-bold num">↑{entry.movement}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Most Clicked */}
            <div>
              <h2 className="text-sm font-black text-ink uppercase tracking-widest border-b border-bg-border pb-1 inline-block mb-4">
                Most Clicked
              </h2>
              <div className="border border-bg-border overflow-hidden bg-bg-surface">
                {byClicks.slice(0, 8).map((entry, i) => (
                  <div key={entry.product.id} className="flex items-center gap-4 px-4 py-3 border-b border-bg-border last:border-none hover:bg-bg transition-colors">
                    <span className="text-xs font-black text-ink-muted w-5 text-right num">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${entry.product.id}`} className="text-xs font-bold text-ink uppercase tracking-wider hover:underline truncate block">
                        {entry.product.name}
                      </Link>
                    </div>
                    <span className="text-xs font-bold text-ink num">{formatNumber(entry.product.click_count)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending */}
            <div>
              <h2 className="text-sm font-black text-ink uppercase tracking-widest border-b border-bg-border pb-1 inline-block mb-4">
                Trending
              </h2>
              <div className="border border-bg-border overflow-hidden bg-bg-surface">
                {byMomentum.slice(0, 8).map((entry, i) => (
                  <div key={entry.product.id} className="flex items-center gap-4 px-4 py-3 border-b border-bg-border last:border-none hover:bg-bg transition-colors">
                    <span className="text-xs font-black text-ink-muted w-5 text-right num">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${entry.product.id}`} className="text-xs font-bold text-ink uppercase tracking-wider hover:underline truncate block">
                        {entry.product.name}
                      </Link>
                    </div>
                    <span className="text-xs font-bold text-ink num">{entry.product.momentum_score.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
