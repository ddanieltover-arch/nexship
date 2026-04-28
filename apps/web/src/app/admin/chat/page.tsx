"use client";

import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Clock, AlertCircle } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { WS_BASE } from "@/lib/api";

type ChatUser = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
};

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

export default function AdminChatPage() {
  const [threads, setThreads] = useState<ChatUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(WS_BASE, {
      path: "/ws/socket.io",
      transports: ["websocket", "polling"],
    });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (socket) {
      socket.on("new_message", (message: Message) => {
        if (
          selectedUserId &&
          (message.senderId === selectedUserId || message.receiverId === selectedUserId)
        ) {
          setMessages((prev) => [...prev, message]);
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        } else if (message.receiverId !== selectedUserId) {
          // A message from someone else. Refresh threads to push them up or show badge
          loadThreads();
        }
      });
      return () => {
        socket.off("new_message");
      };
    }
  }, [socket, selectedUserId]);

  async function loadThreads() {
    try {
      const data = await apiFetch<any>("/chat/threads");
      setThreads(data.threads || []);
    } catch (err) {
      setError("Failed to load chat threads.");
    } finally {
      setLoadingThreads(false);
    }
  }

  async function loadMessages(userId: string) {
    setLoadingMessages(true);
    try {
      const data = await apiFetch<any>(`/chat/messages/${userId}`);
      setMessages(data.messages || []);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError("Failed to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    const content = newMessage;
    setNewMessage("");

    try {
      const data = await apiFetch("/chat/messages", {
        method: "POST",
        body: JSON.stringify({ receiverId: selectedUserId, content }),
      });
      // The socket will receive this message too, but we can optimistically append it if we want
      // For now, we rely on the socket emitting it back to us
    } catch (err) {
      setError("Failed to send message.");
      setNewMessage(content); // restore text
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Support Center</h1>
          <p className="mt-2 text-slate-400">Manage conversations with registered users.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-500 border border-red-500/20">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Threads Sidebar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900">
            <h2 className="font-bold text-white">Active Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loadingThreads ? (
              <div className="p-4 text-center text-slate-500">Loading...</div>
            ) : threads.length === 0 ? (
              <div className="p-4 text-center text-slate-500">No active conversations.</div>
            ) : (
              threads.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                    selectedUserId === user.id ? "bg-teal/10 border border-teal/20" : "hover:bg-slate-800 border border-transparent"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-slate-300">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-white truncate">{user.name || user.email}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col overflow-hidden relative">
          {selectedUserId ? (
            <>
              <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-slate-300">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-white">
                    {threads.find((t) => t.id === selectedUserId)?.name || threads.find((t) => t.id === selectedUserId)?.email}
                  </h2>
                  <p className="text-xs text-teal flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
                    </span>
                    Online (simulated)
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex justify-center h-full items-center">
                    <div className="h-8 w-8 rounded-full border-2 border-slate-700 border-t-teal animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Clock className="h-12 w-12 mb-4 opacity-20" />
                    <p>No messages yet.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.senderId !== selectedUserId;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col max-w-[80%] ${isAdmin ? "ml-auto items-end" : "mr-auto items-start"}`}
                      >
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            isAdmin
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
                    placeholder="Type your message..."
                    className="w-full rounded-full border border-slate-700 bg-slate-800 py-3 pl-4 pr-12 text-white placeholder-slate-500 focus:border-teal focus:outline-none"
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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <User className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg">Select a conversation to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
