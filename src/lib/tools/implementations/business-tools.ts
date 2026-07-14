import type { UtilityToolField } from "@/types/utility-tools";

type ToolImplementation = {
  fields: UtilityToolField[];
  generate: (values: Record<string, string>) => string;
};

// --- Business Name Generator ---

const industryPrefixes: Record<string, string[]> = {
  HVAC: ["Arctic", "Comfort", "Climate", "AirFlow", "CoolBreeze", "ThermoMax", "FrostGuard", "HeatWave", "VentPro", "AirTech"],
  Restaurant: ["Flavor", "Savory", "Golden", "Fresh", "Harvest", "Spice", "Plate", "Urban", "Table", "Feast"],
  Tech: ["Byte", "Pixel", "Quantum", "Nexus", "Logic", "Cipher", "Nova", "Stack", "Core", "Sync"],
  Health: ["Vital", "Wellness", "Pure", "Heal", "Life", "Care", "Bloom", "Thrive", "Balance", "Renew"],
  Retail: ["Market", "Shop", "Trade", "Cart", "Bazaar", "Depot", "Store", "Outlet", "Emporium", "Gallery"],
  Consulting: ["Apex", "Summit", "Insight", "Strata", "Pinnacle", "Forge", "Bridge", "Compass", "Keystone", "Catalyst"],
  Other: ["Pro", "Prime", "Elite", "Alpha", "Ace", "Peak", "Zenith", "Vertex", "Crest", "Vanguard"],
};

const styleSuffixes: Record<string, string[]> = {
  Professional: ["Solutions", "Services", "Group", "Associates", "Partners", "Consulting", "Corp", "Agency", "Global", "Industries"],
  Creative: ["Lab", "Studio", "Hive", "Spark", "Canvas", "Bloom", "Craft", "Nest", "Wave", "Muse"],
  Modern: ["Hub", "IO", "X", "Digital", "Cloud", "Link", "Shift", "Pulse", "Flow", "Dash"],
  Classic: ["& Sons", "& Co", "Brothers", "Heritage", "Legacy", "Founders", "House", "Works", "Estate", "Guild"],
  Fun: ["Buzz", "Pop", "Snap", "Zap", "Boom", "Vibe", "Groove", "Splash", "Bounce", "Twist"],
};

export const businessNameGenerator: ToolImplementation = {
  fields: [
    {
      key: "industry",
      label: "Industry / Niche",
      type: "select",
      required: true,
      options: [
        { value: "HVAC", label: "HVAC" },
        { value: "Restaurant", label: "Restaurant" },
        { value: "Tech", label: "Tech" },
        { value: "Health", label: "Health" },
        { value: "Retail", label: "Retail" },
        { value: "Consulting", label: "Consulting" },
        { value: "Other", label: "Other" },
      ],
    },
    { key: "keywords", label: "Keywords", type: "text", placeholder: "e.g. fast, reliable, local" },
    {
      key: "style",
      label: "Style",
      type: "select",
      required: true,
      options: [
        { value: "Professional", label: "Professional" },
        { value: "Creative", label: "Creative" },
        { value: "Modern", label: "Modern" },
        { value: "Classic", label: "Classic" },
        { value: "Fun", label: "Fun" },
      ],
    },
  ],
  generate(values) {
    const industry = values.industry || "Other";
    const style = values.style || "Professional";
    const keywords = values.keywords?.split(/[,\s]+/).filter(Boolean) || [];

    const prefixes = industryPrefixes[industry] || industryPrefixes.Other;
    const suffixes = styleSuffixes[style] || styleSuffixes.Professional;

    const names: string[] = [];
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

    for (let i = 0; i < 10; i++) {
      const prefix = prefixes[i % prefixes.length];
      const suffix = suffixes[i % suffixes.length];
      if (keywords.length > 0) {
        const kw = capitalize(keywords[i % keywords.length]);
        if (i % 3 === 0) names.push(`${prefix}${kw} ${suffix}`);
        else if (i % 3 === 1) names.push(`${kw} ${prefix} ${suffix}`);
        else names.push(`${prefix} ${suffix}`);
      } else {
        names.push(`${prefix} ${suffix}`);
      }
    }

    return `🏢 Business Name Suggestions\nIndustry: ${industry} | Style: ${style}\n${"─".repeat(40)}\n\n${names.map((n, i) => `${i + 1}. ${n}`).join("\n")}\n\n💡 Tips:\n• Check domain availability for your favorite picks\n• Search trademark databases before committing\n• Test the name with your target audience`;
  },
};

// --- Business Slogan Generator ---

const sloganTemplates = [
  (biz: string, _ind: string, _aud: string, kw: string) => `${biz} — Where ${kw} Meets Excellence`,
  (_biz: string, ind: string, _aud: string, _kw: string) => `Your Trusted ${ind} Partner`,
  (biz: string, _ind: string, _aud: string, kw: string) => `${biz}: Delivering ${kw}, Every Time`,
  (_biz: string, _ind: string, aud: string, kw: string) => `Empowering ${aud} with ${kw}`,
  (biz: string, _ind: string, _aud: string, _kw: string) => `Experience the ${biz} Difference`,
  (_biz: string, ind: string, _aud: string, kw: string) => `${ind} Solutions. ${kw} Results.`,
  (biz: string, _ind: string, _aud: string, kw: string) => `${biz} — Built on ${kw}`,
  (_biz: string, _ind: string, aud: string, kw: string) => `${kw} for ${aud} Who Demand More`,
  (biz: string, _ind: string, _aud: string, _kw: string) => `Think ${biz}. Think Better.`,
  (biz: string, _ind: string, _aud: string, kw: string) => `${biz}: ${kw} You Can Count On`,
];

export const businessSloganGenerator: ToolImplementation = {
  fields: [
    { key: "businessName", label: "Business Name", type: "text", required: true, placeholder: "Your Company Name" },
    { key: "industry", label: "Industry", type: "text", required: true, placeholder: "e.g. Technology, Healthcare" },
    { key: "targetAudience", label: "Target Audience", type: "text", placeholder: "e.g. small business owners" },
    { key: "keywords", label: "Keywords", type: "text", placeholder: "e.g. quality, innovation, trust" },
  ],
  generate(values) {
    const biz = values.businessName || "Your Business";
    const ind = values.industry || "Business";
    const aud = values.targetAudience || "customers";
    const kwList = values.keywords?.split(/[,\s]+/).filter(Boolean) || ["quality"];

    const slogans = sloganTemplates.map((tmpl, i) => {
      const kw = kwList[i % kwList.length];
      const capitalized = kw.charAt(0).toUpperCase() + kw.slice(1);
      return tmpl(biz, ind, aud, capitalized);
    });

    return `📣 Slogan Suggestions for "${biz}"\n${"─".repeat(40)}\n\n${slogans.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n💡 Pick a slogan that:\n• Is easy to remember\n• Reflects your unique value proposition\n• Resonates with ${aud}`;
  },
};

