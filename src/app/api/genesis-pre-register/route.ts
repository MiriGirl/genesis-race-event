// /src/app/api/pre-register/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force Node runtime (so supabase-js works) and disable static caching
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────
const allowedOrigins = [
  "https://www.meuraki.com",
  "http://localhost:3000", 
  "http://localhost:3003",  // ✅ add this    // dev
  "https://innerdrive.sg",     // prod
  "https://www.innerdrive.sg", // prod (www)
];

function getCorsHeaders(origin: string | null) {
  console.log("🌐 Request Origin:", origin);
  const isAllowed = !!origin && allowedOrigins.includes(origin);
  const allowOrigin = isAllowed ? origin! : "https://www.meuraki.com";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-innerdrive-secret",
    "Access-Control-Max-Age": "86400",
  };
}

// Preflight
export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
async function readPayload(req: Request) {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return await req.json();
  }
  if (ct.includes("application/x-www-form-urlencoded")) {
    const body = await req.text();
    return Object.fromEntries(new URLSearchParams(body));
  }
  try {
    return await req.json();
  } catch {
    return {};
  }
}

const normEmail = (email?: string) => (email || "").trim().toLowerCase();
const normPhone = (phone?: string) => (phone || "").replace(/\s+/g, "");

// ─────────────────────────────────────────────────────────
// POST
// ─────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const headers = getCorsHeaders(origin);

  try {
    // Auth
    const secret = req.headers.get("x-innerdrive-secret");
    if (secret !== process.env.PRE_REGISTER_SECRET) {
      console.warn("❌ Unauthorized secret:", secret);
      return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });
    }

    // Body (JSON or URL-encoded)
    const body: any = await readPayload(req);
    console.log("📩 Incoming body:", body);

    // Accept canonical + alternates
    const name          = (body.name ?? body.full_name ?? "").trim();
    const email         = (body.email ?? "").trim();
    const phone         = (body.phone ?? body.phone_number ?? "").trim();
    const nationality   = body.nationality ?? body.country ?? "";
    const age_group     = body.age_group ?? body.ageGroup ?? "";
   

    if (!name || !email || !phone || !nationality || !age_group) {
      console.warn("⚠️ Missing fields:", { name, email, phone, nationality, age_group });
      return NextResponse.json(
        {
          error: "missing_fields",
          missing: {
            name: !name,
            email: !email,
            phone: !phone,
            nationality: !nationality,
            age_group: !age_group,
          },
        },
        { status: 400, headers }
      );
    }

    const email_norm = normEmail(email);
    const phone_norm = normPhone(phone);

    // Row to insert/upsert
    const row: any = {
      name,
      email,
      phone,
      email_norm,
      phone_norm,
      nationality,
      age_group,
      pre_registered: true,
  
    };

    console.log("📌 Row for UPSERT:", row);

    // UPSERT instead of insert + dedupe
    const { data, error } = await supabase
      .from("genesis_participants")
      .upsert([row], { onConflict: "email_norm" })
      .select("id, created_at, updated_at")
      .single();

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500, headers });
    }

    console.log("✅ Supabase success:", data);

    // dedupe detection: if updated_at !== created_at, it's an update
    const deduped = data.updated_at !== data.created_at;

    return NextResponse.json(
      {
        ok: true,
        id: data.id,
        deduped,
      },
      { status: 200, headers }
    );
  } catch (e: any) {
    console.error("💥 Exception in pre-register API:", e);
    return NextResponse.json(
      { error: e?.message || "internal_error" },
      { status: 500, headers }
    );
  }
}