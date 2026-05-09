import { ImageResponse } from "next/og";

export const alt = "Claude Wrapped — Your Claude Code Scorecard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          background: "#FAF8F4",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
          <span style={{ color: "#D97757", fontSize: 28 }}>✦</span>
          <span style={{ color: "#D97757", fontSize: 15, fontWeight: 700, letterSpacing: "0.2em" }}>
            CLAUDE WRAPPED
          </span>
        </div>

        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          fontSize: 72, fontWeight: 900, color: "#1A1511",
          letterSpacing: "-0.03em", textAlign: "center", lineHeight: 1.1,
          marginBottom: 28,
        }}>
          <div style={{ display: "flex" }}>
            <span>Your Claude Code,&nbsp;</span>
            <span style={{ color: "#D97757" }}>beautifully</span>
          </div>
          <div>wrapped.</div>
        </div>

        <div style={{
          fontSize: 24, color: "#7A6E64",
          textAlign: "center", maxWidth: 720, lineHeight: 1.5,
          marginBottom: 52,
        }}>
          Persona · Tokens · Streak · Peak hours — all in one shareable card.
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {["npx github:phanisaimunipalli/claudewrapped", "6 themes", "14 backgrounds"].map((label) => (
            <div key={label} style={{
              background: "#F0EAE0", border: "1px solid #E8DDD0",
              borderRadius: 999, padding: "8px 20px",
              color: "#7A6E64", fontSize: 14, fontWeight: 600,
              display: "flex",
            }}>
              {label}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 52, color: "#A89880", fontSize: 16 }}>
          claudewrapped.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
