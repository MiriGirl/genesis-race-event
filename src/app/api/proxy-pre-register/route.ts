import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch("https://www.innerdrive.sg/api/pre-register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-innerdrive-secret": process.env.INNERDRIVE_SECRET || "",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}