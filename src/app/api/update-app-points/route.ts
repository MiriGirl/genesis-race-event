import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  try {
    const { fno } = await req.json();
    const raceNo = fno.startsWith("F") ? fno : `F${fno}`;

    const { data: participant, error: fetchError } = await supabase
      .from("participants")
      .select("points")
      .eq("race_no", raceNo)
      .single();

    if (fetchError) throw fetchError;

    const newPoints = (participant?.points || 0) + 2;

    const { data, error } = await supabase
      .from("participants")
      .update({
        app_downloaded: true,
        app_badge: true,
        points: newPoints,
      })
      .eq("race_no", raceNo)
      .select("points")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, points: data?.points });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}