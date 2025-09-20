import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { raceNo, bib, accessCode } = body;

    if (!raceNo || !bib || !accessCode) {
      return NextResponse.json(
        { error: "Missing raceNo, bib, or accessCode" },
        { status: 400 }
      );
    }

    // Find the station with the given accessCode
    const { data: stationData, error: stationError } = await supabase
      .from("stations")
      .select("id,access_code")
      .eq("access_code", accessCode)
      .maybeSingle();

    if (stationError || !stationData) {
      return NextResponse.json(
        { error: "Invalid accessCode" },
        { status: 400 }
      );
    }
    const stationId = stationData.id;

    // Find the participant by bib and raceNo
    const { data: participantData, error: participantError } = await supabase
      .from("participants")
      .select("id,bib,race_no")
      .eq("bib", bib)
      .eq("race_no", raceNo)
      .maybeSingle();

    if (participantError || !participantData) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 400 }
      );
    }
    const participantId = participantData.id;

    // Upsert into checkpoints: (participant_id, station_id, race_no, access_code, start_time)
    const { data: checkpointData, error: checkpointError } = await supabase
      .from("checkpoints")
      .upsert(
        [
          {
            participant_id: participantId,
            station_id: stationId,
            race_no: raceNo,
            access_code: accessCode,
            start_time: new Date().toISOString(),
            completed_at: null,
            split_ms: null,
          },
        ],
        { onConflict: "participant_id,station_id" }
      )
      .select("participant_id, station_id, race_no, access_code")
      .maybeSingle();

    if (checkpointError) {
      return NextResponse.json(
        { error: checkpointError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      raceNo: checkpointData?.race_no,
      participantId: checkpointData?.participant_id,
      stationId: checkpointData?.station_id,
      accessCode: checkpointData?.access_code,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}