"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type ShipmentRow = {
  id: string;
  trackingId: string;
  status: string;
  createdAt: string;
  origin: { city: string };
  destination: { city: string };
};

export default function DashboardHome() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<ShipmentRow[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    void (async () => {
      const res = await apiFetch<{ items: ShipmentRow[] }>("/shipments?limit=5", { token: accessToken });
      setItems(res.items);
    })();
  }, [accessToken]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-2 text-slate-400">Recent shipments and quick actions.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/shipments"
          className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 hover:border-teal"
        >
          <p className="text-sm text-teal">Shipments</p>
          <p className="mt-2 text-lg font-semibold text-white">Create & manage</p>
          <p className="mt-1 text-sm text-slate-500">Open the shipment workspace</p>
        </Link>
        <Link href="/track" className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 hover:border-teal">
          <p className="text-sm text-teal">Public track</p>
          <p className="mt-2 text-lg font-semibold text-white">Share tracking links</p>
          <p className="mt-1 text-sm text-slate-500">No login required for recipients</p>
        </Link>
      </div>
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-white">Recent</h2>
        <ul className="mt-4 divide-y divide-slate-800 rounded-xl border border-slate-800">
          {items.length === 0 && <li className="px-4 py-6 text-sm text-slate-500">No shipments yet.</li>}
          {items.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <p className="font-mono text-sm text-teal">{s.trackingId}</p>
                <p className="text-xs text-slate-500">
                  {s.origin.city} → {s.destination.city}
                </p>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{s.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
