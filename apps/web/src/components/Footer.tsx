"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Truck,
  X
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | null>(null);

  const modalContent = {
    privacy: {
      title: "Privacy Policy",
      body: (
        <div className="space-y-4 text-sm text-slate-300">
          <p><strong>1. Information Collection</strong><br/>NexShip Logistics collects personal and corporate data, including names, contact information, and exact tracking coordinates, solely to facilitate logistics operations and improve our service delivery.</p>
          <p><strong>2. Data Usage & Sharing</strong><br/>Your data is used strictly for routing, customs clearance, and delivery updates. We do not sell your data to third parties. Information may be shared with our network of certified carrier partners only as necessary to fulfill your shipment.</p>
          <p><strong>3. Security Protocols</strong><br/>All transit data and personal information are encrypted using AES-256 protocols. Our global hubs operate under strict zero-trust security frameworks to ensure the integrity of your logistics data.</p>
          <p><strong>4. User Rights</strong><br/>You have the right to request access to, correction of, or deletion of your data within our system. Contact our Data Protection Officer at privacy@nexships.com for inquiries.</p>
        </div>
      )
    },
    terms: {
      title: "Terms of Service",
      body: (
        <div className="space-y-4 text-sm text-slate-300">
          <p><strong>1. Service Agreement</strong><br/>By utilizing NexShip Logistics, you agree to abide by these terms. We guarantee delivery timelines based on the chosen tier (Air, Ocean, Road, Rail) but are not liable for delays caused by Force Majeure events (e.g., severe weather, geopolitical conflicts).</p>
          <p><strong>2. Prohibited Cargo</strong><br/>You may not ship hazardous materials, illegal substances, or undeclared high-value goods without prior authorization and specialized handling agreements.</p>
          <p><strong>3. Liability & Insurance</strong><br/>Standard liability is limited to $20 per kg of cargo unless additional comprehensive freight insurance is purchased at the time of shipment creation.</p>
          <p><strong>4. Payment & Invoicing</strong><br/>All invoices are due within 30 days of issuance. Late payments will incur a 1.5% monthly interest charge. NexShip reserves the right to hold cargo at transit hubs if accounts are severely delinquent.</p>
        </div>
      )
    }
  };

  return (
    <>
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
                {[
                  { name: "Air Freight", url: "/services#air-freight" },
                  { name: "Ocean Freight", url: "/services#ocean-freight" },
                  { name: "Land Transport", url: "/services#land-transport" },
                  { name: "Express Delivery", url: "/services#express-delivery" },
                  { name: "Warehousing", url: "/services#warehousing" }
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.url} className="text-sm text-slate-400 hover:text-teal transition-colors flex items-center gap-2 group">
                      <div className="h-1 w-1 rounded-full bg-slate-800 transition-all group-hover:w-3 group-hover:bg-teal" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Platform</h3>
              <ul className="mt-6 space-y-4">
                {[
                  { name: "Global Network", url: "/network" },
                  { name: "Live Tracking", url: "/track" },
                  { name: "Sustainability", url: "/sustainability" },
                  { name: "Security Protocol", url: "/security" },
                  { name: "Contact Support", url: "/contact" }
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.url} className="text-sm text-slate-400 hover:text-teal transition-colors flex items-center gap-2 group">
                      <div className="h-1 w-1 rounded-full bg-slate-800 transition-all group-hover:w-3 group-hover:bg-teal" />
                      {link.name}
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
                  <p className="text-sm text-slate-400">USA, Canada, UK, China, Germany</p>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-teal shrink-0" />
                  <p className="text-sm text-slate-400">support@nexships.com</p>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="h-5 w-5 text-teal shrink-0" />
                  <p className="text-sm text-slate-400">+1 (800) NEX-SHIPS</p>
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
               <button onClick={() => setActiveModal("privacy")} className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Privacy Policy</button>
               <button onClick={() => setActiveModal("terms")} className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Terms of Service</button>
               <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                 <ShieldCheck className="h-3.5 w-3.5 text-teal" />
                 Secure SSL Encrypted
               </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Overlay */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-navy/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal/5 blur-[100px] pointer-events-none rounded-full" />
              <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4 relative z-10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-teal" />
                  {modalContent[activeModal].title}
                </h2>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto pr-2 custom-scrollbar relative z-10 flex-1">
                {modalContent[activeModal].body}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end relative z-10">
                 <button 
                   onClick={() => setActiveModal(null)}
                   className="rounded-xl bg-teal px-6 py-2.5 text-sm font-bold text-navy hover:bg-teal-600 transition-colors shadow-lg shadow-teal/20"
                 >
                   I Understand
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
