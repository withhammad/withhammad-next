// `npm run draft` — thin client for POST /api/blog/draft.
//
//   npm run draft -- --list
//   npm run draft -- --brief=autonomous-google-ads-agent
//   npm run draft -- "why agents beat workflows"
//   DRAFT_BASE=https://withhammad.com npm run draft -- --brief=...
//
// The generation and the Payload write both happen server-side in the route,
// because Payload's Local API is already wired inside Next. Needs the dev
// server running (npm run dev) or DRAFT_BASE pointed at production.
import { existsSync, readFileSync } from "node:fs";

function loadEnvLocal() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const args = process.argv.slice(2);
loadEnvLocal();

if (args.includes("--list")) {
  const src = readFileSync("lib/content-briefs.ts", "utf8");
  const ids = [...src.matchAll(/^\s{4}id: "([^"]+)"/gm)].map((m) => m[1]);
  const titles = [...src.matchAll(/^\s{4}workingTitle:\s*\n?\s*"([^"]+)"/gm)].map((m) => m[1]);
  console.log("\nSeeded briefs:\n");
  ids.forEach((id, i) => console.log(`  ${id}\n    ${titles[i] ?? ""}\n`));
  console.log("Run:  npm run draft -- --brief=<id>\n");
  process.exit(0);
}

const brief = args.find((a) => a.startsWith("--brief="))?.split("=")[1];
const topic = args.filter((a) => !a.startsWith("--")).join(" ").trim();
if (!brief && !topic) {
  console.error('Usage: npm run draft -- "topic" | --brief=<id> | --list');
  process.exit(1);
}

const base = process.env.DRAFT_BASE || "http://localhost:3000";
const secret = process.env.REVALIDATE_SECRET;
if (!secret) {
  console.error("REVALIDATE_SECRET is not set in .env.local — the draft endpoint stays closed without it.");
  process.exit(1);
}

console.log(`Drafting via ${base} …`);
const res = await fetch(`${base}/api/blog/draft`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${secret}`,
  },
  body: JSON.stringify({ brief, topic }),
}).catch((e) => {
  console.error(`\nCould not reach ${base} — is the dev server running?\n${e.message}\n`);
  process.exit(1);
});

const json = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error(`\ndraft failed (${res.status}): ${json.error ?? "unknown"}\n`);
  process.exit(1);
}

console.log(`\n  ✓ "${json.title}" — ${json.words} words, status: ${json.status}`);
console.log(`    Review: ${base}${json.review}`);
console.log(`    It will NOT appear on /blog until you press Publish.\n`);
