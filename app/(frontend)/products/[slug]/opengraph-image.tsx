import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/content";

// Node runtime so the Payload fetch works (Edge can't run Payload).
export const runtime = "nodejs";
export const alt = "Digital product — With Hammad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Og({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const name = product?.name ?? "Digital product";
  const tagline = product?.tagline ?? "";
  const price = product?.free ? "Free" : (product?.priceLabel ?? "");
  const tier = product?.badge ?? (product?.free ? "Free resource" : "Digital product");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0A0A0B",
          color: "#F5F5F7",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#9CA3AF",
            fontSize: 28,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 9999,
              background: "#F59E0B",
            }}
          />
          With Hammad · {tier}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.02,
            }}
          >
            {name}
          </div>
          {tagline ? (
            <div
              style={{
                display: "flex",
                fontSize: 30,
                color: "#9CA3AF",
                lineHeight: 1.25,
              }}
            >
              {tagline}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 800,
              color: "#F59E0B",
              lineHeight: 1,
            }}
          >
            {price}
          </div>
          {price && price !== "Free" ? (
            <div style={{ display: "flex", fontSize: 30, color: "#9CA3AF" }}>
              one-time
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...size },
  );
}
