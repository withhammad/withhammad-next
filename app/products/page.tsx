import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, FALLBACK_PRODUCTS } from "@/lib/products";
import ProductGrid from "@/components/products/ProductGrid";
import Reveal from "@/components/tools/Reveal";

export const metadata: Metadata = {
  title: "Products — Marketing Systems & Toolkits | With Hammad",
  description:
    "Digital products to run AI-driven growth yourself: the Prompt Vault ($27), the Automation Toolkit ($197), and the Complete Growth System ($997). Plus a free growth-audit checklist.",
  alternates: { canonical: "/products" },
};

// ISR: re-fetch so the page switches to live WooCommerce data once the store is up.
export const revalidate = 300;

export default async function ProductsPage() {
  const live = await getProducts();
  const products = live.length ? live : FALLBACK_PRODUCTS;

  return (
    <main className="relative">
      <section className="relative mx-auto max-w-6xl px-5 pb-8 pt-28 sm:px-8 sm:pt-32">
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
            Products
          </span>
          <h1
            className="mt-5 max-w-3xl font-semibold tracking-tight text-[var(--text)]"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)", lineHeight: 1.03 }}
          >
            Run the system yourself.
          </h1>
          <p className="mt-5 max-w-2xl text-[var(--muted)] sm:text-lg">
            The same prompts, automations, and playbooks I use with clients —
            packaged so you can move fast without the agency price tag.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <ProductGrid products={products} />
      </section>

      {/* Reassurance + CTA */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[var(--panel)] p-8 text-center sm:p-12">
            <h2 className="mx-auto max-w-xl text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
              Not sure which one fits?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[var(--muted)]">
              Tell me where you&apos;re stuck on a quick call and I&apos;ll point
              you to the right one — or whether you need done-with-you help
              instead.
            </p>
            <Link
              href="/#contact"
              className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent-indigo)] px-7 text-sm font-medium text-white shadow-[0_12px_32px_-12px_rgba(99,102,241,0.7)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#7C7DF3]"
            >
              Book a Call
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
