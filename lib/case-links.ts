// ---------------------------------------------------------------------------
// Public proof links per project — safe, shareable URLs only (live demos,
// LinkedIn posts, on-site write-ups). Never system access, dashboards, or
// credentials. Rendered as HUD buttons wherever a project appears.
//
// "TODO" links render with a dev-only warning badge; null links are hidden.
// Fill every TODO from LINKS-TODO.md before launch.
// ---------------------------------------------------------------------------

export type CaseLink = {
  demo?: string | null;
  linkedin?: string | null;
  writeup?: string | null;
  youtube?: string | null;
};

export const caseLinks: Record<string, CaseLink> = {
  jarvis: { demo: "TODO", linkedin: "TODO", writeup: "/projects/jarvis" },
  ibrahim: { demo: "TODO", linkedin: "TODO", writeup: "/projects/ibrahim" },
  adam: { demo: "TODO_VERCEL_URL", linkedin: "TODO", writeup: "/projects/adam" },
  atlas: { demo: "TODO", linkedin: "TODO", writeup: "/projects/atlas" },
  googleads: { demo: null, linkedin: "TODO", writeup: "/projects/google-ads-agent" },
  linkedinsys: { demo: null, linkedin: "TODO", writeup: "/projects/linkedin-automation" },
  mediaforge: { demo: "TODO", linkedin: "TODO", writeup: "/projects/mediaforge" },
  seosquad: { demo: null, linkedin: "TODO", writeup: "/projects/claude-seo-squad" },
  profile: {
    linkedin: "https://www.linkedin.com/in/withhammad",
    youtube: "https://www.youtube.com/@with.hammad",
  },
};

export const isTodo = (v?: string | null): boolean =>
  typeof v === "string" && v.startsWith("TODO");

/** Real, renderable URL (hides both null and unfilled TODOs in production). */
export const liveLink = (v?: string | null): string | null =>
  v && !isTodo(v) ? v : null;
