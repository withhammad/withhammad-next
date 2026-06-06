import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.ANTHROPIC_CHAT_MODEL ?? "claude-3-5-haiku-latest";
const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ??
  "https://calendly.com/withhammad-marketing/30min";

// Per-IP rate limit (fixed window, in-memory). Audits are heavier than ad-copy
// so the cap is tighter — 6 runs/hour vs 8 for ad-copy.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 6;
const hits = new Map<string, number[]>();

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "anon";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

interface AuditInput {
  platform?: string;
  industry?: string;
  monthlySpend?: string;
  accountData?: string;
}

// Compact audit framework distilled from the claude-ads skill pack. The system
// prompt is the durable contract — change here, not in the user message — so
// the output stays consistent run-to-run.
const SYSTEM_PROMPT = `You are an elite paid-media auditor who has run growth across Google Ads (Search, Performance Max, AI Max, Demand Gen) and Meta Ads (Advantage+, ASC, Sales/Leads/App optimization) for direct-response brands. You audit pasted account snapshots and return prioritized, actionable findings — not generic advice.

Output a Markdown report with these sections IN THIS ORDER:

# Ads Health Score: X/100 (Grade: A/B/C/D/F)

One short paragraph explaining the score. Be honest — most accounts score 50–75. Anchor against unit economics where you can.

## Critical Issues (fix this week)
3–6 numbered items. Each: **Title**. One line on what's broken. One line on the fix. Estimated impact (e.g. "saves ~15% of spend", "lifts CTR 20–40%").

## Quick Wins (this month, low effort)
3–6 numbered items. Same format.

## Strategic Recommendations (this quarter)
2–4 numbered items. Bigger lifts: account restructure, AI Max / Advantage+ adoption, creative diversity strategy, conversion-tracking overhaul, etc.

## What's Working
1–3 bullets. Be specific — don't make stuff up. If nothing clearly works, say so.

## Data You Should Add for a Deeper Audit
1–3 bullets. What's missing from the snapshot that would 10x the audit quality (e.g. "30-day search-term report", "asset-level Meta performance", "conversion paths").

## Next Step
One sentence: book a call with Hammad to implement (use this URL: ${CALENDLY_URL}). Tone: confident, not pushy.

RULES:
- Be specific to the platform + industry + spend level the user provided. A $500/mo Meta account gets different advice than a $50k/mo Google account.
- Reference signals the user actually pasted. Don't invent metrics.
- No flattery, no preamble, no "great account!" — start directly with the score.
- Use markdown headers (##), bold for **emphasis**, and numbered lists. No tables.
- Keep total length under ~700 words. Density beats length.`;

function buildUserMessage(b: AuditInput): string {
  const line = (label: string, val?: string) =>
    val && val.trim() ? `${label}: ${val.trim()}\n` : "";
  return (
    `Audit this paid-advertising account:\n\n` +
    line("Platform(s)", b.platform) +
    line("Industry", b.industry) +
    line("Monthly ad spend", b.monthlySpend) +
    `\nAccount data (verbatim from the user):\n` +
    `"""\n${(b.accountData ?? "").trim()}\n"""\n\n` +
    `Write the audit now, following the exact section order in your instructions.`
  );
}

export async function POST(req: Request) {
  const encoder = new TextEncoder();

  let input: AuditInput;
  try {
    input = (await req.json()) as AuditInput;
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  if (!input.accountData || !input.accountData.trim()) {
    return Response.json(
      { error: "Paste some account data to audit — campaigns, search terms, metrics, anything diagnostic." },
      { status: 422 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    const msg = `The audit engine isn't connected yet (no API key set). In the meantime, Hammad runs this audit by hand on every discovery call — book a free one here: ${CALENDLY_URL}`;
    return new Response(encoder.encode(msg), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  if (rateLimited(clientIp(req))) {
    return Response.json(
      {
        error: `You've reached the free limit (${MAX_PER_WINDOW} audits/hour). Want an unlimited, done-for-you audit on a real account? Book a call: ${CALENDLY_URL}`,
      },
      { status: 429 },
    );
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const events = await anthropic.messages.create({
          model: MODEL,
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildUserMessage(input) }],
          stream: true,
        });
        for await (const event of events) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        console.error("[ads-audit] stream error:", err);
        controller.enqueue(
          encoder.encode(
            `\n\nSorry — the audit engine failed. Please try again, or book a call to get a real one: ${CALENDLY_URL}`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
