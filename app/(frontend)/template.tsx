"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT } from "@/lib/easing";

// A Next.js template re-mounts on every navigation, so this enter animation
// replays per route — giving a smooth page transition WITHOUT AnimatePresence
// (which conflicts with the App Router: "Router action dispatched before
// initialization"). pt-16 clears the fixed NavBar; the Hero cancels it with
// -mt-16 to bleed full-bleed under the nav.
export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className="flex flex-1 flex-col pt-16">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, clipPath: "inset(6% 0 6% 0)" }}
      animate={{ opacity: 1, clipPath: "inset(0% 0 0% 0)" }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className="flex flex-1 flex-col pt-16"
    >
      {children}
    </motion.div>
  );
}
