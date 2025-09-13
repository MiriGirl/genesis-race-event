import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // keep this secret
);

// This API is dedicated to checking if a participant exists by race number (fno)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fno = searchParams.get("fno");

  if (!fno) {
    return NextResponse.json({ exists: false });
  }

  let normalizedFno = fno.toUpperCase();
  if (!normalizedFno.startsWith("F")) {
    normalizedFno = `F${normalizedFno}`;
  }

  const { data, error } = await supabase
    .from("participants")
    .select("id")
    .eq("race_no", normalizedFno)
    .maybeSingle();

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ exists: false });
  }

  return NextResponse.json({ exists: !!data });
}