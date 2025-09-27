import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fetchRaceTypeFromAPI(req: Request, raceNo: string, bib: string): Promise<string | null> {
  try {
    const current = new URL(req.url);
    const origin = `${current.protocol}//${current.host}`;
    const res = await fetch(
      `${origin}/api/race-status?raceNo=${encodeURIComponent(raceNo)}&bib=${encodeURIComponent(bib)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    // Expecting { type: "enter" | "finished", ... }
    return (json?.type as string) || null;
  } catch (e) {
    console.error("fetchRaceTypeFromAPI error:", e);
    return null;
  }
}

// Helper function to determine race type
async function getRaceType(participantId: string) {
  // First check participant_times (if this table is being updated properly)
  const { data: participantTimes } = await supabase
    .from("participant_times")
    .select("completed_checkpoints")
    .eq("participant_id", participantId)
    .single();

  if (participantTimes?.completed_checkpoints === 6) {
    return "finished";
  }

  // Otherwise, check checkpoints table directly
  const { data: checkpoints } = await supabase
    .from("checkpoints")
    .select("sector")
    .eq("participant_id", participantId);

  if (!checkpoints || checkpoints.length === 0) {
    return "enter";
  }

  const uniqueSectors = new Set(checkpoints.map(c => c.sector));

  if (uniqueSectors.size >= 6) {
    return "finished";
  }

  return "enter";
}

// --- GET bag status ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raceNo = searchParams.get("raceNo");
    const bib = searchParams.get("bib");

    if (!raceNo || !bib) {
      return NextResponse.json(
        { error: "raceNo and bib are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("participants")
      .select("id, bag_given")
      .eq("race_no", raceNo)
      .eq("bib", bib)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    let type = await fetchRaceTypeFromAPI(req, raceNo, bib);
    if (!type) {
      type = await getRaceType(data.id);
    }

    console.log("[bag-status][GET] raceNo:", raceNo, "bib:", bib, "type:", type);

    return NextResponse.json({
      participantId: data.id,
      bag_given: data.bag_given,
      type,
    });
  } catch (err: any) {
    console.error("bag-status GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// --- POST: mark bag as given ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { raceNo, bib } = body;

    if (!raceNo || !bib) {
      return NextResponse.json(
        { error: "raceNo and bib are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("participants")
      .update({ bag_given: true })
      .eq("race_no", raceNo)
      .eq("bib", bib)
      .select("id, bag_given")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Failed to update bag_given" },
        { status: 400 }
      );
    }

    let type = await fetchRaceTypeFromAPI(req, raceNo, bib);
    if (!type) {
      type = await getRaceType(data.id);
    }

    console.log("[bag-status][POST] raceNo:", raceNo, "bib:", bib, "type:", type);

    return NextResponse.json({
      participantId: data.id,
      bag_given: data.bag_given,
      type,
    });
  } catch (err: any) {
    console.error("bag-status POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}