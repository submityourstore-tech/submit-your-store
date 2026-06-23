"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Business } from "@/types/business";

type ClaimBusinessModalProps = {
  open: boolean;
  onClose: () => void;
  business: Business;
  requiredEmailDomain?: string;
};

type Step = "email" | "otp" | "success";

function ModalShell({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-[#e0e0e0] bg-white p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}

export function ClaimBusinessModal({
  open,
  onClose,
  business,
  requiredEmailDomain,
}: ClaimBusinessModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [manageUrl, setManageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("email");
      setEmail("");
      setCode("");
      setVerificationId("");
      setDevCode(null);
      setError("");
      setManageUrl(null);
    }
  }, [open]);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/listings/claim-otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id, email: email.trim() }),
      });
      const data = (await res.json()) as {
        error?: string;
        verificationId?: string;
        devCode?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not send code.");
        return;
      }
      setVerificationId(data.verificationId ?? "");
      setDevCode(data.devCode ?? null);
      setStep("otp");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/listings/claim-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          verificationId,
          code: code.trim(),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        manageUrl?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Invalid code.");
        return;
      }
      setManageUrl(data.manageUrl ?? null);
      setStep("success");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function goToManage() {
    if (manageUrl) {
      router.push(manageUrl);
      router.refresh();
    }
    onClose();
  }

  return (
    <ModalShell open={open} onClose={onClose}>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 text-[#717171] hover:text-[#111]"
        aria-label="Close"
      >
        ✕
      </button>

      <h2 className="text-lg font-bold text-[#111]">Claim {business.name}</h2>
      <p className="mt-1 text-sm text-[#717171]">
        Verify with your business domain email
        {requiredEmailDomain ? (
          <>
            {" "}
            (<strong>@{requiredEmailDomain}</strong>)
          </>
        ) : (
          " (not Gmail/Yahoo)"
        )}{" "}
        to get owner access.
      </p>

      {step === "email" && (
        <form onSubmit={sendOtp} className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="font-medium text-[#333]">Business email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={requiredEmailDomain ? `you@${requiredEmailDomain}` : "you@company.com"}
              className="mt-1 w-full rounded border border-[#ccc] px-3 py-2.5 text-sm"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="jd-btn-primary w-full rounded py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send OTP to email"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp} className="mt-4 space-y-3">
          <p className="text-sm text-[#555]">
            Enter the 6-digit code sent to <strong>{email}</strong>.
          </p>
          {devCode && (
            <p className="rounded border border-[#1274c0] bg-[#f0f7fd] px-3 py-2 text-sm text-[#0d5a94]">
              Dev code: <strong>{devCode}</strong>
            </p>
          )}
          <label className="block text-sm">
            <span className="font-medium text-[#333]">Verification code</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-1 w-full rounded border border-[#ccc] px-3 py-2.5 text-center text-lg tracking-[0.3em]"
              autoComplete="one-time-code"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="jd-btn-primary w-full rounded py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Verify & claim listing"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError("");
            }}
            className="w-full text-sm text-[#1274c0] hover:underline"
          >
            ← Resend to different email
          </button>
        </form>
      )}

      {step === "success" && (
        <div className="mt-4 space-y-4">
          <p className="rounded border border-[#25a244] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
            🟢 Your listing is now <strong>Claimed by Owner</strong>. You can edit your profile and
            receive leads.
          </p>
          <button
            type="button"
            onClick={goToManage}
            className="jd-btn-primary w-full rounded py-2.5 text-sm font-semibold"
          >
            Open owner dashboard
          </button>
        </div>
      )}
    </ModalShell>
  );
}
