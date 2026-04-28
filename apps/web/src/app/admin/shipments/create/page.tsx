"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { 
  Package, 
  User, 
  MapPin, 
  Clock, 
  Truck, 
  ArrowRight, 
  Save, 
  ChevronDown, 
  Phone, 
  Mail, 
  CreditCard,
  Scale,
  Maximize,
  CheckCircle2
} from "lucide-react";

// Move component definitions outside to prevent re-renders losing focus
const Input = ({ label, icon: Icon, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
      {Icon && <Icon className="h-3 w-3" />} {label}
    </label>
    <input
      {...props}
      className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3.5 text-sm text-white focus:border-teal outline-none transition-all placeholder:text-slate-600 shadow-inner"
    />
  </div>
);

const Select = ({ label, icon: Icon, options, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
      {Icon && <Icon className="h-3 w-3" />} {label}
    </label>
    <div className="relative">
      <select
        {...props}
        className="w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3.5 text-sm text-white focus:border-teal outline-none transition-all cursor-pointer"
      >
        {options.map((o: string) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
    </div>
  </div>
);

export default function CreateShipmentPage() {
  const { accessToken, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    shipmentType: "Air Freight",
    carrier: "NexShip Logistics",
    senderName: "",
    senderPhone: "",
    senderEmail: "",
    senderAddress: "",
    receiverName: "",
    receiverPhone: "",
    receiverEmail: "",
    receiverAddress: "",
    currentTime: new Date().toISOString().slice(0, 16),
    departureAt: "",
    estimatedAt: "",
    weightKg: "",
    sizeCm: "",
    paymentMethod: "Bank Transfer",
    description: "",
  });

  if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
    return <p className="p-8 text-center text-slate-400">Unauthorized Access.</p>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // #region agent log
    fetch('http://127.0.0.1:7481/ingest/ce8de074-f5d2-447d-ae80-ffb58579b81c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2d0882'},body:JSON.stringify({sessionId:'2d0882',runId:'run3',hypothesisId:'H4',location:'web/admin/shipments/create/page.tsx:submit:start',message:'Create shipment submit started',data:{hasAccessToken:Boolean(accessToken),tokenLength:accessToken?.length ?? 0,userRole:user?.role ?? null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    try {
      const parseAddress = (addr: string) => {
        const parts = addr.split(",");
        return {
          street: parts[0]?.trim() || "Main St",
          city: parts[1]?.trim() || "London",
          country: parts[2]?.trim() || "UK",
          postalCode: parts[3]?.trim() || "SW1A",
        };
      };

      const payload = {
        shipmentType: form.shipmentType,
        carrier: form.carrier,
        senderName: form.senderName,
        senderPhone: form.senderPhone,
        senderEmail: form.senderEmail,
        receiverName: form.receiverName,
        receiverPhone: form.receiverPhone,
        receiverEmail: form.receiverEmail,
        description: form.description,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : undefined,
        paymentMethod: form.paymentMethod,
        departureAt: form.departureAt ? new Date(form.departureAt).toISOString() : undefined,
        estimatedAt: form.estimatedAt ? new Date(form.estimatedAt).toISOString() : undefined,
        origin: parseAddress(form.senderAddress),
        destination: parseAddress(form.receiverAddress),
      };

      await apiFetch("/shipments", {
        method: "POST",
        token: accessToken!,
        body: JSON.stringify(payload),
      });
      // #region agent log
      fetch('http://127.0.0.1:7481/ingest/ce8de074-f5d2-447d-ae80-ffb58579b81c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2d0882'},body:JSON.stringify({sessionId:'2d0882',runId:'run3',hypothesisId:'H5',location:'web/admin/shipments/create/page.tsx:submit:success',message:'Create shipment request succeeded',data:{},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      setSuccess(true);
      setTimeout(() => router.push("/admin/shipments"), 2000);
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7481/ingest/ce8de074-f5d2-447d-ae80-ffb58579b81c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2d0882'},body:JSON.stringify({sessionId:'2d0882',runId:'run3',hypothesisId:'H5',location:'web/admin/shipments/create/page.tsx:submit:error',message:'Create shipment request failed',data:{error:err instanceof Error ? err.message : 'unknown'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      alert(err instanceof Error ? err.message : "Creation failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle2 className="h-20 w-20 text-teal" />
        </motion.div>
        <h2 className="mt-6 text-2xl font-bold text-white">Shipment Secured!</h2>
        <p className="mt-2 text-slate-400">Redirecting to management portal...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2.5rem] border border-slate-800 bg-navy p-8 md:p-12 shadow-2xl shadow-teal/5"
      >
        <div className="flex items-center gap-3 text-2xl font-bold text-white border-b border-slate-800 pb-8 mb-8">
          <Package className="h-7 w-7 text-orange-400" />
          Create New Shipment
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Header Specs */}
          <div className="grid gap-6 md:grid-cols-2">
            <Select 
              label="Type of Shipment*" 
              options={["Air Freight", "Ocean Freight", "Road Transport", "Rail Cargo"]} 
              value={form.shipmentType}
              onChange={(e: any) => setForm({...form, shipmentType: e.target.value})}
            />
            <Select 
              label="Shipment Carrier*" 
              options={["NexShip Logistics"]} 
              value={form.carrier}
              onChange={(e: any) => setForm({...form, carrier: e.target.value})}
            />
          </div>

          {/* Sender Section */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-widest opacity-80">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Sender Details (Origin)
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <Input 
                label="Sender Name*" 
                placeholder="e.g., John Doe" 
                value={form.senderName}
                onChange={(e: any) => setForm({...form, senderName: e.target.value})}
              />
              <Input 
                label="Sender Phone*" 
                placeholder="e.g., +1 234 567 8900" 
                value={form.senderPhone}
                onChange={(e: any) => setForm({...form, senderPhone: e.target.value})}
              />
              <Input 
                label="Sender Email" 
                type="email" 
                placeholder="e.g., sender@example.com" 
                value={form.senderEmail}
                onChange={(e: any) => setForm({...form, senderEmail: e.target.value})}
              />
              <Input 
                label="Sender Full Address*" 
                placeholder="e.g., 123 Origin Hub, NY 10001" 
                value={form.senderAddress}
                onChange={(e: any) => setForm({...form, senderAddress: e.target.value})}
              />
            </div>
          </div>

          {/* Receiver Section */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-widest opacity-80">
              <div className="h-1.5 w-1.5 rounded-full bg-teal" />
              Receiver Details (Destination)
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <Input 
                label="Receiver Name*" 
                placeholder="e.g., Jane Smith" 
                value={form.receiverName}
                onChange={(e: any) => setForm({...form, receiverName: e.target.value})}
              />
              <Input 
                label="Receiver Phone*" 
                placeholder="e.g., +44 20 7123 4567" 
                value={form.receiverPhone}
                onChange={(e: any) => setForm({...form, receiverPhone: e.target.value})}
              />
              <Input 
                label="Receiver Email* (Auto-Account & Alerts)" 
                type="email" 
                placeholder="customer@example.com" 
                value={form.receiverEmail}
                onChange={(e: any) => setForm({...form, receiverEmail: e.target.value})}
              />
              <Input 
                label="Receiver Full Address*" 
                placeholder="e.g., 456 Destination Rd, London, UK" 
                value={form.receiverAddress}
                onChange={(e: any) => setForm({...form, receiverAddress: e.target.value})}
              />
            </div>
          </div>

          {/* Times */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-widest opacity-80">
              <Clock className="h-4 w-4" /> Time and Dates
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
               <Input 
                label="Current Time & Date" 
                type="datetime-local" 
                value={form.currentTime}
                onChange={(e: any) => setForm({...form, currentTime: e.target.value})}
              />
              <Input 
                label="Departure Time & Date" 
                type="datetime-local" 
                value={form.departureAt}
                onChange={(e: any) => setForm({...form, departureAt: e.target.value})}
              />
              <Input 
                label="Delivery Time & Date" 
                type="datetime-local" 
                value={form.estimatedAt}
                onChange={(e: any) => setForm({...form, estimatedAt: e.target.value})}
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-6">
             <h3 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-widest opacity-80">
              <Maximize className="h-4 w-4" /> Freight Metrics & Details
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <Input 
                label="Weight (kg)*" 
                placeholder="e.g., 15.5" 
                type="number"
                value={form.weightKg}
                onChange={(e: any) => setForm({...form, weightKg: e.target.value})}
              />
              <Input 
                label="Size (cm)*" 
                placeholder="e.g., 10" 
                value={form.sizeCm}
                onChange={(e: any) => setForm({...form, sizeCm: e.target.value})}
              />
            </div>
            <div className="grid gap-6 md:grid-cols-1">
               <Input 
                label="Payment Method*" 
                placeholder="e.g., Bank Transfer, Cash" 
                value={form.paymentMethod}
                onChange={(e: any) => setForm({...form, paymentMethod: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Description Details</label>
              <textarea
                rows={4}
                placeholder="Additional details about the shipment"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3.5 text-sm text-white focus:border-teal outline-none transition-all resize-none shadow-inner"
                value={form.description}
                onChange={(e: any) => setForm({...form, description: e.target.value})}
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1e3a8a] py-5 text-base font-bold text-white hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/30 disabled:opacity-50"
          >
            {loading ? "Securing Cargo..." : "🚀 Create Secure Shipment"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
