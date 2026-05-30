// Curated directory of AI tools for marketers. Add entries here — the directory
// page renders straight from this array and derives its category filters from it.

export type DirectoryCategory =
  | "writing"
  | "image"
  | "automation"
  | "analytics"
  | "seo";

export interface DirectoryTool {
  name: string;
  category: DirectoryCategory;
  useCase: string;
  link: string;
}

export const DIRECTORY_CATEGORIES: {
  id: DirectoryCategory;
  label: string;
}[] = [
  { id: "writing", label: "Writing" },
  { id: "image", label: "Image" },
  { id: "automation", label: "Automation" },
  { id: "analytics", label: "Analytics" },
  { id: "seo", label: "SEO" },
];

export const DIRECTORY_TOOLS: DirectoryTool[] = [
  // Writing
  {
    name: "ChatGPT",
    category: "writing",
    useCase: "All-round copy, brainstorming, and content drafting.",
    link: "https://chat.openai.com",
  },
  {
    name: "Claude",
    category: "writing",
    useCase: "Long-form writing and analysis with strong reasoning.",
    link: "https://claude.ai",
  },
  {
    name: "Jasper",
    category: "writing",
    useCase: "Brand-tuned marketing copy produced at scale.",
    link: "https://www.jasper.ai",
  },
  {
    name: "Copy.ai",
    category: "writing",
    useCase: "Fast ad, email, and social copy from templates.",
    link: "https://www.copy.ai",
  },
  {
    name: "Writesonic",
    category: "writing",
    useCase: "SEO articles and ad copy with built-in research.",
    link: "https://writesonic.com",
  },
  // Image
  {
    name: "Midjourney",
    category: "image",
    useCase: "Best-in-class artistic image generation.",
    link: "https://www.midjourney.com",
  },
  {
    name: "Ideogram",
    category: "image",
    useCase: "AI images with reliable, legible text.",
    link: "https://ideogram.ai",
  },
  {
    name: "Flux",
    category: "image",
    useCase: "High-fidelity open image models (Black Forest Labs).",
    link: "https://blackforestlabs.ai",
  },
  {
    name: "Canva Magic Studio",
    category: "image",
    useCase: "On-brand graphics and quick AI edits for marketers.",
    link: "https://www.canva.com/magic-studio/",
  },
  {
    name: "Adobe Firefly",
    category: "image",
    useCase: "Commercially-safe generative imagery and edits.",
    link: "https://www.adobe.com/products/firefly.html",
  },
  // Automation
  {
    name: "Zapier",
    category: "automation",
    useCase: "Connect apps and automate marketing workflows.",
    link: "https://zapier.com",
  },
  {
    name: "Make",
    category: "automation",
    useCase: "Visual, branching automations for complex flows.",
    link: "https://www.make.com",
  },
  {
    name: "n8n",
    category: "automation",
    useCase: "Open-source, self-hostable workflow automation.",
    link: "https://n8n.io",
  },
  {
    name: "Lindy",
    category: "automation",
    useCase: "AI agents that handle repetitive ops tasks.",
    link: "https://www.lindy.ai",
  },
  // Analytics
  {
    name: "Google Analytics 4",
    category: "analytics",
    useCase: "Free web and funnel analytics with AI insights.",
    link: "https://analytics.google.com",
  },
  {
    name: "Triple Whale",
    category: "analytics",
    useCase: "Ecommerce attribution and profit dashboards.",
    link: "https://www.triplewhale.com",
  },
  {
    name: "Mixpanel",
    category: "analytics",
    useCase: "Product and funnel analytics with AI querying.",
    link: "https://mixpanel.com",
  },
  {
    name: "Pecan AI",
    category: "analytics",
    useCase: "Predictive analytics (churn, LTV) without a data team.",
    link: "https://www.pecan.ai",
  },
  // SEO
  {
    name: "Surfer SEO",
    category: "seo",
    useCase: "Optimise content against top-ranking pages.",
    link: "https://surferseo.com",
  },
  {
    name: "Ahrefs",
    category: "seo",
    useCase: "Backlinks, keyword research, and site audits.",
    link: "https://ahrefs.com",
  },
  {
    name: "Semrush",
    category: "seo",
    useCase: "All-in-one SEO, PPC, and competitor research.",
    link: "https://www.semrush.com",
  },
  {
    name: "Frase",
    category: "seo",
    useCase: "AI content briefs and SERP research.",
    link: "https://www.frase.io",
  },
];
