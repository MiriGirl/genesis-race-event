import RacePageClient from "./racepageclient.jsx";

export default function RacePage({ params }: { params: { fno: string } }) {
  // Always render the client component with whatever FNO is passed
  return <RacePageClient fno={params.fno} />;
}