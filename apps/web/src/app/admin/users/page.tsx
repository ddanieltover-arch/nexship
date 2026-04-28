"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Calendar, 
  MoreVertical, 
  Search,
  Filter,
  UserCheck,
  UserCog,
  ChevronDown
} from "lucide-react";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    void (async () => {
      try {
        const res = await apiFetch<{ users: UserRow[] }>("/admin/users", { token: accessToken });
        setUsers(res.users);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

  const filtered = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    (u.name?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-teal" />
            User Ecosystem
          </h1>
          <p className="mt-2 text-slate-400">Monitor and manage all accounts across the NexShip global network.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-2xl text-sm text-white focus:border-teal outline-none transition-all w-64"
            />
          </div>
          <button className="flex items-center gap-2 rounded-2xl bg-teal px-6 py-3.5 text-sm font-bold text-navy hover:bg-teal-600 transition-all shadow-lg shadow-teal/20">
            <UserPlus className="h-5 w-5" />
            Add Member
          </button>
        </motion.div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: "Total Accounts", value: users.length, icon: Users, color: "text-blue-400" },
          { label: "Active Admins", value: users.filter(u => u.role === "ADMIN").length, icon: Shield, color: "text-purple-400" },
          { label: "Registered Customers", value: users.filter(u => u.role === "CUSTOMER").length, icon: UserCheck, color: "text-teal-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-[2rem] border border-slate-800 bg-navy/40 p-6 flex items-center gap-6"
          >
            <div className={`p-4 rounded-2xl bg-slate-900/50 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[2.5rem] border border-slate-800 bg-navy/50 shadow-2xl backdrop-blur-sm"
      >
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400">
              <th className="px-8 py-6 font-bold uppercase tracking-widest text-[10px]">User Identifier</th>
              <th className="px-8 py-6 font-bold uppercase tracking-widest text-[10px]">Security Role</th>
              <th className="px-8 py-6 font-bold uppercase tracking-widest text-[10px]">Registration Date</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            <AnimatePresence>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-8 h-20 bg-slate-900/5" />
                  </tr>
                ))
              ) : (
                filtered.map((u, i) => (
                  <motion.tr 
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-700 text-teal font-bold text-lg shadow-inner">
                          {u.name?.[0] || u.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-teal transition-colors">{u.name || "System User"}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <Mail className="h-3 w-3" />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={clsx(
                        "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[10px] font-bold uppercase border shadow-sm",
                        u.role === "ADMIN" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : 
                        u.role === "STAFF" ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                        "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      )}>
                        {u.role === "ADMIN" ? <Shield className="h-3 w-3" /> : <UserCog className="h-3 w-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 rounded-xl hover:bg-slate-800 text-slate-500 hover:text-white transition-all">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="py-24 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-800 mb-4" />
            <p className="text-slate-500 font-medium">No users found matching your search criteria.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
