"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { storeListingOtp } from "@/lib/listing-otp-client";

type Step = "gbp" | "form" | "sent";

type CheckResponse = ListingCheckResult & {
  error?: string;
  prefill?: ListingPrefill;
};

function applyPrefillToState(
  prefill: ListingPrefill | undefined,
  setters: {
    setBusinessName: (v: string) => void;
    setPhone: (v: string) => void;
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
  const [step, setStep] = useState<Step>("gbp");
  const [gbpUrl, setGbpUrl] = useState("");
  const [check, setCheck] = useState<ListingCheckResult | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("HVAC Contractor");
  const [addressInput, setAddressInput] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("Dallas");
  const [state, setState] = useState("TX");
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<"check" | "fetch" | null>(null);
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [emailDelivery, setEmailDelivery] = useState<"email" | "dev" | null>(null);
  const [verificationId, setVerificationId] = useState("");
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
      });
      window.clearTimeout(slowTimer);
      const data = (await res.json()) as CheckResponse;
      if (!res.ok) {
        setError(data.error ?? "Could not check Google profile.");
        return;
      }
      setCheck(data);
      applyPrefillToState(data.prefill, {
        setBusinessName,
        setPhone,
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
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
      setLoadingPhase(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDevCode(null);
    setLoading(true);

    const isClaim = check?.status === "claimable";
    const body = {
      type: isClaim ? "claim" : "new",
      gbpUrl,
      businessEmail,
      businessName: isClaim ? check.businessName : businessName,
      businessId: isClaim ? check.businessId : undefined,
      phone: isClaim ? undefined : phone,
      website: isClaim ? undefined : website,
      category: isClaim ? undefined : category,
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

    try {
      const res = await fetch("/api/listings/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        error?: string;
        verificationId?: string;
        devCode?: string;
        emailDelivery?: "email" | "dev";
      };
      if (!res.ok) {
        setError(data.error ?? "Could not send verification.");
        return;
      }
      setVerificationId(data.verificationId ?? "");
      setDevCode(data.devCode ?? null);
      setEmailDelivery(data.emailDelivery ?? null);
      if (data.verificationId && data.devCode) {
        storeListingOtp(data.verificationId, data.devCode);
      }
      setStep("sent");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "sent") {
    return (
      <div className="rounded border border-[#e0e0e0] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#111]">Check your business email</h2>
        {emailDelivery === "email" ? (
          <p className="mt-2 text-sm text-[#555]">
            We sent a 6-digit code to <strong>{businessEmail}</strong>. Check your inbox and spam
            folder.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-[#555]">
              Email is not configured on this server yet. Use the verification code below (also
              shown on the next screen).
            </p>
            {devCode && (
              <div className="mt-4 rounded border-2 border-[#ff6c00] bg-[#fff4eb] px-4 py-3 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-[#b45309]">
                  Your verification code
                </p>
                <p className="mt-1 text-3xl font-bold tracking-[0.35em] text-[#111]">{devCode}</p>
              </div>
            )}
          </>
        )}
        {emailDelivery === "email" && devCode && (
          <p className="mt-3 rounded bg-[#fff8e6] px-3 py-2 text-sm text-[#8a6d00]">
            Dev fallback code: <strong>{devCode}</strong>
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            if (devCode) storeListingOtp(verificationId, devCode);
            router.push(
              `/verify-listing?id=${verificationId}&email=${encodeURIComponent(businessEmail)}`,
            );
          }}
          className="jd-btn-primary mt-4 rounded px-5 py-2.5 text-sm font-semibold"
        >
          Enter verification code
        </button>
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
            . Verify with your <strong>@{check.requiredEmailDomain}</strong> business email to
            edit it.
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
                <label className="block text-sm">
                  <span className="font-medium text-[#333]">Category</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
                  >
                    {[
                      "HVAC Contractor",
                      "AC Repair",
                      "Heating Contractor",
                      "Plumbing & HVAC",
                      "Air Duct Cleaning",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-[#333]">Description</span>
                  <span className="mt-0.5 block text-xs text-[#717171]">
                    Tell customers about your services, experience, and service area.
                  </span>
                  <textarea
                    rows={4}
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

            <Field
              label="Business email *"
              value={businessEmail}
              onChange={setBusinessEmail}
              type="email"
              hint={
                isClaim
                  ? `Must be @${check.requiredEmailDomain} — verification goes here only`
                  : "Company domain email required (not Gmail/Yahoo). Verification goes here only."
              }
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="jd-btn-primary rounded px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send verification to business email"}
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
        Required for every listing. We check if this profile is already published on our site.
      </p>
      <input
        type="text"
        inputMode="url"
        required
        value={gbpUrl}
        onChange={(e) => setGbpUrl(e.target.value)}
        placeholder="https://www.google.com/maps/place/..."
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
