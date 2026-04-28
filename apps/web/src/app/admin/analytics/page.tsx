"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AdminAnalyticsPage() {
  const { accessToken } = useAuth();
  const [points, setPoints] = useState<{ date: string; count: number }[]>([]);
  const [rate, setRate] = useState<{ delivered: number; failed: number; rate: number } | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    void (async () => {
      const [shipments, delivery] = await Promise.all([
        apiFetch<{ points: { date: string; count: number }[] }>("/admin/analytics/shipments", {
          token: accessToken,
        }),
        apiFetch<{ delivered: number; failed: number; rate: number }>("/admin/analytics/delivery-rate", {
          token: accessToken,
        }),
      ]);
      setPoints(shipments.points);
      setRate(delivery);
    })();
  }, [accessToken]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Analytics</h1>
      <p className="mt-2 text-slate-400">Volume and delivery success (last 30 days).</p>
      {rate && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-500">Delivered</p>
            <p className="text-2xl font-semibold text-white">{rate.delivered}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-500">Failed</p>
            <p className="text-2xl font-semibold text-white">{rate.failed}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-500">Success rate</p>
            <p className="text-2xl font-semibold text-teal">{Math.round(rate.rate * 100)}%</p>
          </div>
        </div>
      )}
      <div className="mt-10 h-72 w-full rounded-xl border border-slate-800 bg-slate-900/30 p-4">
        <p className="mb-2 text-sm text-slate-400">Shipments created per day</p>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={points}>
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
            <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-8 h-56 w-full rounded-xl border border-slate-800 bg-slate-900/30 p-4">
        <p className="mb-2 text-sm text-slate-400">Outcomes</p>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart
            data={rate ? [{ name: "delivered", v: rate.delivered }, { name: "failed", v: rate.failed }] : []}
          >
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
            <Bar dataKey="v" fill="#06b6d4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
