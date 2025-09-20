import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { participantId, stationId, raceNo, accessCode, splitMs, completedAt } = await req.json();

    if (!participantId || !stationId || !raceNo || !accessCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const checkpointPayload = {
      participant_id: participantId,
      station_id: stationId,
      race_no: raceNo,
      access_code: accessCode,
      split_ms: splitMs ?? null,
      completed_at: completedAt ?? new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("checkpoints")
      .upsert([checkpointPayload], { onConflict: "participant_id,station_id" })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}