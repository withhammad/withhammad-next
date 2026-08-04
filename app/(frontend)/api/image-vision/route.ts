import { proxiedImage } from "@/lib/pollinations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30; // headroom for retry-with-backoff on free-tier 429s

// Vision-powered image tools — 100% free.
//   • "analyze"   : Gemini reads the uploaded image → creative/marketing breakdown (text).
//   • "transform" : Gemini describes the image in detail → we restyle that description
//                   (cartoon / anime / 3D / etc.) → Pollinations re-generates it as a NEW
//                   image. (True pixel-level image editing isn't on Gemini's free tier in
//                   every region, so we reimagine rather than edit — always free, no key cost.)
//   • "caption"   : Gemini returns ready-to-post copy (alt text, caption, hashtags, ad text).
//
// Vision (image→text) runs on gemini-flash-latest, the same free quota the chatbot uses.
// Image generation runs on keyless Pollinations.

// gemini-2.5-flash-lite: vision-capable with a much larger free daily quota
// (~1000/day) than gemini-flash-latest (→ gemini-3.5-flash, only 20/day).
const GEMINI_MODEL = process.env.GEMINI_VISION_MODEL || "gemini-2.5-flash-lite";

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
  watercolor:
    "Reimagined as a delicate watercolor painting: soft translucent washes, gentle color bleeds, visible cold-press paper texture, airy negative space.",
  cyberpunk:
    "Reimagined in neon cyberpunk style: rain-slick reflections, magenta and cyan glow, holographic signage, futuristic dystopian atmosphere.",
  popart:
    "Reimagined as bold Warhol pop-art: high-contrast halftone dots, vivid flat color blocks, screen-print aesthetic, graphic and punchy.",
  surreal:
    "Reimagined as a surreal dreamlike scene: impossible physics, Dalí-esque melting forms, unexpected juxtapositions, otherworldly volumetric lighting, hyper-imaginative.",
  sketch:
    "Reimagined as a detailed graphite pencil sketch: expressive hand-drawn cross-hatching, soft shading, sketchbook paper texture, monochrome.",
  comic:
    "Reimagined as a bold comic-book panel: heavy ink outlines, halftone shading, dynamic action lines, saturated primary colors, graphic-novel style.",
  pixel:
    "Reimagined as retro 8-bit pixel art: chunky pixels, limited color palette, crisp dithering, nostalgic video-game aesthetic.",
  claymation:
    "Reimagined as a charming claymation figure: handmade plasticine texture, visible fingerprints, soft studio lighting, stop-motion charm.",
  lowpoly:
    "Reimagined as a low-poly 3D render: faceted geometric triangles, flat shaded planes, minimal modern vector aesthetic.",
  vaporwave:
    "Reimagined in vaporwave aesthetic: pastel pink and cyan gradients, retro 80s grid, chrome and glitch elements, dreamy nostalgic mood.",
  sticker:
    "Reimagined as a glossy die-cut sticker: thick white border, bold flat colors, kawaii cartoon style, subtle drop shadow.",
  lineart:
    "Reimagined as minimal single-line art: clean continuous black contour lines on a plain background, elegant and modern.",
  renaissance:
    "Reimagined as a Renaissance oil masterpiece: chiaroscuro lighting, rich earthy tones, classical composition, old-master detail.",
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
  extraConfig: Record<string, unknown> = {},
): Promise<{ text?: string; error?: string; code?: number }> {
  // thinkingBudget:0 → no hidden reasoning tokens. Without it, flash-latest
  // spends the budget "thinking" and truncates/leaks draft text into output.
  const payload = JSON.stringify({
    contents: [
      {
        parts: [
          { text: instruction },
          { inline_data: { mime_type: mimeType, data: imageData } },
        ],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens,
      thinkingConfig: { thinkingBudget: 0 },
      ...extraConfig,
    },
  });

  let lastError = "Vision request failed.";
  let lastCode = 0;

  // The free tier intermittently throttles image-input calls (429) under bursty
  // load. Retry a few times with backoff before giving up.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, attempt * 1200));
    }
    let res: Response;
    try {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          cache: "no-store",
        },
      );
    } catch {
      lastError = "Vision request failed.";
      lastCode = 0;
      continue;
    }

    const data = (await res.json().catch(() => ({}))) as GeminiResp;
    if (res.ok && !data.error) {
      const text = data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("")
        .trim();
      if (text) return { text };
      const reason = data.candidates?.[0]?.finishReason;
      return {
        error:
          reason === "SAFETY"
            ? "That image couldn't be processed (content safety). Try a different photo."
            : "No response from the vision model. Try again.",
      };
    }

    lastCode = data.error?.code ?? res.status;
    lastError = data.error?.message ?? "Vision request failed.";
    if (![429, 500, 502, 503].includes(lastCode)) break; // non-retryable
  }

  return { error: lastError, code: lastCode };
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
    platform?: string;
    count?: number;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  const mode =
    body.mode === "transform"
      ? "transform"
      : body.mode === "caption"
        ? "caption"
        : "analyze";
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
    return Response.json({ error: "Upload an image first." }, { status: 422 });
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

  /* --------------------------------- caption -------------------------------- */
  if (mode === "caption") {
    const platform = [
      "instagram",
      "linkedin",
      "facebook",
      "x",
      "tiktok",
    ].includes(body.platform ?? "")
      ? (body.platform as string)
      : "instagram";
    const out = await geminiVision(
      apiKey,
      "You are a social media manager. Look at the image and write ready-to-post copy " +
        `tuned for ${platform} — match that platform's tone and length. ` +
        "Provide: altText (concise SEO alt text, one sentence), caption (a scroll-stopping " +
        "post caption, 1–2 lines, at most one emoji), hashtags (6–8 relevant tags WITHOUT " +
        "the # symbol), and adText (2–3 line conversion-focused ad primary text).",
      imageData,
      mimeType,
      700,
      0.85,
      {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            altText: { type: "string" },
            caption: { type: "string" },
            hashtags: { type: "array", items: { type: "string" } },
            adText: { type: "string" },
          },
          required: ["altText", "caption", "hashtags", "adText"],
        },
      },
    );
    if (out.error || !out.text) {
      const friendly =
        out.code === 429
          ? "The free vision quota is busy right now — try again in a moment."
          : out.error ?? "Couldn't read that image. Try another.";
      return Response.json({ error: friendly }, { status: 502 });
    }
    try {
      const parsed = JSON.parse(out.text) as {
        altText?: string;
        caption?: string;
        hashtags?: string[];
        adText?: string;
      };
      return Response.json({
        status: "ok",
        mode: "caption",
        platform,
        altText: parsed.altText ?? "",
        caption: parsed.caption ?? "",
        hashtags: Array.isArray(parsed.hashtags)
          ? parsed.hashtags.map((h) => String(h).replace(/^#/, "")).slice(0, 10)
          : [],
        adText: parsed.adText ?? "",
      });
    } catch {
      return Response.json(
        { error: "Couldn't format the copy. Try again." },
        { status: 502 },
      );
    }
  }

  /* -------------------------------- transform ------------------------------- */
  const styleKey =
    body.style && STYLE_MODIFIERS[body.style] ? body.style : "cartoon";
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
  const count = Math.min(Math.max(Number(body.count) || 1, 1), 4);
  const base = Date.now() % 1_000_000;
  const images = Array.from({ length: count }, (_, i) =>
    proxiedImage(finalPrompt, width, height, (base + i * 7919) % 1_000_000),
  );

  return Response.json({
    status: "ok",
    mode: "transform",
    image: images[0],
    images,
    style: styleKey,
    caption,
  });
}
