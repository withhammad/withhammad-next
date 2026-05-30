import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.ANTHROPIC_CHAT_MODEL ?? "claude-3-5-haiku-latest";
const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ??
  "https://calendly.com/withhammad-marketing/30min";

/* ---------------------------------------------------------------------------
 * Basic per-IP rate limit (fixed window, in-memory).
 * Caps anonymous usage so the tool can't run up unbounded API cost.
 * NOTE: state is per server instance — for multi-instance production, back this
 * with Upstash/Redis. This is intentionally simple but effective as a guard.
 * ------------------------------------------------------------------------- */
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 8;
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

interface Brief {
  product?: string;
  audience?: string;
  offer?: string;
  platform?: string;
  tone?: string;
}

const SYSTEM_PROMPT = `You are an elite direct-response advertising copywriter who has written winning ads across Google, Meta, LinkedIn and TikTok.

Given a brief, write high-converting ad copy. Rules:
- Output ONLY the ad copy under simple plain-text headings (no markdown symbols, no preamble, no explanations of your reasoning).
- Provide: 8 headline options and 4 description/primary-text options, plus 2 call-to-action button ideas.
- Respect platform norms and character limits where they apply (Google RSA: headlines ≤30 chars, descriptions ≤90 chars; Meta: a punchy primary text + short headlines; LinkedIn: credible and professional; TikTok: native, casual, hook-first).
- Make every line specific to the audience and offer. No clichés, no exclamation spam, no fabricated stats.
- Match the requested tone.
Keep it tight and immediately usable.`;

function buildUserMessage(b: Brief): string {
  const line = (label: string, val?: string) =>
    val && val.trim() ? `${label}: ${val.trim()}\n` : "";
  return (
    `Write ad copy for this brief:\n` +
    line("Platform", b.platform) +
    line("Product/service", b.product) +
    line("Target audience", b.audience) +
    line("Offer / USP", b.offer) +
    line("Tone", b.tone) +
    `\nWrite the ad copy now.`
  );
}

export async function POST(req: Request) {
  const encoder = new TextEncoder();

  let brief: Brief;
  try {
    brief = (await req.json()) as Brief;
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  if (!brief.product || !brief.product.trim()) {
    return Response.json(
      { error: "Add at least a product or service to generate copy." },
      { status: 422 },
    );
  }

  // Graceful fallback if the key isn't configured yet.
  if (!process.env.ANTHROPIC_API_KEY) {
    const msg = `The AI writer isn't connected yet (no API key set). In the meantime, Hammad can write copy that actually converts — book a free call: ${CALENDLY_URL}`;
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
        error: `You've reached the free limit (${MAX_PER_WINDOW} generations/hour). Want unlimited, done-for-you copy? Book a call: ${CALENDLY_URL}`,
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
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildUserMessage(brief) }],
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
        console.error("[ad-copy] stream error:", err);
        controller.enqueue(
          encoder.encode(
            `\n\nSorry — generation failed. Please try again, or book a call: ${CALENDLY_URL}`,
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
