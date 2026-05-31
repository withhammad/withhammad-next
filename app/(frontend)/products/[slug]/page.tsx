import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProductSlugs,
  getProducts,
} from "@/lib/content";
import {
  type Product,
  buyHref,
  buyLabel,
  isExternalBuy,
} from "@/lib/products";
import Reveal from "@/components/tools/Reveal";
import BuyPanel from "@/components/products/BuyPanel";
import { getPaymentConfig } from "@/lib/selling";

export const revalidate = 300;

const SITE_URL = "https://withhammad.com";

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found | With Hammad" };

  const priceTier = product.free ? "Free" : product.priceLabel;

  // Per-doc SEO override (admin → product → SEO) wins over the auto meta.
  const title =
    product.seo?.title?.trim() ||
    `${product.name} — ${priceTier} | With Hammad`;
  const description =
    product.seo?.description?.trim() || autoDescription(product);
  const canonical = `/products/${product.slug}`;
  // Prefer the explicit SEO image, else the cover, else the per-route OG generator.
  const ogUrl =
    product.seo?.image ||
    product.coverImageUrl ||
    `/products/${product.slug}/opengraph-image`;
  const images = [{ url: ogUrl }];

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${product.name} — ${priceTier}`,
      description,
      type: "website",
      url: canonical,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — ${priceTier}`,
      description,
      images: images.map((i) => i.url),
    },
  };
}

// Benefit-led meta description: price + what's inside, ~140-160 chars.
// Adds as many whole features as fit (never cuts a feature mid-word) so the
// "includes …" list always ends on a complete item.
function autoDescription(p: Product): string {
  const priceTier = p.free ? "Free" : `${p.priceLabel} one-time`;
  const lead = p.tagline?.trim() || `${p.name} by Hammad Yousuf.`;
  const base = `${lead} ${priceTier}`;

  if (p.features.length === 0) {
    return `${base} digital product by Hammad Yousuf.`;
  }

  const fitted: string[] = [];
  for (const f of p.features) {
    const next = [...fitted, f].join(", ");
    // Keep the whole string (lead + price + "— includes ….") under ~158 chars.
    if (`${base} — includes ${next}.`.length > 158) break;
    fitted.push(f);
  }
  // Guarantee at least one feature even if the first is long (then trim safely).
  if (fitted.length === 0) fitted.push(p.features[0]);

  const full = `${base} — includes ${fitted.join(", ")}.`;
  if (full.length <= 160) return full;
  return `${full.slice(0, 159).replace(/\s+\S*$/, "")}…`;
}

