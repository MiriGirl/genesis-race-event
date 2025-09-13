import RacePageClient from "./racepageclient";

// 👇 Force this page to always render dynamically on Vercel
export const dynamic = "force-dynamic";

export default function RacePage({ params }: { params: { fno: string } }) {
  // Always render the client component with whatever FNO is passed
  return <RacePageClient fno={params.fno} />;
}