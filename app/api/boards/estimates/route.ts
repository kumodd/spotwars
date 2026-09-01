import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("board_id");

    if (!boardId) {
      return NextResponse.json({ error: "board_id is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Get board settings
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .select("entry_fee, min_overtake_increment")
      .eq("id", boardId)
      .single();

    if (boardError || !board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // 2. Fetch top positions
    const { data: positions, error: posError } = await supabase
      .from("board_positions")
      .select("position, spend_on_board")
      .eq("board_id", boardId)
      .order("position", { ascending: true })
      .limit(10);

    if (posError) {
      return NextResponse.json({ error: "Failed to fetch positions" }, { status: 500 });
    }

    // 3. Calculate required estimates
    const entryFee = Math.max(board.entry_fee, 4900); // Minimum 49 INR
    const increment = board.min_overtake_increment;

    // Helper to get required amount for a specific rank
    const getRequiredForRank = (targetRank: number) => {
      const currentAtRank = positions?.find((p) => p.position === targetRank);

      if (currentAtRank) {
        // If someone is there, we need their spend + increment
        return currentAtRank.spend_on_board + increment;
      }

      // If the rank doesn't exist (e.g. board has 0 products), just the entry fee
      return entryFee;
    };

    // Prepare exactly 4 distinct options: #1, #2, #3, and #10
    const estimates = [
      { position: 1, amount_paise: getRequiredForRank(1) },
      { position: 2, amount_paise: getRequiredForRank(2) },
      { position: 3, amount_paise: getRequiredForRank(3) },
      { position: 10, amount_paise: getRequiredForRank(10) },
    ];

    // Ensure they are strictly descending in cost just in case the board is empty 
    // and they all equal entryFee, we don't want a flat line. Actually, if board is empty,
    // they should all just suggest the entryFee. The frontend handles custom amounts.
    // However, if the board has only 1 product, #2 and #10 will just be the entryFee.
    // It's technically correct.

    return NextResponse.json({
      success: true,
      data: estimates
    });

  } catch (error: any) {
    console.error("Board estimates error:", error);
    return NextResponse.json({ error: "Failed to fetch estimates" }, { status: 500 });
  }
}
