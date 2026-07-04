/**
 * Bulk-improve thin business descriptions in Supabase.
 * Usage: node scripts/improve-listing-descriptions.mjs [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";

const MIN_LENGTH = 400;

const CATEGORY_INTRO = {
  "HVAC Contractor":
    "provides professional heating, ventilation, and air conditioning services for homes and businesses",
  "Heating Contractor":
    "specializes in furnace, heat pump, and boiler installation, repair, and maintenance",
  "AC Repair": "offers fast air conditioning repair and emergency cooling service",
  "AC Contractor": "installs and replaces central air and ductless cooling systems",
  "Plumbing & HVAC":
    "delivers combined plumbing and HVAC solutions for residential and commercial properties",
  "Air Duct Cleaning": "provides air duct cleaning and indoor air quality improvements",
  "Insulation Contractor": "helps homeowners improve energy efficiency with insulation upgrades",
};

function buildDescription(row) {
  const intro =
    CATEGORY_INTRO[row.category] ??
    "provides trusted local service for residential and commercial customers";
  const location = `${row.city}, ${row.state}`;
  const addressLine = row.address?.trim()
    ? ` Located at ${row.address.trim()}, they serve homeowners and businesses across ${location} and nearby communities.`
    : ` They proudly serve ${location} and surrounding neighborhoods.`;

  const services = [
    "AC repair and seasonal tune-ups",
    "Heating system diagnostics and furnace service",
    "New system installation and equipment replacement",
    "Ductwork and airflow improvements",
    "Indoor air quality and thermostat upgrades",
    "Emergency service for no-cool and no-heat calls",
  ];

  const serviceBlock = services.map((s) => `• ${s}`).join("\n");

  const paragraphs = [
    `${row.name} is a ${row.category.toLowerCase()} that ${intro} in ${location}.${addressLine}`,
    `Customers choose ${row.name} for responsive scheduling, clear estimates, and technicians who explain options before starting work. Whether you need routine maintenance, a full system replacement, or urgent repair, the team focuses on lasting comfort and energy-efficient results.`,
    `Common services include:\n${serviceBlock}`,
    `For appointments or questions, contact ${row.name}${row.phone ? ` at ${row.phone}` : ""}. Mention your equipment type, symptoms, and preferred visit window so the team can prepare the right parts and arrive ready to help.`,
  ];

  return paragraphs.join("\n\n").slice(0, 2800);
}

const dryRun = process.argv.includes("--dry-run");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const { data: rows, error } = await supabase
  .from("businesses")
  .select("id, name, category, city, state, phone, address, description, status")
  .eq("status", "active");

if (error) {
  console.error(error.message);
  process.exit(1);
}

let updated = 0;
for (const row of rows ?? []) {
  const desc = row.description?.trim() ?? "";
  if (desc.length >= MIN_LENGTH) continue;

  const next = buildDescription(row);
  if (dryRun) {
    console.log(`[dry-run] ${row.id} ${row.name} (${desc.length} → ${next.length} chars)`);
    updated++;
    continue;
  }

  const { error: upErr } = await supabase.from("businesses").update({ description: next }).eq("id", row.id);
  if (upErr) {
    console.error(`Failed ${row.id}:`, upErr.message);
    continue;
  }
  console.log(`Updated ${row.name} (${row.city})`);
  updated++;
}

console.log(`Done. ${updated} listing(s) ${dryRun ? "would be" : ""} updated.`);
