export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import crypto from "crypto";

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY!;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX!; // e.g. "us14"
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID!;

function withCORS(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "https://www.meuraki.com");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, x-innerdrive-secret");
  return res;
}
// Define the shape of a participant record
type Participant = {
  email: string;
  name: string;
  phone: string;
  age_group: string;
  nationality: string;
};

// Define the shape of the webhook payload
type WebhookBody = {
  type: string;
  table: string;
  record: Participant;
  old_record?: Participant;
};

// Helper → MD5 hash of lowercase email
function getSubscriberHash(email: string) {
  return crypto.createHash("md5").update(email.toLowerCase()).digest("hex");
}

export async function POST(req: Request) {
  try {
    let body: WebhookBody | null = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    console.log("📩 Parsed Genesis webhook:", JSON.stringify(body, null, 2));

    const participant = body.record || body.old_record;
    if (!participant?.email) {
      console.error("❌ Genesis Mailchimp error: Missing participant email in webhook body");
      return NextResponse.json({ error: "Missing participant email" }, { status: 400 });
    }

    const [firstName, ...rest] = (participant.name || "").split(" ");
    const lastName = rest.join(" ");
    const subscriberHash = getSubscriberHash(participant.email);

    // STEP 1 → Upsert subscriber
    const res = await fetch(
      `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
        },
        body: JSON.stringify({
          email_address: participant.email,
          status_if_new: "subscribed",
          merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
            PHONE: participant.phone,
            AGE: participant.age_group,
            COUNTRY: participant.nationality,
          },
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Genesis Mailchimp error (upsert):", data);
      return NextResponse.json({ error: data.detail || data }, { status: 400 });
    }

    console.log("✅ Mailchimp Genesis upsert success:", data.id);

    // STEP 2 → Add tag (without replacing existing tags)
    const tagRes = await fetch(
      `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}/tags`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
        },
        body: JSON.stringify({
          tags: [{ name: "genesis2025", status: "active" }],
        }),
      }
    );

    const tagData = await tagRes.json();
    if (!tagRes.ok) {
      console.error("❌ Genesis Mailchimp error (tag):", tagData);
      return NextResponse.json({ error: tagData.detail || tagData }, { status: 400 });
    }

    console.log("🏷️ Genesis tag added successfully:", tagData);

    return NextResponse.json({ ok: true, data, tagData });
  } catch (err) {
    console.error("💥 Genesis function error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}