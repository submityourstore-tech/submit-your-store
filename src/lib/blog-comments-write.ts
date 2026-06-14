import { randomUUID } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import type { BlogComment } from "@/lib/blog-comments.server";

type CommentsStore = { comments: BlogComment[] };

const JSON_PATH = path.join(process.cwd(), "data", "blog-comments.json");

function readStore(): CommentsStore {
  return JSON.parse(readFileSync(JSON_PATH, "utf-8")) as CommentsStore;
}

function writeStore(store: CommentsStore): void {
  writeFileSync(JSON_PATH, JSON.stringify(store, null, 2) + "\n", "utf-8");
}

export function addBlogComment(input: {
  blogSlug: string;
  userId: string;
  userName: string;
  body: string;
}): BlogComment {
  const body = input.body.trim();
  if (body.length < 3) throw new Error("Comment too short.");

  const store = readStore();
  const comment: BlogComment = {
    id: randomUUID(),
    blogSlug: input.blogSlug,
    userId: input.userId,
    userName: input.userName.trim(),
    body,
    createdAt: new Date().toISOString(),
  };
  store.comments.push(comment);
  writeStore(store);
  return comment;
}
