"use client";

import { useState } from "react";
import Link from "next/link";

export default function SettingsClient() {
  const [autopilot, setAutopilot] = useState(true);
  const [model, setModel] = useState("gpt-4o");
  const [temperature, setTemperature] = useState(0.7);

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-[#f0f0f5] font-inter antialiased flex flex-col pb-20 md:pb-0">
      {/* Desktop TopNavBar */}
      <nav className="fixed top-0 w-full z-50 hidden md:flex items-center justify-between px-6 h-16 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#2a2a3a] shadow-[0_0_20px_rgba(124,58,237,0.05)]">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold tracking-tight text-[#f0f0f5]">AgenticDM</span>
        </div>
        <div className="flex-1 flex justify-center max-w-xl px-4">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] text-[18px]">search</span>
            <input className="w-full bg-[#111118] border border-[#2a2a3a] rounded-lg pl-10 pr-4 py-2 text-[#f0f0f5] focus:outline-none focus:border-primary-container focus:shadow-[0_0_20px_rgba(124,58,237,0.15)] transition-all duration-200 text-sm" placeholder="Search..." type="text"/>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[#a1a1aa]">
          <Link href="/settings" className="text-[#7c3aed] font-semibold transition-colors duration-200 active:scale-95">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>settings</span>
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
        <h1 className="text-lg font-bold text-slate-100 tracking-tight font-inter">Settings</h1>
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
          <Link href="/knowledge" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#a1a1aa] hover:bg-[#1a1a25] hover:text-[#f0f0f5] transition-all">
            <span className="material-symbols-outlined text-[18px]">database</span>
            <span>Knowledge Base</span>
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-[#7c3aed]/10 text-[#7c3aed] border-r-2 border-[#7c3aed] transition-all">
            <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>settings</span>
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-[240px] pt-16 md:pt-24 px-4 md:px-8 pb-12 flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto py-6 md:py-0">
          <header className="mb-8 hidden md:block">
            <h1 className="text-3xl font-bold text-[#f0f0f5] mb-2">Settings</h1>
            <p className="text-[#a1a1aa]">Manage your AI agent configurations, team access, and integrations.</p>
          </header>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Settings Sidebar Layout */}
            <nav className="w-full lg:w-48 shrink-0 flex md:flex-col overflow-x-auto gap-1 pb-4 md:pb-0 scrollbar-hide">
              <a className="whitespace-nowrap px-4 md:px-3 py-2 rounded-md text-sm text-[#a1a1aa] hover:text-[#f0f0f5] hover:bg-[#111118] transition-colors" href="#">Profile</a>
              <a className="whitespace-nowrap px-4 md:px-3 py-2 rounded-md text-sm text-[#7c3aed] bg-[#111118] font-medium" href="#">AI Config</a>
              <a className="whitespace-nowrap px-4 md:px-3 py-2 rounded-md text-sm text-[#a1a1aa] hover:text-[#f0f0f5] hover:bg-[#111118] transition-colors" href="#">Webhooks</a>
              <a className="whitespace-nowrap px-4 md:px-3 py-2 rounded-md text-sm text-[#a1a1aa] hover:text-[#f0f0f5] hover:bg-[#111118] transition-colors" href="#">Team</a>
            </nav>

            {/* Settings Content Area */}
            <div className="flex-1 space-y-8">
              {/* AI Configuration Section */}
              <section className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-6 shadow-xl">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-[#f0f0f5] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#7c3aed] text-[20px]">smart_toy</span>
                    AI Configuration
                  </h2>
                  <p className="text-sm text-[#a1a1aa] mt-1">Fine-tune the behavior and model of your DM agent.</p>
                </div>
                <div className="space-y-6">
                  {/* Toggle */}
                  <div className="flex items-center justify-between py-2 border-b border-[#2a2a3a]">
                    <div>
                      <label className="text-sm text-[#f0f0f5] font-medium block">Auto-Pilot Mode</label>
                      <span className="text-xs text-[#a1a1aa]">Allow AI to respond autonomously.</span>
                    </div>
                    <button 
                      onClick={() => setAutopilot(!autopilot)}
                      aria-checked={autopilot} 
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${autopilot ? 'bg-[#7c3aed]' : 'bg-[#2a2a3a]'}`} 
                      role="switch"
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${autopilot ? 'translate-x-6' : 'translate-x-1'}`}></span>
                    </button>
                  </div>
                  {/* Dropdown */}
                  <div>
                    <label className="text-sm text-[#f0f0f5] font-medium block mb-2">AI Model</label>
                    <div className="relative">
                      <select 
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full appearance-none bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-[#f0f0f5] focus:outline-none focus:border-[#7c3aed] transition-all"
                      >
                        <option value="gpt-4o">GPT-4o (Recommended)</option>
                        <option value="claude-3-5">Claude 3.5 Sonnet</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  {/* Slider */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-[#f0f0f5] font-medium block">Creativity</label>
                      <span className="font-mono text-xs text-[#7c3aed] bg-[#7c3aed]/10 px-2 py-0.5 rounded">{temperature}</span>
                    </div>
                    <input 
                      className="w-full h-1 bg-[#2a2a3a] rounded-lg appearance-none cursor-pointer accent-[#7c3aed]" 
                      max="1" min="0" step="0.1" type="range" 
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    />
                    <div className="flex justify-between mt-2 text-[10px] text-[#a1a1aa]">
                      <span>PRECISE</span>
                      <span>CREATIVE</span>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button className="w-full md:w-auto bg-[#7c3aed] text-white text-sm px-8 py-2.5 rounded-xl font-semibold hover:bg-[#6d28d9] transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                      Save Changes
                    </button>
                  </div>
                </div>
              </section>

              {/* Webhooks Section */}
              <section className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-6 shadow-xl">
                <div className="mb-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-[#f0f0f5] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#7c3aed] text-[20px]">webhook</span>
                      Webhooks
                    </h2>
                    <p className="text-sm text-[#a1a1aa] mt-1">Connect your DM events.</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Live
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl p-4">
                    <label className="text-xs text-[#a1a1aa] block mb-1">Webhook URL</label>
                    <div className="flex items-center justify-between overflow-hidden gap-2">
                      <code className="font-mono text-[10px] md:text-xs text-[#f0f0f5] truncate">https://api.agenticdm.com/hooks/v1/dm-event</code>
                      <button className="text-[#a1a1aa] hover:text-[#7c3aed] flex-shrink-0">
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
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
        <Link className="flex flex-col items-center justify-center text-slate-500 w-16" href="/knowledge">
          <span className="material-symbols-outlined text-[24px] mb-1">database</span>
          <span className="font-inter text-[10px] font-medium">Knowledge</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-violet-400 w-16" href="/settings">
          <span className="material-symbols-outlined text-[24px] mb-1" style={{fontVariationSettings: "'FILL' 1"}}>settings</span>
          <span className="font-inter text-[10px] font-medium">Settings</span>
        </Link>
      </nav>
    </div>
  );
}
