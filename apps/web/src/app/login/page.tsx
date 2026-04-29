"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const { login, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role !== "ADMIN" && loggedInUser.role !== "STAFF") {
        await logout();
        setError("This account does not have admin access.");
        return;
      }
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-10 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center justify-center mb-8">
            <img src="/logo/0.png" alt="Nexship Logo" className="h-16 w-auto" />
          </div>
          
          <h1 className="text-2xl font-bold text-white text-center">Admin Portal</h1>
          <p className="mt-2 text-sm text-slate-400 text-center">
            Authorized personnel only. Sign in to manage NexShip operations.
          </p>

          <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-5">
            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300 font-medium"
              >
                {error}
              </motion.p>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/50 pl-11 pr-4 py-3.5 text-white placeholder-slate-500 focus:border-teal focus:outline-none transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@veloroute.local"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/50 pl-11 pr-4 py-3.5 text-white placeholder-slate-500 focus:border-teal focus:outline-none transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-teal py-4 font-bold text-navy hover:bg-teal-600 disabled:opacity-50 transition-all shadow-lg shadow-teal/20 text-sm uppercase tracking-widest"
            >
              {pending ? "Authenticating…" : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] text-slate-600 uppercase tracking-widest">
            NexShip Logistics • Secure Admin Access
          </p>
        </div>
      </motion.div>
    </div>
  );
}
