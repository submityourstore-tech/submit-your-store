import { revalidateTag } from "next/cache";
import { getSeedVoteCounts, type BusinessVoteRecord, type VoteChoice } from "@/lib/business-votes.server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function castBusinessVote(input: {
  businessId: string;
  userId: string;
  choice: VoteChoice;
}): Promise<BusinessVoteRecord> {
  const supabase = createSupabaseAdmin();
  const { data: existing } = await supabase
    .from("business_votes")
    .select("upvotes, downvotes, voters")
    .eq("business_id", input.businessId)
    .maybeSingle();

  const seed = getSeedVoteCounts(input.businessId);
  const record: BusinessVoteRecord = existing
    ? {
        upvotes: existing.upvotes,
        downvotes: existing.downvotes,
        voters: (existing.voters as Record<string, VoteChoice>) ?? {},
      }
    : { ...seed, voters: {} };

  if (record.voters[input.userId]) {
    throw new Error("ALREADY_VOTED");
  }

  if (input.choice === "up") record.upvotes += 1;
  else record.downvotes += 1;

  record.voters[input.userId] = input.choice;

  const { error } = await supabase.from("business_votes").upsert(
    {
      business_id: input.businessId,
      upvotes: record.upvotes,
      downvotes: record.downvotes,
      voters: record.voters,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "business_id" },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidateTag("business-votes");
  return record;
}
