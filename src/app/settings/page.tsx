"use client";

import dynamic from "next/dynamic";
import Shell from "@/components/Shell";

const SettingsClient = dynamic(() => import("@/components/SettingsClient"), {
  ssr: false,
});

export default function SettingsPage() {
  return (
    <Shell>
      <SettingsClient />
    </Shell>
  );
}
