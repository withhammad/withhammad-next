"use client";

// Mission select — the projects as an editorial index list. Large display
// rows: numeral + name + one-liner + mono stack. Hover slides the row, draws
// an amber underline, and floats a preview panel that follows the cursor.
// Every row carries its proof buttons (CaseLinks).

import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { PROJECTS, STATUS_LABEL, type Project } from "@/lib/projects";
import CaseLinks from "@/components/hud/CaseLinks";
import { EASE } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function Row({ p, index }: { p: Project; index: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.li
      initial={reduced ? undefined : { opacity: 0, y: 32 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay: (index % 4) * 0.05 }}
      className="group border-b border-[var(--line)]"
    >
      <Link
        href={`/projects/${p.slug}`}
        data-cursor="OPEN"
        className="relative block py-7 transition-transform duration-300 ease-out group-hover:translate-x-2 sm:py-9"
      >
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <span className="font-mono text-[11px] tracking-[0.3em] text-[var(--accent)]/70">
            {p.codename}
          </span>
          <h3
            className="font-display font-semibold uppercase leading-none text-[var(--text)] transition-colors duration-300 group-hover:text-[var(--accent)]"
            style={{ fontSize: "clamp(1.7rem, 4.4vw, 3.4rem)" }}
          >
            {p.name}
          </h3>
          <span
            className={`ml-auto font-mono text-[9px] uppercase tracking-[0.22em] ${
              p.status === "building"
                ? "text-[var(--accent-cool)]"
                : "text-[var(--accent-2)]"
            }`}
          >
            {STATUS_LABEL[p.status]}
          </span>
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          {p.oneLiner}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]/70">
            {p.stack.slice(0, 4).join(" · ")}
          </span>
          {p.metric ? (
            <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--accent)]">
              {p.metric} <span className="text-[var(--muted)]/70">{p.metricLabel}</span>
            </span>
          ) : null}
        </div>

        {/* amber underline draw */}
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
        />
      </Link>

      <div className="pb-6 sm:-mt-3">
        <CaseLinks linkKey={p.linkKey} />
      </div>
    </motion.li>
  );
}

export default function MissionIndex({ limit }: { limit?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<{ x: number; y: number; p: Project } | null>(null);
  const reduced = useReducedMotion();
  const list = limit ? PROJECTS.slice(0, limit) : PROJECTS;

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseMove={(e) => {
        if (reduced) return;
        const row = (e.target as HTMLElement).closest("li");
        if (!row || !wrapRef.current) {
          setPreview(null);
          return;
        }
        const idx = Array.from(wrapRef.current.querySelectorAll("li")).indexOf(row);
        const rect = wrapRef.current.getBoundingClientRect();
        if (idx >= 0)
          setPreview({ x: e.clientX - rect.left, y: e.clientY - rect.top, p: list[idx] });
      }}
      onMouseLeave={() => setPreview(null)}
    >
      <ul>
        {list.map((p, i) => (
          <Row key={p.slug} p={p} index={i} />
        ))}
      </ul>

      {/* floating preview panel — desktop pointer only */}
      {preview && (
        <div
          aria-hidden
          className="pointer-events-none absolute z-10 hidden w-64 -translate-y-1/2 border border-[var(--accent)]/30 bg-[var(--bg-deep)]/95 p-4 backdrop-blur lg:block"
          style={{ left: Math.min(preview.x + 32, 900), top: preview.y }}
        >
          <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--accent)]">
            {preview.p.codename} · {STATUS_LABEL[preview.p.status]}
          </div>
          <div className="mt-2 font-display text-lg font-semibold uppercase text-[var(--text)]">
            {preview.p.name}
          </div>
          {preview.p.pullStats[0] ? (
            <div className="mt-3 border-t border-[var(--line)] pt-3">
              <span className="text-xl font-semibold text-[var(--accent)]">
                {preview.p.pullStats[0].value}
              </span>
              <span className="ml-2 text-[11px] text-[var(--muted)]">
                {preview.p.pullStats[0].label}
              </span>
            </div>
          ) : null}
          <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]/70">
            OPEN MISSION FILE →
          </div>
        </div>
      )}
    </div>
  );
}
