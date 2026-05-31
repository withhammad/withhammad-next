import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import ImageGenerator from "@/components/tools/ImageGenerator";

export const metadata: Metadata = {
  title: "Free AI Image Studio — Create, Restyle, Analyze & Caption | With Hammad",
  description:
    "Generate images from text, restyle your photos (cartoon, anime, 3D & 15+ styles), get an AI creative breakdown, or auto-write captions, hashtags & ad copy. Free and unlimited.",
  alternates: { canonical: "/tools/image-generator" },
};

export default function Page() {
  return (
    <ToolShell
      badge="Free · Unlimited"
      title="AI Image Studio"
      subtitle="Four tools in one: generate visuals from a prompt (with a ✨ prompt enhancer), upload a photo and restyle it across 16 looks, get an AI creative-director breakdown, or auto-write platform-ready captions, hashtags and ad copy."
    >
      <ImageGenerator />
    </ToolShell>
  );
}
