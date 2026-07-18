import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "#0b1220", borderRadius: 6,
        }}
      >
        <div
          style={{
            width: 20, height: 20, borderRadius: "50%",
            background: "#1fae6b", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "#0b1220",
          }}
        >
          F
        </div>
      </div>
    ),
    { ...size }
  );
}
