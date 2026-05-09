import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          background: "#FAF8F4",
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 8,
        }}
      >
        <span style={{ color: "#D97757", fontSize: 20, fontWeight: 900, lineHeight: 1 }}>✦</span>
      </div>
    ),
    { ...size }
  );
}
