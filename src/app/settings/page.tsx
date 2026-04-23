"use client";

import dynamic from "next/dynamic";

const SettingsClient = dynamic(() => import("@/components/SettingsClient"), {
  ssr: false,
  loading: () => <div className="bg-[#0a0a0f] min-h-screen" />,
});

export default function SettingsPage() {
  return <SettingsClient />;
}
