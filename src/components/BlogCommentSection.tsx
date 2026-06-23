"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import type { BlogComment } from "@/lib/blog-comments.server";

type BlogCommentSectionProps = {
  blogSlug: string;
  blogTitle: string;
  initialComments: BlogComment[];
};

export function BlogCommentSection({ blogSlug, blogTitle, initialComments }: BlogCommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setError("Sign in to leave a comment.");
      return;
    }
    const text = body.trim();
    if (text.length < 3) {
      setError("Write at least a few words.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blog-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogSlug, body: text }),
      });
      const data = (await res.json()) as { error?: string; comment?: BlogComment };
      if (!res.ok) {
        setError(data.error ?? "Could not post comment.");
        return;
      }
      if (data.comment) {
        setComments((prev) => [data.comment!, ...prev]);
        setBody("");
      }
    } catch {
      setError("Could not post comment. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10 rounded border border-[#e0e0e0] bg-[#fafafa] p-5">
      <h2 className="text-base font-bold text-[#1274c0]">💬 Comments</h2>
      <p className="mt-1 text-sm text-[#717171]">
        Share your experience with HVAC companies in this guide — helpful for other readers researching{" "}
        {blogTitle}.
      </p>

      <form onSubmit={submit} className="mt-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder={user ? "Add your comment…" : "Sign in to comment…"}
          disabled={!user || loading}
          className="w-full rounded border border-[#ddd] bg-white px-3 py-2 text-sm text-[#333] outline-none focus:border-[#1274c0]"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!user || loading}
            className="jd-btn-primary rounded px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "Posting…" : "Post comment"}
          </button>
          {!user && (
            <Link href="/auth/sign-in" className="text-sm font-semibold text-[#1274c0] hover:underline">
              Sign in to comment
            </Link>
          )}
        </div>
        {error && <p className="mt-2 text-xs text-[#c0392b]">{error}</p>}
      </form>

      {comments.length > 0 ? (
        <ul className="mt-5 space-y-3 border-t border-[#eee] pt-4">
          {comments.map((c) => (
            <li key={c.id} className="rounded border border-[#eee] bg-white p-3">
              <p className="text-xs font-semibold text-[#1274c0]">{c.userName}</p>
              <p className="mt-1 text-sm leading-relaxed text-[#555]">{c.body}</p>
              <p className="mt-1 text-xs text-[#999]">
                {new Date(c.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-[#717171]">No comments yet — be the first to share your thoughts.</p>
      )}
    </section>
  );
}
