"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSuccess(true);
      setForm({ name: "", email: "", subject: "General Inquiry", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white md:text-5xl">Contact Us</h1>
        <p className="mt-4 text-xl text-slate-400">
          Our global support team is available 24/7 to assist with your logistics needs.
        </p>
      </motion.div>

      <div className="mt-16 grid gap-12 lg:grid-cols-3">
        {/* Contact Info */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8 lg:col-span-1"
        >
          {[
            { title: "General Inquiries", detail: "support@nexships.com", icon: Mail },
            { title: "Global Hotline", detail: "+1 (800) NEX-SHIPS", icon: Phone },
            { title: "Global Offices", detail: "USA, Canada, UK, China, Germany", icon: MapPin },
            { title: "Business Hours", detail: "24/7 Operational Support", icon: Clock },
          ].map((item) => (
            <motion.div key={item.title} variants={itemVariants} className="flex items-start gap-4 group">
              <div className="rounded-xl bg-teal/10 p-3 text-teal transition-transform group-hover:scale-110 group-hover:bg-teal group-hover:text-navy">
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">{item.title}</h3>
                <p className="mt-1 text-lg font-medium text-white">{item.detail}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 lg:col-span-2 shadow-2xl relative"
        >
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="rounded-full bg-teal/20 p-6 mb-6">
                  <CheckCircle2 className="h-16 w-16 text-teal" />
                </div>
                <h2 className="text-2xl font-bold text-white">Message Transmitted!</h2>
                <p className="mt-2 text-slate-400">Our dispatchers have received your inquiry. We&apos;ll respond shortly.</p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-8 text-teal font-bold hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                onSubmit={handleSubmit}
                className="relative z-10 grid gap-6 sm:grid-cols-2"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 blur-[60px] rounded-full" />
                
                {error && (
                  <div className="sm:col-span-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Your Name</label>
                  <input
                    required
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-navy px-4 py-3 text-white placeholder:text-slate-600 focus:border-teal outline-none transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-navy px-4 py-3 text-white placeholder:text-slate-600 focus:border-teal outline-none transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-400">Subject</label>
                  <div className="relative">
                    <select 
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-navy px-4 py-3 text-white focus:border-teal outline-none transition-all appearance-none cursor-pointer shadow-inner"
                    >
                      <option>General Inquiry</option>
                      <option>Freight Quotation</option>
                      <option>Partnership Opportunity</option>
                      <option>Technical Support</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-400">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we help you?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-navy px-4 py-3 text-white placeholder:text-slate-600 focus:border-teal outline-none transition-all resize-none shadow-inner"
                  />
                </div>
                <motion.button
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-teal py-4 font-bold text-navy hover:bg-teal-600 transition-all sm:col-span-2 shadow-lg shadow-teal/10 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                  {loading ? "Transmitting..." : "Send Message"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* World Map Background Visual */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-24 relative h-[300px] overflow-hidden rounded-3xl border border-slate-800 group"
      >
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 10 }}
          src="/images/7.png"
          alt="Global Transport"
          className="h-full w-full object-cover opacity-40 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <MessageSquare className="mx-auto h-12 w-12 text-teal mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-white">Live Chat Available</h2>
            <p className="mt-2 text-slate-400">Need immediate assistance? Connect with our global dispatchers now.</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
