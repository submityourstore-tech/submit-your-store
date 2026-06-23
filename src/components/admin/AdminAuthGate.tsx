"use client";

import { useEffect, useState } from "react";

type AdminAuthGateProps = {
  children: React.ReactNode;
};

export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d: { admin?: boolean }) => setAuthed(Boolean(d.admin)))
      .catch(() => setAuthed(false));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Wrong admin password.");
        return;
      }
      setAuthed(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  }

  if (authed === null) {
    return <p className="text-sm text-[#717171]">Checking admin access…</p>;
  }

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md items-center px-4 py-12">
        <form onSubmit={handleLogin} className="w-full space-y-3 rounded border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-[#111]">Admin sign in</h1>
          <p className="text-sm text-[#717171]">Submit Your Store admin panel</p>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full rounded border border-[#ccc] px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="jd-btn-primary w-full rounded py-2 text-sm font-semibold">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div data-admin-authed>
      <div className="hidden" aria-hidden data-logout-hook={String(handleLogout)} />
      {children}
    </div>
  );
}

export function useAdminLogout() {
  return async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin";
  };
}
