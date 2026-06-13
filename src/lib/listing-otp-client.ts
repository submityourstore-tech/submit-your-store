const OTP_PREFIX = "listing_otp_";

export function storeListingOtp(verificationId: string, code: string) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(`${OTP_PREFIX}${verificationId}`, code);
}

export function readListingOtp(verificationId: string): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(`${OTP_PREFIX}${verificationId}`);
}

export function clearListingOtp(verificationId: string) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(`${OTP_PREFIX}${verificationId}`);
}
