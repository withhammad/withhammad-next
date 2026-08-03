// GA4 event helper — no-ops when gtag isn't loaded (dev, blockers, no ID).

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params ?? {});
}
