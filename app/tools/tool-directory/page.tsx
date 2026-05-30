import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import ToolDirectory from "@/components/tools/ToolDirectory";

export const metadata: Metadata = {
  title: "AI Tools Directory for Marketers (Free) | With Hammad",
  description:
    "A curated, filterable directory of the AI tools I recommend for marketers — across writing, image, automation, analytics, and SEO. Free, no login.",
  alternates: { canonical: "/tools/tool-directory" },
};

export default function Page() {
  return (
    <ToolShell
      badge="Free · No login"
      title="AI Tools Directory for Marketers"
      subtitle="A hand-picked set of AI tools I actually recommend — filter by category or search to find the right one for the job."
    >
      <ToolDirectory />
    </ToolShell>
  );
}
