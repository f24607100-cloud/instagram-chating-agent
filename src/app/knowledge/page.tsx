"use client";

import dynamic from "next/dynamic";

const KnowledgeClient = dynamic(() => import("@/components/KnowledgeClient"), {
  ssr: false,
  loading: () => <div className="bg-[#0a0a0f] min-h-screen" />,
});

export default function KnowledgePage() {
  return <KnowledgeClient />;
}
