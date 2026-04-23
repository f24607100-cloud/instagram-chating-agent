"use client";

import dynamic from "next/dynamic";
import Shell from "@/components/Shell";

const KnowledgeClient = dynamic(() => import("@/components/KnowledgeClient"), {
  ssr: false,
});

export default function KnowledgePage() {
  return (
    <Shell>
      <KnowledgeClient />
    </Shell>
  );
}
