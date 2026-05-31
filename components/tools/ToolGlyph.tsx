// Clean line-style SVG icons for the tools hub. Stroke is currentColor, so the
// parent sets the accent (indigo/amber). 24×24, reduced-motion safe (static).
import React from "react";
import type { ToolIconName } from "@/lib/tools";

const PATHS: Record<ToolIconName, React.ReactNode> = {
  calculator: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <rect x="8" y="5" width="8" height="3" rx="0.5" />
      <line x1="9" y1="13" x2="9" y2="13" />
      <line x1="12" y1="13" x2="12" y2="13" />
      <line x1="15" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="9" y2="17" />
      <line x1="12" y1="17" x2="12" y2="17" />
      <line x1="15" y1="17" x2="15" y2="17" />
    </>
  ),
  citation: (
    <>
      <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.1-5.7A8.4 8.4 0 1 1 21 11.5Z" />
      <path d="m8.5 11.5 2 2 4-4" />
    </>
  ),
  audit: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <rect x="9" y="2" width="6" height="3.5" rx="1" />
      <path d="m8.3 11 1.2 1.2 2-2.4" />
      <line x1="13.5" y1="10.8" x2="16.5" y2="10.8" />
      <path d="m8.3 16 1.2 1.2 2-2.4" />
      <line x1="13.5" y1="15.8" x2="16.5" y2="15.8" />
    </>
  ),
  prompt: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3" />
      <line x1="12.5" y1="15" x2="16" y2="15" />
    </>
  ),
  directory: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  adcopy: (
    <>
      <line x1="4" y1="6" x2="15" y2="6" />
      <line x1="4" y1="11" x2="12" y2="11" />
      <line x1="4" y1="16" x2="9" y2="16" />
      <path d="M17.5 13 21 16.5 16.5 21 13 21l0-3.5L17.5 13Z" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="m4 18 5-5 4 4 3-3 4 4" />
    </>
  ),
};

export default function ToolGlyph({
  name,
  className = "",
}: {
  name: ToolIconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
