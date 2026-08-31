import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ActivityFeed from "@/components/feed/ActivityFeed";
import type { ActivityEvent } from "@/lib/types";

export const metadata: Metadata = {
  title: "Activity — SpotWars",
  description:
    "Live public activity log. Every overtake, defense, new entry, and milestone on the SpotWars board.",
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
    <div className="min-h-screen bg-[#0C0C0C]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-16">

        {/* Header */}
        <div className="border-b border-[#1A1A1A] pb-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="live-dot" />
            <span className="text-xs text-[#555555] font-medium uppercase tracking-wider">
              Market log
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white tracking-tight mb-1">
            Activity
          </h1>
          <p className="text-[#555555] text-sm">
            Every move, overtake, defense, and milestone — in real time.
          </p>
        </div>

        {/* Live feed */}
        <ActivityFeed initialEvents={events} compact={false} />
      </div>
      <Footer />
    </div>
  );
}
