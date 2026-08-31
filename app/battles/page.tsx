import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ActivityFeed from "@/components/feed/ActivityFeed";
import { formatINR } from "@/lib/utils";
import type { ActivityEvent } from "@/lib/types";

export const metadata: Metadata = {
  title: "Battles — SpotWars",
  description:
    "Live product battles on SpotWars. See which products are overtaking each other right now.",
};

async function getBattlesData() {
  const supabase = await createClient();

  // Get recent overtake events as battles
  const { data: rawOvertakes } = await supabase
    .from("activity_events")
    .select("*, product:products(id, name, logo_url, category), target_product:products!activity_events_target_product_id_fkey(id, name, logo_url, category)")
    .eq("event_type", "overtake")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(20);

  // Get global board for current live matchups
  const { data: board } = await supabase
    .from("boards")
    .select("id")
    .eq("slug", "global")
    .single();

  let topPositions: Array<{
    position: number;
    spend_on_board: number;
    product: { id: string; name: string; logo_url?: string; category: string; click_count: number };
  }> = [];

  if (board) {
    const { data: positions } = await supabase
      .from("board_positions")
      .select(`
        position, spend_on_board,
        product:products(id, name, logo_url, category, click_count)
      `)
      .eq("board_id", board.id)
      .order("position", { ascending: true })
      .limit(20);

    topPositions = ((positions || []).filter((p) => p.product) as unknown) as typeof topPositions;
  }

  return {
    overtakes: (rawOvertakes || []) as ActivityEvent[],
    positions: topPositions,
  };
}

