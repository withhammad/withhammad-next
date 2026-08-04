// `npm run calendar` — regenerates content-calendar.md from lib/content-briefs.ts.
//
// The briefs are the source of truth (the draft pipeline reads them); this doc
// is the human-facing view. Generating it means the two can never drift.
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync("lib/content-briefs.ts", "utf8");

// Parse the TS literal without importing it (no TS runtime needed here).
const blocks = src.split(/\n  \{\n/).slice(1);
const briefs = blocks.map((b) => {
  const one = (k) => (b.match(new RegExp(`${k}:\\s*\\n?\\s*"([^"]+)"`)) || [])[1] || "";
  const many = (k) => {
    const m = b.match(new RegExp(`${k}:\\s*\\[([\\s\\S]*?)\\]`));
    return m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [];
  };
  return {
    id: one("id"),
    workingTitle: one("workingTitle"),
    targetKeyword: one("targetKeyword"),
    intent: one("intent"),
    angle: one("angle"),
    mustCover: many("mustCover"),
    internalLinks: many("internalLinks"),
    cta: one("cta"),
  };
}).filter((b) => b.id);

const clusters = (() => {
  const m = src.match(/KEYWORD_CLUSTERS = \{([\s\S]*?)\} as const;/);
  return m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [];
})();

const lines = [];
lines.push("# Content calendar\n");
lines.push("> Generated from `lib/content-briefs.ts` by `npm run calendar`. Edit the briefs, not this file.\n");
lines.push(`**${briefs.length} briefs** across the target keyword clusters. Every topic stays in the AI / marketing / automation lane — the YouTube channel is never a post subject.\n`);
lines.push("## Keyword clusters\n");
lines.push(clusters.map((c) => `- ${c}`).join("\n") + "\n");
lines.push("## How to publish one\n");
lines.push("```bash\nnpm run dev                     # the pipeline posts to the running app\nnpm run draft -- --brief=<id>    # writes an UNPUBLISHED draft into Payload\n```");
lines.push("Then review in `/admin` and press **Publish**. Nothing reaches `/blog` until you do.\n");
lines.push("## Briefs\n");
lines.push("| # | Brief id | Target keyword | Intent |");
lines.push("|---|---|---|---|");
briefs.forEach((b, i) => lines.push(`| ${i + 1} | \`${b.id}\` | ${b.targetKeyword} | ${b.intent} |`));
lines.push("");

briefs.forEach((b, i) => {
  lines.push(`### ${i + 1}. ${b.workingTitle}\n`);
  lines.push(`- **id** \`${b.id}\``);
  lines.push(`- **Target keyword** ${b.targetKeyword} · **intent** ${b.intent}`);
  lines.push(`- **Angle** ${b.angle}`);
  if (b.mustCover.length) {
    lines.push("- **Must cover**");
    b.mustCover.forEach((m) => lines.push(`  - ${m}`));
  }
  if (b.internalLinks.length) lines.push(`- **Internal links** ${b.internalLinks.map((l) => `\`${l}\``).join(" · ")}`);
  lines.push(`- **CTA** ${b.cta}\n`);
});

lines.push("## Rank tracking\n");
lines.push("Check monthly. Position from an incognito search or Search Console average position.\n");
lines.push("| Target keyword | Target URL | Intent | Published | Position (date) | Notes |");
lines.push("|---|---|---|---|---|---|");
briefs.forEach((b) =>
  lines.push(`| ${b.targetKeyword} | \`/blog/…\` | ${b.intent} | ☐ | | |`),
);
lines.push("");
lines.push("Also track the money pages:\n");
lines.push("| Page | Target keyword | Position (date) |");
lines.push("|---|---|---|");
[["/", "AI Marketing Engineer Dubai"], ["/portfolio", "hire AI automation expert UAE"], ["/projects", "AI agents for marketing operations"]].forEach(
  ([p, k]) => lines.push(`| \`${p}\` | ${k} | |`),
);
lines.push("");

writeFileSync("content-calendar.md", lines.join("\n"));
console.log(`content-calendar.md written — ${briefs.length} briefs, ${clusters.length} keywords`);
