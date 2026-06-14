import type { Business } from "@/types/business";
import { formatDisplayAddress } from "@/lib/address";
import { getTimezoneForCity, getTimezoneLabel, hasValidPhone, whatsAppUrl } from "@/lib/city-timezone";
import { SocialIconLinks } from "@/components/SocialIcons";
import type { SocialLinks } from "@/types/business";

type BusinessContactSectionProps = {
  business: Business;
  displayAddress: string;
  socialLinks: SocialLinks;
  hasSocial: boolean;
};

export function BusinessContactSection({
  business,
  displayAddress,
  socialLinks,
  hasSocial,
}: BusinessContactSectionProps) {
  const timeZone = business.timezone ?? getTimezoneForCity(business.city, business.state);
  const directionsUrl =
    business.googleMapsUrl ??
    (business.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`
      : null);

  return (
    <section className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="rounded border border-[#e0e0e0] bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-[#1274c0]">📍 Contact & Location</h2>
        <p className="mt-1 text-xs text-[#717171]">
          Local time zone: {getTimezoneLabel(timeZone)}
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#333]">
          {displayAddress && (
            <li>
              <span className="font-semibold">Office:</span> {displayAddress}
            </li>
          )}
          {hasValidPhone(business.phone) && (
            <li>
              <span className="font-semibold">Phone:</span>{" "}
              <a href={`tel:${business.phone}`} className="font-semibold text-[#25a244] hover:underline">
                {business.phone}
              </a>
            </li>
          )}
          {business.email && (
            <li>
              <span className="font-semibold">Email:</span>{" "}
              <a href={`mailto:${business.email}`} className="text-[#1274c0] hover:underline">
                {business.email}
              </a>
            </li>
          )}
          {business.website && (
            <li>
              <span className="font-semibold">Website:</span>{" "}
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1274c0] hover:underline"
              >
                Visit website ↗
              </a>
            </li>
          )}
        </ul>

        <div className="mt-4 flex flex-wrap gap-2">
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="jd-btn-primary inline-flex items-center gap-1.5 rounded px-4 py-2.5 text-sm font-semibold"
            >
              🧭 Get Directions
            </a>
          )}
          {hasValidPhone(business.phone) && (
            <>
              <a
                href={`tel:${business.phone}`}
                className="jd-btn-call inline-flex items-center gap-1.5 rounded px-4 py-2.5 text-sm font-semibold"
              >
                📞 Call Now
              </a>
              <a
                href={whatsAppUrl(business.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded border border-[#25a244] px-4 py-2.5 text-sm font-semibold text-[#25a244] hover:bg-[#f0fdf4]"
              >
                💬 WhatsApp
              </a>
            </>
          )}
        </div>
      </div>

      {hasSocial && (
        <div className="rounded border border-[#e0e0e0] bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-[#1274c0]">🔗 Follow Us</h2>
          <SocialIconLinks social={socialLinks} className="mt-4" />
        </div>
      )}
    </section>
  );
}
