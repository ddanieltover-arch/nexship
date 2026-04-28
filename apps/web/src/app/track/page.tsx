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
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="mx-auto max-w-lg">
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

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-teal">Tracking Tips</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>Use the full ID exactly as shared.</li>
            <li>Status updates appear in near real-time.</li>
            <li>Check timeline entries for latest location scans.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-teal">Need Help?</p>
          <p className="mt-4 text-sm text-slate-300">
            If your shipment has no movement for 24+ hours, our support team can investigate quickly.
          </p>
          <a href="/contact" className="mt-4 inline-block text-sm font-semibold text-teal hover:underline">
            Contact support
          </a>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-teal">Express Options</p>
          <p className="mt-4 text-sm text-slate-300">
            Upgrade to Priority Air for faster transit windows and proactive milestone notifications.
          </p>
          <a href="/services" className="mt-4 inline-block text-sm font-semibold text-teal hover:underline">
            View services
          </a>
        </div>
      </div>
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
