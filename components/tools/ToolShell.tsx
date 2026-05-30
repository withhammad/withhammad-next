import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared chrome for an individual tool page: back-link, eyebrow badge, title,
 * subtitle, and a subtle top glow. Server component — interactive bits live in
 * the client tool passed as children.
 */
export default function ToolShell({
  badge,
  title,
  subtitle,
  children,
}: {
  badge?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="relative mx-auto min-h-[100svh] max-w-6xl px-5 pb-28 pt-28 sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-64 opacity-50"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, color-mix(in oklab, var(--accent-indigo) 22%, transparent), transparent 70%)",
        }}
      />

      <Link
        href="/tools"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
      >
        <span aria-hidden>←</span> All tools
      </Link>

      <div className="mt-6 max-w-2xl">
        {badge ? (
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-indigo)]" />
            {badge}
          </span>
        ) : null}
        <h1
          className="font-semibold tracking-tight text-[var(--text)]"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", lineHeight: 1.05 }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 text-[var(--muted)] sm:text-lg">{subtitle}</p>
        ) : null}
      </div>

      <div className="mt-10">{children}</div>
    </section>
  );
}