// --- Company Description Generator ---

export const companyDescriptionGenerator: ToolImplementation = {
  fields: [
    { key: "companyName", label: "Company Name", type: "text", required: true, placeholder: "Acme Corp" },
    { key: "industry", label: "Industry", type: "text", required: true, placeholder: "e.g. Software Development" },
    { key: "city", label: "City / Location", type: "text", placeholder: "e.g. Austin, TX" },
    { key: "years", label: "Years in Business", type: "number", placeholder: "e.g. 10" },
    { key: "services", label: "Key Services", type: "textarea", placeholder: "List your main services...", rows: 3 },
    {
      key: "tone",
      label: "Tone",
      type: "select",
      options: [
        { value: "professional", label: "Professional" },
        { value: "friendly", label: "Friendly" },
        { value: "authoritative", label: "Authoritative" },
      ],
    },
  ],
  generate(values) {
    const name = values.companyName || "Our Company";
    const ind = values.industry || "our industry";
    const city = values.city ? ` based in ${values.city}` : "";
    const years = values.years ? ` with over ${values.years} years of experience` : "";
    const services = values.services?.split("\n").filter(Boolean).join(", ") || "a range of services";
    const tone = values.tone || "professional";

    let short: string, medium: string, long: string;

    if (tone === "friendly") {
      short = `${name} is a ${ind} company${city}${years}. We specialize in ${services} and love helping our clients succeed.`;
      medium = `Welcome to ${name}! We're a ${ind} company${city}${years}, dedicated to providing top-notch ${services}. Our team is passionate about delivering results that make a real difference. Whether you're a startup or an established business, we're here to help you grow and thrive.`;
      long = `Hey there! Welcome to ${name} — we're a ${ind} company${city}${years}. What started as a small operation has grown into a trusted name in the industry, all because we genuinely care about our clients' success.\n\nWe specialize in ${services}, and our approach is simple: treat every client like they're our only client. Our experienced team brings creativity, expertise, and a whole lot of enthusiasm to every project.\n\nWhat sets us apart? We listen first, then deliver solutions tailored to your unique needs. We've helped countless businesses achieve their goals, and we'd love to do the same for you. Let's chat about how we can work together!`;
    } else if (tone === "authoritative") {
      short = `${name} is a leading ${ind} firm${city}${years}, delivering excellence in ${services} to discerning clients.`;
      medium = `${name} stands as a preeminent ${ind} organization${city}${years}. Our firm delivers exceptional ${services} backed by deep expertise and an unwavering commitment to excellence. We serve industry leaders who demand nothing less than outstanding results and measurable ROI.`;
      long = `${name} is a distinguished ${ind} organization${city}${years}. As an industry leader, we have established an unparalleled track record of delivering superior ${services} to organizations that demand excellence.\n\nOur team comprises seasoned professionals with deep domain expertise, ensuring every engagement produces measurable outcomes. We employ proven methodologies refined through years of practice, combined with cutting-edge approaches that keep our clients ahead of the competition.\n\nWe serve a select portfolio of clients who value precision, reliability, and results. Our commitment to excellence has earned us recognition as a trusted advisor in the ${ind} space. When the stakes are high and outcomes matter, organizations turn to ${name}.`;
    } else {
      short = `${name} is a ${ind} company${city}${years}, providing ${services} to help businesses achieve their goals.`;
      medium = `${name} is a reputable ${ind} company${city}${years}. We specialize in ${services}, delivering tailored solutions that drive growth and efficiency. Our team of dedicated professionals is committed to excellence, ensuring every client receives personalized attention and measurable results.`;
      long = `${name} is a full-service ${ind} company${city}${years}. We have built our reputation on a foundation of quality, integrity, and client-focused service delivery.\n\nOur core offerings include ${services}. Each service is designed to address specific business challenges while creating opportunities for growth and optimization. Our team of experienced professionals brings a wealth of knowledge and a commitment to staying at the forefront of industry developments.\n\nAt ${name}, we understand that every client is unique. That's why we take a consultative approach, working closely with you to develop strategies and solutions that align with your specific goals and budget. Our track record of successful engagements speaks to our dedication to delivering value at every stage of the relationship.`;
    }

    return `📝 Company Description — ${name}\n${"─".repeat(40)}\n\n📌 SHORT (~50 words):\n${short}\n\n📌 MEDIUM (~100 words):\n${medium}\n\n📌 LONG (~200 words):\n${long}`;
  },
};

// --- Business Bio Generator ---

export const businessBioGenerator: ToolImplementation = {
  fields: [
    { key: "personName", label: "Full Name", type: "text", required: true, placeholder: "Jane Smith" },
    { key: "role", label: "Role / Title", type: "text", required: true, placeholder: "CEO & Founder" },
    { key: "companyName", label: "Company Name", type: "text", required: true, placeholder: "Acme Corp" },
    { key: "experience", label: "Years of Experience", type: "number", placeholder: "15" },
    { key: "specialties", label: "Specialties", type: "text", placeholder: "e.g. digital marketing, brand strategy" },
    { key: "achievements", label: "Achievements", type: "textarea", placeholder: "Awards, milestones, notable projects...", rows: 3 },
  ],
  generate(values) {
    const name = values.personName || "Professional";
    const role = values.role || "Leader";
    const company = values.companyName || "their company";
    const exp = values.experience ? `${values.experience} years` : "extensive";
    const specialties = values.specialties || "various domains";
    const achievements = values.achievements?.split("\n").filter(Boolean) || [];

    const achieveText = achievements.length > 0
      ? ` Notable achievements include ${achievements.join("; ")}.`
      : "";

    const short = `${name} is the ${role} at ${company} with ${exp} of experience specializing in ${specialties}.${achieveText.length > 100 ? "" : achieveText}`;

    const medium = `${name} serves as ${role} at ${company}, bringing ${exp} of experience in ${specialties}. Known for a strategic, results-driven approach, ${name.split(" ")[0]} has consistently delivered innovative solutions that drive business growth.${achieveText} ${name.split(" ")[0]} is passionate about helping organizations achieve their full potential.`;

    const long = `${name} is the ${role} at ${company}, a position earned through ${exp} of dedicated work in ${specialties}. With a proven track record of success, ${name.split(" ")[0]} has established a reputation as a forward-thinking leader who combines deep expertise with practical execution.\n\nThroughout their career, ${name.split(" ")[0]} has focused on delivering measurable results and building lasting relationships with clients and partners.${achieveText}\n\nBeyond professional accomplishments, ${name.split(" ")[0]} is committed to mentoring the next generation of professionals and contributing to industry advancement. Their approach combines strategic vision with hands-on leadership, ensuring that every initiative produces tangible outcomes.`;

    return `👤 Professional Bio — ${name}\n${"─".repeat(40)}\n\n📌 SHORT (1-2 sentences):\n${short}\n\n📌 MEDIUM (1 paragraph):\n${medium}\n\n📌 LONG (2-3 paragraphs):\n${long}`;
  },
};

