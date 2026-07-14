import type { UtilityToolField } from "@/types/utility-tools";

type GeneratorToolConfig = {
  fields: UtilityToolField[];
  generate: (values: Record<string, string>) => string;
};

// ---------------------------------------------------------------------------
// 1. Meta Title Generator
// ---------------------------------------------------------------------------

export const metaTitleGenerator: GeneratorToolConfig = {
  fields: [
    {
      key: "pageTopic",
      label: "Page Topic",
      type: "text",
      placeholder: "e.g. Best Running Shoes for Flat Feet",
      required: true,
    },
    {
      key: "brandName",
      label: "Brand Name",
      type: "text",
      placeholder: "e.g. MyBrand",
    },
    {
      key: "separator",
      label: "Separator",
      type: "select",
      defaultValue: "|",
      options: [
        { value: "|", label: "| (pipe)" },
        { value: "-", label: "- (hyphen)" },
        { value: "–", label: "– (en dash)" },
      ],
    },
  ],
  generate(values) {
    const { pageTopic, brandName, separator = "|" } = values;
    if (!pageTopic) return "<!-- Please provide a page topic -->";

    const title = brandName
      ? `${pageTopic.trim()} ${separator} ${brandName.trim()}`
      : pageTopic.trim();

    const len = title.length;
    const warning =
      len > 60
        ? `\n<!-- ⚠ Title is ${len} characters. Recommended: 60 or fewer for full display in search results. -->`
        : `\n<!-- ✓ Title is ${len} characters (within the recommended 60-character limit). -->`;

    return `<title>${escapeHtml(title)}</title>${warning}`;
  },
};

// ---------------------------------------------------------------------------
// 2. Meta Description Generator
// ---------------------------------------------------------------------------

export const metaDescriptionGenerator: GeneratorToolConfig = {
  fields: [
    {
      key: "pageTopic",
      label: "Page Topic",
      type: "text",
      placeholder: "e.g. Online shoe store specializing in comfort footwear",
      required: true,
    },
    {
      key: "keywords",
      label: "Keywords (comma-separated)",
      type: "text",
      placeholder: "e.g. running shoes, flat feet, comfortable shoes",
    },
    {
      key: "tone",
      label: "Tone",
      type: "select",
      defaultValue: "professional",
      options: [
        { value: "professional", label: "Professional" },
        { value: "casual", label: "Casual" },
        { value: "persuasive", label: "Persuasive" },
      ],
    },
  ],
  generate(values) {
    const { pageTopic, keywords = "", tone = "professional" } = values;
    if (!pageTopic) return "<!-- Please provide a page topic -->";

    const keywordList = keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    let description: string;
    const topic = pageTopic.trim();

    switch (tone) {
      case "casual":
        description = keywordList.length
          ? `Looking for ${keywordList[0]}? Check out ${topic}. We cover ${keywordList.join(", ")} and more.`
          : `Check out ${topic}. Find everything you need in one place.`;
        break;
      case "persuasive":
        description = keywordList.length
          ? `Discover ${topic} — your go-to resource for ${keywordList.join(", ")}. Start today and see the difference.`
          : `Discover ${topic}. Start today and see the difference for yourself.`;
        break;
      default:
        description = keywordList.length
          ? `${topic}. Learn about ${keywordList.join(", ")} and explore expert insights on this topic.`
          : `${topic}. Explore expert insights and comprehensive resources on this topic.`;
    }

    if (description.length > 160) {
      description = description.slice(0, 157) + "...";
    }

    const len = description.length;
    let note: string;
    if (len < 150) {
      note = `\n<!-- ⚠ Description is ${len} characters. Ideal range is 150–160 characters. Consider adding more detail. -->`;
    } else if (len > 160) {
      note = `\n<!-- ⚠ Description is ${len} characters. Ideal range is 150–160 characters. Consider trimming. -->`;
    } else {
      note = `\n<!-- ✓ Description is ${len} characters (within the ideal 150–160 range). -->`;
    }

    return `<meta name="description" content="${escapeAttr(description)}">${note}`;
  },
};

// ---------------------------------------------------------------------------
// 3. Meta Tag Generator
// ---------------------------------------------------------------------------

