import Link from "next/link";
import { AI_SYSTEMS } from "@/lib/ai-systems";

// Homepage teaser for the AI-engineer positioning. Server component on purpose:
// the interactive 3D version lives on /work, so the homepage pays no WebGL cost
// beyond the hero.
export default function AISystemsTeaser() {
  return (
    <section
      id="ai-systems-teaser"
      className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-indigo)]" />
            AI Systems &amp; Agents
          </span>
          <h2
            className="mt-5 max-w-2xl font-semibold tracking-tight text-[var(--text)]"
            style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.06 }}
          >
            Agents that work while you sleep.
          </h2>
          <p className="mt-5 max-w-xl text-[var(--muted)] sm:text-lg">
            Production AI systems built with Claude Code, n8n + MCP, RAG and
            multi-agent orchestration — running campaign optimisation, lead
            qualification and reporting on their own.
          </p>
        </div>
        <Link
          href="/work#ai-systems"
          className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-medium text-[var(--text)] transition-colors hover:border-white/40 hover:bg-white/5"
        >
          Explore in 3D →
        </Link>
      </div>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AI_SYSTEMS.map((s) => (
          <li key={s.id}>
            <Link
              href="/work#ai-systems"
              className="group flex h-full flex-col rounded-2xl border border-white/10 bg-[var(--panel)] p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/25"
            >
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                  s.status === "production"
                    ? "border-[var(--accent-amber)]/40 text-[var(--accent-amber)]"
                    : "border-[var(--accent-indigo)]/50 text-[var(--accent-indigo)]"
                }`}
              >
                {s.status === "production" ? "In production" : "In development"}
              </span>
              {s.metric ? (
                <span
                  className="mt-5 font-semibold tracking-tight text-[var(--accent-amber)]"
                  style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}
                >
                  {s.metric}
                </span>
              ) : null}
              <span className="mt-1 text-sm text-[var(--muted)]">
                {s.metricLabel}
              </span>
              <span className="mt-4 font-medium text-[var(--text)]">
                {s.name}
              </span>
              <span className="mt-1 text-sm text-[var(--muted)]">{s.role}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
