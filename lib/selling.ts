// Server-only native-selling helpers (Stripe + PayPal + digital delivery).
// Imported only by the /api checkout + download routes — never by the client.
import crypto from "node:crypto";
import { cache } from "react";
import Stripe from "stripe";
import { Resend } from "resend";
import { payloadClient } from "@/lib/payload";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://withhammad.com";

const DOWNLOAD_TTL_HOURS = Number(process.env.DOWNLOAD_TOKEN_TTL_HOURS || 72);
export const MAX_DOWNLOADS = Number(process.env.DOWNLOAD_MAX || 5);

/* ---- Payment configuration (admin "Payments" global → env fallback) ---- */

export interface PaymentConfig {
  stripe: {
    enabled: boolean;
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  paypal: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    mode: "sandbox" | "live";
  };
}

interface PaymentGlobal {
  stripeEnabled?: boolean | null;
  stripePublishableKey?: string | null;
  stripeSecretKey?: string | null;
  stripeWebhookSecret?: string | null;
  paypalEnabled?: boolean | null;
  paypalClientId?: string | null;
  paypalClientSecret?: string | null;
  paypalMode?: string | null;
}

// Reads the admin Payments global, falling back to env vars. Cached per request.
export const getPaymentConfig = cache(async (): Promise<PaymentConfig> => {
  let g: PaymentGlobal = {};
  try {
    const payload = await payloadClient();
    g = (await payload.findGlobal({
      slug: "payment-settings",
    })) as unknown as PaymentGlobal;
  } catch {
    // payment-settings global may not exist yet; fall back to env vars below
  }
  const env = process.env;
  const sSecret = (g.stripeSecretKey || env.STRIPE_SECRET_KEY || "").trim();
  const sPub = (
    g.stripePublishableKey ||
    env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    ""
  ).trim();
  const sWebhook = (
    g.stripeWebhookSecret ||
    env.STRIPE_WEBHOOK_SECRET ||
    ""
  ).trim();
  const pId = (g.paypalClientId || env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "").trim();
  const pSecret = (g.paypalClientSecret || env.PAYPAL_CLIENT_SECRET || "").trim();
  const pMode =
    (g.paypalMode || env.PAYPAL_ENV || "sandbox") === "live"
      ? "live"
      : "sandbox";
  return {
    stripe: {
      enabled:
        (Boolean(g.stripeEnabled) || Boolean(env.STRIPE_SECRET_KEY)) &&
        Boolean(sSecret) &&
        Boolean(sPub),
      publishableKey: sPub,
      secretKey: sSecret,
      webhookSecret: sWebhook,
    },
    paypal: {
      enabled:
        (Boolean(g.paypalEnabled) || Boolean(env.PAYPAL_CLIENT_SECRET)) &&
        Boolean(pId) &&
        Boolean(pSecret),
      clientId: pId,
      clientSecret: pSecret,
      mode: pMode,
    },
  };
});

export async function stripeEnabled(): Promise<boolean> {
  return (await getPaymentConfig()).stripe.enabled;
}
export async function paypalEnabled(): Promise<boolean> {
  return (await getPaymentConfig()).paypal.enabled;
}

export async function getStripe(): Promise<Stripe> {
  const cfg = await getPaymentConfig();
  if (!cfg.stripe.secretKey) throw new Error("Stripe is not configured");
  return new Stripe(cfg.stripe.secretKey);
}

/* ---- Product lookup (server) ---- */

export interface SellableProduct {
  id: string | number;
  name: string;
  slug: string;
  price: number;
  currency: string;
  hasDeliverable: boolean;
}

interface RawProduct {
  id: string | number;
  name?: string | null;
  slug?: string | null;
  price?: number | null;
  currency?: string | null;
  digitalFile?: unknown;
  fileUrl?: string | null;
}

export async function getSellableBySlug(
  slug: string,
): Promise<SellableProduct | null> {
  const payload = await payloadClient();
  const res = await payload.find({
    collection: "products",
    where: { slug: { equals: slug } },
    depth: 0,
    limit: 1,
  });
  const p = res.docs[0] as unknown as RawProduct | undefined;
  if (!p || !p.price || p.price <= 0) return null;
  if (!p.digitalFile && !p.fileUrl) return null; // nothing to deliver
  return {
    id: p.id,
    name: p.name ?? "Product",
    slug: p.slug ?? slug,
    price: p.price,
    currency: (p.currency ?? "usd").toLowerCase(),
    hasDeliverable: true,
  };
}

/* ---- Order finalization (idempotent by providerRef) ---- */

const mintToken = () => crypto.randomBytes(24).toString("hex");
const expiry = () =>
  new Date(Date.now() + DOWNLOAD_TTL_HOURS * 3600 * 1000).toISOString();

interface OrderDoc {
  id: string | number;
  status?: string | null;
  downloadToken?: string | null;
  downloadExpiresAt?: string | null;
  productName?: string | null;
}

