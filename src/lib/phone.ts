/** Strip to digits only for comparison (US numbers may include country code 1). */
export function normalizePhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }
  return digits;
}

export function phonesMatch(a: string, b: string): boolean {
  const da = normalizePhoneDigits(a);
  const db = normalizePhoneDigits(b);
  if (!da || !db) return false;
  return da === db;
}

/** Mask for display, e.g. (***) ***-1234 */
export function maskPhoneForDisplay(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  if (digits.length < 4) return "(***) ***-****";
  const last4 = digits.slice(-4);
  return `(***) ***-${last4}`;
}

export function isValidPhoneNumber(phone: string): boolean {
  const digits = normalizePhoneDigits(phone);
  return digits.length === 10;
}

/** Format a US phone number for Firebase signInWithPhoneNumber (E.164). */
export function phoneToE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+${digits}`;
}
