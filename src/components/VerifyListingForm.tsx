"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clearListingOtp, readListingOtp, storeListingOtp } from "@/lib/listing-otp-client";

export function VerifyListingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationId = searchParams.get("id") ?? "";
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [emailDelivery, setEmailDelivery] = useState<"email" | "dev" | null>(null);

  useEffect(() => {
    if (verificationId) {
      const stored = readListingOtp(verificationId);
      if (stored) setDevCode(stored);
    }
  }, [verificationId]);

  async function handleResend() {
    setError("");
    setResending(true);
    try {
      const res = await fetch("/api/listings/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId }),
      });
      const data = (await res.json()) as {
        error?: string;
        devCode?: string;
        emailDelivery?: "email" | "dev";
      };
      if (!res.ok) {
        setError(data.error ?? "Could not resend code.");
        return;
      }
      setEmailDelivery(data.emailDelivery ?? null);
      if (data.devCode) {
        setDevCode(data.devCode);
        storeListingOtp(verificationId, data.devCode);
      }
      setSuccess(
        data.emailDelivery === "email"
          ? "A new code was sent to your business email."
          : "New code generated — see below.",
      );
    } catch {
      setError("Network error.");
    } finally {
      setResending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/listings/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId, code }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        type?: string;
        businessId?: string;
        businessUrl?: string;
        manageUrl?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Verification failed.");
        return;
      }
      clearListingOtp(verificationId);
      setSuccess(data.message ?? "Verified!");
      if (data.type === "new" && data.businessUrl) {
        setTimeout(() => {
          router.push(data.businessUrl!);
        }, 1500);
      } else if (data.type === "claim" && data.businessId) {
        setTimeout(() => {
          router.push(data.manageUrl ?? `/manage-listing/${data.businessId}`);
        }, 1500);
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  if (!verificationId) {
    return (
      <p className="text-sm text-[#717171]">
        Missing verification session. Start from{" "}
        <a href="/list-your-business" className="text-[#1274c0] hover:underline">
          List your business
        </a>
        .
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded border border-[#e0e0e0] bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-bold text-[#111]">Enter verification code</h2>
      <p className="mt-2 text-sm text-[#555]">
        {emailDelivery === "email" || !devCode
          ? `Code sent to business email${email ? `: ${email}` : ""}.`
          : "Email is not configured — use the code below."}
      </p>

      {devCode && (
        <div className="mt-4 rounded border-2 border-[#ff6c00] bg-[#fff4eb] px-4 py-3 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-[#b45309]">
            Verification code
          </p>
          <p className="mt-1 text-3xl font-bold tracking-[0.35em] text-[#111]">{devCode}</p>
        </div>
      )}

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]{6}"
        maxLength={6}
        required
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="6-digit code"
        className="mt-4 w-full rounded border border-[#ccc] px-3 py-3 text-center text-2xl tracking-[0.4em]"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-2 text-sm text-[#25a244]">{success}</p>}
      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className="jd-btn-primary mt-4 w-full rounded py-2.5 text-sm font-semibold disabled:opacity-60"
      >
        {loading ? "Verifying…" : "Verify business email"}
      </button>
      <button
        type="button"
        disabled={resending}
        onClick={() => void handleResend()}
        className="mt-3 w-full text-sm font-medium text-[#1274c0] hover:underline disabled:opacity-50"
      >
        {resending ? "Sending…" : "Resend code"}
      </button>
    </form>
  );
}
