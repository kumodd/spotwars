import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LiveBoard from "@/components/board/LiveBoard";
import ActivityFeed from "@/components/feed/ActivityFeed";
import { formatNumber } from "@/lib/utils";
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
    <div className="min-h-screen bg-bg text-ink">
      <Navbar />

      {/* ── Status bar ── */}
      <div className="status-bar border-b border-bg-border bg-bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between flex-wrap gap-3 py-1">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="font-bold text-ink uppercase tracking-wider text-xs">Live</span>
            </div>
            {stats && (
              <>
                <span className="text-ink">·</span>
                <span className="num text-ink-muted text-xs font-semibold uppercase tracking-wider">
                  <span className="text-ink font-bold">{formatNumber(stats.products)}</span>{" "}
                  products
                </span>
                <span className="text-ink">·</span>
                <span className="num text-ink-muted text-xs font-semibold uppercase tracking-wider">
                  <span className="text-ink font-bold">{formatNumber(stats.movesToday)}</span>{" "}
                  moves today
                </span>
                <span className="text-ink">·</span>
                <span className="num text-ink-muted text-xs font-semibold uppercase tracking-wider">
                  <span className="text-ink font-bold">{formatNumber(stats.clicksToday)}</span>{" "}
                  clicks today
                </span>
              </>
            )}
          </div>
          <Link
            href="/submit"
            id="status-bar-submit"
            className="btn-primary px-3 py-1.5"
          >
            List Your Product
          </Link>
        </div>
      </div>

      {/* ── Board header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8 border-b border-bg-border">
        <div className="flex flex-col items-center text-center gap-4">
          <h1 className="font-display font-black text-4xl sm:text-6xl text-ink tracking-tight uppercase">
            Live Board
          </h1>
          <p className="text-ink-muted text-sm sm:text-base font-bold uppercase tracking-widest max-w-xl">
            The Internet's Products Competing For Attention
          </p>
        </div>
      </div>

      {/* ── Filter strip ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 border-b border-bg-border">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["All", "Trending", "Fastest Rising", "New", "Top Attention", "Most Clicked"].map(
            (f, i) => (
              <button key={f} className={`filter-tab uppercase tracking-wider text-xs ${i === 0 ? "active" : ""}`}>
                {f}
              </button>
            )
          )}
        </div>
      </div>

      {/* ── Live Board ── */}
      <div className="max-w-7xl mx-auto px-0 sm:px-6 py-8">
        {board ? (
          <div className="border-t border-bg-border border-b sm:border">
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
          <div className="border border-bg-border py-16 text-center text-ink-muted font-bold uppercase tracking-widest">
            <p className="text-sm">Board loading...</p>
          </div>
        )}
      </div>

      {/* ── Activity ticker ── */}
      <ActivityFeed initialEvents={events} compact={true} />

      {/* ── Live activity feed strip ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6 border-b border-bg-border pb-2">
          <h2 className="text-sm font-black text-ink uppercase tracking-widest">
            Latest Moves
          </h2>
          <Link href="/activity" className="text-xs font-bold text-ink hover:text-ink-muted transition-colors uppercase tracking-wider">
            View All Activity →
          </Link>
        </div>
        <ActivityFeed initialEvents={events.slice(0, 10)} compact={false} />
      </div>

      {/* ── Single CTA ── */}
      <div className="border-t border-bg-border bg-bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center text-center gap-6">
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-ink uppercase tracking-tight">List your product</h2>
            <p className="text-ink-muted text-sm mt-3 font-semibold uppercase tracking-widest">
              Enter the board. Compete for attention. Get discovered.
            </p>
          </div>
          <Link
            href="/submit"
            id="footer-cta-submit"
            className="btn-primary px-8 py-3 text-base"
          >
            List Your Product — ₹49
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
