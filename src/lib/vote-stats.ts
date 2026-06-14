export function votePercentages(upvotes: number, downvotes: number) {
  const total = upvotes + downvotes;
  if (total === 0) return { upPct: 0, downPct: 0, total: 0 };
  const upPct = Math.round((upvotes / total) * 100);
  return { upPct, downPct: 100 - upPct, total };
}
