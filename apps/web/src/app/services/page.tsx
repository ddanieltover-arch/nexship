"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Ship, Truck, Box, Zap, ShieldCheck, ArrowRight, X, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

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
  const [activeQuotationModal, setActiveQuotationModal] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          subject: `Service Inquiry: ${activeQuotationModal}`,
          origin: "Service Page Inquiry", // Flag for the backend to treat it as a quote/inquiry
          destination: activeQuotationModal,
          cargoDetails: `Phone: ${form.phone}\n\n${form.message}`
        }),
      });
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => {
        setSuccess(false);
        setActiveQuotationModal(null);
      }, 3000);
    } catch (err) {
      setError("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
              id={s.title.toLowerCase().replace(/\s+/g, '-')}
              variants={cardVariants}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 hover:border-teal transition-all duration-300 shadow-xl scroll-mt-24"
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
                <button 
                  onClick={() => setActiveQuotationModal(s.title)}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 py-3 font-semibold text-white transition-all hover:bg-teal hover:text-navy hover:border-teal active:scale-95"
                >
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

      {/* Quotation Modal Overlay */}
      <AnimatePresence>
        {activeQuotationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveQuotationModal(null)}
              className="absolute inset-0 bg-navy/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal/5 blur-[100px] pointer-events-none rounded-full" />
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4 relative z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white">Request Quotation</h2>
                  <p className="text-sm text-teal mt-1">Service: {activeQuotationModal}</p>
                </div>
                <button 
                  onClick={() => setActiveQuotationModal(null)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto pr-2 custom-scrollbar relative z-10 flex-1">
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <div className="rounded-full bg-teal/20 p-6 mb-6">
                        <CheckCircle2 className="h-12 w-12 text-teal" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Request Received</h3>
                      <p className="mt-2 text-sm text-slate-400">Our {activeQuotationModal} experts will contact you shortly.</p>
                    </motion.div>
                  ) : (
                    <form id="quotation-form" onSubmit={handleSubmit} className="space-y-4">
                      {error && (
                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-xs">
                          {error}
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
                        <input 
                          required
                          type="text" 
                          placeholder="e.g. John Doe"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full rounded-xl border border-slate-700 bg-slate-800/50 p-3 text-white placeholder-slate-500 focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email</label>
                          <input 
                            required
                            type="email" 
                            placeholder="john@company.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 p-3 text-white placeholder-slate-500 focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone</label>
                          <input 
                            required
                            type="tel" 
                            placeholder="+1 234 567 8900"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 p-3 text-white placeholder-slate-500 focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Enquiry Message</label>
                        <textarea 
                          required
                          rows={4}
                          placeholder="Please provide details about your cargo (weight, dimensions, origin, destination)..."
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="w-full rounded-xl border border-slate-700 bg-slate-800/50 p-3 text-white placeholder-slate-500 focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal transition-all resize-none"
                        />
                      </div>
                    </form>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800 flex justify-end relative z-10 gap-3">
                 {!success && (
                   <>
                     <button 
                       onClick={() => setActiveQuotationModal(null)}
                       className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                     >
                       Cancel
                     </button>
                     <button 
                       type="submit"
                       form="quotation-form"
                       disabled={loading}
                       className="rounded-xl bg-teal px-6 py-2.5 text-sm font-bold text-navy hover:bg-teal-600 transition-colors shadow-lg shadow-teal/20 disabled:opacity-50"
                     >
                       {loading ? "Transmitting..." : "Submit Request"}
                     </button>
                   </>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
