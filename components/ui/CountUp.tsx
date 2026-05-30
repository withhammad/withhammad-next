"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type CountUpProps = {
  value: number;
  play: boolean;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  group?: boolean;
  duration?: number;
  className?: string;
};

function formatNumber(n: number, decimals: number, group: boolean) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: group,
  });
}

export default function CountUp({
  value,
  play,
  prefix = "",
  suffix = "",
  decimals = 0,
  group = true,
  duration = 1.8,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.textContent = prefix + formatNumber(value, decimals, group) + suffix;
      return;
    }
    if (!play) {
      el.textContent = prefix + formatNumber(0, decimals, group) + suffix;
      return;
    }

    const obj = { n: 0 };
    const tween = gsap.to(obj, {
      n: value,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent =
          prefix + formatNumber(obj.n, decimals, group) + suffix;
      },
    });
    return () => {
      tween.kill();
    };
  }, [play, reduced, value, prefix, suffix, decimals, group, duration]);

  // SSR / first paint: render 0 (animated) — matches client pre-play state.
  return (
    <span ref={ref} className={className}>
      {prefix + formatNumber(0, decimals, group) + suffix}
    </span>
  );
}
