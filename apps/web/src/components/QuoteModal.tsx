"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Package, Globe, User, Mail, Building2, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    origin: "",
    destination: "",
    cargoDetails: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Re-use /contact endpoint for now or create a new one
      await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          subject: `Quote Request: ${form.origin} to ${form.destination}`,
          message: `Company: ${form.company}\nCargo: ${form.cargoDetails}`,
        }),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setForm({ name: "", email: "", company: "", origin: "", destination: "", cargoDetails: "" });
      }, 3000);
    } catch (err) {
      setError("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-slate-800 bg-navy p-1 shadow-2xl"
          >
            <div className="bg-slate-900/50 p-8 md:p-12">
              <button
                onClick={onClose}
                className="absolute right-6 top-6 rounded-full bg-slate-800/50 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="rounded-full bg-teal/20 p-6 mb-6">
                      <CheckCircle2 className="h-16 w-16 text-teal" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Quote Requested!</h2>
                    <p className="mt-4 text-slate-400 max-w-md">
                      Our logistics specialists are analyzing your requirements. 
                      You will receive a detailed quotation at <strong>{form.email}</strong> shortly.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="form">
                    <div className="mb-10 text-center lg:text-left">
                      <h2 className="text-3xl font-bold text-white">Get a Global Quote</h2>
                      <p className="mt-2 text-slate-400">Provide your shipment details for precise pricing and transit times.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
                      {error && (
                        <div className="md:col-span-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
                          {error}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                          <User className="h-3 w-3 text-teal" /> Full Name
                        </label>
                        <input
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full rounded-2xl border border-slate-800 bg-navy px-5 py-4 text-white focus:border-teal outline-none transition-all"
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                          <Mail className="h-3 w-3 text-teal" /> Work Email
                        </label>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full rounded-2xl border border-slate-800 bg-navy px-5 py-4 text-white focus:border-teal outline-none transition-all"
                          placeholder="john@company.com"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                          <Building2 className="h-3 w-3 text-teal" /> Company Name
                        </label>
                        <input
                          required
                          value={form.company}
                          onChange={(e) => setForm({ ...form, company: e.target.value })}
                          className="w-full rounded-2xl border border-slate-800 bg-navy px-5 py-4 text-white focus:border-teal outline-none transition-all"
                          placeholder="Logistics Solutions Inc."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                          <Globe className="h-3 w-3 text-teal" /> Origin City/Port
                        </label>
                        <input
                          required
                          value={form.origin}
                          onChange={(e) => setForm({ ...form, origin: e.target.value })}
                          className="w-full rounded-2xl border border-slate-800 bg-navy px-5 py-4 text-white focus:border-teal outline-none transition-all"
                          placeholder="Shanghai, China"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                          <Globe className="h-3 w-3 text-teal" /> Destination
                        </label>
                        <input
                          required
                          value={form.destination}
                          onChange={(e) => setForm({ ...form, destination: e.target.value })}
                          className="w-full rounded-2xl border border-slate-800 bg-navy px-5 py-4 text-white focus:border-teal outline-none transition-all"
                          placeholder="Los Angeles, USA"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                          <Package className="h-3 w-3 text-teal" /> Cargo Details
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={form.cargoDetails}
                          onChange={(e) => setForm({ ...form, cargoDetails: e.target.value })}
                          className="w-full rounded-2xl border border-slate-800 bg-navy px-5 py-4 text-white focus:border-teal outline-none transition-all resize-none"
                          placeholder="e.g. 500kg of electronics, 2 standard pallets..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-teal py-5 font-black uppercase tracking-widest text-navy hover:bg-teal-600 transition-all md:col-span-2 shadow-xl shadow-teal/10 disabled:opacity-50"
                      >
                        <Send className="h-5 w-5" />
                        {loading ? "Calculating..." : "Submit Quote Request"}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
