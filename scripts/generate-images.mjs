// On-brand site image generator — FREE via Pollinations.ai (no API key, no cost).
//
//   Run:        cd /Users/hammadyousuf/withhammad-next && node scripts/generate-images.mjs
//   Re-gen all: FORCE=1 node scripts/generate-images.mjs
//
// Saves to public/ai/. Skips images that already exist (unless FORCE=1), so the
// current ChatGPT-made set is preserved unless you explicitly force a refresh.

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "ai");
mkdirSync(OUT, { recursive: true });

// Shared brand styling appended to every prompt.
const BRAND =
  "Deep near-black background (#0A0A0B), elegant volumetric light in indigo (#6366F1) and warm gold-amber (#F59E0B), cinematic, ultra-premium, sleek, minimal, modern SaaS/agency aesthetic, shallow depth of field, high detail. No text, no words, no letters, no people, no logos.";

const IMAGES = [
  { name: "hero", prompt: `Cinematic abstract hero background: flowing light trails and soft bokeh forming a glowing 3D data-network mesh with fine nodes and connecting lines. ${BRAND}` },
  { name: "blog-ai-automation", prompt: `Abstract AI automation: luminous neural and circuit pathways with flowing particles of light. ${BRAND}` },
  { name: "blog-paid-ads", prompt: `Abstract performance-advertising growth: upward-sweeping light trails and rising glowing bars formed from light. ${BRAND}` },
  { name: "blog-seo-aeo", prompt: `Abstract search and answer engines: a constellation of interconnected glowing nodes radiating outward like a knowledge graph. ${BRAND}` },
  { name: "blog-analytics", prompt: `Abstract data analytics: luminous flowing data streams over a subtle glowing grid horizon. ${BRAND}` },
  { name: "blog-strategy", prompt: `Abstract growth strategy: elegant geometric pathways and converging beams of light. ${BRAND}` },
  { name: "services", prompt: `Abstract integrated marketing engine: interlocking luminous rings and orbiting particles of light. ${BRAND}` },
  { name: "og-default", prompt: `Premium abstract brand backdrop: smooth volumetric gradient haze with a few drifting light particles and generous negative space. ${BRAND}` },
];

const WIDTH = 1536;
const HEIGHT = 1024; // 3:2 landscape — great for heroes + covers
const FORCE = process.env.FORCE === "1";

async function gen(img, i) {
  const target = join(OUT, `${img.name}.jpg`);
  if (existsSync(target) && !FORCE) {
    console.log(`• skip ${img.name} (already exists)`);
    return "skip";
  }
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    img.prompt,
  )}?width=${WIDTH}&height=${HEIGHT}&model=flux&nologo=true&seed=${1000 + i}`;
  console.log(`• generating ${img.name}…`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pollinations ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(target, buf);
  console.log(`  ✓ saved public/ai/${img.name}.jpg (${Math.round(buf.length / 1024)} KB)`);
  return "ok";
}

let ok = 0;
let skip = 0;
let fail = 0;
for (let i = 0; i < IMAGES.length; i += 1) {
  try {
    const r = await gen(IMAGES[i], i);
    if (r === "ok") ok += 1;
    else skip += 1;
  } catch (e) {
    console.error(`  ✗ FAILED ${IMAGES[i].name}: ${e.message}`);
    fail += 1;
  }
}
console.log(
  `\nDone — ${ok} generated, ${skip} skipped, ${fail} failed. Output: public/ai/ (free via Pollinations, no API key).`,
);
