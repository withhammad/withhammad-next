import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const runtime = "nodejs";
export const alt = "Hammad Yousuf — AI Marketing Growth Strategist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  // Read the colocated brand backdrop directly (fetch(file://) fails at prerender).
  const bg = readFileSync(fileURLToPath(new URL("./og-bg.jpg", import.meta.url)));
  const bgSrc = `data:image/jpeg;base64,${bg.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#121212",
        }}
      >
        {/* AI-generated brand backdrop */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgSrc}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {/* Dark overlay for text legibility */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background:
              "linear-gradient(105deg, rgba(10,10,11,0.95) 30%, rgba(10,10,11,0.5) 100%)",
          }}
        />
        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 80,
            width: "100%",
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
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "#9CA3AF",
              marginTop: 32,
            }}
          >
            Hammad Yousuf — AI Marketing Growth Strategist
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
