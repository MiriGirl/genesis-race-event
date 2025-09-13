import RacePageClient from "./racepageclient";

// 👇 Force this page to always render dynamically on Vercel
export const dynamic = "force-dynamic";

export default function RacePage({ params }: { params: { fno: string } }) {
  // Normalize the race number to lowercase to avoid case-sensitivity issues on Vercel
  const fno = params.fno.toLowerCase();

  return <RacePageClient fno={fno} />;
}