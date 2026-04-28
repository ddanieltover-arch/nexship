"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Send, Calendar, Map, FileText, ChevronDown, BarChart, Trash2, Edit2, PlusCircle } from "lucide-react";

type Row = {
  id: string;
  trackingId: string;
  status: string;
  createdAt: string;
  customer: { id: string; email: string; name: string | null };
  origin: { city: string };
  destination: { city: string };
};

export default function AdminShipmentsPage() {
  const { accessToken, user } = useAuth();
  const [items, setItems] = useState<Row[]>([]);
  const [status, setStatus] = useState("");

  async function load() {
    if (!accessToken || (user?.role !== "ADMIN" && user?.role !== "STAFF")) return;
    const q = status ? `?status=${encodeURIComponent(status)}` : "";
    const res = await apiFetch<{ items: Row[] }>(`/admin/shipments${q}`, { token: accessToken });
    setItems(res.items);
  }

  async function deleteShipment(id: string) {
    if (!confirm("Are you sure you want to delete this shipment?")) return;
    try {
      await apiFetch(`/shipments/${id}`, { method: "DELETE", token: accessToken! });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  useEffect(() => {
    void load();
  }, [accessToken, user?.role, status]);

  if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
    return <p className="text-slate-400 p-8 text-center">Unauthorized Access.</p>;
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      {/* Header Matching Image */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="flex items-center gap-3 text-3xl font-bold text-white">
          <BarChart className="h-8 w-8 text-teal" />
          Total Shipments
        </div>
        <p className="mt-2 text-slate-400 font-medium tracking-wide">Complete historical log of all shipments</p>
        
        <Link 
          href="/admin/shipments/create"
          className="mt-6 flex items-center gap-2 rounded-xl bg-teal px-6 py-3 text-sm font-bold text-navy hover:bg-teal-600 transition-all shadow-lg shadow-teal/20"
        >
          <PlusCircle className="h-5 w-5" />
          Create New Shipment
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/10 backdrop-blur-md shadow-2xl">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400">
              <th className="px-6 py-5 font-bold text-[13px] tracking-tight">Tracking No.</th>
              <th className="px-6 py-5 font-bold text-[13px] tracking-tight">Receiver</th>
              <th className="px-6 py-5 font-bold text-[13px] tracking-tight">Status</th>
              <th className="px-6 py-5 font-bold text-[13px] tracking-tight">Date Created</th>
              <th className="px-6 py-5 font-bold text-[13px] tracking-tight">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {items.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/20 transition-colors bg-slate-950/20">
                <td className="px-6 py-5 font-bold text-white tracking-tighter">
                  {s.trackingId}
                </td>
                <td className="px-6 py-5 text-slate-300 font-medium">
                  {s.customer.name || s.customer.email.split('@')[0]}
                </td>
                <td className="px-6 py-5">
                   <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[12px] font-bold text-navy-900 dark:text-slate-300 border border-slate-700 shadow-sm">
                    {s.status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                   </span>
                </td>
                <td className="px-6 py-5 text-slate-400 font-medium">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <UpdateStatusForm
                      id={s.id}
                      trackingId={s.trackingId}
                      onSuccess={() => void load()}
                      accessToken={accessToken!}
                    />
                    <Link 
                      href={`/admin/shipments/${s.id}/edit`}
                      className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all flex items-center gap-1.5"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteShipment(s.id)}
                      className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="py-24 text-center">
            <BarChart className="mx-auto h-12 w-12 text-slate-800 mb-4" />
            <p className="text-slate-500 font-medium">No shipment logs found in the database.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function UpdateStatusForm({
  id,
  trackingId,
  onSuccess,
  accessToken,
}: {
  id: string;
  trackingId: string;
  onSuccess: () => void;
  accessToken: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    status: "IN_TRANSIT",
    description: "",
    city: "",
    timestamp: new Date().toISOString().slice(0, 16),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch(`/shipments/${id}/status`, {
        method: "PATCH",
        token: accessToken,
        body: JSON.stringify({
          status: form.status,
          description: form.description || undefined,
          city: form.city || undefined,
          timestamp: new Date(form.timestamp).toISOString(),
        }),
      });
      setOpen(false);
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-1.5 text-xs font-bold text-teal-600 hover:bg-slate-800 transition-all flex items-center gap-1.5"
      >
        Add Event
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-slate-700 bg-navy p-8 shadow-2xl"
            >
              <button 
                onClick={() => setOpen(false)}
                className="absolute right-6 top-6 text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-2 text-2xl font-bold text-white">
                  <MapPin className="h-6 w-6 text-pink-500" />
                  Update Status
                </div>
                <p className="mt-2 text-sm text-slate-400 font-mono">Tracking: {trackingId}</p>
              </div>

              <form onSubmit={submit} className="mt-10 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Status Marker</label>
                    <div className="relative">
                      <select
                        value={form.status}
                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                        className="w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all"
                      >
                        {["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RETURNED"].map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Date and Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={form.timestamp}
                      onChange={(e) => setForm((f) => ({ ...f, timestamp: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Map className="h-3 w-3" /> Current Location
                  </label>
                  <input
                    placeholder="e.g., Chicago Hub"
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  />
                  <p className="text-[10px] text-slate-500 italic">Map coordinates will be fetched automatically.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Description Details
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g., Package arrived at distribution hub."
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all resize-none"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1e3a8a] py-4 text-sm font-bold text-white hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Posting Update..." : "Post Update & Send Notification"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
