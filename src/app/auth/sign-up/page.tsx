"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthForms } from "@/components/AuthForms";
import { useAuth } from "@/components/AuthProvider";
import type { PublicUser } from "@/types/user";

export default function SignUpPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifyNotice, setVerifyNotice] = useState("");
  const [devVerifyUrl, setDevVerifyUrl] = useState<string | null>(null);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setVerifyNotice("");
    setDevVerifyUrl(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json()) as {
        user?: PublicUser;
        error?: string;
        verificationSent?: boolean;
        devVerifyUrl?: string;
        verificationError?: string;
      };
      if (!res.ok || !data.user) {
        setError(data.error ?? "Could not create account.");
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created. Please sign in.");
        router.push("/auth/sign-in");
        return;
      }

      setUser(data.user);
      if (data.verificationSent) {
        setVerifyNotice(`We sent a verification link to ${email}. Check your inbox (and spam).`);
      } else if (data.verificationError) {
        setVerifyNotice(
          `Account created, but we could not send the verification email. Try signing in with Google or contact support.`,
        );
      }
      if (data.devVerifyUrl) setDevVerifyUrl(data.devVerifyUrl);
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-[#111]">Create an account</h1>
      <p className="mt-2 text-sm text-[#717171]">
        Use Google or register with any email for reviews and votes.
      </p>

      <div className="mt-6 rounded border border-[#e0e0e0] bg-white p-6 shadow-sm">
        <AuthForms
          callbackUrl="/"
          onSuccess={(user) => {
            setUser(user);
            router.push("/");
            router.refresh();
          }}
        />

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e0e0e0]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-[#717171]">or register with email</span>
          </div>
        </div>

        <form onSubmit={handleSignUp} className="space-y-3">
          <label className="block text-sm">
            <span className="font-medium text-[#333]">Your name</span>
            <input
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[#333]">Email</span>
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
          {verifyNotice && (
            <p className="rounded border border-[#1274c0]/30 bg-[#f0f7fd] px-3 py-2 text-sm text-[#1274c0]">
              {verifyNotice}
              {devVerifyUrl && (
                <a href={devVerifyUrl} className="mt-2 block break-all underline">
                  Dev verify link
                </a>
              )}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="jd-btn-primary w-full rounded py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Please wait…" : "Create account"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-[#717171]">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="font-semibold text-[#1274c0] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
