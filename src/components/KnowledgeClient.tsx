"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

type Knowledge = {
  id: string;
  content: string;
  source_type: "text" | "file";
  metadata: any;
  created_at: string;
};

export default function KnowledgeClient() {
  const [items, setItems] = useState<Knowledge[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const supabase = (() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  })();

  const fetchKnowledge = async () => {
    try {
      const res = await fetch("/api/knowledge", {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const handleAddText = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, source_type: "text" })
      });
      setText("");
      fetchKnowledge();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/knowledge/process", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        fetchKnowledge();
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await fetch(`/api/knowledge?id=${id}`, { method: "DELETE" });
      fetchKnowledge();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pt-4 md:pt-8 px-4 md:px-8 pb-12">
      <div className="max-w-4xl mx-auto py-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#f0f0f5]">Knowledge Base</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">Train your AI agent with custom documentation and portfolio data.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Text Input */}
          <div className="bg-[#111118] p-6 rounded-2xl border border-[#2a2a3a] shadow-xl">
            <h2 className="text-sm font-bold text-[#f0f0f5] uppercase tracking-wider mb-4">Add Text Info</h2>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste project details, bio, or technical info here..."
              className="w-full h-32 bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl p-4 text-sm text-[#f0f0f5] focus:outline-none focus:border-[#7c3aed] transition-all resize-none mb-4"
            />
            <button 
              onClick={handleAddText}
              disabled={loading}
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            >
              {loading ? "Adding..." : "Update Knowledge"}
            </button>
          </div>

          {/* File Upload */}
          <div className="bg-[#111118] p-6 rounded-2xl border border-[#2a2a3a] shadow-xl flex flex-col items-center justify-center border-dashed border-2 hover:border-[#7c3aed]/50 transition-all cursor-pointer relative">
            <input 
              type="file" 
              onChange={handleFileUpload} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept=".pdf,.docx,.txt"
              disabled={uploading}
            />
            <span className="material-symbols-outlined text-4xl text-[#7c3aed] mb-2">cloud_upload</span>
            <p className="text-sm font-bold text-[#f0f0f5] mb-1">{uploading ? "Processing File..." : "Upload Document"}</p>
            <p className="text-[10px] text-[#a1a1aa]">PDF, DOCX, TXT (Max 10MB)</p>
          </div>
        </div>

        {/* Knowledge List */}
        <div className="bg-[#111118] rounded-2xl border border-[#2a2a3a] shadow-xl overflow-hidden">
          <div className="p-4 border-b border-[#2a2a3a] bg-[#1a1a25]/50">
             <h2 className="text-xs font-bold text-[#f0f0f5] uppercase tracking-wider">Current Training Data</h2>
          </div>
          <div className="divide-y divide-[#2a2a3a]">
            {items.length === 0 ? (
              <div className="p-12 text-center text-[#a1a1aa] text-sm italic">No knowledge items found. Add some above to train your AI.</div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="p-4 hover:bg-[#1a1a25] transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`material-symbols-outlined text-[16px] ${item.source_type === 'file' ? 'text-blue-400' : 'text-emerald-400'}`}>
                          {item.source_type === 'file' ? 'description' : 'notes'}
                        </span>
                        <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-tighter">
                          {item.source_type === 'file' ? (item.metadata?.filename || 'Document') : 'Text Entry'}
                        </span>
                      </div>
                      <p className="text-sm text-[#f0f0f5] line-clamp-2">{item.content}</p>
                    </div>
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="text-[#a1a1aa] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
