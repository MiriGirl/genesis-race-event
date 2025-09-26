import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- Shared logic ---
async function getRaceStatus(raceNo: string, bib: string) {
  // Fetch participant record
  const { data: participantData, error: participantError } = await supabase
    .from("participants")
    .select("id")
    .eq("race_no", raceNo)
    .eq("bib", bib)
    .single();

  if (participantError) throw participantError;

  if (!participantData) {
    // No participant found
    console.log(`No participant found for raceNo=${raceNo}, bib=${bib}`);
    return { type: "error", message: "Participant not found", currentSector: 0, raceNo, participantId: null, stationId: null };
  }

  const participantId = participantData.id;
  console.log(`Found participant: ${participantId}`);

  // Get checkpoints for this racer
  const { data: checkpoints, error } = await supabase
    .from("checkpoints")
    .select(`
      participant_id,
      station_id,
      completed_at,
       start_time,  
      stations!checkpoints_station_id_fkey (
        order_index,
        access_code
      )
    `)
    .eq("race_no", raceNo)
    .order("completed_at", { ascending: true });

  if (error) throw error;

  async function getStationIdByOrderIndex(orderIndex: number): Promise<string | null> {
    try {
      const { data: stationData, error: stationError } = await supabase
        .from("stations")
        .select("id")
        .eq("order_index", orderIndex)
        .single();
      if (stationError) {
        console.error(`Error fetching station for order_index=${orderIndex}:`, stationError);
        return null;
      }
      return stationData?.id ?? null;
    } catch (e) {
      console.error(`Exception fetching station for order_index=${orderIndex}:`, e);
      return null;
    }
  }

  function getOrderIndex(entry: any): number | undefined {
    if (!entry?.stations) return undefined;
    if (Array.isArray(entry.stations)) {
      return entry.stations[0]?.order_index;
    }
    return entry.stations.order_index;
  }

  if (!checkpoints || checkpoints.length === 0) {
    const currentSector = 1;
    const stationId = await getStationIdByOrderIndex(currentSector);
    const accessCode = null;
    const enterStatus = { type: "enter", currentSector, raceNo, participantId, stationId, accessCode };
    console.log(`Returning type: enter`, enterStatus);
    return enterStatus;
  }

  // Check participant_times view for completed checkpoints and total time
  const { data: participantTimesData, error: participantTimesError } = await supabase
    .from("participant_times")
    .select("completed_checkpoints, total_time_ms")
    .eq("race_no", raceNo)
    .eq("participant_id", participantId)
    .single();

  if (participantTimesError) {
    console.error(`Error fetching participant_times for participantId=${participantId}:`, participantTimesError);
  } else if (participantTimesData?.completed_checkpoints === 6) {
    const finishedStatus = { type: "finished", currentSector: 6, raceNo, participantId, stationId: null, accessCode: null, totalTime: participantTimesData.total_time_ms };
    console.log(`Returning type: finished (from participant_times)`, finishedStatus);
    return finishedStatus;
  }

  const active = checkpoints.find((c) => !c.completed_at);
  if (active) {
    const currentSector = getOrderIndex(active);
    const stationId = await getStationIdByOrderIndex(currentSector ?? 0);
    let accessCode: string | null = null;
    if (active?.stations) {
      if (Array.isArray(active.stations)) {
        accessCode = active.stations[0]?.access_code ?? null;
      } else {
        accessCode = (active.stations as any)?.access_code ?? null;
      }
    }
    const stopwatchStatus = { type: "stopwatch", currentSector, raceNo, participantId: participantId, stationId, accessCode, startTime: active.start_time };
    console.log(`Returning type: stopwatch`, stopwatchStatus);
    return stopwatchStatus;
  }

  const lastCompleted = checkpoints[checkpoints.length - 1];
  const lastOrderIndex = getOrderIndex(lastCompleted);
  if (lastCompleted && lastOrderIndex && lastOrderIndex < 6) {
    const currentSector = lastOrderIndex + 1;
    const stationId = await getStationIdByOrderIndex(currentSector);
    let accessCode: string | null = null;
    if (lastCompleted?.stations) {
      if (Array.isArray(lastCompleted.stations)) {
        accessCode = lastCompleted.stations[0]?.access_code ?? null;
      } else {
        accessCode = (lastCompleted.stations as any)?.access_code ?? null;
      }
    }
    const enterStatus = { type: "enter", currentSector, raceNo, participantId: participantId, stationId, accessCode, startTime: lastCompleted?.start_time ?? null };
    console.log(`Returning type: enter`, enterStatus);
    return enterStatus;
  }

  const currentSector = lastOrderIndex || 6;
  const stationId = await getStationIdByOrderIndex(currentSector);
  let accessCode: string | null = null;
  if (lastCompleted?.stations) {
    if (Array.isArray(lastCompleted.stations)) {
      accessCode = lastCompleted.stations[0]?.access_code ?? null;
    } else {
      accessCode = (lastCompleted.stations as any)?.access_code ?? null;
    }
  }
  const finishedStatus = { type: "finished", currentSector, raceNo, participantId: participantId, stationId, accessCode, startTime: lastCompleted?.start_time ?? null };
  console.log(`Returning type: finished`, finishedStatus);
  return finishedStatus;
}

// --- POST ---
export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { type: "error", message: "Missing or invalid JSON body", currentSector: 0 },
        { status: 400 }
      );
    }

    const { raceNo, bib } = body;
    if (!raceNo || !bib) {
      return NextResponse.json(
        { type: "error", message: "raceNo and bib are required", currentSector: 0 },
        { status: 400 }
      );
    }

    const status = await getRaceStatus(raceNo, bib);
    return NextResponse.json(status);
  } catch (err: any) {
    console.error("race-status POST error:", err);
    return NextResponse.json({ type: "error", currentSector: 0 }, { status: 500 });
  }
}

// --- GET ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raceNo = searchParams.get("raceNo");
    const bib = searchParams.get("bib");

    if (!raceNo || !bib) {
      return NextResponse.json(
        { type: "error", message: "raceNo and bib are required", currentSector: 0 },
        { status: 400 }
      );
    }

    const status = await getRaceStatus(raceNo, bib);
    return NextResponse.json(status);
  } catch (err: any) {
    console.error("race-status GET error:", err);
    return NextResponse.json({ type: "error", currentSector: 0 }, { status: 500 });
  }
}