export const metaTagGenerator: GeneratorToolConfig = {
  fields: [
    {
      key: "title",
      label: "Title",
      type: "text",
      placeholder: "Page title",
      required: true,
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Page description (150–160 characters ideal)",
      required: true,
      rows: 3,
    },
    {
      key: "keywords",
      label: "Keywords (comma-separated)",
      type: "text",
      placeholder: "e.g. seo, tools, meta tags",
    },
    {
      key: "author",
      label: "Author",
      type: "text",
      placeholder: "e.g. John Doe",
    },
    {
      key: "viewport",
      label: "Viewport",
      type: "text",
      defaultValue: "width=device-width, initial-scale=1",
    },
    {
      key: "robotsIndex",
      label: "Indexing",
      type: "select",
      defaultValue: "index",
      options: [
        { value: "index", label: "index" },
        { value: "noindex", label: "noindex" },
      ],
    },
    {
      key: "robotsFollow",
      label: "Following",
      type: "select",
      defaultValue: "follow",
      options: [
        { value: "follow", label: "follow" },
        { value: "nofollow", label: "nofollow" },
      ],
    },
  ],
  generate(values) {
    const {
      title,
      description,
      keywords,
      author,
      viewport = "width=device-width, initial-scale=1",
      robotsIndex = "index",
      robotsFollow = "follow",
    } = values;

    if (!title || !description) return "<!-- Please provide both a title and description -->";

    const lines: string[] = [
      '<meta charset="UTF-8">',
      `<meta name="viewport" content="${escapeAttr(viewport)}">`,
      "",
      `<title>${escapeHtml(title.trim())}</title>`,
      `<meta name="description" content="${escapeAttr(description.trim())}">`,
    ];

    if (keywords?.trim()) {
      lines.push(`<meta name="keywords" content="${escapeAttr(keywords.trim())}">`);
    }

    if (author?.trim()) {
      lines.push(`<meta name="author" content="${escapeAttr(author.trim())}">`);
    }

    lines.push(`<meta name="robots" content="${robotsIndex}, ${robotsFollow}">`);

    return lines.join("\n");
  },
};

// ---------------------------------------------------------------------------
// 4. Robots.txt Generator
// ---------------------------------------------------------------------------

export const robotsTxtGenerator: GeneratorToolConfig = {
  fields: [
    {
      key: "sitemapUrl",
      label: "Sitemap URL",
      type: "url",
      placeholder: "https://example.com/sitemap.xml",
    },
    {
      key: "crawlDelay",
      label: "Crawl Delay (seconds)",
      type: "number",
      placeholder: "10",
    },
    {
      key: "disallowPaths",
      label: "Disallow Paths (one per line)",
      type: "textarea",
      placeholder: "/admin/\n/private/\n/tmp/",
      rows: 5,
    },
    {
      key: "allowPaths",
      label: "Allow Paths (one per line)",
      type: "textarea",
      placeholder: "/public/\n/api/docs/",
      rows: 4,
    },
    {
      key: "blockedAgents",
      label: "User Agents to Block",
      type: "textarea",
      placeholder: "Googlebot\nBingbot\nYandexBot\nBaiduspider\nDuckDuckBot\nAhrefsBot\nSemrushBot",
      rows: 4,
    },
  ],
  generate(values) {
    const { sitemapUrl, crawlDelay, disallowPaths, allowPaths, blockedAgents } = values;

    const disallow = parseLines(disallowPaths);
    const allow = parseLines(allowPaths);
    const blocked = parseLines(blockedAgents);

    const sections: string[] = [];

    sections.push("User-agent: *");
    for (const p of allow) sections.push(`Allow: ${p}`);
    for (const p of disallow) sections.push(`Disallow: ${p}`);
    if (crawlDelay && Number(crawlDelay) > 0) {
      sections.push(`Crawl-delay: ${Number(crawlDelay)}`);
    }

    if (blocked.length) {
      sections.push("");
      for (const agent of blocked) {
        sections.push(`User-agent: ${agent}`);
        sections.push("Disallow: /");
        sections.push("");
      }
    }

    if (sitemapUrl?.trim()) {
      sections.push("");
      sections.push(`Sitemap: ${sitemapUrl.trim()}`);
    }

    return sections.join("\n");
  },
};

// ---------------------------------------------------------------------------
// 5. XML Sitemap Generator
// ---------------------------------------------------------------------------

export const xmlSitemapGenerator: GeneratorToolConfig = {
  fields: [
    {
      key: "urls",
      label: "URLs (one per line)",
      type: "textarea",
      placeholder: "https://example.com/\nhttps://example.com/about\nhttps://example.com/contact",
      required: true,
      rows: 8,
    },
    {
      key: "changefreq",
      label: "Change Frequency",
      type: "select",
      defaultValue: "weekly",
      options: [
        { value: "always", label: "Always" },
        { value: "hourly", label: "Hourly" },
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
        { value: "yearly", label: "Yearly" },
        { value: "never", label: "Never" },
      ],
    },
    {
      key: "priority",
      label: "Priority (0.0 – 1.0)",
      type: "text",
      defaultValue: "0.8",
      placeholder: "0.8",
    },
  ],
  generate(values) {
    const { urls, changefreq = "weekly", priority = "0.8" } = values;
    const urlList = parseLines(urls);

    if (!urlList.length) return "<!-- Please provide at least one URL -->";

    const p = clampPriority(priority);
    const today = new Date().toISOString().slice(0, 10);

    const entries = urlList
      .map(
        (url) =>
          `  <url>\n    <loc>${escapeXml(url)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${p}</priority>\n  </url>`,
      )
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
  },
};

