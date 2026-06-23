"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import {
  emptySocialForm,
  ListingMediaUpload,
  ListingSocialFields,
  socialFormToLinks,
} from "@/components/ListingMediaUpload";
import type { ListingCheckResult } from "@/types/listing";
import type { AddressSelection } from "@/types/address-search";
import type { ListingPrefill } from "@/lib/listing-prefill";
import { prefillSourceMessage } from "@/lib/prefill-messages";
import { getDefaultListingCategoryKey } from "@/lib/categories-config";
import { ListingCategorySelect } from "@/components/ListingCategorySelect";
import { extractVerificationToken, formatVerifyApiError } from "@/lib/verify-messages";

type Step = "gbp" | "form" | "sent";

type CheckResponse = ListingCheckResult & {
  error?: string;
  prefill?: ListingPrefill;
  resolvedGbpUrl?: string;
};

function applyPrefillToState(
  prefill: ListingPrefill | undefined,
  setters: {
    setBusinessName: (v: string) => void;
    setPhone: (v: string) => void;
    setGbpPhone: (v: string) => void;
    setWebsite: (v: string) => void;
    setAddressInput: (v: string) => void;
    setAddressLine: (v: string) => void;
    setCity: (v: string) => void;
    setState: (v: string) => void;
    setLat: (v: number | null) => void;
    setLon: (v: number | null) => void;
  },
) {
  if (!prefill) return;
  if (prefill.businessName) setters.setBusinessName(prefill.businessName);
  if (prefill.phone) setters.setPhone(prefill.phone);
  if (prefill.gbpPhone) setters.setGbpPhone(prefill.gbpPhone);
  if (prefill.website) setters.setWebsite(prefill.website);
  if (prefill.addressLabel || prefill.address) {
    setters.setAddressInput(prefill.addressLabel ?? prefill.address ?? "");
    setters.setAddressLine(prefill.address ?? prefill.addressLabel ?? "");
  }
  if (prefill.city) setters.setCity(prefill.city);
  if (prefill.state) setters.setState(prefill.state);
  if (prefill.lat != null && prefill.lon != null && !(prefill.lat === 0 && prefill.lon === 0)) {
    setters.setLat(prefill.lat);
    setters.setLon(prefill.lon);
  }
}

