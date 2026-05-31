import Link from "next/link";
import type { ReactNode } from "react";
import GradientCover from "@/components/ui/GradientCover";

/**
 * Shared chrome for an individual tool page: back-link, a branded GradientCover
 * header graphic (seeded by the tool name), title and subtitle. Server
 * component — interactive bits live in the client tool passed as children.
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
      <Link
        href="/tools"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
      >
        <span aria-hidden>←</span> All tools
      </Link>

      {/* Branded header graphic — deterministic from the tool name. */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
        <div className="relative h-28 sm:h-40">
          <GradientCover seed={title} variant="hero" eyebrow={badge} />
        </div>
      </div>

      <div className="mt-6 max-w-2xl">
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
