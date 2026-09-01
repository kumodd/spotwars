import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LiveBoard from "@/components/board/LiveBoard";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Internet Billboard for Products",
  description:
    "A live public internet billboard where products compete for attention and visibility. See what's ranking right now on InternetBillboard.space.",
};

async function getBoardData() {
  const supabase = await createClient();
  const { data: board } = await supabase
    .from("boards")
    .select("id, slug")
    .eq("slug", "global")
    .single();

  if (!board) return null;

  const { data: positions } = await supabase
    .from("board_positions")
    .select(`
      position, previous_position, spend_on_board,
      product:products (*)
    `)
    .eq("board_id", board.id)
    .order("position", { ascending: true })
    .limit(10);

  return {
    boardId: board.id,
    boardSlug: board.slug,
    entries: (positions || []).map((p: any) => ({
      position: p.position,
      previous_position: p.previous_position,
      spend_on_board: p.spend_on_board,
      product: p.product,
      movement: (p.previous_position ?? p.position) - p.position,
    })),
  };
}

export default async function InternetBillboardPage() {
  const data = await getBoardData();

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 w-full">
        <header className="mb-12 text-center sm:text-left">
          <p className="text-xs text-ink uppercase tracking-widest font-black mb-3">
            InternetBillboard.space
          </p>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight mb-4 uppercase">
            Internet Billboard for Products
          </h1>
          <p className="text-ink-muted text-base font-bold uppercase tracking-wider leading-relaxed max-w-2xl">
            A live public billboard where internet products compete for attention and visibility.
          </p>
        </header>

        <section className="mb-12 border-t border-bg-border pt-8">
          <h2 className="font-display font-black text-2xl text-ink mb-4 uppercase">
            What is an Internet Billboard?
          </h2>
          <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed mb-6">
            Unlike traditional advertising where you pay for clicks that happen in the background, 
            an internet billboard is a live, transparent arena. Products pay for their position 
            on the board, and users visit the board specifically to discover them.
          </p>
          <p className="text-ink-muted text-sm font-bold uppercase tracking-wider leading-relaxed mb-6">
            Founders launch their products, claim a spot, and battle competitors in real-time. 
            The higher the position, the more traffic and visibility the product receives.
          </p>
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-black text-2xl text-ink uppercase">
              The Live Board
            </h2>
            <Link href="/" className="text-xs font-bold text-ink-muted hover:text-ink uppercase tracking-wider">
              View Full Board →
            </Link>
          </div>
          
          <div className="bg-bg-surface border border-bg-border p-4 md:p-6 shadow-sm">
            {data ? (
              <LiveBoard
                boardId={data.boardId}
                boardSlug={data.boardSlug}
                initialEntries={data.entries}
                isAuthenticated={false}
                userProductIds={[]}
                limit={10}
                showHeader={false}
              />
            ) : (
              <div className="text-center py-10 text-ink-muted text-sm font-bold uppercase tracking-wider">
                Board is currently empty
              </div>
            )}
            
            <div className="mt-8 text-center border-t border-bg-border pt-6">
              <Link href="/" className="btn-primary px-8 py-3">
                Explore The Live Board
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is an internet billboard?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "An internet billboard is a live public platform where products and startups compete for visibility by purchasing positions on a leaderboard."
                }
              },
              {
                "@type": "Question",
                "name": "How are products ranked?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Products are ranked based on their total attention spend on the board. A higher spend pushes the product higher up the live billboard."
                }
              }
            ]
          }),
        }}
      />
    </div>
  );
}
