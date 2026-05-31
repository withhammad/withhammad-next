// Trim a string to `max` chars on a word boundary (never mid-word) for clean
// meta descriptions. Adds an ellipsis only when it actually truncates.
export function clamp(s: string, max = 156): string {
  const str = s.trim();
  if (str.length <= max) return str;
  const cut = str.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  return base.replace(/[\s.,;:—–-]+$/, "") + "…";
}
