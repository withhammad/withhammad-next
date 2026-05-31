"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ServiceItem } from "@/lib/wp-queries";

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com/withhammad-marketing/30min";

const INCLUSIONS = [
  "Paid media — PPC & paid social",
  "SEO & landing-page CRO",
  "AI-accelerated creative",
  "Weekly revenue-first reporting",
];

const PROCESS = [
  {
    no: "01",
    title: "Audit",
    desc: "Deep dive into your funnel, data, and competitors to find the fastest wins.",
    icon: "audit" as const,
  },
  {
    no: "02",
    title: "Build",
    desc: "Tracking, creative, and campaigns engineered to convert from day one.",
    icon: "build" as const,
  },
  {
    no: "03",
    title: "Scale",
    desc: "Double down on winners, cut the losers, expand into new markets.",
    icon: "scale" as const,
  },
  {
    no: "04",
    title: "Report",
    desc: "Clear weekly reporting in revenue and pipeline — never vanity metrics.",
    icon: "report" as const,
  },
];

const CHANNELS = [
  "PPC",
  "SEO",
  "Paid Social",
  "CRO",
  "AI Creative",
  "Multi-Market GCC",
];

// Service JSON-LD — productized performance-marketing offer. Provider is the
// Person (Hammad), served across the UAE, the wider GCC, and remote worldwide.
const SERVICE_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Performance marketing services — Dubai & GCC",
  serviceType: [
    "Google Ads management",
    "Meta Ads management",
    "SEO",
    "Answer Engine Optimization",
    "Conversion rate optimization",
    "Marketing automation",
    "Multi-market growth",
  ],
  provider: {
    "@type": "Person",
    name: "Hammad Yousuf",
    url: "https://withhammad.com",
  },
  areaServed: [
    { "@type": "Country", name: "United Arab Emirates" },
    { "@type": "Place", name: "GCC" },
    { "@type": "Place", name: "Worldwide (remote)" },
  ],
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export default function Services({
  services = [],
}: {
  services?: ServiceItem[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const heads = gsap.utils.toArray<HTMLElement>(
        "[data-reveal]",
        sectionRef.current,
      );
      gsap.from(heads, {
        y: 24,
        autoAlpha: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      });

      const tiles = gsap.utils.toArray<HTMLElement>(
        "[data-tile]",
        sectionRef.current,
      );
      gsap.from(tiles, {
        y: 32,
        autoAlpha: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: tiles[0], start: "top 85%" },
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: sectionRef, dependencies: [reduced] },
  );

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_LD) }}
      />
      {/* AI-generated ambient backdrop — subtle, behind the bento content. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <Image
          src="/ai/services.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.22]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 0%, transparent 28%, var(--bg) 78%), linear-gradient(to bottom, var(--bg) 0%, transparent 16%, transparent 84%, var(--bg) 100%)",
          }}
        />
      </div>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <header className="mb-10 max-w-2xl">
          <span
            data-reveal
            className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-indigo)]" />
            Services
          </span>
          <h2
            data-reveal
            className="font-semibold tracking-tight text-[var(--text)]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", lineHeight: 1.05 }}
          >
            One partner. The whole funnel.
          </h2>
          <p data-reveal className="mt-4 text-[var(--muted)]">
            A productized growth engine — fixed monthly, no retainers games, no
            hand-offs. Here&apos;s the offer and exactly how it runs.
          </p>
        </header>

        {/* Bento */}
        <div className="grid gap-4 lg:grid-cols-4">
          {/* Primary offer tile */}
          <div
            data-tile
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)] p-7 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/25 sm:p-8 lg:col-span-2 lg:row-span-2"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
              style={{
                background:
                  "radial-gradient(circle at center, var(--accent-indigo), transparent 65%)",
              }}
            />
            <div className="relative flex items-center gap-2">
              <span className="rounded-full border border-[var(--accent-indigo)]/40 bg-[var(--accent-indigo)]/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-[var(--accent-indigo)]">
                Productized · Monthly
              </span>
            </div>

            <div className="relative mt-6 flex items-end gap-2">
              <span
                className="font-semibold tracking-tight text-[var(--accent-amber)]"
                style={{ fontSize: "clamp(2.6rem, 5vw, 4rem)", lineHeight: 1 }}
              >
                $999
              </span>
              <span className="mb-1 text-[var(--muted)]">/ month</span>
            </div>
            <h3 className="relative mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">
              Complete Growth System
            </h3>
            <p className="relative mt-2 max-w-md text-[var(--muted)]">
              One senior operator owns your funnel end to end — strategy, media,
              creative, and CRO — reporting in revenue, not screenshots.
            </p>

            <ul className="relative mt-6 grid gap-2 sm:grid-cols-2">
              {INCLUSIONS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-sm text-[var(--text)]"
                >
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>

            <div className="relative mt-auto flex flex-wrap items-center gap-3 pt-8">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent-indigo)] px-5 text-sm font-medium text-white shadow-[0_12px_32px_-12px_rgba(99,102,241,0.7)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#7C7DF3]"
              >
                Book a Call
              </a>
              <span className="text-sm text-[var(--muted)]">
                Limited to a handful of clients at a time.
              </span>
            </div>
          </div>

          {/* Process tiles */}
          {PROCESS.map((step) => (
            <div
              key={step.no}
              data-tile
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)] p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/25"
            >
              <div className="flex items-center justify-between">
                <span className="inline-grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-[var(--muted)] transition-colors group-hover:border-white/25 group-hover:text-[var(--text)]">
                  <ProcessIcon kind={step.icon} />
                </span>
                <span className="font-mono text-sm text-[var(--muted)]">
                  {step.no}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-[var(--text)]">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm text-[var(--muted)]">{step.desc}</p>
            </div>
          ))}

          {/* Channels strip */}
          <div
            data-tile
            className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)] p-6 transition-colors duration-300 hover:border-white/25 sm:flex-row sm:items-center sm:justify-between lg:col-span-4"
          >
            <span className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
              Channels I run
            </span>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/15 px-3 py-1 text-sm text-[var(--text)]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Optional: extra services published in the CMS */}
        {services.length > 0 ? (
          <div className="mt-12">
            <h3
              data-reveal
              className="mb-5 text-sm uppercase tracking-[0.2em] text-[var(--muted)]"
            >
              More ways to work together
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  data-tile
                  className="group rounded-2xl border border-white/10 bg-[var(--panel)] p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/25"
                >
                  <h4 className="text-lg font-semibold tracking-tight text-[var(--text)]">
                    {svc.title ?? "Service"}
                  </h4>
                  {svc.excerpt ? (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {stripHtml(svc.excerpt)}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* --------------------------------- Icons --------------------------------- */

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-4 w-4 shrink-0 text-[var(--accent-amber)]"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ProcessIcon({
  kind,
}: {
  kind: "audit" | "build" | "scale" | "report";
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-5 w-5",
    "aria-hidden": true,
  };
  if (kind === "audit") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    );
  }
  if (kind === "build") {
    return (
      <svg {...common}>
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.7 2.7-2-2 2.7-2.7z" />
      </svg>
    );
  }
  if (kind === "scale") {
    return (
      <svg {...common}>
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M17 7h4v4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M3 3v18h18" />
      <rect x="7" y="11" width="3" height="6" rx="0.5" />
      <rect x="13" y="7" width="3" height="10" rx="0.5" />
    </svg>
  );
}
