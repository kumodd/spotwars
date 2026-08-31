import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ActivityFeed from "@/components/feed/ActivityFeed";
import { formatINR, formatNumber, getMovement } from "@/lib/utils";
import type { ActivityEvent, Product } from "@/lib/types";
import {
  TrendingUp, TrendingDown, MousePointerClick, DollarSign,
  Eye, Swords, Trophy, Zap, AlertTriangle, Plus, ExternalLink
} from "lucide-react";
import DeleteProductButton from "@/components/dashboard/DeleteProductButton";

export const metadata: Metadata = {
  title: "Dashboard — Your Products",
};

async function getDashboardData(userId: string) {
  const supabase = await createClient();

  // Get all user products with board positions
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

  // Get recent activity for user's products
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

  // Platform-wide stats (for context)
  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  return { products: (products || []) as unknown as (Product & {
    board_positions: Array<{
      position: number;
      previous_position?: number;
      spend_on_board: number;
      board_id: string;
      board: { id: string; name: string; slug: string; icon: string } | null;
    }>;
  })[], events, totalProducts: totalProducts || 0 };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/dashboard");

  const { products, events, totalProducts } = await getDashboardData(user.id);

  const totalSpend = products.reduce((sum, p) => sum + p.total_spend, 0);
  const totalClicks = products.reduce((sum, p) => sum + p.click_count, 0);
  const totalImpressions = products.reduce((sum, p) => sum + p.impression_count, 0);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white">Your Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              {products.length} product{products.length !== 1 ? "s" : ""} · competing among {totalProducts} in the arena
            </p>
          </div>
          <Link
            href="/submit"
            id="dashboard-add-product-btn"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-purple hover:bg-accent-purple-light text-white font-semibold text-sm transition-all shadow-lg shadow-accent-purple/25"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            {
              icon: <DollarSign className="w-5 h-5 text-accent-purple" />,
              label: "Total Spend",
              value: formatINR(totalSpend, true),
              sub: "across all boards",
              bg: "bg-accent-purple/5 border-accent-purple/20",
            },
            {
              icon: <MousePointerClick className="w-5 h-5 text-accent-blue" />,
              label: "Total Clicks",
              value: formatNumber(totalClicks),
              sub: "outbound clicks",
              bg: "bg-accent-blue/5 border-accent-blue/20",
            },
            {
              icon: <Eye className="w-5 h-5 text-accent-emerald" />,
              label: "Impressions",
              value: formatNumber(totalImpressions),
              sub: "board views",
              bg: "bg-accent-emerald/5 border-accent-emerald/20",
            },
            {
              icon: <Trophy className="w-5 h-5 text-accent-gold" />,
              label: "Products",
              value: products.length.toString(),
              sub: `${products.filter(p => p.status === "active").length} active`,
              bg: "bg-accent-gold/5 border-accent-gold/20",
            },
          ].map((stat) => (
            <div key={stat.label} className={`glass rounded-xl border ${stat.bg} p-4`}>
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-bg-elevated">{stat.icon}</div>
              </div>
              <div className="font-display font-bold text-2xl text-white">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.sub}</div>
              <div className="text-xs text-slate-600 mt-0.5 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2">
            <h2 className="font-display font-bold text-xl text-white mb-4">Your Products</h2>

            {products.length === 0 ? (
              <div className="glass rounded-2xl border border-bg-border p-10 text-center">
                <Swords className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                <h3 className="font-display font-bold text-xl text-white mb-2">No products yet</h3>
                <p className="text-slate-400 text-sm mb-5">List your first product and enter the arena for ₹49.</p>
                <Link href="/submit" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-purple text-white font-semibold text-sm transition-all hover:bg-accent-purple-light">
                  <Zap className="w-4 h-4" /> List Your Product
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => {
                  const positions = product.board_positions || [];
                  const topPosition = positions.reduce((best, bp) =>
                    !best || bp.position < best.position ? bp : best, positions[0]
                  );
                  const movement = topPosition
                    ? getMovement(topPosition.position, topPosition.previous_position)
                    : 0;

                  return (
                    <div key={product.id} className="glass-elevated rounded-2xl border border-bg-border p-5 card-hover">
                      <div className="flex items-start gap-4">
                        {/* Logo */}
                        <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-bg-border flex items-center justify-center font-bold text-accent-purple text-lg flex-shrink-0">
                          {product.name.charAt(0)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-display font-bold text-white text-lg">{product.name}</h3>
                              <p className="text-slate-400 text-sm truncate">{product.tagline}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                                product.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                                product.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                                "bg-slate-500/20 text-slate-400"
                              }`}>
                                {product.status}
                              </span>
                              <DeleteProductButton productId={product.id} />
                              <a href={product.url} target="_blank" rel="noreferrer"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-bg-elevated transition-all">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>

                          {/* Stats row */}
                          <div className="flex items-center gap-4 mt-3 flex-wrap">
                            <div className="text-center">
                              <div className="font-display font-bold text-white text-sm">
                                {topPosition ? `#${topPosition.position}` : "—"}
                              </div>
                              <div className="text-xs text-slate-600">rank</div>
                            </div>
                            {movement !== 0 && (
                              <div className={`flex items-center gap-0.5 text-xs font-semibold ${movement > 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {movement > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {movement > 0 ? `+${movement}` : movement}
                              </div>
                            )}
                            <div className="text-center">
                              <div className="font-bold text-white text-sm">{formatINR(product.total_spend, true)}</div>
                              <div className="text-xs text-slate-600">spent</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-white text-sm">{formatNumber(product.click_count)}</div>
                              <div className="text-xs text-slate-600">clicks</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-accent-purple text-sm">{product.spot_score.toFixed(0)}</div>
                              <div className="text-xs text-slate-600">SpotScore</div>
                            </div>
                          </div>

                          {/* Boards */}
                          {positions.length > 0 && (
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              {positions.map((bp) => bp.board && (
                                <Link
                                  key={bp.board_id}
                                  href={`/board?board=${bp.board.slug}`}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-bg-elevated border border-bg-border text-xs text-slate-400 hover:text-white hover:border-accent-purple/40 transition-all"
                                >
                                  {bp.board.icon} {bp.board.name} · #{bp.position}
                                </Link>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-4">
                            {topPosition && (
                              <Link
                                href={`/board?board=${positions.find(p => p.position === topPosition.position)?.board?.slug || "global"}`}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-purple/20 text-accent-purple-light hover:bg-accent-purple/30 text-xs font-medium transition-all"
                              >
                                <Zap className="w-3 h-3" /> Boost Position
                              </Link>
                            )}
                            <Link
                              href={`/product/${product.id}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated text-slate-400 hover:text-white text-xs font-medium transition-all border border-bg-border hover:border-bg-border"
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

          {/* Activity Feed */}
          <div>
            <h2 className="font-display font-bold text-xl text-white mb-4">Your Activity</h2>
            <div className="glass rounded-2xl border border-bg-border p-4">
              {events.length === 0 ? (
                <div className="text-center py-6 text-slate-600 text-sm">
                  No activity yet. List a product to start competing!
                </div>
              ) : (
                <ActivityFeed initialEvents={events} compact={false} />
              )}
            </div>

            {/* Attack notifications */}
            {products.some(p => p.status === "active") && (
              <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 animate-pulse-red">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-300 text-xs font-semibold">⚔️ Stay Alert</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Competitors can attack your position anytime. Check the board regularly and boost when needed.
                    </p>
                    <Link href="/board" className="text-xs text-accent-purple-light underline mt-1 inline-block">
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
