import { revalidateTag } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type { BlogComment } from "@/lib/blog-comments.server";

export async function addBlogComment(input: {
  blogSlug: string;
  userId: string;
  userName: string;
  body: string;
}): Promise<BlogComment> {
  const body = input.body.trim();
  if (body.length < 3) throw new Error("Comment too short.");

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("blog_comments")
    .insert({
      blog_slug: input.blogSlug,
      user_id: input.userId,
      user_name: input.userName.trim(),
      body,
    })
    .select("id, blog_slug, user_id, user_name, body, created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not save comment.");
  }

  revalidateTag("blog-comments");
  revalidateTag(`blog-comments-${input.blogSlug}`);

  return {
    id: data.id,
    blogSlug: data.blog_slug,
    userId: data.user_id,
    userName: data.user_name,
    body: data.body,
    createdAt: data.created_at,
  };
}
