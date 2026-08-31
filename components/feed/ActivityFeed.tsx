"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getEventDisplay, timeAgo } from "@/lib/utils";
import type { ActivityEvent } from "@/lib/types";

interface ActivityFeedProps {
  initialEvents?: ActivityEvent[];
  compact?: boolean; // ticker-style for homepage
}

export default function ActivityFeed({ initialEvents = [], compact = false }: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`feed:activity-${Math.random().toString(36).substring(7)}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_events",
          filter: "is_public=eq.true",
        },
        (payload) => {
          setEvents((prev) => [payload.new as ActivityEvent, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (compact) {
    // Ticker tape mode for homepage
    const tickerItems = [...events, ...events]; // duplicate for infinite scroll
    return (
      <div className="bg-bg-surface border-y border-bg-border py-2 overflow-hidden">
        <div className="ticker-wrap">
          <div className="ticker-content">
            {tickerItems.map((event, i) => {
              const { emoji, text } = getEventDisplay(event.event_type, event.data);
              const productName = (event.data?.product_name as string) || "A product";
              return (
                <span key={`${event.id}-${i}`} className="inline-flex items-center gap-2 mx-6 text-sm text-slate-400">
                  <span>{emoji}</span>
                  <span className="text-white font-medium">{productName}</span>
                  <span>{text}</span>
                  <span className="text-slate-600 text-xs">{timeAgo(event.created_at)}</span>
                  <span className="text-bg-border mx-2">·</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Full feed mode
  return (
    <div className="space-y-2">
      {events.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-6">Waiting for activity...</p>
      )}
      {events.map((event) => {
        const { emoji, text } = getEventDisplay(event.event_type, event.data);
        const productName = (event.data?.product_name as string) || "A product";
        return (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-bg-elevated border border-bg-border animate-slide-in-right"
          >
            <span className="text-xl flex-shrink-0">{emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-300">
                <span className="text-white font-semibold">{productName}</span>{" "}
                {text}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">{timeAgo(event.created_at)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
