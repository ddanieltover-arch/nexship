"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Menu, X, Globe, Package, Phone, Info, LayoutDashboard, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SiteHeader() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN" || user?.role === "STAFF";

  const navLinks = [
    { href: "/services", label: "Services", icon: Package },
    { href: "/network", label: "Network", icon: Globe },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Phone },
    { href: "/track", label: "Track", icon: Package },
  ];

  return (
    <>
      <header className="border-b border-slate-800 bg-navy/80 backdrop-blur sticky top-0 z-50 transition-colors duration-300">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center transition-transform hover:scale-105">
            <img src="/logo/0.png" alt="Nexship" className="h-8 w-auto brightness-110" />
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Desktop Nav */}
            <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
              {user && isAdmin && (
                <>
                  <Link href="/admin" className="hover:text-white transition-colors font-bold text-teal">
                    Admin Portal
                  </Link>
                  <button type="button" onClick={() => void logout()} className="text-teal hover:underline transition-all">
                    Sign out
                  </button>
                </>
              )}
            </nav>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-300 hover:text-white md:hidden"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] flex flex-col bg-navy p-6 md:hidden"
          >
            <div className="flex items-center justify-between">
              <img src="/logo/0.png" alt="Nexship" className="h-8 w-auto" />
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400">
                <X className="h-8 w-8" />
              </button>
            </div>

            <nav className="mt-12 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 text-2xl font-bold text-white hover:text-teal"
                >
                  <link.icon className="h-6 w-6 text-teal" />
                  {link.label}
                </Link>
              ))}
              
              <div className="h-px bg-slate-800 my-4" />

              {user && isAdmin && (
                <>
                  <Link 
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 text-2xl font-bold text-white"
                  >
                    <LayoutDashboard className="h-6 w-6 text-teal" />
                    Admin Portal
                  </Link>
                  <button 
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="flex items-center gap-4 text-2xl font-bold text-red-400 text-left"
                  >
                    <LogOut className="h-6 w-6" />
                    Sign Out
                  </button>
                </>
              )}
            </nav>

            <div className="mt-auto pb-10 text-center">
              <p className="text-sm text-slate-500">Nexships Logistics Global</p>
              <p className="text-xs text-slate-600 mt-2">USA · Canada · UK · China · Germany</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
