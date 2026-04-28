"use client";

import { motion } from "framer-motion";
import { Target, Eye, Award, Globe2, ShieldCheck, Zap } from "lucide-react";

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

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 overflow-hidden">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white md:text-6xl">About Nexships</h1>
        <p className="mt-6 text-xl text-slate-400 max-w-3xl mx-auto">
          Founded on the principle of precision, Nexships is the world's leading B2C and B2B logistics platform, 
          bridging the gap between global freight and local delivery with real-time intelligence.
        </p>
      </motion.section>

      {/* Corporate Identity Image */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-16 relative aspect-[21/9] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl"
      >
        <motion.img
          initial={{ scale: 1.2 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 2 }}
          src="/images/2.png"
          alt="Nexship Night Operations"
          className="h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent" />
        <div className="absolute bottom-8 left-8">
          <p className="text-teal font-bold tracking-widest text-sm uppercase">EST. 2024</p>
          <h2 className="text-white text-2xl font-bold mt-2">Next-Level Delivery, Every Time.</h2>
        </div>
      </motion.div>

      {/* Mission & Vision */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-24 grid gap-12 md:grid-cols-2"
      >
        <motion.div variants={itemVariants} className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 hover:border-teal transition-colors">
          <div className="flex items-center gap-4 text-teal">
            <Target className="h-8 w-8" />
            <h3 className="text-2xl font-bold text-white">Our Mission</h3>
          </div>
          <p className="mt-6 text-slate-400 leading-relaxed">
            To empower global trade by providing a transparent, secure, and hyper-efficient logistics ecosystem. 
            We aim to simplify the complexities of international shipping for every individual and business, 
            ensuring that no destination is out of reach.
          </p>
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 hover:border-teal transition-colors">
          <div className="flex items-center gap-4 text-teal">
            <Eye className="h-8 w-8" />
            <h3 className="text-2xl font-bold text-white">Our Vision</h3>
          </div>
          <p className="mt-6 text-slate-400 leading-relaxed">
            To become the digital backbone of global logistics, where every package's journey is visible, 
            every partner is verified, and every delivery is a testament to the power of human connection 
            amplified by technology.
          </p>
        </motion.div>
      </motion.div>

      {/* Core Values */}
      <div className="mt-24">
        <h2 className="text-3xl font-bold text-white text-center">Our Core Values</h2>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { title: "Transparency", desc: "Live tracking isn't just a feature; it's our promise of honesty.", icon: Globe2 },
            { title: "Reliability", desc: "99.9% delivery success rate across 190+ countries.", icon: ShieldCheck },
            { title: "Innovation", desc: "AI-driven route optimization and real-time WebSocket architecture.", icon: Zap },
            { title: "Excellence", desc: "Recognized globally for setting the standard in logistics UX.", icon: Award },
          ].map((v) => (
            <motion.div 
              key={v.title} 
              variants={itemVariants}
              whileHover={{ y: -5, backgroundColor: "rgba(45, 212, 191, 0.05)" }}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 transition-colors"
            >
              <v.icon className="h-6 w-6 text-teal" />
              <h4 className="mt-4 text-lg font-bold text-white">{v.title}</h4>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Brand Design Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-24 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 md:p-12 overflow-hidden"
      >
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white">The Nexships Identity</h2>
            <p className="mt-4 text-slate-400">
              Our brand represents the intersection of technology and movement. The electric teal symbolises 
              innovation and digital speed, while the deep navy stands for the traditional trust and 
              stability of the global freight industry.
            </p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl"
          >
            <img src="/images/8.png" alt="Nexship Branding" className="w-full" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
