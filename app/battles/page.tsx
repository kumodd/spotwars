import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ActivityFeed from "@/components/feed/ActivityFeed";
import { formatINR } from "@/lib/utils";
import type { ActivityEvent } from "@/lib/types";

export const metadata: Metadata = {
  title: "Battles — InternetBillboard.space",
  description:
    "Live product battles on InternetBillboard.space. See which products are overtaking each other right now.",
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
    <div className="min-h-screen bg-bg text-ink">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-16">

        {/* Header */}
        <div className="border-b border-bg-border pb-6 mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="live-dot" />
            <span className="text-xs text-ink font-bold uppercase tracking-widest">Live competition</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight mb-2 uppercase">
            Battles
          </h1>
          <p className="text-ink-muted text-sm font-semibold uppercase tracking-widest">
            Products fighting for position on the live board
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">

            {/* Live close matchups */}
            <div>
              <h2 className="text-sm font-black text-ink uppercase tracking-widest border-b border-bg-border pb-2 mb-4">
                Close Matchups
              </h2>

              {liveBattles.length === 0 ? (
                <div className="border border-bg-border py-12 text-center text-ink font-bold uppercase tracking-wider">
                  <p className="text-sm">No close battles at the moment.</p>
                  <p className="text-xs mt-2 text-ink-muted">
                    When two products are within ₹10 of each other, they appear here.
                  </p>
                </div>
              ) : (
                <div className="border border-bg-border bg-bg-surface">
                  {liveBattles.map(({ challenger, defender, gap }, i) => (
                    <div
                      key={`${challenger.product.id}-${defender.product.id}`}
                      className={`p-5 ${i < liveBattles.length - 1 ? "border-b border-bg-border" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-4 border-b border-bg-border pb-2">
                        <span className="text-xs text-ink font-black uppercase tracking-widest">
                          Position #{defender.position} vs #{challenger.position}
                        </span>
                        {gap < 10000 && (
                          <span className="badge">⚡ Close</span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                        {/* Defender (current holder) */}
                        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
                          <div className="w-10 h-10 border border-bg-border flex items-center justify-center text-sm font-black text-ink flex-shrink-0 bg-bg">
                            {defender.product.logo_url ? (
                              <img src={defender.product.logo_url} alt={defender.product.name} className="w-full h-full object-cover grayscale opacity-90" />
                            ) : (
                              defender.product.name.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/product/${defender.product.id}`} className="text-sm font-bold text-ink hover:underline uppercase tracking-wide block">
                              {defender.product.name}
                            </Link>
                            <div className="text-xs text-ink-muted font-bold uppercase tracking-wider">
                              #{defender.position} · {formatINR(defender.spend_on_board, true)}
                            </div>
                          </div>
                        </div>

                        {/* vs divider */}
                        <div className="font-display font-black text-lg text-ink uppercase italic mx-4 flex-shrink-0">
                          vs
                        </div>

                        {/* Challenger */}
                        <div className="flex-1 flex flex-col sm:flex-row-reverse items-center gap-3 sm:text-right">
                          <div className="w-10 h-10 border border-bg-border flex items-center justify-center text-sm font-black text-ink flex-shrink-0 bg-bg">
                            {challenger.product.logo_url ? (
                              <img src={challenger.product.logo_url} alt={challenger.product.name} className="w-full h-full object-cover grayscale opacity-90" />
                            ) : (
                              challenger.product.name.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/product/${challenger.product.id}`} className="text-sm font-bold text-ink hover:underline uppercase tracking-wide block">
                              {challenger.product.name}
                            </Link>
                            <div className="text-xs text-ink-muted font-bold uppercase tracking-wider">
                              #{challenger.position} · {formatINR(challenger.spend_on_board, true)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-2 border-t border-bg-border text-xs text-ink-muted font-bold uppercase tracking-wider text-center">
                        Gap: <span className="text-ink num">{formatINR(gap, true)}</span>
                        {" "}— {challenger.product.name} needs{" "}
                        <span className="text-ink num">{formatINR(gap + 100, true)}</span>
                        {" "}more to overtake
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent overtakes */}
            <div>
              <h2 className="text-sm font-black text-ink uppercase tracking-widest border-b border-bg-border pb-2 mb-4">
                Recent Overtakes
              </h2>
              {overtakes.length === 0 ? (
                <div className="border border-bg-border py-10 text-center text-ink-muted font-bold uppercase tracking-wider">
                  <p className="text-sm">No overtakes recorded yet.</p>
                </div>
              ) : (
                <div className="border border-bg-border bg-bg-surface p-1">
                  <ActivityFeed initialEvents={overtakes} compact={false} />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Board positions 1-10 */}
            <div>
              <h2 className="text-sm font-black text-ink uppercase tracking-widest border-b border-bg-border pb-2 mb-4">
                Top 10
              </h2>
              <div className="border border-bg-border bg-bg-surface">
                {positions.slice(0, 10).map((pos, i) => (
                  <div
                    key={pos.product.id}
                    className="flex items-center gap-3 px-3 py-2.5 border-b border-bg-border last:border-b-0 hover:bg-bg transition-colors"
                  >
                    <span
                      className={`text-sm font-display font-black num flex-shrink-0 w-6 text-right ${
                        i === 0
                          ? "rank-gold"
                          : i === 1
                          ? "rank-silver"
                          : i === 2
                          ? "rank-bronze"
                          : "text-ink"
                      }`}
                    >
                      #{pos.position}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link
                         href={`/product/${pos.product.id}`}
                         className="text-xs font-bold text-ink uppercase tracking-wider truncate block"
                      >
                        {pos.product.name}
                      </Link>
                    </div>
                    <span className="text-xs font-bold text-ink-muted num flex-shrink-0">
                      {formatINR(pos.spend_on_board, true)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="border border-bg-border p-5 bg-bg-elevated text-center">
              <h3 className="font-display font-black text-lg text-ink uppercase tracking-tight mb-2">Want to battle?</h3>
              <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-5">
                List your product and start competing. Attack any position above you.
              </p>
              <Link
                href="/submit"
                id="battles-submit-btn"
                className="btn-primary w-full py-2 block text-center"
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
