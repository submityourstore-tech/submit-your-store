export type VerifyApiError = {
  error?: string;
  code?: string;
  message?: string;
};

export function formatVerifyApiError(data: VerifyApiError): string {
  if (data.code === "PERSISTENCE_FAILED") {
    return (
      data.error ??
      "We verified your email but could not save your listing. Storage is temporarily unavailable — please try again in a few minutes or contact support@submityourstore.com."
    );
  }
  return data.error ?? "Verification failed.";
}

export function extractVerificationToken(
  verificationId: string | null,
  verifyUrl: string | null,
): string | null {
  if (verificationId?.trim()) return verificationId.trim();
  if (!verifyUrl?.trim()) return null;

  try {
    const parsed = verifyUrl.startsWith("http")
      ? new URL(verifyUrl)
      : new URL(verifyUrl, "http://localhost");
    return parsed.searchParams.get("token") ?? parsed.searchParams.get("id");
  } catch {
    const match = verifyUrl.match(/[?&](?:token|id)=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}
