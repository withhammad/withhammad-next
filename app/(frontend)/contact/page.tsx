import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import CalendlyInline from "@/components/contact/CalendlyInline";
import Reveal from "@/components/tools/Reveal";
import { pageMetadata } from "@/lib/content";
import { LINKEDIN_HANDLE, LINKEDIN_URL } from "@/lib/person";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    path: "/contact",
    pageKey: "contact",
    fallbackTitle: "Contact — Let's build your growth engine | With Hammad",
    fallbackDescription:
      "Get in touch with Hammad Yousuf — AI marketing growth strategist in Dubai. Send a message or book a free 30-minute strategy call.",
  });
}

const EMAIL = "marketing@withhammad.com";

const SOCIALS = [
  { label: "YouTube", handle: "@with.hammad", href: "https://www.youtube.com/@with.hammad" },
  { label: "LinkedIn", handle: LINKEDIN_HANDLE, href: LINKEDIN_URL },
] as const;

const CONTACT_LD = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact — With Hammad",
  url: "https://withhammad.com/contact",
  mainEntity: {
    "@type": "Person",
    name: "Hammad Yousuf",
    url: "https://withhammad.com",
    email: `mailto:${EMAIL}`,
    address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
    contactPoint: {
      "@type": "ContactPoint",
      email: EMAIL,
      contactType: "sales",
      areaServed: ["AE", "GCC", "Worldwide"],
    },
  },
};

export default function ContactPage() {
  return (
    <main className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(CONTACT_LD) }}
      />

      <section className="relative mx-auto max-w-6xl px-5 pb-10 pt-28 sm:px-8 sm:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-72 opacity-60"
          style={{
            background:
              "radial-gradient(55% 100% at 50% 0%, color-mix(in oklab, var(--accent-indigo) 22%, transparent), transparent 70%)",
          }}
        />
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-amber)]" />
            Let&apos;s talk
          </span>
          <h1
            className="mt-5 max-w-3xl font-semibold tracking-tight text-[var(--text)]"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)", lineHeight: 1.03 }}
          >
            Let&apos;s build your growth engine.
          </h1>
          <p className="mt-5 max-w-2xl text-[var(--muted)] sm:text-lg">
            Tell me about your goals and where you&apos;re stuck, or book a free
            30-minute call. No pitch — just a clear plan for predictable growth.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* Left: form + direct details */}
          <Reveal>
            <ContactForm />
            <div className="mt-6 rounded-3xl border border-white/10 bg-[var(--panel)] p-7">
              <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Prefer to reach out directly?
              </h2>
              <a
                href={`mailto:${EMAIL}`}
                className="mt-3 block text-xl font-semibold tracking-tight text-[var(--text)] transition-colors hover:text-[var(--accent-amber)] sm:text-2xl"
              >
                {EMAIL}
              </a>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Based in Dubai, UAE — working with founders and teams worldwide.
              </p>
              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="mb-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Find me on
                </div>
                <ul className="flex flex-wrap gap-x-6 gap-y-3">
                  {SOCIALS.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 text-[var(--text)] transition-colors hover:text-[var(--accent-amber)]"
                      >
                        <span className="text-sm font-medium">{s.label}</span>
                        <span className="text-sm text-[var(--muted)] transition-colors group-hover:text-[var(--accent-amber)]">
                          {s.handle}
                        </span>
                        <span aria-hidden>↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          {/* Right: book a call */}
          <Reveal delay={0.08}>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Or book a call
              </span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <CalendlyInline />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
