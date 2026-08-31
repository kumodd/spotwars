import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ActivityFeed from "@/components/feed/ActivityFeed";
import { formatINR, formatNumber } from "@/lib/utils";
import type { ActivityEvent, Product } from "@/lib/types";
import { ExternalLink, TrendingUp, MousePointerClick, Eye, ArrowLeft } from "lucide-react";
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === product.founder_id;

  const positions = product.board_positions || [];
  const topPos = positions.reduce(
    (best, bp) => (!best || bp.position < best.position ? bp : best),
    positions[0]
  );

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#555555] hover:text-[#CCCCCC] transition-colors mb-6"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Live Board
        </Link>

        {/* Product header */}
        <div className="border-b border-[#1A1A1A] pb-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Logo */}
            <div className="w-16 h-16 rounded border border-[#242424] bg-[#181818] flex items-center justify-center font-bold text-2xl text-[#E85D27] flex-shrink-0 overflow-hidden">
              {product.logo_url ? (
                <img
                  src={product.logo_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                product.name.charAt(0)
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
                    {product.name}
                  </h1>
                  <p className="text-[#666666] text-base mt-1">{product.tagline}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="badge">{product.category}</span>
                    <span className="badge">{product.pricing}</span>
                    <span className="badge">{product.country}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && (
                    <Link
                      href="/dashboard"
                      className="px-3 py-1.5 rounded-sm border border-[#2A2A2A] text-[#E85D27] text-xs font-medium hover:bg-[#181818] transition-all"
                    >
                      Your Product
                    </Link>
                  )}
                  <VisitButton productId={product.id} url={product.url} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1A1A1A] border border-[#1A1A1A] rounded-sm overflow-hidden mb-6">
          {[
            {
              label: "Board Rank",
              value: topPos ? `#${topPos.position}` : "—",
              sub: topPos?.board?.name || "not ranked",
              highlight: !!topPos,
            },
            {
              label: "SpotScore",
              value: `${product.spot_score.toFixed(0)}/100`,
              sub: "attention score",
              highlight: false,
            },
            {
              label: "Clicks",
              value: formatNumber(product.click_count),
              sub: "outbound clicks",
              highlight: false,
            },
            {
              label: "Impressions",
              value: formatNumber(product.impression_count),
              sub: "board views",
              highlight: false,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`px-4 py-4 ${stat.highlight ? "bg-[#181818]" : "bg-[#111111]"}`}
            >
              <div className="text-[10px] uppercase tracking-wider text-[#444444] mb-1 font-semibold">
                {stat.label}
              </div>
              <div
                className={`stat-value text-xl ${
                  stat.highlight ? "text-[#D4A017]" : "text-[#F0F0F0]"
                }`}
              >
                {stat.value}
              </div>
              <div className="text-[10px] text-[#3A3A3A] mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-4">

            {/* Description */}
            {product.description && (
              <div className="border border-[#1A1A1A] rounded-sm p-5 bg-[#111111]">
                <h2 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-3">About</h2>
                <p className="text-[#AAAAAA] text-sm leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            {/* Board Positions */}
            {positions.length > 0 && (
              <div className="border border-[#1A1A1A] rounded-sm overflow-hidden bg-[#111111]">
                <div className="px-5 py-3 border-b border-[#1A1A1A]">
                  <h2 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Competing On</h2>
                </div>
                <div>
                  {positions.map(
                    (bp) =>
                      bp.board && (
                        <Link
                          key={bp.board.id}
                          href={`/board?board=${bp.board.slug}`}
                          className="flex items-center justify-between px-5 py-3 border-b border-[#1A1A1A] last:border-b-0 hover:bg-[#181818] transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{bp.board.icon}</span>
                            <span className="text-sm text-[#CCCCCC]">{bp.board.name}</span>
                          </div>
                          <div className="flex items-center gap-6 text-right">
                            <div>
                              <div className="text-sm font-semibold text-white num">#{bp.position}</div>
                              <div className="text-[10px] text-[#444444]">rank</div>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white num">
                                {formatINR(bp.spend_on_board, true)}
                              </div>
                              <div className="text-[10px] text-[#444444]">spend</div>
                            </div>
                          </div>
                        </Link>
                      )
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="border border-[#1A1A1A] rounded-sm p-5 bg-[#111111]">
                <h2 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-3">Tags</h2>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span key={tag} className="badge">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Attention budget */}
            <div className="border border-[#1A1A1A] rounded-sm p-5 bg-[#111111]">
              <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-3">
                Attention Budget
              </h3>
              <div className="stat-value text-2xl text-white mb-0.5">
                {formatINR(product.total_spend, true)}
              </div>
              <p className="text-[10px] text-[#444444] mb-3">total spent competing</p>
              <p className="text-[10px] text-[#3A3A3A] leading-relaxed border-t border-[#1A1A1A] pt-3">
                Sponsored position — rank reflects spend, not quality or endorsement.
              </p>
            </div>

            {/* Founder info */}
            {(product.founder_name || product.company_name) && (
              <div className="border border-[#1A1A1A] rounded-sm p-5 bg-[#111111]">
                <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-3">Made by</h3>
                <p className="text-sm text-white font-medium">
                  {product.company_name || product.founder_name}
                </p>
                {product.founder_name && product.company_name && (
                  <p className="text-xs text-[#555555] mt-0.5">{product.founder_name}</p>
                )}
              </div>
            )}

            {/* Activity */}
            <div className="border border-[#1A1A1A] rounded-sm overflow-hidden bg-[#111111]">
              <div className="px-5 py-3 border-b border-[#1A1A1A]">
                <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Activity</h3>
              </div>
              <div className="p-4">
                {events.length === 0 ? (
                  <p className="text-[#444444] text-xs">No activity yet.</p>
                ) : (
                  <ActivityFeed initialEvents={events.slice(0, 8)} compact={false} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
