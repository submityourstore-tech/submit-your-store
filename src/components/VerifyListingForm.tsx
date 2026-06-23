"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatVerifyApiError } from "@/lib/verify-messages";

type VerifyState = "idle" | "verifying" | "success" | "error";

export function VerifyListingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? searchParams.get("id") ?? "";
  const email = searchParams.get("email") ?? "";

  const [state, setState] = useState<VerifyState>(token ? "verifying" : "idle");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [devVerifyUrl, setDevVerifyUrl] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState(token);
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!token || verifiedRef.current) return;
    verifiedRef.current = true;
    void verifyToken(token);
  }, [token]);

  async function verifyToken(verificationToken: string) {
    setState("verifying");
    setError("");
    try {
      const res = await fetch("/api/listings/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationToken }),
      });
      const data = (await res.json()) as {
        error?: string;
        code?: string;
        message?: string;
        type?: string;
        businessUrl?: string;
        manageUrl?: string;
      };
      if (!res.ok) {
        setState("error");
        setError(formatVerifyApiError(data));
        return;
      }
      setState("success");
      setMessage(data.message ?? "Verified!");
      const next =
        data.type === "new" && data.businessUrl
          ? data.businessUrl
          : data.manageUrl ?? null;
      setRedirectUrl(next);
      if (next) {
        setTimeout(() => router.push(next), 2000);
      }
    } catch {
      setState("error");
      setError("Network error. Try again.");
    }
  }

  async function handleResend() {
    if (!activeToken) return;
    setError("");
    setResending(true);
    try {
      const res = await fetch("/api/listings/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: activeToken }),
      });
      const data = (await res.json()) as {
        error?: string;
        verificationId?: string;
        verifyUrl?: string;
        devVerifyUrl?: string;
        emailDelivery?: "email" | "dev";
      };
      if (!res.ok) {
        setError(data.error ?? "Could not resend verification.");
        return;
      }
      if (data.verificationId && data.verificationId !== activeToken) {
        setActiveToken(data.verificationId);
        const params = new URLSearchParams(searchParams.toString());
        params.set("token", data.verificationId);
        router.replace(`/verify-listing?${params.toString()}`);
      }
      if (data.devVerifyUrl) {
        setDevVerifyUrl(data.devVerifyUrl);
      }
      setMessage(
        data.emailDelivery === "email"
          ? "A new verification link was sent to your business email."
          : "New verification link generated — see below.",
      );
      setState("idle");
      verifiedRef.current = false;
    } catch {
      setError("Network error.");
    } finally {
      setResending(false);
    }
  }

  if (!token) {
    return (
      <p className="text-sm text-[#717171]">
        Missing verification link. Start from{" "}
        <a href="/list-your-business" className="text-[#1274c0] hover:underline">
          List your business
        </a>
        .
      </p>
    );
  }

  if (state === "verifying") {
    return (
      <div className="rounded border border-[#e0e0e0] bg-white p-6 shadow-sm text-center">
        <h2 className="text-lg font-bold text-[#111]">Verifying your email…</h2>
        <p className="mt-2 text-sm text-[#555]">Please wait while we confirm your business email.</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="rounded border border-[#25a244] bg-[#f0fdf4] p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#111]">Verified</h2>
        <p className="mt-2 text-sm text-[#555]">{message}</p>
        {redirectUrl && (
          <p className="mt-2 text-sm text-[#717171]">Redirecting you now…</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded border border-[#e0e0e0] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[#111]">Verification link</h2>
      {state === "error" ? (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      ) : (
        <p className="mt-2 text-sm text-[#555]">
          {email
            ? `We sent a verification link to ${email}. Open it from your inbox to publish your listing.`
            : "Open the verification link from your business email to continue."}
        </p>
      )}

      {state === "error" && error.toLowerCase().includes("could not save") && (
        <p className="mt-2 text-sm text-[#555]">
          Your email was verified, but saving the listing failed. Try again in a few minutes once
          storage is available, or contact{" "}
          <a href="mailto:support@submityourstore.com" className="text-[#1274c0] hover:underline">
            support@submityourstore.com
          </a>
          .
        </p>
      )}

      {devVerifyUrl && (
        <div className="mt-4 rounded border-2 border-[#ff6c00] bg-[#fff4eb] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#b45309]">
            Dev verification link
          </p>
          <a
            href={devVerifyUrl}
            className="mt-2 block break-all text-sm font-medium text-[#1274c0] hover:underline"
          >
            {devVerifyUrl}
          </a>
        </div>
      )}

      {message && <p className="mt-2 text-sm text-[#25a244]">{message}</p>}
      {error && state !== "error" && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {state === "error" && (
        <button
          type="button"
          onClick={() => void verifyToken(activeToken)}
          className="jd-btn-primary mt-4 w-full rounded py-2.5 text-sm font-semibold"
        >
          Try again
        </button>
      )}

      <button
        type="button"
        disabled={resending}
        onClick={() => void handleResend()}
        className="mt-3 w-full text-sm font-medium text-[#1274c0] hover:underline disabled:opacity-50"
      >
        {resending ? "Sending…" : "Resend verification email"}
      </button>
    </div>
  );
}