/**
 * Upserts a paid order by providerRef and ensures it has a download token.
 * Safe to call from both the success/return page and the webhook — the first
 * call creates the order + emails the buyer; later calls are no-ops.
 */
export async function finalizeOrder(input: {
  provider: "stripe" | "paypal";
  providerRef: string;
  productSlug?: string | null;
  email?: string | null;
  amount?: number | null;
  currency?: string | null;
}): Promise<{ token: string; productName: string } | null> {
  const payload = await payloadClient();

  const existing = await payload.find({
    collection: "orders",
    where: { providerRef: { equals: input.providerRef } },
    limit: 1,
    depth: 0,
  });
  const found = existing.docs[0] as unknown as OrderDoc | undefined;

  if (found) {
    if (found.status === "paid" && found.downloadToken) {
      return { token: found.downloadToken, productName: found.productName ?? "" };
    }
    const token = found.downloadToken || mintToken();
    const updated = (await payload.update({
      collection: "orders",
      id: found.id,
      data: {
        status: "paid",
        downloadToken: token,
        downloadExpiresAt: found.downloadExpiresAt || expiry(),
      },
    })) as unknown as OrderDoc;
    return { token, productName: updated.productName ?? "" };
  }

  // New order — resolve the product for name + relation.
  let productId: string | number | undefined;
  let productName = "Your purchase";
  if (input.productSlug) {
    const p = await payload.find({
      collection: "products",
      where: { slug: { equals: input.productSlug } },
      limit: 1,
      depth: 0,
    });
    const prod = p.docs[0] as unknown as RawProduct | undefined;
    if (prod) {
      productId = prod.id;
      productName = prod.name ?? productName;
    }
  }

  const token = mintToken();
  await payload.create({
    collection: "orders",
    data: {
      product: productId,
      productName,
      email: input.email ?? undefined,
      amount: input.amount ?? undefined,
      currency: input.currency ?? undefined,
      provider: input.provider,
      providerRef: input.providerRef,
      status: "paid",
      downloadToken: token,
      downloadExpiresAt: expiry(),
      downloadCount: 0,
    },
  });

  if (input.email) {
    await sendDownloadEmail(input.email, productName, token).catch((err) =>
      console.error("[selling] download email failed:", err),
    );
  }

  return { token, productName };
}

async function sendDownloadEmail(email: string, productName: string, token: string) {
  if (!process.env.RESEND_API_KEY) return;
  const from = process.env.LEAD_EMAIL_FROM || "onboarding@resend.dev";
  const url = `${SITE_URL}/api/download/${token}`;
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: `With Hammad <${from}>`,
    to: [email],
    subject: `Your download: ${productName}`,
    html: `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6">
      <h2 style="margin:0 0 12px">Thanks for your purchase 🎉</h2>
      <p>Your download for <strong>${productName.replace(/[<>&]/g, "")}</strong> is ready:</p>
      <p><a href="${url}" style="display:inline-block;background:#FF8C00;color:#0A0A0B;text-decoration:none;padding:12px 22px;border-radius:999px">Download now</a></p>
      <p style="color:#888;font-size:13px">This link works for ${DOWNLOAD_TTL_HOURS} hours and up to ${MAX_DOWNLOADS} downloads.</p>
    </div>`,
  });
}

/* ---- PayPal REST (v2) ---- */

const paypalBase = (mode: "sandbox" | "live") =>
  mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function paypalAuth(): Promise<{ token: string; base: string }> {
  const { clientId, clientSecret, mode } = (await getPaymentConfig()).paypal;
  if (!clientId || !clientSecret) throw new Error("PayPal credentials missing");
  const base = paypalBase(mode);
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const json = (await res.json()) as { access_token: string };
  return { token: json.access_token, base };
}

export async function createPaypalOrder(p: SellableProduct): Promise<string> {
  const { token, base } = await paypalAuth();
  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: p.slug,
          description: p.name.slice(0, 127),
          amount: {
            currency_code: p.currency.toUpperCase(),
            value: p.price.toFixed(2),
          },
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`PayPal create failed: ${res.status}`);
  const json = (await res.json()) as { id: string };
  return json.id;
}

export async function capturePaypalOrder(orderId: string): Promise<{
  ok: boolean;
  email?: string;
  amount?: number;
  currency?: string;
  productSlug?: string;
}> {
  const { token, base } = await paypalAuth();
  const res = await fetch(
    `${base}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  const json = (await res.json()) as {
    status?: string;
    payer?: { email_address?: string };
    purchase_units?: {
      custom_id?: string;
      payments?: {
        captures?: { amount?: { value?: string; currency_code?: string } }[];
      };
    }[];
  };
  if (!res.ok || json.status !== "COMPLETED") return { ok: false };
  const unit = json.purchase_units?.[0];
  const cap = unit?.payments?.captures?.[0];
  return {
    ok: true,
    email: json.payer?.email_address,
    amount: cap?.amount?.value ? Number(cap.amount.value) : undefined,
    currency: cap?.amount?.currency_code?.toLowerCase(),
    productSlug: unit?.custom_id,
  };
}
