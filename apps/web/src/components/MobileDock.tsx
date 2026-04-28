"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Search, Phone } from "lucide-react";
import clsx from "clsx";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/track", label: "Track", icon: Search },
  { href: "/services", label: "Services", icon: Package },
  { href: "/contact", label: "Contact", icon: Phone },
];

export function MobileDock() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-slate-800 bg-navy/95 backdrop-blur-lg px-2 py-2 md:hidden transition-colors duration-300">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[10px] uppercase font-bold tracking-widest transition-all",
              active ? "text-teal" : "text-slate-500"
            )}
          >
            <Icon className={clsx("h-5 w-5", active ? "text-teal" : "text-slate-500")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
