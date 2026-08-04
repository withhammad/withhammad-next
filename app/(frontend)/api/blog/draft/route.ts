import { NextResponse } from "next/server";
import { editorConfigFactory, convertMarkdownToLexical } from "@payloadcms/richtext-lexical";
import { payloadClient } from "@/lib/payload";
import { KEYWORD_CLUSTERS, getBrief, type Brief } from "@/lib/content-briefs";

// AI draft pipeline — generates a post and writes it to Payload as a DRAFT.
//
// Lives in a route rather than a standalone script on purpose: Payload's Local
// API is already wired here (every content fetcher uses it), whereas a bare
// script has to boot Payload through its own runner, which can't resolve the
// config's extensionless imports. `npm run draft` is a thin client for this.
//
// NEVER publishes. _status is hard-coded to "draft" and the collection has
// versions.drafts enabled, so a human must hit Publish in /admin.

export const runtime = "nodejs";
export const maxDuration = 120;

const VOICE = `Hammad Yousuf's voice: practical, builder-first, direct. He has shipped these systems, so he writes from evidence, not theory. Short paragraphs. Concrete numbers in AED where relevant. GCC/Dubai context. No hype, no "in today's fast-paced world", no filler. First person where natural. He is comfortable saying what did NOT work.`;

function buildPrompt(topic: string, brief?: Brief) {
  const briefBlock = brief
    ? `BRIEF
Working title: ${brief.workingTitle}
Target keyword: ${brief.targetKeyword}
Search intent: ${brief.intent}
Angle: ${brief.angle}
Must cover:
${brief.mustCover.map((m) => `- ${m}`).join("\n")}
Internal links to weave in naturally: ${brief.internalLinks.join(", ")}
Closing CTA: ${brief.cta}`
    : `TOPIC: ${topic}
Pick the most relevant target keyword from these clusters:
${[...KEYWORD_CLUSTERS.primary, ...KEYWORD_CLUSTERS.longTail].map((k) => `- ${k}`).join("\n")}`;

  return `Write a blog post for withhammad.com, the site of an AI Marketing Automation Engineer in Dubai.

${briefBlock}

VOICE
${VOICE}

RULES
- 1200-1800 words.
- Strictly AI / marketing / automation. Never write about YouTube channel content or a content niche.
- Only claim these verified numbers if relevant: 3,750 conversions on AED 42K spend; +18% ROAS quarter over quarter; weekly ad optimisation 9 hours down to 2; 80 real-estate leads at AED 76.38 CPL; CTR +30% and CPA -22% at ICON; leads +30% and CPA -28% at Deewan. Invent NOTHING beyond these.
- Markdown with ## and ### headings, short paragraphs. No H1 (the page renders the title).
- Internal links as markdown links to the given relative paths.

Respond in EXACTLY this format — metadata as JSON, then the body as raw
markdown after the delimiter. Do not wrap either part in code fences.

---META---
{"title":"","slug":"","excerpt":"","metaTitle":"","metaDescription":"","targetKeyword":"","category":"","tags":[""]}
---BODY---
(the full markdown post here)

- slug: lowercase, hyphenated, no dates. metaTitle <= 60 chars. metaDescription <= 155 chars.`;
}

async function callAnthropic(prompt: string, key: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_DRAFT_MODEL || "claude-sonnet-4-5",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return j.content?.[0]?.text ?? "";
}

async function callGemini(prompt: string, key: string, model: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 8000, temperature: 0.7 },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return (
    j.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("") ?? ""
  );
}

/** Gemini's free tier 503s under load — retry across models before giving up. */
async function generate(prompt: string): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) return callAnthropic(prompt, anthropicKey);

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error("No ANTHROPIC_API_KEY or GEMINI_API_KEY set");

  const models = [
    process.env.GEMINI_DRAFT_MODEL || "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
  ];
  let lastErr: unknown;
  for (let i = 0; i < models.length * 2; i++) {
    try {
      const out = await callGemini(prompt, geminiKey, models[i % models.length]);
      if (out.trim()) return out;
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (!/50\d|429|UNAVAILABLE|overloaded|high demand/i.test(msg)) throw err;
      await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
    }
  }
  throw lastErr ?? new Error("generation failed");
}

/**
 * Metadata as JSON, body as raw markdown after a delimiter. Asking a model to
 * JSON-escape a 1500-word markdown document is unreliable — unescaped newlines
 * break the parse. Keeping the body outside the JSON removes that failure mode
 * entirely.
 */
function parseResponse(raw: string): Record<string, unknown> & { markdown: string } {
  const cleaned = raw.replace(/```[a-z]*\n?/gi, "").trim();
  const bodyIdx = cleaned.search(/---\s*BODY\s*---/i);
  if (bodyIdx === -1) throw new Error("Model response missing ---BODY--- delimiter");

  const metaPart = cleaned.slice(0, bodyIdx).replace(/---\s*META\s*---/i, "").trim();
  const markdown = cleaned.slice(bodyIdx).replace(/^---\s*BODY\s*---/i, "").trim();

  const s = metaPart.indexOf("{");
  const e = metaPart.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("Model response missing metadata JSON");
  const meta = JSON.parse(metaPart.slice(s, e + 1));

  if (!meta.title || !meta.slug) throw new Error("Metadata missing title or slug");
  if (markdown.split(/\s+/).length < 300) throw new Error("Body too short — generation likely truncated");
  return { ...meta, markdown };
}

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET not configured — this write endpoint stays closed." },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  let briefId: string | undefined;
  let topic = "";
  try {
    const body = await req.json();
    briefId = typeof body.brief === "string" ? body.brief : undefined;
    topic = typeof body.topic === "string" ? body.topic : "";
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const brief = briefId ? getBrief(briefId) : undefined;
  if (briefId && !brief) {
    return NextResponse.json({ error: `unknown brief "${briefId}"` }, { status: 400 });
  }
  if (!brief && !topic) {
    return NextResponse.json({ error: "provide brief or topic" }, { status: 400 });
  }

  try {
    const raw = await generate(buildPrompt(topic, brief));
    const post = parseResponse(raw);
    const payload = await payloadClient();

    const exists = await payload.count({
      collection: "posts",
      where: { slug: { equals: post.slug } },
    });
    if (exists.totalDocs > 0) {
      return NextResponse.json(
        { error: `slug "${post.slug}" already exists` },
        { status: 409 },
      );
    }

    const editorConfig = await editorConfigFactory.default({ config: payload.config });
    const content = convertMarkdownToLexical({
      editorConfig,
      markdown: String(post.markdown),
    });

    const doc = await payload.create({
      collection: "posts",
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        category: post.category || "AI & Automation",
        tags: Array.isArray(post.tags) ? post.tags : [],
        targetKeyword: post.targetKeyword ?? brief?.targetKeyword,
        aiDraft: true,
        sourceBrief: brief ? `${brief.id}: ${brief.workingTitle}` : topic,
        content: content as unknown as Record<string, unknown>,
        meta: { title: post.metaTitle, description: post.metaDescription },
        // THE GATE — never "published".
        _status: "draft",
      },
    });

    return NextResponse.json({
      ok: true,
      id: doc.id,
      title: post.title,
      slug: post.slug,
      words: String(post.markdown).split(/\s+/).length,
      status: "draft",
      review: `/admin/collections/posts/${doc.id}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[draft] failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
