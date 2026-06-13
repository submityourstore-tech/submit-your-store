"use client";

import { SessionProvider, signOut, useSession } from "next-auth/react";
import { createContext, useCallback, useContext, useMemo } from "react";
import type { PublicUser } from "@/types/user";

type AuthContextValue = {
  user: PublicUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: PublicUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function sessionToUser(session: ReturnType<typeof useSession>["data"]): PublicUser | null {
  if (!session?.user?.id || !session.user.email || !session.user.name) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
    emailVerified: session.user.verified ?? false,
    provider: (session.user.provider as PublicUser["provider"]) ?? "credentials",
  };
}

function AuthContextInner({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const user = sessionToUser(session);
  const loading = status === "loading";

  const refresh = useCallback(async () => {
    await update();
  }, [update]);

  const handleSignOut = useCallback(async () => {
    await signOut({ redirect: false });
  }, []);

  const setUser = useCallback(() => {
    void update();
  }, [update]);

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,
      signOut: handleSignOut,
      setUser: setUser as AuthContextValue["setUser"],
    }),
    [user, loading, refresh, handleSignOut, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextInner>{children}</AuthContextInner>
    </SessionProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
