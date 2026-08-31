import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ActivityFeed from "@/components/feed/ActivityFeed";
import type { ActivityEvent } from "@/lib/types";

export const metadata: Metadata = {
  title: "Activity — InternetBillboard.space",
  description:
    "Live public activity log. Every overtake, defense, new entry, and milestone on the InternetBillboard.space board.",
};

async function getActivity() {
  const supabase = await createClient();
  const { data: rawEvents } = await supabase
    .from("activity_events")
    .select("*, product:products(id, name, logo_url)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(100);

  return (rawEvents || []) as ActivityEvent[];
}

export default async function ActivityPage() {
  const events = await getActivity();

  return (
    <div className="min-h-screen bg-bg text-ink">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16">

        {/* Header */}
        <div className="border-b border-bg-border pb-8 mb-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
            <span className="live-dot" />
            <span className="text-xs text-ink font-black uppercase tracking-widest">
              Market log
            </span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight mb-3 uppercase">
            Activity
          </h1>
          <p className="text-ink-muted text-sm font-bold uppercase tracking-wider">
            Every move, overtake, defense, and milestone — in real time.
          </p>
        </div>

        {/* Live feed */}
        <div className="border-t border-b border-bg-border py-2 bg-bg-surface">
          <ActivityFeed initialEvents={events} compact={false} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
