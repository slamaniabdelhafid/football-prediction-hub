import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Football Prediction Hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "#0b1220", color: "#edf1f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 76, fontWeight: 800, letterSpacing: -2 }}>
          <span style={{ color: "#edf1f7" }}>FOOTBALL</span>
          <span style={{ color: "#1fae6b" }}>PREDICTION</span>
          <span style={{ color: "#edf1f7" }}>HUB</span>
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: "#8b97ac" }}>
          Real Fixtures · Standings · Match Predictions
        </div>
      </div>
    ),
    { ...size }
  );
}
