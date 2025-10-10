import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// 📝 Add a new wish
export async function POST(request: Request) {
  try {
    const { name, message } = await request.json();

    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("wishes")
      .insert([{ name: name || null, message }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, wish: data[0] }, { status: 201 });
  } catch (err: any) {
    console.error("POST Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 📬 Get all wishes
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("wishes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, wishes: data });
  } catch (err: any) {
    console.error("GET Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}