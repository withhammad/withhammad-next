"use client";

import Reveal from "@/components/tools/Reveal";
import type { Product } from "@/lib/products";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-amber)]"
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
  const external = product.buyUrl.startsWith("http");
  const base =
    "inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-medium transition-[transform,background-color,border-color] duration-300 hover:-translate-y-0.5";
  const cls =
    variant === "solid"
      ? `${base} bg-[var(--accent-indigo)] text-white shadow-[0_12px_32px_-12px_rgba(99,102,241,0.7)] hover:bg-[#7C7DF3]`
      : `${base} border border-white/15 text-[var(--text)] hover:border-white/40 hover:bg-white/5`;
  const label = product.free ? "Get it free" : `Buy · ${product.priceLabel}`;
  return (
    <a
      href={product.buyUrl}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className={cls}
    >
      {label}
    </a>
  );
}

function PricingCard({ product, index }: { product: Product; index: number }) {
  return (
    <Reveal delay={index * 0.07} className="h-full">
      <div
        className={
          "relative flex h-full flex-col overflow-hidden rounded-3xl border p-7 transition-[transform,border-color] duration-300 hover:-translate-y-1 " +
          (product.highlighted
            ? "border-[var(--accent-indigo)]/50 bg-[var(--panel)] lg:scale-[1.03]"
            : "border-white/10 bg-[var(--panel)] hover:border-white/25")
        }
      >
        {product.highlighted ? (
          <span
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-30 blur-3xl"
            style={{ background: "var(--accent-indigo)" }}
          />
        ) : null}

        {product.badge ? (
          <span className="relative z-10 mb-4 inline-flex w-fit items-center rounded-full bg-[var(--accent-indigo)] px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white">
            {product.badge}
          </span>
        ) : null}

        <div className="relative z-10">
          <h3 className="text-lg font-semibold tracking-tight text-[var(--text)]">
            {product.name}
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

        <div className="relative z-10 mt-8 pt-2">
          <BuyButton
            product={product}
            variant={product.highlighted ? "solid" : "outline"}
          />
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
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-wide text-[var(--accent-amber)]">
                Free
              </span>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-[var(--text)]">
                {free.name}
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{free.tagline}</p>
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
