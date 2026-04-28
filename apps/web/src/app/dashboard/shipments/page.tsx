"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type ShipmentRow = {
  id: string;
  trackingId: string;
  status: string;
  weightKg: number | null;
  origin: { city: string; country: string };
  destination: { city: string; country: string };
};

export default function ShipmentsPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<ShipmentRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    description: "",
    originStreet: "",
    originCity: "",
    originCountry: "",
    originPostal: "",
    destStreet: "",
    destCity: "",
    destCountry: "",
    destPostal: "",
    weightKg: "",
  });

  async function load() {
    if (!accessToken) return;
    const res = await apiFetch<{ items: ShipmentRow[] }>("/shipments?limit=50", { token: accessToken });
    setItems(res.items);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load is stable for token changes
  }, [accessToken]);

  async function createShipment(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setError(null);
    try {
      await apiFetch("/shipments", {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({
          description: form.description || undefined,
          origin: {
            street: form.originStreet,
            city: form.originCity,
            country: form.originCountry,
            postalCode: form.originPostal,
          },
          destination: {
            street: form.destStreet,
            city: form.destCity,
            country: form.destCountry,
            postalCode: form.destPostal,
          },
          weightKg: form.weightKg ? parseFloat(form.weightKg) : undefined,
        }),
      });
      setForm({
        description: "",
        originStreet: "",
        originCity: "",
        originCountry: "",
        originPostal: "",
        destStreet: "",
        destCity: "",
        destCountry: "",
        destPostal: "",
        weightKg: "",
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Shipments</h1>
      <p className="mt-2 text-slate-400">Create shipments and open live tracking.</p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/10 backdrop-blur-sm shadow-2xl">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400">
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Tracking ID</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Route</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Weight</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {items.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4 font-mono text-teal font-bold">
                  <Link href={`/track/${s.trackingId}`} className="hover:underline">
                    {s.trackingId}
                  </Link>
                </td>
                <td className="px-6 py-4 text-slate-300">
                  {s.origin.city} → {s.destination.city}
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {s.weightKg ? `${s.weightKg} kg` : "-"}
                </td>
                <td className="px-6 py-4">
                   <span className="rounded-full bg-slate-800 px-3 py-1 text-[10px] font-bold text-slate-300 border border-slate-700 uppercase">
                    {s.status.replace(/_/g, " ")}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="py-20 text-center text-slate-500">
            You haven&apos;t created any shipments yet.
          </div>
        )}
      </div>

      <ul className="mt-10 divide-y divide-slate-800 rounded-xl border border-slate-800">
        {items.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
            <div>
              <Link href={`/track/${s.trackingId}`} className="font-mono text-teal hover:underline">
                {s.trackingId}
              </Link>
              <p className="text-sm text-slate-500">
                {s.origin.city} → {s.destination.city} {s.weightKg ? `(${s.weightKg}kg)` : ""}
              </p>
            </div>
            <span className="text-xs uppercase text-slate-400">{s.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
