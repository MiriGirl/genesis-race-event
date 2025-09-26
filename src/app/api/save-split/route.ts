import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { participantId, stationId, raceNo, accessCode, completedAt } = await req.json();

    if (!participantId || !stationId || !raceNo || !accessCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const completedAtValue = completedAt ?? new Date().toISOString();

    // Fetch the checkpoint row with id and start_time for the participant and station
    const { data: checkpoint, error: fetchError } = await supabase
      .from("checkpoints")
      .select("id, start_time")
      .eq("participant_id", participantId)
      .eq("station_id", stationId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message, details: fetchError }, { status: 500 });
    }

    if (!checkpoint || !checkpoint.start_time) {
      return NextResponse.json({ error: "Sector not started" }, { status: 400 });
    }

    const startTime = new Date(checkpoint.start_time).getTime();
    const completedTime = new Date(completedAtValue).getTime();
    const splitMs = completedTime - startTime;

    // Update the checkpoint row with completed_at and split_ms
    const { data, error } = await supabase
      .from("checkpoints")
      .update({ completed_at: completedAtValue, split_ms: splitMs })
      .eq("id", checkpoint.id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}