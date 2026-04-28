"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import clsx from "clsx";
import { BarChart3, Package, Users, LayoutDashboard } from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/shipments", label: "Shipments", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "ADMIN" && user.role !== "STAFF") {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  if (loading || !user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
    return <div className="p-16 text-center text-slate-400">Checking access…</div>;
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
      <aside className="hidden w-56 shrink-0 lg:block">
        <p className="text-xs uppercase tracking-wide text-slate-500">Admin</p>
        <nav className="mt-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                  active 
                    ? "bg-slate-200 text-navy-900 dark:bg-slate-800 dark:text-white" 
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