export function ListYourBusinessForm() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>("gbp");
  const [gbpUrl, setGbpUrl] = useState("");
  const [check, setCheck] = useState<ListingCheckResult | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gbpPhone, setGbpPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [categoryKey, setCategoryKey] = useState(getDefaultListingCategoryKey);
  const [addressInput, setAddressInput] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("Dallas");
  const [state, setState] = useState("TX");
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<"check" | "fetch" | null>(null);
  const [error, setError] = useState("");
  const [devVerifyUrl, setDevVerifyUrl] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [emailDelivery, setEmailDelivery] = useState<"email" | "dev" | "link" | null>(null);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [inlineVerifying, setInlineVerifying] = useState(false);
  const [inlineVerifyError, setInlineVerifyError] = useState("");
  const [inlineVerifySuccess, setInlineVerifySuccess] = useState<string | null>(null);
  const [prefillNote, setPrefillNote] = useState("");
  const [description, setDescription] = useState("");
  const [social, setSocial] = useState(() => emptySocialForm());
  const [uploadSessionId] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `session-${Date.now()}`,
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  async function handleGbpCheck(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setLoadingPhase("check");
    try {
      const slowTimer = window.setTimeout(() => setLoadingPhase("fetch"), 2500);
      const res = await fetch("/api/listings/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gbpUrl }),
        signal: AbortSignal.timeout(45_000),
      });
      window.clearTimeout(slowTimer);
      let data: CheckResponse;
      try {
        data = (await res.json()) as CheckResponse;
      } catch {
        setError(
          res.ok
            ? "Unexpected server response. Try again."
            : `Could not check Google profile (${res.status}). Try again.`,
        );
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Could not check Google profile.");
        return;
      }
      setCheck(data);
      if (data.resolvedGbpUrl) setGbpUrl(data.resolvedGbpUrl);
      applyPrefillToState(data.prefill, {
        setBusinessName,
        setPhone,
        setGbpPhone,
        setWebsite,
        setAddressInput,
        setAddressLine,
        setCity,
        setState,
        setLat,
        setLon,
      });
      if (data.status === "claimable") {
        setBusinessName(data.businessName);
      }
      if (data.prefill?.address || data.prefill?.addressLabel) {
        setPrefillNote(prefillSourceMessage(data.prefill.source) || "Address loaded from your Google profile.");
      } else if (data.prefill?.businessName) {
        setPrefillNote("Business name loaded from Google — enter or search your address below.");
      } else {
        setPrefillNote("");
      }
      setStep("form");
    } catch (err) {
      const timedOut = err instanceof DOMException && err.name === "TimeoutError";
      setError(
        timedOut
          ? "Request timed out. Your link may still be valid — try again in a moment."
          : "Network error. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
      setLoadingPhase(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDevVerifyUrl(null);
    setEmailWarning(null);

    const isClaim = check?.status === "claimable";
    if (!isClaim) {
      if (!phone.trim()) {
        setError("Phone number is required.");
        return;
      }
      if (!businessEmail.trim()) {
        setError("Business email is required.");
        return;
      }
      if (description.trim().length < 40) {
        setError("Description is required (at least 40 characters).");
        return;
      }
    }

    setLoading(true);

    try {
      const isClaim = check?.status === "claimable";

      const body = {
        type: isClaim ? "claim" : "new",
        gbpUrl,
        businessEmail,
        businessName: isClaim ? check.businessName : businessName,
        businessId: isClaim ? check.businessId : undefined,
        phone: isClaim ? undefined : phone,
        website: isClaim ? undefined : website,
        categoryKey: isClaim ? undefined : categoryKey,
        address: isClaim ? undefined : addressLine || addressInput,
        city: isClaim ? undefined : city,
        state: isClaim ? undefined : state,
        lat: isClaim ? undefined : lat ?? undefined,
        lon: isClaim ? undefined : lon ?? undefined,
        description: isClaim ? undefined : description.trim() || undefined,
        social: isClaim ? undefined : socialFormToLinks(social),
        uploadSessionId: isClaim ? undefined : uploadSessionId,
        logo: isClaim ? undefined : logoUrl ?? undefined,
        gallery: isClaim ? undefined : galleryUrls.length ? galleryUrls : undefined,
      };

      if (!isClaim) {
        const res = await fetch("/api/listings/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as {
          error?: string;
          businessUrl?: string;
          message?: string;
        };

        if (!res.ok) {
          setError(data.error ?? "Could not publish your listing.");
          return;
        }

        if (data.businessUrl) {
          router.push(data.businessUrl);
          router.refresh();
          return;
        }
      }

      const res = await fetch("/api/listings/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        error?: string;
        verificationId?: string;
        devVerifyUrl?: string;
        verifyUrl?: string;
        emailDelivery?: "email" | "dev" | "link";
        emailWarning?: string;
      };

      const hasVerifyLink = Boolean(data.verificationId ?? data.verifyUrl ?? data.devVerifyUrl);
      if (!res.ok && !hasVerifyLink) {
        setError(data.error ?? "Could not start verification.");
        return;
      }

      setVerificationId(data.verificationId ?? null);
      setDevVerifyUrl(data.devVerifyUrl ?? data.verifyUrl ?? null);
      setEmailDelivery(data.emailDelivery ?? (hasVerifyLink ? "link" : null));
      setEmailWarning(data.emailWarning ?? null);
      setInlineVerifyError("");
      setInlineVerifySuccess(null);
      setStep("sent");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleInlineVerify() {
    const token = extractVerificationToken(verificationId, devVerifyUrl);
    if (!token) {
      setInlineVerifyError("Verification session expired. Go back and submit the form again.");
      return;
    }

    setInlineVerifying(true);
    setInlineVerifyError("");
    try {
      const res = await fetch("/api/listings/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as {
        error?: string;
        code?: string;
        message?: string;
        businessUrl?: string;
        manageUrl?: string;
        type?: string;
      };
      if (!res.ok) {
        setInlineVerifyError(formatVerifyApiError(data));
        return;
      }
      setInlineVerifySuccess(data.message ?? "Your listing is live!");
      const next =
        data.type === "new" && data.businessUrl
          ? data.businessUrl
          : data.manageUrl ?? null;
      if (next) {
        setTimeout(() => router.push(next), 2000);
      }
    } catch {
      setInlineVerifyError("Network error. Check your connection and try again.");
    } finally {
      setInlineVerifying(false);
    }
  }

  if (authLoading) {
    return (
      <div className="rounded border border-[#e0e0e0] bg-white p-6 shadow-sm text-center text-sm text-[#717171]">
        Checking sign-in status…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded border border-[#e0e0e0] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#111]">Sign in required</h2>
        <p className="mt-2 text-sm text-[#555]">
          Free listings are available only to signed-in users. Sign in with Google to add or claim your
          business.
        </p>
        <Link
          href="/auth/sign-in?callbackUrl=/list-your-business"
          className="jd-btn-primary mt-4 inline-flex rounded px-5 py-2.5 text-sm font-semibold"
        >
          Sign in to continue
        </Link>
      </div>
    );
  }

  if (step === "sent") {
    const verifyLink =
      devVerifyUrl ??
      (verificationId
        ? `/verify-listing?token=${encodeURIComponent(verificationId)}`
        : null);

    return (
      <div className="rounded border border-[#e0e0e0] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#111]">Verify your listing</h2>

        {emailDelivery === "email" ? (
          <p className="mt-2 text-sm text-[#555]">
            We sent a verification link to <strong>{businessEmail}</strong>. Check your inbox
            (and spam), or use the button below.
          </p>
        ) : (
          <p className="mt-2 text-sm text-[#555]">
            Verify <strong>{businessEmail}</strong> to publish your listing. Use the button below —
            no email needed. The link expires in 15 minutes.
          </p>
        )}

        {inlineVerifySuccess ? (
          <div className="mt-4 rounded border border-[#25a244] bg-[#f0fdf4] px-4 py-3 text-sm text-[#555]">
            {inlineVerifySuccess}
            <p className="mt-1 text-xs text-[#717171]">Redirecting you now…</p>
          </div>
        ) : (
          extractVerificationToken(verificationId, devVerifyUrl) && (
            <button
              type="button"
              disabled={inlineVerifying}
              onClick={() => void handleInlineVerify()}
              className="jd-btn-primary mt-4 w-full rounded px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {inlineVerifying ? "Publishing…" : "Verify & publish listing"}
            </button>
          )
        )}

        {inlineVerifyError && (
          <p className="mt-3 text-sm text-red-600">{inlineVerifyError}</p>
        )}

        {verifyLink && !inlineVerifySuccess && (
          <p className="mt-3 text-xs text-[#717171]">
            Or{" "}
            <a href={verifyLink} className="text-[#1274c0] hover:underline">
              open the verification link
            </a>{" "}
            in a new tab.
          </p>
        )}

        {emailWarning && (
          <p className="mt-3 rounded border border-[#e8e8e8] bg-[#fafafa] px-3 py-2 text-xs text-[#555]">
            {emailWarning}
          </p>
        )}

        <p className="mt-4 text-xs text-[#717171]">
          Only someone with access to <strong>{businessEmail}</strong> should use this link — that
          proves you own the business.
        </p>
      </div>
    );
  }

  if (step === "form") {
    const isClaim = check?.status === "claimable";
    const isBlocked = check?.status === "published";

    return (
      <div className="rounded border border-[#e0e0e0] bg-white p-6 shadow-sm">
        <div className="mb-4 rounded border border-[#e8e8e8] bg-[#fafafa] px-3 py-2 text-xs text-[#555]">
          <span className="font-semibold text-[#333]">Google profile:</span>{" "}
          <span className="break-all">{gbpUrl}</span>
        </div>

        {isClaim && (
          <div className="mb-4 rounded border border-[#1274c0] bg-[#f0f7fd] px-4 py-3 text-sm text-[#0d5a94]">
            This profile is already listed as{" "}
            <a
              href={`/business/${check.businessId}`}
              className="font-semibold underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {check.businessName}
            </a>
            . Verify ownership to edit it.
          </div>
        )}

        {isBlocked && (
          <div className="mb-4 rounded border border-[#ff6c00] bg-[#fff4eb] px-4 py-3 text-sm text-[#b45309]">
            <strong>{check.businessName}</strong> is already on Submit Your Store but has no
            website/email on file.{" "}
            <a href={`/business/${check.businessId}`} className="font-semibold underline">
              View listing
            </a>{" "}
            or contact support to claim it.
          </div>
        )}

        {!isBlocked && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {prefillNote && (
              <p className="rounded border border-[#1274c0] bg-[#f0f7fd] px-3 py-2 text-sm text-[#0d5a94]">
                {prefillNote}
              </p>
            )}

            {isClaim && (
              <div className="space-y-3 rounded border border-[#e8e8e8] bg-[#fafafa] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#717171]">
                  Loaded from Google profile
                </p>
                <ReadOnlyField label="Business name" value={businessName || check.businessName} />
                {phone && <ReadOnlyField label="Phone" value={phone} />}
                {addressInput && (
                  <AddressAutocomplete
                    value={addressInput}
                    onValueChange={() => {}}
                    onSelect={() => {}}
                    lat={lat}
                    lon={lon}
                    readOnly
                  />
                )}
                {website && <ReadOnlyField label="Website" value={website} />}
              </div>
            )}

            {!isClaim && (
              <>
                <Field label="Business name *" value={businessName} onChange={setBusinessName} />
                <Field label="Phone *" value={phone} onChange={setPhone} type="tel" />
                <AddressAutocomplete
                  value={addressInput}
                  onValueChange={(v) => {
                    setAddressInput(v);
                    if (!v.trim()) {
                      setAddressLine("");
                      setLat(null);
                      setLon(null);
                    }
                  }}
                  onSelect={(item: AddressSelection) => {
                    setAddressLine(item.address);
                    setCity(item.city);
                    setState(item.state);
                    setLat(item.lat);
                    setLon(item.lon);
                  }}
                  lat={lat}
                  lon={lon}
                  required
                />
                <Field label="Website" value={website} onChange={setWebsite} />
                <ListingCategorySelect value={categoryKey} onChange={setCategoryKey} />
                <label className="block text-sm">
                  <span className="font-medium text-[#333]">Description *</span>
                  <span className="mt-0.5 block text-xs text-[#717171]">
                    Tell customers about your services, experience, and service area (at least 40
                    characters).
                  </span>
                  <textarea
                    rows={4}
                    required
                    minLength={40}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="We provide residential and commercial HVAC repair, installation, and maintenance…"
                    className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
                  />
                </label>
                <ListingSocialFields value={social} onChange={setSocial} />
                <ListingMediaUpload
                  sessionId={uploadSessionId}
                  logoUrl={logoUrl}
                  galleryUrls={galleryUrls}
                  onLogoChange={setLogoUrl}
                  onGalleryChange={setGalleryUrls}
                />
              </>
            )}

            <div className="space-y-3 rounded border border-[#e8e8e8] bg-[#fafafa] p-4">
              <p className="text-sm font-medium text-[#333]">Verify ownership</p>
              <p className="text-xs text-[#717171]">
                {isClaim
                  ? `Enter your @${check.requiredEmailDomain} company email. We'll try to email a link; if that doesn't work, you can verify right here on the next screen.`
                  : "Enter your company domain email (not Gmail/Yahoo). We'll try to email a link; if that doesn't work, you can verify right here on the next screen."}
              </p>
            </div>

            <Field
              label="Business email *"
              value={businessEmail}
              onChange={setBusinessEmail}
              type="email"
              hint={
                isClaim
                  ? `Must be @${check.requiredEmailDomain}`
                  : "Company domain email required (not Gmail/Yahoo)"
              }
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="jd-btn-primary rounded px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {loading
                ? isClaim
                  ? "Starting verification…"
                  : "Publishing…"
                : isClaim
                  ? "Continue to verification"
                  : "Publish listing"}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => {
            setStep("gbp");
            setCheck(null);
            setError("");
          }}
          className="mt-4 text-sm text-[#1274c0] hover:underline"
        >
          ← Change Google profile link
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleGbpCheck} className="rounded border border-[#e0e0e0] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[#111]">Google Business Profile link *</h2>
      <p className="mt-1 text-sm text-[#717171]">
        Paste the link from Google Business Profile → <strong>Share</strong> → <strong>Copy link</strong>{" "}
        (maps.app.goo.gl, g.page, or google.com/maps). We fetch your address from it automatically.
      </p>
      <input
        type="text"
        inputMode="url"
        required
        value={gbpUrl}
        onChange={(e) => setGbpUrl(e.target.value)}
        placeholder="https://maps.app.goo.gl/... or https://www.google.com/maps/place/..."
        className="mt-3 w-full rounded border border-[#ccc] px-3 py-2.5 text-sm"
      />
      {loading && (
        <p className="mt-2 text-sm text-[#717171]">
          {loadingPhase === "fetch"
            ? "Fetching address from your Google profile…"
            : "Checking if this profile is already listed…"}
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="jd-btn-primary mt-4 rounded px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
      >
        {loading ? (loadingPhase === "fetch" ? "Fetching address…" : "Checking profile…") : "Continue"}
      </button>
    </form>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="font-medium text-[#333]">{label}</span>
      <p className="mt-1 rounded border border-[#e0e0e0] bg-white px-3 py-2 text-[#555]">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-[#333]">{label}</span>
      <input
        type={type}
        required={label.includes("*")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
      />
      {hint && <span className="mt-1 block text-xs text-[#717171]">{hint}</span>}
    </label>
  );
}