// --- Invoice Generator ---

export const invoiceGenerator: ToolImplementation = {
  fields: [
    { key: "companyName", label: "Your Company Name", type: "text", required: true },
    { key: "companyAddress", label: "Company Address", type: "textarea", rows: 2 },
    { key: "companyEmail", label: "Company Email", type: "email" },
    { key: "clientName", label: "Client Name", type: "text", required: true },
    { key: "clientAddress", label: "Client Address", type: "textarea", rows: 2 },
    { key: "invoiceNumber", label: "Invoice Number", type: "text", required: true, placeholder: "INV-001" },
    { key: "invoiceDate", label: "Invoice Date", type: "text", placeholder: "YYYY-MM-DD" },
    { key: "dueDate", label: "Due Date", type: "text", placeholder: "YYYY-MM-DD" },
    { key: "items", label: "Items (description|qty|price per line)", type: "textarea", required: true, rows: 5, placeholder: "Web Design|1|2500\nHosting|12|25" },
    { key: "taxRate", label: "Tax Rate (%)", type: "number", placeholder: "0", defaultValue: "0" },
    { key: "notes", label: "Notes", type: "textarea", rows: 2, placeholder: "Payment terms, bank details, etc." },
  ],
  generate(values) {
    const items = values.items?.split("\n").filter(Boolean).map((line) => {
      const [desc, qty, price] = line.split("|").map((s) => s.trim());
      return { desc: desc || "", qty: parseFloat(qty) || 0, price: parseFloat(price) || 0 };
    }) || [];

    const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const taxRate = parseFloat(values.taxRate) || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    const itemRows = items.map((item) =>
      `<tr><td style="padding:8px;border-bottom:1px solid #eee">${item.desc}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.qty}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${item.price.toFixed(2)}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${(item.qty * item.price).toFixed(2)}</td></tr>`
    ).join("\n");

    return `<!DOCTYPE html>
<html>
<head><title>Invoice ${values.invoiceNumber || ""}</title></head>
<body style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#333">
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px">
<div>
<h1 style="margin:0;color:#2563eb;font-size:28px">INVOICE</h1>
<p style="margin:5px 0;color:#666">#${values.invoiceNumber || "000"}</p>
</div>
<div style="text-align:right">
<strong>${values.companyName || ""}</strong><br>
${(values.companyAddress || "").replace(/\n/g, "<br>")}
${values.companyEmail ? `<br>${values.companyEmail}` : ""}
</div>
</div>

<div style="display:flex;justify-content:space-between;margin-bottom:30px">
<div>
<strong>Bill To:</strong><br>
${values.clientName || ""}<br>
${(values.clientAddress || "").replace(/\n/g, "<br>")}
</div>
<div style="text-align:right">
<strong>Date:</strong> ${values.invoiceDate || new Date().toISOString().slice(0, 10)}<br>
<strong>Due:</strong> ${values.dueDate || "Upon Receipt"}
</div>
</div>

<table style="width:100%;border-collapse:collapse;margin-bottom:20px">
<thead>
<tr style="background:#f8fafc">
<th style="padding:10px 8px;text-align:left;border-bottom:2px solid #e2e8f0">Description</th>
<th style="padding:10px 8px;text-align:center;border-bottom:2px solid #e2e8f0">Qty</th>
<th style="padding:10px 8px;text-align:right;border-bottom:2px solid #e2e8f0">Price</th>
<th style="padding:10px 8px;text-align:right;border-bottom:2px solid #e2e8f0">Amount</th>
</tr>
</thead>
<tbody>
${itemRows}
</tbody>
</table>

<div style="text-align:right;margin-top:20px">
<p style="margin:5px 0"><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
${taxRate > 0 ? `<p style="margin:5px 0"><strong>Tax (${taxRate}%):</strong> $${tax.toFixed(2)}</p>` : ""}
<p style="margin:5px 0;font-size:20px;color:#2563eb"><strong>Total: $${total.toFixed(2)}</strong></p>
</div>

${values.notes ? `<div style="margin-top:30px;padding:15px;background:#f8fafc;border-radius:5px"><strong>Notes:</strong><br>${values.notes.replace(/\n/g, "<br>")}</div>` : ""}

<button onclick="window.print()" style="margin-top:30px;padding:10px 24px;background:#2563eb;color:white;border:none;border-radius:5px;cursor:pointer;font-size:14px">Print Invoice</button>
</body>
</html>`;
  },
};

// --- Quote Generator ---

export const quoteGenerator: ToolImplementation = {
  fields: [
    { key: "companyName", label: "Your Company Name", type: "text", required: true },
    { key: "companyAddress", label: "Company Address", type: "textarea", rows: 2 },
    { key: "companyEmail", label: "Company Email", type: "email" },
    { key: "clientName", label: "Client Name", type: "text", required: true },
    { key: "clientAddress", label: "Client Address", type: "textarea", rows: 2 },
    { key: "quoteNumber", label: "Quote Number", type: "text", required: true, placeholder: "QT-001" },
    { key: "quoteDate", label: "Quote Date", type: "text", placeholder: "YYYY-MM-DD" },
    { key: "validityPeriod", label: "Valid For (days)", type: "number", placeholder: "30", defaultValue: "30" },
    { key: "items", label: "Items (description|qty|price per line)", type: "textarea", required: true, rows: 5, placeholder: "Web Design|1|2500\nSEO Setup|1|800" },
    { key: "taxRate", label: "Tax Rate (%)", type: "number", placeholder: "0", defaultValue: "0" },
    { key: "notes", label: "Notes", type: "textarea", rows: 2 },
  ],
  generate(values) {
    const items = values.items?.split("\n").filter(Boolean).map((line) => {
      const [desc, qty, price] = line.split("|").map((s) => s.trim());
      return { desc: desc || "", qty: parseFloat(qty) || 0, price: parseFloat(price) || 0 };
    }) || [];

    const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const taxRate = parseFloat(values.taxRate) || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    const validity = values.validityPeriod || "30";

    const itemRows = items.map((item) =>
      `<tr><td style="padding:8px;border-bottom:1px solid #eee">${item.desc}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.qty}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${item.price.toFixed(2)}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${(item.qty * item.price).toFixed(2)}</td></tr>`
    ).join("\n");

    return `<!DOCTYPE html>
<html>
<head><title>Quote ${values.quoteNumber || ""}</title></head>
<body style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#333">
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px">
<div>
<h1 style="margin:0;color:#059669;font-size:28px">QUOTE</h1>
<p style="margin:5px 0;color:#666">#${values.quoteNumber || "000"}</p>
<p style="margin:5px 0;color:#059669;font-size:12px">Valid for ${validity} days</p>
</div>
<div style="text-align:right">
<strong>${values.companyName || ""}</strong><br>
${(values.companyAddress || "").replace(/\n/g, "<br>")}
${values.companyEmail ? `<br>${values.companyEmail}` : ""}
</div>
</div>

<div style="display:flex;justify-content:space-between;margin-bottom:30px">
<div>
<strong>Prepared For:</strong><br>
${values.clientName || ""}<br>
${(values.clientAddress || "").replace(/\n/g, "<br>")}
</div>
<div style="text-align:right">
<strong>Date:</strong> ${values.quoteDate || new Date().toISOString().slice(0, 10)}<br>
<strong>Expires:</strong> ${values.validityPeriod ? `${validity} days from issue` : "30 days from issue"}
</div>
</div>

<table style="width:100%;border-collapse:collapse;margin-bottom:20px">
<thead>
<tr style="background:#f0fdf4">
<th style="padding:10px 8px;text-align:left;border-bottom:2px solid #d1fae5">Description</th>
<th style="padding:10px 8px;text-align:center;border-bottom:2px solid #d1fae5">Qty</th>
<th style="padding:10px 8px;text-align:right;border-bottom:2px solid #d1fae5">Price</th>
<th style="padding:10px 8px;text-align:right;border-bottom:2px solid #d1fae5">Amount</th>
</tr>
</thead>
<tbody>
${itemRows}
</tbody>
</table>

<div style="text-align:right;margin-top:20px">
<p style="margin:5px 0"><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
${taxRate > 0 ? `<p style="margin:5px 0"><strong>Tax (${taxRate}%):</strong> $${tax.toFixed(2)}</p>` : ""}
<p style="margin:5px 0;font-size:20px;color:#059669"><strong>Total: $${total.toFixed(2)}</strong></p>
</div>

${values.notes ? `<div style="margin-top:30px;padding:15px;background:#f0fdf4;border-radius:5px"><strong>Notes:</strong><br>${values.notes.replace(/\n/g, "<br>")}</div>` : ""}

<button onclick="window.print()" style="margin-top:30px;padding:10px 24px;background:#059669;color:white;border:none;border-radius:5px;cursor:pointer;font-size:14px">Print Quote</button>
</body>
</html>`;
  },
};