// ---------------------------------------------------------------------------
// 6. Canonical Tag Generator
// ---------------------------------------------------------------------------

export const canonicalTagGenerator: GeneratorToolConfig = {
  fields: [
    {
      key: "canonicalUrl",
      label: "Canonical URL",
      type: "url",
      placeholder: "https://example.com/preferred-page",
      required: true,
    },
  ],
  generate(values) {
    const { canonicalUrl } = values;
    if (!canonicalUrl?.trim()) return "<!-- Please provide a canonical URL -->";
    return `<link rel="canonical" href="${escapeAttr(canonicalUrl.trim())}">`;
  },
};

// ---------------------------------------------------------------------------
// 7. Open Graph Generator
// ---------------------------------------------------------------------------

export const openGraphGenerator: GeneratorToolConfig = {
  fields: [
    {
      key: "ogTitle",
      label: "Title",
      type: "text",
      placeholder: "Page title for social sharing",
      required: true,
    },
    {
      key: "ogDescription",
      label: "Description",
      type: "textarea",
      placeholder: "Brief description for social sharing",
      required: true,
      rows: 3,
    },
    {
      key: "ogUrl",
      label: "Page URL",
      type: "url",
      placeholder: "https://example.com/page",
      required: true,
    },
    {
      key: "ogImage",
      label: "Image URL",
      type: "url",
      placeholder: "https://example.com/image.jpg",
    },
    {
      key: "ogType",
      label: "Type",
      type: "select",
      defaultValue: "website",
      options: [
        { value: "website", label: "Website" },
        { value: "article", label: "Article" },
        { value: "product", label: "Product" },
        { value: "profile", label: "Profile" },
        { value: "video.other", label: "Video" },
        { value: "music.song", label: "Music" },
      ],
    },
    {
      key: "ogSiteName",
      label: "Site Name",
      type: "text",
      placeholder: "e.g. My Website",
    },
    {
      key: "ogLocale",
      label: "Locale",
      type: "text",
      defaultValue: "en_US",
      placeholder: "e.g. en_US",
    },
  ],
  generate(values) {
    const { ogTitle, ogDescription, ogUrl, ogImage, ogType = "website", ogSiteName, ogLocale = "en_US" } = values;

    if (!ogTitle || !ogDescription || !ogUrl) {
      return "<!-- Please provide at least a title, description, and URL -->";
    }

    const tags: string[] = [
      `<meta property="og:type" content="${escapeAttr(ogType)}">`,
      `<meta property="og:title" content="${escapeAttr(ogTitle.trim())}">`,
      `<meta property="og:description" content="${escapeAttr(ogDescription.trim())}">`,
      `<meta property="og:url" content="${escapeAttr(ogUrl.trim())}">`,
    ];

    if (ogImage?.trim()) {
      tags.push(`<meta property="og:image" content="${escapeAttr(ogImage.trim())}">`);
    }

    if (ogSiteName?.trim()) {
      tags.push(`<meta property="og:site_name" content="${escapeAttr(ogSiteName.trim())}">`);
    }

    if (ogLocale?.trim()) {
      tags.push(`<meta property="og:locale" content="${escapeAttr(ogLocale.trim())}">`);
    }

    return tags.join("\n");
  },
};

// ---------------------------------------------------------------------------
// 8. Twitter Card Generator
// ---------------------------------------------------------------------------

