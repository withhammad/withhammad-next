"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/easing";

type MobileMenuProps = {
  links: readonly { label: string; href: string }[];
  calendlyUrl: string;
  cvUrl: string;
  onClose: () => void;
};

const overlay = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: EASE_OUT,
      when: "beforeChildren",
      staggerChildren: 0.06,
      delayChildren: 0.12,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: EASE_OUT },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: 0.2 },
  },
};

export default function MobileMenu({
  links,
  calendlyUrl,
  cvUrl,
  onClose,
}: MobileMenuProps) {
  return (
    <motion.div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      variants={overlay}
      initial="hidden"
      animate="show"
      exit="exit"
      className="fixed inset-0 z-40 flex flex-col bg-[var(--bg)] px-6 pt-24 pb-10 md:hidden"
    >
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <motion.div key={link.href} variants={item}>
            <Link
              href={link.href}
              onClick={onClose}
              className="block py-4 text-4xl font-semibold tracking-tight text-[var(--text)] border-b border-white/5 hover:text-[var(--accent-2)] transition-colors"
            >
              {link.label}
            </Link>
          </motion.div>
        ))}
      </nav>

      <motion.div
        variants={item}
        className="mt-auto flex flex-col gap-3 pt-10"
      >
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-base font-medium text-[var(--accent-ink)]"
        >
          Book a Call
        </a>
        <a
          href={cvUrl}
          download
          onClick={onClose}
          className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-base text-[var(--text)]"
        >
          Download CV
        </a>
      </motion.div>
    </motion.div>
  );
}