// --- Receipt Generator ---

export const receiptGenerator: ToolImplementation = {
  fields: [
    { key: "businessName", label: "Business Name", type: "text", required: true },
    { key: "receiptNumber", label: "Receipt Number", type: "text", required: true, placeholder: "REC-001" },
    { key: "date", label: "Date", type: "text", placeholder: "YYYY-MM-DD" },
    { key: "items", label: "Items (description|qty|price per line)", type: "textarea", required: true, rows: 4, placeholder: "Coffee|2|4.50\nSandwich|1|8.99" },
    { key: "paymentMethod", label: "Payment Method", type: "select", options: [
      { value: "Cash", label: "Cash" },
      { value: "Credit Card", label: "Credit Card" },
      { value: "Debit Card", label: "Debit Card" },
      { value: "Bank Transfer", label: "Bank Transfer" },
      { value: "PayPal", label: "PayPal" },
      { value: "Other", label: "Other" },
    ]},
    { key: "total", label: "Total (leave blank to auto-calculate)", type: "number", placeholder: "Auto-calculated" },
  ],
  generate(values) {
    const items = values.items?.split("\n").filter(Boolean).map((line) => {
      const [desc, qty, price] = line.split("|").map((s) => s.trim());
      return { desc: desc || "", qty: parseFloat(qty) || 1, price: parseFloat(price) || 0 };
    }) || [];

    const calcTotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const total = values.total ? parseFloat(values.total) : calcTotal;

    const itemRows = items.map((item) =>
      `<tr><td style="padding:4px 8px">${item.desc}</td><td style="padding:4px 8px;text-align:center">${item.qty}</td><td style="padding:4px 8px;text-align:right">$${(item.qty * item.price).toFixed(2)}</td></tr>`
    ).join("\n");

    return `<!DOCTYPE html>
<html>
<head><title>Receipt ${values.receiptNumber || ""}</title></head>
<body style="font-family:'Courier New',monospace;max-width:350px;margin:0 auto;padding:20px;color:#333">
<div style="text-align:center;border-bottom:2px dashed #333;padding-bottom:10px;margin-bottom:10px">
<h2 style="margin:0">${values.businessName || "Business"}</h2>
<p style="margin:5px 0;font-size:12px">Receipt #${values.receiptNumber || "000"}</p>
<p style="margin:5px 0;font-size:12px">${values.date || new Date().toISOString().slice(0, 10)}</p>
</div>

<table style="width:100%;border-collapse:collapse;margin-bottom:10px;font-size:13px">
<thead>
<tr><th style="text-align:left;padding:4px 8px;border-bottom:1px dashed #999">Item</th><th style="text-align:center;padding:4px 8px;border-bottom:1px dashed #999">Qty</th><th style="text-align:right;padding:4px 8px;border-bottom:1px dashed #999">Amt</th></tr>
</thead>
<tbody>
${itemRows}
</tbody>
</table>

<div style="border-top:2px dashed #333;padding-top:10px;text-align:right">
<p style="margin:3px 0;font-size:18px"><strong>TOTAL: $${total.toFixed(2)}</strong></p>
<p style="margin:3px 0;font-size:12px">Paid by: ${values.paymentMethod || "Cash"}</p>
</div>

<div style="text-align:center;margin-top:15px;font-size:11px;color:#666;border-top:1px dashed #999;padding-top:10px">
<p>Thank you for your purchase!</p>
</div>

<button onclick="window.print()" style="margin-top:15px;width:100%;padding:8px;background:#333;color:white;border:none;border-radius:3px;cursor:pointer;font-size:12px">Print Receipt</button>
</body>
</html>`;
  },
};

// --- Privacy Policy Generator ---

