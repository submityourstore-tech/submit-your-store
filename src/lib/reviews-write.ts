import { randomUUID } from "crypto";
import { revalidateTag } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type { SiteReview } from "@/types/business";

export async function addReview(input: {
  businessId: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  emailVerified?: boolean;
  rating: number;
  title?: string;
  body?: string;
}): Promise<SiteReview> {
  const title = input.title?.trim() ?? "";
  const body = input.body?.trim() ?? "";
  const supabase = createSupabaseAdmin();

  const { data: existing } = await supabase
    .from("site_reviews")
    .select("id")
    .eq("business_id", input.businessId)
    .eq("user_id", input.userId)
    .maybeSingle();

  const id = existing?.id ?? randomUUID();
  const row = {
    id,
    business_id: input.businessId,
    user_id: input.userId,
    user_name: input.userName.trim(),
    user_image: input.userImage ?? null,
    email_verified: input.emailVerified ?? false,
    rating: input.rating,
    title,
    body,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("site_reviews").upsert(row, { onConflict: "id" }).select().single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not save review.");
  }

  revalidateTag("site-reviews");

  return {
    id: data.id,
    businessId: data.business_id,
    userId: data.user_id ?? undefined,
    userName: data.user_name,
    userImage: data.user_image,
    emailVerified: data.email_verified,
    rating: data.rating,
    title: data.title,
    body: data.body,
    createdAt: data.created_at,
  };
}
