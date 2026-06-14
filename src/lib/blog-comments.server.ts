import { readFileSync } from "fs";
import path from "path";

export type BlogComment = {
  id: string;
  blogSlug: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: string;
};

type CommentsStore = { comments: BlogComment[] };

const JSON_PATH = path.join(process.cwd(), "data", "blog-comments.json");

function loadComments(): BlogComment[] {
  const data = JSON.parse(readFileSync(JSON_PATH, "utf-8")) as CommentsStore;
  return data.comments;
}

export function getCommentsForBlog(blogSlug: string): BlogComment[] {
  return loadComments()
    .filter((c) => c.blogSlug === blogSlug)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
