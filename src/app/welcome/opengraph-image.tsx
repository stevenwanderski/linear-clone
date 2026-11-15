import { ImageResponse } from "next/og";
import { logoStrokes } from "@/components/logo";
import { appName } from "@/lib/brand";

// The preview image when someone shares the site link. Generated once at build time.
export const alt = `${appName}: Linear without all the noise.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";


export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 96, background: "#0b0c0e", color: "#fafafa" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 36, fontWeight: 600 }}>
          {/* The logo, drawn with plain SVG attributes, which the image renderer understands. */}
          <svg width="56" height="56" viewBox="0 0 32 32">
            <g transform="rotate(45 16 16)" stroke="#fafafa" strokeWidth="3" strokeLinecap="round">
              {logoStrokes.map(({ x, half }) => <line key={x} x1={x} y1={16 - half} x2={x} y2={16 + half} />)}
            </g>
          </svg>
          {appName}
        </div>
        <div style={{ marginTop: 48, fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1.05 }}>Linear without all the noise.</div>
        <div style={{ marginTop: 24, fontSize: 36, color: "#a1a1aa" }}>Projects and issues. That&apos;s it.</div>
      </div>
    ),
    size,
  );
}
