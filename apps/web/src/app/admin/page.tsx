"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Package, 
  Users, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight, 
  MoreVertical,
  Activity,
  Zap
} from "lucide-react";

type OverviewData = {
  activeShipments: number;
  deliveredToday: number;
  deliveryRate: number;
  avgTransitHours: number;
  totalRevenue?: number;
};

export default function AdminHome() {
  const { accessToken, user } = useAuth();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    void (async () => {
      try {
        const res = await apiFetch<OverviewData>("/admin/analytics/overview", { token: accessToken });
        setOverview(res);
      } catch {
        // Fallback or error state handled by overview being null
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

  const stats = [
    { 
      label: "Active Shipments", 
      value: overview?.activeShipments ?? 0, 
      icon: Package, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10",
      trend: "+12.5%"
    },
    { 
      label: "Delivered Today", 
      value: overview?.deliveredToday ?? 0, 
      icon: ShieldCheck, 
      color: "text-teal", 
      bg: "bg-teal/10",
      trend: "+4.2%"
    },
    { 
      label: "Success Rate", 
      value: `${Math.round((overview?.deliveryRate ?? 0) * 100)}%`, 
      icon: Zap, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10",
      trend: "Optimal"
    },
    { 
      label: "Avg Transit Time", 
      value: `${overview?.avgTransitHours ?? 0}h`, 
      icon: Clock, 
      color: "text-purple-500", 
      bg: "bg-purple-500/10",
      trend: "-2.1h"
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] border border-slate-800 bg-navy p-8 md:p-12"
      >
        <div className="absolute top-0 right-0 w-1/2 h-full bg-teal/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Welcome back, {user?.name?.split(" ")[0]}!</h1>
            <p className="mt-3 text-slate-400 max-w-lg">
              Operational snapshot for NexShip Logistics. Everything is running smoothly across all global transit corridors.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
               <Activity className="h-6 w-6 text-teal" />
             </div>
             <div>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">System Status</p>
               <p className="text-sm font-bold text-white">Operational</p>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            className="group relative rounded-3xl border border-slate-800 bg-slate-900/30 p-6 transition-all hover:border-teal/50"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-2xl ${stat.bg} p-3 transition-transform group-hover:scale-110`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-teal bg-teal/5 px-2 py-1 rounded-full uppercase tracking-tighter">
                {stat.trend} <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
            <div className="mt-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-white">{loading ? "..." : stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Logistics Activity</h2>
            <button className="text-teal text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-navy/50 p-1 divide-y divide-slate-800">
             {[
               { id: 1, type: "Shipment Created", msg: "NEX-8829-AF (London → Dubai)", time: "2 mins ago" },
               { id: 2, type: "Status Update", msg: "NEX-1290-OC is now [IN TRANSIT]", time: "15 mins ago" },
               { id: 3, type: "Delivery Confirmed", msg: "NEX-7712-RT delivered to Berlin Hub", time: "45 mins ago" },
               { id: 4, type: "Alert", msg: "Potential weather delay in North Atlantic", time: "1 hour ago" },
             ].map((activity) => (
               <div key={activity.id} className="flex items-center justify-between p-6 hover:bg-slate-800/20 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-teal shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
                    <div>
                      <p className="text-sm font-bold text-white">{activity.type}</p>
                      <p className="text-xs text-slate-500 mt-1">{activity.msg}</p>
                    </div>
                 </div>
                 <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{activity.time}</p>
               </div>
             ))}
          </div>
        </div>

        {/* Global Network Capacity */}
        <div className="space-y-6">
           <h2 className="text-xl font-bold text-white">Carrier Network</h2>
           <div className="rounded-3xl border border-slate-800 bg-navy/50 p-8">
              <div className="space-y-6">
                 {[
                   { label: "Air Freight", val: 82 },
                   { label: "Ocean Freight", val: 45 },
                   { label: "Land Transport", val: 94 },
                   { label: "Rail Cargo", val: 12 },
                 ].map((mode) => (
                   <div key={mode.label} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                        <span className="text-slate-500">{mode.label}</span>
                        <span className="text-white">{mode.val}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${mode.val}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-teal" 
                        />
                      </div>
                   </div>
                 ))}
              </div>
              <button className="mt-10 w-full rounded-2xl border border-slate-700 py-4 text-sm font-bold text-white hover:bg-slate-800 transition-colors">
                Optimize Routing
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
