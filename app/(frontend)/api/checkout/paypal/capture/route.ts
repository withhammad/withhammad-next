import { NextResponse } from "next/server";
import {
  capturePaypalOrder,
  finalizeOrder,
  paypalEnabled,
} from "@/lib/selling";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await paypalEnabled())) {
    return NextResponse.json({ error: "PayPal not configured" }, { status: 503 });
  }

  let body: { orderID?: string };
  try {
    body = (await req.json()) as { orderID?: string };
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const orderID = String(body.orderID ?? "");
  if (!orderID) {
    return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
  }

  try {
    const result = await capturePaypalOrder(orderID);
    if (!result.ok) {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }
    const fin = await finalizeOrder({
      provider: "paypal",
      providerRef: orderID,
      productSlug: result.productSlug,
      email: result.email,
      amount: result.amount,
      currency: result.currency,
    });
    return NextResponse.json({ token: fin?.token });
  } catch (err) {
    console.error("[checkout/paypal/capture] error:", err);
    return NextResponse.json({ error: "Could not complete payment" }, { status: 502 });
  }
}