export const twitterCardGenerator: GeneratorToolConfig = {
  fields: [
    {
      key: "cardType",
      label: "Card Type",
      type: "select",
      defaultValue: "summary_large_image",
      options: [
        { value: "summary", label: "Summary" },
        { value: "summary_large_image", label: "Summary with Large Image" },
      ],
    },
    {
      key: "twTitle",
      label: "Title",
      type: "text",
      placeholder: "Card title",
      required: true,
    },
    {
      key: "twDescription",
      label: "Description",
      type: "textarea",
      placeholder: "Card description",
      required: true,
      rows: 3,
    },
    {
      key: "twImage",
      label: "Image URL",
      type: "url",
      placeholder: "https://example.com/image.jpg",
    },
    {
      key: "twHandle",
      label: "Twitter Handle",
      type: "text",
      placeholder: "@yourbrand",
    },
  ],
  generate(values) {
    const { cardType = "summary_large_image", twTitle, twDescription, twImage, twHandle } = values;

    if (!twTitle || !twDescription) {
      return "<!-- Please provide at least a title and description -->";
    }

    const tags: string[] = [
      `<meta name="twitter:card" content="${escapeAttr(cardType)}">`,
      `<meta name="twitter:title" content="${escapeAttr(twTitle.trim())}">`,
      `<meta name="twitter:description" content="${escapeAttr(twDescription.trim())}">`,
    ];

    if (twImage?.trim()) {
      tags.push(`<meta name="twitter:image" content="${escapeAttr(twImage.trim())}">`);
    }

    if (twHandle?.trim()) {
      const handle = twHandle.trim().startsWith("@") ? twHandle.trim() : `@${twHandle.trim()}`;
      tags.push(`<meta name="twitter:site" content="${escapeAttr(handle)}">`);
      tags.push(`<meta name="twitter:creator" content="${escapeAttr(handle)}">`);
    }

    return tags.join("\n");
  },
};

// ---------------------------------------------------------------------------
// 9. Hreflang Tag Generator
// ---------------------------------------------------------------------------

export const hreflangTagGenerator: GeneratorToolConfig = {
  fields: [
    {
      key: "entries",
      label: "URL | Language Code (one per line)",
      type: "textarea",
      placeholder:
        "https://example.com/|en\nhttps://example.com/es/|es\nhttps://example.com/fr/|fr\nhttps://example.com/de/|de",
      required: true,
      rows: 8,
    },
  ],
  generate(values) {
    const { entries } = values;
    const lines = parseLines(entries);

    if (!lines.length) return "<!-- Please provide at least one URL|lang-code entry -->";

    const tags: string[] = [];
    const parsed: { url: string; lang: string }[] = [];

    for (const line of lines) {
      const sepIndex = line.lastIndexOf("|");
      if (sepIndex === -1) {
        tags.push(`<!-- ⚠ Skipped invalid entry (missing "|" separator): ${escapeHtml(line)} -->`);
        continue;
      }
      const url = line.slice(0, sepIndex).trim();
      const lang = line.slice(sepIndex + 1).trim();
      if (!url || !lang) {
        tags.push(`<!-- ⚠ Skipped incomplete entry: ${escapeHtml(line)} -->`);
        continue;
      }
      parsed.push({ url, lang });
    }

    for (const { url, lang } of parsed) {
      tags.push(`<link rel="alternate" hreflang="${escapeAttr(lang)}" href="${escapeAttr(url)}">`);
    }

    if (parsed.length && !parsed.some((e) => e.lang === "x-default")) {
      tags.push("");
      tags.push("<!-- Consider adding an x-default entry for users whose language is not listed -->");
      tags.push(
        `<!-- <link rel="alternate" hreflang="x-default" href="${escapeAttr(parsed[0].url)}"> -->`,
      );
    }

    return tags.join("\n");
  },
};

// ---------------------------------------------------------------------------
// 10. Google Index Checker
// ---------------------------------------------------------------------------

export const googleIndexChecker: GeneratorToolConfig = {
  fields: [
    {
      key: "url",
      label: "URL to Check",
      type: "url",
      placeholder: "https://example.com/my-page",
      required: true,
    },
  ],
  generate(values) {
    const { url } = values;
    if (!url?.trim()) return "<!-- Please enter a URL to check -->";

    const checkUrl = `https://www.google.com/search?q=site:${encodeURIComponent(url.trim())}`;

    return `<div style="font-family:system-ui,sans-serif;max-width:600px;padding:20px;">
  <h3 style="margin:0 0 12px;color:#1a73e8;">Google Index Check</h3>
  <p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.6;">
    Click the link below to check if <strong>${escapeHtml(url.trim())}</strong> is indexed by Google.
    If results appear, your page is indexed. If you see "No results found", the page is not yet indexed.
  </p>
  <a href="${escapeAttr(checkUrl)}" target="_blank" rel="noopener noreferrer"
     style="display:inline-block;padding:10px 20px;background:#1a73e8;color:white;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">
    Check Index Status on Google →
  </a>
  <div style="margin-top:20px;padding:14px;background:#f8f9fa;border-radius:6px;border:1px solid #e0e0e0;">
    <p style="margin:0;font-size:13px;color:#666;"><strong>Search query used:</strong></p>
    <code style="display:block;margin-top:6px;font-size:13px;color:#333;word-break:break-all;">site:${escapeHtml(url.trim())}</code>
  </div>
  <div style="margin-top:16px;padding:12px;background:#fff3cd;border-radius:6px;border:1px solid #ffc107;">
    <p style="margin:0;font-size:12px;color:#856404;"><strong>💡 Tips:</strong> New pages can take days to weeks to be indexed. Use Google Search Console to request indexing faster.</p>
  </div>
</div>`;
  },
};

