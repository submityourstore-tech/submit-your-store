const ADDRESS_PATTERN =
  /\d{1,6}\s+[\w\s.#]+(?:,\s*)?(?:[A-Za-z\s]+,\s*)?(?:TX|Texas)\s*\d{5}/i;

const PLUS_CODE_PATTERN = /^[A-Z0-9]{2,8}\+[A-Z0-9]{2,3}\b/i;

const PROMO_PATTERNS = [
  /\bschedule (?:your|a) service\b/i,
  /\bemergency repair\b.*\bcall\b/i,
  /\blimited time\b/i,
  /\bspecial offer\b/i,
  /\bvisit our website\b/i,
  /\bmaintenance plan\b/i,
  /\b#\w+/,
];

export function looksLikeAddress(text: string): boolean {
  const t = text.trim();
  if (PLUS_CODE_PATTERN.test(t)) return true;
  if (ADDRESS_PATTERN.test(t)) return true;
  if (/\bUnited States\b/i.test(t) && /\d{5}/.test(t) && t.length < 120) return true;
  if (/^\d{1,6}\s+\w/.test(t) && /,\s*[A-Z]{2}\s*\d{5}/.test(t)) return true;
  return false;
}

export function looksLikePromoReview(text: string): boolean {
  if (text.length > 280 && !/\b(i |my |we |our )/i.test(text)) return true;
  return PROMO_PATTERNS.some((p) => p.test(text));
}

export function isDisplayableCustomerReview(text: string): boolean {
  const t = text.trim();
  if (t.length < 12) return false;
  if (looksLikeAddress(t)) return false;
  if (looksLikePromoReview(t)) return false;
  return true;
}

export function filterCustomerReviews(reviews: string[]): string[] {
  const out: string[] = [];
  for (const review of reviews) {
    const cleaned = review.trim();
    if (!isDisplayableCustomerReview(cleaned)) continue;
    if (!out.includes(cleaned)) out.push(cleaned);
  }
  return out;
}
