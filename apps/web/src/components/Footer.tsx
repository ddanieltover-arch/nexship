"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Twitter, 
  Linkedin, 
  Instagram, 
  Facebook, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Globe2,
  Truck
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-slate-800 bg-navy pb-32 pt-20 md:pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4 lg:gap-8">
          {/* Brand Section */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal shadow-lg shadow-teal/20">
                <Truck className="h-6 w-6 text-navy" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white uppercase italic">
                Nex<span className="text-teal">Ship</span>
              </span>
            </Link>
            <p className="text-sm leading-7 text-slate-400">
              Leading the future of global logistics with precision tracking, sustainable transport, and unparalleled security for your most critical assets.
            </p>
            <div className="flex gap-5">
              {[Twitter, Linkedin, Instagram, Facebook].map((Icon, i) => (
                <Link key={i} href="#" className="text-slate-500 hover:text-teal transition-colors">
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Services</h3>
            <ul className="mt-6 space-y-4">
              {["Air Freight", "Ocean Cargo", "Road Transport", "Rail Logistics", "Warehousing"].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-sm text-slate-400 hover:text-teal transition-colors flex items-center gap-2 group">
                    <div className="h-1 w-1 rounded-full bg-slate-800 transition-all group-hover:w-3 group-hover:bg-teal" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Platform</h3>
            <ul className="mt-6 space-y-4">
              {["Global Network", "Live Tracking", "Sustainability", "Security Protocol", "Contact Support"].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-sm text-slate-400 hover:text-teal transition-colors flex items-center gap-2 group">
                    <div className="h-1 w-1 rounded-full bg-slate-800 transition-all group-hover:w-3 group-hover:bg-teal" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 shadow-inner">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Contact Us</h3>
            <div className="mt-6 space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 h-5 w-5 text-teal shrink-0" />
                <p className="text-sm text-slate-400">Global Logistics Hub<br />128 Canary Wharf, London, UK</p>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-teal shrink-0" />
                <p className="text-sm text-slate-400">support@nexships.com</p>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-teal shrink-0" />
                <p className="text-sm text-slate-400">+44 20 7946 0123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-slate-500">
            © {currentYear} NexShip Logistics. All rights reserved. Precision Delivery Every Time.
          </p>
          <div className="flex items-center gap-8">
             <Link href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
             <Link href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Terms of Service</Link>
             <div className="flex items-center gap-1 text-xs text-slate-500">
               <ShieldCheck className="h-3.5 w-3.5 text-teal" />
               Secure SSL Encrypted
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
