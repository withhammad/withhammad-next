export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Same-origin image proxy for Pollinations. The browser hits this route (same
// origin → no ORB), and we fetch the actual image server-side with retry,
// returning it with a guaranteed image/* content type. See lib/pollinations.ts.

const POLLINATIONS_HOST = "image.pollinations.ai";
const UA =
  "Mozilla/5.0 (compatible; withhammad.com/1.0; +https://withhammad.com)";

// Reliable free provider: Cloudflare Workers AI (set CF_ACCOUNT_ID + CF_AI_TOKEN
// in env). SDXL-Lightning honours width/height, is fast, and is genuinely free
// (~hundreds of images/day). Falls back to keyless Pollinations when unset.
const CF_ACCOUNT = process.env.CF_ACCOUNT_ID;
const CF_TOKEN = process.env.CF_AI_TOKEN;
const CF_MODEL =
  process.env.CF_AI_MODEL ?? "@cf/bytedance/stable-diffusion-xl-lightning";

async function cloudflareImage(
  prompt: string,
  width: number,
  height: number,
  seed: number,
): Promise<{ buf: ArrayBuffer | Buffer; ct: string } | null> {
  if (!CF_ACCOUNT || !CF_TOKEN) return null;
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/run/${CF_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, width, height, num_steps: 6, seed }),
        signal: AbortSignal.timeout(20000),
        cache: "no-store",
      },
    );
    const ct = res.headers.get("content-type") ?? "";
    if (!res.ok) return null;
    // SD models return a binary image; Flux returns JSON { result: { image: b64 } }.
    if (ct.startsWith("image/")) {
      const buf = await res.arrayBuffer();
      return buf.byteLength > 1000 ? { buf, ct } : null;
    }
    if (ct.includes("json")) {
      const data = (await res.json()) as { result?: { image?: string } };
      const b64 = data.result?.image;
      if (b64) return { buf: Buffer.from(b64, "base64"), ct: "image/jpeg" };
    }
  } catch {
    /* fall through to Pollinations */
  }
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const prompt = (searchParams.get("p") ?? "").trim().slice(0, 1500);
  const w = Math.min(Math.max(Number(searchParams.get("w")) || 1024, 64), 2048);
  const h = Math.min(Math.max(Number(searchParams.get("h")) || 1024, 64), 2048);
  const seed = Math.abs(Number(searchParams.get("seed")) || 0) % 1_000_000;
  const modelRaw = searchParams.get("model") ?? "flux";
  const model = /^[a-z0-9.-]{1,30}$/i.test(modelRaw) ? modelRaw : "flux";

  if (!prompt) {
    return new Response("Missing prompt", { status: 400 });
  }

  // Primary: Cloudflare Workers AI (reliable, free) when configured.
  const cf = await cloudflareImage(prompt, w, h, seed);
  if (cf) {
    return new Response(cf.buf, {
      status: 200,
      headers: {
        "Content-Type": cf.ct,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Fallback: keyless Pollinations.
  // Pollinations' free tier is flaky (intermittent 402/403/timeout), so retry a
  // few times, alternating models, with a per-attempt timeout so a hang doesn't
  // eat the whole budget. Any non-image response is treated as retryable.
  const models = [model, "turbo", "flux"];
  for (let attempt = 0; attempt < models.length; attempt += 1) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, 400));
    }
    const target = `https://${POLLINATIONS_HOST}/prompt/${encodeURIComponent(
      prompt,
    )}?width=${w}&height=${h}&model=${models[attempt]}&nologo=true&seed=${seed}`;
    try {
      const res = await fetch(target, {
        cache: "no-store",
        headers: { "User-Agent": UA, Accept: "image/*" },
        signal: AbortSignal.timeout(9000),
      });
      const ct = res.headers.get("content-type") ?? "";
      if (res.ok && ct.startsWith("image/")) {
        const buf = await res.arrayBuffer();
        if (buf.byteLength > 1000) {
          return new Response(buf, {
            status: 200,
            headers: {
              "Content-Type": ct,
              // Immutable: prompt+seed fully determines the image.
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }
      }
    } catch {
      /* timeout / network — retry next model */
    }
  }

  return new Response("Image temporarily unavailable", {
    status: 502,
    headers: { "Cache-Control": "no-store" },
  });
}
