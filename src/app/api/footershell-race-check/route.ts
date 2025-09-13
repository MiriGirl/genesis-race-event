import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { raceNo, accessCode } = await req.json();

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

    // 2. Find station by access code
    const { data: station, error: sError } = await supabase
      .from("stations")
      .select("id, order_index, access_code")
      .eq("access_code", accessCode)
      .single();

    if (sError || !station) {
      return NextResponse.json({ error: "Invalid sector code" }, { status: 400 });
    }

    // Guard: if racer already completed this sector, block re-entry
    const { data: completedCheckpoint, error: completedErr } = await supabase
      .from("checkpoints")
      .select("id")
      .eq("participant_id", participant.id)
      .eq("station_id", station.id)
      .not("completed_at", "is", null)
      .maybeSingle();

    if (completedErr) {
      console.error("Error checking completed checkpoint:", completedErr.message);
    }

    if (completedCheckpoint) {
      return NextResponse.json(
        { error: `You’ve already completed Sector ${station.order_index}. Please continue with the next sector.` },
        { status: 400 }
      );
    }

    // 3. Guard: if racer has an unfinished checkpoint, they must finish it first
    const { data: activeCheckpointRaw, error: activeCpErr } = await supabase
      .from("checkpoints")
      .select("id, station_id, completed_at")
      .eq("participant_id", participant.id)
      .is("completed_at", null)
      .maybeSingle();

    if (activeCpErr) {
      console.error("Error checking active checkpoint:", activeCpErr.message);
    }

    if (activeCheckpointRaw && activeCheckpointRaw.station_id !== station.id) {
      const { data: activeStation, error: activeStationErr } = await supabase
        .from("stations")
        .select("order_index")
        .eq("id", activeCheckpointRaw.station_id)
        .single();

      const sectorNum = activeStation?.order_index ?? "current";

      return NextResponse.json(
        { error: `Please finish sector ${sectorNum} first` },
        { status: 400 }
      );
    }

    // 4. Enforce sequential order
    // Derive checkpoints count from completed checkpoints table instead of trusting participant record
    const { count: finishedCount, error: finishedCountErr } = await supabase
      .from("checkpoints")
      .select("*", { count: "exact", head: true })
      .eq("participant_id", participant.id)
      .not("completed_at", "is", null);

    if (finishedCountErr) {
      console.error("Error counting finished checkpoints:", finishedCountErr.message);
    }

    const checkpointsCount = finishedCount || 0;
    const expectedOrderIndex = checkpointsCount + 1;

    // Special case: first time racer must start with sector 1
    if (checkpointsCount === 0 && station.order_index !== 1) {
      return NextResponse.json(
        { error: "Please finish sector 1 first" },
        { status: 400 }
      );
    }

    if (station.order_index !== expectedOrderIndex) {
      return NextResponse.json(
        { error: `Please finish sector ${expectedOrderIndex} first` },
        { status: 400 }
      );
    }

    // 5. If first time (sector 1), set race start
    if (station.order_index === 1 && !participant.started_at) {
      await supabase
        .from("participants")
        .update({ started_at: new Date().toISOString() })
        .eq("id", participant.id);
    }

    // 6. Insert checkpoint (start of this sector)
    const { error: insertError } = await supabase.from("checkpoints").insert({
      participant_id: participant.id,
      race_no: participant.race_no,
      station_id: station.id,
      access_code: station.access_code || accessCode, // <--- FIX
      completed_at: null,
      split_ms: null,
    });

if (insertError) {
  console.error("Error inserting checkpoint:", insertError.message);
  return NextResponse.json(
    { error: "Failed to start sector", details: insertError.message },
    { status: 500 }
  );
}

    // Find current active sector (if any) — two-step lookup to avoid join ambiguity
    let currentSector: number | null = null;

    const { data: currentCheckpointRaw, error: currentCpErr } = await supabase
      .from("checkpoints")
      .select("station_id")
      .eq("participant_id", participant.id)
      .is("completed_at", null)
      .maybeSingle();

    if (currentCpErr) {
      console.error("Error fetching current checkpoint:", currentCpErr.message);
    }

    if (currentCheckpointRaw?.station_id) {
      const { data: currentStation, error: currentStationErr } = await supabase
        .from("stations")
        .select("order_index")
        .eq("id", currentCheckpointRaw.station_id)
        .single();

      if (currentStationErr) {
        console.error("Error fetching current station:", currentStationErr.message);
      } else if (typeof currentStation?.order_index === "number") {
        currentSector = currentStation.order_index;
      }
    }

    // 7. Response back to UI
    return NextResponse.json({
      status: "ok",
      sector: station.order_index,
      current_sector: currentSector,
      message: `Sector ${station.order_index} started`,
      checkpoints_count: checkpointsCount,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}