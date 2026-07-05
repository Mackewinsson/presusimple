import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Presusimple – Budgeting Made Easy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "#d3ff3d",
            marginBottom: 32,
          }}
        >
          <span style={{ fontSize: 48, fontWeight: 700, color: "#0f172a" }}>P</span>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          Presusimple
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Zero-based budgeting made easy
        </div>
      </div>
    ),
    { ...size }
  );
}
