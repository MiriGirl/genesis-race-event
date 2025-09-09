import TestRacePageClient from "./testracepageclient";

export default function TestPage({ params }: { params: { fno: string } }) {
  return <TestRacePageClient fno={params.fno} />;
}