// ---------------------------------------------------------------------------
// 11. Page Speed Insights Link
// ---------------------------------------------------------------------------

export const pageSpeedChecker: GeneratorToolConfig = {
  fields: [
    {
      key: "url",
      label: "URL to Analyze",
      type: "url",
      placeholder: "https://example.com",
      required: true,
    },
  ],
  generate(values) {
    const { url } = values;
    if (!url?.trim()) return "<!-- Please enter a URL to analyze -->";

    const checkUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url.trim())}`;

    return `<div style="font-family:system-ui,sans-serif;max-width:600px;padding:20px;">
  <h3 style="margin:0 0 12px;color:#1a73e8;">PageSpeed Insights</h3>
  <p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.6;">
    Analyze the performance, accessibility, best practices, and SEO of <strong>${escapeHtml(url.trim())}</strong> using Google PageSpeed Insights.
  </p>
  <a href="${escapeAttr(checkUrl)}" target="_blank" rel="noopener noreferrer"
     style="display:inline-block;padding:10px 20px;background:#1a73e8;color:white;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">
    Run PageSpeed Analysis →
  </a>
  <div style="margin-top:20px;padding:14px;background:#f8f9fa;border-radius:6px;border:1px solid #e0e0e0;">
    <p style="margin:0;font-size:13px;color:#666;"><strong>Direct link:</strong></p>
    <a href="${escapeAttr(checkUrl)}" target="_blank" rel="noopener" style="display:block;margin-top:6px;font-size:12px;color:#1a73e8;word-break:break-all;">${escapeHtml(checkUrl)}</a>
  </div>
  <div style="margin-top:16px;padding:12px;background:#d4edda;border-radius:6px;border:1px solid #28a745;">
    <p style="margin:0;font-size:12px;color:#155724;"><strong>💡 Tip:</strong> Aim for a score of 90+ on all four categories. Focus on Core Web Vitals (LCP, FID, CLS) for the biggest SEO impact.</p>
  </div>
</div>`;
  },
};

// ---------------------------------------------------------------------------
// 12. Mobile Friendly Test
// ---------------------------------------------------------------------------

export const mobileFriendlyTest: GeneratorToolConfig = {
  fields: [
    {
      key: "url",
      label: "URL to Test",
      type: "url",
      placeholder: "https://example.com",
      required: true,
    },
  ],
  generate(values) {
    const { url } = values;
    if (!url?.trim()) return "<!-- Please enter a URL to test -->";

    const checkUrl = `https://search.google.com/test/mobile-friendly?url=${encodeURIComponent(url.trim())}`;

    return `<div style="font-family:system-ui,sans-serif;max-width:600px;padding:20px;">
  <h3 style="margin:0 0 12px;color:#1a73e8;">Mobile-Friendly Test</h3>
  <p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.6;">
    Test whether <strong>${escapeHtml(url.trim())}</strong> is mobile-friendly according to Google's standards.
  </p>
  <a href="${escapeAttr(checkUrl)}" target="_blank" rel="noopener noreferrer"
     style="display:inline-block;padding:10px 20px;background:#1a73e8;color:white;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">
    Run Mobile-Friendly Test →
  </a>
  <div style="margin-top:20px;padding:14px;background:#f8f9fa;border-radius:6px;border:1px solid #e0e0e0;">
    <p style="margin:0;font-size:13px;color:#666;"><strong>Direct link:</strong></p>
    <a href="${escapeAttr(checkUrl)}" target="_blank" rel="noopener" style="display:block;margin-top:6px;font-size:12px;color:#1a73e8;word-break:break-all;">${escapeHtml(checkUrl)}</a>
  </div>
  <div style="margin-top:16px;padding:12px;background:#d4edda;border-radius:6px;border:1px solid #28a745;">
    <p style="margin:0;font-size:12px;color:#155724;"><strong>💡 Tip:</strong> Google uses mobile-first indexing, meaning the mobile version of your site is what gets indexed and ranked.</p>
  </div>
</div>`;
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseLines(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function clampPriority(val: string): string {
  const n = parseFloat(val);
  if (isNaN(n)) return "0.8";
  return Math.max(0.0, Math.min(1.0, n)).toFixed(1);
}
