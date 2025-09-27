import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


export async function POST(req: Request) {
  try {
    const { fno, purchases } = await req.json();

    if (!fno || !purchases || purchases.length === 0) {
      return NextResponse.json({ error: "Missing fno or purchases" }, { status: 400 });
    }

    // Insert each purchase
    for (const p of purchases) {
      const { error } = await supabase.from("merch_purchases").insert({
        fno,
        item_type: p.item_type,
        item_option: p.item_option,
        qty: p.qty,
        price: p.price,
      });
      if (error) {
        throw error;
      }
    }

    // Add +1 point for each unique item_type purchased
    const uniqueTypes = new Set(purchases.map((p: any) => p.item_type));
    const pointsToAdd = uniqueTypes.size;

    // Fetch current points
    const { data: participant, error: fetchError } = await supabase
      .from("participants")
      .select("points")
      .eq("race_no", fno)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const currentPoints = participant?.points ?? 0;
    const newPoints = currentPoints + pointsToAdd;

    const { data: updated, error: updateError } = await supabase
      .from("participants")
      .update({ points: newPoints, merch_badge: true })
      .eq("race_no", fno)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      fno,
      points_added: pointsToAdd,
      updated,
    });
  } catch (err: any) {
    console.error("Error in merch-purchase POST:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}