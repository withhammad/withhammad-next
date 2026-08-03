"use client";

// HUD-style proof buttons per project: LIVE DEMO ↗ / LINKEDIN PROOF ↗ /
// FULL CASE STUDY →. Null links are hidden; TODO links render only in
// development, with a ⚠ badge, so unfinished proof never ships to visitors.
// Every click fires GA4 `case_link_click` so link CTR is trackable.

import Link from "next/link";
import { caseLinks, isTodo, type CaseLink } from "@/lib/case-links";
import { trackEvent } from "@/lib/analytics";

const DEV = process.env.NODE_ENV === "development";

type Kind = { key: keyof CaseLink; label: string; external: boolean };
const KINDS: Kind[] = [
  { key: "demo", label: "LIVE DEMO ↗", external: true },
  { key: "linkedin", label: "LINKEDIN PROOF ↗", external: true },
  { key: "writeup", label: "FULL CASE STUDY →", external: false },
];

export default function CaseLinks({
  linkKey,
  hideWriteup = false,
  className = "",
}: {
  linkKey: string;
  /** On the case-study page itself, the writeup button is noise. */
  hideWriteup?: boolean;
  className?: string;
}) {
  const links = caseLinks[linkKey];
  if (!links) return null;

  const btn =
    "inline-flex items-center gap-1.5 border border-[var(--line)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-150 hover:border-[var(--accent)] hover:text-[var(--accent)]";

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {KINDS.map(({ key, label, external }) => {
        if (hideWriteup && key === "writeup") return null;
        const raw = links[key];
        if (!raw) return null;
        const todo = isTodo(raw);
        if (todo && !DEV) return null;

        const onClick = () =>
          trackEvent("case_link_click", { project: linkKey, type: key });

        if (todo) {
          return (
            <span
              key={key}
              className={`${btn} cursor-not-allowed border-dashed text-[var(--muted)]`}
              title="Dev only: fill this link in lib/case-links.ts (see LINKS-TODO.md)"
            >
              ⚠ {label}
            </span>
          );
        }
        return external ? (
          <a
            key={key}
            href={raw}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClick}
            data-cursor="OPEN"
            className={`${btn} text-[var(--text)]`}
          >
            {label}
          </a>
        ) : (
          <Link
            key={key}
            href={raw}
            onClick={onClick}
            data-cursor="OPEN"
            className={`${btn} text-[var(--text)]`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
