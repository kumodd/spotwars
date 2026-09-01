"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getEventDisplay, timeAgo } from "@/lib/utils";
import type { ActivityEvent } from "@/lib/types";

interface ActivityFeedProps {
  initialEvents?: ActivityEvent[];
  compact?: boolean;
}

export default function ActivityFeed({
  initialEvents = [],
  compact = false,
}: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
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
          const newEvent = payload.new as ActivityEvent;
          setEvents((prev) => [newEvent, ...prev].slice(0, 60));
          setNewIds((prev) => new Set([...prev, newEvent.id]));
          setTimeout(() => {
            setNewIds((prev) => {
              const next = new Set(prev);
              next.delete(newEvent.id);
              return next;
            });
          }, 3000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Compact: ticker tape ──────────────────────────────────────────────────
  if (compact) {
    const tickerItems = [...events, ...events];
    return (
      <div className="ticker-wrap" aria-label="Live activity ticker" aria-live="polite">
        <div className="ticker-content">
          {tickerItems.map((event, i) => {
            const { text } = getEventDisplay(event.event_type, event.data);
            const productName = (event.data?.product_name as string) || "A product";
            return (
              <span
                key={`${event.id}-${i}`}
                className="inline-flex items-center gap-1.5 mx-10 text-xs text-ink-muted font-semibold uppercase tracking-wider"
              >
                <span className="text-ink font-black">{productName}</span>
                <span>{text}</span>
                <span className="text-bg-elevated mx-2" aria-hidden="true">·</span>
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Full feed mode ────────────────────────────────────────────────────────
  return (
    <div role="feed" aria-label="Live activity feed" aria-live="polite">
      {events.length === 0 && (
        <p className="text-ink-muted font-semibold uppercase tracking-widest text-xs text-center py-6">
          Waiting for activity…
        </p>
      )}
      {events.map((event) => {
        const { emoji, text, targetName } = getEventDisplay(event.event_type, event.data);
        const productName = (event.data?.product_name as string) || "A product";
        const isNew = newIds.has(event.id);
        const isOvertake = event.event_type === "overtake";

        return (
          <div
            key={event.id}
            className={`activity-event ${isNew ? "animate-entry" : ""}`}
          >
            {/* Timestamp */}
            <div className="activity-time" suppressHydrationWarning>
              {timeAgo(event.created_at)}
            </div>

            {/* Content */}
            <div className="min-w-0">
              {isOvertake ? (
                // Narrative overtake line: "Brand A overtook Brand B · claimed #5"
                <p className="text-xs leading-snug">
                  <span className="font-black text-ink uppercase tracking-wide">
                    {productName}
                  </span>
                  {" "}
                  <span className="text-ink-muted font-semibold">overtook</span>
                  {" "}
                  {targetName ? (
                    <span className="font-black text-ink uppercase tracking-wide">
                      {targetName}
                    </span>
                  ) : (
                    <span className="text-ink-muted font-semibold">a competitor</span>
                  )}
                  {" "}
                  <span className="text-ink-muted font-semibold">
                    · claimed #{String(event.data?.new_position ?? "")}
                  </span>
                </p>
              ) : (
                // Standard line: "Brand A [text]"
                <p className="text-xs leading-snug">
                  <span className="font-black text-ink uppercase tracking-wide">
                    {productName}
                  </span>
                  {" "}
                  <span className="text-ink-muted font-semibold">{text}</span>
                  {/* Typographic indicator */}
                  {emoji !== "·" && emoji !== "—" && (
                    <span className="ml-1.5 text-ink-muted font-bold" aria-hidden="true">
                      {emoji}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
