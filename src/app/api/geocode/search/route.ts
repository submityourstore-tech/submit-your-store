import { NextResponse } from "next/server";
import { searchAddresses } from "@/lib/geocode";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (q.trim().length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchAddresses(q);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Address search unavailable." }, { status: 502 });
  }
}
