import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/products - list active products for a board
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const boardSlug = searchParams.get("board") || "global";
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");
  const category = searchParams.get("category");

  const adminSupabase = await createAdminClient();

  let query = adminSupabase
    .from("board_positions")
    .select(`
      position,
      previous_position,
      spend_on_board,
      position_changed_at,
      product:products (
        id, name, url, logo_url, tagline, category, tags,
        click_count, impression_count, spot_score, momentum_score,
        total_spend, status, founder_id, pricing, country
      ),
      board:boards!inner (id, name, slug)
    `)
    .eq("board.slug", boardSlug)
    .order("position", { ascending: true })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq("product.category", category);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count });
}

// POST /api/products - create a new product
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      name, url, logo_url, tagline, description, category, country,
      pricing, tags, social_links, screenshots, founder_name, company_name,
    } = body;

    // Basic validation
    if (!name || !url || !tagline || !category) {
      return NextResponse.json({ error: "Missing required fields: name, url, tagline, category" }, { status: 400 });
    }

    // URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid product URL" }, { status: 400 });
    }

    // Check for duplicate URL by same user
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("founder_id", user.id)
      .eq("url", url)
      .single();

    if (existing) {
      return NextResponse.json({ error: "You already have a product with this URL" }, { status: 409 });
    }

    const { data: product, error: insertError } = await supabase
      .from("products")
      .insert({
        founder_id: user.id,
        name: name.trim(),
        url: url.trim(),
        logo_url: logo_url || null,
        tagline: tagline.trim(),
        description: description?.trim() || null,
        category,
        country: country || "IN",
        pricing: pricing || "Free",
        tags: tags || [],
        social_links: social_links || {},
        screenshots: screenshots || [],
        founder_name: founder_name?.trim() || null,
        company_name: company_name?.trim() || null,
        status: "pending", // requires payment to become active
      })
      .select("id, name, status")
      .single();

    if (insertError || !product) {
      console.error("Product insert error:", insertError);
      return NextResponse.json({ error: "Failed to create product", details: insertError }, { status: 500 });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
