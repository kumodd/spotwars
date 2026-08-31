import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership and status
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("status, founder_id")
      .eq("id", id)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.founder_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Remove status restriction so ANY product can be deleted
    const adminSupabase = await createAdminClient();

    // Delete the product using admin client to bypass the missing DELETE RLS policy
    const { error: deleteError } = await adminSupabase
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Failed to delete product:", deleteError);
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete product error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
