import { ImageResponse } from "next/og";

export const alt = "AfroSmart — Buy. Sell. Connect Across Africa.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social sharing preview, generated at build/request time (no external assets).
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
          background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "110px",
              height: "110px",
              borderRadius: "28px",
              background: "rgba(255,255,255,0.18)",
              fontSize: "70px",
              fontWeight: 800,
            }}
          >
            A
          </div>
          <div style={{ fontSize: "64px", fontWeight: 800 }}>AfroSmart</div>
        </div>
        <div style={{ marginTop: "48px", fontSize: "72px", fontWeight: 800, lineHeight: 1.05 }}>
          Buy. Sell. Connect
        </div>
        <div style={{ fontSize: "72px", fontWeight: 800, lineHeight: 1.05 }}>Across Africa.</div>
        <div style={{ marginTop: "32px", fontSize: "30px", color: "rgba(255,255,255,0.85)" }}>
          Liberia&apos;s trusted marketplace · vehicles · real estate · electronics · jobs · services
        </div>
      </div>
    ),
    { ...size },
  );
}
