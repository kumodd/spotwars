import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ActivityFeed from "@/components/feed/ActivityFeed";
import { formatINR, formatNumber, getSpotScoreColor } from "@/lib/utils";
import type { ActivityEvent, Product } from "@/lib/types";
import { TrendingUp, MousePointerClick, Eye, Shield, Tag, Globe } from "lucide-react";
import VisitButton from "@/components/product/VisitButton";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

async function getProductData(id: string) {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id, name, url, logo_url, tagline, description, category, country, pricing, tags,
      social_links, founder_name, company_name, status,
      total_spend, click_count, impression_count, spot_score, momentum_score,
      created_at, founder_id,
      board_positions (
        position, previous_position, spend_on_board,
        board:boards (id, name, slug, icon)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !product) return null;

  // Get recent activity for this product
  const { data: rawEvents } = await supabase
    .from("activity_events")
    .select("*")
    .eq("product_id", id)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(15);

  // Record impression
  await supabase.from("product_impressions").insert({ product_id: id });

  return {
    product: product as unknown as Product & {
      board_positions: Array<{
        position: number;
        previous_position?: number;
        spend_on_board: number;
        board: { id: string; name: string; slug: string; icon: string } | null;
      }>;
    },
    events: (rawEvents || []) as ActivityEvent[],
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getProductData(id);
  if (!data) return { title: "Product Not Found" };
  const { product } = data;
  return {
    title: `${product.name} — SpotWars`,
    description: product.tagline,
    openGraph: {
      title: `${product.name} on SpotWars`,
      description: product.tagline,
      images: product.logo_url ? [{ url: product.logo_url }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const data = await getProductData(id);
  if (!data) notFound();

  const { product, events } = data;

  if (product.status === "banned") notFound();

  // Auth check for attack button
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === product.founder_id;

  const positions = product.board_positions || [];
  const topPos = positions.reduce((best, bp) =>
    !best || bp.position < best.position ? bp : best, positions[0]
  );

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-bg-elevated border border-bg-border flex items-center justify-center font-black text-3xl text-accent-purple flex-shrink-0 overflow-hidden">
            {product.logo_url ? (
              <img src={product.logo_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              product.name.charAt(0)
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-display font-black text-3xl sm:text-4xl text-white">{product.name}</h1>
                <p className="text-slate-400 text-lg mt-1">{product.tagline}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-lg bg-bg-elevated border border-bg-border text-xs text-slate-400">
                    {product.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-bg-elevated border border-bg-border text-xs text-slate-400">
                    {product.pricing}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-bg-elevated border border-bg-border text-xs text-slate-400">
                    {product.country}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOwner && (
                  <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-accent-purple/20 text-accent-purple-light text-sm font-medium border border-accent-purple/30 hover:bg-accent-purple/30 transition-all">
                    Your Product
                  </Link>
                )}
                <VisitButton productId={product.id} url={product.url} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            {
              icon: <Shield className="w-4 h-4 text-accent-gold" />,
              label: "Board Rank",
              value: topPos ? `#${topPos.position}` : "—",
              sub: topPos?.board?.name || "not ranked",
              accent: true,
            },
            {
              icon: <TrendingUp className="w-4 h-4 text-accent-purple" />,
              label: "SpotScore",
              value: `${product.spot_score.toFixed(0)}/100`,
              sub: "attention score",
            },
            {
              icon: <MousePointerClick className="w-4 h-4 text-accent-blue" />,
              label: "Clicks",
              value: formatNumber(product.click_count),
              sub: "outbound clicks",
            },
            {
              icon: <Eye className="w-4 h-4 text-accent-emerald" />,
              label: "Impressions",
              value: formatNumber(product.impression_count),
              sub: "board views",
            },
          ].map((stat) => (
            <div key={stat.label} className={`glass rounded-xl border p-4 ${stat.accent ? "border-accent-gold/20 bg-accent-gold/5" : "border-bg-border"}`}>
              <div className="flex items-center gap-2 mb-1">
                {stat.icon}
                <span className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</span>
              </div>
              <div className={`font-display font-bold text-2xl ${stat.accent ? "text-accent-gold" : "text-white"}`}>
                {stat.value}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Description */}
            {product.description && (
              <div className="glass rounded-2xl border border-bg-border p-5">
                <h2 className="font-display font-bold text-white mb-3">About</h2>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {/* Board Positions */}
            {positions.length > 0 && (
              <div className="glass rounded-2xl border border-bg-border p-5">
                <h2 className="font-display font-bold text-white mb-4">Competing On</h2>
                <div className="space-y-2">
                  {positions.map((bp) => bp.board && (
                    <Link
                      key={bp.board.id}
                      href={`/board?board=${bp.board.slug}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated border border-bg-border hover:border-accent-purple/40 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span>{bp.board.icon}</span>
                        <span className="text-white font-medium text-sm">{bp.board.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-white font-bold text-sm">#{bp.position}</div>
                          <div className="text-xs text-slate-600">rank</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold text-sm">{formatINR(bp.spend_on_board, true)}</div>
                          <div className="text-xs text-slate-600">spend</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="glass rounded-2xl border border-bg-border p-5">
                <h2 className="font-display font-bold text-white mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-bg-elevated border border-bg-border text-slate-400 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Spend info */}
            <div className="glass rounded-2xl border border-bg-border p-5">
              <h3 className="font-display font-bold text-white mb-3">Attention Budget</h3>
              <div className="text-3xl font-display font-black text-white mb-1">
                {formatINR(product.total_spend, true)}
              </div>
              <p className="text-xs text-slate-500 mb-4">total spent competing</p>
              <div className="text-xs text-slate-600 p-2 rounded-lg bg-bg-elevated border border-bg-border">
                💡 Sponsored position — rank reflects spend, not quality
              </div>
            </div>

            {/* Founder info */}
            {(product.founder_name || product.company_name) && (
              <div className="glass rounded-2xl border border-bg-border p-5">
                <h3 className="font-display font-bold text-white mb-3">Made by</h3>
                <p className="text-white font-medium">{product.company_name || product.founder_name}</p>
                {product.founder_name && product.company_name && (
                  <p className="text-slate-400 text-sm mt-0.5">{product.founder_name}</p>
                )}
              </div>
            )}

            {/* Activity */}
            <div className="glass rounded-2xl border border-bg-border p-5">
              <h3 className="font-display font-bold text-white mb-3">Activity</h3>
              {events.length === 0 ? (
                <p className="text-slate-500 text-sm">No activity yet.</p>
              ) : (
                <ActivityFeed initialEvents={events.slice(0, 8)} compact={false} />
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
