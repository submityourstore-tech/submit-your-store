import type { BlogCity } from "@/lib/blog-cities";

const CITY_THEME: Record<string, { bg: string; accent: string; subtitle: string }> = {
  dallas: { bg: "#0c4a7a", accent: "#f59e0b", subtitle: "DFW Metro HVAC Guide" },
  houston: { bg: "#0f766e", accent: "#38bdf8", subtitle: "Gulf Coast Cooling Guide" },
  austin: { bg: "#14532d", accent: "#a3e635", subtitle: "Central Texas HVAC Guide" },
  irving: { bg: "#1e3a5f", accent: "#60a5fa", subtitle: "Las Colinas & DFW HVAC" },
  arlington: { bg: "#1e293b", accent: "#3b82f6", subtitle: "Entertainment District HVAC" },
  "fort-worth": { bg: "#7c2d12", accent: "#fbbf24", subtitle: "Fort Worth & West TX HVAC" },
};

function themeFor(slug: string) {
  return CITY_THEME[slug.toLowerCase()] ?? { bg: "#1274c0", accent: "#f59e0b", subtitle: "Local HVAC Guide" };
}

type BlogCityBannerProps = {
  city: string;
  state: string;
  slug: string;
  className?: string;
  title?: string;
};

export function BlogCityBanner({ city, state, slug, className = "", title }: BlogCityBannerProps) {
  const theme = themeFor(slug);
  const heading = title ?? `Best HVAC Companies in ${city}, ${state}`;
  const gradientId = `blog-bg-${slug.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 630"
      role="img"
      aria-label={heading}
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.bg} />
          <stop offset="55%" stopColor="#0a1628" />
          <stop offset="100%" stopColor={theme.bg} stopOpacity={0.87} />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill={`url(#${gradientId})`} />
      <circle cx="1020" cy="60" r="210" fill={theme.accent} opacity={0.12} />
      <text
        x="56"
        y="420"
        fill={theme.accent}
        fontFamily="system-ui,Segoe UI,sans-serif"
        fontSize="22"
        fontWeight="600"
        letterSpacing="1"
      >
        {theme.subtitle}
      </text>
      <text
        x="56"
        y="490"
        fill="#ffffff"
        fontFamily="system-ui,Segoe UI,sans-serif"
        fontSize="48"
        fontWeight="800"
      >
        {heading}
      </text>
      <text
        x="56"
        y="540"
        fill="#ffffff"
        fillOpacity={0.85}
        fontFamily="system-ui,Segoe UI,sans-serif"
        fontSize="24"
      >
        Repair · Replacement · Residential · Commercial · 2026
      </text>
      <text
        x="56"
        y="590"
        fill="#ffffff"
        fillOpacity={0.7}
        fontFamily="system-ui,Segoe UI,sans-serif"
        fontSize="18"
      >
        Submit Your Store
      </text>
    </svg>
  );
}

export function BlogCityBannerFromConfig({
  city,
  className,
  title,
}: {
  city: BlogCity;
  className?: string;
  title?: string;
}) {
  return (
    <BlogCityBanner
      city={city.city}
      state={city.state}
      slug={city.slug}
      className={className}
      title={title}
    />
  );
}
