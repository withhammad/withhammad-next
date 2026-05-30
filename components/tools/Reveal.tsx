"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Wraps content and reveals it on scroll (GPU transform/opacity only).
 * No-ops under prefers-reduced-motion — content stays visible.
 */
export default function Reveal({
  children,
  className,
  y = 24,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      gsap.from(ref.current, {
        y,
        autoAlpha: 0,
        duration: 0.7,
        ease: "power3.out",
        delay,
        scrollTrigger: { trigger: ref.current, start: "top 90%" },
      });
    },
    { dependencies: [reduced] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