function priceToNumber(priceLabel: string): number {
  const m = /([\d.,]+)/.exec(priceLabel);
  return m ? Number(m[1].replace(/,/g, "")) : 0;
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
      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-amber)]"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function trustPoints(p: Product): string[] {
  if (p.free) return ["No card required", "Instant download", "Actionable in 15 min"];
  if (isExternalBuy(p) || p.purchasable)
    return ["Secure checkout", "Instant access", "Lifetime updates"];
  return ["Message me to get access", "Delivered digitally", "Lifetime updates"];
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const external = isExternalBuy(product);
  const pay = await getPaymentConfig();
  const showBuyPanel = Boolean(
    product.purchasable && (pay.stripe.enabled || pay.paypal.enabled),
  );
  const all = await getProducts();
  const others = all.filter((p) => p.slug !== product.slug).slice(0, 3);

  // OMITS aggregateRating + review on purpose — no real ratings exist, so we
  // never invent any (matches the no-fake-testimonials rule sitewide).
  const offerPrice = product.free
    ? 0
    : (product.price ?? priceToNumber(product.priceLabel));
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: autoDescription(product),
    image: `${SITE_URL}/products/${product.slug}/opengraph-image`,
    brand: { "@type": "Brand", name: "With Hammad" },
    offers: {
      "@type": "Offer",
      price: offerPrice,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/products/${product.slug}`,
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${SITE_URL}/products`,
      },
      { "@type": "ListItem", position: 3, name: product.name },
    ],
  };

  const buyCls =
    "inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--accent-indigo)] px-7 text-sm font-medium text-white shadow-[0_12px_32px_-12px_rgba(99,102,241,0.7)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#7C7DF3]";

  return (
    <main className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="relative mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-72 opacity-60"
          style={{
            background:
              "radial-gradient(55% 100% at 50% 0%, color-mix(in oklab, var(--accent-indigo) 22%, transparent), transparent 70%)",
          }}
        />

        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
        >
          <span aria-hidden>←</span> All products
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
          {/* ---- Left: details ---- */}
          <div className="min-w-0">
            <Reveal>
              {product.badge ? (
                <span className="mb-4 inline-flex w-fit items-center rounded-full bg-[var(--accent-indigo)] px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white">
                  {product.badge}
                </span>
              ) : (
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-amber)]" />
                  {product.free ? "Free resource" : "Digital product"}
                </span>
              )}
              <h1
                className="font-semibold tracking-tight text-[var(--text)]"
                style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", lineHeight: 1.04 }}
              >
                {product.name}
              </h1>
              {product.tagline ? (
                <p className="mt-5 max-w-2xl text-[var(--muted)] sm:text-lg">
                  {product.tagline}
                </p>
              ) : null}
            </Reveal>

            {product.coverImageUrl ? (
              <Reveal>
                <div className="relative mt-9 aspect-[16/9] overflow-hidden rounded-2xl border border-white/10">
                  <Image
                    src={product.coverImageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 640px"
                    className="object-cover"
                    priority
                  />
                </div>
              </Reveal>
            ) : null}

            {/* Description body */}
            {product.descriptionHtml ? (
              <Reveal>
                <div
                  className="post-content mt-10 max-w-2xl"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </Reveal>
            ) : null}

            {/* What's included */}
            {product.features.length > 0 ? (
              <Reveal>
                <div className="mt-12">
                  <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">
                    What&apos;s included
                  </h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {product.features.map((f) => (
                      <li
                        key={f}
                        className="flex gap-2.5 rounded-xl border border-white/10 bg-[var(--panel)] p-3.5 text-sm text-[var(--text)]"
                      >
                        <CheckIcon />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ) : null}

            {/* Outcomes */}
            {product.outcomes && product.outcomes.length > 0 ? (
              <Reveal>
                <div className="mt-12">
                  <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">
                    What you&apos;ll walk away with
                  </h2>
                  <ul className="mt-5 space-y-3">
                    {product.outcomes.map((o) => (
                      <li key={o} className="flex gap-2.5 text-[var(--muted)]">
                        <span
                          aria-hidden
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-indigo)]"
                        />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ) : null}

            {/* FAQ */}
            {product.faqs && product.faqs.length > 0 ? (
              <Reveal>
                <div className="mt-12">
                  <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">
                    Questions
                  </h2>
                  <div className="mt-5 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)]">
                    {product.faqs.map((f) => (
                      <details key={f.question} className="group p-5">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[var(--text)]">
                          <span className="font-medium">{f.question}</span>
                          <span
                            aria-hidden
                            className="text-[var(--muted)] transition-transform duration-300 group-open:rotate-45"
                          >
                            +
                          </span>
                        </summary>
                        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                          {f.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              </Reveal>
            ) : null}
          </div>

          {/* ---- Right: sticky buy card ---- */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[var(--panel)] p-7">
              <div className="flex items-baseline gap-1.5">
                <span
                  className="font-semibold tracking-tight text-[var(--text)]"
                  style={{ fontSize: "clamp(2.2rem, 4vw, 3rem)" }}
                >
                  {product.priceLabel || "Free"}
                </span>
                {!product.free ? (
                  <span className="text-sm text-[var(--muted)]">one-time</span>
                ) : null}
              </div>

              <div className="mt-6">
                {showBuyPanel ? (
                  <BuyPanel
                    productSlug={product.slug}
                    priceLabel={product.priceLabel}
                    currency={product.currency ?? "usd"}
                    label={product.ctaLabel?.trim() || `Buy · ${product.priceLabel}`}
                    stripePublishableKey={
                      pay.stripe.enabled ? pay.stripe.publishableKey : undefined
                    }
                    paypalClientId={
                      pay.paypal.enabled ? pay.paypal.clientId : undefined
                    }
                  />
                ) : (
                  <a
                    href={buyHref(product)}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className={buyCls}
                  >
                    {buyLabel(product)}
                  </a>
                )}
              </div>

              {showBuyPanel ? (
                <p className="mt-3 text-center text-xs text-[var(--muted)]">
                  Secure checkout · instant download
                </p>
              ) : !external && !product.free ? (
                <p className="mt-3 text-center text-xs text-[var(--muted)]">
                  Secure instant checkout — message me to get the link.
                </p>
              ) : null}

              <ul className="mt-6 space-y-2.5 text-sm text-[var(--muted)]">
                {trustPoints(product).map((t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <CheckIcon />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-sm text-[var(--muted)]">
                  Not sure it&apos;s the right fit?
                </p>
                <Link
                  href="/#contact"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-indigo)] transition-all duration-300 hover:gap-2.5"
                >
                  Book a free call <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* More products */}
      {others.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <h2 className="mb-6 text-lg font-semibold tracking-tight text-[var(--text)]">
            Explore more
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-[var(--panel)] p-5 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/25"
              >
                <div className="mb-2 text-xs text-[var(--muted)]">
                  {p.priceLabel || "Free"}
                </div>
                <h3 className="text-base font-semibold leading-snug tracking-tight text-[var(--text)]">
                  {p.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                  {p.tagline}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-indigo)] transition-all duration-300 group-hover:gap-2.5">
                  View <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
