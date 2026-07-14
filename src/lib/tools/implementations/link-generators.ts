import type { UtilityToolField } from "@/types/utility-tools";

type ToolImplementation = {
  fields: UtilityToolField[];
  generate: (values: Record<string, string>) => string;
};

// --- Google Review QR Generator ---

export const googleReviewQrGenerator: ToolImplementation = {
  fields: [
    { key: "businessName", label: "Business Name", type: "text", placeholder: "Your Business Name" },
    { key: "reviewUrl", label: "Google Review URL", type: "url", required: true, placeholder: "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID" },
  ],
  generate(values) {
    const businessName = values.businessName || "Your Business";
    const reviewUrl = values.reviewUrl || "";

    const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(reviewUrl)}`;

    return `📱 Google Review QR Code — ${businessName}
${"─".repeat(40)}

## Review Link
${reviewUrl}

## QR Code Image URL
${qrDataUrl}

## Embed Code
\`\`\`html
<img src="${qrDataUrl}" alt="Leave a review for ${businessName}" width="300" height="300" />
\`\`\`

## How to Find Your Google Review Link

1. **Search** for your business on Google
2. Click on your **Google Business Profile**
3. Click **"Ask for reviews"** button (or find it in your Google Business dashboard)
4. Copy the provided link

### Alternative — Using Place ID:
1. Go to: https://developers.google.com/maps/documentation/places/web-service/place-id
2. Search for your business
3. Copy the Place ID
4. Your review URL format: \`https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID\`

## Tips
- Print the QR code on receipts, business cards, and table tents
- Include a short call-to-action: "Scan to leave us a review!"
- Add to your email signature for post-service follow-ups`;
  },
};

// --- Google Maps Embed Generator ---

export const googleMapsEmbedGenerator: ToolImplementation = {
  fields: [
    { key: "query", label: "Address or Place", type: "text", required: true, placeholder: "1600 Amphitheatre Parkway, Mountain View, CA" },
    { key: "width", label: "Width (px)", type: "number", placeholder: "600", defaultValue: "600" },
    { key: "height", label: "Height (px)", type: "number", placeholder: "450", defaultValue: "450" },
    { key: "zoom", label: "Zoom Level (1-21)", type: "number", placeholder: "15", defaultValue: "15" },
    {
      key: "mapType",
      label: "Map Type",
      type: "select",
      options: [
        { value: "roadmap", label: "Roadmap" },
        { value: "satellite", label: "Satellite" },
      ],
    },
  ],
  generate(values) {
    const query = values.query || "New York, NY";
    const width = values.width || "600";
    const height = values.height || "450";
    const zoom = values.zoom || "15";
    const mapType = values.mapType || "roadmap";

    const encodedQuery = encodeURIComponent(query);

    const embedNoKey = `<iframe
  src="https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodedQuery}&zoom=${zoom}&maptype=${mapType}"
  width="${width}"
  height="${height}"
  style="border:0"
  allowfullscreen=""
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade">
</iframe>`;

    const embedFree = `<iframe
  src="https://maps.google.com/maps?q=${encodedQuery}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed"
  width="${width}"
  height="${height}"
  style="border:0"
  allowfullscreen=""
  loading="lazy">
</iframe>`;

    return `🗺️ Google Maps Embed Code
${"─".repeat(40)}

## Location: ${query}

### Option 1 — Free Embed (no API key required)

\`\`\`html
${embedFree}
\`\`\`

### Option 2 — Maps Embed API (requires API key)

\`\`\`html
${embedNoKey}
\`\`\`

⚠️ **Note:** Option 2 requires a Google Maps API key for full functionality.
To get an API key:
1. Go to https://console.cloud.google.com/
2. Create or select a project
3. Enable "Maps Embed API"
4. Create an API key under Credentials
5. Replace \`YOUR_API_KEY\` in the code above

### Settings
- **Dimensions:** ${width}×${height}px
- **Zoom:** ${zoom}
- **Map Type:** ${mapType}`;
  },
};

// --- UTM URL Builder ---

