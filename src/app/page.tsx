"use client";

import dynamic from "next/dynamic";

const DashboardClient = dynamic(() => import("@/components/DashboardClient"), {
  ssr: false,
  loading: () => <div className="bg-[#0a0a0f] min-h-screen" />,
});

export default function Dashboard() {
  return <DashboardClient />;
}
