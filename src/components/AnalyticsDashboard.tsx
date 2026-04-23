"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";

type Stats = {
  totalMessages: number;
  leadsCaptured: number;
  handoffRate: string;
  totalHandoffs: number;
  totalConversations: number;
  dailyStats: { name: string; messages: number }[];
  topClients: { name: string; value: number }[];
};

const COLORS = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/analytics/stats", {
           cache: "no-store",
           headers: { "ngrok-skip-browser-warning": "true" }
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pt-4 md:pt-8 px-4 md:px-8 pb-12">
      <div className="max-w-7xl mx-auto py-6">
        <header className="mb-8 hidden md:block">
          <h1 className="text-3xl font-bold tracking-tight text-[#f0f0f5]">Welcome back, Awais!</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">Here is a summary of your agent's performance this week.</p>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Messages", value: stats?.totalMessages, icon: "chat", color: "text-[#7c3aed]" },
            { label: "Leads Captured", value: stats?.leadsCaptured, icon: "trending_up", color: "text-emerald-400" },
            { label: "Handoff Rate", value: stats?.handoffRate, icon: "human_bubble", color: "text-amber-400" },
            { label: "Active Convos", value: stats?.totalConversations, icon: "groups", color: "text-blue-400" }
          ].map((card, i) => (
            <div key={i} className="bg-[#111118] p-5 rounded-2xl border border-[#2a2a3a] shadow-xl hover:border-[#7c3aed]/50 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className={`material-symbols-outlined ${card.color} text-[20px]`}>{card.icon}</span>
                <span className="text-[10px] text-emerald-400 font-bold">+12%</span>
              </div>
              <p className="text-[10px] text-[#a1a1aa] font-bold uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold text-[#f0f0f5] mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Growth Chart */}
          <div className="md:col-span-2 bg-[#111118] p-6 rounded-3xl border border-[#2a2a3a] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#f0f0f5]">Message Activity</h2>
                <p className="text-xs text-[#a1a1aa]">Daily message volume for the last 7 days</p>
              </div>
              <div className="flex gap-2">
                 <span className="text-[10px] bg-[#7c3aed]/10 text-[#7c3aed] px-2 py-1 rounded-md font-bold uppercase tracking-widest">Live</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.dailyStats || []}>
                  <defs>
                    <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#a1a1aa" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(str) => str.split("-").slice(1).join("/")}
                  />
                  <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111118", border: "1px solid #2a2a3a", borderRadius: "12px", fontSize: "12px" }}
                    itemStyle={{ color: "#7c3aed" }}
                  />
                  <Area type="monotone" dataKey="messages" stroke="#7c3aed" fillOpacity={1} fill="url(#colorMsg)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Clients Breakdown */}
          <div className="bg-[#111118] p-6 rounded-3xl border border-[#2a2a3a] shadow-2xl flex flex-col">
            <h2 className="text-lg font-bold text-[#f0f0f5] mb-1">Top Clients</h2>
            <p className="text-xs text-[#a1a1aa] mb-6">Most engaged conversations</p>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.topClients || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats?.topClients?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ backgroundColor: "#111118", border: "1px solid #2a2a3a", borderRadius: "12px", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 space-y-3">
                {stats?.topClients?.map((client, i) => (
                  <div key={i} className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                       <span className="text-xs text-[#f0f0f5] truncate max-w-[120px]">{client.name}</span>
                     </div>
                     <span className="text-xs font-bold text-[#a1a1aa]">{client.value} msgs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Handoff Comparison Bar Chart */}
        <div className="mt-8 bg-[#111118] p-6 rounded-3xl border border-[#2a2a3a] shadow-2xl overflow-hidden">
           <div className="flex items-center justify-between mb-8">
             <h2 className="text-lg font-bold text-[#f0f0f5]">Mode Distribution</h2>
             <div className="text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full font-bold">Optimal Performance</div>
           </div>
           <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between mb-2">
                       <span className="text-xs font-bold text-[#a1a1aa]">AI AUTOMATION</span>
                       <span className="text-xs font-bold text-[#7c3aed]">88%</span>
                    </div>
                    <div className="w-full h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                       <div className="h-full bg-[#7c3aed] w-[88%]" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between mb-2">
                       <span className="text-xs font-bold text-[#a1a1aa]">HUMAN INTERVENTION</span>
                       <span className="text-xs font-bold text-amber-400">12%</span>
                    </div>
                    <div className="w-full h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                       <div className="h-full bg-amber-400 w-[12%]" />
                    </div>
                 </div>
                 <p className="text-xs text-[#a1a1aa] leading-relaxed">
                   Your AI agent is currently handling 88% of all incoming inquiries without human help. 
                   This is 5% higher than last week. Great job!
                 </p>
              </div>
              <div className="h-[180px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{name: 'Efficiency', ai: 88, human: 12}]}>
                       <Bar dataKey="ai" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={40} />
                       <Bar dataKey="human" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
                       <Tooltip cursor={{fill: 'transparent'}} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
