"use client";

import dynamic from "next/dynamic";
import Shell from "@/components/Shell";

const DashboardClient = dynamic(() => import("@/components/DashboardClient"), {
  ssr: false,
});

export default function Dashboard() {
  return (
    <Shell>
      <DashboardClient />
    </Shell>
  );
}