export const privacyPolicyGenerator: ToolImplementation = {
  fields: [
    { key: "companyName", label: "Company Name", type: "text", required: true },
    { key: "websiteUrl", label: "Website URL", type: "url", required: true },
    { key: "email", label: "Contact Email", type: "email", required: true },
    { key: "effectiveDate", label: "Effective Date", type: "text", placeholder: "YYYY-MM-DD" },
    { key: "collectsCookies", label: "Collects Cookies", type: "checkbox", defaultValue: "true" },
    { key: "collectsPersonalInfo", label: "Collects Personal Information", type: "checkbox", defaultValue: "true" },
    { key: "usesAnalytics", label: "Uses Analytics", type: "checkbox", defaultValue: "true" },
    { key: "sharesData", label: "Shares Data with Third Parties", type: "checkbox" },
    {
      key: "region",
      label: "Country / Region",
      type: "select",
      required: true,
      options: [
        { value: "US", label: "United States" },
        { value: "EU", label: "EU/UK (GDPR)" },
        { value: "India", label: "India" },
        { value: "Australia", label: "Australia" },
      ],
    },
  ],
  generate(values) {
    const company = values.companyName || "Company";
    const url = values.websiteUrl || "https://example.com";
    const email = values.email || "privacy@example.com";
    const date = values.effectiveDate || new Date().toISOString().slice(0, 10);
    const cookies = values.collectsCookies === "true";
    const personalInfo = values.collectsPersonalInfo === "true";
    const analytics = values.usesAnalytics === "true";
    const sharesData = values.sharesData === "true";
    const region = values.region || "US";

    let regionClause = "";
    if (region === "EU") {
      regionClause = `\n\n## GDPR Rights (EU/UK Users)\n\nUnder the General Data Protection Regulation (GDPR), you have the following rights:\n\n- **Right of Access** — You can request copies of your personal data.\n- **Right to Rectification** — You can request correction of inaccurate data.\n- **Right to Erasure** — You can request deletion of your personal data.\n- **Right to Restrict Processing** — You can request limitation of processing.\n- **Right to Data Portability** — You can request transfer of your data.\n- **Right to Object** — You can object to processing of your data.\n\nTo exercise these rights, contact us at ${email}. We will respond within 30 days.`;
    } else if (region === "India") {
      regionClause = `\n\n## Indian Users\n\nThis policy complies with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023. You have the right to access, correct, and delete your personal data. Contact our Grievance Officer at ${email} for any concerns.`;
    } else if (region === "Australia") {
      regionClause = `\n\n## Australian Users\n\nThis policy complies with the Australian Privacy Principles (APPs) under the Privacy Act 1988. You may request access to, correction of, or deletion of your personal information by contacting us at ${email}.`;
    }

    let policy = `# Privacy Policy\n\n**${company}**\n**Effective Date:** ${date}\n**Website:** ${url}\n\n---\n\n## Introduction\n\nAt ${company}, we respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit ${url}.\n\n## Information We Collect\n\n`;

    if (personalInfo) {
      policy += `### Personal Information\n\nWe may collect the following personal information:\n\n- Name and contact details (email address, phone number)\n- Billing and shipping address\n- Account credentials\n- Communication preferences\n- Any information you voluntarily provide through forms or correspondence\n\n`;
    }

    if (analytics) {
      policy += `### Usage Data\n\nWe automatically collect certain information when you visit our website, including:\n\n- IP address and browser type\n- Pages visited and time spent\n- Referring website\n- Device and operating system information\n- Click patterns and navigation paths\n\n`;
    }

    if (cookies) {
      policy += `### Cookies\n\nWe use cookies and similar tracking technologies to enhance your experience. Cookies are small data files stored on your device. We use:\n\n- **Essential cookies** — Required for website functionality\n- **Analytics cookies** — Help us understand how visitors use our site\n- **Preference cookies** — Remember your settings and preferences\n\nYou can control cookies through your browser settings.\n\n`;
    }

    policy += `## How We Use Your Information\n\nWe use collected information to:\n\n- Provide and maintain our services\n- Improve and personalize your experience\n- Communicate with you about updates and offers\n- Process transactions and send related information\n- Comply with legal obligations\n- Detect and prevent fraud or abuse\n\n`;

    if (sharesData) {
      policy += `## Third-Party Sharing\n\nWe may share your information with:\n\n- **Service providers** who assist in operating our website and services\n- **Analytics partners** who help us understand usage patterns\n- **Legal authorities** when required by law\n- **Business partners** for joint marketing efforts (with your consent)\n\nWe do not sell your personal data to third parties.\n\n`;
    } else {
      policy += `## Third-Party Sharing\n\nWe do not sell, trade, or share your personal information with third parties except as necessary to provide our services or as required by law.\n\n`;
    }

    policy += `## Data Security\n\nWe implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.\n\n## Data Retention\n\nWe retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.\n\n## Your Rights\n\nYou have the right to:\n\n- Access your personal data\n- Request correction of inaccurate data\n- Request deletion of your data\n- Opt out of marketing communications\n- Withdraw consent at any time\n\n${regionClause}\n\n## Changes to This Policy\n\nWe may update this privacy policy from time to time. Changes will be posted on this page with a revised effective date.\n\n## Contact Us\n\nIf you have questions about this privacy policy, please contact us:\n\n- **Email:** ${email}\n- **Website:** ${url}\n`;

    return policy;
  },
};

// --- Terms & Conditions Generator ---

export const termsConditionsGenerator: ToolImplementation = {
  fields: [
    { key: "companyName", label: "Company Name", type: "text", required: true },
    { key: "websiteUrl", label: "Website URL", type: "url", required: true },
    { key: "email", label: "Contact Email", type: "email", required: true },
    { key: "governingLaw", label: "Governing Law (State/Country)", type: "text", required: true, placeholder: "e.g. State of California, USA" },
    { key: "effectiveDate", label: "Effective Date", type: "text", placeholder: "YYYY-MM-DD" },
  ],
  generate(values) {
    const company = values.companyName || "Company";
    const url = values.websiteUrl || "https://example.com";
    const email = values.email || "legal@example.com";
    const law = values.governingLaw || "applicable jurisdiction";
    const date = values.effectiveDate || new Date().toISOString().slice(0, 10);

    return `# Terms and Conditions

**${company}**
**Effective Date:** ${date}
**Website:** ${url}

---

## 1. Acceptance of Terms

By accessing and using ${url} ("the Website"), you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our Website.

## 2. Use of the Website

You agree to use the Website only for lawful purposes and in a manner that does not infringe upon the rights of others. You must not:

- Use the Website in any way that violates applicable laws or regulations
- Attempt to gain unauthorized access to any part of the Website
- Use the Website to transmit harmful, offensive, or illegal content
- Interfere with or disrupt the Website's functionality
- Use automated systems to scrape or extract data without permission

## 3. Intellectual Property

All content on this Website, including text, graphics, logos, images, and software, is the property of ${company} or its licensors and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.

## 4. User Accounts

If you create an account on our Website, you are responsible for:

- Maintaining the confidentiality of your account credentials
- All activities that occur under your account
- Notifying us immediately of any unauthorized use

We reserve the right to suspend or terminate accounts that violate these terms.

## 5. Limitation of Liability

To the maximum extent permitted by law, ${company} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Website. Our total liability shall not exceed the amount paid by you, if any, for accessing the Website in the past 12 months.

## 6. Disclaimer of Warranties

The Website is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Website will be uninterrupted, error-free, or free of viruses or other harmful components.

## 7. Third-Party Links

The Website may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of third-party sites.

## 8. Termination

We reserve the right to terminate or suspend your access to the Website at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.

## 9. Indemnification

You agree to indemnify and hold harmless ${company}, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Website or violation of these Terms.

## 10. Governing Law

These Terms shall be governed by and construed in accordance with the laws of ${law}, without regard to its conflict of law provisions.

## 11. Changes to Terms

We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Website constitutes acceptance of the modified Terms.

## 12. Contact Us

For questions about these Terms, contact us at:

- **Email:** ${email}
- **Website:** ${url}
`;
  },
};

