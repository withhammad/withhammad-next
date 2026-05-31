// On-brand site image generator (OpenAI gpt-image-1 — same engine as ChatGPT images).
//
//   Run:  cd /Users/hammadyousuf/withhammad-next
//         node --env-file=.env.local scripts/generate-images.mjs
//   Force re-gen of everything:  FORCE=1 node --env-file=.env.local scripts/generate-images.mjs
//
// Needs OPENAI_API_KEY in .env.local (local only — the output images become static
// files in public/ai/, so the live site needs no key). Skips images that already exist.

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  console.error("✗ Missing OPENAI_API_KEY. Add it to .env.local then re-run.");
  process.exit(1);
}

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "ai");
mkdirSync(OUT, { recursive: true });

// Shared brand styling appended to every prompt.
const BRAND =
  "Deep near-black background (#0A0A0B), elegant volumetric light in indigo (#6366F1) and warm gold-amber (#F59E0B), cinematic, ultra-premium, sleek, minimal, modern SaaS/agency aesthetic, shallow depth of field, high detail. Absolutely no text, no words, no letters, no people, no logos.";

const IMAGES = [
  // hero.jpg is the approved image, already placed — skipped automatically.
  { name: "hero", prompt: `Cinematic abstract hero background: flowing light trails and soft bokeh forming a glowing 3D data-network mesh with fine nodes and connecting lines. ${BRAND}` },
  { name: "blog-ai-automation", prompt: `Abstract AI automation: luminous neural/circuit pathways and flowing particles of light. ${BRAND}` },
  { name: "blog-paid-ads", prompt: `Abstract performance-advertising growth: upward-sweeping light trails and rising glowing bars formed from light. ${BRAND}` },
  { name: "blog-seo-aeo", prompt: `Abstract search and answer engines: a constellation of interconnected glowing nodes radiating outward. ${BRAND}` },
  { name: "blog-analytics", prompt: `Abstract data analytics: luminous flowing data streams over a subtle glowing grid horizon. ${BRAND}` },
  { name: "blog-strategy", prompt: `Abstract growth strategy: elegant geometric pathways and converging beams of light. ${BRAND}` },
  { name: "services", prompt: `Abstract integrated marketing engine: interlocking luminous rings and orbiting particles of light. ${BRAND}` },
  { name: "og-default", prompt: `Premium abstract brand backdrop: smooth volumetric gradient haze with a few drifting light particles and generous negative space. ${BRAND}` },
];

const SIZE = "1536x1024"; // landscape 3:2, great for heroes + covers
const FORCE = process.env.FORCE === "1";

async function gen(img) {
  const target = join(OUT, `${img.name}.jpg`);
  if (existsSync(target) && !FORCE) {
    console.log(`• skip ${img.name} (already exists)`);
    return "skip";
  }
  console.log(`• generating ${img.name}…`);
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: img.prompt,
      size: SIZE,
      quality: "medium",
      output_format: "jpeg",
      output_compression: 80,
      n: 1,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${res.status} ${t.slice(0, 240)}`);
  }
  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error("no image data in response");
  writeFileSync(target, Buffer.from(b64, "base64"));
  console.log(`  ✓ saved public/ai/${img.name}.jpg`);
  return "ok";
}

let ok = 0,
  skip = 0,
  fail = 0;
for (const img of IMAGES) {
  try {
    const r = await gen(img);
    if (r === "ok") ok++;
    else skip++;
  } catch (e) {
    console.error(`  ✗ FAILED ${img.name}: ${e.message}`);
    fail++;
  }
}
console.log(`\nDone — ${ok} generated, ${skip} skipped, ${fail} failed. Output: public/ai/`);
