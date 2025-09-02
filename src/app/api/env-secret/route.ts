import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    preRegSecret: process.env.PRE_REGISTER_SECRET || "NOT_LOADED",
  });
}