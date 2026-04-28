"use client";

import dynamic from "next/dynamic";

const TrackLive = dynamic(() => import("./TrackLive").then((mod) => mod.TrackLive), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="h-10 w-10 rounded-full border-2 border-slate-800 border-t-teal animate-spin mb-4" />
      <p className="text-slate-400 font-medium">Initializing tracking environment...</p>
    </div>
  ),
});

export function TrackLiveGate({ trackingId }: { trackingId: string }) {
  return <TrackLive trackingId={trackingId} />;
}
