"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { SocialSignInButtons } from "@/components/SocialSignInButtons";
import type { PublicUser } from "@/types/user";

type AuthFormsProps = {
  callbackUrl?: string;
  onBeforeSocialRedirect?: () => void;
  onSuccess?: (user: PublicUser) => void;
  compact?: boolean;
};

export function AuthForms({
  callbackUrl,
  onBeforeSocialRedirect,
  onSuccess,
  compact,
}: AuthFormsProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      const me = await fetch("/api/auth/me");
      const meData = (await me.json()) as { user?: PublicUser | null };
      if (meData.user) {
        onSuccess?.(meData.user);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <SocialSignInButtons callbackUrl={callbackUrl} onBeforeRedirect={onBeforeSocialRedirect} />

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e0e0e0]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-[#717171]">or use email</span>
        </div>
      </div>

      <form onSubmit={handleEmailSignIn} className={`space-y-3 ${compact ? "" : ""}`}>
        <label className="block text-sm">
          <span className="font-medium text-[#333]">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gmail.com"
            className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-[#333]">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="jd-btn-primary w-full rounded py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Please wait…" : "Sign in with email"}
        </button>
      </form>

      <p className="mt-3 text-center text-xs text-[#717171]">
        New here?{" "}
        <a href="/auth/sign-up" className="font-semibold text-[#1274c0] hover:underline">
          Create an account
        </a>
      </p>
    </div>
  );
}
