"use client";

import { useState } from "react";
import Reveal from "@/components/tools/Reveal";
import CopyButton from "@/components/tools/CopyButton";

const PLATFORMS = ["Google Ads", "Meta", "LinkedIn", "TikTok"] as const;

const FIELD =
  "h-11 w-full rounded-xl border border-white/10 bg-[var(--bg)] px-3.5 text-sm text-[var(--text)] placeholder:text-white/30 focus:border-[var(--accent)] focus:outline-none";

type Status = "idle" | "streaming" | "done" | "error";

export default function AdCopyWriter() {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [offer, setOffer] = useState("");
  const [tone, setTone] = useState("");
  const [platform, setPlatform] = useState<string>(PLATFORMS[0]);

  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const busy = status === "streaming";

  const generate = async () => {
    if (busy || !product.trim()) return;
    setOutput("");
    setError("");
    setStatus("streaming");
    try {
      const res = await fetch("/api/ad-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, audience, offer, tone, platform }),
      });

      if (res.status === 429 || res.status === 422) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Please try again.");
        setStatus("error");
        return;
      }
      if (!res.ok || !res.body) throw new Error("no stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        const text = chunk.value
          ? decoder.decode(chunk.value, { stream: true })
          : "";
        if (text) setOutput((prev) => prev + text);
      }
      setStatus("done");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <Reveal className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      {/* Controls */}
      <div className="rounded-2xl border border-white/10 bg-[var(--panel)] p-5 sm:p-6">
        <div className="mb-5">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
            Platform
          </span>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors " +
                  (platform === p
                    ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                    : "border border-white/12 text-[var(--muted)] hover:border-white/30 hover:text-[var(--text)]")
                }
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Product / service
            </span>
            <input
              className={FIELD}
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. AI bookkeeping app for freelancers"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Target audience
            </span>
            <input
              className={FIELD}
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. solo founders doing $5k–20k/mo"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Offer / USP{" "}
              <span className="normal-case text-white/30">(optional)</span>
            </span>
            <input
              className={FIELD}
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder="e.g. save 5 hrs/week, free 14-day trial"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Tone <span className="normal-case text-white/30">(optional)</span>
            </span>
            <input
              className={FIELD}
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="e.g. bold, friendly, premium"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={busy || !product.trim()}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] text-sm font-medium text-[var(--accent-ink)] transition-colors hover:bg-[#FFA31A] disabled:opacity-40"
        >
          {busy ? "Writing…" : "Generate ad copy"}
        </button>
        <p className="mt-3 text-center text-xs text-[var(--muted)]">
          Free · 8 generations per hour
        </p>
      </div>

      {/* Output */}
      <div className="lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)]">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
            <span className="text-sm font-medium text-[var(--text)]">
              Your ad copy
            </span>
            {output ? <CopyButton value={output} label="Copy all" /> : null}
          </div>

          <div className="max-h-[60vh] min-h-[260px] overflow-auto px-5 py-4">
            {error ? (
              <p className="text-sm text-[var(--muted)]">{error}</p>
            ) : output ? (
              <pre className="font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-[var(--text)]">
                {output}
                {busy ? (
                  <span className="text-[var(--accent)]">▍</span>
                ) : null}
              </pre>
            ) : busy ? (
              <p className="text-sm text-[var(--muted)]">
                Writing your copy…
              </p>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                Your headlines and descriptions will appear here. Fill in the
                brief and hit Generate.
              </p>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
