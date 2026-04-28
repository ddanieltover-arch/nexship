"use client";

import { motion } from "framer-motion";
import { Plane, Ship, Truck, Box, Zap, ShieldCheck, ArrowRight } from "lucide-react";

const services = [
  {
    title: "Air Freight",
    icon: Plane,
    image: "/images/1.png",
    desc: "Fastest transit times with daily departures to global hubs. Ideal for high-value and time-sensitive cargo.",
    features: ["Next Flight Out", "Consolidation", "Door-to-Door"],
  },
  {
    title: "Ocean Freight",
    icon: Ship,
    image: "/images/4.png",
    desc: "Cost-effective global shipping. Full Container Load (FCL) and Less than Container Load (LCL) options.",
    features: ["LCL & FCL", "Port-to-Port", "OOG & Project Cargo"],
  },
  {
    title: "Land Transport",
    icon: Truck,
    image: "/images/7.png",
    desc: "Reliable road and rail solutions across continents. Seamless integration with our sea and air hubs.",
    features: ["FTL / LTL", "Intermodal", "Customs Bonded"],
  },
  {
    title: "Express Delivery",
    icon: Zap,
    image: "/images/5.png",
    desc: "Premium B2C courier service with end-to-end live tracking. Our specialty for e-commerce.",
    features: ["Same-day", "White Glove", "Signature Tracking"],
  },
  {
    title: "Customs Brokerage",
    icon: ShieldCheck,
    image: "/images/3.png",
    desc: "Seamless customs clearance and trade compliance for complex international shipments.",
    features: ["Duty Drawback", "Bonded Entry", "HS Classification"],
  },
  {
    title: "Warehousing",
    icon: Box,
    image: "/images/6.png",
    desc: "Strategic storage and fulfillment solutions at major global transport hubs.",
    features: ["Inventory MGMT", "Pick & Pack", "Cross-docking"],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white md:text-5xl">Global Freight Services</h1>
        <p className="mt-4 text-xl text-slate-400">
          Tailored logistics solutions for businesses of all sizes, from local express to global supply chains.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
      >
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            variants={cardVariants}
            whileHover={{ y: -10 }}
            className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 hover:border-teal transition-all duration-300 shadow-xl"
          >
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={s.image}
                alt={s.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
              />
            </div>
            <div className="p-8">
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl bg-teal/10 p-4 text-teal group-hover:bg-teal group-hover:text-navy transition-colors"
                >
                  <s.icon className="h-6 w-6" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white">{s.title}</h2>
              </div>
              <p className="mt-6 text-sm text-slate-400 leading-relaxed min-h-[60px]">
                {s.desc}
              </p>
              <ul className="mt-6 space-y-2">
                {s.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                    <ShieldCheck className="h-4 w-4 text-teal" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 py-3 font-semibold text-white transition-all hover:bg-teal hover:text-navy hover:border-teal active:scale-95">
                Request Quotation <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Sustainability Section */}
      <motion.section 
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-24 rounded-3xl bg-teal/5 border border-teal/20 p-12 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal/10 blur-[100px] rounded-full" />
        <div className="relative z-10 grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white">Green Logistics</h2>
            <p className="mt-4 text-slate-400">
              Nexships is committed to zero-emission logistics. We are optimizing our routes and 
              partnering with carbon-neutral carriers to reduce our global footprint.
            </p>
            <div className="mt-8 flex gap-10">
              <div>
                <motion.p 
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="text-4xl font-bold text-teal"
                >
                  30%
                </motion.p>
                <p className="text-xs text-slate-500 uppercase tracking-widest">CO2 Reduction</p>
              </div>
              <div className="border-l border-slate-800" />
              <div>
                <motion.p 
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold text-teal"
                >
                  2030
                </motion.p>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Net Zero Goal</p>
              </div>
            </div>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 1 }}
            className="rounded-2xl overflow-hidden border border-slate-700 h-64"
          >
             <img src="/images/8.png" alt="Sustainability" className="w-full h-full object-cover opacity-80" />
          </motion.div>
        </div>
      </motion.section>

      {/* Why Businesses Choose Nexships */}
      <div className="mt-24 text-center">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-white"
        >
          Why Businesses Choose Nexships
        </motion.h2>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 grid gap-8 sm:grid-cols-3"
        >
          {[
            { title: "Real-time Visibility", desc: "Track your cargo at every milestone with our advanced GPS integration." },
            { title: "Customs Expertise", desc: "Global trade compliance handled by our dedicated in-house experts." },
            { title: "Competitive Rates", desc: "Volume-based pricing through our vast carrier network." },
          ].map(item => (
            <motion.div key={item.title} variants={cardVariants} whileHover={{ scale: 1.05 }}>
              <h3 className="text-lg font-semibold text-teal">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
