"use client";

import { useEffect, useState } from "react";
import { AuthForms } from "@/components/AuthForms";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: "sign-in" | "sign-up";
  message?: string;
  callbackUrl?: string;
  onBeforeSocialRedirect?: () => void;
};

export function AuthModal({
  open,
  onClose,
  onSuccess,
  initialMode = "sign-in",
  message,
  callbackUrl,
  onBeforeSocialRedirect,
}: AuthModalProps) {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

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
        aria-label="Close"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-[#e0e0e0] bg-white p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-xl leading-none text-[#999] hover:text-[#333]"
          aria-label="Close dialog"
        >
          ×
        </button>

        <h2 id="auth-modal-title" className="pr-8 text-lg font-bold text-[#111]">
          Sign in to review
        </h2>
        {message && <p className="mt-2 text-sm text-[#555]">{message}</p>}

        <div className="mt-4">
          <AuthForms
            mode={mode}
            onModeChange={setMode}
            compact
            callbackUrl={callbackUrl}
            onBeforeSocialRedirect={onBeforeSocialRedirect}
            onSuccess={() => onSuccess()}
          />
        </div>
      </div>
    </div>
  );
}
