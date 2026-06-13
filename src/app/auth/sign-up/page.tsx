"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForms } from "@/components/AuthForms";
import { useAuth } from "@/components/AuthProvider";

export default function SignUpPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-[#111]">Create an account</h1>
      <p className="mt-2 text-sm text-[#717171]">
        Free member account for reviews and ratings. Use any email — Gmail, Yahoo, Outlook, etc.
      </p>

      <div className="mt-6 rounded border border-[#e0e0e0] bg-white p-6 shadow-sm">
        <AuthForms
          mode="sign-up"
          onModeChange={(mode) => {
            if (mode === "sign-in") router.push("/auth/sign-in");
          }}
          onSuccess={(user) => {
            setUser(user);
            router.push("/");
            router.refresh();
          }}
        />
      </div>

      <p className="mt-4 text-center text-sm text-[#717171]">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="font-semibold text-[#1274c0] hover:underline">
          Sign in
        </Link>
      </p>

      <div className="mt-8 rounded border border-[#ff6c00] bg-[#fff4eb] p-4 text-sm text-[#555]">
        <strong className="text-[#b45309]">Listing your business?</strong>{" "}
        Member sign-up is for reviews only. To add or claim a business listing, use{" "}
        <Link href="/list-your-business" className="font-semibold text-[#1274c0] hover:underline">
          Free Listing
        </Link>{" "}
        with your company domain email.
      </div>
    </div>
  );
}
