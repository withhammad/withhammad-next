import { ImageResponse } from "next/og";

export const alt = "Hammad Yousuf — AI Marketing Growth Strategist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
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
          With Hammad · Dubai, UAE
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 74,
            fontWeight: 700,
            lineHeight: 1.1,
            marginTop: 28,
            maxWidth: 940,
            letterSpacing: "-0.02em",
          }}
        >
          AI-driven growth for founders who want results, not reports.
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#9CA3AF", marginTop: 32 }}>
          Hammad Yousuf — AI Marketing Growth Strategist
        </div>
      </div>
    ),
    { ...size },
  );
}
