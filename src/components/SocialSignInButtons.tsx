"use client";

import { signIn } from "next-auth/react";

type SocialSignInButtonsProps = {
  callbackUrl?: string;
  onBeforeRedirect?: () => void;
};

export function SocialSignInButtons({ callbackUrl, onBeforeRedirect }: SocialSignInButtonsProps) {
  const url = callbackUrl ?? (typeof window !== "undefined" ? window.location.href : "/");

  function start(provider: "google" | "facebook" | "twitter") {
    onBeforeRedirect?.();
    void signIn(provider, { callbackUrl: url });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => start("google")}
        className="flex w-full items-center justify-center gap-2 rounded border border-[#ccc] bg-white py-2.5 text-sm font-semibold text-[#333] hover:bg-[#fafafa]"
      >
        <span aria-hidden className="text-lg">
          G
        </span>
        Continue with Google
      </button>
      <button
        type="button"
        onClick={() => start("facebook")}
        className="flex w-full items-center justify-center gap-2 rounded border border-[#1877f2] bg-[#1877f2] py-2.5 text-sm font-semibold text-white hover:bg-[#166fe5]"
      >
        <span aria-hidden className="text-lg">
          f
        </span>
        Continue with Facebook
      </button>
      <button
        type="button"
        onClick={() => start("twitter")}
        className="flex w-full items-center justify-center gap-2 rounded border border-[#111] bg-[#111] py-2.5 text-sm font-semibold text-white hover:bg-[#333]"
      >
        <span aria-hidden className="text-lg">
          𝕏
        </span>
        Continue with X (Twitter)
      </button>
      <p className="text-center text-xs text-[#717171]">
        Social sign-in verifies your identity and uses your profile photo on reviews.
      </p>
    </div>
  );
}
