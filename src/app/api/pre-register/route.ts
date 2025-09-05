import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- Helper: CORS headers ---
function getCorsHeaders(origin: string | null) {
  const allowedOrigins = [
    "https://www.meuraki.com",
    "http://localhost:3000",   // dev
    "https://innerdrive.sg",   // prod
  ];

  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "https://www.meuraki.com",
    "Vary": "Origin", // prevent caching issues
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-innerdrive-secret",
    "Access-Control-Max-Age": "86400",
  };
}

// --- Handle preflight ---
export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
}


// --- Handle POST ---
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const headers = getCorsHeaders(origin);

  const secret = req.headers.get("x-innerdrive-secret");
  if (secret !== process.env.PRE_REGISTER_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });
  }

  const body = await req.json();
  const { name, email, phone, nationality, age_group, line_type, source_system, source_id } = body;

  const email_norm = email.trim().toLowerCase();
  const phone_norm = phone.replace(/\s+/g, "");

  // Check dedupe
  const { data: existing } = await supabase
    .from("participants")
    .select("id, race_no")
    .or(`email_norm.eq.${email_norm},phone_norm.eq.${phone_norm}`)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { ok: true, deduped: true, id: existing.id, race_no: existing.race_no },
      { headers }
    );
  }

  // Insert new participant
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
        source_id,
      },
    ])
    .select("id, race_no")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers });
  }

  return NextResponse.json({ ok: true, id: data.id, race_no: data.race_no }, { headers });
}