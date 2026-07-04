"use client";

import { AuthProvider } from "@/components/AuthProvider";
import { ListingChatbot } from "@/components/ListingChatbot";
import { ThemeProvider } from "@/components/ThemeProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <ListingChatbot />
      </AuthProvider>
    </ThemeProvider>
  );
}
