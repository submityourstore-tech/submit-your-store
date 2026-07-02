"use client";

import { AuthProvider } from "@/components/AuthProvider";
import { ListingChatbot } from "@/components/ListingChatbot";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <ListingChatbot />
    </AuthProvider>
  );
}
