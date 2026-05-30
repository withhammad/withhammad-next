import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import AdCopyWriter from "@/components/tools/AdCopyWriter";

export const metadata: Metadata = {
  title: "AI Ad Copy Writer (Free) | With Hammad",
  description:
    "Generate high-converting ad headlines and descriptions for Google, Meta, LinkedIn, and TikTok from your product, audience, and offer. Free, streamed live.",
  alternates: { canonical: "/tools/ad-copy-writer" },
};

export default function Page() {
  return (
    <ToolShell
      badge="Free · AI"
      title="AI Ad Copy Writer"
      subtitle="Describe your product, audience, and offer — get scroll-stopping headlines and descriptions, written and streamed live."
    >
      <AdCopyWriter />
    </ToolShell>
  );
}
