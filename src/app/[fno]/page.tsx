import RacePageClient from "./racepageclient";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function RacePage({ params }: { params: { fno: string } }) {
  const raceNo = params.fno.toUpperCase();

  const { data, error } = await supabase
    .from("participants")
    .select("race_no")
    .eq("race_no", raceNo)
    .maybeSingle();

  if (error) {
    console.error(error);
    return <div className="text-white">❌ Something went wrong.</div>;
  }

  if (!data) {
    return <div className="text-white">⚠️ Invalid race number.</div>;
  }

  return <RacePageClient fno={data.race_no} />;
}