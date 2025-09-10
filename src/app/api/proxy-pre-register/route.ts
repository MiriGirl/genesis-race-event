import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch("https://www.innerdrive.sg/api/pre-register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-innerdrive-secret": process.env.PRE_REGISTER_SECRET || "",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    console.error("❌ Proxy error:", err);
    return NextResponse.json({ error: "Proxy request failed" }, { status: 500 });
  }
}