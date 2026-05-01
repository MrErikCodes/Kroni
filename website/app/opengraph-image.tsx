import { ImageResponse } from "next/og";

// Image metadata
export const alt = "Kroni — Lommepenger som lærer.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Brand tokens (kept inline so this route has no app-internal imports —
// `next/og` runs in an isolated Edge environment and doesn't see Tailwind).
const SAND_50 = "#FBFAF6";
const SAND_500 = "#7B7466";
const SAND_900 = "#1F1C14";
const GOLD_500 = "#F5B015";
const GOLD_700 = "#9C6F0E";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: SAND_50,
          backgroundImage: `radial-gradient(circle at 12% 10%, ${GOLD_500}33 0%, transparent 40%), radial-gradient(circle at 90% 100%, ${GOLD_500}1f 0%, transparent 35%)`,
          padding: "80px 96px",
          fontFamily:
            "ui-serif, Georgia, 'Times New Roman', Newsreader, serif",
          color: SAND_900,
        }}
      >
        {/* Wordmark row */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Kroni
          </span>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 9999,
              backgroundColor: GOLD_500,
              display: "block",
              transform: "translateY(-6px)",
            }}
          />
        </div>

        {/* Tagline + footnote */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <h1
            style={{
              fontSize: 116,
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              margin: 0,
              maxWidth: 980,
              color: SAND_900,
            }}
          >
            Lommepenger som{" "}
            <em style={{ fontStyle: "italic", color: GOLD_700 }}>lærer</em>.
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 28,
              color: SAND_500,
              fontFamily:
                "ui-sans-serif, -apple-system, 'Segoe UI', Inter, system-ui, sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            <span>Bygd i Norge for kjøkkenbordet ditt.</span>
            <span
              aria-hidden="true"
              style={{
                width: 4,
                height: 4,
                borderRadius: 9999,
                backgroundColor: SAND_500,
                display: "block",
              }}
            />
            <span>kroni.no</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
