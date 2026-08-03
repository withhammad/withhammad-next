// ---------------------------------------------------------------------------
// Single source of truth for Hammad's public identity.
//
// These URLs previously lived hardcoded in five places (homepage Person LD,
// /contact, /portfolio, FinalCTA, Footer) and had drifted: four used
// `in/hammadyousuf` while /portfolio used `in/withhammad`. Conflicting `sameAs`
// across pages actively harms entity resolution in search, so everything now
// reads from here. `in/withhammad` is authoritative — it is what his CV and
// LinkedIn profile export both state.
// ---------------------------------------------------------------------------

export const LINKEDIN_URL = "https://www.linkedin.com/in/withhammad";
export const LINKEDIN_HANDLE = "in/withhammad";
export const YOUTUBE_URL = "https://www.youtube.com/@with.hammad";
export const YOUTUBE_HANDLE = "@with.hammad";
export const INSTAGRAM_URL = "https://www.instagram.com/withhammad";
export const GITHUB_URL = "https://github.com/withhammad";

export const EMAIL = "marketing@withhammad.com";
export const SITE_URL = "https://withhammad.com";

/** schema.org `sameAs` — keep every page pointing at the same profile set. */
export const PERSON_SAME_AS = [
  YOUTUBE_URL,
  LINKEDIN_URL,
  INSTAGRAM_URL,
  GITHUB_URL,
] as const;

export const JOB_TITLE = "AI Marketing Automation Engineer";

export const PERSON_ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: "Dubai",
  addressCountry: "AE",
} as const;
