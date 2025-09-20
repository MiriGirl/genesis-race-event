import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const participantId = searchParams.get("participantId");
    let fno = searchParams.get("fno");

    if (!participantId && !fno) {
      return NextResponse.json(
        { error: "Must provide either participantId or fno as query parameter" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("participants")
      .select("id, bib, race_no, name, nationality, email, phone");

    if (participantId) {
      query = query.eq("id", participantId);
    } else {
      if (!fno) {
        fno = "F10327";
      }
      query = query.eq("race_no", fno);
    }

    const { data: participant, error } = await query.maybeSingle(); // ✅ avoids hard crash if multiple rows

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
      fno: participant.race_no,
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