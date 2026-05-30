import { NextResponse } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import { payloadClient } from "@/lib/payload";
import { MAX_DOWNLOADS } from "@/lib/selling";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface DownloadFile {
  filename?: string | null;
  mimeType?: string | null;
}
interface OrderRow {
  id: string | number;
  status?: string | null;
  downloadExpiresAt?: string | null;
  downloadCount?: number | null;
  product?: { fileUrl?: string | null; digitalFile?: DownloadFile | null } | null;
}

// Token-gated delivery: validates the order, enforces expiry + download cap,
// then streams the private deliverable (or redirects to an external file URL).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token) return new Response("Not found", { status: 404 });

  const payload = await payloadClient();
  const res = await payload.find({
    collection: "orders",
    where: { downloadToken: { equals: token } },
    depth: 2,
    limit: 1,
  });
  const order = res.docs[0] as unknown as OrderRow | undefined;

  if (!order || order.status !== "paid") {
    return new Response("This download link is invalid.", { status: 404 });
  }
  if (order.downloadExpiresAt && new Date(order.downloadExpiresAt) < new Date()) {
    return new Response("This download link has expired.", { status: 410 });
  }
  if ((order.downloadCount ?? 0) >= MAX_DOWNLOADS) {
    return new Response("Download limit reached.", { status: 403 });
  }

  const product = order.product;
  if (!product) return new Response("File unavailable.", { status: 404 });

  // Count the download attempt.
  await payload.update({
    collection: "orders",
    id: order.id,
    data: { downloadCount: (order.downloadCount ?? 0) + 1 },
  });

  // External file URL takes precedence (e.g. cloud-hosted deliverable).
  if (product.fileUrl) {
    return NextResponse.redirect(product.fileUrl);
  }

  const file = product.digitalFile;
  if (!file?.filename) return new Response("File unavailable.", { status: 404 });

  try {
    const filePath = path.join(process.cwd(), "private/downloads", file.filename);
    const buf = await fs.readFile(filePath);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[download] read failed:", err);
    return new Response("File could not be read.", { status: 500 });
  }
}
