/** Generate improved listing descriptions for thin or missing copy. */

const MIN_LENGTH = 400;

const CATEGORY_INTRO: Record<string, string> = {
  "HVAC Contractor":
    "provides professional heating, ventilation, and air conditioning services for homes and businesses",
  "Heating Contractor":
    "specializes in furnace, heat pump, and boiler installation, repair, and maintenance",
  "AC Repair": "offers fast air conditioning repair and emergency cooling service",
  "AC Contractor": "installs and replaces central air and ductless cooling systems",
  "Plumbing & HVAC":
    "delivers combined plumbing and HVAC solutions for residential and commercial properties",
  "Air Duct Cleaning":
    "provides air duct cleaning and indoor air quality improvements",
  "Insulation Contractor": "helps homeowners improve energy efficiency with insulation upgrades",
};

function pickServices(category: string): string[] {
  const base = [
    "AC repair and seasonal tune-ups",
    "Heating system diagnostics and furnace service",
    "New system installation and equipment replacement",
    "Ductwork and airflow improvements",
    "Indoor air quality and thermostat upgrades",
    "Emergency service for no-cool and no-heat calls",
  ];
  if (category.includes("AC")) {
    return [
      "Same-day AC repair and refrigerant service",
      "Compressor and capacitor diagnostics",
      "New high-efficiency AC installation",
      "Ductless mini-split options",
      ...base.slice(2, 4),
    ];
  }
  if (category.includes("Heating")) {
    return [
      "Furnace repair and heat pump service",
      "Winter readiness inspections",
      "Carbon monoxide safety checks",
      ...base.slice(2),
    ];
  }
  return base;
}

export type ListingEnrichInput = {
  name: string;
  category: string;
  city: string;
  state: string;
  phone?: string | null;
  address?: string | null;
  description?: string | null;
};

export function needsDescriptionEnrichment(description: string | null | undefined): boolean {
  if (!description?.trim()) return true;
  return description.trim().length < MIN_LENGTH;
}

export function buildListingDescription(input: ListingEnrichInput): string {
  const intro =
    CATEGORY_INTRO[input.category] ??
    "provides trusted local service for residential and commercial customers";
  const services = pickServices(input.category);
  const location = `${input.city}, ${input.state}`;
  const addressLine = input.address?.trim()
    ? ` Located at ${input.address.trim()}, they serve homeowners and businesses across ${location} and nearby communities.`
    : ` They proudly serve ${location} and surrounding neighborhoods.`;

  const serviceBlock = services
    .slice(0, 5)
    .map((s) => `• ${s}`)
    .join("\n");

  const paragraphs = [
    `${input.name} is a ${input.category.toLowerCase()} that ${intro} in ${location}.${addressLine}`,
    `Customers choose ${input.name} for responsive scheduling, clear estimates, and technicians who explain options before starting work. Whether you need routine maintenance, a full system replacement, or urgent repair, the team focuses on lasting comfort and energy-efficient results.`,
    `Common services include:\n${serviceBlock}`,
    `For appointments or questions, contact ${input.name}${input.phone ? ` at ${input.phone}` : ""}. Mention your equipment type, symptoms, and preferred visit window so the team can prepare the right parts and arrive ready to help.`,
  ];

  return paragraphs.join("\n\n").slice(0, 2800);
}
