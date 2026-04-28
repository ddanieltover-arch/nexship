"use client";

import { motion } from "framer-motion";
import { Settings, Shield, Bell, Database, Globe, Lock } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-10 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white">System Settings</h1>
        <p className="mt-2 text-slate-400">Manage global platform configurations and security protocols.</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {[
          { title: "General Configuration", icon: Settings, desc: "System name, timezone, and regional defaults." },
          { title: "Security & Authentication", icon: Lock, desc: "Password policies, 2FA, and session management." },
          { title: "Network & API", icon: Globe, desc: "Webhook endpoints and third-party carrier integrations." },
          { title: "Database & Storage", icon: Database, desc: "Backup schedules and data retention policies." },
        ].map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="group rounded-3xl border border-slate-800 bg-slate-900/30 p-8 hover:border-teal/50 transition-all cursor-pointer"
          >
            <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 mb-6 group-hover:bg-teal/10 transition-colors">
              <item.icon className="h-6 w-6 text-teal" />
            </div>
            <h3 className="text-xl font-bold text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
