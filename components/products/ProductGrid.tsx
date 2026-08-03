"use client";

import Link from "next/link";
import Reveal from "@/components/tools/Reveal";
import GradientCover from "@/components/ui/GradientCover";
import {
  type Product,
  buyHref,
  buyLabel,
  isExternalBuy,
} from "@/lib/products";

// Contextual internal links per product — a relevant (seeded, real) blog post
// + the homepage services section. Keeps anchor text descriptive for SEO and
// gives each card two genuine onward paths. Falls back to the blog hub if a
// product slug isn't mapped (no dead links, no invented targets).
const RELATED: Record<string, { href: string; label: string }> = {
  "growth-audit-checklist": {
    href: "/blog/google-ads-wasting-money-fix",
    label: "Read: why Google Ads burn budget — the 5-step fix",
  },
  "prompt-vault": {
    href: "/blog/ai-marketing-for-founders-2026",
    label: "Read: how to run your marketing with AI in 2026",
  },
  "automation-toolkit": {
    href: "/blog/claude-code-for-marketers",
    label: "Read: automate PPC & Meta reporting without an engineer",
  },
  "complete-growth-system": {
    href: "/blog/ai-marketing-for-founders-2026",
    label: "Read: the founder's AI marketing playbook",
  },
};

function RelatedLinks({ product }: { product: Product }) {
  const post = RELATED[product.slug] ?? {
    href: "/blog",
    label: "Read the marketing growth blog",
  };
  return (
    <div className="relative z-10 mt-6 flex flex-col gap-1.5 border-t border-white/10 pt-4 text-sm">
      <Link
        href={post.href}
        className="inline-flex items-center gap-1.5 text-[var(--muted)] transition-colors hover:text-[var(--text)]"
      >
        <span aria-hidden className="text-[var(--accent-2)]">
          →
        </span>
        {post.label}
      </Link>
      <Link
        href="/#services"
        aria-label={`See the marketing services behind ${product.name}`}
        className="inline-flex items-center gap-1.5 text-[var(--muted)] transition-colors hover:text-[var(--text)]"
      >
        <span aria-hidden className="text-[var(--accent-2)]">
          →
        </span>
        Work with me — done-for-you services
      </Link>
    </div>
  );
}

// Small "what's inside" icon row — a designed accent for digital products.
const INSIDE = [
  { label: "Templates", d: "M14 3v4a1 1 0 0 0 1 1h4 M9 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5H9z" },
  { label: "Fast setup", d: "M13 2 4 14h7l-1 8 9-12h-7z" },
  { label: "Lifetime updates", d: "M3 12a9 9 0 0 1 15-6.7L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-15 6.7L3 16 M3 21v-5h5" },
];

function InsideRow() {
  return (
    <div className="relative z-10 mt-5 flex flex-wrap gap-2">
      {INSIDE.map((it) => (
        <span
          key={it.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[var(--muted)]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 text-[var(--accent-2)]"
            aria-hidden
          >
            <path d={it.d} />
          </svg>
          {it.label}
        </span>
      ))}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-2)]"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function BuyButton({
  product,
  variant,
}: {
  product: Product;
  variant: "solid" | "outline";
}) {
  const external = isExternalBuy(product);
  const base =
    "inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-medium transition-[transform,background-color,border-color] duration-300 hover:-translate-y-0.5";
  const cls =
    variant === "solid"
      ? `${base} bg-[var(--accent)] text-[var(--accent-ink)] shadow-[0_12px_32px_-12px_rgba(99,102,241,0.7)] hover:bg-[#7C7DF3]`
      : `${base} border border-white/15 text-[var(--text)] hover:border-white/40 hover:bg-white/5`;
  return (
    <a
      href={buyHref(product)}
      aria-label={`${buyLabel(product)} — ${product.name}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cls}
    >
      {buyLabel(product)}
    </a>
  );
}

function DetailsLink({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      aria-label={`View details for ${product.name}`}
      className="group inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] transition-all duration-300 hover:gap-2.5"
    >
      View details <span aria-hidden>→</span>
    </Link>
  );
}

function PricingCard({ product, index }: { product: Product; index: number }) {
  return (
    <Reveal delay={index * 0.07} className="h-full">
      <div
        className={
          "relative flex h-full flex-col overflow-hidden rounded-3xl border p-7 transition-[transform,border-color] duration-300 hover:-translate-y-1 " +
          (product.highlighted
            ? "border-[var(--accent)]/50 bg-[var(--panel)] lg:scale-[1.03]"
            : "border-white/10 bg-[var(--panel)] hover:border-white/25")
        }
      >
        {product.highlighted ? (
          <span
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-30 blur-3xl"
            style={{ background: "var(--accent)" }}
          />
        ) : null}

        {/* branded cover with tier badge */}
        <div className="relative z-10 -mx-7 -mt-7 mb-6 h-28 overflow-hidden sm:h-32">
          <GradientCover
            seed={product.slug}
            category={
              product.free ? "free" : product.highlighted ? "premium" : "paid"
            }
            badge={product.badge ?? (product.free ? "Free" : product.priceLabel)}
            variant="card"
            animate={false}
          />
        </div>

        <div className="relative z-10">
          <h3 className="text-lg font-semibold tracking-tight text-[var(--text)]">
            <Link
              href={`/products/${product.slug}`}
              aria-label={`${product.name} — ${product.free ? "free" : product.priceLabel}, view details`}
              className="transition-colors hover:text-white"
            >
              {product.name}
            </Link>
          </h3>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span
              className="font-semibold tracking-tight text-[var(--text)]"
              style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)" }}
            >
              {product.priceLabel}
            </span>
            {!product.free ? (
              <span className="text-sm text-[var(--muted)]">one-time</span>
            ) : null}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            {product.tagline}
          </p>
        </div>

        <InsideRow />

        {product.features.length > 0 ? (
          <ul className="relative z-10 mt-6 space-y-3 text-sm text-[var(--text)]">
            {product.features.map((f) => (
              <li key={f} className="flex gap-2.5">
                <CheckIcon />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <RelatedLinks product={product} />

        <div className="relative z-10 mt-6 flex flex-col gap-3 pt-2">
          <BuyButton
            product={product}
            variant={product.highlighted ? "solid" : "outline"}
          />
          <div className="text-center">
            <DetailsLink product={product} />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const free = products.find((p) => p.free);
  const paid = products.filter((p) => !p.free);

  return (
    <div className="space-y-6">
      {/* Free lead magnet — wide strip */}
      {free ? (
        <Reveal>
          <div className="flex flex-col gap-6 overflow-hidden rounded-3xl border border-dashed border-white/15 bg-[var(--panel)] p-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-wide text-[var(--accent-2)]">
                Free
              </span>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-[var(--text)]">
                <Link
                  href={`/products/${free.slug}`}
                  aria-label={`${free.name} — free, view details`}
                  className="transition-colors hover:text-white"
                >
                  {free.name}
                </Link>
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{free.tagline}</p>
              <div className="mt-3">
                <DetailsLink product={free} />
              </div>
              <RelatedLinks product={free} />
            </div>
            <div className="w-full shrink-0 sm:w-56">
              <BuyButton product={free} variant="outline" />
            </div>
          </div>
        </Reveal>
      ) : null}

      {/* Paid tiers */}
      <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
        {paid.map((p, i) => (
          <PricingCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}
