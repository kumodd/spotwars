"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import ProductRow from "./ProductRow";
import { Radio, RefreshCw } from "lucide-react";
import type { BoardEntry, Product, BoardPosition } from "@/lib/types";

interface LiveBoardProps {
  boardId: string;
  boardSlug: string;
  initialEntries: BoardEntry[];
  isAuthenticated: boolean;
  userProductIds?: string[];
  limit?: number;
  showHeader?: boolean;
}

export default function LiveBoard({
  boardId,
  boardSlug,
  initialEntries,
  isAuthenticated,
  userProductIds = [],
  limit = 100,
  showHeader = true,
}: LiveBoardProps) {
  const [entries, setEntries] = useState<BoardEntry[]>(initialEntries);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Use useRef to avoid creating supabase client during SSR/prerender
  const supabaseRef = typeof window !== "undefined" ? createClient() : null;
  const supabase = supabaseRef!;

  const fetchBoard = useCallback(async () => {
    setIsRefreshing(true);
    const { data } = await supabase
      .from("board_positions")
      .select(`
        position,
        previous_position,
        spend_on_board,
        position_changed_at,
        product:products (
          id, name, url, logo_url, tagline, category, tags,
          click_count, impression_count, spot_score, momentum_score,
          total_spend, status, founder_id
        )
      `)
      .eq("board_id", boardId)
      .order("position", { ascending: true })
      .limit(limit);

    if (data) {
      const mapped: BoardEntry[] = (data as unknown as Array<{
        position: number;
        previous_position?: number;
        spend_on_board: number;
        product: Product;
      }>).map((row) => ({
        position: row.position,
        previous_position: row.previous_position,
        spend_on_board: row.spend_on_board,
        product: row.product,
        movement: (row.previous_position ?? row.position) - row.position,
      }));
      setEntries(mapped);
      setLastUpdate(new Date());
    }
    setIsRefreshing(false);
  }, [boardId, limit, supabase]);

  useEffect(() => {
    // Subscribe to realtime board position changes
    const channel = supabase
      .channel(`board:${boardId}-${Math.random().toString(36).substring(7)}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "board_positions",
          filter: `board_id=eq.${boardId}`,
        },
        () => {
          fetchBoard();
        }
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, fetchBoard, supabase]);

  const lastUpdateStr = lastUpdate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`live-dot ${isLive ? "bg-red-500" : "bg-slate-600"}`} />
            <span className="font-display font-bold text-white text-lg">
              {isLive ? "🔴 LIVE BOARD" : "BOARD"}
            </span>
            <span suppressHydrationWarning className="text-slate-500 text-xs">Updated {lastUpdateStr}</span>
          </div>
          <button
            onClick={fetchBoard}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated text-slate-400 hover:text-white text-sm transition-all hover:bg-bg-border disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Radio className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-display text-lg">No products on this board yet.</p>
          <p className="text-sm mt-1">Be the first to stake your claim!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <ProductRow
              key={entry.product.id}
              entry={entry}
              boardId={boardId}
              boardSlug={boardSlug}
              rank={i + 1}
              isAuthenticated={isAuthenticated}
              userProductIds={userProductIds}
              onAttackSuccess={fetchBoard}
            />
          ))}
        </div>
      )}
    </div>
  );
}
