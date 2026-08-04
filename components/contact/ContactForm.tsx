"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

type Status = "idle" | "sending" | "ok" | "error";

const FIELD =
  "w-full rounded-xl border border-white/12 bg-[var(--bg)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)]/70 outline-none transition-colors focus:border-[var(--accent)]";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const data = new FormData(form);
    // Honeypot: bots fill hidden fields.
    if ((data.get("website") as string)?.trim()) {
      setStatus("ok");
      trackEvent("contact_form_submit", { location: window.location.pathname });
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          company: data.get("company"),
          message: data.get("message"),
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (res.ok && json.ok) {
        setStatus("ok");
        trackEvent("contact_form_submit", { location: window.location.pathname });
        form.reset();
      } else {
        setStatus("error");
        setError(json.error || "Something went wrong. Please email me directly.");
      }
    } catch {
      setStatus("error");
      setError("Network error. Please email me directly.");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-3xl border border-[var(--accent)]/40 bg-[var(--panel)] p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/15 text-2xl text-[var(--accent)]">
          ✓
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-[var(--text)]">
          Message sent
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--muted)]">
          Thanks — I&apos;ll get back to you within one business day. Prefer to
          talk sooner? Book a call on the right.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-white/10 bg-[var(--panel)] p-7 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm text-[var(--muted)]">Name *</span>
          <input name="name" required autoComplete="name" className={FIELD} placeholder="Your name" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-[var(--muted)]">Email *</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={FIELD}
            placeholder="you@company.com"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm text-[var(--muted)]">
          Company <span className="opacity-60">(optional)</span>
        </span>
        <input name="company" autoComplete="organization" className={FIELD} placeholder="Company / brand" />
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm text-[var(--muted)]">
          What can I help with? *
        </span>
        <textarea
          name="message"
          required
          rows={5}
          className={FIELD + " resize-y"}
          placeholder="A few lines on your goals, channels, and where you're stuck…"
        />
      </label>

      {/* Honeypot — hidden from humans */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {status === "error" ? (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--accent)] px-7 text-sm font-medium text-[var(--accent-ink)] shadow-[0_12px_32px_-12px_rgba(255,140,0,0.45)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#FFA31A] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
      <p className="mt-3 text-center text-xs text-[var(--muted)]">
        I reply within one business day. No spam, ever.
      </p>
    </form>
  );
}
