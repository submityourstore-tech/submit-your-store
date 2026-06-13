import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyListingForm } from "@/components/VerifyListingForm";

export const metadata: Metadata = {
  title: "Verify Business Email",
};

export default function VerifyListingPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Suspense fallback={<p className="text-sm text-[#717171]">Loading…</p>}>
        <VerifyListingForm />
      </Suspense>
    </div>
  );
}
