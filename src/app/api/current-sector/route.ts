import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client (better: move this into a shared lib file)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // needs Service Role for RLS bypass
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get("playerId");

    if (!playerId) {
      return NextResponse.json(
        { error: "Missing playerId" },
        { status: 400 }
      );
    }

    // Fetch stations for this player ordered by sector
    const { data: stations, error } = await supabase
      .from("stations")
      .select("*")
      .eq("playerId", playerId)
      .order("sectorNumber", { ascending: true });

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json(
        { error: "Database query failed" },
        { status: 500 }
      );
    }

    if (!stations || stations.length === 0) {
      return NextResponse.json({ currentSector: 1, status: "fresh" });
    }

    // Find first station without a splitTime
    const nextSector = stations.find((s) => s.splitTime === null);

    if (nextSector) {
      return NextResponse.json({
        currentSector: nextSector.sectorNumber,
        status: "in_progress",
      });
    }

    return NextResponse.json({ currentSector: null, status: "finished" });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}