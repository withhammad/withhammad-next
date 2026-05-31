"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Reveal from "@/components/tools/Reveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Mode = "create" | "transform" | "analyze";
type Status = "idle" | "loading" | "done" | "error";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "create", label: "Create", hint: "Text → image" },
  { id: "transform", label: "Transform", hint: "Photo → new style" },
  { id: "analyze", label: "Analyze", hint: "Photo → insights" },
];

const ASPECTS = [
  { id: "1:1", label: "Square" },
  { id: "16:9", label: "Landscape" },
  { id: "9:16", label: "Portrait" },
  { id: "3:2", label: "Classic" },
] as const;

// "Create" styles are folded into the text prompt client-side.
const CREATE_STYLES: { id: string; label: string; mod: string }[] = [
  { id: "", label: "None", mod: "" },
  { id: "photoreal", label: "Photoreal", mod: "ultra-realistic photograph, 50mm, natural light, high detail" },
  { id: "render3d", label: "3D Render", mod: "glossy 3D render, soft studio lighting, premium product shot" },
  { id: "cartoon", label: "Cartoon", mod: "vibrant cartoon illustration, bold clean outlines, flat cel shading" },
  { id: "anime", label: "Anime", mod: "anime key art, cel shaded, expressive, studio quality" },
  { id: "cyberpunk", label: "Cyberpunk", mod: "neon cyberpunk, magenta and cyan glow, futuristic, cinematic" },
  { id: "watercolor", label: "Watercolor", mod: "soft watercolor painting, delicate washes, paper texture" },
  { id: "minimal", label: "Minimal", mod: "minimal clean design, generous negative space, elegant" },
];

// "Transform" style keys MUST match STYLE_MODIFIERS in /api/image-vision/route.ts.
const TRANSFORM_STYLES: { id: string; label: string }[] = [
  { id: "cartoon", label: "Cartoon" },
  { id: "anime", label: "Anime" },
  { id: "pixar", label: "3D Pixar" },
  { id: "oil", label: "Oil Paint" },
  { id: "watercolor", label: "Watercolor" },
  { id: "cyberpunk", label: "Cyberpunk" },
  { id: "popart", label: "Pop Art" },
  { id: "surreal", label: "Surreal ✦" },
];

const STORAGE_KEY = "wh:img-email";
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const FIELD =
  "h-11 w-full rounded-xl border border-white/10 bg-[var(--bg)] px-3.5 text-sm text-[var(--text)] placeholder:text-white/30 focus:border-[var(--accent-indigo)] focus:outline-none";

const chip = (active: boolean) =>
  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors " +
  (active
    ? "bg-[var(--accent-indigo)] text-white"
    : "border border-white/12 text-[var(--muted)] hover:border-white/30 hover:text-[var(--text)]");

/** Downscale to ≤1024px on the long edge and re-encode as JPEG to keep payloads small. */
async function processFile(
  file: File,
): Promise<{ preview: string; base64: string; mime: string }> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error("read failed"));
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new window.Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("decode failed"));
    i.src = dataUrl;
  });
  const maxDim = 1024;
  let { width, height } = img;
  if (Math.max(width, height) > maxDim) {
    const s = maxDim / Math.max(width, height);
    width = Math.round(width * s);
    height = Math.round(height * s);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(img, 0, 0, width, height);
  const out = canvas.toDataURL("image/jpeg", 0.82);
  return { preview: out, base64: out.split(",")[1] ?? "", mime: "image/jpeg" };
}

/** Lightweight Markdown-ish renderer (bold + bullets) for the Analyze output. */
function RichText({ text }: { text: string }) {
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  return (
    <div className="space-y-2.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const bullet = /^[-*]\s+/.test(line);
        const clean = line.replace(/^[-*]\s+/, "");
        const parts = clean.split(/\*\*(.+?)\*\*/g);
        const nodes = parts.map((p, idx) =>
          idx % 2 === 1 ? (
            <strong key={idx} className="font-semibold text-[var(--text)]">
              {p}
            </strong>
          ) : (
            <span key={idx} className="text-[var(--muted)]">
              {p}
            </span>
          ),
        );
        return bullet ? (
          <div key={i} className="flex gap-2">
            <span className="mt-0.5 text-[var(--accent-indigo)]">•</span>
            <p>{nodes}</p>
          </div>
        ) : (
          <p key={i}>{nodes}</p>
        );
      })}
    </div>
  );
}

