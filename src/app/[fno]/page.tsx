import RacePageClient from "./racepageclient";

export default async function RacePage({
  params,
}: {
  params: Promise<{ fno: string }>;
}) {
  const { fno } = await params;
  return <RacePageClient fno={fno} />;
}