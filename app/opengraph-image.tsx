import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "AfroSmart — Buy. Sell. Connect Across Africa.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social sharing preview built from the official logo (embedded as a data URI so
// it resolves on any host, including before the custom domain is live).
export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/afrosmart-logo.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: "56px",
          background: "#0a0a0a",
          padding: "80px",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <img src={src} width={380} height={380} style={{ borderRadius: 32 }} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.1 }}>Buy. Sell.</div>
          <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.1 }}>Connect Across Africa.</div>
          <div style={{ marginTop: 28, fontSize: 30, color: "rgba(255,255,255,0.82)" }}>
            Liberia&apos;s trusted marketplace
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
