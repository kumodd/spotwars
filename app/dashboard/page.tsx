import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ActivityFeed from "@/components/feed/ActivityFeed";
import { formatINR, formatNumber, costToTake, getMovement } from "@/lib/utils";
import type { ActivityEvent, Product } from "@/lib/types";
import {
  TrendingUp, TrendingDown, MousePointerClick,
  Trophy, ExternalLink, Plus, AlertTriangle
} from "lucide-react";
import DeleteProductButton from "@/components/dashboard/DeleteProductButton";

export const metadata: Metadata = {
  title: "Dashboard — Your Products | InternetBillboard.space",
};

async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select(`
      id, name, url, logo_url, tagline, category, status,
      total_spend, click_count, impression_count, spot_score, momentum_score,
      board_positions (
        position, previous_position, spend_on_board, board_id,
        board:boards (id, name, slug, icon)
      )
    `)
    .eq("founder_id", userId)
    .order("created_at", { ascending: false });

  const productIds = (products || []).map((p: { id: string }) => p.id);

  let events: ActivityEvent[] = [];
  if (productIds.length > 0) {
    const { data: rawEvents } = await supabase
      .from("activity_events")
      .select("*, product:products(id, name, logo_url)")
      .in("product_id", productIds)
      .order("created_at", { ascending: false })
      .limit(20);
    events = (rawEvents || []) as ActivityEvent[];
  }

  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // Fetch all board positions for gap-to-next computation
  // For each product, get the entry just above it on its board
  const boardPositionsAbove: Record<string, { spend_on_board: number; position: number }> = {};
  for (const product of products || []) {
    const bp = (product as unknown as { board_positions: Array<{ position: number; board_id: string; spend_on_board: number }> }).board_positions;
    if (!bp || bp.length === 0) continue;
    const topBp = bp.reduce((best, cur) => (!best || cur.position < best.position ? cur : best), bp[0]);
    if (topBp.position <= 1) continue;
    const { data: above } = await supabase
      .from("board_positions")
      .select("position, spend_on_board")
      .eq("board_id", topBp.board_id)
      .eq("position", topBp.position - 1)
      .single();
    if (above) boardPositionsAbove[product.id] = above;
  }

  return {
    products: (products || []) as unknown as (Product & {
      board_positions: Array<{
        position: number;
        previous_position?: number;
        spend_on_board: number;
        board_id: string;
        board: { id: string; name: string; slug: string; icon: string } | null;
      }>;
    })[],
    events,
    totalProducts: totalProducts || 0,
    boardPositionsAbove,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/dashboard");

  const { products, events, totalProducts, boardPositionsAbove } = await getDashboardData(user.id);

  const totalSpend = products.reduce((sum, p) => sum + p.total_spend, 0);
  const totalClicks = products.reduce((sum, p) => sum + p.click_count, 0);
  const totalImpressions = products.reduce((sum, p) => sum + p.impression_count, 0);
  const activeProducts = products.filter(p => p.status === "active");

  return (
    <div className="min-h-screen bg-bg text-ink">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-16">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 pb-6 border-b border-bg-border">
          <div>
            <p className="board-col-header mb-1">Your Account</p>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-ink uppercase tracking-tight leading-none">
              Dashboard
            </h1>
            <p className="text-ink-muted text-xs mt-2 font-semibold uppercase tracking-widest">
              {products.length} product{products.length !== 1 ? "s" : ""} · competing among {totalProducts} on the board
            </p>
          </div>
          <Link
            href="/submit"
            id="dashboard-add-product-btn"
            className="btn-primary px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </Link>
        </div>

        {/* ── Summary metrics ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-bg-border border border-bg-border mb-8">
          {[
            {
              label: "Total Spend",
              value: formatINR(totalSpend, true),
              sub: "across all boards",
            },
            {
              label: "Total Clicks",
              value: formatNumber(totalClicks),
              sub: "outbound clicks",
            },
            {
              label: "Impressions",
              value: formatNumber(totalImpressions),
              sub: "board views",
            },
            {
              label: "Products",
              value: products.length.toString(),
              sub: `${activeProducts.length} active`,
            },
          ].map((stat) => (
            <div key={stat.label} className="metric-card">
              <div className="metric-card-value">{stat.value}</div>
              <div className="metric-card-label">{stat.label}</div>
              <div className="text-[10px] text-ink-muted mt-0.5 font-medium uppercase tracking-wider">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Products list ── */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-bg-border">
              <h2 className="text-sm font-black text-ink uppercase tracking-widest">Your Products</h2>
              <Trophy className="w-4 h-4 text-ink-muted" />
            </div>

            {products.length === 0 ? (
              <div className="border border-bg-border bg-bg-surface py-16 text-center">
                <p className="font-display font-black text-xl text-ink uppercase tracking-tight mb-2">
                  No Products Yet
                </p>
                <p className="text-ink-muted text-xs font-semibold uppercase tracking-widest mb-6">
                  List your first product and enter the board for ₹49
                </p>
                <Link href="/submit" className="btn-primary px-6 py-3 inline-block">
                  List Your Product
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => {
                  const positions = product.board_positions || [];
                  const topPosition = positions.reduce(
                    (best, bp) => (!best || bp.position < best.position ? bp : best),
                    positions[0]
                  );
                  const movement = topPosition
                    ? getMovement(topPosition.position, topPosition.previous_position)
                    : 0;

                  const aboveEntry = boardPositionsAbove[product.id];
                  const gapToNext = aboveEntry && topPosition
                    ? aboveEntry.spend_on_board - topPosition.spend_on_board + 100
                    : null;
                  const takeCost = topPosition ? costToTake(topPosition.spend_on_board) : null;

                  return (
                    <div key={product.id} className="product-card">
                      {/* Top row: logo + name + status + actions */}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-bg-surface border border-bg-border flex items-center justify-center font-black text-ink text-sm flex-shrink-0">
                          {product.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-black text-ink text-sm uppercase tracking-wide truncate leading-none">
                                {product.name}
                              </h3>
                              <p className="text-ink-muted text-xs truncate mt-0.5">{product.tagline}</p>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className={`badge ${product.status === "active"
                                  ? "border-accent-green text-accent-green"
                                  : product.status === "pending"
                                    ? "border-accent-gold text-accent-gold"
                                    : "border-bg-border text-ink-muted"
                                }`}>
                                {product.status}
                              </span>
                              <DeleteProductButton productId={product.id} />
                              <a
                                href={product.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-ink-muted hover:text-ink border border-transparent hover:border-bg-border transition-all"
                                title="Visit product"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>

                          {/* Metrics row */}
                          <div className="flex items-center gap-4 mt-3 flex-wrap">
                            {/* Position */}
                            <div>
                              <div className="font-display font-black text-lg text-ink leading-none">
                                {topPosition ? `#${topPosition.position}` : "—"}
                              </div>
                              <div className="board-col-header mt-0.5">rank</div>
                            </div>

                            {/* Movement */}
                            {movement !== 0 && (
                              <div className={`flex items-center gap-0.5 text-xs font-bold ${movement > 0 ? "move-up" : "move-down"}`}>
                                {movement > 0
                                  ? <TrendingUp className="w-3 h-3" />
                                  : <TrendingDown className="w-3 h-3" />}
                                {movement > 0 ? `+${movement}` : movement}
                              </div>
                            )}

                            {/* Spend */}
                            <div>
                              <div className="font-black text-ink text-sm num">{formatINR(product.total_spend, true)}</div>
                              <div className="board-col-header mt-0.5">spent</div>
                            </div>

                            {/* Clicks */}
                            <div>
                              <div className="flex items-center gap-1">
                                <MousePointerClick className="w-3 h-3 text-ink-muted" />
                                <span className="font-black text-ink text-sm num">{formatNumber(product.click_count)}</span>
                              </div>
                              <div className="board-col-header mt-0.5">clicks</div>
                            </div>

                            {/* Gap to next */}
                            {gapToNext !== null && gapToNext > 0 && topPosition && (
                              <div className="ml-auto">
                                <div className="metric-gap">
                                  <strong>{formatINR(gapToNext, true)}</strong> to #{topPosition.position - 1}
                                </div>
                                <div className="board-col-header mt-0.5 text-right">gap</div>
                              </div>
                            )}
                          </div>

                          {/* Board tags */}
                          {positions.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                              {positions.map((bp) => bp.board && (
                                <Link
                                  key={bp.board_id}
                                  href={`/board?board=${bp.board.slug}`}
                                  className="badge hover:border-ink hover:text-ink transition-colors"
                                >
                                  {bp.board.icon} {bp.board.name} · #{bp.position}
                                </Link>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-bg-border">
                            {topPosition && takeCost !== null && (
                              <Link
                                href={`/board?board=${positions.find(p => p.position === topPosition.position)?.board?.slug || "global"}`}
                                className="take-btn text-xs"
                              >
                                Improve Position
                              </Link>
                            )}
                            <Link
                              href={`/product/${product.id}`}
                              className="btn-ghost px-3 py-1.5 text-xs"
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Right column: Activity + alert ── */}
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-bg-border">
              <h2 className="text-sm font-black text-ink uppercase tracking-widest">Your Activity</h2>
              <span className="live-dot" />
            </div>

            <div className="border border-bg-border bg-bg-surface p-4 mb-4">
              {events.length === 0 ? (
                <p className="text-center py-6 text-ink-muted text-xs font-semibold uppercase tracking-widest">
                  No activity yet. List a product to start competing.
                </p>
              ) : (
                <ActivityFeed initialEvents={events} compact={false} />
              )}
            </div>

            {/* Stay-alert notice */}
            {activeProducts.length > 0 && (
              <div className="border border-bg-border bg-bg-surface p-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-ink-muted flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-ink uppercase tracking-wide mb-1">Stay Alert</p>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      Competitors can take your position at any time. Check the board and defend when needed.
                    </p>
                    <Link
                      href="/board"
                      className="text-xs font-black text-ink uppercase tracking-wider underline underline-offset-2 mt-2 inline-block hover:text-ink-muted transition-colors"
                    >
                      View Live Board →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
