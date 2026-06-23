"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";

function VerifyAccountInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { update } = useSession();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification link.");
      return;
    }

    void (async () => {
      try {
        const res = await fetch("/api/auth/verify-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = (await res.json()) as { error?: string; success?: boolean };
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error ?? "Verification failed.");
          return;
        }
        await update();
        setStatus("ok");
        setTimeout(() => router.push("/"), 2000);
      } catch {
        setStatus("error");
        setMessage("Network error. Try again.");
      }
    })();
  }, [token, update, router]);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      {status === "loading" && <p className="text-sm text-[#717171]">Verifying your email…</p>}
      {status === "ok" && (
        <>
          <p className="text-lg font-bold text-[#25a244]">Email verified!</p>
          <p className="mt-2 text-sm text-[#555]">Redirecting you to the homepage…</p>
        </>
      )}
      {status === "error" && (
        <>
          <p className="text-lg font-bold text-red-600">Verification failed</p>
          <p className="mt-2 text-sm text-[#555]">{message}</p>
          <Link href="/auth/sign-in" className="mt-4 inline-block text-[#1274c0] hover:underline">
            Back to sign in
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyAccountPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-center text-sm text-[#717171]">Loading…</p>}>
      <VerifyAccountInner />
    </Suspense>
  );
}
