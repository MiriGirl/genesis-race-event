import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // must use service role for writes
);

export async function POST(req: Request) {
  try {
    const { participantId } = await req.json();

    // update points based on lineType
    const { error } = await supabase.rpc("increment_points", {
      participant_id: participantId
    });

    if (error) {
      console.error("Error updating points:", error);
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}