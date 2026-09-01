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
    <div>
      {/* Optional board sub-header */}
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-bg-border bg-bg-surface">
          <div className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                isLive ? "bg-accent-red" : "bg-bg-border"
              }`}
              aria-label={isLive ? "Connected live" : "Connecting"}
            />
            <span className="text-xs font-black text-ink uppercase tracking-widest">
              {isLive ? "Live" : "Connecting"}
            </span>
            <span
              suppressHydrationWarning
              className="text-ink-muted font-bold uppercase tracking-widest text-[10px]"
            >
              · updated {lastUpdateStr}
            </span>
          </div>
          <button
            onClick={fetchBoard}
            disabled={isRefreshing}
            className="flex items-center gap-1 text-ink-muted hover:text-ink text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-40"
            aria-label="Refresh board"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      )}

      {/* Board rows as cards */}
      {entries.length === 0 ? (
        <div className="text-center py-20 px-4 border-b border-bg-border">
          <p className="font-display font-black text-2xl text-ink uppercase tracking-tight mb-2">
            The Board Is Just Getting Started
          </p>
          <p className="text-ink-muted text-sm font-semibold uppercase tracking-widest mb-6">
            Be one of the first products on InternetBillboard.space
          </p>
          <a href="/submit" className="btn-primary px-6 py-3 inline-block">
            List Your Product
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {entries.map((entry) => (
            <ProductRow
              key={entry.product.id}
              entry={entry}
              boardId={boardId}
              boardSlug={boardSlug}
              rank={entry.position}
              isAuthenticated={isAuthenticated}
              userProductIds={userProductIds}
              onAttackSuccess={fetchBoard}
              allEntries={entries}
              topSpend={entries[0]?.spend_on_board || 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
