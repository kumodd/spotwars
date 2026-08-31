import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LiveBoard from "@/components/board/LiveBoard";
import { Radio } from "lucide-react";
import type { BoardEntry, Board, Product } from "@/lib/types";
import BoardTabs from "./BoardTabs";

export const metadata: Metadata = {
  title: "Live Board — All Competing Products",
  description: "See all products competing for attention on SpotWars. Real-time rankings, spend data, and click metrics.",
};

const BOARDS = [
  { slug: "global", label: "🌐 Global", icon: "🌐" },
  { slug: "ai-ml", label: "🤖 AI & ML", icon: "🤖" },
  { slug: "saas", label: "☁️ SaaS", icon: "☁️" },
  { slug: "dev-tools", label: "🛠️ Dev Tools", icon: "🛠️" },
  { slug: "ecommerce", label: "🛒 E-commerce", icon: "🛒" },
  { slug: "fintech", label: "💰 Fintech", icon: "💰" },
  { slug: "education", label: "🎓 Education", icon: "🎓" },
  { slug: "consumer-apps", label: "📱 Consumer Apps", icon: "📱" },
  { slug: "creator-tools", label: "🎨 Creator Tools", icon: "🎨" },
];

async function getBoardData(boardSlug: string) {
  const supabase = await createClient();

  const { data: board } = await supabase
    .from("boards")
    .select("id, name, slug, description, icon, entry_fee")
    .eq("slug", boardSlug)
    .single();

  if (!board) return { board: null, entries: [], isAuthenticated: false, userProductIds: [] };

  const { data: positions } = await supabase
    .from("board_positions")
    .select(`
      position, previous_position, spend_on_board, position_changed_at,
      product:products (
        id, name, url, logo_url, tagline, category, tags,
        click_count, impression_count, spot_score, momentum_score,
        total_spend, status, founder_id
      )
    `)
    .eq("board_id", board.id)
    .order("position", { ascending: true })
    .limit(100);

  const entries: BoardEntry[] = (positions || [])
    .filter(row => (row as unknown as { product: Product }).product)
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

  const { data: { user } } = await supabase.auth.getUser();
  let userProductIds: string[] = [];
  if (user) {
    const { data: products } = await supabase
      .from("products")
      .select("id")
      .eq("founder_id", user.id);
    userProductIds = (products || []).map((p: { id: string }) => p.id);
  }

  return {
    board,
    entries,
    isAuthenticated: !!user,
    userProductIds,
  };
}

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ board?: string }>;
}) {
  const { board: boardSlug = "global" } = await searchParams;
  const validSlug = BOARDS.find(b => b.slug === boardSlug) ? boardSlug : "global";
  const { board, entries, isAuthenticated, userProductIds } = await getBoardData(validSlug);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="live-dot" />
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Live Competitive Board</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-white">
            {board?.icon} {board?.name || "Global Board"}
          </h1>
          {board?.description && (
            <p className="text-slate-400 mt-2 max-w-xl">{board.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="text-slate-500">{entries.length} products competing</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">Entry from ₹49</span>
          </div>
        </div>

        {/* Board Tabs */}
        <BoardTabs boards={BOARDS} currentSlug={validSlug} />

        {/* Board */}
        <Suspense fallback={<div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-16 rounded-xl skeleton" />)}</div>}>
          {board ? (
            <LiveBoard
              boardId={board.id}
              boardSlug={board.slug}
              initialEntries={entries}
              isAuthenticated={isAuthenticated}
              userProductIds={userProductIds}
              limit={100}
            />
          ) : (
            <div className="text-center py-20 text-slate-500">
              <Radio className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-display text-xl">Board not found</p>
            </div>
          )}
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
