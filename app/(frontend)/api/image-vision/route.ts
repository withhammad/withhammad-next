export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Vision-powered image tools — 100% free.
//   • "analyze"   : Gemini reads the uploaded image → creative/marketing breakdown (text).
//   • "transform" : Gemini describes the image in detail → we restyle that description
//                   (cartoon / anime / 3D / etc.) → Pollinations re-generates it as a NEW
//                   image. (True pixel-level image editing isn't on Gemini's free tier in
//                   every region, so we reimagine rather than edit — always free, no key cost.)
//
// Vision (image→text) runs on gemini-flash-latest, the same free quota the chatbot uses.
// Image generation runs on keyless Pollinations.

const GEMINI_MODEL = process.env.GEMINI_VISION_MODEL ?? "gemini-flash-latest";

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// Restyle recipes for "transform" mode. Keys must match the client's STYLES list.
const STYLE_MODIFIERS: Record<string, string> = {
  cartoon:
    "Reimagined as a vibrant cartoon illustration: bold clean outlines, flat cel shading, playful expressive shapes, high saturation, sticker-like.",
  anime:
    "Reimagined as polished anime key art: cel shading, expressive eyes, dynamic lighting, studio-quality Japanese animation style.",
  pixar:
    "Reimagined as a glossy 3D Pixar-style render: soft global illumination, rounded friendly forms, subsurface skin glow, cinematic depth of field.",
  oil:
    "Reimagined as a classical oil painting: thick visible brush strokes, rich impasto texture, dramatic chiaroscuro, museum gallery lighting.",
  cyberpunk:
    "Reimagined in neon cyberpunk style: rain-slick reflections, magenta and cyan glow, holographic signage, futuristic dystopian atmosphere.",
  watercolor:
    "Reimagined as a delicate watercolor painting: soft translucent washes, gentle color bleeds, visible cold-press paper texture, airy negative space.",
  surreal:
    "Reimagined as a surreal dreamlike scene: impossible physics, Dalí-esque melting forms, unexpected juxtapositions, otherworldly volumetric lighting, hyper-imaginative.",
  popart:
    "Reimagined as bold Warhol pop-art: high-contrast halftone dots, vivid flat color blocks, screen-print aesthetic, graphic and punchy.",
};

const ASPECT_DIMS: Record<string, [number, number]> = {
  "1:1": [1024, 1024],
  "16:9": [1280, 720],
  "9:16": [720, 1280],
  "3:2": [1200, 800],
};

interface GeminiPart {
  text?: string;
}
interface GeminiResp {
  candidates?: { content?: { parts?: GeminiPart[] }; finishReason?: string }[];
  error?: { code?: number; message?: string };
}

