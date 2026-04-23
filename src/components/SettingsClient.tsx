"use client";

import { useState, useEffect } from "react";

export default function SettingsClient() {
  const [settings, setSettings] = useState({
    agent_name: "AgenticDM AI",
    system_prompt: "",
    auto_reply: true,
    handoff_threshold: 0.8
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings", {
          headers: { "ngrok-skip-browser-warning": "true" }
        });
        if (res.ok) {
          const data = await res.json();
          if (data) setSettings(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      alert("Settings saved!");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pt-4 md:pt-8 px-4 md:px-8 pb-12">
      <div className="max-w-3xl mx-auto py-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#f0f0f5]">Agent Settings</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">Configure your AI agent's personality and automation behavior.</p>
        </header>

        <div className="space-y-6">
          {/* General Config */}
          <div className="bg-[#111118] p-6 rounded-2xl border border-[#2a2a3a] shadow-xl">
            <h2 className="text-sm font-bold text-[#f0f0f5] uppercase tracking-wider mb-6 flex items-center gap-2">
               <span className="material-symbols-outlined text-[18px] text-[#7c3aed]">smart_toy</span>
               General Configuration
            </h2>
            
            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-[#a1a1aa] uppercase mb-2">Agent Name</label>
                  <input 
                    type="text" 
                    value={settings.agent_name}
                    onChange={(e) => setSettings({...settings, agent_name: e.target.value})}
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-[#f0f0f5] focus:border-[#7c3aed] outline-none transition-all"
                  />
               </div>
               
               <div>
                  <label className="block text-xs font-bold text-[#a1a1aa] uppercase mb-2">System Persona & Prompt</label>
                  <textarea 
                    value={settings.system_prompt}
                    onChange={(e) => setSettings({...settings, system_prompt: e.target.value})}
                    rows={6}
                    placeholder="Describe how the AI should behave..."
                    className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl px-4 py-3 text-sm text-[#f0f0f5] focus:border-[#7c3aed] outline-none transition-all resize-none"
                  />
                  <p className="text-[10px] text-[#a1a1aa] mt-2 italic">Tip: Include details about your portfolio, past projects, and preferred call-to-action.</p>
               </div>
            </div>
          </div>

          {/* Automation Logic */}
          <div className="bg-[#111118] p-6 rounded-2xl border border-[#2a2a3a] shadow-xl">
            <h2 className="text-sm font-bold text-[#f0f0f5] uppercase tracking-wider mb-6 flex items-center gap-2">
               <span className="material-symbols-outlined text-[18px] text-emerald-400">bolt</span>
               Automation Behavior
            </h2>

            <div className="flex items-center justify-between p-4 bg-[#0a0a0f] rounded-xl border border-[#2a2a3a]">
               <div>
                  <p className="text-sm font-bold text-[#f0f0f5]">Auto-Reply Enabled</p>
                  <p className="text-[10px] text-[#a1a1aa]">AI will respond automatically to incoming DMs</p>
               </div>
               <button 
                  onClick={() => setSettings({...settings, auto_reply: !settings.auto_reply})}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.auto_reply ? 'bg-[#7c3aed]' : 'bg-[#2a2a3a]'}`}
               >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.auto_reply ? 'left-7' : 'left-1'}`} />
               </button>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-[#7c3aed]/20 disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save All Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
