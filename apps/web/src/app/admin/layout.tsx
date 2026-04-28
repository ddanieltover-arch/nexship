"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import clsx from "clsx";
import { 
  BarChart3, 
  Package, 
  Users, 
  LayoutDashboard,
  Settings,
  Bell,
  Search,
  ChevronRight
} from "lucide-react";

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
    return <div className="p-16 text-center text-slate-400">Verifying administrative credentials…</div>;
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-10 px-4 py-10">
      {/* Mobile Navigation Tabs (Visible only on mobile) */}
      <div className="fixed bottom-20 left-4 right-4 z-40 flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-800 bg-navy/80 p-2 backdrop-blur-xl lg:hidden no-scrollbar">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all",
                active 
                  ? "bg-teal text-navy" 
                  : "text-slate-400 bg-slate-900/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
        <div className="h-6 w-px bg-slate-800 mx-1" />
        <Link href="/admin/settings" className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-400 bg-slate-900/50">
          <Settings className="h-4 w-4" />
        </Link>
      </div>

      {/* Sidebar Navigation (Visible only on desktop) */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">Management</p>
            <nav className="space-y-2">
              {links.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={clsx(
                      "group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all",
                      active 
                        ? "bg-teal text-navy shadow-lg shadow-teal/20" 
                        : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={clsx("h-5 w-5", active ? "text-navy" : "text-slate-500 group-hover:text-teal")} />
                      {label}
                    </div>
                    {active && <ChevronRight className="h-4 w-4 text-navy/50" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">Configuration</p>
             <nav className="space-y-2">
                <Link href="/admin/settings" className="group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-400 hover:bg-slate-900/50 hover:text-white transition-all">
                  <Settings className="h-5 w-5 text-slate-500 group-hover:text-teal" />
                  Settings
                </Link>
                <Link href="/admin/notifications" className="group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-400 hover:bg-slate-900/50 hover:text-white transition-all">
                  <Bell className="h-5 w-5 text-slate-500 group-hover:text-teal" />
                  System Alerts
                </Link>
             </nav>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="min-w-0 flex-1">
        {/* Sub-header for Mobile/Search */}
        <div className="mb-8 flex items-center justify-between lg:hidden">
           <h1 className="text-xl font-bold text-white uppercase tracking-widest">Admin Portal</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
