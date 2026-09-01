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
    title: `${product.name} — Product Profile & Live Ranking | InternetBillboard.space`,
    description: product.tagline,
    openGraph: {
      title: `${product.name} on InternetBillboard.space`,
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
    <div className="min-h-screen bg-bg text-ink">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-16">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink hover:text-ink-muted transition-colors mb-6 uppercase tracking-wider"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Live Board
        </Link>

        {/* Product header */}
        <div className="border-b border-bg-border pb-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Logo */}
            <div className="w-20 h-20 border border-bg-border bg-bg flex items-center justify-center font-black text-3xl text-ink flex-shrink-0">
              {product.logo_url ? (
                <img
                  src={product.logo_url}
                  alt={product.name}
                  className="w-full h-full object-cover grayscale opacity-90"
                />
              ) : (
                product.name.charAt(0)
              )}
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight uppercase">
                    {product.name}
                  </h1>
                  <p className="text-ink-muted text-lg mt-2 font-bold uppercase tracking-wider leading-relaxed">{product.tagline}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="badge">{product.category}</span>
                    <span className="badge">{product.pricing}</span>
                    <span className="badge">{product.country}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                  {isOwner && (
                    <Link
                      href="/dashboard"
                      className="btn-secondary px-4 py-2"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-bg-border bg-bg mb-10">
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
          ].map((stat, i, arr) => (
            <div
              key={stat.label}
              className={`px-5 py-5 ${stat.highlight ? "bg-bg-surface" : "bg-bg"} ${i < arr.length - 1 ? "border-r border-bg-border" : ""} ${i === 1 && "max-sm:border-r-0"} border-b sm:border-b-0 border-bg-border last:border-b-0`}
            >
              <div className="text-[10px] font-black uppercase tracking-widest text-ink mb-2">
                {stat.label}
              </div>
              <div
                className={`stat-value text-2xl ${
                  stat.highlight ? "text-ink" : "text-ink"
                }`}
              >
                {stat.value}
              </div>
              <div className="text-[10px] text-ink-muted mt-1 font-bold uppercase tracking-wider">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">

            {/* Description */}
            {product.description && (
              <div className="border border-bg-border p-6 bg-bg-surface">
                <h2 className="text-sm font-black text-ink uppercase tracking-widest mb-4 border-b border-bg-border pb-2">About</h2>
                <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {product.description}
                </p>
              </div>
            )}

            {/* Board Positions */}
            {positions.length > 0 && (
              <div className="border border-bg-border overflow-hidden bg-bg-surface">
                <div className="px-6 py-4 border-b border-bg-border">
                  <h2 className="text-sm font-black text-ink uppercase tracking-widest">Competing On</h2>
                </div>
                <div>
                  {positions.map(
                    (bp) =>
                      bp.board && (
                        <Link
                          key={bp.board.id}
                          href={`/board?board=${bp.board.slug}`}
                          className="flex items-center justify-between px-6 py-4 border-b border-bg-border last:border-b-0 hover:bg-bg transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{bp.board.icon}</span>
                            <span className="text-sm font-bold text-ink uppercase tracking-wider">{bp.board.name}</span>
                          </div>
                          <div className="flex items-center gap-8 text-right">
                            <div>
                              <div className="text-base font-black text-ink num">#{bp.position}</div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">rank</div>
                            </div>
                            <div>
                              <div className="text-base font-black text-ink num">
                                {formatINR(bp.spend_on_board, true)}
                              </div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">spend</div>
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
              <div className="border border-bg-border p-6 bg-bg-surface">
                <h2 className="text-sm font-black text-ink uppercase tracking-widest mb-4 border-b border-bg-border pb-2">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="badge bg-bg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">

            {/* Attention budget */}
            <div className="border border-bg-border p-6 bg-bg-surface text-center">
              <h3 className="text-sm font-black text-ink uppercase tracking-widest mb-4">
                Attention Budget
              </h3>
              <div className="stat-value text-3xl text-ink mb-1">
                {formatINR(product.total_spend, true)}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-4">total spent competing</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink leading-relaxed border-t border-bg-border pt-4">
                Sponsored position — rank reflects spend, not quality or endorsement.
              </p>
            </div>

            {/* Founder info */}
            {(product.founder_name || product.company_name) && (
              <div className="border border-bg-border p-6 bg-bg-surface text-center">
                <h3 className="text-sm font-black text-ink uppercase tracking-widest mb-4 border-b border-bg-border pb-2">Made by</h3>
                <p className="text-base text-ink font-bold uppercase tracking-wider">
                  {product.company_name || product.founder_name}
                </p>
                {product.founder_name && product.company_name && (
                  <p className="text-xs font-bold uppercase tracking-widest text-ink-muted mt-1">{product.founder_name}</p>
                )}
              </div>
            )}

            {/* Activity */}
            <div className="border border-bg-border overflow-hidden bg-bg-surface">
              <div className="px-6 py-4 border-b border-bg-border">
                <h3 className="text-sm font-black text-ink uppercase tracking-widest">Recent Activity</h3>
              </div>
              <div className="p-2">
                {events.length === 0 ? (
                  <p className="text-ink-muted font-bold uppercase tracking-widest text-xs text-center py-4">No activity yet.</p>
                ) : (
                  <ActivityFeed initialEvents={events.slice(0, 8)} compact={false} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Product",
                "name": product.name,
                "description": product.description || product.tagline,
                "category": product.category,
                "url": `https://internetbillboard.space/product/${product.id}`,
                "image": product.logo_url || "https://internetbillboard.space/logo.jpg"
              },
              {
                "@type": "SoftwareApplication",
                "name": product.name,
                "applicationCategory": product.category
              },
              {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://internetbillboard.space/"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": product.category || "Products",
                    "item": `https://internetbillboard.space/category/${(product.category || "all").toLowerCase().replace(/ /g, '-')}`
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": product.name,
                    "item": `https://internetbillboard.space/product/${product.id}`
                  }
                ]
              }
            ]
          })
        }}
      />
    </div>
  );
}
