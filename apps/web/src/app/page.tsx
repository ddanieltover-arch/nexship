"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { QuoteModal } from "@/components/QuoteModal";
import { 
  BarChart3, 
  Globe2, 
  ShieldCheck, 
  Zap, 
  Users, 
  Clock, 
  ArrowRight,
  Plane,
  Ship,
  Truck,
  Box
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function HomePage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16 overflow-hidden">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="grid gap-12 lg:grid-cols-2 lg:items-center"
      >
        <div className="relative text-center lg:text-left">
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs md:text-sm font-medium uppercase tracking-widest text-teal"
          >
            Nexships Logistics
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-3 text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl"
          >
            Global supply chain <br/>
            <span className="text-teal">Intelligence & Motion.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-base md:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0"
          >
            From cross-border e-commerce to industrial freight, Nexships provides the visibility, 
            network, and technology to move your business forward.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
          >
            <Link
              href="/track"
              className="group relative rounded-full bg-teal px-8 py-4 font-bold text-navy transition-all hover:pr-12 text-center"
            >
              Track Shipment
              <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-all group-hover:opacity-100" />
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-slate-600 px-8 py-4 font-bold text-white hover:border-teal hover:text-teal transition-all text-center"
            >
              Our Services
            </Link>
          </motion.div>
        </div>
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative h-[300px] md:h-[450px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 shadow-2xl"
        >
          <motion.img
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            src="/images/1.png"
            alt="Nexships Air Freight"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/60 to-transparent" />
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 rounded-2xl bg-navy/80 backdrop-blur border border-slate-700 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider">Live Status</p>
                <p className="text-sm md:text-base text-white font-bold">NEX-8829 Air Cargo</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-teal animate-pulse" />
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Quick Track & Stats */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-12 md:mt-24 grid gap-8 lg:grid-cols-3"
      >
        <motion.section variants={itemVariants} className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 md:p-8 shadow-xl">
          <p className="text-xs font-bold text-teal uppercase tracking-widest text-center lg:text-left">Tracking Hall</p>
          <form action="/track" method="get" className="mt-4 flex flex-col sm:flex-row gap-2">
            <input
              name="id"
              placeholder="Tracking ID (e.g. NEX-123)"
              className="w-full rounded-xl border border-slate-700 bg-navy px-4 py-3 text-white placeholder:text-slate-600 focus:border-teal outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-teal px-6 py-3 font-bold text-navy hover:bg-teal-600 transition-transform active:scale-95 flex items-center justify-center"
            >
              <span className="sm:hidden mr-2">Track</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
          <p className="mt-4 text-[10px] md:text-xs text-slate-500 text-center lg:text-left">Real-time status updates from 500+ global carriers.</p>
        </motion.section>

        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Countries", val: "190+", icon: Globe2 },
            { label: "Agents", val: "5k+", icon: Users },
            { label: "Shipments", val: "1M+", icon: Box },
            { label: "Support", val: "24/7", icon: Clock },
          ].map((stat, idx) => (
            <motion.div 
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -5, backgroundColor: "rgba(45, 212, 191, 0.05)" }}
              className="flex flex-col items-center justify-center rounded-2xl md:rounded-3xl border border-slate-800 bg-slate-900/30 p-3 md:p-4 transition-colors"
            >
              <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-teal/50 mb-2" />
              <p className="text-xl md:text-2xl font-bold text-white">{stat.val}</p>
              <p className="text-[10px] md:text-xs text-slate-500 uppercase">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Trusted By Marquee */}
      <section className="mt-16 md:mt-24 overflow-hidden relative">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white">Trusted by global industry leaders</h2>
        </div>
        
        {/* Left/Right Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-navy to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-navy to-transparent z-10" />
        
        <div className="flex gap-6 relative max-w-[100vw]">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 30,
            }}
            className="flex gap-6 whitespace-nowrap min-w-max"
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-6">
                {[
                  "SAVINO DEL BENE", "allcargo group", "VAN DONGE & DE ROO", 
                  "MONDIALE VGL", "noatum logistics", "SCAN GLOBAL LOGISTICS",
                  "CIMC WETRANS", "BSI", "AWOT", "SOUTHEAST LOGISTICS", "WORLDEX"
                ].map((company, idx) => (
                  <div 
                    key={`${i}-${idx}`} 
                    className="flex h-20 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 px-8 transition-colors hover:border-teal/50 hover:bg-slate-900/80"
                  >
                    <span className="text-sm font-bold tracking-wider text-slate-300 uppercase">{company}</span>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Transport Modes */}
      <section className="mt-16 md:mt-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-white">Multimodal Solutions</h2>
          <p className="mt-4 text-sm md:text-base text-slate-400">Integrated transport strategies for a borderless world.</p>
        </motion.div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-10 md:mt-16 grid gap-4 md:gap-6 md:grid-cols-3"
        >
          {[
            { title: "Ocean Freight", icon: Ship, img: "/images/4.png", desc: "Full container and consolidation services across all major trade lanes." },
            { title: "Air Freight", icon: Plane, img: "/images/2.png", desc: "Priority and economy air solutions for time-sensitive global delivery." },
            { title: "Land Transport", icon: Truck, img: "/images/7.png", desc: "Cross-border trucking and rail freight with end-to-end security." },
          ].map((m) => (
            <motion.div 
              key={m.title}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-slate-800 bg-slate-900/40 transition-all hover:border-teal"
            >
              <div className="aspect-video overflow-hidden">
                <img src={m.img} alt={m.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 md:opacity-60" />
              </div>
              <div className="p-5 md:p-6">
                <div className="flex items-center gap-3">
                  <m.icon className="h-5 w-5 md:h-6 md:w-6 text-teal" />
                  <h3 className="text-lg md:text-xl font-bold text-white">{m.title}</h3>
                </div>
                <p className="mt-3 text-xs md:text-sm text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Industry Solutions */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-16 md:mt-32 rounded-3xl bg-slate-900/40 border border-slate-800 p-6 md:p-12 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-1/3 h-full bg-teal/5 blur-[120px] rounded-full" />
        <div className="relative z-10 grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-white">Tailored for your Industry</h2>
            <p className="mt-4 text-sm md:text-base text-slate-400">
              Nexships understands that every sector has unique logistical challenges. 
              We provide specialized handling and compliance for:
            </p>
            <ul className="mt-6 md:mt-8 space-y-3 md:space-y-4">
              {[
                "E-commerce & Retail Fulfillment",
                "Technology & Electronics Supply",
                "Healthcare & Cold Chain Logistics",
                "Industrial Projects & Heavy Lift"
              ].map((item, i) => (
                <motion.li 
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 text-sm md:text-base text-white font-medium"
                >
                  <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-teal" /> {item}
                </motion.li>
              ))}
            </ul>
            <Link href="/services" className="mt-10 inline-flex items-center gap-2 text-teal font-bold hover:underline transition-all hover:gap-3 text-sm md:text-base">
              View all solutions <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl hidden lg:block"
          >
            <img src="/images/3.png" alt="Nexships Operations" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </motion.section>

      {/* Logistics Insights (News) Section */}
      <section className="mt-16 md:mt-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-white">Logistics Insights</h2>
            <p className="mt-4 text-sm md:text-base text-slate-400">Global supply chain updates and industry intelligence.</p>
          </div>
          <Link href="/news" className="text-teal font-bold hover:underline flex items-center gap-2 text-sm">
            View all news <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-10 md:mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {[
            {
              title: "The Future of Sustainable Freight",
              source: "Global Logistics Review",
              img: "/images/5.png",
              desc: "How electronic shipping fleets and biofuel initiatives are reducing the global carbon footprint of 2024 logistics.",
              tag: "Sustainability"
            },
            {
              title: "Port Automation & Efficiency",
              source: "Maritime Executive",
              img: "/images/8.png",
              desc: "Deep-sea port automation is increasing throughput by 35% in key Asian and European hubs this quarter.",
              tag: "Innovation"
            },
            {
              title: "Cross-Border E-commerce Peaks",
              source: "FreightWaves",
              img: "/images/6.png",
              desc: "Record-breaking demand for express delivery solutions as global retail shifts towards digital-first supply chains.",
              tag: "Market Trend"
            }
          ].map((news) => (
            <motion.div 
              key={news.title}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group rounded-2xl md:rounded-3xl border border-slate-800 bg-slate-900/30 overflow-hidden hover:border-teal/50 transition-all"
            >
              <div className="aspect-[16/9] overflow-hidden relative">
                <img src={news.img} alt={news.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-4 left-4 rounded-full bg-teal px-3 py-1 text-[10px] font-bold text-navy uppercase">
                  {news.tag}
                </div>
              </div>
              <div className="p-6">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{news.source}</p>
                <h3 className="mt-2 text-lg font-bold text-white group-hover:text-teal transition-colors line-clamp-2">{news.title}</h3>
                <p className="mt-3 text-sm text-slate-400 line-clamp-2 leading-relaxed">{news.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Final CTA */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 md:mt-32 text-center pb-24 md:pb-20"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">Ready to move?</h2>
        <p className="mt-4 text-base md:text-xl text-slate-400">Join 10,000+ businesses growing with Nexships.</p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => setIsQuoteOpen(true)}
            className="rounded-full bg-teal px-10 py-5 font-bold text-navy hover:bg-teal-600 shadow-lg shadow-teal/20 transition-all active:scale-95 text-lg"
          >
            Get a Quote
          </button>
          <Link href="/contact" className="rounded-full border border-slate-700 px-10 py-5 font-bold text-white hover:border-teal transition-all active:scale-95 text-lg">
            Contact Sales
          </Link>
        </div>
        <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
      </motion.section>
    </div>
  );
}
