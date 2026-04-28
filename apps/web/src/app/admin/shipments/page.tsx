"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Send, Calendar, Map, FileText, ChevronDown, BarChart, Trash2, Edit2, PlusCircle } from "lucide-react";

type Row = {
  id: string;
  trackingId: string;
  status: string;
  carrier: string | null;
  receiverName: string | null;
  createdAt: string;
  customer: { id: string; email: string; name: string | null };
  origin: { street: string; city: string; state: string | null; country: string };
  destination: { street: string; city: string; state: string | null; country: string };
};

export default function AdminShipmentsPage() {
  const { accessToken, user } = useAuth();
  const [items, setItems] = useState<Row[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    if (!accessToken || (user?.role !== "ADMIN" && user?.role !== "STAFF")) return;
    const q = status ? `?status=${encodeURIComponent(status)}` : "";
    try {
      const res = await apiFetch<{ items: Row[] }>(`/admin/shipments${q}`, { token: accessToken });
      setItems(res.items);
    } catch (err) {
      console.error("Failed to load shipments", err);
      // Optional: Redirect to login if it's an auth error
    }
  }, [accessToken, user?.role, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function deleteShipment(id: string) {
    if (!confirm("Are you sure you want to delete this shipment?")) return;
    try {
      await apiFetch(`/shipments/${id}`, { method: "DELETE", token: accessToken! });
      void load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
    return <p className="text-slate-400 p-8 text-center">Unauthorized Access.</p>;
  }

  const filteredItems = items.filter(item => {
    const s = search.toLowerCase();
    return (
      item.trackingId.toLowerCase().includes(s) ||
      (item.receiverName || "").toLowerCase().includes(s) ||
      item.customer.email.toLowerCase().includes(s)
    );
  });

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      {/* Header Matching Image */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Incoming Orders</h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search tracking, receiver, o..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-teal focus:outline-none transition-all"
            />
            <motion.div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
               <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </motion.div>
          </div>

          <div className="relative w-full sm:w-48">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-300 focus:border-teal outline-none transition-all"
            >
              <option value="">All Statuses</option>
              {["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED"].map(s => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          </div>

          <Link 
            href="/admin/shipments/create"
            className="flex items-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-sm font-bold text-navy hover:bg-teal-600 transition-all shadow-lg shadow-teal/20"
          >
            <PlusCircle className="h-4 w-4" />
            Create
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[500px] rounded-2xl border border-slate-800 bg-slate-900/10 backdrop-blur-md shadow-2xl">
        <table className="min-w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-500">
              <th className="px-6 py-6 font-bold uppercase tracking-wider">Tracking No.</th>
              <th className="px-6 py-6 font-bold uppercase tracking-wider">Status</th>
              <th className="px-6 py-6 font-bold uppercase tracking-wider">Receiver</th>
              <th className="px-6 py-6 font-bold uppercase tracking-wider">Carrier</th>
              <th className="px-6 py-6 font-bold uppercase tracking-wider">Origin</th>
              <th className="px-6 py-6 font-bold uppercase tracking-wider">Destination</th>
              <th className="px-6 py-6 font-bold uppercase tracking-wider">Date</th>
              <th className="px-6 py-6 font-bold uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredItems.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/20 transition-colors bg-slate-950/20">
                <td className="px-6 py-8 font-bold text-[#3b82f6] dark:text-[#60a5fa] tracking-tight">
                  {s.trackingId}
                </td>
                <td className="px-6 py-8">
                   <span className="rounded-full bg-[#dbeafe] dark:bg-blue-900/30 px-3 py-1.5 text-[11px] font-bold text-[#1e40af] dark:text-blue-300">
                    {s.status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                   </span>
                </td>
                <td className="px-6 py-8 text-slate-300 font-medium whitespace-nowrap">
                  {s.receiverName || s.customer.name || "N/A"}
                </td>
                <td className="px-6 py-8 text-slate-400">
                  {s.carrier || "SwiftNav Logistics"}
                </td>
                <td className="px-4 py-8 text-slate-400">
                  {s.origin.city} {s.origin.state || s.origin.country}
                </td>
                <td className="px-6 py-8 text-slate-400 max-w-[150px] truncate">
                  {s.destination.street}, {s.destination.city}
                </td>
                <td className="px-6 py-8 text-slate-400">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-8">
                  <div className="flex items-center justify-center gap-1.5">
                    <UpdateStatusForm
                      id={s.id}
                      trackingId={s.trackingId}
                      onSuccess={() => void load()}
                      accessToken={accessToken!}
                    />
                    <EditShipmentForm
                      id={s.id}
                      trackingId={s.trackingId}
                      accessToken={accessToken!}
                      onSuccess={() => void load()}
                    />
                    <button
                      onClick={() => deleteShipment(s.id)}
                      className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2 text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all border border-slate-200 dark:border-slate-700"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="py-24 text-center">
            <BarChart className="mx-auto h-12 w-12 text-slate-800 mb-4" />
            <p className="text-slate-500 font-medium">No shipment logs found.</p>
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
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const modal = (
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
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2rem] border border-slate-800 bg-navy p-6 md:p-8 shadow-2xl custom-scrollbar"
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
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all border border-slate-200 dark:border-slate-700"
        title="Add Event"
      >
        <MapPin className="h-3.5 w-3.5" />
      </button>

      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}

function EditShipmentForm({
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
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [form, setForm] = useState({
    shipmentType: "Air Freight",
    carrier: "NexShip Logistics",
    paymentMethod: "Bank Transfer",
    description: "",
    weightKg: "",
    senderName: "",
    senderPhone: "",
    senderEmail: "",
    senderAddress: "",
    receiverName: "",
    receiverPhone: "",
    receiverEmail: "",
    receiverAddress: "",
    departureAt: "",
    estimatedAt: "",
    notes: "",
  });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setFetching(true);
    void (async () => {
      try {
        const res = await apiFetch<{
          shipment: {
            description?: string | null;
            weightKg?: number | null;
            shipmentType?: string | null;
            carrier?: string | null;
            paymentMethod?: string | null;
            senderName?: string | null;
            senderPhone?: string | null;
            senderEmail?: string | null;
            receiverName?: string | null;
            receiverPhone?: string | null;
            receiverEmail?: string | null;
            departureAt?: string | null;
            estimatedAt?: string | null;
            notes?: string | null;
            origin?: { street: string; city: string; state: string | null; country: string; postalCode: string } | null;
            destination?: { street: string; city: string; state: string | null; country: string; postalCode: string } | null;
          };
        }>(
          `/shipments/${id}`,
          { token: accessToken }
        );
        if (cancelled) return;
        const toAddress = (a?: { street: string; city: string; state: string | null; country: string; postalCode: string } | null) =>
          a ? [a.street, a.city, a.country, a.postalCode].filter(Boolean).join(", ") : "";
        setForm({
          shipmentType: res.shipment.shipmentType ?? "Air Freight",
          carrier: res.shipment.carrier ?? "NexShip Logistics",
          paymentMethod: res.shipment.paymentMethod ?? "Bank Transfer",
          description: res.shipment.description ?? "",
          weightKg: res.shipment.weightKg != null ? String(res.shipment.weightKg) : "",
          senderName: res.shipment.senderName ?? "",
          senderPhone: res.shipment.senderPhone ?? "",
          senderEmail: res.shipment.senderEmail ?? "",
          senderAddress: toAddress(res.shipment.origin),
          receiverName: res.shipment.receiverName ?? "",
          receiverPhone: res.shipment.receiverPhone ?? "",
          receiverEmail: res.shipment.receiverEmail ?? "",
          receiverAddress: toAddress(res.shipment.destination),
          departureAt: res.shipment.departureAt ? new Date(res.shipment.departureAt).toISOString().slice(0, 16) : "",
          estimatedAt: res.shipment.estimatedAt ? new Date(res.shipment.estimatedAt).toISOString().slice(0, 16) : "",
          notes: res.shipment.notes ?? "",
        });
      } catch (err) {
        if (!cancelled) alert(err instanceof Error ? err.message : "Failed to load shipment");
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, id, accessToken]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const parseAddress = (addr: string) => {
        const parts = addr.split(",");
        return {
          street: parts[0]?.trim() || "Main St",
          city: parts[1]?.trim() || "London",
          country: parts[2]?.trim() || "UK",
          postalCode: parts[3]?.trim() || "SW1A",
        };
      };
      await apiFetch(`/shipments/${id}`, {
        method: "PATCH",
        token: accessToken,
        body: JSON.stringify({
          shipmentType: form.shipmentType || undefined,
          carrier: form.carrier || undefined,
          paymentMethod: form.paymentMethod || undefined,
          description: form.description || undefined,
          weightKg: form.weightKg ? Number(form.weightKg) : undefined,
          senderName: form.senderName || undefined,
          senderPhone: form.senderPhone || undefined,
          senderEmail: form.senderEmail || undefined,
          receiverName: form.receiverName || undefined,
          receiverPhone: form.receiverPhone || undefined,
          receiverEmail: form.receiverEmail || undefined,
          departureAt: form.departureAt ? new Date(form.departureAt).toISOString() : null,
          estimatedAt: form.estimatedAt ? new Date(form.estimatedAt).toISOString() : null,
          notes: form.notes || undefined,
          origin: parseAddress(form.senderAddress),
          destination: parseAddress(form.receiverAddress),
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

  const modal = (
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
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2rem] border border-slate-800 bg-navy p-6 md:p-8 shadow-2xl custom-scrollbar"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-6 top-6 text-slate-500 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-2xl font-bold text-white">
                <Edit2 className="h-6 w-6 text-orange-500" />
                Edit Shipment
              </div>
              <p className="mt-2 text-sm text-slate-400 font-mono">Tracking: {trackingId}</p>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-5">
              {fetching ? (
                <div className="py-10 text-center text-slate-400">Loading shipment details...</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Shipment Type</label>
                      <input
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all"
                        value={form.shipmentType}
                        onChange={(e) => setForm((f) => ({ ...f, shipmentType: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Carrier</label>
                      <input
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all"
                        value={form.carrier}
                        onChange={(e) => setForm((f) => ({ ...f, carrier: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                    <textarea
                      rows={3}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all resize-none"
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sender Name</label>
                      <input
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all"
                        value={form.senderName}
                        onChange={(e) => setForm((f) => ({ ...f, senderName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sender Phone</label>
                      <input
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all"
                        value={form.senderPhone}
                        onChange={(e) => setForm((f) => ({ ...f, senderPhone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sender Email</label>
                      <input
                        type="email"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all"
                        value={form.senderEmail}
                        onChange={(e) => setForm((f) => ({ ...f, senderEmail: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sender Address</label>
                    <input
                      placeholder="Street, City, Country, PostalCode"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all"
                      value={form.senderAddress}
                      onChange={(e) => setForm((f) => ({ ...f, senderAddress: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Receiver Name</label>
                      <input
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all"
                        value={form.receiverName}
                        onChange={(e) => setForm((f) => ({ ...f, receiverName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Receiver Phone</label>
                      <input
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all"
                        value={form.receiverPhone}
                        onChange={(e) => setForm((f) => ({ ...f, receiverPhone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Receiver Email</label>
                      <input
                        type="email"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all"
                        value={form.receiverEmail}
                        onChange={(e) => setForm((f) => ({ ...f, receiverEmail: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Receiver Address</label>
                    <input
                      placeholder="Street, City, Country, PostalCode"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all"
                      value={form.receiverAddress}
                      onChange={(e) => setForm((f) => ({ ...f, receiverAddress: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all"
                        value={form.weightKg}
                        onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Departure</label>
                      <input
                        type="datetime-local"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all [color-scheme:dark]"
                        value={form.departureAt}
                        onChange={(e) => setForm((f) => ({ ...f, departureAt: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Method</label>
                      <input
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all"
                        value={form.paymentMethod}
                        onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Delivery</label>
                      <input
                        type="datetime-local"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all [color-scheme:dark]"
                        value={form.estimatedAt}
                        onChange={(e) => setForm((f) => ({ ...f, estimatedAt: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Notes</label>
                    <textarea
                      rows={3}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all resize-none"
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                  </div>
                  <button
                    disabled={loading}
                    type="submit"
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1e3a8a] py-4 text-sm font-bold text-white hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50"
                  >
                    <Edit2 className="h-4 w-4" />
                    {loading ? "Saving Changes..." : "Save Changes"}
                  </button>
                </>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2 text-orange-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
        title="Edit"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </button>
      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
