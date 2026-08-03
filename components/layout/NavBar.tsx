"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MobileMenu from "@/components/layout/MobileMenu";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT } from "@/lib/easing";

const NAV_LINKS = [
  { label: "Work", href: "/work" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Services", href: "/#services" },
  { label: "Tools", href: "/tools" },
  { label: "Products", href: "/products" },
  { label: "About", href: "/#about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com/withhammad-marketing/30min";
const CV_URL = "/Hammad-Yousuf-CV.pdf";

export default function NavBar() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastYRef = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Don't hide nav when mobile menu open
      if (mobileOpen) {
        setHidden(false);
        lastYRef.current = y;
        return;
      }
      // Only hide once we're past a small threshold to avoid jitter at top
      if (y > 120 && y > lastYRef.current) {
        setHidden(true);
      } else if (y < lastYRef.current) {
        setHidden(false);
      }
      lastYRef.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileOpen]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: hidden && !reduced ? -120 : 0 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className={
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300 " +
          (scrolled
            ? "backdrop-blur-md bg-[color-mix(in_oklab,var(--bg)_70%,transparent)] border-b border-white/5"
            : "bg-transparent border-b border-transparent")
        }
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-[var(--text)] hover:text-[var(--accent-2)] transition-colors"
            aria-label="Hammad Yousuf — home"
          >
            Hammad Yousuf
          </Link>

          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-7"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href={CV_URL}
              className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              download
            >
              Download CV
            </a>
            <MagneticCTA href={CALENDLY_URL}>Book a Call</MagneticCTA>
          </div>

          {/* Mobile trigger */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden relative h-10 w-10 grid place-items-center text-[var(--text)]"
          >
            <span
              className="absolute h-px w-6 bg-current transition-transform duration-300"
              style={{
                transform: mobileOpen
                  ? "translateY(0) rotate(45deg)"
                  : "translateY(-5px) rotate(0)",
              }}
            />
            <span
              className="absolute h-px w-6 bg-current transition-opacity duration-200"
              style={{ opacity: mobileOpen ? 0 : 1 }}
            />
            <span
              className="absolute h-px w-6 bg-current transition-transform duration-300"
              style={{
                transform: mobileOpen
                  ? "translateY(0) rotate(-45deg)"
                  : "translateY(5px) rotate(0)",
              }}
            />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu
            links={NAV_LINKS}
            calendlyUrl={CALENDLY_URL}
            cvUrl={CV_URL}
            onClose={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function MagneticCTA({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    // Skip magnetic effect on touch devices
    if (window.matchMedia("(hover: none) or (pointer: coarse)").matches) return;

    let rafId = 0;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) * 0.3;
      const y = (e.clientY - (rect.top + rect.height / 2)) * 0.5;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(rafId);
      el.style.transform = "translate(0, 0)";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafId);
    };
  }, [reduced]);

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-medium text-[var(--accent-ink)] shadow-[0_8px_24px_-12px_rgba(99,102,241,0.6)] transition-[transform,background-color] duration-300 hover:bg-[#7C7DF3] will-change-transform"
    >
      {children}
    </a>
  );
}
