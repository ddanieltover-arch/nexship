"use client";

import { motion } from "framer-motion";
import { Bell, Info, AlertTriangle, CheckCircle, Zap } from "lucide-react";

export default function AdminNotificationsPage() {
  const alerts = [
    { id: 1, type: "info", title: "System Update", msg: "NexShip v1.2.0 will be deployed tonight at 02:00 UTC.", time: "1 hour ago" },
    { id: 2, type: "warning", title: "Carrier Delay", msg: "North Atlantic routes experiencing 4-hour delays due to weather.", time: "3 hours ago" },
    { id: 3, type: "success", title: "Maintenance Complete", msg: "Prisma DB synchronization successfully completed.", time: "5 hours ago" },
    { id: 4, type: "critical", title: "API Limit Reached", msg: "Mapbox geocoding credits are below 10%.", time: "1 day ago" },
  ];

  return (
    <div className="space-y-10 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white">System Alerts</h1>
        <p className="mt-2 text-slate-400">Critical updates and operational notifications for administrators.</p>
      </motion.div>

      <div className="rounded-[2.5rem] border border-slate-800 bg-navy overflow-hidden">
        <div className="divide-y divide-slate-800">
          {alerts.map((alert, idx) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-6 p-8 hover:bg-slate-800/20 transition-colors"
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
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{alert.time}</span>
                </div>
                <p className="mt-2 text-slate-400 leading-relaxed">{alert.msg}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper to handle clsx-like logic since it's not imported here yet
function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
