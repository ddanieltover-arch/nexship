"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Eye, Server, FileDigit, Cpu } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="rounded-2xl bg-teal/10 p-4 text-teal">
            <ShieldCheck className="h-10 w-10" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white md:text-5xl">Global Security Protocol</h1>
        <p className="mt-4 text-xl text-slate-400 max-w-3xl mx-auto">
          Military-grade encryption, strict compliance frameworks, and 24/7 physical surveillance 
          ensure your cargo and data remain completely secure.
        </p>
      </motion.div>

      <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Data Encryption",
            desc: "All platform data is encrypted at rest and in transit using AES-256 protocols.",
            icon: Lock
          },
          {
            title: "24/7 Surveillance",
            desc: "Our global hubs are monitored round-the-clock with AI-powered threat detection.",
            icon: Eye
          },
          {
            title: "Zero-Trust Architecture",
            desc: "Strict access controls ensure that only authorized personnel can view shipment details.",
            icon: Server
          },
          {
            title: "Blockchain Verification",
            desc: "Immutable ledgers track the chain of custody for high-value and sensitive cargo.",
            icon: FileDigit
          },
          {
            title: "Regulatory Compliance",
            desc: "Fully compliant with global trade standards including C-TPAT, AEO, and GDPR.",
            icon: ShieldCheck
          },
          {
            title: "AI Risk Assessment",
            desc: "Predictive algorithms analyze transit routes to avoid geopolitical or environmental risks.",
            icon: Cpu
          }
        ].map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 hover:border-teal transition-all duration-300"
          >
            <div className="rounded-xl bg-teal/10 p-3 w-max text-teal mb-6">
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mt-24 rounded-3xl bg-gradient-to-br from-slate-900 to-navy border border-slate-800 p-12 text-center"
      >
        <ShieldCheck className="mx-auto h-16 w-16 text-slate-700 mb-6" />
        <h2 className="text-2xl font-bold text-white">Report a Security Concern</h2>
        <p className="mt-4 text-slate-400 max-w-xl mx-auto">
          If you believe you have discovered a vulnerability or have a security concern regarding your shipment, 
          please contact our dedicated security operations center immediately.
        </p>
        <a 
          href="/contact"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3 font-bold text-white hover:bg-slate-700 transition-colors"
        >
          Contact Security Team
        </a>
      </motion.div>
    </div>
  );
}
