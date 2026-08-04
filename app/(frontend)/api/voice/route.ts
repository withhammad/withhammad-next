import { NextResponse } from "next/server";

// Server-side Fish Audio TTS proxy. FISH_API_KEY never reaches the client —
// the browser posts text here and receives audio bytes back.
//
// Used for chat replies (dynamic). The 13 fixed section narrations are
// pre-generated at build time by `npm run narration` and served as static
// MP3s, so normal browsing never touches this route.

export const runtime = "nodejs";

const FISH_URL = "https://api.fish.audio/v1/tts";
const MAX_CHARS = 900;

// Per-IP token bucket. In-memory, so it resets on cold start and is per
// instance — enough to stop a tab hammering TTS credits, not a security
// boundary. Move to Redis/KV if abuse ever becomes real.
const BUCKET = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = 30;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const b = BUCKET.get(ip);
  if (!b || now > b.resetAt) {
    BUCKET.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  b.count += 1;
  return b.count > LIMIT;
}

export async function POST(req: Request) {
  if (process.env.VOICE_LIVE_MODE === "off") {
    return NextResponse.json({ error: "voice disabled" }, { status: 503 });
  }

  const key = process.env.FISH_API_KEY;
  const voiceId = process.env.FISH_VOICE_ID;
  if (!key || !voiceId) {
    // Not an error state — the UI simply stays text-only until keys exist.
    return NextResponse.json({ error: "voice not configured" }, { status: 503 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  let text = "";
  try {
    const body = (await req.json()) as { text?: unknown };
    text = typeof body.text === "string" ? body.text.trim().slice(0, MAX_CHARS) : "";
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!text) return NextResponse.json({ error: "no text" }, { status: 400 });

  try {
    const res = await fetch(FISH_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        model: process.env.FISH_MODEL || "s2.1-pro-free",
      },
      body: JSON.stringify({
        text,
        reference_id: voiceId,
        format: "mp3",
        mp3_bitrate: 128,
        prosody: { speed: 1 },
      }),
    });

    if (!res.ok) {
      console.warn("[voice] fish tts failed", res.status);
      return NextResponse.json({ error: "tts failed" }, { status: 502 });
    }

    return new NextResponse(res.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.warn("[voice] error", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "tts error" }, { status: 502 });
  }
}
