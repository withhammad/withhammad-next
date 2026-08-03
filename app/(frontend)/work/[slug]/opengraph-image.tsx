import { ImageResponse } from "next/og";
import { getCaseStudyBySlug } from "@/lib/content";

// Node runtime so the Payload fetch works (Edge can't run Payload).
export const runtime = "nodejs";
export const alt = "Case study — Hammad Yousuf";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Og({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cs = await getCaseStudyBySlug(slug);
  const f = cs?.caseStudyFields;
  const name = f?.clientName ?? cs?.title ?? "Case study";
  const metric = f?.heroMetric ?? "";
  const label = f?.heroMetricLabel ?? "";
  const services = f?.servicesUsed ?? "";

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
          With Hammad · Case Study
        </div>
        {metric ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                display: "flex",
                fontSize: 130,
                fontWeight: 800,
                color: "#F59E0B",
                lineHeight: 1,
              }}
            >
              {metric}
            </div>
            {label ? (
              <div style={{ display: "flex", fontSize: 34, color: "#9CA3AF" }}>
                {label}
              </div>
            ) : null}
          </div>
        ) : null}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 700 }}>
            {name}
          </div>
          {services ? (
            <div style={{ display: "flex", fontSize: 26, color: "#9CA3AF" }}>
              {services}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...size },
  );
}