export const utmUrlBuilder: ToolImplementation = {
  fields: [
    { key: "url", label: "Website URL", type: "url", required: true, placeholder: "https://yoursite.com/landing-page" },
    { key: "source", label: "Campaign Source", type: "text", required: true, placeholder: "google, newsletter, facebook" },
    { key: "medium", label: "Campaign Medium", type: "text", required: true, placeholder: "cpc, email, social" },
    { key: "campaign", label: "Campaign Name", type: "text", required: true, placeholder: "spring_sale" },
    { key: "term", label: "Campaign Term (optional)", type: "text", placeholder: "running+shoes" },
    { key: "content", label: "Campaign Content (optional)", type: "text", placeholder: "banner_ad_1" },
  ],
  generate(values) {
    const baseUrl = values.url || "https://example.com";
    const params: [string, string][] = [];

    if (values.source) params.push(["utm_source", values.source]);
    if (values.medium) params.push(["utm_medium", values.medium]);
    if (values.campaign) params.push(["utm_campaign", values.campaign]);
    if (values.term) params.push(["utm_term", values.term]);
    if (values.content) params.push(["utm_content", values.content]);

    const separator = baseUrl.includes("?") ? "&" : "?";
    const queryString = params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    const fullUrl = `${baseUrl}${separator}${queryString}`;

    const paramTable = params
      .map(([k, v]) => `| ${k.padEnd(14)} | ${v.padEnd(30)} |`)
      .join("\n");

    return `🔗 UTM Tagged URL
${"─".repeat(40)}

## Generated URL

${fullUrl}

## Parameters Breakdown

| Parameter      | Value                          |
|----------------|--------------------------------|
${paramTable}

## Usage Tips

- Use lowercase and underscores for consistency
- Keep campaign names descriptive but concise
- Track this URL in Google Analytics under Acquisition > Campaigns
- Use unique URLs for each ad, email, or post to measure performance accurately`;
  },
};

// --- WhatsApp Link Generator ---

export const whatsappLinkGenerator: ToolImplementation = {
  fields: [
    { key: "phone", label: "Phone Number (with country code)", type: "text", required: true, placeholder: "14155552671" },
    { key: "message", label: "Pre-filled Message", type: "textarea", rows: 3, placeholder: "Hi! I'm interested in your services..." },
  ],
  generate(values) {
    const phone = (values.phone || "").replace(/[^\d]/g, "");
    const message = values.message || "";

    const link = message
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/${phone}`;

    return `💬 WhatsApp Link
${"─".repeat(40)}

## Direct Link

${link}

## HTML Code

\`\`\`html
<a href="${link}" target="_blank" rel="noopener noreferrer">
  Chat on WhatsApp
</a>
\`\`\`

## Button with Icon

\`\`\`html
<a href="${link}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;background:#25D366;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.604-1.21A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-2.115 0-4.142-.578-5.906-1.67l-.424-.252-2.732.719.73-2.67-.277-.44A9.723 9.723 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/></svg>
  Chat on WhatsApp
</a>
\`\`\`

## Details
- **Phone:** +${phone}
- **Message:** ${message || "(none)"}`;
  },
};

// --- Click to Call Generator ---

export const clickToCallGenerator: ToolImplementation = {
  fields: [
    { key: "phone", label: "Phone Number", type: "text", required: true, placeholder: "+1 (555) 123-4567" },
    { key: "displayText", label: "Display Text", type: "text", placeholder: "Call Us Now", defaultValue: "Call Us Now" },
  ],
  generate(values) {
    const phone = values.phone || "+15551234567";
    const cleaned = phone.replace(/[^\d+]/g, "");
    const display = values.displayText || phone;

    return `📞 Click-to-Call Link
${"─".repeat(40)}

## HTML Code

\`\`\`html
<a href="tel:${cleaned}">${display}</a>
\`\`\`

## Styled Button

\`\`\`html
<a href="tel:${cleaned}" style="display:inline-flex;align-items:center;gap:8px;background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;font-size:16px">
  📞 ${display}
</a>
\`\`\`

## Mobile-Only Version (hidden on desktop)

\`\`\`html
<a href="tel:${cleaned}" class="mobile-call-btn" style="display:none">
  ${display}
</a>
<style>
@media (max-width: 768px) {
  .mobile-call-btn { display: inline-block !important; }
}
</style>
\`\`\`

## Details
- **Phone (raw):** ${cleaned}
- **Display:** ${display}
- Works on all mobile devices and VoIP-enabled desktops`;
  },
};