// --- Disclaimer Generator ---

export const disclaimerGenerator: ToolImplementation = {
  fields: [
    { key: "websiteName", label: "Website Name", type: "text", required: true },
    { key: "websiteUrl", label: "Website URL", type: "url", required: true },
    {
      key: "type",
      label: "Disclaimer Type",
      type: "select",
      required: true,
      options: [
        { value: "General", label: "General" },
        { value: "Medical", label: "Medical" },
        { value: "Legal", label: "Legal" },
        { value: "Financial", label: "Financial" },
        { value: "Affiliate", label: "Affiliate" },
      ],
    },
  ],
  generate(values) {
    const name = values.websiteName || "This Website";
    const url = values.websiteUrl || "https://example.com";
    const type = values.type || "General";

    const disclaimers: Record<string, string> = {
      General: `# General Disclaimer

**${name}** (${url})

---

The information provided on ${name} is for general informational purposes only. All information on the site is provided in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.

Under no circumstances shall ${name} have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site. Your use of the site and your reliance on any information on the site is solely at your own risk.

The site may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.

We reserve the right to make additions, deletions, or modifications to the contents on the site at any time without prior notice.`,

      Medical: `# Medical Disclaimer

**${name}** (${url})

---

The information provided on ${name} is for general informational and educational purposes only and is not intended as, nor should it be considered a substitute for, professional medical advice, diagnosis, or treatment.

**IMPORTANT:**
- Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
- Never disregard professional medical advice or delay in seeking it because of something you have read on this website.
- If you think you may have a medical emergency, call your doctor, go to the emergency department, or call emergency services immediately.

${name} does not recommend or endorse any specific tests, physicians, products, procedures, opinions, or other information that may be mentioned on the site. Reliance on any information provided by ${name} is solely at your own risk.

The site and its content are provided on an "as is" basis without any warranties of any kind.`,

      Legal: `# Legal Disclaimer

**${name}** (${url})

---

The information provided on ${name} is for general informational purposes only and does not constitute legal advice. No attorney-client relationship is formed by your use of this site or communication with us through this site.

**IMPORTANT:**
- The information on this site is not a substitute for professional legal advice.
- Laws and regulations vary by jurisdiction and change frequently.
- You should consult with a qualified attorney for advice regarding your specific legal situation.

${name} makes no representations or warranties about the accuracy or completeness of the legal information provided. We are not liable for any actions taken based on the information on this site.

Every legal situation is different. The outcome of any legal matter depends on the specific facts and circumstances of each case.`,

      Financial: `# Financial Disclaimer

**${name}** (${url})

---

The information provided on ${name} is for general informational and educational purposes only and does not constitute financial advice, investment advice, trading advice, or any other form of professional advice.

**IMPORTANT:**
- The content on this site should not be construed as a recommendation to buy, sell, or hold any investment or security.
- Past performance is not indicative of future results.
- All investments involve risk, including the possible loss of principal.
- You should consult with a qualified financial advisor before making any investment decisions.

${name} is not a registered investment advisor, broker-dealer, or financial planner. We do not guarantee the accuracy, completeness, or timeliness of the financial information provided.

Any financial decisions you make are your sole responsibility. We are not liable for any losses or damages arising from your reliance on information found on this site.`,

      Affiliate: `# Affiliate Disclosure & Disclaimer

**${name}** (${url})

---

## Affiliate Disclosure

${name} participates in various affiliate marketing programs, which means we may get paid commissions on purchases made through our links to retailer sites.

**What this means for you:**
- Some links on this site are affiliate links, meaning we earn a commission if you click through and make a purchase.
- This comes at no additional cost to you.
- Our editorial content is not influenced by affiliate partnerships.
- We only recommend products and services we genuinely believe will be valuable to our readers.

## FTC Compliance

In accordance with the Federal Trade Commission (FTC) guidelines, please assume that any link on this site could be an affiliate link. We are committed to transparency and disclosure regarding our affiliate relationships.

## Disclaimer

While we strive to provide accurate and up-to-date information about the products and services we review, we make no guarantees regarding:

- Product availability or pricing
- Accuracy of product descriptions or specifications
- The performance or suitability of any product for your specific needs

Always verify information directly with the retailer or manufacturer before making a purchase decision.`,
    };

    return disclaimers[type] || disclaimers.General;
  },
};

// --- Refund Policy Generator ---

export const refundPolicyGenerator: ToolImplementation = {
  fields: [
    { key: "companyName", label: "Company Name", type: "text", required: true },
    { key: "refundWindow", label: "Refund Window (days)", type: "number", required: true, placeholder: "30" },
    { key: "conditions", label: "Conditions / Requirements", type: "textarea", rows: 3, placeholder: "Item must be unused and in original packaging\nReceipt required" },
    { key: "email", label: "Contact Email", type: "email", required: true },
  ],
  generate(values) {
    const company = values.companyName || "Company";
    const window_ = values.refundWindow || "30";
    const conditions = values.conditions?.split("\n").filter(Boolean) || ["Item must be in original condition"];
    const email = values.email || "support@example.com";

    return `# Refund Policy

**${company}**

---

## Overview

At ${company}, we want you to be completely satisfied with your purchase. If you are not satisfied, we offer a refund within **${window_} days** of the original purchase date.

## Eligibility

To be eligible for a refund, the following conditions must be met:

${conditions.map((c) => `- ${c}`).join("\n")}
- The refund request must be submitted within ${window_} days of purchase
- Proof of purchase (order confirmation or receipt) is required

## How to Request a Refund

1. Contact us at **${email}** with your order details
2. Include your order number, date of purchase, and reason for the refund
3. We will review your request and respond within 3-5 business days
4. If approved, you will receive instructions for returning the item (if applicable)

## Processing

- Approved refunds will be processed within 5-10 business days
- Refunds will be issued to the original payment method
- Shipping costs are non-refundable unless the return is due to our error
- You may receive a partial refund for items that show signs of use or damage

## Non-Refundable Items

The following are not eligible for refunds:

- Gift cards
- Downloadable software or digital products (once accessed)
- Items marked as final sale
- Services already rendered

## Late or Missing Refunds

If you haven't received a refund within the expected timeframe:

1. Check your bank account or credit card statement
2. Contact your bank or credit card company (processing times vary)
3. If you've done both and still haven't received your refund, contact us at ${email}

## Contact Us

For refund-related questions, please reach out to us at **${email}**.
`;
  },
};

// --- Shipping Policy Generator ---

