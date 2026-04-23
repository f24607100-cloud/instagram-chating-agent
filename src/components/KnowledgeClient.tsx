"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function KnowledgeClient() {
  const [content, setContent] = useState("");
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchKnowledge = async () => {
    try {
      const res = await fetch("/api/knowledge");
      const data = await res.json();
      if (Array.isArray(data)) {
        setKnowledge(data);
      } else {
        setKnowledge([]);
      }
    } catch (err) {
      console.error(err);
      setKnowledge([]);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setContent("");
        fetchKnowledge();
      }
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
        alert("File processed and added to knowledge base!");
        fetchKnowledge();
      } else {
        const error = await res.json();
        alert(`Upload failed: ${error.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch("/api/knowledge", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchKnowledge();
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-[#f0f0f5] font-inter antialiased flex flex-col pb-20 md:pb-0">
      {/* Desktop TopNavBar */}
      <nav className="fixed top-0 w-full z-50 hidden md:flex items-center justify-between px-6 h-16 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#2a2a3a] shadow-[0_0_20px_rgba(124,58,237,0.05)]">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold tracking-tight text-[#f0f0f5]">AgenticDM</span>
        </div>
        <div className="flex items-center gap-4 text-[#a1a1aa]">
          <Link href="/" className="hover:text-[#f0f0f5] transition-colors duration-200 active:scale-95">
            <span className="material-symbols-outlined">dashboard</span>
          </Link>
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
        <Link href="/" className="text-slate-400 hover:text-white transition-colors p-2 -ml-2">
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </Link>
        <h1 className="text-lg font-bold text-slate-100 tracking-tight font-inter">Knowledge Base</h1>
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
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#a1a1aa] hover:bg-[#1a1a25] hover:text-[#f0f0f5] transition-all">
            <span className="material-symbols-outlined text-[18px]">forum</span>
            <span>Messages</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#a1a1aa] hover:bg-[#1a1a25] hover:text-[#f0f0f5] transition-all">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>Automations</span>
          </Link>
          <Link href="/knowledge" className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-[#7c3aed]/10 text-[#7c3aed] border-r-2 border-[#7c3aed] transition-all">
            <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>database</span>
            <span>Knowledge Base</span>
          </Link>
        </div>
      </aside>

      <main className="md:ml-[240px] pt-16 md:pt-24 px-4 md:px-8 pb-12 flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-6 md:py-0">
          <header className="mb-8 hidden md:block">
            <h1 className="text-2xl font-bold tracking-tight text-[#f0f0f5] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7c3aed]">database</span>
              Knowledge Base (RAG)
            </h1>
            <p className="text-sm text-[#a1a1aa] mt-1">Teach your AI agent about your portfolio, past projects, and technical skills.</p>
          </header>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Text Input Card */}
            <form onSubmit={handleSubmit} className="bg-[#111118] p-6 rounded-2xl border border-[#2a2a3a] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#7c3aed]"></div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#f0f0f5] mb-4">Add Text Context</h2>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste technical details, portfolio info, or project experience here..."
                className="w-full h-40 bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl p-4 text-sm text-[#f0f0f5] focus:outline-none focus:border-[#7c3aed] transition-all mb-4"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !content}
                  className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white px-8 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                >
                  {loading ? "Processing..." : "Train Agent"}
                </button>
              </div>
            </form>

            {/* File Upload Card */}
            <div className="bg-[#111118] p-6 rounded-2xl border border-[#2a2a3a] shadow-2xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#3b82f6]"></div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#f0f0f5] mb-4">Upload Documents</h2>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 border-2 border-dashed border-[#2a2a3a] rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5 transition-all group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".pdf,.txt,.docx"
                />
                <span className="material-symbols-outlined text-4xl text-[#a1a1aa] group-hover:text-[#3b82f6] transition-colors mb-2">cloud_upload</span>
                <p className="text-sm text-[#f0f0f5] font-medium">Click or drag to upload</p>
                <p className="text-[10px] text-[#a1a1aa] mt-1 text-center">Supported formats: PDF, DOCX, TXT<br/>Max size: 10MB</p>
              </div>
              {uploading && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-blue-400 font-medium">Extracting and vectorizing content...</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a1a1aa] mb-4">Stored Knowledge</h2>
            {knowledge.length === 0 ? (
              <div className="text-center p-12 bg-[#111118]/50 rounded-2xl border border-[#2a2a3a] border-dashed">
                 <p className="text-[#a1a1aa] text-sm italic">No knowledge stored yet.</p>
              </div>
            ) : (
              knowledge.map((k) => (
                <div key={k.id} className="bg-[#111118] p-5 rounded-2xl border border-[#2a2a3a] flex justify-between gap-4 group hover:border-[#7c3aed]/50 transition-all">
                  <div className="flex-1">
                    <p className="text-sm text-[#f0f0f5] leading-relaxed whitespace-pre-wrap line-clamp-3">{k.content}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[10px] text-[#a1a1aa] bg-[#0a0a0f] px-2 py-1 rounded-md">Vector Optimized</span>
                      <span className="text-[10px] text-[#a1a1aa]" suppressHydrationWarning>
                        Added {new Date(k.created_at).toLocaleDateString()}
                      </span>
                      {k.metadata?.filename && (
                        <span className="text-[10px] text-blue-400 font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">description</span>
                          {k.metadata.filename}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(k.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors self-start p-1"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Mobile BottomNavBar */}
      <nav className="fixed bottom-0 w-full z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.3)] border-t border-[#2a2a3a] bg-[#111118]/90 backdrop-blur-lg flex justify-around items-center h-16 px-2 md:hidden">
        <Link className="flex flex-col items-center justify-center text-slate-500 w-16" href="/">
          <span className="material-symbols-outlined text-[24px] mb-1">dashboard</span>
          <span className="font-inter text-[10px] font-medium">Home</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-slate-500 w-16" href="/">
          <span className="material-symbols-outlined text-[24px] mb-1">forum</span>
          <span className="font-inter text-[10px] font-medium">Messages</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-violet-400 w-16" href="/knowledge">
          <span className="material-symbols-outlined text-[24px] mb-1" style={{fontVariationSettings: "'FILL' 1"}}>database</span>
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
