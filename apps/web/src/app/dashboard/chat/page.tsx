"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { apiFetch, WS_BASE } from "@/lib/api";
import { motion } from "framer-motion";
import { Send, Clock, UserCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

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

export default function UserChatPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await apiFetch<any>(`/chat/messages/admin`, { token: accessToken });
      setMessages(data.messages || []);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id || !accessToken || !supabase) {
      if (!authLoading) {
        setError("Please login to access chat.");
        setLoading(false);
      }
      return;
    }

    void loadMessages();
    
    const channel = supabase
      .channel('user_messages')
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message" },
        (payload) => {
          const message = payload.new as Message;
          if (message.senderId === user.id || message.receiverId === user.id) {
            setMessages((prev) => [...prev, message]);
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authLoading, user?.id, accessToken, loadMessages]);

  // Socket logic handled in the useEffect above

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const content = newMessage;
    setNewMessage("");

    try {
      // For users, receiverId can be anything since backend forces it to an admin
      await apiFetch("/chat/messages", {
        method: "POST",
        body: JSON.stringify({ receiverId: "admin", content }),
        token: accessToken,
      });
    } catch (err) {
      setError("Failed to send message.");
      setNewMessage(content); // restore text
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Live Support</h1>
        <p className="text-sm text-slate-400">Chat directly with a Nexships logistics specialist.</p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-500 border border-red-500/20">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col overflow-hidden relative shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/10 text-teal">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-white">Support Specialist</h2>
            <p className="text-xs text-teal flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
              </span>
              Online
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center h-full items-center">
              <div className="h-8 w-8 rounded-full border-2 border-slate-700 border-t-teal animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Clock className="h-12 w-12 mb-4 opacity-20" />
              <p>Send a message to start the conversation.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col max-w-[80%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      isMe
                        ? "bg-teal text-navy rounded-br-sm"
                        : "bg-slate-800 text-white rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="How can we help you?"
              className="w-full rounded-full border border-slate-700 bg-slate-800 py-3 pl-4 pr-12 text-white placeholder-slate-500 focus:border-teal focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-teal p-2 text-navy hover:bg-teal-600 disabled:opacity-50 disabled:hover:bg-teal transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