export default function ImageGenerator() {
  const reduced = useReducedMotion();
  const fileInput = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [gateError, setGateError] = useState("");

  const [mode, setMode] = useState<Mode>("create");
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState<string>("1:1");
  const [createStyle, setCreateStyle] = useState("");
  const [transformStyle, setTransformStyle] = useState("cartoon");

  const [preview, setPreview] = useState("");
  const [imgBase64, setImgBase64] = useState("");
  const [imgMime, setImgMime] = useState("image/jpeg");

  const [status, setStatus] = useState<Status>("idle");
  const [image, setImage] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && isEmail(saved)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time email-unlock hydration from storage
        setEmail(saved);
        setUnlocked(true);
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  const unlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) {
      setGateError("Please enter a valid email.");
      return;
    }
    setGateError("");
    setUnlocked(true);
    try {
      localStorage.setItem(STORAGE_KEY, email.trim());
    } catch {
      /* ignore */
    }
  };

  const resetResults = () => {
    setStatus("idle");
    setImage("");
    setAnalysis("");
    setError("");
  };

  const switchMode = (m: Mode) => {
    if (m === mode) return;
    setMode(m);
    resetResults();
  };

  const onFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      setStatus("error");
      return;
    }
    try {
      const { preview: p, base64, mime } = await processFile(file);
      setPreview(p);
      setImgBase64(base64);
      setImgMime(mime);
      resetResults();
    } catch {
      setError("Couldn't read that image. Try another file.");
      setStatus("error");
    }
  };

  const run = async () => {
    if (status === "loading") return;

    if (mode === "create") {
      if (!prompt.trim()) return;
      setStatus("loading");
      setError("");
      setImage("");
      const mod = CREATE_STYLES.find((s) => s.id === createStyle)?.mod;
      const finalPrompt = mod ? `${prompt.trim()}, ${mod}` : prompt.trim();
      try {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, prompt: finalPrompt, aspectRatio: aspect }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          image?: string;
          error?: string;
        };
        if (!res.ok || !data.image) {
          setError(data.error ?? "Something went wrong. Please try again.");
          setStatus("error");
          return;
        }
        setImage(data.image);
        setStatus("done");
      } catch {
        setError("Network error. Please try again.");
        setStatus("error");
      }
      return;
    }

    // transform + analyze both need an uploaded image
    if (!imgBase64) {
      setError("Upload an image first.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");
    setImage("");
    setAnalysis("");
    try {
      const res = await fetch("/api/image-vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          mode,
          imageData: imgBase64,
          mimeType: imgMime,
          style: transformStyle,
          prompt: mode === "transform" ? prompt.trim() : undefined,
          aspectRatio: aspect,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        image?: string;
        text?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      if (mode === "analyze") {
        setAnalysis(data.text ?? "");
      } else {
        if (!data.image) {
          setError("Couldn't transform that image. Try again.");
          setStatus("error");
          return;
        }
        setImage(data.image);
      }
      setStatus("done");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  };

  /* ----------------------------- email gate ----------------------------- */
  if (!unlocked) {
    return (
      <Reveal className="mx-auto max-w-md">
        <form
          onSubmit={unlock}
          className="rounded-2xl border border-white/10 bg-[var(--panel)] p-6 text-center sm:p-8"
        >
          <span
            className="mx-auto grid h-12 w-12 place-items-center rounded-full text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-indigo), var(--accent-amber))",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
            </svg>
          </span>
          <h2 className="mt-4 text-lg font-semibold text-[var(--text)]">
            Unlock the AI image studio
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Pop in your email and start creating — it&apos;s free and unlimited.
            Generate, restyle, and analyze images.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            className={FIELD + " mt-5 text-center"}
          />
          {gateError ? (
            <p className="mt-2 text-xs text-red-400">{gateError}</p>
          ) : null}
          <button
            type="submit"
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--accent-indigo)] text-sm font-medium text-white transition-colors hover:bg-[#7C7DF3]"
          >
            Unlock studio
          </button>
        </form>
      </Reveal>
    );
  }

  const needsUpload = mode === "transform" || mode === "analyze";
  const canRun =
    mode === "create" ? Boolean(prompt.trim()) : Boolean(imgBase64);
  const runLabel =
    status === "loading"
      ? mode === "analyze"
        ? "Analyzing…"
        : mode === "transform"
          ? "Reimagining…"
          : "Generating…"
      : mode === "analyze"
        ? "Analyze image"
        : mode === "transform"
          ? "Transform image"
          : "Generate image";

  /* ------------------------------- studio ------------------------------- */
  return (
    <Reveal className="space-y-6">
      {/* Mode switcher */}
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-[var(--panel)] p-1.5">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => switchMode(m.id)}
            className={
              "rounded-xl px-3 py-2.5 text-center transition-colors " +
              (mode === m.id
                ? "bg-[var(--accent-indigo)] text-white"
                : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--text)]")
            }
          >
            <span className="block text-sm font-semibold">{m.label}</span>
            <span className="block text-[11px] opacity-70">{m.hint}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        {/* ----------------------------- controls ----------------------------- */}
        <div className="rounded-2xl border border-white/10 bg-[var(--panel)] p-5 sm:p-6">
          {/* Upload (transform + analyze) */}
          {needsUpload ? (
            <div className="mb-5">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                Your image
              </span>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  onFile(e.dataTransfer.files?.[0]);
                }}
                className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/20 bg-[var(--bg)] text-center transition-colors hover:border-[var(--accent-indigo)]"
              >
                {preview ? (
                  <>
                    <Image
                      src={preview}
                      alt="Upload preview"
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 460px"
                      className="object-contain"
                    />
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white backdrop-blur">
                      Change
                    </span>
                  </>
                ) : (
                  <span className="px-6 text-sm text-[var(--muted)]">
                    Click to upload or drag an image here
                    <span className="mt-1 block text-[11px] opacity-60">
                      JPG, PNG or WebP
                    </span>
                  </span>
                )}
              </button>
            </div>
          ) : null}

          {/* Prompt (create) / optional twist (transform) */}
          {mode !== "analyze" ? (
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                {mode === "create" ? "Describe your image" : "Add a twist (optional)"}
              </span>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === "create"
                    ? "e.g. a sleek 3D render of a glowing AI chip on a dark studio backdrop, premium product shot"
                    : "e.g. add dramatic neon rim lighting, golden hour, snow falling…"
                }
                className={FIELD + " h-24 resize-none py-2.5"}
              />
            </label>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Upload any image and get a creative-director breakdown: subject,
              mood, palette, what works, and how to make it a stronger ad.
            </p>
          )}

          {/* Style presets */}
          {mode === "create" ? (
            <div className="mt-5">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                Style
              </span>
              <div className="flex flex-wrap gap-2">
                {CREATE_STYLES.map((s) => (
                  <button
                    key={s.id || "none"}
                    type="button"
                    onClick={() => setCreateStyle(s.id)}
                    className={chip(createStyle === s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {mode === "transform" ? (
            <div className="mt-5">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                Restyle as
              </span>
              <div className="flex flex-wrap gap-2">
                {TRANSFORM_STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setTransformStyle(s.id)}
                    className={chip(transformStyle === s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Aspect ratio (create + transform) */}
          {mode !== "analyze" ? (
            <div className="mt-5">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                Aspect ratio
              </span>
              <div className="flex flex-wrap gap-2">
                {ASPECTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAspect(a.id)}
                    className={chip(aspect === a.id)}
                  >
                    {a.label}{" "}
                    <span className="text-[11px] opacity-60">{a.id}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={run}
            disabled={status === "loading" || !canRun}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--accent-indigo)] text-sm font-medium text-white transition-colors hover:bg-[#7C7DF3] disabled:opacity-40"
          >
            {runLabel}
          </button>
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Free · unlimited · powered by AI
          </p>
        </div>

        {/* ------------------------------ output ------------------------------ */}
        <div className="lg:sticky lg:top-24">
          {mode === "analyze" ? (
            <div className="min-h-[24rem] rounded-2xl border border-white/10 bg-[var(--panel)] p-6">
              {status === "done" && analysis ? (
                <>
                  {preview ? (
                    <div className="relative mb-4 h-40 overflow-hidden rounded-xl border border-white/10 bg-[var(--bg)]">
                      <Image
                        src={preview}
                        alt="Analyzed image"
                        fill
                        unoptimized
                        sizes="(max-width: 1024px) 100vw, 520px"
                        className="object-contain"
                      />
                    </div>
                  ) : null}
                  <RichText text={analysis} />
                </>
              ) : (
                <div className="grid min-h-[20rem] place-items-center text-center">
                  {status === "loading" ? (
                    <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
                      <span
                        className={
                          "h-8 w-8 rounded-full border-2 border-white/15 border-t-[var(--accent-indigo)] " +
                          (reduced ? "" : "animate-spin")
                        }
                      />
                      <span className="text-sm">Analyzing your image…</span>
                    </div>
                  ) : status === "error" ? (
                    <p className="text-sm text-[var(--muted)]">{error}</p>
                  ) : (
                    <p className="text-sm text-[var(--muted)]">
                      Your image analysis will appear here.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)]">
                {status === "done" && image ? (
                  <Image
                    src={image}
                    alt={prompt || "Generated image"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 520px"
                    unoptimized
                    className="object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center p-8 text-center">
                    {status === "loading" ? (
                      <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
                        <span
                          className={
                            "h-8 w-8 rounded-full border-2 border-white/15 border-t-[var(--accent-indigo)] " +
                            (reduced ? "" : "animate-spin")
                          }
                        />
                        <span className="text-sm">
                          {mode === "transform"
                            ? "Reimagining your photo…"
                            : "Painting your image…"}
                        </span>
                      </div>
                    ) : status === "error" ? (
                      <p className="text-sm text-[var(--muted)]">{error}</p>
                    ) : (
                      <p className="text-sm text-[var(--muted)]">
                        {mode === "transform"
                          ? "Your restyled image will appear here."
                          : "Your generated image will appear here."}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {status === "done" && image ? (
                <a
                  href={image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-indigo)] hover:underline"
                >
                  Open full size ↗
                </a>
              ) : null}
            </>
          )}
        </div>
      </div>
    </Reveal>
  );
}
