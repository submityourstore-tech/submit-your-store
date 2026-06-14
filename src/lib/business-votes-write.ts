import { readFileSync, writeFileSync } from "fs";
import path from "path";
import type { BusinessVoteRecord, VoteChoice } from "@/lib/business-votes.server";
import { getSeedVoteCounts } from "@/lib/business-votes.server";

type VotesStore = { votes: Record<string, BusinessVoteRecord> };

const JSON_PATH = path.join(process.cwd(), "data", "business-votes.json");

function readStore(): VotesStore {
  return JSON.parse(readFileSync(JSON_PATH, "utf-8")) as VotesStore;
}

function writeStore(store: VotesStore): void {
  writeFileSync(JSON_PATH, JSON.stringify(store, null, 2) + "\n", "utf-8");
}

function ensureRecord(store: VotesStore, businessId: string): BusinessVoteRecord {
  if (!store.votes[businessId]) {
    const seed = getSeedVoteCounts(businessId);
    store.votes[businessId] = { ...seed, voters: {} };
  }
  return store.votes[businessId];
}

export function castBusinessVote(input: {
  businessId: string;
  userId: string;
  choice: VoteChoice;
}): BusinessVoteRecord {
  const store = readStore();
  const record = ensureRecord(store, input.businessId);

  if (record.voters[input.userId]) {
    throw new Error("ALREADY_VOTED");
  }

  if (input.choice === "up") record.upvotes += 1;
  else record.downvotes += 1;

  record.voters[input.userId] = input.choice;
  writeStore(store);
  return record;
}
