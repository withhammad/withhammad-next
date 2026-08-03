"use client";

import { useCallback, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function BuyPanel({
  productSlug,
  priceLabel,
  currency = "usd",
  label,
  stripePublishableKey,
  paypalClientId,
}: {
  productSlug: string;
  priceLabel: string;
  currency?: string;
  label?: string;
  stripePublishableKey?: string;
  paypalClientId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [payErr, setPayErr] = useState("");
  const stripePromise = useMemo(
    () => (stripePublishableKey ? loadStripe(stripePublishableKey) : null),
    [stripePublishableKey],
  );

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/checkout/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productSlug }),
    });
    const json = (await res.json()) as { clientSecret?: string };
    return json.clientSecret ?? "";
  }, [productSlug]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--accent)] px-7 text-sm font-medium text-[var(--accent-ink)] shadow-[0_12px_32px_-12px_rgba(255,140,0,0.45)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#FFA31A]"
      >
        {label ?? `Buy · ${priceLabel}`}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative my-8 w-full max-w-lg rounded-3xl border border-white/10 bg-[var(--panel)] p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">
                Secure checkout
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-[var(--muted)] transition-colors hover:text-[var(--text)]"
              >
                ✕
              </button>
            </div>

            {payErr ? (
              <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {payErr}
              </p>
            ) : null}

            {/* Card via Stripe embedded checkout (on-domain) */}
            {stripePromise ? (
              <div className="overflow-hidden rounded-2xl bg-white">
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{ fetchClientSecret }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            ) : null}

            {/* PayPal */}
            {paypalClientId ? (
              <div className={stripePromise ? "mt-6" : ""}>
                {stripePromise ? (
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      or
                    </span>
                    <span className="h-px flex-1 bg-white/10" />
                  </div>
                ) : null}
                <PayPalScriptProvider
                  options={{
                    clientId: paypalClientId,
                    currency: currency.toUpperCase(),
                    components: "buttons",
                  }}
                >
                  <PayPalButtons
                    style={{ layout: "vertical", color: "gold", shape: "pill" }}
                    createOrder={async () => {
                      setPayErr("");
                      const res = await fetch("/api/checkout/paypal/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ productSlug }),
                      });
                      const json = (await res.json()) as { id?: string };
                      if (!json.id) throw new Error("Could not start PayPal checkout");
                      return json.id;
                    }}
                    onApprove={async (data) => {
                      const res = await fetch("/api/checkout/paypal/capture", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderID: data.orderID }),
                      });
                      const json = (await res.json()) as { token?: string };
                      if (json.token) {
                        window.location.href = `/checkout/return?token=${json.token}`;
                      } else {
                        setPayErr("Payment captured but the download link failed. Check your email or contact me.");
                      }
                    }}
                    onError={() =>
                      setPayErr("PayPal hit an error. Please try the card option or contact me.")
                    }
                  />
                </PayPalScriptProvider>
              </div>
            ) : null}

            <p className="mt-5 text-center text-xs text-[var(--muted)]">
              Payments are processed securely by Stripe & PayPal. You&apos;ll get
              an instant download + an email receipt.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
