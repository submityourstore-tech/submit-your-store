const OTP_PREFIX = "review_otp_";

export function storeReviewOtp(verificationId: string, code: string) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(`${OTP_PREFIX}${verificationId}`, code);
}

export function readReviewOtp(verificationId: string): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(`${OTP_PREFIX}${verificationId}`);
}

export function clearReviewOtp(verificationId: string) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(`${OTP_PREFIX}${verificationId}`);
}
