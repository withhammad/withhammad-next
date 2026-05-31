"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Reveal from "@/components/tools/Reveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Mode = "create" | "transform" | "analyze" | "caption";
type Status = "idle" | "loading" | "done" | "error";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "create", label: "Create", hint: "Text → image" },
  { id: "transform", label: "Transform", hint: "Photo → restyle" },
  { id: "analyze", label: "Analyze", hint: "Photo → insights" },
  { id: "caption", label: "Caption", hint: "Photo → copy" },
];

const ASPECTS = [
  { id: "1:1", label: "Square" },
  { id: "16:9", label: "Landscape" },
  { id: "9:16", label: "Portrait" },
  { id: "3:2", label: "Classic" },
] as const;

const COUNTS = [1, 4];

const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "facebook", label: "Facebook" },
  { id: "x", label: "X" },
  { id: "tiktok", label: "TikTok" },
];

// "Create" styles are folded into the text prompt client-side.
const CREATE_STYLES: { id: string; label: string; mod: string }[] = [
  { id: "", label: "None", mod: "" },
  { id: "photoreal", label: "Photoreal", mod: "ultra-realistic photograph, 50mm, natural light, high detail" },
  { id: "render3d", label: "3D Render", mod: "glossy 3D render, soft studio lighting, premium product shot" },
  { id: "cartoon", label: "Cartoon", mod: "vibrant cartoon illustration, bold clean outlines, flat cel shading" },
  { id: "anime", label: "Anime", mod: "anime key art, cel shaded, expressive, studio quality" },
  { id: "comic", label: "Comic", mod: "comic-book panel, heavy ink outlines, halftone shading, dynamic" },
  { id: "sketch", label: "Sketch", mod: "graphite pencil sketch, cross-hatching, sketchbook texture, monochrome" },
  { id: "pixel", label: "Pixel Art", mod: "retro 8-bit pixel art, chunky pixels, limited palette" },
  { id: "cyberpunk", label: "Cyberpunk", mod: "neon cyberpunk, magenta and cyan glow, futuristic, cinematic" },
  { id: "vaporwave", label: "Vaporwave", mod: "vaporwave aesthetic, pastel pink and cyan, retro 80s grid, chrome" },
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
  { id: "comic", label: "Comic" },
  { id: "sketch", label: "Sketch" },
  { id: "pixel", label: "Pixel Art" },
  { id: "claymation", label: "Claymation" },
  { id: "lowpoly", label: "Low Poly" },
  { id: "vaporwave", label: "Vaporwave" },
  { id: "sticker", label: "Sticker" },
  { id: "lineart", label: "Line Art" },
  { id: "renaissance", label: "Renaissance" },
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

interface CaptionData {
  altText: string;
  caption: string;
  hashtags: string[];
  adText: string;
  platform: string;
}

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

function Spinner({ msg, reduced }: { msg: string; reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
      <span
        className={
          "h-8 w-8 rounded-full border-2 border-white/15 border-t-[var(--accent-indigo)] " +
          (reduced ? "" : "animate-spin")
        }
      />
      <span className="text-sm">{msg}</span>
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked */
        }
      }}
      className="shrink-0 rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent-indigo)] hover:text-[var(--text)]"
    >
      {done ? "Copied ✓" : "Copy"}
    </button>
  );
}

function CopyBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[var(--bg)] p-3.5">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
          {label}
        </span>
        <CopyBtn text={value} />
      </div>
      <p className="text-sm leading-relaxed text-[var(--text)]">{value}</p>
    </div>
  );
}

