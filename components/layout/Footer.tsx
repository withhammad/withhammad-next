"use client";

import Link from "next/link";
import { useState } from "react";
import { LINKEDIN_URL } from "@/lib/person";

const SOCIAL = [
  {
    label: "LinkedIn",
    href: LINKEDIN_URL,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@with.hammad",
  },
  {
    label: "Portfolio",
    href: "/",
  },
] as const;

const NAV = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/#services" },
  { label: "Tools", href: "/tools" },
  { label: "Products", href: "/products" },
  { label: "About", href: "/#about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Newsletter wiring lands in Prompt 12 with the lead API.
    setSubmitted(true);
  };

  const year = 2026; // pinned for deterministic SSR; bump on yearly review.

  return (
    <footer className="relative mt-32 border-t border-white/5 bg-[var(--panel)] text-[var(--muted)]">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr_1.3fr]">
        <div>
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-[var(--text)]"
          >
            Hammad Yousuf
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            AI-driven growth for founders who want results, not reports.
            Performance marketing, paid media, and AI creative — Dubai, UAE.
          </p>
          <a
            href="mailto:marketing@withhammad.com"
            className="mt-4 inline-block text-sm text-[var(--text)] hover:text-[var(--accent-2)] transition-colors"
          >
            marketing@withhammad.com
          </a>
        </div>

        <div>
          <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Site
          </h3>
          <ul className="space-y-2 text-sm">
            {NAV.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-[var(--text)] hover:text-[var(--accent-2)] transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Social
          </h3>
          <ul className="space-y-2 text-sm">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target={s.href.startsWith("/") ? undefined : "_blank"}
                  rel={
                    s.href.startsWith("/") ? undefined : "noopener noreferrer"
                  }
                  className="text-[var(--text)] hover:text-[var(--accent-2)] transition-colors"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Newsletter
          </h3>
          <p className="mb-3 text-sm">
            Monthly notes on AI-driven growth. No fluff.
          </p>
          <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              Email
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="h-10 flex-1 rounded-full border border-white/10 bg-[var(--bg)] px-4 text-sm text-[var(--text)] placeholder:text-white/30 focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              type="submit"
              className="h-10 rounded-full bg-[var(--text)] px-4 text-sm font-medium text-[var(--bg)] transition-colors hover:bg-[var(--accent-2)]"
            >
              {submitted ? "Thanks" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-6 py-6 text-xs sm:flex-row sm:items-center sm:px-8">
          <span>© {year} Hammad Yousuf. All rights reserved.</span>
          <span>Dubai · United Arab Emirates</span>
        </div>
      </div>
    </footer>
  );
}
