import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import PromptGenerator from "@/components/tools/PromptGenerator";

export const metadata: Metadata = {
  title: "AI Marketing Prompt Generator (Free) | With Hammad",
  description:
    "Generate high-converting AI prompts for Google Ads, Meta Ads, SEO/AEO, email, and CRO. Pick a category, fill a few fields, and copy a ready-to-use prompt. Free, no login.",
  alternates: { canonical: "/tools/prompt-generator" },
};

export default function Page() {
  return (
    <ToolShell
      badge="Free · No login"
      title="AI Marketing Prompt Generator"
      subtitle="Pick a channel, fill in a few details, and get a ready-to-paste, high-quality prompt for ChatGPT, Claude, or Gemini."
    >
      <PromptGenerator />
    </ToolShell>
  );
}
