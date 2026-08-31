import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatINR, formatNumber } from "@/lib/utils";
import type { BoardEntry, Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Leaderboard — SpotWars",
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
      : "rank-default";
  return <span className={`text-sm font-display font-bold num ${cls}`}>#{position}</span>;
}

function MoveCell({ movement }: { movement: number }) {
  if (movement > 0) return <span className="move-up text-xs num">↑{movement}</span>;
  if (movement < 0) return <span className="move-down text-xs num">↓{Math.abs(movement)}</span>;
  return <span className="move-flat text-xs">—</span>;
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
    <div className="min-h-screen bg-[#0C0C0C]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16">

        {/* Header */}
        <div className="border-b border-[#1A1A1A] pb-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="live-dot" />
            <span className="text-xs text-[#555555] font-medium uppercase tracking-wider">Global board</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white tracking-tight mb-1">
            Leaderboard
          </h1>
          <p className="text-[#555555] text-sm">
            Comprehensive rankings across multiple dimensions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Overall — full board */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#888888] uppercase tracking-wider">
                Overall — All {entries.length} products
              </h2>
              <Link href="/board" className="text-xs text-[#555555] hover:text-[#CCCCCC] transition-colors">
                Full board →
              </Link>
            </div>

            <div className="border border-[#1A1A1A] rounded-sm overflow-hidden">
              {/* Column headers */}
              <div className="hidden sm:flex items-center px-4 py-2 border-b border-[#1A1A1A] bg-[#0E0E0E]">
                <div className="w-10 text-right pr-3">
                  <span className="text-[10px] uppercase tracking-wider text-[#333333] font-semibold">#</span>
                </div>
                <div className="w-8 mr-3" />
                <div className="flex-1 mr-4">
                  <span className="text-[10px] uppercase tracking-wider text-[#333333] font-semibold">Product</span>
                </div>
                <div className="w-20 text-right">
                  <span className="text-[10px] uppercase tracking-wider text-[#333333] font-semibold">Attention</span>
                </div>
                <div className="w-10 text-right ml-4">
                  <span className="text-[10px] uppercase tracking-wider text-[#333333] font-semibold">Move</span>
                </div>
                <div className="w-14 text-right ml-4">
                  <span className="text-[10px] uppercase tracking-wider text-[#333333] font-semibold">Clicks</span>
                </div>
              </div>

              {entries.slice(0, 25).map((entry) => (
                <div
                  key={entry.product.id}
                  className="board-row"
                >
                  <div className="w-10 flex-shrink-0 text-right pr-3">
                    <RankCell position={entry.position} />
                  </div>
                  <div className="w-8 h-7 flex-shrink-0 mr-3 rounded overflow-hidden bg-[#181818] border border-[#242424]">
                    {entry.product.logo_url ? (
                      <img
                        src={entry.product.logo_url}
                        alt={entry.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[#E85D27]">
                        {entry.product.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 mr-4">
                    <Link
                      href={`/product/${entry.product.id}`}
                      className="text-sm font-medium text-[#E0E0E0] hover:text-white transition-colors truncate block"
                    >
                      {entry.product.name}
                    </Link>
                    <span className="text-[10px] text-[#444444]">{entry.product.category}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                    <div className="w-20 text-right">
                      <span className="text-xs text-[#AAAAAA] num">{formatINR(entry.spend_on_board, true)}</span>
                    </div>
                    <div className="w-10 text-right">
                      <MoveCell movement={entry.movement} />
                    </div>
                    <div className="w-14 text-right">
                      <span className="text-xs text-[#AAAAAA] num">{formatNumber(entry.product.click_count)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {entries.length > 25 && (
                <div className="px-4 py-3 border-t border-[#1A1A1A] text-center">
                  <Link
                    href="/board"
                    className="text-xs text-[#555555] hover:text-[#CCCCCC] transition-colors"
                  >
                    See all {entries.length} products →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar rankings */}
          <div className="space-y-6">

            {/* Fastest Rising */}
            <div>
              <h2 className="text-sm font-semibold text-[#888888] uppercase tracking-wider mb-3">
                Fastest Rising
              </h2>
              <div className="border border-[#1A1A1A] rounded-sm overflow-hidden">
                {rising.slice(0, 8).length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-[#444444]">No rising products yet.</div>
                ) : (
                  rising.slice(0, 8).map((entry, i) => (
                    <div key={entry.product.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#111111] last:border-b-0 hover:bg-[#141414] transition-colors">
                      <span className="text-xs text-[#333333] w-5 text-right num">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${entry.product.id}`} className="text-xs font-medium text-[#CCCCCC] hover:text-white transition-colors truncate block">
                          {entry.product.name}
                        </Link>
                      </div>
                      <span className="move-up text-xs num">↑{entry.movement}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Most Clicked */}
            <div>
              <h2 className="text-sm font-semibold text-[#888888] uppercase tracking-wider mb-3">
                Most Clicked
              </h2>
              <div className="border border-[#1A1A1A] rounded-sm overflow-hidden">
                {byClicks.slice(0, 8).map((entry, i) => (
                  <div key={entry.product.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#111111] last:border-b-0 hover:bg-[#141414] transition-colors">
                    <span className="text-xs text-[#333333] w-5 text-right num">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${entry.product.id}`} className="text-xs font-medium text-[#CCCCCC] hover:text-white transition-colors truncate block">
                        {entry.product.name}
                      </Link>
                    </div>
                    <span className="text-xs text-[#AAAAAA] num">{formatNumber(entry.product.click_count)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Highest Momentum */}
            <div>
              <h2 className="text-sm font-semibold text-[#888888] uppercase tracking-wider mb-3">
                Trending
              </h2>
              <div className="border border-[#1A1A1A] rounded-sm overflow-hidden">
                {byMomentum.slice(0, 8).map((entry, i) => (
                  <div key={entry.product.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#111111] last:border-b-0 hover:bg-[#141414] transition-colors">
                    <span className="text-xs text-[#333333] w-5 text-right num">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${entry.product.id}`} className="text-xs font-medium text-[#CCCCCC] hover:text-white transition-colors truncate block">
                        {entry.product.name}
                      </Link>
                    </div>
                    <span className="text-xs text-[#AAAAAA] num">{entry.product.momentum_score.toFixed(0)}</span>
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
