"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AdminHome() {
  const { accessToken } = useAuth();
  const [overview, setOverview] = useState<{
    activeShipments: number;
    deliveredToday: number;
    deliveryRate: number;
    avgTransitHours: number;
  } | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    void (async () => {
      try {
        const res = await apiFetch<{
          activeShipments: number;
          deliveredToday: number;
          deliveryRate: number;
          avgTransitHours: number;
        }>("/admin/analytics/overview", { token: accessToken });
        setOverview(res);
      } catch {
        setOverview(null);
      }
    })();
  }, [accessToken]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Admin overview</h1>
      <p className="mt-2 text-slate-400">Operational snapshot.</p>
      {overview && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Active", overview.activeShipments],
            ["Delivered today", overview.deliveredToday],
            ["Delivery rate", `${Math.round(overview.deliveryRate * 100)}%`],
            ["Avg transit (h)", overview.avgTransitHours],
          ].map(([label, val]) => (
            <div key={String(label)} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-xs uppercase text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{val}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
