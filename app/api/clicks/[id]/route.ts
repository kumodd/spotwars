import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

    const adminSupabase = await createAdminClient();

    // Simple click tracking — no auth required
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const ipHash = Buffer.from(ip).toString("base64").slice(0, 20); // basic anonymization
    const sessionId = request.headers.get("x-session-id") || undefined;
    const referrer = request.headers.get("referer") || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    // Insert click
    await adminSupabase.from("product_clicks").insert({
      product_id: productId,
      ip_hash: ipHash,
      session_id: sessionId,
      referrer,
      user_agent: userAgent,
    });

    // Increment click counter
    const { data: updated } = await adminSupabase.rpc("increment_click", {
      product_id: productId,
    }).select().single();

    // Check for milestone (every 100 clicks)
    const { data: product } = await adminSupabase
      .from("products")
      .select("click_count, name")
      .eq("id", productId)
      .single();

    if (product && product.click_count > 0 && product.click_count % 100 === 0) {
      await adminSupabase.from("activity_events").insert({
        event_type: "milestone_clicks",
        product_id: productId,
        data: { clicks: product.click_count, product_name: product.name },
        is_public: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    // Fail silently for click tracking — don't block the user
    return NextResponse.json({ success: true });
  }
}
