"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import ProductRow from "./ProductRow";
import { RefreshCw } from "lucide-react";
import type { BoardEntry, Product } from "@/lib/types";

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
      const mapped: BoardEntry[] = (
        data as unknown as Array<{
          position: number;
          previous_position?: number;
          spend_on_board: number;
          product: Product;
        }>
      ).map((row) => ({
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
    <div className="border-t border-bg-border">
      {/* Optional board sub-header */}
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-bg-border bg-bg-surface">
          <div className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 flex-shrink-0 ${
                isLive ? "bg-accent-red" : "bg-ink-muted"
              }`}
            />
            <span className="text-xs font-black text-ink uppercase tracking-wide">
              {isLive ? "Live" : "Board"}
            </span>
            <span suppressHydrationWarning className="text-ink-muted font-bold uppercase tracking-widest text-[10px]">
              · updated {lastUpdateStr}
            </span>
          </div>
          <button
            onClick={fetchBoard}
            disabled={isRefreshing}
            className="flex items-center gap-1 text-ink-muted hover:text-ink text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      )}

      {/* Column headers */}
      <div className="hidden md:flex items-center px-4 py-3 border-b border-bg-border bg-bg-surface">
        <div className="w-12 flex-shrink-0 text-right pr-3">
          <span className="text-[10px] uppercase tracking-widest text-ink font-black">#</span>
        </div>
        <div className="w-8 flex-shrink-0 mr-3" />
        <div className="flex-1 mr-4">
          <span className="text-[10px] uppercase tracking-widest text-ink font-black">Product</span>
        </div>
        <div className="flex items-center gap-8 flex-shrink-0 mr-4">
          <div className="text-right w-20">
            <span className="text-[10px] uppercase tracking-widest text-ink font-black">Attention</span>
          </div>
          <div className="text-right w-10">
            <span className="text-[10px] uppercase tracking-widest text-ink font-black">Move</span>
          </div>
          <div className="text-right w-16">
            <span className="text-[10px] uppercase tracking-widest text-ink font-black">Clicks</span>
          </div>
        </div>
        <div className="w-16 flex-shrink-0" />
      </div>

      {/* Board rows */}
      {entries.length === 0 ? (
        <div className="text-center py-16 text-ink">
          <p className="text-sm font-bold uppercase tracking-wider">No products on this board yet.</p>
          <p className="text-[10px] mt-2 text-ink-muted font-bold uppercase tracking-widest">Be the first to stake your claim.</p>
        </div>
      ) : (
        <div>
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
