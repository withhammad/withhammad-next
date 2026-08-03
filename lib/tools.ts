// Data for the /tools hub. Add or edit tools here — the hub renders from these
// arrays, so no JSX changes are needed to add a new card.

export type ToolIconName =
  | "calculator"
  | "citation"
  | "audit"
  | "prompt"
  | "directory"
  | "adcopy"
  | "image";

export interface ToolCard {
  name: string;
  description: string;
  href: string;
  external?: boolean;
  badge?: string;
  duration?: string;
  accent?: "cool" | "amber";
  icon?: ToolIconName;
}

// The existing GCC marketing tools — currently live on the WordPress site.
// (Linking out for now; can be rebuilt natively later.)
export const GCC_TOOLS: ToolCard[] = [
  {
    name: "GCC Ad Spend Calculator",
    description:
      "Convert US/EU budgets to AED with platform-specific CPM benchmarks.",
    href: "https://withhammad.com/free-tools/ad-spend-calculator/",
    external: true,
    badge: "Calculator",
    duration: "~60 sec",
    icon: "calculator",
  },
  {
    name: "GEO Citation Checker",
    description:
      "See if Perplexity and AI engines cite your URL — and get a fix list.",
    href: "https://withhammad.com/free-tools/geo-citation-checker/",
    external: true,
    badge: "AEO",
    duration: "~90 sec",
    icon: "citation",
  },
  {
    name: "AI Marketing Stack Audit",
    description:
      "A 5-question quiz that emails you a personalised, AI-generated report.",
    href: "https://withhammad.com/free-tools/marketing-stack-audit/",
    external: true,
    badge: "Audit",
    duration: "~2 min",
    icon: "audit",
  },
];

// The new AI tools — built natively in this site.
export const AI_TOOLS: ToolCard[] = [
  {
    name: "AI Ads Audit — Google + Meta",
    description:
      "Paste your campaign snapshot and get a 0-100 Ads Health Score, critical issues, and quick wins — the same framework I run on $999/mo client accounts.",
    href: "/tools/ai-ads-audit",
    badge: "Free · AI",
    accent: "amber",
    icon: "audit",
  },
  {
    name: "AI Marketing Prompt Generator",
    description:
      "Build high-converting prompts for Google Ads, Meta, SEO, email and CRO. Pick a goal, fill the blanks, copy.",
    href: "/tools/prompt-generator",
    badge: "Free · No login",
    accent: "cool",
    icon: "prompt",
  },
  {
    name: "AI Tools Directory for Marketers",
    description:
      "A curated, filterable directory of the AI tools I actually recommend — by category, with a one-line use case for each.",
    href: "/tools/tool-directory",
    badge: "Free · No login",
    accent: "cool",
    icon: "directory",
  },
  {
    name: "AI Ad Copy Writer",
    description:
      "Generate scroll-stopping ad headlines and descriptions from your product, audience and offer — streamed live.",
    href: "/tools/ad-copy-writer",
    badge: "Free · AI",
    accent: "amber",
    icon: "adcopy",
  },
  {
    name: "AI Image Generator",
    description:
      "Turn a text prompt into on-brand marketing visuals. Free with a quick email unlock.",
    href: "/tools/image-generator",
    badge: "Free · Email unlock",
    accent: "amber",
    icon: "image",
  },
];
