import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raceNo = searchParams.get("raceNo");

    if (!raceNo) {
      return NextResponse.json(
        { error: "Missing raceNo" },
        { status: 400 }
      );
    }

    const { data: participant, error } = await supabase
      .from("participants")
      .select("id, bib, race_no, name, nationality, email, phone")
      .eq("race_no", raceNo)
      .maybeSingle(); // ✅ avoids hard crash if multiple rows

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "Database query failed", details: error.message },
        { status: 500 }
      );
    }

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: participant.id,
      bib: participant.bib,
      raceNo: participant.race_no,
      name: participant.name,
      country: participant.nationality ?? "UNKNOWN",
      email: participant.email,
      phone: participant.phone,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}