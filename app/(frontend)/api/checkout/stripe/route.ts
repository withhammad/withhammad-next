import { NextResponse } from "next/server";
import {
  getStripe,
  getSellableBySlug,
  stripeEnabled,
  SITE_URL,
} from "@/lib/selling";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Creates an embedded Checkout Session (stays on withhammad.com) and returns its
// client secret for the on-page Stripe checkout.
export async function POST(req: Request) {
  if (!(await stripeEnabled())) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  let body: { productSlug?: string };
  try {
    body = (await req.json()) as { productSlug?: string };
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const product = await getSellableBySlug(String(body.productSlug ?? ""));
  if (!product) {
    return NextResponse.json(
      { error: "Product not available for checkout" },
      { status: 404 },
    );
  }

  try {
    const stripe = await getStripe();
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: product.currency,
            unit_amount: Math.round(product.price * 100),
            product_data: { name: product.name },
          },
        },
      ],
      metadata: { productSlug: product.slug },
      return_url: `${SITE_URL}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    });
    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error("[checkout/stripe] error:", err);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 502 });
  }
}
