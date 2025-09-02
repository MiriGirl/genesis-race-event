import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.meuraki.com", // 🔒 restrict to your WP domain
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-innerdrive-secret",
};

// --- Handle preflight ---
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: Request) {
  const secret = req.headers.get("x-innerdrive-secret");
  if (secret !== process.env.PRE_REGISTER_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const body = await req.json();
  const { name, email, phone, nationality, age_group, line_type, source_system, source_id } = body;

  const email_norm = email.trim().toLowerCase();
  const phone_norm = phone.replace(/\s+/g, "");

  const { data: existing } = await supabase
    .from("participants")
    .select("id, race_no")
    .or(`email_norm.eq.${email_norm},phone_norm.eq.${phone_norm}`)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      ok: true,
      deduped: true,
      id: existing.id,
      race_no: existing.race_no
    }, { headers: corsHeaders });
  }

  const { data, error } = await supabase
    .from("participants")
    .insert([
      {
        name,
        email,
        phone,
        email_norm,
        phone_norm,
        nationality,
        age_group,
        line_type,
        pre_registered: true,
        source_system,
        source_id
      }
    ])
    .select("id, race_no")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }

  return NextResponse.json({
    ok: true,
    id: data.id,
    race_no: data.race_no
  }, { headers: corsHeaders });
}