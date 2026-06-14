/** US IANA time zones for listing cities (Texas metros use Central). */
const CITY_TIMEZONE: Record<string, string> = {
  dallas: "America/Chicago",
  houston: "America/Chicago",
  austin: "America/Chicago",
  "san antonio": "America/Chicago",
  "fort worth": "America/Chicago",
  arlington: "America/Chicago",
  plano: "America/Chicago",
  irving: "America/Chicago",
  frisco: "America/Chicago",
  coppell: "America/Chicago",
  rowlett: "America/Chicago",
  garland: "America/Chicago",
  richardson: "America/Chicago",
  mesquite: "America/Chicago",
  carrollton: "America/Chicago",
};

export function getTimezoneForCity(city: string, state = "TX"): string {
  if (state === "TX") {
    return CITY_TIMEZONE[city.trim().toLowerCase()] ?? "America/Chicago";
  }
  return "America/Chicago";
}

export function getTimezoneLabel(timeZone: string): string {
  if (timeZone === "America/Chicago") return "Central Time (US)";
  if (timeZone === "America/New_York") return "Eastern Time (US)";
  if (timeZone === "America/Denver") return "Mountain Time (US)";
  if (timeZone === "America/Los_Angeles") return "Pacific Time (US)";
  return timeZone.replace("_", " ");
}

export function hasValidPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10;
}

export function whatsAppUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^1/, "");
  return `https://wa.me/1${digits}`;
}
