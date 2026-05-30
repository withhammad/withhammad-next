import { NextResponse } from "next/server";
import {
  createPaypalOrder,
  getSellableBySlug,
  paypalEnabled,
} from "@/lib/selling";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await paypalEnabled())) {
    return NextResponse.json({ error: "PayPal not configured" }, { status: 503 });
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
    const id = await createPaypalOrder(product);
    return NextResponse.json({ id });
  } catch (err) {
    console.error("[checkout/paypal/create] error:", err);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 502 });
  }
}
