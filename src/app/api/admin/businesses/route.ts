import { NextResponse } from "next/server";
import { readBusinesses } from "@/lib/businesses-data";
import { isAdminSession } from "@/lib/admin-auth.server";

export async function GET(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";

  const businesses = await readBusinesses();
  const filtered = q
    ? businesses.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q) ||
          (b.email?.toLowerCase().includes(q) ?? false) ||
          (b.googleMapsUrl?.toLowerCase().includes(q) ?? false),
      )
    : businesses;

  const rows = filtered
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((b) => ({
      id: b.id,
      name: b.name,
      city: b.city,
      state: b.state,
      category: b.category,
      status: b.status ?? "active",
      phone: b.phone,
      email: b.email,
      updatedAt: null,
    }));

  return NextResponse.json({
    total: rows.length,
    businesses: rows,
  });
}
