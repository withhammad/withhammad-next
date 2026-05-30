"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export default function GradientMesh() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }
      const blobs = gsap.utils.toArray<HTMLElement>("[data-blob]", ref.current);
      blobs.forEach((blob, i) => {
        gsap.to(blob, {
          xPercent: i % 2 === 0 ? 10 : -12,
          yPercent: i % 2 === 0 ? -8 : 12,
          scale: 1.12,
          duration: 9 + i * 2.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        data-blob
        className="absolute left-[-10%] top-[-15%] h-[55vmax] w-[55vmax] rounded-full opacity-40 blur-[110px] will-change-transform"
        style={{
          background:
            "radial-gradient(circle at center, var(--accent-indigo), transparent 65%)",
        }}
      />
      <div
        data-blob
        className="absolute right-[-15%] top-[5%] h-[50vmax] w-[50vmax] rounded-full opacity-30 blur-[120px] will-change-transform"
        style={{
          background:
            "radial-gradient(circle at center, var(--accent-amber), transparent 65%)",
        }}
      />
      <div
        data-blob
        className="absolute bottom-[-25%] left-[25%] h-[45vmax] w-[45vmax] rounded-full opacity-25 blur-[120px] will-change-transform"
        style={{
          background:
            "radial-gradient(circle at center, var(--accent-indigo), transparent 70%)",
        }}
      />
      {/* Vignette: fade mesh edges back into the page background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 80% at 50% 0%, transparent 35%, var(--bg) 100%)",
        }}
      />
    </div>
  );
}
