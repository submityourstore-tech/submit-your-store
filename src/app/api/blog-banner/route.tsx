import { ImageResponse } from "next/og";

export const runtime = "edge";

const CITY_THEME: Record<string, { bg: string; accent: string; subtitle: string }> = {
  dallas: { bg: "#0c4a7a", accent: "#f59e0b", subtitle: "DFW Metro HVAC Guide" },
  houston: { bg: "#0f766e", accent: "#38bdf8", subtitle: "Gulf Coast Cooling Guide" },
  austin: { bg: "#14532d", accent: "#a3e635", subtitle: "Central Texas HVAC Guide" },
  irving: { bg: "#1e3a5f", accent: "#60a5fa", subtitle: "Las Colinas & DFW HVAC" },
  arlington: { bg: "#1e293b", accent: "#3b82f6", subtitle: "Entertainment District HVAC" },
  "fort-worth": { bg: "#7c2d12", accent: "#fbbf24", subtitle: "Fort Worth & West TX HVAC" },
};

function themeFor(citySlug: string) {
  return CITY_THEME[citySlug.toLowerCase()] ?? { bg: "#1274c0", accent: "#f59e0b", subtitle: "Local HVAC Guide" };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.trim() || "Texas";
  const state = searchParams.get("state")?.trim() || "TX";
  const slug = searchParams.get("slug")?.trim() || city.toLowerCase().replace(/\s+/g, "-");
  const theme = themeFor(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 56,
          background: `linear-gradient(135deg, ${theme.bg} 0%, #0a1628 55%, ${theme.bg}dd 100%)`,
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: theme.accent,
            opacity: 0.12,
            transform: "translate(30%, -30%)",
          }}
        />
        <div style={{ fontSize: 22, fontWeight: 600, color: theme.accent, letterSpacing: 1 }}>
          {theme.subtitle}
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, marginTop: 12, maxWidth: 900 }}>
          Best HVAC Companies in {city}, {state}
        </div>
        <div style={{ fontSize: 24, marginTop: 16, opacity: 0.85 }}>
          Repair · Replacement · Residential · Commercial · 2026
        </div>
        <div style={{ fontSize: 18, marginTop: 28, opacity: 0.7 }}>Submit Your Store</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
