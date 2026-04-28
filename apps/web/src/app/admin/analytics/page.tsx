"use client";

import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Map, 
  Clock, 
  PieChart, 
  ArrowUpRight, 
  Globe2,
  Zap,
  Activity
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import dynamic from "next/dynamic";

const GlobalOperationsMap = dynamic(
  () => import("./GlobalOperationsMap").then((mod) => mod.GlobalOperationsMap),
  { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-xs">Loading map…</div> }
);

export default function AdminAnalyticsPage() {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!accessToken) return;
    void (async () => {
      try {
        const res = await apiFetch("/admin/analytics/overview", { token: accessToken });
        setStats(res);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [accessToken]);

  return (
    <div className="space-y-10 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Logistics Analytics</h1>
          <p className="mt-2 text-slate-400">Deep-dive into global performance metrics and transit efficiency.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 p-1">
          {["7D", "30D", "90D", "1Y"].map((range) => (
            <button 
              key={range} 
              className={clsx(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                range === "30D" ? "bg-teal text-navy" : "text-slate-500 hover:text-white"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Analytics Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Performance Chart */}
        <div className="rounded-[2.5rem] border border-slate-800 bg-navy p-10 flex flex-col justify-between h-[450px]">
          <div>
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-teal" />
                  Shipment Volume
                </h3>
                <span className="text-xs text-teal font-bold">+24% YoY</span>
             </div>
             <p className="mt-2 text-sm text-slate-400">Monthly throughput across all carriers.</p>
          </div>
          <div className="flex-1 flex items-end gap-3 mt-10">
             {[40, 65, 45, 90, 55, 75, 60, 85, 40, 95, 70, 80].map((h, i) => (
               <motion.div 
                 key={i}
                 initial={{ height: 0 }}
                 animate={{ height: `${h}%` }}
                 transition={{ delay: i * 0.05, duration: 1 }}
                 className="flex-1 bg-gradient-to-t from-teal/20 to-teal rounded-t-lg"
               />
             ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>

        {/* Efficiency Breakdown */}
        <div className="rounded-[2.5rem] border border-slate-800 bg-navy p-10 flex flex-col justify-between h-[450px]">
           <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Transit Efficiency
              </h3>
              <p className="mt-2 text-sm text-slate-400">Average delivery time by region.</p>
           </div>
           <div className="space-y-6 mt-10">
              {[
                { label: "Europe (EU)", val: 12, max: 24, color: "bg-teal" },
                { label: "North America (NA)", val: 18, max: 24, color: "bg-blue-500" },
                { label: "Middle East (ME)", val: 8, max: 24, color: "bg-orange-500" },
                { label: "Asia Pacific (APAC)", val: 22, max: 24, color: "bg-purple-500" },
              ].map((r) => (
                <div key={r.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-slate-500">{r.label}</span>
                    <span className="text-white">{r.val}h</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(r.val / r.max) * 100}%` }}
                      transition={{ duration: 1.5 }}
                      className={`h-full ${r.color}`}
                    />
                  </div>
                </div>
              ))}
           </div>
           <div className="mt-8 rounded-2xl bg-slate-900/50 p-4 border border-slate-800">
             <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg. Success Rate</p>
                <p className="text-xl font-bold text-white">{(stats?.deliveryRate * 100).toFixed(1)}%</p>
             </div>
           </div>
        </div>
      </div>

      {/* Global Map Snapshot */}
      <div className="relative rounded-[2.5rem] border border-slate-800 bg-navy p-10 overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-teal/5 blur-[100px] pointer-events-none" />
         <div className="relative z-10 flex flex-col xl:flex-row items-center gap-10">
            <div className="flex-1">
               <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                 <Globe2 className="h-7 w-7 text-teal" />
                 Global Logistics Footprint
               </h3>
               <p className="mt-4 text-slate-400 leading-relaxed max-w-md">
                 Real-time visualization of NexShip corridors. Active tracking across 142 countries with localized hub performance monitoring.
               </p>
               <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Corridors</p>
                    <p className="mt-2 text-2xl font-bold text-white">{stats?.activeShipments || 0}</p>
                    <div className="mt-2 h-1 w-12 bg-teal rounded-full" />
                  </div>
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Hubs</p>
                    <p className="mt-2 text-2xl font-bold text-white">48</p>
                    <div className="mt-2 h-1 w-12 bg-blue-500 rounded-full" />
                  </div>
               </div>
               <div className="mt-6 flex items-center gap-2 text-xs font-bold text-teal">
                 <Activity className="h-4 w-4" />
                 <span>Operational Status: Optimal</span>
               </div>
            </div>
            <div className="w-full xl:w-2/3 h-[500px] bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
               {accessToken && <GlobalOperationsMap accessToken={accessToken} />}
            </div>
         </div>
      </div>
      
      {/* Related Data: Carrier Performance */}
      <div className="rounded-[2.5rem] border border-slate-800 bg-navy p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-white">Carrier Performance</h3>
            <p className="text-slate-400 mt-1">Reliability metrics across integrated partners.</p>
          </div>
          <button className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white border border-slate-800 hover:bg-slate-800 transition-all">
            Full Report
          </button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: "NexShip Primary", reliability: 99.8, load: "High", speed: "Fast" },
            { name: "Global Express", reliability: 98.2, load: "Medium", speed: "Ultra" },
            { name: "SwiftNav Logistics", reliability: 95.4, load: "Full", speed: "Normal" },
          ].map((carrier) => (
            <div key={carrier.name} className="rounded-3xl border border-slate-800 bg-slate-900/30 p-8 hover:border-teal/30 transition-all group">
              <p className="text-lg font-bold text-white">{carrier.name}</p>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Reliability</span>
                  <span className="text-teal">{carrier.reliability}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-teal" style={{ width: `${carrier.reliability}%` }} />
                </div>
                <div className="flex justify-between mt-4">
                   <div>
                     <p className="text-[10px] text-slate-500 font-bold uppercase">Current Load</p>
                     <p className="text-sm font-bold text-white mt-1">{carrier.load}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] text-slate-500 font-bold uppercase">Transit Class</p>
                     <p className="text-sm font-bold text-white mt-1">{carrier.speed}</p>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
