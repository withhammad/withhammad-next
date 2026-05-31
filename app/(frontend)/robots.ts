import type { MetadataRoute } from "next";

// AI / answer-engine crawlers we INTENTIONALLY allow for AEO (Answer Engine
// Optimization). We WANT With Hammad's content cited in AI answers, so these
// bots are explicitly permitted. The wildcard "*" rule below already allows
// them; the per-agent entries make that intent explicit and future-proof
// (so a later blanket block never silently catches them):
//   - GPTBot            → OpenAI (ChatGPT browsing / training)
//   - ClaudeBot         → Anthropic (Claude)
//   - PerplexityBot     → Perplexity
//   - Google-Extended   → Google Gemini / Vertex AI grounding
//   - Applebot-Extended → Apple Intelligence
//   - Bingbot           → Microsoft Bing / Copilot
const AI_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/api/"],
      })),
    ],
    sitemap: "https://withhammad.com/sitemap.xml",
    host: "https://withhammad.com",
  };
}
