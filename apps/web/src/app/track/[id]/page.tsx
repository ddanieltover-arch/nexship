import { TrackLiveGate } from "./TrackLiveGate";

export default async function TrackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TrackLiveGate trackingId={id} />;
}