// Strip markdown noise, "Draft/Option/Version" leakage, and parentheticals that
// some vision responses prepend, so the description feeds the generator cleanly.
function cleanCaption(s: string): string {
  let t = s.replace(/[*_`#>]+/g, " ");
  t = t.replace(/^\s*[-•\d.)\]]+\s*/g, " ");
  t = t.replace(
    /\b(?:draft|option|version|alt(?:ernative)?|caption|description|prompt)\s*\d*\s*[:)\-–—]*/gi,
    " ",
  );
  t = t.replace(/\((?:incorporating|including|note|revised)[^)]*\)/gi, " ");
  t = t.replace(/\s+/g, " ").trim();
  t = t.replace(/^[\s:;,.\-–—)\]]+/, "").trim();
  const words = t.split(" ");
  return words.length > 60 ? words.slice(0, 60).join(" ") : t;
}

async function geminiVision(
  apiKey: string,
  instruction: string,
  imageData: string,
  mimeType: string,
  maxOutputTokens: number,
  temperature = 0.6,
): Promise<{ text?: string; error?: string; code?: number }> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: instruction },
              { inline_data: { mime_type: mimeType, data: imageData } },
            ],
          },
        ],
        // thinkingBudget:0 → no hidden reasoning tokens. Without it, flash-latest
        // spends the budget "thinking" and truncates/leaks draft text into output.
        generationConfig: {
          temperature,
          maxOutputTokens,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      cache: "no-store",
    },
  );

  const data = (await res.json().catch(() => ({}))) as GeminiResp;
  if (!res.ok || data.error) {
    return {
      error: data.error?.message ?? "Vision request failed.",
      code: data.error?.code ?? res.status,
    };
  }
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();
  if (!text) {
    const reason = data.candidates?.[0]?.finishReason;
    return {
      error:
        reason === "SAFETY"
          ? "That image couldn't be processed (content safety). Try a different photo."
          : "No response from the vision model. Try again.",
    };
  }
  return { text };
}

export async function POST(req: Request) {
  let body: {
    email?: string;
    mode?: string;
    imageData?: string;
    mimeType?: string;
    style?: string;
    prompt?: string;
    aspectRatio?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  const mode = body.mode === "transform" ? "transform" : "analyze";
  const imageData = (body.imageData ?? "").trim();
  const mimeType = ["image/jpeg", "image/png", "image/webp"].includes(
    body.mimeType ?? "",
  )
    ? (body.mimeType as string)
    : "image/jpeg";
  const aspectRatio = ["1:1", "16:9", "9:16", "3:2"].includes(
    body.aspectRatio ?? "",
  )
    ? (body.aspectRatio as string)
    : "1:1";

  if (!isEmail(email)) {
    return Response.json(
      { error: "Enter a valid email to use the tool." },
      { status: 422 },
    );
  }
  if (!imageData) {
    return Response.json(
      { error: "Upload an image first." },
      { status: 422 },
    );
  }
  // base64 inflates ~33%; ~10MB b64 ≈ 7.5MB raw. Reject oversized payloads.
  if (imageData.length > 10_000_000) {
    return Response.json(
      { error: "That image is too large. Try one under ~7 MB." },
      { status: 413 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Vision isn't configured yet. Please check back shortly." },
      { status: 503 },
    );
  }

  /* --------------------------------- analyze -------------------------------- */
  if (mode === "analyze") {
    const instruction =
      "You are a senior creative director reviewing an image for marketing use. " +
      "Reply in clean Markdown with these exact sections and nothing else:\n" +
      "**What's in it** — one tight sentence.\n" +
      "**Mood & style** — 3–5 comma-separated descriptors.\n" +
      "**Color palette** — 3–5 colors (plain names).\n" +
      "**Strengths** — 2 short bullet points.\n" +
      "**Make it a stronger ad** — 1 sharp, specific suggestion.\n" +
      "Be punchy and concrete. No preamble, no sign-off.";
    const out = await geminiVision(apiKey, instruction, imageData, mimeType, 600);
    if (out.error) {
      const friendly =
        out.code === 429
          ? "The free vision quota is busy right now — try again in a moment."
          : out.error;
      return Response.json({ error: friendly }, { status: 502 });
    }
    return Response.json({ status: "ok", mode: "analyze", text: out.text });
  }

  /* -------------------------------- transform ------------------------------- */
  const styleKey = body.style && STYLE_MODIFIERS[body.style] ? body.style : "cartoon";
  const twist = (body.prompt ?? "").trim().slice(0, 200);

  const describe = await geminiVision(
    apiKey,
    "You are an image-captioning function. Look at the image and write ONE plain-prose " +
      "sentence (max 45 words) describing exactly what is visually present: main subject, " +
      "pose or action, setting, lighting, and dominant colors. " +
      "Output nothing but that single sentence — no markdown, no asterisks, no bullets, " +
      "no labels, no quotes, no 'Draft'/'Option'/'Version', no alternatives, no preamble.",
    imageData,
    mimeType,
    256,
    0.35,
  );
  if (describe.error || !describe.text) {
    const friendly =
      describe.code === 429
        ? "The free vision quota is busy right now — try again in a moment."
        : describe.error ?? "Couldn't read that image. Try another.";
    return Response.json({ error: friendly }, { status: 502 });
  }

  const caption = cleanCaption(describe.text);
  const finalPrompt = [caption, twist, STYLE_MODIFIERS[styleKey]]
    .filter(Boolean)
    .join(". ");
  const [width, height] = ASPECT_DIMS[aspectRatio] ?? [1024, 1024];
  const seed = Date.now() % 1_000_000;
  const image = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    finalPrompt,
  )}?width=${width}&height=${height}&model=flux&nologo=true&seed=${seed}`;

  return Response.json({
    status: "ok",
    mode: "transform",
    image,
    style: styleKey,
    caption,
  });
}
