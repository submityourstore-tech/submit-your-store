"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie-consent";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setShow(true);
  }, []);

  function respond(value: "accepted" | "declined") {
    localStorage.setItem(STORAGE_KEY, value);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e0e0e0] bg-white px-4 py-4 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm leading-relaxed text-[#333]">
          We use cookies to improve your experience. By continuing to use this site, you agree to
          our{" "}
          <Link href="/cookie-policy" className="font-medium text-[#1274c0] underline hover:text-[#0e5fa0]">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => respond("declined")}
            className="rounded-lg border border-[#e0e0e0] px-5 py-2 text-sm font-medium text-[#333] transition-colors hover:bg-[#f7f7f7]"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => respond("accepted")}
            className="rounded-lg bg-[#1274c0] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0e5fa0]"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
