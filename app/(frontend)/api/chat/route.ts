import Anthropic from "@anthropic-ai/sdk";
import { JARVIS_SYSTEM_PROMPT } from "@/lib/jarvis-context";
import { intercept } from "@/lib/voice-guardrails";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Needs the Node runtime (reads the knowledge file from disk).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.ANTHROPIC_CHAT_MODEL ?? "claude-3-5-haiku-latest";
// gemini-2.5-flash-lite has a much larger free daily quota (~1000/day) than
// gemini-flash-latest (→ gemini-3.5-flash, only 20/day) — critical for a live
// chatbot that would otherwise die after 20 messages a day.
const GEMINI_MODEL = process.env.GEMINI_CHAT_MODEL ?? "gemini-2.5-flash-lite";
const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ??
  "https://calendly.com/withhammad-marketing/30min";

// Full-context injection of the knowledge base (move to RAG/pgvector later).
// Read once at module load; falls back to empty if the file is missing.
let KNOWLEDGE = "";
try {
  KNOWLEDGE = readFileSync(
    join(process.cwd(), "content", "knowledge.md"),
    "utf8",
  );
} catch {
  KNOWLEDGE = "";
}

const SYSTEM_PROMPT = `${JARVIS_SYSTEM_PROMPT}

ADDITIONAL BACKGROUND
${KNOWLEDGE || "(none)"}`;

type Role = "user" | "assistant";
interface ChatMessage {
  role: Role;
  content: string;
}

function sanitize(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
    .slice(-20);
}

export async function POST(req: Request) {
  const encoder = new TextEncoder();

  let messages: ChatMessage[] = [];
  try {
    const body = await req.json();
    messages = sanitize(body?.messages);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return new Response("No user message", { status: 400 });
  }

  // Hard guardrails first — these turns never reach a model, so the rule
  // holds regardless of prompt-injection, temperature, or provider swap.
  const hit = intercept(messages[messages.length - 1].content);
  if (hit) {
    return new Response(encoder.encode(hit.reply), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Guardrail": hit.reason,
      },
    });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Graceful fallback so the widget never looks broken before a key is set.
  if (!geminiKey && !anthropicKey) {
    const msg = `Thanks for reaching out! The live assistant isn't connected yet — but Hammad would genuinely love to talk. Grab a free 30-minute call here: ${CALENDLY_URL}`;
    return new Response(encoder.encode(msg), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (geminiKey) {
          // Google Gemini (free tier) — native SSE streaming, no SDK needed.
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents: messages.map((m) => ({
                  role: m.role === "assistant" ? "model" : "user",
                  parts: [{ text: m.content }],
                })),
                generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
              }),
            },
          );
          if (!res.ok || !res.body) {
            throw new Error(`Gemini ${res.status}: ${await res.text()}`);
          }
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const t = line.trim();
              if (!t.startsWith("data:")) continue;
              const payload = t.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const obj = JSON.parse(payload);
                const text =
                  obj?.candidates?.[0]?.content?.parts
                    ?.map((p: { text?: string }) => p.text ?? "")
                    .join("") ?? "";
                if (text) controller.enqueue(encoder.encode(text));
              } catch {
                /* partial / keep-alive line — skip */
              }
            }
          }
        } else {
          // Anthropic — used only when GEMINI_API_KEY is absent.
          const anthropic = new Anthropic({ apiKey: anthropicKey });
          const events = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
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
        }
      } catch (err) {
        console.error("[chat] stream error:", err);
        controller.enqueue(
          encoder.encode(
            `\n\nSorry — I hit a snag on my end. You can reach Hammad directly here: ${CALENDLY_URL}`,
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
