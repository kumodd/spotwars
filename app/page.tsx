import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LiveBoard from "@/components/board/LiveBoard";
import ActivityFeed from "@/components/feed/ActivityFeed";
import { formatINR, formatNumber } from "@/lib/utils";
import type { BoardEntry, ActivityEvent, Product, Board } from "@/lib/types";
import { Zap, TrendingUp, Users, BarChart3, Swords, Trophy, ArrowRight, Shield, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "SpotWars — The Internet Attention Market",
  description: "Products compete. The internet decides what gets seen. Put your product on the live leaderboard and fight for the spotlight.",
};

async function getHomepageData() {
  const supabase = await createClient();

  // Get global board ID
  const { data: board } = await supabase
    .from("boards")
    .select("id, name, slug")
    .eq("slug", "global")
    .single();

  if (!board) return { board: null, entries: [], events: [], stats: null };

  // Get top 10 for homepage board preview
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
    .limit(10);

  const entries: BoardEntry[] = (positions || [])
    .filter(row => row.product)
    .map((row: unknown) => {
      const r = row as { position: number; previous_position?: number; spend_on_board: number; product: Product };
      return {
        position: r.position,
        previous_position: r.previous_position,
        spend_on_board: r.spend_on_board,
        product: r.product,
        movement: (r.previous_position ?? r.position) - r.position,
      };
    });

  // Get recent activity
  const { data: rawEvents } = await supabase
    .from("activity_events")
    .select("*, product:products(id, name, logo_url)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(30);

  const events = (rawEvents || []) as ActivityEvent[];

  // Platform stats
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { data: spendData } = await supabase
    .from("board_positions")
    .select("spend_on_board")
    .eq("board_id", board.id);

  const totalSpend = (spendData || []).reduce((sum, p) => sum + (p.spend_on_board || 0), 0);

  const { count: clickCount } = await supabase
    .from("product_clicks")
    .select("*", { count: "exact", head: true });

  return {
    board,
    entries,
    events,
    stats: {
      products: productCount || 0,
      totalSpend,
      clicks: clickCount || 0,
    },
  };
}

async function getAuthState() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
  const [{ board, entries, events, stats }, { isAuthenticated, userProductIds }] = await Promise.all([
    getHomepageData(),
    getAuthState(),
  ]);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-12 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent-purple/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent-red/8 rounded-full blur-[100px] pointer-events-none" />

        {/* Live badge */}
        <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-elevated border border-bg-border mb-6 animate-slide-in-up">
          <span className="live-dot" />
          <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">
            LIVE — Products competing now
          </span>
          {stats && (
            <span className="text-xs text-accent-purple font-bold">
              {stats.products} active
            </span>
          )}
        </div>

        {/* Headline */}
        <h1 className="relative font-display font-black text-center mb-6 leading-[0.95] tracking-tight"
          style={{ fontSize: "clamp(3rem, 10vw, 7rem)" }}>
          <span className="block text-white">THE INTERNET</span>
          <span className="block text-gradient-purple">ATTENTION</span>
          <span className="block text-white">MARKET</span>
        </h1>

        <p className="relative text-center text-slate-400 text-lg sm:text-xl max-w-xl mb-8 leading-relaxed">
          Products compete. The internet decides what gets seen.
          <br />
          <span className="text-white font-medium">Put your product in the arena. Fight for the spotlight.</span>
        </p>

        {/* CTAs */}
        <div className="relative flex flex-col sm:flex-row items-center gap-3 mb-12">
          <Link
            href="/submit"
            id="hero-submit-btn"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-accent-purple hover:bg-accent-purple-light text-white font-bold font-display text-lg transition-all shadow-2xl shadow-accent-purple/30 hover:shadow-accent-purple/50 glow-purple"
          >
            <Zap className="w-5 h-5" />
            List Your Product — ₹49
          </Link>
          <Link
            href="/board"
            id="hero-board-btn"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl glass border border-bg-border text-white font-semibold text-lg hover:border-accent-purple/40 transition-all"
          >
            <Swords className="w-5 h-5 text-accent-red" />
            Explore Live Board
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </Link>
        </div>

        {/* Stats bar */}
        {stats && (
          <div className="relative flex items-center gap-6 sm:gap-10 text-center">
            <div>
              <div className="font-display font-bold text-2xl sm:text-3xl text-white">
                {formatNumber(stats.products)}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Active Products</div>
            </div>
            <div className="w-px h-8 bg-bg-border" />
            <div>
              <div className="font-display font-bold text-2xl sm:text-3xl text-white">
                {formatINR(stats.totalSpend, true)}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Total Spend</div>
            </div>
            <div className="w-px h-8 bg-bg-border" />
            <div>
              <div className="font-display font-bold text-2xl sm:text-3xl text-white">
                {formatNumber(stats.clicks)}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Clicks Tracked</div>
            </div>
          </div>
        )}
      </section>

      {/* ─── TICKER FEED ─── */}
      <ActivityFeed initialEvents={events} compact={true} />

      {/* ─── LIVE BOARD PREVIEW ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white flex items-center gap-2">
              🔴 LIVE BOARD
              <span className="text-sm font-normal text-slate-500 font-sans">Global</span>
            </h2>
            <p className="text-slate-400 text-sm mt-1">Top 10 products competing for the global spotlight</p>
          </div>
          <Link href="/board" className="flex items-center gap-1 text-sm text-accent-purple-light hover:text-accent-purple transition-colors font-medium">
            View All 100 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {board ? (
          <LiveBoard
            boardId={board.id}
            boardSlug={board.slug}
            initialEntries={entries}
            isAuthenticated={isAuthenticated}
            userProductIds={userProductIds}
            limit={10}
            showHeader={false}
          />
        ) : (
          <div className="text-center py-16 text-slate-500">
            <p>Board loading...</p>
          </div>
        )}

        <div className="text-center mt-6">
          <Link href="/board" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-bg-border text-slate-300 hover:text-white hover:border-accent-purple/40 text-sm font-medium transition-all">
            See all {stats?.products || 0} competing products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-bg-border">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-center text-white mb-12">
          How SpotWars Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: "01",
              icon: <Zap className="w-6 h-6" />,
              title: "List Your Product",
              desc: "Submit your product with ₹49 minimum entry fee. Go live on the global board immediately.",
              color: "text-accent-purple",
              bg: "bg-accent-purple/10",
              border: "border-accent-purple/20",
            },
            {
              step: "02",
              icon: <TrendingUp className="w-6 h-6" />,
              title: "Buy Attention Budget",
              desc: "Your spend determines your rank. See exactly what ₹X puts you at position #N.",
              color: "text-accent-blue",
              bg: "bg-accent-blue/10",
              border: "border-accent-blue/20",
            },
            {
              step: "03",
              icon: <Swords className="w-6 h-6" />,
              title: "Battle Competitors",
              desc: "Overtake rivals, defend your position, and watch the leaderboard evolve live.",
              color: "text-accent-red",
              bg: "bg-accent-red/10",
              border: "border-accent-red/20",
            },
            {
              step: "04",
              icon: <Users className="w-6 h-6" />,
              title: "Get Traffic & Customers",
              desc: "Higher position = more clicks = more customers. Real-time click tracking included.",
              color: "text-accent-emerald",
              bg: "bg-accent-emerald/10",
              border: "border-accent-emerald/20",
            },
          ].map((item) => (
            <div key={item.step} className={`glass rounded-2xl border ${item.border} p-6 card-hover`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                  {item.icon}
                </div>
                <span className="font-display font-black text-4xl text-bg-elevated">{item.step}</span>
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-2xl text-white">Category Boards</h2>
          <Link href="/board" className="text-sm text-accent-purple-light hover:text-accent-purple transition-colors font-medium flex items-center gap-1">
            All boards <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { icon: "🤖", name: "AI & ML", slug: "ai-ml" },
            { icon: "☁️", name: "SaaS", slug: "saas" },
            { icon: "🛠️", name: "Dev Tools", slug: "dev-tools" },
            { icon: "🛒", name: "E-commerce", slug: "ecommerce" },
            { icon: "💰", name: "Fintech", slug: "fintech" },
            { icon: "🎓", name: "Education", slug: "education" },
            { icon: "📱", name: "Consumer Apps", slug: "consumer-apps" },
            { icon: "🎨", name: "Creator Tools", slug: "creator-tools" },
            { icon: "🌐", name: "Global", slug: "global" },
            { icon: "⚔️", name: "Battles", slug: null },
          ].map((cat) => (
            <Link
              key={cat.slug || cat.name}
              href={cat.slug ? `/board?board=${cat.slug}` : "/battles"}
              className="flex flex-col items-center gap-2 p-4 rounded-xl glass border border-bg-border hover:border-accent-purple/40 transition-all card-hover text-center"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-sm font-medium text-slate-300">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── VALUE PROPS ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-bg-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple-light text-xs font-medium tracking-wide uppercase mb-6">
              <Trophy className="w-3 h-3" />
              Built for founders
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-6 leading-tight">
              More exciting than
              <br />an ad. More useful
              <br />than a directory.
            </h2>
            <div className="space-y-4">
              {[
                {
                  icon: <BarChart3 className="w-5 h-5 text-accent-purple" />,
                  title: "Real-time Analytics",
                  desc: "Track impressions, clicks, CTR, position history, and momentum score — all live.",
                },
                {
                  icon: <Target className="w-5 h-5 text-accent-red" />,
                  title: "Competitive Intelligence",
                  desc: "Know exactly how much to spend to overtake a competitor. Compete strategically.",
                },
                {
                  icon: <Shield className="w-5 h-5 text-accent-emerald" />,
                  title: "Defend Your Position",
                  desc: "Get instant alerts when a competitor attacks. Respond fast. Stay at the top.",
                },
              ].map((vp) => (
                <div key={vp.title} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-bg-elevated border border-bg-border flex-shrink-0 mt-0.5">
                    {vp.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{vp.title}</h4>
                    <p className="text-slate-400 text-sm mt-0.5 leading-relaxed">{vp.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fake product card preview */}
          <div className="relative">
            <div className="glass-elevated rounded-2xl border border-bg-border p-6 shadow-2xl shadow-black/40">
              <div className="flex items-center gap-2 mb-4">
                <span className="live-dot" />
                <span className="text-xs text-slate-400 font-medium">Live — Your Dashboard</span>
              </div>
              <div className="space-y-3">
                {[
                  { rank: "🥇 #1", name: "VoiceAI", spend: "₹3,821", clicks: "8,921", up: "+12" },
                  { rank: "🥈 #2", name: "FlowAI", spend: "₹2,990", clicks: "6,214", up: "+4" },
                  { rank: "🥉 #3", name: "AgentX", spend: "₹2,240", clicks: "4,891", up: "-1" },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? "bg-accent-gold/5 border border-accent-gold/10" : "bg-bg-surface border border-bg-border"}`}>
                    <span className={`text-sm font-bold w-12 text-center ${i === 0 ? "text-accent-gold" : "text-slate-400"}`}>{item.rank}</span>
                    <div className="flex-1">
                      <span className="text-white text-sm font-semibold">{item.name}</span>
                    </div>
                    <span className="text-xs text-slate-400">{item.spend}</span>
                    <span className="text-xs text-slate-500">{item.clicks}</span>
                    <span className={`text-xs font-bold ${item.up.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>{item.up}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 animate-pulse-red">
                <p className="text-xs text-red-300 font-medium">⚔️ <strong>FlowAI</strong> attacked your position — <strong>₹3,250 to reclaim #1</strong></p>
              </div>
            </div>
            {/* Decorative glow */}
            <div className="absolute -inset-4 bg-accent-purple/5 rounded-3xl blur-xl -z-10" />
          </div>
        </div>
      </section>

      {/* ─── ACTIVITY FEED SECTION ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-bg-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display font-bold text-2xl text-white mb-2">Latest Moves</h2>
            <p className="text-slate-400 text-sm mb-5">Real-time activity from across the SpotWars arena</p>
            <ActivityFeed initialEvents={events.slice(0, 12)} compact={false} />
          </div>
          <div className="flex flex-col justify-center">
            <div className="glass rounded-2xl border border-bg-border p-8 text-center">
              <div className="text-5xl mb-4">⚔️</div>
              <h3 className="font-display font-bold text-2xl text-white mb-3">
                Ready to compete?
              </h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Join {stats?.products || 0} products already fighting for attention on the internet's live leaderboard.
              </p>
              <Link
                href="/submit"
                id="feed-cta-btn"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-purple hover:bg-accent-purple-light text-white font-bold transition-all shadow-lg shadow-accent-purple/25"
              >
                <Zap className="w-4 h-4" />
                List Your Product — ₹49
              </Link>
              <p className="text-xs text-slate-600 mt-3">No subscription. Pay only to compete.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
