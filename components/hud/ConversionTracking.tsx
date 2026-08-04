"use client";

// GA4 conversion events, wired once at the document level rather than threaded
// through every CTA component. A single delegated listener classifies clicks by
// destination, so a new "Book a Call" button anywhere is tracked automatically
// and can never be forgotten.
//
// Events (mark these as key events in GA4 → Admin → Events):
//   book_call_click   — Calendly, any surface
//   whatsapp_click    — wa.me / WhatsApp deep links
//   email_click       — mailto:
//   cv_download       — the CV PDF
//   case_link_click   — fired separately by components/hud/CaseLinks
//   contact_form_submit — fired by the contact form on success

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export default function ConversionTracking() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const where = window.location.pathname;

      if (/calendly\.com/i.test(href)) {
        trackEvent("book_call_click", { location: where, href });
      } else if (/wa\.me|api\.whatsapp\.com|whatsapp:/i.test(href)) {
        trackEvent("whatsapp_click", { location: where });
      } else if (href.startsWith("mailto:")) {
        trackEvent("email_click", { location: where });
      } else if (/\.pdf($|\?)/i.test(href)) {
        trackEvent("cv_download", { location: where, href });
      }
    };

    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
