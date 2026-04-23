"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", icon: "dashboard", href: "/", active: pathname === "/" },
    { label: "Messages", icon: "forum", href: "/messages", active: pathname === "/messages" },
    { label: "Automations", icon: "bolt", href: "#", active: false },
    { label: "Knowledge Base", icon: "database", href: "/knowledge", active: pathname === "/knowledge" },
    { label: "Settings", icon: "settings", href: "/settings", active: pathname === "/settings" },
  ];

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
              placeholder="Search..." 
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 text-[#a1a1aa]">
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
        <h1 className="text-lg font-bold text-slate-100 tracking-tight font-inter">AgenticDM</h1>
        <div className="flex items-center gap-2">
           <Link href="/messages" className="text-slate-400 p-2">
             <span className="material-symbols-outlined text-[24px]">forum</span>
           </Link>
        </div>
      </header>

      {/* Desktop SideNavBar */}
      <aside className="fixed left-0 top-0 h-screen flex flex-col pt-20 pb-6 px-4 bg-[#111118] border-r border-[#2a2a3a] w-[240px] font-inter text-xs font-medium uppercase tracking-wider hidden md:flex z-40">
        <div className="flex flex-col gap-1 flex-1 mt-6">
          {navItems.map((item) => (
            <Link 
              key={item.label}
              href={item.href} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${item.active ? 'bg-[#7c3aed]/10 text-[#7c3aed] border-r-2 border-[#7c3aed]' : 'text-[#a1a1aa] hover:bg-[#1a1a25] hover:text-[#f0f0f5]'}`}
            >
              <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: item.active ? "'FILL' 1" : undefined}}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </aside>

      <main className="md:ml-[240px] pt-16 md:h-screen flex flex-col overflow-hidden flex-1">
        {children}
      </main>

      {/* Mobile BottomNavBar */}
      <nav className="fixed bottom-0 w-full z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.3)] border-t border-[#2a2a3a] bg-[#111118]/90 backdrop-blur-lg flex justify-around items-center h-16 px-2 md:hidden">
        {navItems.filter(item => item.href !== "#").map((item) => (
          <Link 
            key={item.label}
            className={`flex flex-col items-center justify-center w-16 ${item.active ? 'text-[#7c3aed]' : 'text-slate-500'}`} 
            href={item.href}
          >
            <span className="material-symbols-outlined text-[24px] mb-1" style={{fontVariationSettings: item.active ? "'FILL' 1" : undefined}}>
              {item.icon}
            </span>
            <span className="font-inter text-[10px] font-medium">{item.label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
