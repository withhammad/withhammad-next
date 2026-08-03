"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AI_SYSTEMS, IN_PROGRESS, type AISystem } from "@/lib/ai-systems";

// WebGL is client-only and below the fold — never ship it in the server render
// or the initial bundle.
const AgentNetwork3D = dynamic(() => import("./AgentNetwork3D"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full animate-pulse rounded-2xl border border-white/10 bg-[var(--panel)] sm:h-[520px]" />
  ),
});

function StatusPill({ status }: { status: AISystem["status"] }) {
  const production = status === "production";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
        production
          ? "border-[var(--accent-2)]/40 text-[var(--accent-2)]"
          : "border-[var(--accent-cool)]/50 text-[var(--accent-cool)]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          production ? "bg-[var(--accent-2)]" : "bg-[var(--accent-cool)]"
        }`}
      />
      {production ? "In production" : "In development"}
    </span>
  );
}

export default function AISystemsSection() {
  const [selectedId, setSelectedId] = useState<string>(AI_SYSTEMS[0].id);
  const selected =
    AI_SYSTEMS.find((s) => s.id === selectedId) ?? AI_SYSTEMS[0];

  return (
    <section
      id="ai-systems"
      className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24"
    >
      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        AI Systems &amp; Agents
      </span>
      <h2
        className="mt-5 max-w-3xl font-semibold tracking-tight text-[var(--text)]"
        style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", lineHeight: 1.06 }}
      >
        The systems behind the numbers.
      </h2>
      <p className="mt-5 max-w-2xl text-[var(--muted)] sm:text-lg">
        Campaign results are the output. These are the production AI agents and
        multi-agent systems that produce them — built with Claude Code, n8n +
        MCP, RAG and multi-agent orchestration.
      </p>

      {/* 3D constellation + detail panel */}
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)]">
          <AgentNetwork3D
            systems={AI_SYSTEMS}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[var(--panel)] p-6 sm:p-8">
          <StatusPill status={selected.status} />
          <h3 className="mt-4 text-xl font-semibold tracking-tight text-[var(--text)]">
            {selected.name}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{selected.role}</p>

          {selected.metric ? (
            <div className="mt-6">
              <div
                className="font-semibold tracking-tight text-[var(--accent-2)]"
                style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)" }}
              >
                {selected.metric}
              </div>
              <div className="mt-1 text-sm text-[var(--muted)]">
                {selected.metricLabel}
              </div>
            </div>
          ) : null}

          <p className="mt-6 text-sm leading-relaxed text-[var(--muted)]">
            {selected.summary}
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {selected.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-[var(--muted)]"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Full list stays in the DOM as real, selectable text — the 3D scene is
          an enhancement, never the only way to read this content. */}
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AI_SYSTEMS.map((s) => {
          const active = s.id === selectedId;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setSelectedId(s.id)}
                aria-pressed={active}
                className={`flex h-full w-full cursor-pointer flex-col rounded-2xl border p-5 text-left transition-[transform,border-color,background-color] duration-300 hover:-translate-y-0.5 ${
                  active
                    ? "border-[var(--accent)]/60 bg-[var(--accent)]/5"
                    : "border-white/10 bg-[var(--panel)] hover:border-white/25"
                }`}
              >
                <StatusPill status={s.status} />
                <span className="mt-3 font-medium text-[var(--text)]">
                  {s.name}
                </span>
                <span className="mt-1 text-sm text-[var(--muted)]">
                  {s.role}
                </span>
                {s.metric ? (
                  <span className="mt-4 text-sm">
                    <span className="font-semibold text-[var(--accent-2)]">
                      {s.metric}
                    </span>{" "}
                    <span className="text-[var(--muted)]">{s.metricLabel}</span>
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 rounded-2xl border border-dashed border-white/12 p-6">
        <h3 className="text-sm font-medium text-[var(--text)]">
          Currently building
        </h3>
        <ul className="mt-3 space-y-1.5">
          {IN_PROGRESS.map((item) => (
            <li key={item} className="text-sm text-[var(--muted)]">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
