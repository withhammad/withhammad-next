"use client";

// Word/char mask-reveal for display type. Each unit sits in an overflow-hidden
// span and rises into view with the signature ease. Screen readers get the
// intact string via aria-label; the visual split is aria-hidden.

import { motion } from "framer-motion";
import { EASE, STAGGER_TIGHT } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function SplitText({
  text,
  by = "word",
  as: Tag = "span",
  className = "",
  delay = 0,
  stagger = STAGGER_TIGHT,
  once = true,
}: {
  text: string;
  by?: "word" | "char";
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}) {
  const reduced = useReducedMotion();
  const units =
    by === "word" ? text.split(" ").map((w) => w + " ") : [...text];

  if (reduced) {
    // Full text, no animation, no split — nothing to wait for.
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        aria-hidden
        className="inline"
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: "-10% 0px" }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: stagger, delayChildren: delay },
          },
        }}
      >
        {units.map((u, i) => (
          <span
            key={i}
            className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-baseline"
          >
            <motion.span
              className="inline-block will-change-transform"
              variants={{
                hidden: { y: "115%" },
                visible: { y: "0%", transition: { duration: 0.8, ease: EASE } },
              }}
            >
              {u}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
