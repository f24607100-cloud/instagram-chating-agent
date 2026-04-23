"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

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

export default function Dashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
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
    // Optimistic update
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
      fetchConversations(); // revert on failure
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
        if (activeConvo && payload.new && 'conversation_id' in payload.new && payload.new.conversation_id === activeConvo) {
           fetchMessages(activeConvo);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, activeConvo, fetchConversations, fetchMessages]);

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </div>
          <div>
            <h1 className="font-semibold text-sm">Instagram AI Agent</h1>
            <p className="text-xs text-gray-500">{conversations.length} conversations</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {conversations.map((c) => (
                <div 
                  key={c.id} 
                  onClick={() => setActiveConvo(c.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-800/50 transition-colors ${activeConvo === c.id ? 'bg-gray-800' : ''}`}
                >
                  <div className="flex gap-3">
                    <img src={c.profile_pic} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate">{c.name}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">@{c.username}</p>
                      <p className="text-sm text-gray-300 truncate mt-1">{c.last_message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-[#111111]">
        {!activeConvo ? (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
             <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-4">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
               </svg>
             </div>
             <p className="font-medium">Select a conversation</p>
             <p className="text-sm mt-1">Choose from the list to start chatting</p>
           </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-800 flex items-center justify-between gap-3 bg-[#1a1a1a]">
               {/* header */}
               <div className="flex items-center gap-3">
                 <img src={conversations.find(c => c.id === activeConvo)?.profile_pic} className="w-10 h-10 rounded-full" />
                 <div>
                   <h2 className="font-medium">{conversations.find(c => c.id === activeConvo)?.name}</h2>
                   <p className="text-xs text-gray-400">@{conversations.find(c => c.id === activeConvo)?.username}</p>
                 </div>
               </div>
               <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800">
                 <button 
                   onClick={() => toggleMode(activeConvo, "agent")}
                   className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${conversations.find(c => c.id === activeConvo)?.mode === 'agent' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                 >
                   AI Mode
                 </button>
                 <button 
                   onClick={() => toggleMode(activeConvo, "human")}
                   className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${conversations.find(c => c.id === activeConvo)?.mode === 'human' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                 >
                   Human Mode
                 </button>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'assistant' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl ${m.role === 'assistant' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-white rounded-bl-none'}`}>
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    <span className="text-[10px] opacity-70 mt-1 block">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
