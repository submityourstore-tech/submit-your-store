"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { UserAvatar } from "@/components/UserAvatar";

export function SiteHeaderAuth() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <span className="text-sm text-[#999]">…</span>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link href={`/members/${user.id}`} className="hidden items-center gap-2 sm:flex hover:opacity-90">
          <UserAvatar name={user.name} image={user.image} size="sm" verified={user.emailVerified} />
          <span className="text-sm text-[#555]">
            Hi, <span className="font-semibold text-[#1274c0]">{user.name.split(" ")[0]}</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className="text-sm font-medium text-[#333] hover:text-[#1274c0]"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link href="/auth/sign-in" className="hover:text-[#1274c0]">
      Login / Sign Up
    </Link>
  );
}