export const shippingPolicyGenerator: ToolImplementation = {
  fields: [
    { key: "companyName", label: "Company Name", type: "text", required: true },
    { key: "shippingMethods", label: "Shipping Methods", type: "textarea", rows: 3, placeholder: "Standard Shipping (5-7 days)\nExpress Shipping (2-3 days)\nOvernight (1 day)" },
    { key: "processingTime", label: "Processing Time", type: "text", placeholder: "1-2 business days" },
    { key: "domesticTime", label: "Domestic Shipping Time", type: "text", placeholder: "5-7 business days" },
    { key: "international", label: "Offers International Shipping", type: "checkbox" },
    { key: "freeThreshold", label: "Free Shipping Threshold ($)", type: "number", placeholder: "e.g. 50" },
  ],
  generate(values) {
    const company = values.companyName || "Company";
    const methods = values.shippingMethods?.split("\n").filter(Boolean) || ["Standard Shipping (5-7 business days)"];
    const processing = values.processingTime || "1-2 business days";
    const domestic = values.domesticTime || "5-7 business days";
    const international = values.international === "true";
    const freeThreshold = values.freeThreshold;

    let policy = `# Shipping Policy

**${company}**

---

## Processing Time

All orders are processed within **${processing}**. Orders placed on weekends or holidays will be processed the next business day. You will receive a confirmation email with tracking information once your order has shipped.

## Shipping Methods & Delivery Times

### Domestic Shipping

Estimated delivery time: **${domestic}** (after processing)

Available shipping options:

${methods.map((m) => `- ${m}`).join("\n")}

`;

    if (freeThreshold) {
      policy += `### Free Shipping

We offer **free standard shipping** on all orders over **$${freeThreshold}**. This applies to domestic orders only.\n\n`;
    }

    if (international) {
      policy += `### International Shipping

We ship internationally to most countries. Please note:

- International delivery times vary by destination (typically 10-21 business days)
- Customs duties, taxes, and fees are the responsibility of the buyer
- International orders may experience delays due to customs processing
- Some items may not be eligible for international shipping due to size or regulations

`;
    }

    policy += `## Tracking Your Order

Once your order has shipped, you will receive an email notification with a tracking number. You can track your package using the carrier's website or the tracking link in your confirmation email.

## Shipping Costs

Shipping costs are calculated at checkout based on your location and selected shipping method.${freeThreshold ? ` Orders over $${freeThreshold} qualify for free standard shipping.` : ""}

## Delivery Issues

If you experience any issues with delivery:

- **Package not received** — Please allow additional time beyond the estimated delivery date. If your package has not arrived within 5 business days after the estimated delivery date, contact us.
- **Damaged package** — If your order arrives damaged, please take photos and contact us within 48 hours.
- **Wrong item received** — Contact us and we will arrange for the correct item to be sent at no additional cost.

## Contact Us

For shipping-related questions, please contact our customer service team.
`;

    return policy;
  },
};

// --- Return Policy Generator ---

export const returnPolicyGenerator: ToolImplementation = {
  fields: [
    { key: "companyName", label: "Company Name", type: "text", required: true },
    { key: "returnWindow", label: "Return Window (days)", type: "number", required: true, placeholder: "30" },
    { key: "conditionRequirements", label: "Condition Requirements", type: "text", placeholder: "Unused, with original tags" },
    { key: "email", label: "Contact Email", type: "email", required: true },
    { key: "restockingFee", label: "Restocking Fee (%)", type: "number", placeholder: "0", defaultValue: "0" },
  ],
  generate(values) {
    const company = values.companyName || "Company";
    const window_ = values.returnWindow || "30";
    const condition = values.conditionRequirements || "unused and in original packaging";
    const email = values.email || "returns@example.com";
    const fee = parseFloat(values.restockingFee) || 0;

    return `# Return Policy

**${company}**

---

## Return Window

You have **${window_} days** from the date of delivery to initiate a return.

## Conditions for Returns

To be eligible for a return, items must be:

- ${condition}
- Accompanied by the original receipt or proof of purchase
- In the same condition you received them

## How to Initiate a Return

1. Email us at **${email}** with your order number and reason for return
2. Wait for our team to confirm eligibility and provide a Return Authorization (RA) number
3. Pack the item securely in its original packaging (if possible)
4. Ship the item to the address provided in your RA confirmation
5. Include the RA number on the outside of the package

${fee > 0 ? `## Restocking Fee\n\nA **${fee}% restocking fee** will be deducted from your refund to cover inspection and repackaging costs.\n\n` : ""}## Refund Processing

- Once we receive and inspect your return, we will notify you of the approval or rejection
- Approved returns will be refunded to the original payment method within 5-10 business days
- Original shipping costs are non-refundable${fee > 0 ? `\n- The ${fee}% restocking fee will be deducted from your refund amount` : ""}

## Exchanges

If you would like to exchange an item for a different size, color, or product, please initiate a return and place a new order. This ensures the fastest processing time.

## Non-Returnable Items

The following items cannot be returned:

- Gift cards
- Perishable goods
- Personal care items (opened)
- Items marked as "Final Sale"
- Custom or personalized items

## Damaged or Defective Items

If you received a damaged or defective item, please contact us within 48 hours of delivery at **${email}** with photos of the damage. We will arrange a replacement or full refund at no additional cost.

## Contact Us

For return-related questions, email us at **${email}**.
`;
  },
};

// --- Cookie Policy Generator ---

export const cookiePolicyGenerator: ToolImplementation = {
  fields: [
    { key: "websiteName", label: "Website Name", type: "text", required: true },
    { key: "websiteUrl", label: "Website URL", type: "url", required: true },
    { key: "essentialCookies", label: "Uses Essential Cookies", type: "checkbox", defaultValue: "true" },
    { key: "analyticsCookies", label: "Uses Analytics Cookies", type: "checkbox", defaultValue: "true" },
    { key: "marketingCookies", label: "Uses Marketing Cookies", type: "checkbox" },
    { key: "thirdPartyCookies", label: "Third-Party Cookies (one per line)", type: "textarea", rows: 3, placeholder: "Google Analytics\nFacebook Pixel\nHotjar" },
  ],
  generate(values) {
    const name = values.websiteName || "Our Website";
    const url = values.websiteUrl || "https://example.com";
    const essential = values.essentialCookies !== "false";
    const analytics = values.analyticsCookies === "true";
    const marketing = values.marketingCookies === "true";
    const thirdParty = values.thirdPartyCookies?.split("\n").filter(Boolean) || [];

    let policy = `# Cookie Policy

**${name}** (${url})

---

## What Are Cookies?

Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.

## How We Use Cookies

${name} uses cookies to enhance your browsing experience, analyze site traffic, and personalize content.

## Types of Cookies We Use

`;

    if (essential) {
      policy += `### Essential Cookies

These cookies are necessary for the website to function properly. They enable basic features like page navigation, secure areas access, and session management. The website cannot function properly without these cookies.

| Cookie | Purpose | Duration |
|--------|---------|----------|
| session_id | Maintains your session | Session |
| csrf_token | Security protection | Session |
| cookie_consent | Stores your cookie preferences | 1 year |

`;
    }

    if (analytics) {
      policy += `### Analytics Cookies

These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website.

| Cookie | Purpose | Duration |
|--------|---------|----------|
| _ga | Google Analytics - distinguishes users | 2 years |
| _gid | Google Analytics - distinguishes users | 24 hours |
| _gat | Google Analytics - throttles requests | 1 minute |

`;
    }

    if (marketing) {
      policy += `### Marketing Cookies

These cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user.

| Cookie | Purpose | Duration |
|--------|---------|----------|
| _fbp | Facebook advertising | 3 months |
| _gcl_au | Google Ads conversion | 3 months |

`;
    }

    if (thirdParty.length > 0) {
      policy += `### Third-Party Cookies

We use the following third-party services that may set cookies:

${thirdParty.map((tp) => `- **${tp}**`).join("\n")}

Each third-party service has its own privacy policy governing the use of cookies.

`;
    }

    policy += `## Managing Cookies

You can control and manage cookies in several ways:

### Browser Settings

Most browsers allow you to:
- View what cookies are stored and delete them individually
- Block third-party cookies
- Block all cookies
- Delete all cookies when you close the browser

### Opting Out

- **Google Analytics:** Install the [Google Analytics Opt-out Browser Add-on](https://tools.google.com/dlpage/gaoptout)
- **Advertising cookies:** Visit [Your Online Choices](https://www.youronlinechoices.com/) or [Network Advertising Initiative](https://optout.networkadvertising.org/)

## Impact of Disabling Cookies

Please note that disabling cookies may affect the functionality of ${name}. Some features may not work properly if cookies are disabled.

## Changes to This Policy

We may update this Cookie Policy from time to time. Any changes will be posted on this page.

## Contact Us

If you have questions about our use of cookies, please contact us through ${url}.
`;

    return policy;
  },
};

// --- Business Hours Generator ---

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const businessHoursGenerator: ToolImplementation = {
  fields: [
    ...DAYS.flatMap((day) => [
      { key: `${day.toLowerCase()}Open`, label: `${day} — Open`, type: "text" as const, placeholder: "09:00" },
      { key: `${day.toLowerCase()}Close`, label: `${day} — Close`, type: "text" as const, placeholder: "17:00" },
      { key: `${day.toLowerCase()}Closed`, label: `${day} — Closed`, type: "checkbox" as const },
    ]),
  ],
  generate(values) {
    const hours = DAYS.map((day) => {
      const key = day.toLowerCase();
      const closed = values[`${key}Closed`] === "true";
      const open = values[`${key}Open`] || "09:00";
      const close = values[`${key}Close`] || "17:00";
      return { day, open, close, closed };
    });

    const plainText = hours
      .map((h) => `${h.day.padEnd(12)} ${h.closed ? "Closed" : `${h.open} – ${h.close}`}`)
      .join("\n");

    const htmlTable = `<table style="border-collapse:collapse;font-family:Arial,sans-serif">
<thead><tr><th style="padding:8px 16px;border-bottom:2px solid #ddd;text-align:left">Day</th><th style="padding:8px 16px;border-bottom:2px solid #ddd;text-align:left">Hours</th></tr></thead>
<tbody>
${hours.map((h) => `<tr><td style="padding:6px 16px;border-bottom:1px solid #eee"><strong>${h.day}</strong></td><td style="padding:6px 16px;border-bottom:1px solid #eee">${h.closed ? "Closed" : `${h.open} – ${h.close}`}</td></tr>`).join("\n")}
</tbody>
</table>`;

    const schemaOrg = JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        openingHoursSpecification: hours
          .filter((h) => !h.closed)
          .map((h) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: `https://schema.org/${h.day}`,
            opens: h.open,
            closes: h.close,
          })),
      },
      null,
      2
    );

    return `🕐 Business Hours\n${"─".repeat(40)}\n\n## Plain Text\n\n${plainText}\n\n## HTML Table\n\n${htmlTable}\n\n## Schema.org JSON-LD\n\n\`\`\`json\n${schemaOrg}\n\`\`\``;
  },
};

