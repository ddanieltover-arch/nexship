"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, User, Headset, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    email: string;
  };
};

import { useAuth } from "@/lib/auth";

export function LiveSupport() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"identify" | "chat">("identify");
  
  // Hide support widget for admins/staff
  const isAdmin = user?.role === "ADMIN" || user?.role === "STAFF";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("nexship_support_email");
    const savedName = localStorage.getItem("nexship_support_name");
    if (savedEmail && savedName) {
      setEmail(savedEmail);
      setName(savedName);
      setStep("chat");
      loadMessages(savedEmail);
    }
  }, []);

  useEffect(() => {
    if (isOpen && step === "chat") {
      const interval = setInterval(() => loadMessages(email), 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, step, email]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  async function loadMessages(targetEmail: string) {
    try {
      const res = await apiFetch<{ messages: Message[]; userId: string }>(`/support/messages?email=${encodeURIComponent(targetEmail)}`);
      setChat(res.messages);
      setUserId(res.userId);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  }

  async function handleIdentify(e: React.FormEvent) {
    e.preventDefault();
    setStep("chat");
    localStorage.setItem("nexship_support_email", email);
    localStorage.setItem("nexship_support_name", name);
    loadMessages(email);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    const content = message;
    setMessage("");
    setLoading(true);

    try {
      await apiFetch("/support/message", {
        method: "POST",
        body: JSON.stringify({ name, email, content }),
      });
      loadMessages(email);
    } catch (err) {
      console.error("Failed to send message", err);
      setMessage(content);
    } finally {
      setLoading(false);
    }
  }

  if (isAdmin) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] overflow-hidden rounded-[2rem] border border-slate-800 bg-navy shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="bg-teal p-6 text-navy">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-navy/10 p-2">
                    <Headset className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tighter">Live Support</p>
                    <p className="text-[10px] font-bold opacity-70">Typically replies in 5m</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-navy/10 p-1 hover:bg-navy/20 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="h-[400px] flex flex-col">
              {step === "identify" ? (
                <form onSubmit={handleIdentify} className="flex-1 flex flex-col p-8 space-y-4">
                  <p className="text-sm text-slate-400 mb-2">Please introduce yourself to start a live chat with our logistics team.</p>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Full Name</label>
                    <input 
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Email Address</label>
                    <input 
                      required
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-teal outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="mt-auto w-full rounded-xl bg-teal py-4 text-sm font-bold text-navy hover:bg-teal-600 transition-all shadow-lg shadow-teal/20"
                  >
                    Start Conversation
                  </button>
                </form>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                    {chat.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                           <MessageCircle className="h-6 w-6 text-slate-600" />
                        </div>
                        <p className="text-sm text-slate-500 font-medium">No messages yet. Send a message to start chatting with support.</p>
                      </div>
                    ) : (
                      chat.map((msg, i) => {
                        const isMe = msg.senderId === userId;
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: isMe ? 10 : -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                          >
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-teal text-navy rounded-tr-none" : "bg-slate-800 text-white rounded-tl-none"}`}>
                              {msg.content}
                            </div>
                            <span className="mt-1 text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </motion.div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleSend} className="p-4 bg-slate-900/50 border-t border-slate-800">
                    <div className="relative flex items-center">
                      <input 
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Message support..."
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-3 pl-4 pr-12 text-sm text-white focus:border-teal outline-none"
                      />
                      <button 
                        type="submit"
                        disabled={loading || !message.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-teal p-2 text-navy hover:bg-teal-600 transition-all disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-teal text-navy shadow-2xl shadow-teal/20 transition-all hover:bg-teal-600"
      >
        {isOpen ? <X className="h-8 w-8" /> : <MessageCircle className="h-8 w-8" />}
      </motion.button>
    </div>
  );
}
