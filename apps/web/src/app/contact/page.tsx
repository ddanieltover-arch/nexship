"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";

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
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 blur-[60px] rounded-full" />
          <form className="relative z-10 grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Your Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full rounded-xl border border-slate-700 bg-navy px-4 py-3 text-white placeholder:text-slate-600 focus:border-teal outline-none transition-all shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full rounded-xl border border-slate-700 bg-navy px-4 py-3 text-white placeholder:text-slate-600 focus:border-teal outline-none transition-all shadow-inner"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-slate-400">Subject</label>
              <div className="relative">
                <select className="w-full rounded-xl border border-slate-700 bg-navy px-4 py-3 text-white focus:border-teal outline-none transition-all appearance-none cursor-pointer shadow-inner">
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
                rows={4}
                placeholder="How can we help you?"
                className="w-full rounded-xl border border-slate-700 bg-navy px-4 py-3 text-white placeholder:text-slate-600 focus:border-teal outline-none transition-all resize-none shadow-inner"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl bg-teal py-4 font-bold text-navy hover:bg-teal-600 transition-all sm:col-span-2 shadow-lg shadow-teal/10"
            >
              <Send className="h-5 w-5" />
              Send Message
            </motion.button>
          </form>
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
