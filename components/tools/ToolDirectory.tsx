"use client";

import { useMemo, useState } from "react";
import Reveal from "@/components/tools/Reveal";
import {
  DIRECTORY_CATEGORIES,
  type DirectoryCategory,
  type DirectoryTool,
} from "@/lib/tool-directory";

const CAT_LABEL: Record<DirectoryCategory, string> = {
  writing: "Writing",
  image: "Image",
  automation: "Automation",
  analytics: "Analytics",
  seo: "SEO",
};

type Filter = "all" | DirectoryCategory;

export default function ToolDirectory({ tools }: { tools: DirectoryTool[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
      const matchesCat = filter === "all" || t.category === filter;
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.useCase.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [filter, query, tools]);

  const countFor = (f: Filter) =>
    f === "all"
      ? tools.length
      : tools.filter((t) => t.category === f).length;

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    ...DIRECTORY_CATEGORIES.map((c) => ({ id: c.id as Filter, label: c.label })),
  ];

  return (
    <Reveal>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors " +
                (filter === t.id
                  ? "bg-[var(--accent-indigo)] text-white"
                  : "border border-white/12 text-[var(--muted)] hover:border-white/30 hover:text-[var(--text)]")
              }
            >
              {t.label}
              <span
                className={
                  "text-[11px] " +
                  (filter === t.id ? "text-white/70" : "text-white/35")
                }
              >
                {countFor(t.id)}
              </span>
            </button>
          ))}
        </div>

        <label className="relative lg:w-64">
          <span className="sr-only">Search tools</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            className="h-11 w-full rounded-full border border-white/10 bg-[var(--bg)] pl-9 pr-3 text-sm text-[var(--text)] placeholder:text-white/30 focus:border-[var(--accent-indigo)] focus:outline-none"
          />
        </label>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <a
              key={t.name}
              href={t.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col rounded-2xl border border-white/10 bg-[var(--panel)] p-5 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/25"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-semibold tracking-tight text-[var(--text)]">
                  {t.name}
                </span>
                <span
                  aria-hidden
                  className="text-[var(--muted)] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[var(--accent-indigo)]"
                >
                  ↗
                </span>
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                {t.useCase}
              </p>
              <span className="mt-4 inline-flex w-fit items-center rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-[var(--muted)]">
                {CAT_LABEL[t.category]}
              </span>
            </a>
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-2xl border border-dashed border-white/12 py-16 text-center text-sm text-[var(--muted)]">
          No tools match “{query}”. Try another search or category.
        </div>
      )}
    </Reveal>
  );
}
