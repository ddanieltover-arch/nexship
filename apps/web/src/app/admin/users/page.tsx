"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Users, UserPlus, Shield, Mail, Calendar, MoreVertical } from "lucide-react";

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

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="mt-2 text-slate-400">Control access levels and manage global administrative accounts.</p>
        </div>
        <button className="flex items-center gap-2 rounded-2xl bg-teal px-6 py-3.5 text-sm font-bold text-navy hover:bg-teal-600 transition-all shadow-lg shadow-teal/20">
          <UserPlus className="h-5 w-5" />
          Invite Member
        </button>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-navy/50 shadow-2xl">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400">
              <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Member</th>
              <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Access Level</th>
              <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Joined Date</th>
              <th className="px-8 py-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-8 py-10 h-20 bg-slate-900/10" />
                </tr>
              ))
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-teal font-bold uppercase">
                        {u.name?.[0] || u.email[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white">{u.name || "Unnamed User"}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={clsx(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase border",
                      u.role === "ADMIN" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    )}>
                      <Shield className="h-3 w-3" />
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-slate-600 hover:text-white transition-colors">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && users.length === 0 && (
          <div className="py-20 text-center text-slate-500">
            No administrative members found.
          </div>
        )}
      </div>
    </div>
  );
}

function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
