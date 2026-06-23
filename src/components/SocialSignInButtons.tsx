"use client";

import { signIn } from "next-auth/react";

type SocialSignInButtonsProps = {
  callbackUrl?: string;
  onBeforeRedirect?: () => void;
};

export function SocialSignInButtons({ callbackUrl, onBeforeRedirect }: SocialSignInButtonsProps) {
  const url = callbackUrl ?? (typeof window !== "undefined" ? window.location.href : "/");

  function startGoogle() {
    onBeforeRedirect?.();
    void signIn("google", { callbackUrl: url });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={startGoogle}
        className="flex w-full items-center justify-center gap-2 rounded border border-[#ccc] bg-white py-2.5 text-sm font-semibold text-[#333] hover:bg-[#fafafa]"
      >
        <span aria-hidden className="text-lg">
          G
        </span>
        Continue with Google
      </button>
      <p className="text-center text-xs text-[#717171]">
        Sign in with Google to verify your identity and use your profile photo on reviews.
      </p>
    </div>
  );
}
