export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Same-origin image proxy for Pollinations. The browser hits this route (same
// origin → no ORB), and we fetch the actual image server-side with retry,
// returning it with a guaranteed image/* content type. See lib/pollinations.ts.

const POLLINATIONS_HOST = "image.pollinations.ai";
const UA =
  "Mozilla/5.0 (compatible; withhammad.com/1.0; +https://withhammad.com)";

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
