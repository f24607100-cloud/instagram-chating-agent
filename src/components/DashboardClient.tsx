"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

// types
type Conversation = {
  id: string;
  igsid: string;
  name: string;
  username: string;
  profile_pic: string;
  last_message: string;
  mode: "agent" | "human";
  updated_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type Stats = {
  totalMessages: number;
  leadsCaptured: number;
  handoffRate: string;
  totalHandoffs: number;
};

export default function DashboardClient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    leadsCaptured: 0,
    handoffRate: "0%",
    totalHandoffs: 0
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (activeConvo) {
      if (isInitialLoad.current) {
        scrollToBottom("auto");
        isInitialLoad.current = false;
      } else {
        scrollToBottom("smooth");
      }
    }
  }, [messages, activeConvo]);

  useEffect(() => {
    isInitialLoad.current = true;
  }, [activeConvo]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics/stats", {
        cache: "no-store",
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations", { 
        cache: "no-store",
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (!res.ok) throw new Error("Failed to fetch conversations");
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchMessages = useCallback(async (convoId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convoId}/messages`, { 
        cache: "no-store",
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const toggleMode = async (convoId: string, newMode: "agent" | "human") => {
    setConversations(prev => prev.map(c => c.id === convoId ? { ...c, mode: newMode } : c));
    try {
      await fetch(`/api/conversations/${convoId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ mode: newMode })
      });
      fetchStats(); 
    } catch (err) {
      console.error(err);
      fetchConversations();
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchStats();
  }, [fetchConversations, fetchStats]);

  useEffect(() => {
    if (!activeConvo) return;
    fetchMessages(activeConvo);
  }, [activeConvo, fetchMessages]);

  useEffect(() => {
    if (!supabase) return;
    
    const channel = supabase.channel("realtime-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "instagram_conversations" }, () => {
        fetchConversations();
        fetchStats();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "instagram_messages" }, (payload) => {
        fetchStats(); 
        if (activeConvo && payload.new && 'conversation_id' in payload.new && (payload.new as any).conversation_id === activeConvo) {
           fetchMessages(activeConvo);
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "instagram_analytics_events" }, () => {
        fetchStats();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, activeConvo, fetchConversations, fetchMessages, fetchStats]);

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-full">
      {/* Conversation List Sidebar */}
      <div className={`w-full md:w-[350px] border-r border-[#2a2a3a] flex-col bg-[#0a0a0f] ${activeConvo ? 'hidden md:flex' : 'flex'} h-full`}>
        {/* Mobile Stats Summary */}
        <div className="md:hidden flex gap-3 p-4 overflow-x-auto scrollbar-hide border-b border-[#2a2a3a]">
           <div className="bg-[#111118] p-3 rounded-xl border border-[#2a2a3a] min-w-[120px] shrink-0">
              <p className="text-[8px] text-[#a1a1aa] font-bold uppercase tracking-wider mb-1">Messages</p>
              <span className="text-lg font-bold text-[#f0f0f5]">{stats.totalMessages}</span>
           </div>
           <div className="bg-[#111118] p-3 rounded-xl border border-[#2a2a3a] min-w-[120px] shrink-0">
              <p className="text-[8px] text-[#7c3aed] font-bold uppercase tracking-wider mb-1">Leads</p>
              <span className="text-lg font-bold text-[#f0f0f5]">{stats.leadsCaptured}</span>
           </div>
        </div>

        <div className="p-4 border-b border-[#2a2a3a]">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a1a1aa]">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm italic">No messages found</div>
          ) : (
            conversations.map((c) => (
              <div 
                key={c.id} 
                onClick={() => setActiveConvo(c.id)}
                className={`p-4 cursor-pointer hover:bg-[#111118] transition-colors border-b border-[#2a2a3a]/50 ${activeConvo === c.id ? 'bg-[#1a1a25] border-r-2 border-[#7c3aed]' : ''}`}
              >
                <div className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <img src={c.profile_pic} alt={c.name} className="w-12 h-12 md:w-10 md:h-10 rounded-full object-cover border border-[#2a2a3a]" />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0a0a0f] ${c.mode === 'agent' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate text-[#f0f0f5]">{c.name}</h3>
                      <span className="text-[10px] text-[#a1a1aa]" suppressHydrationWarning>
                        {new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a1a1aa] truncate">@{c.username}</p>
                    <p className="text-xs text-gray-400 truncate mt-1">{c.last_message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className={`flex-1 flex-col bg-[#0a0a0f] ${!activeConvo ? 'hidden md:flex' : 'flex'} h-full`}>
        {!activeConvo ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#a1a1aa]">
            <div className="w-20 h-20 bg-[#111118] rounded-3xl flex items-center justify-center mb-4 border border-[#2a2a3a] shadow-2xl">
              <span className="material-symbols-outlined text-4xl text-[#7c3aed]">forum</span>
            </div>
            <h3 className="text-lg font-medium text-[#f0f0f5]">Your Messages</h3>
            <p className="text-sm mt-1">Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[#2a2a3a] hidden md:flex items-center justify-between bg-[#111118]/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <img src={conversations.find(c => c.id === activeConvo)?.profile_pic} className="w-10 h-10 rounded-full border border-[#2a2a3a]" />
                <div>
                  <h2 className="font-medium text-sm">{conversations.find(c => c.id === activeConvo)?.name}</h2>
                  <p className="text-[11px] text-[#a1a1aa]">@{conversations.find(c => c.id === activeConvo)?.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#0a0a0f] p-1 rounded-xl border border-[#2a2a3a]">
                <button 
                  onClick={() => toggleMode(activeConvo, "agent")}
                  className={`px-4 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${conversations.find(c => c.id === activeConvo)?.mode === 'agent' ? 'bg-[#7c3aed] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]' : 'text-[#a1a1aa] hover:text-[#f0f0f5]'}`}
                >
                  AI Agent
                </button>
                <button 
                  onClick={() => toggleMode(activeConvo, "human")}
                  className={`px-4 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${conversations.find(c => c.id === activeConvo)?.mode === 'human' ? 'bg-[#37333e] text-white' : 'text-[#a1a1aa] hover:text-[#f0f0f5]'}`}
                >
                  Human
                </button>
              </div>
            </div>
            
            {/* Mobile Mode Toggle */}
            <div className="md:hidden flex items-center justify-center p-2 bg-[#111118] border-b border-[#2a2a3a] gap-4">
              <button 
                onClick={() => toggleMode(activeConvo, "agent")}
                className={`text-xs font-bold px-3 py-1 rounded-full ${conversations.find(c => c.id === activeConvo)?.mode === 'agent' ? 'text-[#7c3aed] bg-[#7c3aed]/10' : 'text-slate-500'}`}
              >
                AI Agent
              </button>
              <div className="w-px h-3 bg-[#2a2a3a]"></div>
              <button 
                onClick={() => toggleMode(activeConvo, "human")}
                className={`text-xs font-bold px-3 py-1 rounded-full ${conversations.find(c => c.id === activeConvo)?.mode === 'human' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500'}`}
              >
                Human Mode
              </button>
            </div>

            {/* Messages Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:y-6 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[#a1a1aa] text-sm italic">No messages in this thread</div>
              ) : (
                messages.map(m => (
                  <div key={m.id} className={`flex ${m.role === 'assistant' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[75%] p-3 md:p-3.5 rounded-2xl shadow-lg ${m.role === 'assistant' ? 'bg-[#7c3aed] text-white rounded-br-none shadow-[0_4px_15px_rgba(124,58,237,0.3)]' : 'bg-[#111118] border border-[#2a2a3a] text-[#f0f0f5] rounded-bl-none'}`}>
                      <p className="text-sm leading-relaxed">{m.content}</p>
                      <span className="text-[9px] opacity-60 mt-2 block text-right" suppressHydrationWarning>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Placeholder */}
            <div className="p-4 bg-[#111118]/30 border-t border-[#2a2a3a]">
              <div className="relative">
                <input 
                  disabled 
                  placeholder="Replies handled by AI" 
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-[#a1a1aa] cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="material-symbols-outlined text-[#a1a1aa]">send</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
