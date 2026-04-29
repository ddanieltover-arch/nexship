"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Info, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type NotificationItem = {
  id: string;
  type: "IN_APP" | "EMAIL" | "SMS" | string;
  subject: string | null;
  message: string;
  read: boolean;
  sentAt: string;
};

export default function AdminNotificationsPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setError(null);
    try {
      const res = await apiFetch<{ items: NotificationItem[] }>("/notifications", { token: accessToken });
      setItems(res.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  async function markRead(id: string) {
    if (!accessToken) return;
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH", token: accessToken });
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark as read");
    }
  }

  async function markAllRead() {
    if (!accessToken) return;
    try {
      await apiFetch("/notifications/read-all", { method: "PATCH", token: accessToken });
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark all as read");
    }
  }

  const alerts = useMemo(
    () =>
      items.map((n) => ({
        id: n.id,
        read: n.read,
        type:
          n.subject?.toLowerCase().includes("update")
            ? "info"
            : n.subject?.toLowerCase().includes("failed")
              ? "warning"
              : n.subject?.toLowerCase().includes("delivered")
                ? "success"
                : "info",
        title: n.subject || "Notification",
        msg: n.message,
        time: new Date(n.sentAt).toLocaleString(),
      })),
    [items]
  );

  return (
    <div className="space-y-10 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">System Alerts</h1>
          <p className="mt-2 text-slate-400">Critical updates and operational notifications for administrators.</p>
        </div>
        <button
          onClick={() => void markAllRead()}
          className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-slate-800"
        >
          Mark all read
        </button>
      </motion.div>

      <div className="rounded-[2.5rem] border border-slate-800 bg-navy overflow-hidden">
        {error && <div className="border-b border-slate-800 px-8 py-4 text-sm text-red-400">{error}</div>}
        <div className="divide-y divide-slate-800">
          {loading ? (
            <div className="px-8 py-10 text-slate-400">Loading notifications...</div>
          ) : alerts.length === 0 ? (
            <div className="px-8 py-10 text-slate-500">No notifications yet.</div>
          ) : (
            alerts.map((alert, idx) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={clsx(
                "flex items-start gap-6 p-8 hover:bg-slate-800/20 transition-colors",
                !alert.read && "bg-slate-900/30"
              )}
            >
              <div className={clsx(
                "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border",
                alert.type === "info" && "bg-blue-500/10 border-blue-500/20 text-blue-500",
                alert.type === "warning" && "bg-orange-500/10 border-orange-500/20 text-orange-500",
                alert.type === "success" && "bg-teal/10 border-teal/20 text-teal",
                alert.type === "critical" && "bg-red-500/10 border-red-500/20 text-red-500"
              )}>
                {alert.type === "info" && <Info className="h-6 w-6" />}
                {alert.type === "warning" && <AlertTriangle className="h-6 w-6" />}
                {alert.type === "success" && <CheckCircle className="h-6 w-6" />}
                {alert.type === "critical" && <Zap className="h-6 w-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-white">{alert.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{alert.time}</span>
                    {!alert.read && (
                      <button
                        onClick={() => void markRead(alert.id)}
                        className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:bg-slate-800"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-slate-400 leading-relaxed">{alert.msg}</p>
              </div>
            </motion.div>
          ))
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to handle clsx-like logic since it's not imported here yet
function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