// --- Email Signature Generator ---

export const emailSignatureGenerator: ToolImplementation = {
  fields: [
    { key: "fullName", label: "Full Name", type: "text", required: true },
    { key: "title", label: "Job Title", type: "text", required: true },
    { key: "company", label: "Company", type: "text", required: true },
    { key: "phone", label: "Phone", type: "text", placeholder: "+1 (555) 123-4567" },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "website", label: "Website", type: "url" },
    { key: "linkedin", label: "LinkedIn URL", type: "url" },
    { key: "logoUrl", label: "Logo URL", type: "url" },
    {
      key: "colorScheme",
      label: "Color Scheme",
      type: "select",
      options: [
        { value: "blue", label: "Professional Blue" },
        { value: "green", label: "Modern Green" },
        { value: "red", label: "Bold Red" },
        { value: "purple", label: "Creative Purple" },
        { value: "dark", label: "Dark / Elegant" },
      ],
    },
  ],
  generate(values) {
    const name = values.fullName || "Your Name";
    const title = values.title || "Title";
    const company = values.company || "Company";
    const phone = values.phone;
    const email = values.email || "email@example.com";
    const website = values.website;
    const linkedin = values.linkedin;
    const logoUrl = values.logoUrl;
    const scheme = values.colorScheme || "blue";

    const colors: Record<string, { primary: string; secondary: string }> = {
      blue: { primary: "#2563eb", secondary: "#1e40af" },
      green: { primary: "#059669", secondary: "#047857" },
      red: { primary: "#dc2626", secondary: "#b91c1c" },
      purple: { primary: "#7c3aed", secondary: "#6d28d9" },
      dark: { primary: "#1f2937", secondary: "#111827" },
    };

    const { primary, secondary } = colors[scheme] || colors.blue;

    const contactLinks: string[] = [];
    if (phone) contactLinks.push(`<a href="tel:${phone.replace(/[^\d+]/g, "")}" style="color:${primary};text-decoration:none">${phone}</a>`);
    if (email) contactLinks.push(`<a href="mailto:${email}" style="color:${primary};text-decoration:none">${email}</a>`);
    if (website) contactLinks.push(`<a href="${website}" style="color:${primary};text-decoration:none">${website.replace(/^https?:\/\//, "")}</a>`);
    if (linkedin) contactLinks.push(`<a href="${linkedin}" style="color:${primary};text-decoration:none">LinkedIn</a>`);

    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:14px;color:#333;max-width:500px">
<tr>
<td style="padding-right:15px;vertical-align:top;border-right:3px solid ${primary}">
${logoUrl ? `<img src="${logoUrl}" alt="${company}" style="width:80px;height:auto;border-radius:4px" />` : ""}
</td>
<td style="padding-left:15px;vertical-align:top">
<p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;color:${secondary}">${name}</p>
<p style="margin:0 0 8px 0;font-size:13px;color:#666">${title} | ${company}</p>
<p style="margin:0;font-size:12px;line-height:1.8">${contactLinks.join(" &nbsp;|&nbsp; ")}</p>
</td>
</tr>
</table>`;
  },
};
