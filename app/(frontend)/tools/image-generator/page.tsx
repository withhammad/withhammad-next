import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import ImageGenerator from "@/components/tools/ImageGenerator";

export const metadata: Metadata = {
  title: "AI Image Generator for Marketers (Free) | With Hammad",
  description:
    "Turn a text prompt into on-brand marketing visuals. Free with a quick email unlock — choose your aspect ratio and generate.",
  alternates: { canonical: "/tools/image-generator" },
};

export default function Page() {
  return (
    <ToolShell
      badge="Free · Email unlock"
      title="AI Image Generator"
      subtitle="Describe what you need and generate on-brand marketing visuals in seconds. Free with a quick email unlock."
    >
      <ImageGenerator />
    </ToolShell>
  );
}
