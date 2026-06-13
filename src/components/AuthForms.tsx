"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { SocialSignInButtons } from "@/components/SocialSignInButtons";
import type { PublicUser } from "@/types/user";

type AuthMode = "sign-in" | "sign-up";

type AuthFormsProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onSuccess: (user: PublicUser) => void;
  compact?: boolean;
  callbackUrl?: string;
  onBeforeSocialRedirect?: () => void;
};

export function AuthForms({
  mode,
  onModeChange,
  onSuccess,
  compact,
  callbackUrl,
  onBeforeSocialRedirect,
}: AuthFormsProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "sign-up") {
        const res = await fetch("/api/auth/sign-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = (await res.json()) as { user?: PublicUser; error?: string };
        if (!res.ok || !data.user) {
          setError(data.error ?? "Something went wrong.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(mode === "sign-up" ? "Account created but sign-in failed." : "Invalid email or password.");
        return;
      }

      const me = await fetch("/api/auth/me");
      const meData = (await me.json()) as { user?: PublicUser | null };
      if (meData.user) {
        onSuccess(meData.user);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2 border-b border-[#e0e0e0]">
        <button
          type="button"
          onClick={() => {
            onModeChange("sign-in");
            setError("");
          }}
          className={`flex-1 border-b-2 py-2.5 text-sm font-semibold ${
            mode === "sign-in"
              ? "border-[#1274c0] text-[#1274c0]"
              : "border-transparent text-[#717171]"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            onModeChange("sign-up");
            setError("");
          }}
          className={`flex-1 border-b-2 py-2.5 text-sm font-semibold ${
            mode === "sign-up"
              ? "border-[#1274c0] text-[#1274c0]"
              : "border-transparent text-[#717171]"
          }`}
        >
          Create account
        </button>
      </div>

      <div className={compact ? "mt-4" : "mt-6"}>
        <SocialSignInButtons callbackUrl={callbackUrl} onBeforeRedirect={onBeforeSocialRedirect} />
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e0e0e0]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-[#717171]">or use email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "sign-up" && (
          <label className="block text-sm">
            <span className="font-medium text-[#333]">Your name *</span>
            <input
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
            />
          </label>
        )}

        <label className="block text-sm">
          <span className="font-medium text-[#333]">Email *</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Gmail, Yahoo, or any email"
            className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-[#333]">Password *</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
          />
          {mode === "sign-up" && (
            <span className="mt-1 block text-xs text-[#717171]">At least 6 characters</span>
          )}
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="jd-btn-primary w-full rounded py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Please wait…" : mode === "sign-up" ? "Create account" : "Sign in"}
        </button>
      </form>

      {mode === "sign-up" && (
        <p className="mt-3 text-xs text-[#717171]">
          Email accounts are for reviews. To list a business, use{" "}
          <a href="/list-your-business" className="font-semibold text-[#1274c0] hover:underline">
            Free Listing
          </a>{" "}
          with your company domain email.
        </p>
      )}
    </div>
  );
}
