"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getEventDisplay, timeAgo } from "@/lib/utils";
import type { ActivityEvent } from "@/lib/types";

interface ActivityFeedProps {
  initialEvents?: ActivityEvent[];
  compact?: boolean; // ticker-style
}

export default function ActivityFeed({
  initialEvents = [],
  compact = false,
}: ActivityFeedProps) {
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
          setEvents((prev) =>
            [payload.new as ActivityEvent, ...prev].slice(0, 60)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (compact) {
    // Ticker tape mode
    const tickerItems = [...events, ...events];
    return (
      <div className="bg-bg-surface border-b border-bg-border py-2 overflow-hidden">
        <div className="ticker-wrap border-t border-b border-bg-border bg-bg-elevated">
          <div className="ticker-content">
            {tickerItems.map((event, i) => {
              const { emoji, text } = getEventDisplay(
                event.event_type,
                event.data
              );
              const productName =
                (event.data?.product_name as string) || "A product";
              return (
                <span
                  key={`${event.id}-${i}`}
                  className="inline-flex items-center gap-2 mx-8 text-xs text-ink-muted font-bold uppercase tracking-wider"
                >
                  <span>{emoji}</span>
                  <span className="text-ink font-black uppercase tracking-wide">{productName}</span>
                  <span>{text}</span>
                  <span className="text-ink-muted text-[10px]">{timeAgo(event.created_at)}</span>
                  <span className="text-ink mx-1">·</span>
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
    <div>
      {events.length === 0 && (
        <p className="text-ink-muted font-bold uppercase tracking-widest text-xs text-center py-8">
          Waiting for activity...
        </p>
      )}
      {events.map((event) => {
        const { emoji, text } = getEventDisplay(event.event_type, event.data);
        const productName =
          (event.data?.product_name as string) || "A product";
        return (
          <div
            key={event.id}
            className="flex items-start gap-3 py-3 border-b border-bg-border last:border-b-0 animate-slide-in-right"
          >
            <span className="text-base flex-shrink-0 leading-none mt-0.5">{emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ink-muted font-bold uppercase tracking-wider leading-snug">
                <span className="text-ink font-black uppercase tracking-wide">{productName}</span>{" "}
                {text}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mt-0.5">
                {timeAgo(event.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
