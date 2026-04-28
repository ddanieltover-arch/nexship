import { TrackLive } from "./TrackLive";

export default async function TrackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TrackLive trackingId={id} />;
}
