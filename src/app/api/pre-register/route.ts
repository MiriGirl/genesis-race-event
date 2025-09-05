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
  "http://localhost:3000",   // dev
  "https://innerdrive.sg",   // prod
  "https://www.innerdrive.sg", // add this if missing
];

function getCorsHeaders(origin: string | null) {
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
  // fallback try JSON; if it fails, return empty
  try { return await req.json(); } catch { return {}; }
}

const normEmail = (email?: string) => (email || "").trim().toLowerCase();
const normPhone = (phone?: string) => (phone || "").replace(/\s+/g, "");

// Helper: check duplicate by email only
async function findExistingByEmail(email_norm: string) {
  const { data, error } = await supabase
    .from("participants")
    .select("id, race_no")
    .eq("email_norm", email_norm)
    .order("id", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}

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
      return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });
    }

    // Body (JSON or URL-encoded)
    const body: any = await readPayload(req);

    // Accept canonical + alternates
    const name          = (body.name ?? body.full_name ?? "").trim();
    const email         = (body.email ?? "").trim();
    const phone         = (body.phone ?? body.phone_number ?? "").trim();
    const nationality   = body.nationality ?? body.country ?? "";
    const age_group     = body.age_group ?? body.ageGroup ?? "";
    const line_type     = body.line_type ?? "exclusive";
    const source_system = body.source_system ?? "wordpress";
    const source_id     = body.source_id ?? "wp-form-1";

    if (!name || !email || !phone || !nationality || !age_group) {
      return NextResponse.json(
        { error: "missing_fields", missing: { name: !name, email: !email, phone: !phone, nationality: !nationality, age_group: !age_group } },
        { status: 400, headers }
      );
    }

    const email_norm = normEmail(email);
    const phone_norm = normPhone(phone);

    // Duplicate check (EMAIL ONLY)
    const existing = await findExistingByEmail(email_norm);
    if (existing) {
      return NextResponse.json(
        { ok: true, deduped: true, id: existing.id, race_no: existing.race_no },
        { status: 200, headers }
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
      // Handle race: unique constraint duplicate
      if ((error as any).code === "23505") {
        const again = await findExistingByEmail(email_norm);
        return NextResponse.json(
          { ok: true, deduped: true, id: again?.id, race_no: again?.race_no },
          { status: 200, headers }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500, headers });
    }

    return NextResponse.json(
      { ok: true, id: data!.id, race_no: data!.race_no, deduped: false },
      { status: 200, headers }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "internal_error" }, { status: 500, headers });
  }
}