// --- Mailto Link Generator ---

export const mailtoLinkGenerator: ToolImplementation = {
  fields: [
    { key: "email", label: "Email Address", type: "email", required: true, placeholder: "hello@example.com" },
    { key: "subject", label: "Subject", type: "text", placeholder: "Inquiry from website" },
    { key: "body", label: "Body", type: "textarea", rows: 3, placeholder: "Hi, I'd like to learn more about..." },
    { key: "cc", label: "CC", type: "email", placeholder: "cc@example.com" },
    { key: "bcc", label: "BCC", type: "email", placeholder: "bcc@example.com" },
  ],
  generate(values) {
    const email = values.email || "hello@example.com";
    const params: string[] = [];

    if (values.subject) params.push(`subject=${encodeURIComponent(values.subject)}`);
    if (values.body) params.push(`body=${encodeURIComponent(values.body)}`);
    if (values.cc) params.push(`cc=${encodeURIComponent(values.cc)}`);
    if (values.bcc) params.push(`bcc=${encodeURIComponent(values.bcc)}`);

    const query = params.length > 0 ? `?${params.join("&")}` : "";
    const mailto = `mailto:${email}${query}`;

    return `📧 Mailto Link
${"─".repeat(40)}

## Generated Link

${mailto}

## HTML Code

\`\`\`html
<a href="${mailto}">Email Us</a>
\`\`\`

## Styled Button

\`\`\`html
<a href="${mailto}" style="display:inline-flex;align-items:center;gap:8px;background:#059669;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold">
  ✉️ Email Us
</a>
\`\`\`

## Parameters
- **To:** ${email}
${values.subject ? `- **Subject:** ${values.subject}` : ""}
${values.body ? `- **Body:** ${values.body}` : ""}
${values.cc ? `- **CC:** ${values.cc}` : ""}
${values.bcc ? `- **BCC:** ${values.bcc}` : ""}`;
  },
};

// --- NAP Formatter ---

