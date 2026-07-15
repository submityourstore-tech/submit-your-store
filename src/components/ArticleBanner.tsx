type ArticleBannerProps = {
  title: string;
  category: string;
  className?: string;
};

const CATEGORY_THEMES: Record<string, { bg: string; accent: string; icon: string }> = {
  "Local SEO": { bg: "from-[#1274c0] to-[#0a4f8a]", accent: "#1274c0", icon: "📍" },
  SEO: { bg: "from-[#059669] to-[#065f46]", accent: "#059669", icon: "🔍" },
  "Content Marketing": { bg: "from-[#d97706] to-[#b45309]", accent: "#d97706", icon: "📝" },
  "Technical SEO": { bg: "from-[#7c3aed] to-[#5b21b6]", accent: "#7c3aed", icon: "⚙️" },
};

const DEFAULT_THEME = { bg: "from-[#6b7280] to-[#374151]", accent: "#6b7280", icon: "📄" };

export function ArticleBanner({ title, category, className = "" }: ArticleBannerProps) {
  const theme = CATEGORY_THEMES[category] ?? DEFAULT_THEME;

  return (
    <div
      className={`relative flex flex-col justify-end overflow-hidden bg-gradient-to-br ${theme.bg} ${className}`}
      style={{ minHeight: 180 }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-10" style={{
        backgroundImage: "linear-gradient(0deg, transparent 24%, rgba(255,255,255,.04) 25%, rgba(255,255,255,.04) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.04) 75%, rgba(255,255,255,.04) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.04) 25%, rgba(255,255,255,.04) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.04) 75%, rgba(255,255,255,.04) 76%, transparent 77%)",
        backgroundSize: "50px 50px",
      }} />

      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10" />

      <div className="relative z-10 p-5 sm:p-6">
        <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {theme.icon} {category}
        </span>
        <h3 className="text-lg font-extrabold leading-tight text-white sm:text-xl">
          {title}
        </h3>
        <p className="mt-2 text-xs text-white/60">submityourstore.com</p>
      </div>
    </div>
  );
}
