import type Stripe from "stripe";
import { getStripe, getPaymentConfig, finalizeOrder } from "@/lib/selling";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Stripe calls this after payment. We verify the signature, then finalize the
// order (idempotent) so the buyer's download + email are guaranteed even if they
// close the tab before the return page loads.
export async function POST(req: Request) {
  const cfg = await getPaymentConfig();
  if (!cfg.stripe.webhookSecret)
    return new Response("Webhook not configured", { status: 503 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    const stripe = await getStripe();
    event = stripe.webhooks.constructEvent(raw, sig, cfg.stripe.webhookSecret);
  } catch (err) {
    console.error("[webhooks/stripe] signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.payment_status === "paid") {
      try {
        await finalizeOrder({
          provider: "stripe",
          providerRef: s.id,
          productSlug: s.metadata?.productSlug,
          email: s.customer_details?.email ?? undefined,
          amount: s.amount_total != null ? s.amount_total / 100 : undefined,
          currency: s.currency ?? undefined,
        });
      } catch (err) {
        console.error("[webhooks/stripe] finalize failed:", err);
        return new Response("finalize error", { status: 500 });
      }
    }
  }

  return new Response("ok", { status: 200 });
}