export const napFormatter: ToolImplementation = {
  fields: [
    { key: "businessName", label: "Business Name", type: "text", required: true },
    { key: "street", label: "Street Address", type: "text", required: true },
    { key: "city", label: "City", type: "text", required: true },
    { key: "state", label: "State / Province", type: "text", required: true },
    { key: "zip", label: "ZIP / Postal Code", type: "text", required: true },
    { key: "country", label: "Country", type: "text", placeholder: "US", defaultValue: "US" },
    { key: "phone", label: "Phone Number", type: "text", required: true },
    { key: "website", label: "Website URL", type: "url" },
  ],
  generate(values) {
    const name = values.businessName || "Business Name";
    const street = values.street || "123 Main St";
    const city = values.city || "City";
    const state = values.state || "ST";
    const zip = values.zip || "00000";
    const country = values.country || "US";
    const phone = values.phone || "(555) 123-4567";
    const website = values.website || "";

    const plainText = `${name}
${street}
${city}, ${state} ${zip}
${phone}${website ? `\n${website}` : ""}`;

    const html = `<div itemscope itemtype="https://schema.org/LocalBusiness">
  <strong itemprop="name">${name}</strong><br>
  <span itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
    <span itemprop="streetAddress">${street}</span><br>
    <span itemprop="addressLocality">${city}</span>,
    <span itemprop="addressRegion">${state}</span>
    <span itemprop="postalCode">${zip}</span><br>
    <span itemprop="addressCountry">${country}</span>
  </span><br>
  <a href="tel:${phone.replace(/[^\d+]/g, "")}" itemprop="telephone">${phone}</a>${website ? `<br>\n  <a href="${website}" itemprop="url">${website.replace(/^https?:\/\//, "")}</a>` : ""}
</div>`;

    const schemaOrg = JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name,
        address: {
          "@type": "PostalAddress",
          streetAddress: street,
          addressLocality: city,
          addressRegion: state,
          postalCode: zip,
          addressCountry: country,
        },
        telephone: phone,
        ...(website ? { url: website } : {}),
      },
      null,
      2
    );

    const citation = `${name} | ${street}, ${city}, ${state} ${zip} | ${phone}${website ? ` | ${website}` : ""}`;

    return `📍 NAP (Name, Address, Phone) — ${name}
${"─".repeat(40)}

## Plain Text

${plainText}

## Citation-Ready (One Line)

${citation}

## HTML with Microdata

\`\`\`html
${html}
\`\`\`

## Schema.org JSON-LD

\`\`\`json
${schemaOrg}
\`\`\`

## Tips for NAP Consistency
- Use the EXACT same format across all directories and listings
- Choose one phone format and stick with it
- Include suite/unit numbers consistently
- Match your Google Business Profile exactly`;
  },
};

// --- Google Maps Direction Generator ---

export const googleMapsDirectionGenerator: ToolImplementation = {
  fields: [
    { key: "destination", label: "Destination Address or Coordinates", type: "text", required: true, placeholder: "1600 Amphitheatre Parkway, Mountain View, CA" },
    { key: "origin", label: "Starting Point (blank = user's location)", type: "text", placeholder: "Leave blank for user's current location" },
  ],
  generate(values) {
    const destination = values.destination || "";
    const origin = values.origin || "";

    const encodedDest = encodeURIComponent(destination);
    const encodedOrigin = origin ? encodeURIComponent(origin) : "";

    const link = origin
      ? `https://www.google.com/maps/dir/${encodedOrigin}/${encodedDest}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodedDest}`;

    return `🧭 Google Maps Directions Link
${"─".repeat(40)}

## Direction Link

${link}

## HTML Code

\`\`\`html
<a href="${link}" target="_blank" rel="noopener noreferrer">
  Get Directions
</a>
\`\`\`

## Styled Button

\`\`\`html
<a href="${link}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;background:#4285f4;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold">
  📍 Get Directions
</a>
\`\`\`

## Details
- **Destination:** ${destination}
- **Starting Point:** ${origin || "User's current location"}

## Alternative Formats

**Apple Maps:**
\`https://maps.apple.com/?daddr=${encodedDest}\`

**Waze:**
\`https://waze.com/ul?q=${encodedDest}&navigate=yes\``;
  },
};

// --- Review Link Generator ---

const reviewPlatformInstructions: Record<string, { urlFormat: string; instructions: string }> = {
  Google: {
    urlFormat: "https://search.google.com/local/writereview?placeid=PLACE_ID",
    instructions: `1. Go to Google Maps and search for your business
2. Click on your business listing
3. Find your Place ID using: https://developers.google.com/maps/documentation/places/web-service/place-id
4. Your review link: https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID`,
  },
  Yelp: {
    urlFormat: "https://www.yelp.com/writeareview/biz/BUSINESS_URL",
    instructions: `1. Find your business on Yelp
2. Go to your business page
3. Your direct review URL: https://www.yelp.com/writeareview/biz/your-business-name-city`,
  },
  Facebook: {
    urlFormat: "https://www.facebook.com/PAGE_NAME/reviews",
    instructions: `1. Go to your Facebook Business Page
2. The review URL format is: https://www.facebook.com/YOUR_PAGE/reviews
3. Make sure your page has the Reviews tab enabled in Page Settings`,
  },
  TripAdvisor: {
    urlFormat: "https://www.tripadvisor.com/UserReviewEdit-gXXXXXX-dXXXXXX",
    instructions: `1. Find your business on TripAdvisor
2. Click "Write a Review" on your listing
3. Copy that URL — it's your direct review link
4. The format typically includes your property ID (d-number)`,
  },
  Trustpilot: {
    urlFormat: "https://www.trustpilot.com/evaluate/DOMAIN",
    instructions: `1. Your Trustpilot review link is based on your domain
2. Format: https://www.trustpilot.com/evaluate/yourdomain.com
3. Make sure your business is claimed on Trustpilot first`,
  },
};

export const reviewLinkGenerator: ToolImplementation = {
  fields: [
    {
      key: "platform",
      label: "Review Platform",
      type: "select",
      required: true,
      options: [
        { value: "Google", label: "Google" },
        { value: "Yelp", label: "Yelp" },
        { value: "Facebook", label: "Facebook" },
        { value: "TripAdvisor", label: "TripAdvisor" },
        { value: "Trustpilot", label: "Trustpilot" },
      ],
    },
    { key: "businessUrl", label: "Business URL or ID", type: "text", required: true, placeholder: "Your business URL, Page ID, or Place ID" },
  ],
  generate(values) {
    const platform = values.platform || "Google";
    const businessId = values.businessUrl || "";
    const info = reviewPlatformInstructions[platform] || reviewPlatformInstructions.Google;

    let directLink = "";
    switch (platform) {
      case "Google":
        directLink = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(businessId)}`;
        break;
      case "Yelp":
        directLink = `https://www.yelp.com/writeareview/biz/${encodeURIComponent(businessId)}`;
        break;
      case "Facebook":
        directLink = `https://www.facebook.com/${encodeURIComponent(businessId)}/reviews`;
        break;
      case "TripAdvisor":
        directLink = businessId.startsWith("http") ? businessId : `https://www.tripadvisor.com/UserReviewEdit-${businessId}`;
        break;
      case "Trustpilot":
        directLink = `https://www.trustpilot.com/evaluate/${businessId.replace(/^https?:\/\//, "")}`;
        break;
    }

    return `⭐ Review Link — ${platform}
${"─".repeat(40)}

## Direct Review Link

${directLink}

## URL Format

\`${info.urlFormat}\`

## HTML Code

\`\`\`html
<a href="${directLink}" target="_blank" rel="noopener noreferrer">
  Leave us a review on ${platform}
</a>
\`\`\`

## Styled Button

\`\`\`html
<a href="${directLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#f59e0b;color:#1f2937;padding:10px 20px;border-radius:5px;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold">
  ⭐ Review us on ${platform}
</a>
\`\`\`

## How to Find Your ${platform} Review Link

${info.instructions}

## Tips
- Share the review link after a positive customer interaction
- Add to email signatures, receipts, and thank-you pages
- Respond to all reviews (positive and negative) to boost engagement`;
  },
};

// --- Business Card QR Generator ---

export const businessCardQrGenerator: ToolImplementation = {
  fields: [
    { key: "fullName", label: "Full Name", type: "text", required: true },
    { key: "title", label: "Job Title", type: "text" },
    { key: "company", label: "Company", type: "text" },
    { key: "phone", label: "Phone", type: "text", placeholder: "+1 555 123 4567" },
    { key: "email", label: "Email", type: "email" },
    { key: "website", label: "Website", type: "url" },
    { key: "address", label: "Address", type: "textarea", rows: 2, placeholder: "123 Main St\nCity, State ZIP" },
  ],
  generate(values) {
    const name = values.fullName || "Name";
    const nameParts = name.split(" ");
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    const firstName = nameParts[0] || "";

    const lines: string[] = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${lastName};${firstName};;;`,
      `FN:${name}`,
    ];

    if (values.company) lines.push(`ORG:${values.company}`);
    if (values.title) lines.push(`TITLE:${values.title}`);
    if (values.phone) lines.push(`TEL;TYPE=WORK,VOICE:${values.phone}`);
    if (values.email) lines.push(`EMAIL;TYPE=WORK:${values.email}`);
    if (values.website) lines.push(`URL:${values.website}`);
    if (values.address) {
      const addr = values.address.replace(/\n/g, ";");
      lines.push(`ADR;TYPE=WORK:;;${addr}`);
    }

    lines.push("END:VCARD");
    const vcard = lines.join("\n");

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(vcard)}`;

    return `📇 vCard / Business Card QR
${"─".repeat(40)}

## vCard Content

\`\`\`
${vcard}
\`\`\`

## QR Code Image URL

${qrUrl}

## Embed Code

\`\`\`html
<img src="${qrUrl}" alt="Contact card for ${name}" width="300" height="300" />
\`\`\`

## Details
- **Name:** ${name}
${values.title ? `- **Title:** ${values.title}` : ""}
${values.company ? `- **Company:** ${values.company}` : ""}
${values.phone ? `- **Phone:** ${values.phone}` : ""}
${values.email ? `- **Email:** ${values.email}` : ""}
${values.website ? `- **Website:** ${values.website}` : ""}

## Usage
- Print this QR code on physical business cards
- When scanned, it will prompt the user to save your contact info
- Works with all modern smartphones
- The vCard format is universally supported by iOS and Android`;
  },
};
