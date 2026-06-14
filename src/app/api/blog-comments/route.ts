import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { addBlogComment } from "@/lib/blog-comments-write";
import { getBlogPost } from "@/lib/blogs.server";
import { getCurrentUser } from "@/lib/user-auth.server";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to comment.", requiresAuth: true }, { status: 401 });
    }

    const body = (await request.json()) as { blogSlug?: string; body?: string };
    const blogSlug = body.blogSlug?.trim() ?? "";
    const text = body.body?.trim() ?? "";

    if (!blogSlug) {
      return NextResponse.json({ error: "Blog slug is required." }, { status: 400 });
    }
    if (!getBlogPost(blogSlug)) {
      return NextResponse.json({ error: "Blog post not found." }, { status: 404 });
    }
    if (text.length < 3) {
      return NextResponse.json({ error: "Comment is too short." }, { status: 400 });
    }

    const comment = addBlogComment({
      blogSlug,
      userId: user.id,
      userName: user.name,
      body: text,
    });

    revalidatePath(`/blog/${blogSlug}`);

    return NextResponse.json({ comment });
  } catch (err) {
    console.error("Blog comment failed:", err);
    return NextResponse.json({ error: "Could not post comment." }, { status: 500 });
  }
}
