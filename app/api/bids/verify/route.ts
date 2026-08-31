import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { bid_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!bid_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const adminSupabase = await createAdminClient();

    // Get bid details
    const { data: bid, error: bidError } = await adminSupabase
      .from("bids")
      .select("id, product_id, board_id, amount, type, status, target_product_id, founder_id")
      .eq("id", bid_id)
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (bidError) {
      console.error("Bid lookup error:", bidError);
      return NextResponse.json({ error: `Database error: ${bidError.message}. Did you forget to set SUPABASE_SERVICE_ROLE_KEY?` }, { status: 500 });
    }
    
    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    if (bid.founder_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (bid.status === "paid") {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // Update bid with payment details
    await adminSupabase.from("bids").update({
      razorpay_payment_id,
      razorpay_signature,
    }).eq("id", bid_id);

    // For entry bids: first ensure product is on the board
    if (bid.type === "entry") {
      const { error: updateErr } = await adminSupabase.from("products").update({ status: "active" }).eq("id", bid.product_id);
      if (updateErr) console.error("Failed to update product status:", updateErr);

      // Check if already on board, if not insert at last position
      const { data: existingPosition, error: exErr } = await adminSupabase
        .from("board_positions")
        .select("id")
        .eq("product_id", bid.product_id)
        .eq("board_id", bid.board_id)
        .maybeSingle(); // Use maybeSingle to avoid 406 error on 0 rows

      if (!existingPosition) {
        // Get current last position
        const { data: lastPos } = await adminSupabase
          .from("board_positions")
          .select("position")
          .eq("board_id", bid.board_id)
          .order("position", { ascending: false })
          .limit(1)
          .maybeSingle();

        const nextPosition = (lastPos?.position ?? 0) + 1;

        const { error: insertErr } = await adminSupabase.from("board_positions").insert({
          product_id: bid.product_id,
          board_id: bid.board_id,
          position: nextPosition,
          spend_on_board: 0,
        });
        
        if (insertErr) {
          console.error("CRITICAL: Failed to insert into board_positions:", insertErr);
          return NextResponse.json({ error: `Failed to insert board position: ${insertErr.message}` }, { status: 500 });
        }
      }
    }

    // Apply the bid atomically (updates spend, recalculates positions)
    const { data: result, error: applyError } = await adminSupabase.rpc("apply_bid", {
      p_bid_id: bid_id,
      p_product_id: bid.product_id,
      p_board_id: bid.board_id,
      p_amount: bid.amount,
    });

    if (applyError) {
      console.error("apply_bid error:", applyError);
      return NextResponse.json({ error: "Failed to apply bid" }, { status: 500 });
    }

    const { old_position, new_position, overtook_product_id, overtook_product_name } = result as Record<string, unknown>;

    // Get product name for activity event
    const { data: productData } = await adminSupabase
      .from("products")
      .select("name")
      .eq("id", bid.product_id)
      .single();

    const productName = productData?.name || "A product";

    // Create activity events
    const eventsToInsert = [];

    if (bid.type === "entry") {
      eventsToInsert.push({
        event_type: "product_entered",
        board_id: bid.board_id,
        product_id: bid.product_id,
        data: { position: new_position, product_name: productName },
        is_public: true,
      });
    }

    if (bid.type === "attack" || (old_position && new_position && (old_position as number) > (new_position as number))) {
      eventsToInsert.push({
        event_type: "overtake",
        board_id: bid.board_id,
        product_id: bid.product_id,
        target_product_id: overtook_product_id || bid.target_product_id || null,
        data: {
          old_position,
          new_position,
          product_name: productName,
          target_name: overtook_product_name || "a competitor",
        },
        is_public: true,
      });
    }

    // Milestone events
    const { data: updatedProduct } = await adminSupabase
      .from("products")
      .select("click_count, total_spend")
      .eq("id", bid.product_id)
      .single();

    if ((new_position as number) <= 10 && (old_position as number) > 10) {
      eventsToInsert.push({
        event_type: "reached_top10",
        board_id: bid.board_id,
        product_id: bid.product_id,
        data: { product_name: productName },
        is_public: true,
      });
    }

    if ((new_position as number) <= 3 && (old_position as number) > 3) {
      eventsToInsert.push({
        event_type: "reached_top3",
        board_id: bid.board_id,
        product_id: bid.product_id,
        data: { product_name: productName },
        is_public: true,
      });
    }

    if ((new_position as number) === 1 && (old_position as number) !== 1) {
      eventsToInsert.push({
        event_type: "reached_number1",
        board_id: bid.board_id,
        product_id: bid.product_id,
        data: { product_name: productName },
        is_public: true,
      });
    }

    if (eventsToInsert.length > 0) {
      await adminSupabase.from("activity_events").insert(eventsToInsert);
    }

    return NextResponse.json({
      success: true,
      old_position,
      new_position,
      overtook: overtook_product_id ? { id: overtook_product_id, name: overtook_product_name } : null,
    });
  } catch (err: unknown) {
    console.error("Verify bid error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
