import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


export async function POST(req: Request) {
  try {
    const { fno, purchases } = await req.json();
    console.log("Parsed request body:", { fno, purchases });

    if (!purchases || purchases.length === 0) {
      return NextResponse.json({ error: "No purchases provided" }, { status: 400 });
    }

    // Insert each purchase
    for (const p of purchases) {
      // Map frontend fields to database fields
      const mappedPurchase = {
        fno: p.fno || null,
        item_type: p.type,
        item_option: p.item,
        qty: p.qty,
        price: p.price,
      };
      console.log("Mapped purchase to insert:", mappedPurchase);

      const { error } = await supabase.from("merch_purchases").insert(mappedPurchase);
      if (error) {
        throw error;
      }
      console.log("Successfully inserted purchase:", mappedPurchase);
    }

    const fnoToUse = purchases[0]?.fno || fno || null;

    // If no fno, skip participant points update
    if (!fnoToUse) {
      return NextResponse.json({
        success: true,
        message: "Purchases inserted without participant update",
      });
    }

    // Add +1 point for each unique item_type purchased
    const uniqueTypes = new Set(purchases.map((p: any) => p.type));
    const pointsToAdd = uniqueTypes.size;
    console.log("Unique item types:", uniqueTypes, "Points to add:", pointsToAdd);

    const { data: participant, error: fetchError } = await supabase
      .from("participants")
      .select("points")
      .eq("race_no", fnoToUse)
      .single();

    if (fetchError) {
      throw fetchError;
    }
    console.log("Current participant points:", participant?.points);

    const currentPoints = participant?.points ?? 0;
    const newPoints = currentPoints + pointsToAdd;
    console.log("New points to update:", newPoints);

    const { data: updated, error: updateError } = await supabase
      .from("participants")
      .update({ points: newPoints, merch_badge: true })
      .eq("race_no", fnoToUse)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }
    console.log("Updated participant data:", updated);

    return NextResponse.json({
      success: true,
      fno: fnoToUse,
      points_added: pointsToAdd,
      updated,
    });
  } catch (err: any) {
    console.error("Error in merch-purchase POST:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}