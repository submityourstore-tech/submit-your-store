import { BlogBusinessCard } from "@/components/BlogBusinessCard";
import type { VoteChoice } from "@/lib/business-votes.server";
import type { Business } from "@/types/business";

type BlogRankedBusinessCardProps = {
  business: Business;
  rank: number;
  city: string;
  upvotes: number;
  downvotes: number;
  userVote?: VoteChoice | null;
};

export function BlogRankedBusinessCard(props: BlogRankedBusinessCardProps) {
  return (
    <BlogBusinessCard
      business={props.business}
      rank={props.rank}
      city={props.city}
      initialUpvotes={props.upvotes}
      initialDownvotes={props.downvotes}
      initialUserVote={props.userVote}
    />
  );
}
