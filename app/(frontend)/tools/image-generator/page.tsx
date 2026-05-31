import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import ImageGenerator from "@/components/tools/ImageGenerator";

export const metadata: Metadata = {
  title: "Free AI Image Studio — Create, Restyle & Analyze | With Hammad",
  description:
    "Generate images from text, restyle your own photos (cartoon, anime, 3D & more), or get an AI creative breakdown of any image. Free and unlimited.",
  alternates: { canonical: "/tools/image-generator" },
};

export default function Page() {
  return (
    <ToolShell
      badge="Free · Unlimited"
      title="AI Image Studio"
      subtitle="Three tools in one: generate visuals from a prompt, upload a photo and restyle it (cartoon, anime, 3D, surreal…), or get an AI creative-director breakdown of any image."
    >
      <ImageGenerator />
    </ToolShell>
  );
}
