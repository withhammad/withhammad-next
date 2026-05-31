"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Reveal from "@/components/tools/Reveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ASPECTS = [
  { id: "1:1", label: "Square" },
  { id: "16:9", label: "Landscape" },
  { id: "9:16", label: "Portrait" },
  { id: "3:2", label: "Classic" },
] as const;

const STORAGE_KEY = "wh:img-email";

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

type Status = "idle" | "loading" | "done" | "error" | "soon";

const FIELD =
  "h-11 w-full rounded-xl border border-white/10 bg-[var(--bg)] px-3.5 text-sm text-[var(--text)] placeholder:text-white/30 focus:border-[var(--accent-indigo)] focus:outline-none";

export default function ImageGenerator() {
  const reduced = useReducedMotion();
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [gateError, setGateError] = useState("");

  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState<string>("1:1");
  const [status, setStatus] = useState<Status>("idle");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  // Restore a previous email unlock.
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

  const generate = async () => {
    if (status === "loading" || !prompt.trim()) return;
    setStatus("loading");
    setError("");
    setImage("");
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, prompt, aspectRatio: aspect }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        status?: string;
        image?: string;
        error?: string;
      };

      if (data.status === "coming_soon") {
        setStatus("soon");
        return;
      }
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
            Unlock the image generator
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Pop in your email and start creating — it&apos;s free. This keeps the
            tool sustainable.
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
            Unlock generator
          </button>
        </form>
      </Reveal>
    );
  }

  /* ----------------------------- generator ------------------------------ */
  return (
    <Reveal className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      <div className="rounded-2xl border border-white/10 bg-[var(--panel)] p-5 sm:p-6">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
            Describe your image
          </span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. a sleek 3D render of a glowing AI chip on a dark studio backdrop, premium product shot"
            className={FIELD + " h-28 resize-none py-2.5"}
          />
        </label>

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
                className={
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors " +
                  (aspect === a.id
                    ? "bg-[var(--accent-indigo)] text-white"
                    : "border border-white/12 text-[var(--muted)] hover:border-white/30 hover:text-[var(--text)]")
                }
              >
                {a.label}{" "}
                <span className="text-[11px] opacity-60">{a.id}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={status === "loading" || !prompt.trim()}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--accent-indigo)] text-sm font-medium text-white transition-colors hover:bg-[#7C7DF3] disabled:opacity-40"
        >
          {status === "loading" ? "Generating…" : "Generate image"}
        </button>
        <p className="mt-3 text-center text-xs text-[var(--muted)]">
          Free · unlimited generations
        </p>
      </div>

      {/* Output */}
      <div className="lg:sticky lg:top-24">
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
                  <span className="text-sm">Painting your image…</span>
                </div>
              ) : status === "soon" ? (
                <div className="text-[var(--muted)]">
                  <p className="text-sm font-medium text-[var(--text)]">
                    Image generation is coming soon
                  </p>
                  <p className="mt-2 text-sm">
                    The generator isn&apos;t connected to an image provider yet —
                    check back shortly.
                  </p>
                </div>
              ) : status === "error" ? (
                <p className="text-sm text-[var(--muted)]">{error}</p>
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  Your generated image will appear here.
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
      </div>
    </Reveal>
  );
}
