import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LiveBoard from "@/components/board/LiveBoard";
import type { BoardEntry, Product } from "@/lib/types";
import BoardTabs from "./BoardTabs";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Live Board — SpotWars",
  description:
    "All products competing for attention on SpotWars. Real-time rankings, spend data, and click metrics.",
};

const BOARDS = [
  { slug: "global", label: "Global" },
  { slug: "ai-ml", label: "AI & ML" },
  { slug: "saas", label: "SaaS" },
  { slug: "dev-tools", label: "Dev Tools" },
  { slug: "ecommerce", label: "E-commerce" },
  { slug: "fintech", label: "Fintech" },
  { slug: "education", label: "Education" },
  { slug: "consumer-apps", label: "Consumer Apps" },
  { slug: "creator-tools", label: "Creator Tools" },
];

async function getBoardData(boardSlug: string) {
  const supabase = await createClient();

  const { data: board } = await supabase
    .from("boards")
    .select("id, name, slug, description, icon, entry_fee")
    .eq("slug", boardSlug)
    .single();

  if (!board)
    return {
      board: null,
      entries: [],
      isAuthenticated: false,
      userProductIds: [],
    };

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
    .filter((row) => (row as unknown as { product: Product }).product)
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

  const {
    data: { user },
  } = await supabase.auth.getUser();
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
  const validSlug = BOARDS.find((b) => b.slug === boardSlug)
    ? boardSlug
    : "global";
  const { board, entries, isAuthenticated, userProductIds } =
    await getBoardData(validSlug);

  const currentBoard = BOARDS.find((b) => b.slug === validSlug);

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">

        {/* Page header */}
        <div className="border-b border-[#1A1A1A] pb-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="live-dot" />
            <span className="text-xs text-[#555555] font-medium uppercase tracking-wider">
              Live Competitive Board
            </span>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl text-white tracking-tight">
                {currentBoard?.label || "Global"} Board
              </h1>
              {board?.description && (
                <p className="text-[#555555] text-sm mt-1">{board.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-[#444444]">
                <span className="num">{entries.length} products competing</span>
                <span>·</span>
                <span>Entry from ₹49</span>
              </div>
            </div>
            <Link
              href="/submit"
              className="btn-primary px-4 py-2 rounded-sm text-sm font-semibold"
            >
              List Your Product
            </Link>
          </div>
        </div>

        {/* Board category tabs */}
        <BoardTabs boards={BOARDS} currentSlug={validSlug} />

        {/* Board */}
        <Suspense
          fallback={
            <div className="border border-[#1A1A1A] rounded-sm overflow-hidden">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-14 skeleton border-b border-[#111111]" />
              ))}
            </div>
          }
        >
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
            <div className="border border-[#1A1A1A] rounded-sm py-20 text-center text-[#444444]">
              <p className="text-sm">Board not found.</p>
            </div>
          )}
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
