import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LiveBoard from "@/components/board/LiveBoard";
import ActivityFeed from "@/components/feed/ActivityFeed";
import { formatINR, formatNumber } from "@/lib/utils";
import type { BoardEntry, ActivityEvent, Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "InternetBillboard.space — Live Internet Attention Market",
  description:
    "Products competing for attention right now. Real-time rankings driven by spend, clicks, and momentum.",
};

async function getHomepageData() {
  const supabase = await createClient();

  // Get global board
  const { data: board } = await supabase
    .from("boards")
    .select("id, name, slug")
    .eq("slug", "global")
    .single();

  if (!board) return { board: null, entries: [], events: [], stats: null };

  // Get top 50 for homepage
  const { data: positions } = await supabase
    .from("board_positions")
    .select(`
      position, previous_position, spend_on_board,
      product:products (
        id, name, url, logo_url, tagline, category, tags,
        click_count, impression_count, spot_score, momentum_score,
        total_spend, status, founder_id
      )
    `)
    .eq("board_id", board.id)
    .order("position", { ascending: true })
    .limit(50);

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

  // Recent activity
  const { data: rawEvents } = await supabase
    .from("activity_events")
    .select("*, product:products(id, name, logo_url)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(40);

  const events = (rawEvents || []) as ActivityEvent[];

  // Platform stats
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: clickCount } = await supabase
    .from("product_clicks")
    .select("*", { count: "exact", head: true });

  // Today's events count (moves)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count: movesToday } = await supabase
    .from("activity_events")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayStart.toISOString());

  // Total spend on board (top 50)
  const totalOnBoard = entries.reduce((sum, e) => sum + e.spend_on_board, 0);

  return {
    board,
    entries,
    events,
    stats: {
      products: productCount || 0,
      clicks: clickCount || 0,
      movesToday: movesToday || 0,
      totalOnBoard,
    },
  };
}

async function getAuthState() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { isAuthenticated: false, userProductIds: [] };

  const { data: products } = await supabase
    .from("products")
    .select("id")
    .eq("founder_id", user.id);

  return {
    isAuthenticated: true,
    userProductIds: (products || []).map((p: { id: string }) => p.id),
  };
}

export default async function HomePage() {
  const [
    { board, entries, events, stats },
    { isAuthenticated, userProductIds },
  ] = await Promise.all([getHomepageData(), getAuthState()]);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <Navbar />

      {/* ── Activity ticker tape — below nav, above board ── */}
      <ActivityFeed initialEvents={events} compact={true} />

      {/* ── Dashboard Hero ── */}
      <div className="pt-10 pb-6 px-4 sm:px-6 max-w-6xl mx-auto text-center md:text-left mt-4 md:mt-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <span className="live-dot w-2 h-2" aria-hidden="true" />
              <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight uppercase leading-none">
                Live Board
              </h1>
            </div>
            {stats && (
              <div className="flex items-center justify-center md:justify-start gap-3 text-ink-muted text-xs font-bold uppercase tracking-widest flex-wrap">
                <span><strong className="text-ink text-sm">{formatNumber(stats.products)}</strong> products</span>
                <span className="text-bg-border" aria-hidden="true">·</span>
                <span><strong className="text-ink text-sm">{formatNumber(stats.movesToday)}</strong> moves today</span>
                <span className="text-bg-border" aria-hidden="true">·</span>
                <span><strong className="text-ink text-sm">{formatINR(stats.totalOnBoard, true)}</strong> on board</span>
              </div>
            )}
          </div>
          
          {/* Secondary CTA */}
          <div className="flex-shrink-0">
            <Link href="/submit" className="btn-secondary px-5 py-2.5 shadow-sm bg-white">
              List Your Product
            </Link>
          </div>
        </div>
      </div>

      {/* ── Filter / Navigation Strip ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8 w-full">
        <div className="flex justify-center md:justify-start overflow-x-auto pb-1 scrollbar-none">
          <div className="segmented-control rounded-sm">
            {["All", "Trending", "Fastest Rising", "New", "Top Attention", "Most Clicked"].map(
              (f, i) => (
                <button
                  key={f}
                  className={`segment-btn ${i === 0 ? "active" : ""}`}
                  aria-pressed={i === 0}
                >
                  {f}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 lg:gap-12 items-start">
        
        {/* Left Column: Live Board */}
        <div>
          {board ? (
            <div>
              <LiveBoard
                boardId={board.id}
                boardSlug={board.slug}
                initialEntries={entries}
                isAuthenticated={isAuthenticated}
                userProductIds={userProductIds}
                limit={50}
                showHeader={false}
              />
            </div>
          ) : (
            <div className="border border-bg-border mx-4 sm:mx-0 my-6">
              <div className="py-20 text-center">
                <p className="font-display font-black text-2xl text-ink uppercase tracking-tight mb-2">
                  The Board Is Just Getting Started
                </p>
                <p className="text-ink-muted text-sm font-semibold uppercase tracking-widest mb-6">
                  Be one of the first products on InternetBillboard.space
                </p>
                <Link href="/submit" className="btn-primary px-6 py-3">
                  List Your Product
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Activity Feed (Sticky) */}
        <div className="sticky top-16 pt-2 lg:border-l border-bg-border lg:pl-10">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-bg-border">
            <div className="flex items-center gap-2.5">
              <span className="live-dot w-1.5 h-1.5" />
              <h2 className="text-sm font-black text-ink uppercase tracking-widest">
                Live Activity
              </h2>
            </div>
            <Link
              href="/activity"
              className="text-xs font-bold text-ink-muted hover:text-ink transition-colors uppercase tracking-wider"
            >
              All →
            </Link>
          </div>
          <ActivityFeed initialEvents={events.slice(0, 15)} compact={false} />
        </div>
      </div>

      <div className="mt-auto w-full">
        <Footer />
      </div>
    </div>
  );
}
