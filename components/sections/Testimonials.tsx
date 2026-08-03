"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT } from "@/lib/easing";
import type { Testimonial } from "@/lib/wp-queries";

export default function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const reduced = useReducedMotion();
  const [[page, dir], setPage] = useState<[number, number]>([0, 0]);

  // Section hides entirely when there are no published testimonials.
  if (testimonials.length === 0) return null;

  const count = testimonials.length;
  const active = ((page % count) + count) % count;
  const t = testimonials[active];
  const f = t.testimonialFields;
  const paginate = (d: number) => setPage([page + d, d]);

  const body = (
    <figure className="mx-auto max-w-3xl">
      <blockquote
        className="font-medium tracking-tight text-[var(--text)]"
        style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", lineHeight: 1.32 }}
      >
        &ldquo;{f?.quote}&rdquo;
      </blockquote>
      {f?.personName ? (
        <figcaption className="mt-6 text-[var(--muted)]">
          <span className="font-medium text-[var(--text)]">
            {f.personName}
          </span>
          {f.personTitle ? ` · ${f.personTitle}` : ""}
          {f.linkedinUrl ? (
            <>
              {" · "}
              <a
                href={f.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                LinkedIn
              </a>
            </>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );

  return (
    <section
      id="testimonials"
      className="relative scroll-mt-24 py-24 text-center sm:py-32"
    >
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <span className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          In their words
        </span>

        <div className="relative mt-4 min-h-[180px] sm:min-h-[200px]">
          {reduced ? (
            <div>{body}</div>
          ) : (
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={active}
                custom={dir}
                initial={{ opacity: 0, x: dir >= 0 ? 48 : -48 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir >= 0 ? -48 : 48 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                className="will-change-transform"
              >
                {body}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {count > 1 ? (
          <div className="mt-10 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="Previous testimonial"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-[var(--text)] transition-colors hover:border-white/40 hover:bg-white/5"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="h-4 w-4"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPage([i, i >= active ? 1 : -1])}
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={i === active}
                  className={
                    "h-1.5 rounded-full transition-all " +
                    (i === active
                      ? "w-6 bg-[var(--accent-2)]"
                      : "w-1.5 bg-white/20 hover:bg-white/40")
                  }
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="Next testimonial"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-[var(--text)] transition-colors hover:border-white/40 hover:bg-white/5"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="h-4 w-4"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
