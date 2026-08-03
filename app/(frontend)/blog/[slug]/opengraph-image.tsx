import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/content";

// Node runtime so the Payload fetch works (Edge can't run Payload).
export const runtime = "nodejs";
export const alt = "Article — With Hammad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Og({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const title = post?.title ?? "Article";
  const category = post?.categories?.[0]?.name ?? "";

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
          background: "#121212",
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
          With Hammad · Blog
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {category ? (
            <div
              style={{
                display: "flex",
                fontSize: 30,
                fontWeight: 600,
                color: "#FF8C00",
              }}
            >
              {category}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.08,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
