import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { raceNo, accessCode, splitMs } = await req.json();

    if (!raceNo || !accessCode) {
      return NextResponse.json(
        { error: "Missing raceNo or accessCode" },
        { status: 400 }
      );
    }

    // 1. Find participant
    const { data: participant, error: pError } = await supabase
      .from("participants")
      .select("id, race_no, started_at, finished_at, checkpoints_count")
      .eq("race_no", raceNo)
      .single();

    if (pError || !participant) {
      return NextResponse.json({ error: "Invalid race number" }, { status: 404 });
    }

    if (!participant.started_at) {
      return NextResponse.json({ error: "Race not started" }, { status: 400 });
    }

    if (participant.finished_at) {
      return NextResponse.json({ error: "Race already finished" }, { status: 400 });
    }

    // 2. Find station by accessCode
    const { data: station, error: sError } = await supabase
      .from("stations")
      .select("id")
      .eq("access_code", accessCode)
      .single();

    if (sError || !station) {
      return NextResponse.json({ error: "Invalid access code" }, { status: 404 });
    }

    // 3. Find unfinished checkpoint for this participant + station
    const { data: checkpoint, error: cpError } = await supabase
      .from("checkpoints")
      .select("id")
      .eq("participant_id", participant.id)
      .eq("station_id", station.id)
      .is("completed_at", null)
      .single();

    if (cpError || !checkpoint) {
      return NextResponse.json({ error: "No active sector to finish" }, { status: 400 });
    }

    // 4. Update checkpoint with completed_at and split_ms
    const now = new Date().toISOString();
    const { error: updateCpError } = await supabase
      .from("checkpoints")
      .update({
        completed_at: now,
        split_ms: splitMs !== undefined ? splitMs : null,
      })
      .eq("id", checkpoint.id);

    if (updateCpError) {
      return NextResponse.json({ error: "Failed to update checkpoint" }, { status: 500 });
    }

    // 5. Increment participant.checkpoints_count
    const newCheckpointsCount = (participant.checkpoints_count ?? 0) + 1;
    const { error: updatePError } = await supabase
      .from("participants")
      .update({
        checkpoints_count: newCheckpointsCount,
      })
      .eq("id", participant.id);

    if (updatePError) {
      return NextResponse.json({ error: "Failed to update participant checkpoints count" }, { status: 500 });
    }

    // 6. Count all finished checkpoints for participant
    const { data: finishedCheckpoints, error: finishedCpError } = await supabase
      .from("checkpoints")
      .select("id")
      .eq("participant_id", participant.id)
      .not("completed_at", "is", null);

    if (finishedCpError) {
      return NextResponse.json({ error: "Failed to fetch finished checkpoints" }, { status: 500 });
    }

    const finishedCount = finishedCheckpoints ? finishedCheckpoints.length : 0;

    // 7. If 6 finished, finish the race
    if (finishedCount === 6) {
      const startedAt = new Date(participant.started_at).getTime();
      const finishedAt = Date.now();
      const totalMs = finishedAt - startedAt;

      const { error: finishError } = await supabase
        .from("participants")
        .update({
          finished_at: new Date(finishedAt).toISOString(),
          total_ms: totalMs,
        })
        .eq("id", participant.id);

      if (finishError) {
        return NextResponse.json(
          { error: "Failed to finish race", details: finishError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        status: "ok",
        message: "Race finished",
        total_ms: totalMs,
        checkpoints_count: finishedCount,
      });
    } else {
      return NextResponse.json({
        status: "ok",
        message: `Sector ${finishedCount} finished`,
        checkpoints_count: finishedCount,
        split_ms: splitMs !== undefined ? splitMs : null,
      });
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}