"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type U = { id: string; email: string; name: string | null; role: string; createdAt: string };

export default function AdminUsersPage() {
  const { accessToken, user } = useAuth();
  const [users, setUsers] = useState<U[]>([]);

  async function load() {
    if (!accessToken || user?.role !== "ADMIN") return;
    const res = await apiFetch<{ users: U[] }>("/admin/users", { token: accessToken });
    setUsers(res.users);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, user?.role]);

  async function setRole(id: string, role: "CUSTOMER" | "STAFF" | "ADMIN") {
    if (!accessToken) return;
    await apiFetch(`/admin/users/${id}/role`, {
      method: "PATCH",
      token: accessToken,
      body: JSON.stringify({ role }),
    });
    await load();
  }

  if (user?.role !== "ADMIN") {
    return <p className="text-slate-400">Only administrators can manage users.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Users</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((u) => (
              <tr key={u.id} className="bg-slate-950/40">
                <td className="px-4 py-3 text-white">{u.email}</td>
                <td className="px-4 py-3 text-slate-300">{u.role}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(["CUSTOMER", "STAFF", "ADMIN"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        disabled={u.id === user?.id}
                        className="rounded bg-slate-800 px-2 py-1 text-xs text-white hover:bg-teal hover:text-navy disabled:opacity-30"
                        onClick={() => void setRole(u.id, r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