function ResultImage({
  src,
  alt,
  reduced,
}: {
  src: string;
  alt: string;
  reduced: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)]">
      {!failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 520px"
          unoptimized
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={
            "object-contain transition-opacity duration-300 " +
            (loaded ? "opacity-100" : "opacity-0")
          }
        />
      ) : null}
      {!loaded && !failed ? (
        <div className="absolute inset-0 grid place-items-center">
          <span
            className={
              "h-7 w-7 rounded-full border-2 border-white/15 border-t-[var(--accent-indigo)] " +
              (reduced ? "" : "animate-spin")
            }
          />
        </div>
      ) : null}
      {failed ? (
        <div className="absolute inset-0 grid place-items-center p-4 text-center">
          <p className="text-xs text-[var(--muted)]">
            Couldn&apos;t load this one.{" "}
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-indigo)] underline"
            >
              Open directly ↗
            </a>
          </p>
        </div>
      ) : null}
      {loaded ? (
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
        >
          Open ↗
        </a>
      ) : null}
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
  const [count, setCount] = useState(1);
  const [createStyle, setCreateStyle] = useState("");
  const [transformStyle, setTransformStyle] = useState("cartoon");
  const [platform, setPlatform] = useState("instagram");

  const [preview, setPreview] = useState("");
  const [imgBase64, setImgBase64] = useState("");
  const [imgMime, setImgMime] = useState("image/jpeg");

  const [status, setStatus] = useState<Status>("idle");
  const [enhancing, setEnhancing] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState("");
  const [captionData, setCaptionData] = useState<CaptionData | null>(null);
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
    setImages([]);
    setAnalysis("");
    setCaptionData(null);
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

  const enhance = async () => {
    if (enhancing || !prompt.trim()) return;
    setEnhancing(true);
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, prompt: prompt.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { prompt?: string };
      if (data.prompt) setPrompt(data.prompt);
    } catch {
      /* leave prompt as-is */
    } finally {
      setEnhancing(false);
    }
  };

  const run = async () => {
    if (status === "loading") return;

    if (mode === "create") {
      if (!prompt.trim()) return;
      setStatus("loading");
      setError("");
      setImages([]);
      const mod = CREATE_STYLES.find((s) => s.id === createStyle)?.mod;
      const finalPrompt = mod ? `${prompt.trim()}, ${mod}` : prompt.trim();
      try {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            prompt: finalPrompt,
            aspectRatio: aspect,
            count,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          image?: string;
          images?: string[];
          error?: string;
        };
        const out = data.images?.length ? data.images : data.image ? [data.image] : [];
        if (!res.ok || out.length === 0) {
          setError(data.error ?? "Something went wrong. Please try again.");
          setStatus("error");
          return;
        }
        setImages(out);
        setStatus("done");
      } catch {
        setError("Network error. Please try again.");
        setStatus("error");
      }
      return;
    }

    // transform + analyze + caption need an uploaded image
    if (!imgBase64) {
      setError("Upload an image first.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");
    setImages([]);
    setAnalysis("");
    setCaptionData(null);
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
          count,
          platform,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        image?: string;
        images?: string[];
        text?: string;
        altText?: string;
        caption?: string;
        hashtags?: string[];
        adText?: string;
        platform?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      if (mode === "analyze") {
        setAnalysis(data.text ?? "");
      } else if (mode === "caption") {
        setCaptionData({
          altText: data.altText ?? "",
          caption: data.caption ?? "",
          hashtags: data.hashtags ?? [],
          adText: data.adText ?? "",
          platform: data.platform ?? platform,
        });
      } else {
        const out = data.images?.length ? data.images : data.image ? [data.image] : [];
        if (out.length === 0) {
          setError("Couldn't transform that image. Try again.");
          setStatus("error");
          return;
        }
        setImages(out);
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
            Generate, restyle, analyze, and caption images.
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

  const needsUpload = mode !== "create";
  const showImageControls = mode === "create" || mode === "transform";
  const canRun = mode === "create" ? Boolean(prompt.trim()) : Boolean(imgBase64);
  const runLabel =
    status === "loading"
      ? mode === "analyze"
        ? "Analyzing…"
        : mode === "caption"
          ? "Writing copy…"
          : mode === "transform"
            ? "Reimagining…"
            : "Generating…"
      : mode === "analyze"
        ? "Analyze image"
        : mode === "caption"
          ? "Write copy"
          : mode === "transform"
            ? "Transform image"
            : "Generate image";

  /* ------------------------------- studio ------------------------------- */
  return (
    <Reveal className="space-y-6">
      {/* Mode switcher */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[var(--panel)] p-1.5 sm:grid-cols-4">
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
          {/* Upload (transform + analyze + caption) */}
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
          {mode === "create" || mode === "transform" ? (
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
          ) : null}

          {/* Enhance (create only) */}
          {mode === "create" ? (
            <button
              type="button"
              onClick={enhance}
              disabled={enhancing || !prompt.trim()}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent-indigo)] hover:text-[var(--text)] disabled:opacity-40"
            >
              {enhancing ? "Enhancing…" : "✨ Enhance prompt"}
            </button>
          ) : null}

          {mode === "caption" ? (
            <p className="text-sm text-[var(--muted)]">
              Upload any image and get ready-to-post copy — SEO alt text, a
              scroll-stopping caption, hashtags, and ad text, tuned per platform.
            </p>
          ) : null}

          {mode === "analyze" ? (
            <p className="text-sm text-[var(--muted)]">
              Upload any image and get a creative-director breakdown: subject,
              mood, palette, what works, and how to make it a stronger ad.
            </p>
          ) : null}

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

          {/* Platform (caption only) */}
          {mode === "caption" ? (
            <div className="mt-5">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                Platform
              </span>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={chip(platform === p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Aspect ratio + count (create + transform) */}
          {showImageControls ? (
            <>
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

              <div className="mt-5">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                  How many
                </span>
                <div className="flex flex-wrap gap-2">
                  {COUNTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCount(c)}
                      className={chip(count === c)}
                    >
                      {c} image{c > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </div>
            </>
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
                    <Spinner msg="Analyzing your image…" reduced={reduced} />
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
          ) : mode === "caption" ? (
            <div className="min-h-[24rem] rounded-2xl border border-white/10 bg-[var(--panel)] p-6">
              {status === "done" && captionData ? (
                <div className="space-y-3">
                  {preview ? (
                    <div className="relative mb-1 h-36 overflow-hidden rounded-xl border border-white/10 bg-[var(--bg)]">
                      <Image
                        src={preview}
                        alt="Captioned image"
                        fill
                        unoptimized
                        sizes="(max-width: 1024px) 100vw, 520px"
                        className="object-contain"
                      />
                    </div>
                  ) : null}
                  <CopyBlock label="Alt text (SEO)" value={captionData.altText} />
                  <CopyBlock label="Caption" value={captionData.caption} />
                  <div className="rounded-xl border border-white/10 bg-[var(--bg)] p-3.5">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                        Hashtags
                      </span>
                      <CopyBtn
                        text={captionData.hashtags.map((h) => `#${h}`).join(" ")}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {captionData.hashtags.map((h) => (
                        <span
                          key={h}
                          className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-[var(--accent-indigo)]"
                        >
                          #{h}
                        </span>
                      ))}
                    </div>
                  </div>
                  <CopyBlock label="Ad primary text" value={captionData.adText} />
                </div>
              ) : (
                <div className="grid min-h-[20rem] place-items-center text-center">
                  {status === "loading" ? (
                    <Spinner msg="Writing your copy…" reduced={reduced} />
                  ) : status === "error" ? (
                    <p className="text-sm text-[var(--muted)]">{error}</p>
                  ) : (
                    <p className="text-sm text-[var(--muted)]">
                      Your ready-to-post copy will appear here.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {status === "done" && images.length ? (
                <div
                  className={images.length > 1 ? "grid grid-cols-2 gap-3" : ""}
                >
                  {images.map((src, i) => (
                    <ResultImage
                      key={src}
                      src={src}
                      alt={`${prompt || "Result"} ${i + 1}`}
                      reduced={reduced}
                    />
                  ))}
                </div>
              ) : (
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)]">
                  <div className="absolute inset-0 grid place-items-center p-8 text-center">
                    {status === "loading" ? (
                      <Spinner
                        reduced={reduced}
                        msg={
                          mode === "transform"
                            ? "Reimagining your photo…"
                            : "Painting your image…"
                        }
                      />
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
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Reveal>
  );
}
