export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Provider is configurable. Default: Flux Schnell on Replicate (fast + cheap).
// Swap by setting REPLICATE_MODEL to any Replicate model "owner/name".
const MODEL = process.env.REPLICATE_MODEL ?? "black-forest-labs/flux-schnell";

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

interface ReplicatePrediction {
  status?: string;
  output?: string | string[] | null;
  error?: string | null;
  urls?: { get?: string };
}

// Poll fallback in case the model doesn't finish within the `Prefer: wait` window.
async function settle(
  pred: ReplicatePrediction,
  token: string,
): Promise<ReplicatePrediction> {
  let current = pred;
  let tries = 0;
  while (
    current &&
    (current.status === "starting" || current.status === "processing") &&
    current.urls?.get &&
    tries < 30
  ) {
    await new Promise((r) => setTimeout(r, 1500));
    const res = await fetch(current.urls.get, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    current = (await res.json()) as ReplicatePrediction;
    tries += 1;
  }
  return current;
}

export async function POST(req: Request) {
  let body: { email?: string; prompt?: string; aspectRatio?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  const prompt = (body.prompt ?? "").trim().slice(0, 800);
  const aspectRatio = ["1:1", "16:9", "9:16", "3:2"].includes(
    body.aspectRatio ?? "",
  )
    ? (body.aspectRatio as string)
    : "1:1";

  if (!isEmail(email)) {
    return Response.json(
      { error: "Enter a valid email to unlock the generator." },
      { status: 422 },
    );
  }
  if (!prompt) {
    return Response.json(
      { error: "Describe the image you want to create." },
      { status: 422 },
    );
  }

  // No rate limit — Pollinations is free, so generation is unlimited.
  // (The email gate above still validates + could feed a CRM / newsletter later.)

  // Free, keyless provider (Pollinations) so the tool works at zero cost out of
  // the box — the image renders straight from the returned URL (the <Image> is
  // already `unoptimized`). Set REPLICATE_API_TOKEN to upgrade to Flux Schnell.
  if (!process.env.REPLICATE_API_TOKEN) {
    const dims: Record<string, [number, number]> = {
      "1:1": [1024, 1024],
      "16:9": [1280, 720],
      "9:16": [720, 1280],
      "3:2": [1200, 800],
    };
    const [width, height] = dims[aspectRatio] ?? [1024, 1024];
    const seed = Date.now() % 1_000_000;
    const image = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt,
    )}?width=${width}&height=${height}&model=flux&nologo=true&seed=${seed}`;
    return Response.json({ status: "ok", image });
  }

  try {
    const res = await fetch(
      `https://api.replicate.com/v1/models/${MODEL}/predictions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({
          input: {
            prompt,
            num_outputs: 1,
            aspect_ratio: aspectRatio,
            output_format: "webp",
          },
        }),
        cache: "no-store",
      },
    );

    const data = (await res.json()) as ReplicatePrediction;
    if (!res.ok) {
      console.error("[generate-image] replicate error:", data);
      return Response.json(
        { error: "Image generation failed. Please try again." },
        { status: 502 },
      );
    }

    const final = await settle(data, process.env.REPLICATE_API_TOKEN);
    const out = Array.isArray(final.output) ? final.output[0] : final.output;

    if (final.status === "failed" || !out) {
      return Response.json(
        { error: final.error || "Image generation failed. Please try again." },
        { status: 502 },
      );
    }

    return Response.json({ status: "ok", image: out });
  } catch (err) {
    console.error("[generate-image] failed:", err);
    return Response.json(
      { error: "Image generation failed. Please try again." },
      { status: 502 },
    );
  }
}