export default async function BattlesPage() {
  const { overtakes, positions } = await getBattlesData();

  // Build adjacent pairs from positions as "live battles"
  const liveBattles = [];
  for (let i = 0; i < Math.min(positions.length - 1, 8); i++) {
    const challenger = positions[i + 1];
    const defender = positions[i];
    const gap = defender.spend_on_board - challenger.spend_on_board;
    if (gap >= 0 && gap < 100000) {
      // Only show pairs where gap is < ₹1000 (100000 paise)
      liveBattles.push({ challenger, defender, gap });
    }
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16">

        {/* Header */}
        <div className="border-b border-[#1A1A1A] pb-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="live-dot" />
            <span className="text-xs text-[#555555] font-medium uppercase tracking-wider">Live competition</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white tracking-tight mb-1">
            Battles
          </h1>
          <p className="text-[#555555] text-sm">
            Products fighting for position on the live board.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Live close matchups */}
            <div>
              <h2 className="text-sm font-semibold text-[#888888] uppercase tracking-wider mb-4">
                Close Matchups — Live Board
              </h2>

              {liveBattles.length === 0 ? (
                <div className="border border-[#1A1A1A] rounded-sm py-12 text-center text-[#444444]">
                  <p className="text-sm">No close battles at the moment.</p>
                  <p className="text-xs mt-1 text-[#333333]">
                    When two products are within ₹10 of each other, they appear here.
                  </p>
                </div>
              ) : (
                <div className="border border-[#1A1A1A] rounded-sm overflow-hidden">
                  {liveBattles.map(({ challenger, defender, gap }, i) => (
                    <div
                      key={`${challenger.product.id}-${defender.product.id}`}
                      className={`p-4 ${i < liveBattles.length - 1 ? "border-b border-[#111111]" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] text-[#444444] uppercase tracking-wider font-semibold">
                          Position #{defender.position} vs #{challenger.position}
                        </span>
                        {gap < 10000 && (
                          <span className="badge text-[#EF4444] border-[#EF444430]">⚡ Very close</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {/* Defender (current holder) */}
                        <div className="flex-1 flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[#181818] border border-[#242424] flex items-center justify-center text-xs font-bold text-[#E85D27] flex-shrink-0 overflow-hidden">
                            {defender.product.logo_url ? (
                              <img src={defender.product.logo_url} alt={defender.product.name} className="w-full h-full object-cover" />
                            ) : (
                              defender.product.name.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/product/${defender.product.id}`} className="text-sm font-semibold text-white hover:text-[#CCCCCC] transition-colors truncate block">
                              {defender.product.name}
                            </Link>
                            <div className="text-xs text-[#444444]">
                              #{defender.position} · {formatINR(defender.spend_on_board, true)}
                            </div>
                          </div>
                        </div>

                        {/* vs divider */}
                        <div className="text-xs text-[#333333] font-semibold flex-shrink-0">vs</div>

                        {/* Challenger */}
                        <div className="flex-1 flex items-center gap-3 flex-row-reverse sm:flex-row">
                          <div className="w-8 h-8 rounded bg-[#181818] border border-[#242424] flex items-center justify-center text-xs font-bold text-[#E85D27] flex-shrink-0 overflow-hidden">
                            {challenger.product.logo_url ? (
                              <img src={challenger.product.logo_url} alt={challenger.product.name} className="w-full h-full object-cover" />
                            ) : (
                              challenger.product.name.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/product/${challenger.product.id}`} className="text-sm font-semibold text-white hover:text-[#CCCCCC] transition-colors truncate block">
                              {challenger.product.name}
                            </Link>
                            <div className="text-xs text-[#444444]">
                              #{challenger.position} · {formatINR(challenger.spend_on_board, true)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-[#444444]">
                        Gap: <span className="text-[#AAAAAA] num">{formatINR(gap, true)}</span>
                        {" "}— {challenger.product.name} needs{" "}
                        <span className="text-[#AAAAAA] num">{formatINR(gap + 100, true)}</span>
                        {" "}more to overtake #{defender.position}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent overtakes */}
            <div>
              <h2 className="text-sm font-semibold text-[#888888] uppercase tracking-wider mb-4">
                Recent Overtakes
              </h2>
              {overtakes.length === 0 ? (
                <div className="border border-[#1A1A1A] rounded-sm py-10 text-center text-[#444444]">
                  <p className="text-sm">No overtakes recorded yet.</p>
                </div>
              ) : (
                <div className="border border-[#1A1A1A] rounded-sm overflow-hidden">
                  <ActivityFeed initialEvents={overtakes} compact={false} />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Board positions 1-10 */}
            <div>
              <h2 className="text-sm font-semibold text-[#888888] uppercase tracking-wider mb-3">
                Current Top 10
              </h2>
              <div className="border border-[#1A1A1A] rounded-sm overflow-hidden">
                {positions.slice(0, 10).map((pos, i) => (
                  <div
                    key={pos.product.id}
                    className="flex items-center gap-3 px-4 py-2.5 border-b border-[#111111] last:border-b-0 hover:bg-[#141414] transition-colors"
                  >
                    <span
                      className={`text-sm font-display font-bold num flex-shrink-0 w-6 text-right ${
                        i === 0
                          ? "rank-gold"
                          : i === 1
                          ? "rank-silver"
                          : i === 2
                          ? "rank-bronze"
                          : "rank-default"
                      }`}
                    >
                      #{pos.position}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${pos.product.id}`}
                        className="text-xs font-medium text-[#CCCCCC] hover:text-white transition-colors truncate block"
                      >
                        {pos.product.name}
                      </Link>
                    </div>
                    <span className="text-xs text-[#444444] num flex-shrink-0">
                      {formatINR(pos.spend_on_board, true)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="border border-[#1A1A1A] rounded-sm p-4 bg-[#111111]">
              <h3 className="text-sm font-semibold text-white mb-1.5">Want to battle?</h3>
              <p className="text-xs text-[#555555] mb-4 leading-relaxed">
                List your product and start competing. Attack any position above you.
              </p>
              <Link
                href="/submit"
                id="battles-submit-btn"
                className="btn-primary w-full py-2 rounded-sm text-sm font-semibold text-center block"
              >
                List Your Product
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
