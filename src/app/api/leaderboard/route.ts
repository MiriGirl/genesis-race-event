export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // use service key for RPC if RLS enabled
);

export async function GET() {
  const { data, error } = await supabase.rpc("get_leaderboard");

  if (error) {
    console.error("Leaderboard RPC error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Guarantee array response
  const safeData = Array.isArray(data) ? data : (data ? [data] : []);
  return NextResponse.json(safeData);
}