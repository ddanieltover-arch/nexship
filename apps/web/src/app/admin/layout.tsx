"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import clsx from "clsx";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Package, 
  Users, 
  LayoutDashboard,
  Settings,
  Bell,
  Search,
  ChevronRight,
  MessageSquare
} from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/shipments", label: "Shipments", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/chat", label: "Support Chat", icon: MessageSquare },
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
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Horizontal Navigation Tabs */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-navy/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] px-4 md:px-8">
          <div className="flex h-20 items-center justify-between gap-8">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="rounded-xl bg-teal p-2">
                <Package className="h-6 w-6 text-navy" />
              </div>
              <span className="hidden text-xl font-black uppercase tracking-tighter text-white sm:block">NexShip <span className="text-teal">Admin</span></span>
            </div>

            <nav className="flex h-full items-center gap-1 overflow-x-auto no-scrollbar py-2">
              {links.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={clsx(
                      "group flex h-12 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-all whitespace-nowrap",
                      active 
                        ? "bg-teal/10 text-teal shadow-inner shadow-teal/5" 
                        : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
                    )}
                  >
                    <Icon className={clsx("h-4 w-4", active ? "text-teal" : "text-slate-500 group-hover:text-teal")} />
                    {label}
                    {active && (
                       <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-teal rounded-t-full"
                       />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Link 
                href="/admin/settings" 
                className={clsx(
                  "p-2.5 rounded-xl transition-all",
                  pathname === "/admin/settings" ? "bg-teal/10 text-teal" : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
                )}
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </Link>
              <button className="hidden sm:flex p-2.5 rounded-xl text-slate-400 hover:bg-slate-900/50 hover:text-white transition-all">
                <Bell className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Full Width */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
