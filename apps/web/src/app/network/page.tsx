"use client";

import { motion } from "framer-motion";
import { Globe, MapPin, Users, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Partner Agents", value: "5,000+", icon: Users },
  { label: "Countries Covered", value: "190+", icon: Globe },
  { label: "Regional Hubs", value: "45", icon: MapPin },
  { label: "Verified Providers", value: "100%", icon: Shield },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function NetworkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white md:text-5xl">Global Logistics Network</h1>
        <p className="mt-4 text-xl text-slate-400 max-w-3xl mx-auto">
          Connecting your business to the world through our verified network of 5,000+ logistics professionals 
          distributed across all continents.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((s) => (
          <motion.div 
            key={s.label} 
            variants={itemVariants}
            whileHover={{ y: -5, borderColor: "rgba(45, 212, 191, 0.5)" }}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center transition-colors"
          >
            <s.icon className="mx-auto h-8 w-8 text-teal" />
            <p className="mt-4 text-3xl font-bold text-white">{s.value}</p>
            <p className="mt-1 text-sm text-slate-500 uppercase tracking-wider">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Map / Fleet Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-16 relative aspect-[21/9] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl group"
      >
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 1.5 }}
          src="/images/6.png"
          alt="Nexships Fleet"
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Globe className="mx-auto h-16 w-16 text-teal/80 animate-pulse" />
            <motion.p 
              initial={{ letterSpacing: "0.1em" }}
              whileInView={{ letterSpacing: "0.2em" }}
              transition={{ duration: 1 }}
              className="mt-4 text-white text-xl font-bold tracking-widest"
            >
              GLOBAL OPERATIONAL REACH
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Trust Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 rounded-3xl bg-gradient-to-r from-teal/20 to-navy p-8 md:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal/5 blur-[100px] rounded-full" />
        <div className="grid gap-12 md:grid-cols-2 items-center relative z-10">
          <div>
            <h2 className="text-3xl font-bold text-white">Join the Elite Forwarder Circle</h2>
            <p className="mt-4 text-slate-300">
              Just like JCTrans, Nexships provides a verified environment where agents can collaborate, 
              share cargo leads, and ensure payment safety across borders.
            </p>
            <Link 
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-teal px-8 py-3 font-bold text-navy hover:bg-teal-600 hover:scale-105 active:scale-95 transition-all"
            >
              Apply for Membership <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: "Payment Protection", desc: "Up to $50,000 security fund per transaction." },
              { title: "Verified Badge", desc: "Instant trust with global partners." },
              { title: "Cargo Leads", desc: "Access to thousands of daily inquiries." },
              { title: "Global Support", desc: "24/7 assistance in 15+ languages." },
            ].map((box, i) => (
              <motion.div 
                key={box.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="rounded-xl bg-navy/50 p-4 border border-teal/20"
              >
                <p className="text-white font-semibold text-sm">{box.title}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">{box.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
