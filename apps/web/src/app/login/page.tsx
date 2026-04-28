"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
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
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-white">Log in</h1>
      <p className="mt-2 text-sm text-slate-400">
        No account?{" "}
        <Link href="/register" className="text-teal hover:underline">
          Register
        </Link>
      </p>
      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
        {error && <p className="rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-200">{error}</p>}
        <div>
          <label className="block text-sm text-slate-400">Email</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400">Password</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-teal py-3 font-semibold text-navy hover:bg-teal-600 disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
