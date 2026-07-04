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

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildBannerSvg(city: string, state: string, slug: string): string {
  const theme = themeFor(slug);
  const title = `Best HVAC Companies in ${city}, ${state}`;
  const subtitle = theme.subtitle;
  const tags = "Repair · Replacement · Residential · Commercial · 2026";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg}"/>
      <stop offset="55%" stop-color="#0a1628"/>
      <stop offset="100%" stop-color="${theme.bg}" stop-opacity="0.87"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1020" cy="60" r="210" fill="${theme.accent}" opacity="0.12"/>
  <text x="56" y="420" fill="${theme.accent}" font-family="system-ui,Segoe UI,sans-serif" font-size="22" font-weight="600" letter-spacing="1">${escapeXml(subtitle)}</text>
  <text x="56" y="490" fill="#ffffff" font-family="system-ui,Segoe UI,sans-serif" font-size="48" font-weight="800">${escapeXml(title)}</text>
  <text x="56" y="540" fill="#ffffff" fill-opacity="0.85" font-family="system-ui,Segoe UI,sans-serif" font-size="24">${escapeXml(tags)}</text>
  <text x="56" y="590" fill="#ffffff" fill-opacity="0.7" font-family="system-ui,Segoe UI,sans-serif" font-size="18">Submit Your Store</text>
</svg>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.trim() || "Texas";
  const state = searchParams.get("state")?.trim() || "TX";
  const slug = searchParams.get("slug")?.trim() || city.toLowerCase().replace(/\s+/g, "-");

  const svg = buildBannerSvg(city, state, slug);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
