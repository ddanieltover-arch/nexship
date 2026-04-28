"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function TrackForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("id") ?? "";
  const [id, setId] = useState(initial);

  function go(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = id.trim();
    if (!trimmed) return;
    router.push(`/track/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-bold text-white">Track shipment</h1>
      <p className="mt-2 text-slate-400">Enter your public tracking ID to see live status and map.</p>
      <form onSubmit={go} className="mt-8 flex gap-2">
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Tracking ID"
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500"
        />
        <button type="submit" className="rounded-lg bg-teal px-5 py-3 font-semibold text-navy hover:bg-teal-600">
          Track
        </button>
      </form>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-slate-400">Loading…</div>}>
      <TrackForm />
    </Suspense>
  );
}
