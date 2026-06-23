import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type BlogComment = {
  id: string;
  blogSlug: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: string;
};

type BlogCommentRow = {
  id: string;
  blog_slug: string;
  user_id: string;
  user_name: string;
  body: string;
  created_at: string;
};

function mapRow(row: BlogCommentRow): BlogComment {
  return {
    id: row.id,
    blogSlug: row.blog_slug,
    userId: row.user_id,
    userName: row.user_name,
    body: row.body,
    createdAt: row.created_at,
  };
}

async function fetchCommentsForBlog(blogSlug: string): Promise<BlogComment[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("blog_comments")
    .select("id, blog_slug, user_id, user_name, body, created_at")
    .eq("blog_slug", blogSlug)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.message.includes("Could not find the table")) return [];
    throw new Error(`Failed to load blog comments: ${error.message}`);
  }

  return ((data ?? []) as BlogCommentRow[]).map(mapRow);
}

const getCachedComments = (blogSlug: string) =>
  unstable_cache(() => fetchCommentsForBlog(blogSlug), ["blog-comments", blogSlug], {
    revalidate: 60,
    tags: ["blog-comments", `blog-comments-${blogSlug}`],
  });

export const getCommentsForBlog = cache(async (blogSlug: string): Promise<BlogComment[]> => {
  return getCachedComments(blogSlug)();
});
