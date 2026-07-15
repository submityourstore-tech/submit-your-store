/**
 * Import listings from a CSV file directly into Supabase.
 * Usage: node scripts/import-csv-listings.mjs <path-to-csv>
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal, requireEnv } from "./lib/load-env.mjs";

loadEnvLocal();

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const sb = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function parseCsvText(text) {
  const rawLines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const segments = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < rawLines.length; i++) {
    const ch = rawLines[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === "\n" && !inQuotes) {
      segments.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) segments.push(current);

  if (segments.length < 2) return [];
  const headers = parseCsvLine(segments[0]).map((h) =>
    h.trim().toLowerCase().replace(/\s+/g, "_")
  );

  const rows = [];
  for (let i = 1; i < segments.length; i++) {
    const fields = parseCsvLine(segments[i]);
    if (fields.length < 2) continue;
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (fields[idx] || "").trim();
    });
    if (row.business_name) rows.push(row);
  }
  return rows;
}

function slugify(text) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[-\s]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueId(name, usedIds, city, state) {
  const base = slugify(name) || "business";
  if (!usedIds.has(base)) { usedIds.add(base); return base; }
  if (city) {
    const withCity = `${base}-${slugify(city)}`;
    if (!usedIds.has(withCity)) { usedIds.add(withCity); return withCity; }
    if (state) {
      const withCityState = `${base}-${slugify(city)}-${slugify(state)}`;
      if (!usedIds.has(withCityState)) { usedIds.add(withCityState); return withCityState; }
    }
  }
  let n = 2;
  while (usedIds.has(`${base}-${n}`)) n++;
  const id = `${base}-${n}`;
  usedIds.add(id);
  return id;
}

function parseCityState(address) {
  if (!address) return { city: "Dallas", state: "TX" };
  const match = address.match(/,\s*([A-Za-z\s]+),\s*([A-Z]{2})\s/);
  if (match) return { city: match[1].trim(), state: match[2].trim() };
  const parts = address.split(",").map((s) => s.trim());
  if (parts.length >= 3) {
    const stateZip = parts[parts.length - 1];
    const stateMatch = stateZip.match(/^([A-Z]{2})\s/);
    return { city: parts[parts.length - 2], state: stateMatch?.[1] || "TX" };
  }
  return { city: "Dallas", state: "TX" };
}

function parseWeeklyHours(raw) {
  if (!raw) return [];
  const days = raw.split(/,\s*(?=(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday):)/i);
  return days.map((d) => {
    const m = d.match(/^(\w+):\s*(.+)$/);
    if (!m) return null;
    return { day: m[1], hours: m[2].trim() };
  }).filter(Boolean);
}

function parseReviews(row) {
  return ["top_review_1", "top_review_2", "top_review_3"]
    .map((k) => row[k])
    .filter((r) => r && r.length > 5 && !/not found/i.test(r));
}

function parseSocial(row) {
  const s = {};
  if (row.facebook && row.facebook.startsWith("http")) s.facebook = row.facebook;
  if (row.instagram && row.instagram.startsWith("http")) s.instagram = row.instagram;
  if (row.linkedin && row.linkedin.startsWith("http")) s.linkedin = row.linkedin;
  if (row.twitter && row.twitter.startsWith("http")) s.twitter = row.twitter;
  if (row.tiktok && row.tiktok.startsWith("http")) s.tiktok = row.tiktok;
  return Object.keys(s).length ? s : {};
}

function resolveCategory(cat) {
  const lower = (cat || "").toLowerCase();
  if (lower.includes("roof")) return { vertical: "home-services", category: "Roofing Contractor", categorySlug: "roofing-contractor" };
  if (lower.includes("hvac") || lower.includes("air") || lower.includes("heating")) return { vertical: "home-services", category: "HVAC", categorySlug: "hvac" };
  if (lower.includes("plumb")) return { vertical: "home-services", category: "Plumbing", categorySlug: "plumbing" };
  if (lower.includes("electric")) return { vertical: "home-services", category: "Electrician", categorySlug: "electrician" };
  return { vertical: "home-services", category: cat || "General Contractor", categorySlug: slugify(cat || "general-contractor") };
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: node scripts/import-csv-listings.mjs <path-to-csv>");
    process.exit(1);
  }

  const csvText = readFileSync(path.resolve(csvPath), "utf8");
  const rows = parseCsvText(csvText);
  console.log(`Parsed ${rows.length} rows from CSV.`);

  const { data: existing } = await sb.from("businesses").select("id");
  const usedIds = new Set((existing || []).map((b) => b.id));
  console.log(`${usedIds.size} existing businesses in DB.`);

  let published = 0;
  let failed = 0;

  for (const row of rows) {
    const name = row.business_name;
    if (!name) { failed++; continue; }

    const { city, state } = parseCityState(row.address);
    const id = uniqueId(name, usedIds, city, state);
    const catInfo = resolveCategory(row.category);
    const reviews = parseReviews(row);
    const weeklyHours = parseWeeklyHours(row.weekly_hours);

    const descField = row["description_in_about_200_words"] || row.description || row.description_raw || "";

    const dbRow = {
      id,
      name: name.trim(),
      vertical: catInfo.vertical,
      status: "active",
      category: catInfo.category,
      category_slug: catInfo.categorySlug,
      address: row.address || null,
      city,
      state,
      phone: row.phone || null,
      email: row.email || null,
      website: row.website && !/not found/i.test(row.website) ? row.website : null,
      google_maps_url: row.gbp_url || null,
      description: descField,
      logo_url: row.logo_url && row.logo_url.startsWith("http") ? row.logo_url : null,
      gallery_urls: [],
      google_rating: row.rating ? parseFloat(row.rating) || null : null,
      google_review_count: row.review_count ? parseInt(row.review_count.replace(/[^0-9]/g, ""), 10) || null : null,
      google_reviews: reviews,
      hours_status: row.business_hours || null,
      weekly_hours: weeklyHours,
      social: parseSocial(row),
      about_blocks: [],
      faqs: [],
      metadata: { imported_from: "csv", import_date: new Date().toISOString() },
    };

    const { error } = await sb.from("businesses").insert(dbRow);
    if (error) {
      console.error(`FAIL: ${name} → ${error.message}`);
      failed++;
    } else {
      console.log(`OK: ${name} → /business/${id}`);
      published++;
    }
  }

  console.log(`\nDone: ${published} published, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
