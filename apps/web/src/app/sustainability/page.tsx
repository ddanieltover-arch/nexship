"use client";

import { motion } from "framer-motion";
import { Leaf, Wind, Recycle, ShieldCheck, ArrowRight, Sun, Droplets } from "lucide-react";

export default function SustainabilityPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="rounded-2xl bg-teal/10 p-4 text-teal">
            <Leaf className="h-10 w-10" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white md:text-5xl">Sustainable Logistics</h1>
        <p className="mt-4 text-xl text-slate-400 max-w-3xl mx-auto">
          We are committed to transforming global supply chains with zero-emission transport, 
          renewable energy integration, and responsible waste management.
        </p>
      </motion.div>

      <div className="mt-24 grid gap-12 lg:grid-cols-2 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden border border-slate-800"
        >
          <img src="/images/8.png" alt="Eco-friendly Cargo" className="w-full h-full object-cover aspect-video" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8">
            <h3 className="text-2xl font-bold text-white">Project Zero Carbon</h3>
            <p className="text-teal font-medium">Achieving net-zero emissions by 2030</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          {[
            {
              title: "Fleet Electrification",
              desc: "Transitioning 80% of our last-mile delivery vehicles to electric and hydrogen power by 2028.",
              icon: Wind
            },
            {
              title: "Green Warehousing",
              desc: "Our global hubs operate on 100% renewable solar energy, featuring advanced thermal insulation.",
              icon: Sun
            },
            {
              title: "Smart Routing",
              desc: "AI-driven route optimization reduces fuel consumption and minimizes idle times during transit.",
              icon: Recyle => <Recycle className="h-6 w-6" />
            }
          ].map((item, i) => (
            <div key={item.title} className="flex gap-6">
              <div className="flex-shrink-0 mt-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-teal shadow-lg shadow-teal/10">
                  {typeof item.icon === 'function' ? item.icon() : <item.icon className="h-6 w-6" />}
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">{item.title}</h4>
                <p className="mt-2 text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-24 rounded-3xl bg-teal/5 border border-teal/20 p-12 text-center relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal/10 blur-[100px] rounded-full pointer-events-none" />
        <h2 className="relative z-10 text-3xl font-bold text-white">Partner with a Greener Future</h2>
        <p className="relative z-10 mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
          Choose NexShip as your primary logistics provider and instantly lower your corporate carbon footprint.
        </p>
        <div className="relative z-10 mt-8 flex justify-center gap-6">
          <div className="flex items-center gap-2 text-white font-bold text-2xl">
            <Droplets className="h-8 w-8 text-teal" />
            -40% <span className="text-sm text-slate-500 uppercase tracking-widest font-normal">Water Usage</span>
          </div>
          <div className="w-px bg-slate-800" />
          <div className="flex items-center gap-2 text-white font-bold text-2xl">
            <Wind className="h-8 w-8 text-teal" />
            -60% <span className="text-sm text-slate-500 uppercase tracking-widest font-normal">Air Pollutants</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
