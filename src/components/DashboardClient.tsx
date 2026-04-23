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

export default function DashboardClient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeConvo) {
      scrollToBottom();
    }
  }, [messages, activeConvo]);

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
    } catch (err) {
      console.error(err);
      fetchConversations();
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!activeConvo) return;
    fetchMessages(activeConvo);
  }, [activeConvo, fetchMessages]);

  useEffect(() => {
    if (!supabase) return;
    
    const channel = supabase.channel("realtime-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "instagram_conversations" }, () => {
        fetchConversations();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "instagram_messages" }, (payload) => {
        if (activeConvo && payload.new && 'conversation_id' in payload.new && (payload.new as any).conversation_id === activeConvo) {
           fetchMessages(activeConvo);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, activeConvo, fetchConversations, fetchMessages]);

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-[#f0f0f5] font-inter antialiased flex flex-col">
      {/* Desktop TopNavBar */}
      <nav className="fixed top-0 w-full z-50 hidden md:flex items-center justify-between px-6 h-16 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#2a2a3a] shadow-[0_0_20px_rgba(124,58,237,0.05)]">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold tracking-tight text-[#f0f0f5]">AgenticDM</span>
        </div>
        <div className="flex-1 flex justify-center max-w-xl px-4">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] text-[18px]">search</span>
            <input 
              className="w-full bg-[#111118] border border-[#2a2a3a] rounded-lg pl-10 pr-4 py-2 text-[#f0f0f5] focus:outline-none focus:border-primary-container focus:shadow-[0_0_20px_rgba(124,58,237,0.15)] transition-all duration-200 text-sm" 
              placeholder="Search conversations..." 
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 text-[#a1a1aa]">
          <button className="hover:text-[#f0f0f5] transition-colors duration-200 active:scale-95">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="hover:text-[#f0f0f5] transition-colors duration-200 active:scale-95">
            <span className="material-symbols-outlined">help</span>
          </button>
          <Link href="/settings" className="hover:text-[#7c3aed] transition-colors duration-200 active:scale-95">
            <span className="material-symbols-outlined">settings</span>
          </Link>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#2a2a3a] ml-2">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Awais" alt="User profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </nav>

      {/* Mobile TopAppBar */}
      <header className="fixed top-0 w-full z-50 border-b border-[#2a2a3a] bg-[#0a0a0f]/80 backdrop-blur-xl flex items-center justify-between px-4 h-16 md:hidden">
        {activeConvo ? (
          <button onClick={() => setActiveConvo(null)} className="text-slate-400 hover:text-white transition-colors p-2 -ml-2">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
        ) : (
          <div className="w-8" />
        )}
        <h1 className="text-lg font-bold text-slate-100 tracking-tight font-inter">
          {activeConvo ? conversations.find(c => c.id === activeConvo)?.name : "AgenticDM"}
        </h1>
        <button className="text-slate-400 hover:text-white transition-colors p-2 -mr-2">
          <span className="material-symbols-outlined text-[24px]">more_vert</span>
        </button>
      </header>

      {/* Desktop SideNavBar */}
      <aside className="fixed left-0 top-0 h-screen flex flex-col pt-20 pb-6 px-4 bg-[#111118] border-r border-[#2a2a3a] w-[240px] font-inter text-xs font-medium uppercase tracking-wider hidden md:flex z-40">
        <div className="flex flex-col gap-1 flex-1 mt-6">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#a1a1aa] hover:bg-[#1a1a25] hover:text-[#f0f0f5] transition-all">
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-[#7c3aed]/10 text-[#7c3aed] border-r-2 border-[#7c3aed] transition-all">
            <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>forum</span>
            <span>Messages</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#a1a1aa] hover:bg-[#1a1a25] hover:text-[#f0f0f5] transition-all">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>Automations</span>
          </Link>
          <Link href="/knowledge" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#a1a1aa] hover:bg-[#1a1a25] hover:text-[#f0f0f5] transition-all">
            <span className="material-symbols-outlined text-[18px]">database</span>
            <span>Knowledge Base</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-[240px] pt-16 md:h-screen flex flex-col md:flex-row overflow-hidden flex-1 mb-16 md:mb-0">
        {/* Conversation List Sidebar */}
        <div className={`w-full md:w-[350px] border-r border-[#2a2a3a] flex-col bg-[#0a0a0f] ${activeConvo ? 'hidden md:flex' : 'flex'} h-full`}>
          <div className="p-4 border-b border-[#2a2a3a]">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a1a1aa]">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
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
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0a0a0f] ${c.mode === 'agent' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
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
              {/* Chat Header (Desktop only, mobile uses TopAppBar) */}
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
              
              {/* Mobile Mode Toggle (Small bar below header) */}
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
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:y-6 pb-20 md:pb-6">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-[#a1a1aa] text-sm italic">No messages in this thread</div>
                ) : (
                  messages.map(m => (
                    <div key={m.id} className={`flex ${m.role === 'assistant' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[75%] p-3 md:p-3.5 rounded-2xl shadow-lg ${m.role === 'assistant' ? 'bg-[#7c3aed] text-white rounded-br-none' : 'bg-[#111118] border border-[#2a2a3a] text-[#f0f0f5] rounded-bl-none'}`}>
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
              <div className="p-4 bg-[#111118]/30 border-t border-[#2a2a3a] mb-16 md:mb-0">
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
      </main>

      {/* Mobile BottomNavBar */}
      <nav className="fixed bottom-0 w-full z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.3)] border-t border-[#2a2a3a] bg-[#111118]/90 backdrop-blur-lg flex justify-around items-center h-16 px-2 md:hidden">
        <Link className="flex flex-col items-center justify-center text-slate-500 w-16" href="/">
          <span className="material-symbols-outlined text-[24px] mb-1">dashboard</span>
          <span className="font-inter text-[10px] font-medium">Home</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-violet-400 w-16" href="/">
          <span className="material-symbols-outlined text-[24px] mb-1" style={{fontVariationSettings: "'FILL' 1"}}>forum</span>
          <span className="font-inter text-[10px] font-medium">Messages</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-slate-500 w-16" href="/knowledge">
          <span className="material-symbols-outlined text-[24px] mb-1">database</span>
          <span className="font-inter text-[10px] font-medium">Knowledge</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-slate-500 w-16" href="/settings">
          <span className="material-symbols-outlined text-[24px] mb-1">settings</span>
          <span className="font-inter text-[10px] font-medium">Settings</span>
        </Link>
      </nav>
    </div>
  );
}
