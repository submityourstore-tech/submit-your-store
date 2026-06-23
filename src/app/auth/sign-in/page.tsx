"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForms } from "@/components/AuthForms";
import { useAuth } from "@/components/AuthProvider";

export default function SignInPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-[#111]">Sign in</h1>
      <p className="mt-2 text-sm text-[#717171]">
        Sign in with Google or your email to rate, review, and vote on local businesses.
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
      </div>

      <p className="mt-6 text-center text-sm text-[#717171]">
        <Link href="/" className="font-semibold text-[#1274c0] hover:underline">
          ← Back home
        </Link>
      </p>
    </div>
  );
}
