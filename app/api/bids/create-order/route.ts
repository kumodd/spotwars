import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { product_id, board_id, amount, type, target_product_id, currency = "INR" } = body;

    if (!product_id || !board_id || !amount || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate minimum amount
    const MIN_INR_PAISE = 2900; // ₹29
    const MIN_USD_CENTS = 50;   // $0.50

    if (currency === "USD" && amount < MIN_USD_CENTS) {
      return NextResponse.json({ error: "Minimum bid is $0.50" }, { status: 400 });
    } else if (currency === "INR" && amount < MIN_INR_PAISE) {
      return NextResponse.json({ error: "Minimum bid is ₹29" }, { status: 400 });
    }

    // Verify product belongs to user
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, status, founder_id")
      .eq("id", product_id)
      .eq("founder_id", user.id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found or not owned by you" }, { status: 404 });
    }

    // For entry bids, verify product is pending or active
    if (type === "entry" && !["pending", "active"].includes(product.status)) {
      return NextResponse.json({ error: "Product is not eligible to enter the board" }, { status: 400 });
    }

    // Create Razorpay order (amount in subunit: paise or cents)
    const receiptId = `sw_${type}_${product_id.slice(0, 8)}_${Date.now()}`;
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: receiptId,
      notes: {
        product_id,
        board_id,
        type,
        user_id: user.id,
      },
    });

    // Convert to base points for ranking (1 point = 1 INR paise)
    // Fixed conversion rate for MVP: 1 USD = 83 INR
    const basePoints = currency === "USD" ? amount * 83 : amount;

    // Insert pending bid record
    const { data: bid, error: bidError } = await supabase
      .from("bids")
      .insert({
        product_id,
        board_id,
        founder_id: user.id,
        amount: basePoints, // Save in base points so ranking works mathematically
        type,
        razorpay_order_id: order.id,
        status: "pending",
        target_product_id: target_product_id || null,
      })
      .select("id")
      .single();

    if (bidError || !bid) {
      console.error("Bid insert error:", bidError);
      return NextResponse.json({ error: "Failed to create bid record", details: bidError }, { status: 500 });
    }

    return NextResponse.json({ order, bid_id: bid.id });
  } catch (err: unknown) {
    console.error("Create order error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
