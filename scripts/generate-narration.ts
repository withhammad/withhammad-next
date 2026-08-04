/* eslint-disable no-console */
// ---------------------------------------------------------------------------
// Generate JARVIS narration MP3s via Fish Audio TTS.
//
//   npm run narration            → generate any missing clips
//   npm run narration -- --force → regenerate everything
//
// Requires FISH_API_KEY and FISH_VOICE_ID in the environment (.env.local is
// read automatically). Idempotent: existing files are skipped unless --force,
// so CI can run this on every build without burning TTS credits.
// ---------------------------------------------------------------------------

import { mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { narrationScripts } from "../lib/narration-scripts";

const OUT_DIR = path.join(process.cwd(), "public", "audio", "narration");
const FISH_URL = "https://api.fish.audio/v1/tts";
// Default to the free tier: s2.1-pro returns 402 without purchased API
// credit, which Fish bills separately from platform credit.
const MODEL = process.env.FISH_MODEL ?? "s2.1-pro-free";

// Minimal .env.local loader — no dotenv dependency needed for a script.
function loadEnvLocal() {
  const p = path.join(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

async function generate(key: string, text: string, force: boolean) {
  const out = path.join(OUT_DIR, `${key}.mp3`);
  if (existsSync(out) && !force) {
    console.log(`  skip  ${key}.mp3 (exists)`);
    return;
  }
  const res = await fetch(FISH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FISH_API_KEY}`,
      "Content-Type": "application/json",
      model: MODEL,
    },
    body: JSON.stringify({
      text,
      reference_id: process.env.FISH_VOICE_ID,
      format: "mp3",
      mp3_bitrate: 128,
      prosody: { speed: 1 },
    }),
  });
  if (!res.ok) {
    throw new Error(`${key}: Fish TTS ${res.status} — ${await res.text()}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(out, buf);
  console.log(`  wrote ${key}.mp3 (${(buf.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  loadEnvLocal();
  const force = process.argv.includes("--force");

  if (!process.env.FISH_API_KEY || !process.env.FISH_VOICE_ID) {
    console.log(
      "narration: FISH_API_KEY / FISH_VOICE_ID not set — skipping (site falls back to text-only). Add them to .env.local and re-run.",
    );
    return; // exit 0 so builds never fail on missing voice credentials
  }

  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Generating narration (model ${MODEL}, force=${force})…`);
  let failed = 0;
  for (const [key, text] of Object.entries(narrationScripts)) {
    try {
      await generate(key, text, force);
    } catch (err) {
      failed += 1;
      console.error(`  FAIL  ${err instanceof Error ? err.message : err}`);
    }
  }
  if (failed > 0) process.exit(1);
  console.log("Done.");
}

main();
