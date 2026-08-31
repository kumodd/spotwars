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
  title: "SpotWars — Live Internet Attention Market",
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

  // Today's clicks
  const { count: clicksToday } = await supabase
    .from("product_clicks")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayStart.toISOString());

  return {
    board,
    entries,
    events,
    stats: {
      products: productCount || 0,
      clicks: clickCount || 0,
      movesToday: movesToday || 0,
      clicksToday: clicksToday || 0,
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
    <div className="min-h-screen bg-[#0C0C0C]">
      <Navbar />

      {/* ── Status bar ── */}
      <div className="status-bar pt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="font-semibold text-[#CCCCCC] uppercase tracking-wide text-xs">Live</span>
            </div>
            {stats && (
              <>
                <span className="text-[#555555]">·</span>
                <span className="num text-[#888888]">
                  <span className="text-[#CCCCCC] font-semibold">{formatNumber(stats.products)}</span>{" "}
                  products competing
                </span>
                <span className="text-[#555555]">·</span>
                <span className="num text-[#888888]">
                  <span className="text-[#CCCCCC] font-semibold">{formatNumber(stats.movesToday)}</span>{" "}
                  moves today
                </span>
                <span className="text-[#555555]">·</span>
                <span className="num text-[#888888]">
                  <span className="text-[#CCCCCC] font-semibold">{formatNumber(stats.clicksToday)}</span>{" "}
                  clicks today
                </span>
              </>
            )}
          </div>
          <Link
            href="/submit"
            id="status-bar-submit"
            className="btn-primary text-xs font-semibold px-3 py-1.5 rounded-sm flex items-center gap-1.5"
          >
            List Your Product →
          </Link>
        </div>
      </div>

      {/* ── Board header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-5">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-white tracking-tight">
              LIVE BOARD
            </h1>
            <p className="text-[#555555] text-sm mt-1">
              Products competing for attention right now
            </p>
          </div>
          <Link
            href="/board"
            className="text-xs text-[#555555] hover:text-[#CCCCCC] transition-colors"
          >
            Full board →
          </Link>
        </div>
      </div>

      {/* ── Filter strip ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {/* Filters are client-side — rendering static active state for All */}
          {["All", "Trending", "Fastest Rising", "New", "Top Attention", "Most Clicked"].map(
            (f, i) => (
              <button key={f} className={`filter-tab ${i === 0 ? "active" : ""}`}>
                {f}
              </button>
            )
          )}
          <div className="w-px h-4 bg-[#2A2A2A] mx-1 flex-shrink-0" />
          {["AI", "SaaS", "Dev Tools", "E-commerce", "Consumer"].map((cat) => (
            <Link
              key={cat}
              href={`/board?board=${cat.toLowerCase().replace(" ", "-")}`}
              className="filter-tab"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Live Board ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
        {board ? (
          <LiveBoard
            boardId={board.id}
            boardSlug={board.slug}
            initialEntries={entries}
            isAuthenticated={isAuthenticated}
            userProductIds={userProductIds}
            limit={50}
            showHeader={false}
          />
        ) : (
          <div className="border border-[#1A1A1A] rounded-sm py-16 text-center text-[#444444]">
            <p className="text-sm">Board loading...</p>
          </div>
        )}
      </div>

      {/* ── Activity ticker ── */}
      <div className="border-t border-[#1A1A1A]">
        <ActivityFeed initialEvents={events} compact={true} />
      </div>

      {/* ── Live activity feed strip ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 border-t border-[#1A1A1A]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#888888] uppercase tracking-wider">
            Live Activity
          </h2>
          <Link href="/activity" className="text-xs text-[#555555] hover:text-[#CCCCCC] transition-colors">
            See all →
          </Link>
        </div>
        <ActivityFeed initialEvents={events.slice(0, 10)} compact={false} />
      </div>

      {/* ── Single CTA ── */}
      <div className="border-t border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-display font-bold text-lg text-white">List your product</h2>
            <p className="text-[#555555] text-sm mt-1">
              Enter the board. Compete for attention. Get discovered.{" "}
              <Link href="/how-it-works" className="text-[#777777] hover:text-[#CCCCCC] underline underline-offset-2 transition-colors">
                How it works
              </Link>
            </p>
          </div>
          <Link
            href="/submit"
            id="footer-cta-submit"
            className="btn-primary px-5 py-2.5 rounded-sm text-sm font-semibold flex-shrink-0"
          >
            List Your Product — ₹49
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
