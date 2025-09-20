import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    await req.json(); // parse body but no parameters needed

    const { data: stations, error } = await supabase
      .from("stations")
      .select("id, access_code, order_index")
      .order("order_index", { ascending: true });

    if (error || !stations) {
      return Response.json({ error: 'Error fetching stations' }, { status: 500 });
    }

    const codes = stations.map(s => ({
      sector: s.order_index,
      accessCode: s.access_code,
      stationId: s.id,
    }));

    return Response.json({ codes });
  } catch (err) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}