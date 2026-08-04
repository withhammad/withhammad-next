export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Expands a rough idea into a rich, generator-ready image prompt — free, via
// gemini-flash-latest (the chatbot's quota). If no key is set, it's a no-op
// passthrough so the UI never breaks.

const GEMINI_MODEL = process.env.GEMINI_VISION_MODEL || "gemini-2.5-flash-lite";
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export async function POST(req: Request) {
  let body: { email?: string; prompt?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  const prompt = (body.prompt ?? "").trim().slice(0, 400);

  if (!isEmail(email)) {
    return Response.json(
      { error: "Enter a valid email first." },
      { status: 422 },
    );
  }
  if (!prompt) {
    return Response.json(
      { error: "Type a rough idea to enhance." },
      { status: 422 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Graceful no-op: return the original so the button still "works".
    return Response.json({ status: "ok", prompt });
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "You are a prompt engineer for an AI image generator. Expand the user's " +
                    "idea into ONE vivid, detailed prompt (single paragraph, max 60 words). " +
                    "Add concrete subject, setting, lighting, mood, composition, lens, and " +
                    "style cues. Keep their intent. Output ONLY the prompt — no quotes, no " +
                    "labels, no preamble.\n\nIDEA: " +
                    prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 220,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
        cache: "no-store",
      },
    );
    const data = (await res.json().catch(() => ({}))) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      error?: { message?: string };
    };
    const text = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("")
      .replace(/[*_`"]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    // Fall back to the original idea if the model returns nothing.
    return Response.json({ status: "ok", prompt: text || prompt });
  } catch {
    return Response.json({ status: "ok", prompt });
  }
}
