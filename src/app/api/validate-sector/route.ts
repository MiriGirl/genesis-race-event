import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const { bib, accessCode } = await request.json();

  if (!bib || !accessCode) {
    return NextResponse.json(
      { error: "Missing bib or accessCode" },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ✅ Fetch participant by bib
  const { data: racer, error: racerError } = await supabase
    .from("participants")
    .select("race_no")
    .eq("bib", bib)
    .single();

  if (racerError || !racer) {
    return NextResponse.json({ error: "Racer not found" }, { status: 404 });
  }

  const raceNo = racer.race_no;

  // ✅ Look for checkpoint for this raceNo + accessCode
  const { data: checkpoint, error: checkpointError } = await supabase
    .from("checkpoints")
    .select("*")
    .eq("race_no", raceNo)
    .eq("access_code", accessCode)
    .maybeSingle();

  if (checkpointError) {
    return NextResponse.json(
      { error: "Error fetching checkpoint" },
      { status: 500 }
    );
  }

  if (!checkpoint) {
    return NextResponse.json(
      { error: "Invalid or wrong code" },
      { status: 400 }
    );
  }

  // ✅ Validation successful (logging/upsert disabled for now)
  // const { error: upsertError } = await supabase.from("checkpoints").upsert({
  //   race_no: raceNo,
  //   access_code: accessCode,
  //   completed_at: null,
  //   split_ms: null,
  // });

  // if (upsertError) {
  //   return NextResponse.json(
  //     { error: "Error updating checkpoint" },
  //     { status: 500 }
  //   );
  // }

  return NextResponse.json({
    status: "ok",
    raceNo,
    message: `Sector for code ${accessCode} validated`,
  });
}