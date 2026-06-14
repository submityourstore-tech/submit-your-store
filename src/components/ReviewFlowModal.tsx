"use client";

import { signIn } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BusinessAvatar } from "@/components/BusinessMedia";
import { useAuth } from "@/components/AuthProvider";
import { clearReviewOtp, readReviewOtp, storeReviewOtp } from "@/lib/review-otp-client";

const PENDING_REVIEW_KEY = "sys_pending_review";

export type PendingReview = {
  businessId: string;
  rating: number;
  title: string;
  body: string;
};

type ReviewFlowModalProps = {
  open: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  businessCity: string;
  businessLogo?: string;
  initialRating?: number;
  onSuccess?: () => void;
};

type Step = "review" | "account" | "otp";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
const RATING_EMOJI = ["", "😞", "😐", "🙂", "😊", "😍"];

export function savePendingReview(data: PendingReview) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(PENDING_REVIEW_KEY, JSON.stringify(data));
}

export function loadPendingReview(businessId: string): PendingReview | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_REVIEW_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingReview;
    return parsed.businessId === businessId ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPendingReview() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(PENDING_REVIEW_KEY);
}

function ModalShell({
  open,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
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
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-xl bg-white shadow-2xl ${
          wide ? "max-w-3xl" : "max-w-md"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-2xl leading-none text-[#999] hover:text-[#333]"
          aria-label="Close dialog"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export function ReviewFlowModal({
  open,
  onClose,
  businessId,
  businessName,
  businessCity,
  businessLogo,
  initialRating = 0,
  onSuccess,
}: ReviewFlowModalProps) {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [step, setStep] = useState<Step>("review");
  const [rating, setRating] = useState(initialRating);
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verificationId, setVerificationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retrySec, setRetrySec] = useState(0);

  useEffect(() => {
    if (open) {
      setStep("review");
      setRating(initialRating > 0 ? initialRating : 0);
      setError("");
      if (user?.name) setName(user.name);
      if (user?.email) setEmail(user.email);
    }
  }, [open, initialRating, user?.name, user?.email]);

  useEffect(() => {
    if (retrySec <= 0) return;
    const t = setTimeout(() => setRetrySec((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [retrySec]);

  const submitReview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          rating,
          body: body.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string; requiresAuth?: boolean; requiresVerified?: boolean };

      if (res.status === 401 || res.status === 403 || data.requiresAuth || data.requiresVerified) {
        savePendingReview({ businessId, rating, title: "", body });
        setStep("account");
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Could not submit review.");
        return;
      }

      clearPendingReview();
      onSuccess?.();
      await refresh();
      router.refresh();
      onClose();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }, [businessId, rating, body, onClose, onSuccess, refresh, router]);

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Select a rating from 1 to 5 stars.");
      return;
    }
    savePendingReview({ businessId, rating, title: "", body });

    if (user?.emailVerified) {
      await submitReview();
      return;
    }

    setStep("account");
  }

  async function handleAccountContinue(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      setError("Please agree to Terms and Conditions.");
      return;
    }
    if (name.trim().length < 2) {
      setError("Enter your name.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid mobile number.");
      return;
    }
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/review-otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
      });
      const data = (await res.json()) as {
        verificationId?: string;
        devCode?: string;
        error?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Could not send verification code.");
        return;
      }

      setVerificationId(data.verificationId ?? "");
      if (data.verificationId && data.devCode) {
        storeReviewOtp(data.verificationId, data.devCode);
      }
      setRetrySec(55);
      setStep("otp");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignIn() {
    savePendingReview({ businessId, rating, title: "", body });
    const callbackUrl =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.hash || ""}`
        : "/";
    void signIn("google", { callbackUrl });
  }

  async function handleOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/review-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId, code }),
      });
      const data = (await res.json()) as {
        email?: string;
        tempPassword?: string;
        error?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Invalid code.");
        return;
      }

      clearReviewOtp(verificationId);

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.tempPassword,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Verified, but sign-in failed. Please sign in manually.");
        return;
      }

      await refresh();
      await submitReview();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (retrySec > 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/review-otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
      });
      const data = (await res.json()) as { verificationId?: string; devCode?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not resend code.");
        return;
      }
      setVerificationId(data.verificationId ?? "");
      if (data.verificationId && data.devCode) {
        storeReviewOtp(data.verificationId, data.devCode);
      }
      setRetrySec(55);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (step !== "otp" || !verificationId) return;
    const stored = readReviewOtp(verificationId);
    if (stored && stored.length === 6) {
      setOtp(stored.split(""));
    }
  }, [step, verificationId]);

  if (step === "review") {
    return (
      <ModalShell open={open} onClose={onClose} wide>
        <div className="border-b border-[#eee] px-6 py-4">
          <h2 className="text-xl font-bold text-[#111]">Write Review</h2>
        </div>
        <form onSubmit={handleReviewSubmit} className="grid gap-0 md:grid-cols-[220px_1fr]">
          <div className="border-b border-[#eee] bg-[#fafafa] p-6 md:border-b-0 md:border-r">
            <BusinessAvatar name={businessName} logo={businessLogo} size="detail" />
            <p className="mt-3 font-bold text-[#111]">{businessName}</p>
            <p className="text-sm text-[#717171]">{businessCity}</p>
            <p className="mt-4 text-sm font-medium text-[#333]">How would you rate your experience?</p>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`flex h-10 w-10 items-center justify-center rounded-md text-lg transition ${
                    star <= rating
                      ? "bg-[#ff6c00] text-white shadow-sm"
                      : "bg-[#f0f0f0] text-[#ccc]"
                  }`}
                  aria-label={`${star} star`}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="jd-rating-pill mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold">
                {RATING_LABELS[rating]} {RATING_EMOJI[rating]}
              </span>
            )}
          </div>
          <div className="p-6">
            <label className="block text-sm font-semibold text-[#333]">
              Tell us about your experience
              <textarea
                rows={5}
                maxLength={2000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Please share your experience with the business. Things you can talk about: service, product and price."
                className="mt-2 w-full rounded-lg border border-[#ddd] px-3 py-2.5 text-sm"
              />
            </label>
            <div className="mt-4">
              <span className="text-sm font-semibold text-[#333]">Upload Photos</span>
              <div className="mt-2 flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-[#1274c0] text-2xl text-[#1274c0]">
                📷+
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="jd-btn-primary rounded-lg px-8 py-2.5 text-sm font-bold disabled:opacity-60"
              >
                {loading ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          </div>
        </form>
      </ModalShell>
    );
  }

  if (step === "account") {
    return (
      <ModalShell open={open} onClose={onClose}>
        <div className="p-6 pt-8">
          <div className="flex items-center gap-3 border-b border-[#eee] pb-4">
            <span className="text-lg font-bold text-[#1274c0]">Submit Your Store</span>
            <span className="h-6 w-px bg-[#ddd]" />
            <div>
              <p className="font-bold text-[#111]">Welcome</p>
              <p className="text-xs text-[#717171]">Login for a seamless experience</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#ccc] py-3 text-sm font-semibold hover:bg-[#fafafa]"
          >
            <span className="text-lg">G</span>
            Continue with Google
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e0e0e0]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-[#717171]">or use email</span>
            </div>
          </div>

          <form onSubmit={handleAccountContinue} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#ccc] px-4 py-3 text-sm"
            />
            <input
              type="tel"
              required
              placeholder="Enter Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-[#ccc] px-4 py-3 text-sm"
            />
            <input
              type="email"
              required
              placeholder="Email address (Gmail or any email)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#ccc] px-4 py-3 text-sm"
            />

            <label className="flex items-start gap-2 text-xs text-[#555]">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I Agree to Terms and Conditions.{" "}
                <a href="/terms-of-service" className="text-[#1274c0] hover:underline">
                  T&amp;C&apos;s
                </a>{" "}
                <a href="/privacy-policy" className="text-[#1274c0] hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="jd-btn-primary w-full rounded-lg py-3 text-sm font-bold disabled:opacity-60"
            >
              {loading ? "Sending code…" : "Continue"}
            </button>
          </form>

          <button type="button" onClick={onClose} className="mt-4 w-full text-center text-sm text-[#717171]">
            Maybe Later
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="p-6 pt-8">
        <div className="flex items-center gap-3 border-b border-[#eee] pb-4">
          <span className="text-lg font-bold text-[#1274c0]">Submit Your Store</span>
          <span className="h-6 w-px bg-[#ddd]" />
          <div>
            <p className="font-bold text-[#111]">Welcome</p>
            <p className="text-xs text-[#717171]">Login for a seamless experience</p>
          </div>
        </div>

        <p className="mt-5 text-sm text-[#333]">
          Enter the code sent to{" "}
          <strong>{email}</strong>
        </p>

        <form onSubmit={handleOtpVerify} className="mt-4">
          <div className="flex justify-between gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(-1);
                  const next = [...otp];
                  next[i] = val;
                  setOtp(next);
                  if (val && i < 5) {
                    const el = document.getElementById(`otp-${i + 1}`);
                    el?.focus();
                  }
                }}
                id={`otp-${i}`}
                className="h-12 w-10 rounded-lg border border-[#ccc] text-center text-lg font-bold"
              />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-[#717171]">
            <span>
              Didn&apos;t Receive the OTP?{" "}
              {retrySec > 0 ? `Retry in 00:${String(retrySec).padStart(2, "0")}` : null}
            </span>
            <button
              type="button"
              disabled={retrySec > 0 || loading}
              onClick={() => void handleResendOtp()}
              className="font-semibold text-[#1274c0] disabled:opacity-40"
            >
              Resend OTP
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || otp.join("").length !== 6}
            className="mt-5 w-full rounded-lg bg-[#1274c0] py-3 text-sm font-bold text-white disabled:bg-[#ccc]"
          >
            {loading ? "Verifying…" : "Continue"}
          </button>
        </form>
      </div>
    </ModalShell>
  );
}
