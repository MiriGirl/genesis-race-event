import { NextResponse } from "next/server";

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY!;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX!; // e.g. "us14"
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID!;

// Define the shape of a participant record
type Participant = {
  email: string;
  name: string;
  phone: string;
  race_no: string;
  age_group: string;
  nationality: string;
};

// Define the shape of the webhook payload
type WebhookBody = {
  type: string;
  table: string;
  record: Participant;
};

export async function POST(req: Request) {
  try {
    const body: WebhookBody = await req.json();
    console.log("📩 Incoming webhook:", body);

    const participant = body.record;

    // Build merge fields
    const [firstName, ...rest] = (participant.name || "").split(" ");
    const lastName = rest.join(" ");
    const flink = `https://innerdrive-race-event.vercel.app/${participant.race_no}`;

    const res = await fetch(
      `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
        },
        body: JSON.stringify({
          email_address: participant.email,
          status: "subscribed",
          merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
            PHONE: participant.phone,
            FNO: participant.race_no,
            FLINK: flink,
            AGE: participant.age_group,
            COUNTRY: participant.nationality,
          },
          tags: ["innerdrive-registered"],
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Mailchimp error:", data);
      return NextResponse.json({ error: data }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data });
  }  catch (err) {
  console.error("💥 Function error:", err);
  if (err instanceof Error) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  return NextResponse.json({ error: "Unknown error" }, { status: 500 });
}
}