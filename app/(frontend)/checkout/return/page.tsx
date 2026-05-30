import type { Metadata } from "next";
import Link from "next/link";
import { getStripe, finalizeOrder, stripeEnabled } from "@/lib/selling";
import { payloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your purchase | With Hammad",
  robots: { index: false, follow: false },
};

interface OrderRow {
  status?: string | null;
  productName?: string | null;
  downloadToken?: string | null;
}

async function resolve(
  sessionId?: string,
  token?: string,
): Promise<{ ok: boolean; token?: string; productName?: string; pending?: boolean }> {
  // Stripe return — confirm the session, then finalize (idempotent).
  if (sessionId && (await stripeEnabled())) {
    try {
      const stripe = await getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.status === "complete" && session.payment_status === "paid") {
        const fin = await finalizeOrder({
          provider: "stripe",
          providerRef: session.id,
          productSlug: session.metadata?.productSlug,
          email: session.customer_details?.email ?? undefined,
          amount: session.amount_total != null ? session.amount_total / 100 : undefined,
          currency: session.currency ?? undefined,
        });
        if (fin) return { ok: true, token: fin.token, productName: fin.productName };
      }
      return { ok: false, pending: session.status === "open" };
    } catch {
      return { ok: false };
    }
  }

  // Token return (PayPal, or refresh) — look up the finalized order.
  if (token) {
    try {
      const payload = await payloadClient();
      const res = await payload.find({
        collection: "orders",
        where: { downloadToken: { equals: token } },
        limit: 1,
        depth: 0,
      });
      const order = res.docs[0] as unknown as OrderRow | undefined;
      if (order?.status === "paid" && order.downloadToken) {
        return { ok: true, token: order.downloadToken, productName: order.productName ?? "" };
      }
    } catch {
      /* fall through */
    }
  }

  return { ok: false };
}

export default async function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; token?: string }>;
}) {
  const { session_id, token } = await searchParams;
  const result = await resolve(session_id, token);

  return (
    <main className="relative mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 py-28 text-center sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 opacity-60"
        style={{
          background:
            "radial-gradient(55% 100% at 50% 0%, color-mix(in oklab, var(--accent-indigo) 22%, transparent), transparent 70%)",
        }}
      />

      {result.ok ? (
        <>
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-indigo)]/15 text-3xl text-[var(--accent-indigo)]">
            ✓
          </div>
          <h1
            className="font-semibold tracking-tight text-[var(--text)]"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", lineHeight: 1.1 }}
          >
            Payment complete — thank you!
          </h1>
          <p className="mt-4 max-w-md text-[var(--muted)]">
            Your download for{" "}
            <span className="text-[var(--text)]">
              {result.productName || "your purchase"}
            </span>{" "}
            is ready. We&apos;ve also emailed you the link.
          </p>
          <a
            href={`/api/download/${result.token}`}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent-indigo)] px-8 text-sm font-medium text-white shadow-[0_12px_32px_-12px_rgba(99,102,241,0.7)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#7C7DF3]"
          >
            Download now ↓
          </a>
          <Link
            href="/products"
            className="mt-5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
          >
            ← Back to products
          </Link>
        </>
      ) : (
        <>
          <h1
            className="font-semibold tracking-tight text-[var(--text)]"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", lineHeight: 1.1 }}
          >
            {result.pending ? "Finishing up…" : "We couldn't confirm that payment"}
          </h1>
          <p className="mt-4 max-w-md text-[var(--muted)]">
            {result.pending
              ? "Your payment is still processing. If you completed checkout, check your email for the download link in a moment."
              : "If you were charged, your download link is on its way by email. Otherwise, please try again or get in touch and I'll sort it out."}
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-7 text-sm font-medium text-[var(--text)] transition-colors hover:border-white/40 hover:bg-white/5"
          >
            Contact me
          </Link>
        </>
      )}
    </main>
  );
}
