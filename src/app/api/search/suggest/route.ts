import { NextResponse } from "next/server";
import { getSearchSuggestions } from "@/lib/search-suggest.server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await getSearchSuggestions(q);
    return NextResponse.json(
      { suggestions },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
    );
  } catch (err) {
    console.error("Search suggest failed:", err);
    return NextResponse.json({ suggestions: [] });
  }
}
