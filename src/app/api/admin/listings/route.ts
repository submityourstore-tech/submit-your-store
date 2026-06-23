import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/admin-auth.server";
import { publishAdminBusiness, type AdminBusinessInput } from "@/lib/businesses-write";
import { DuplicateGbpError } from "@/lib/gbp";
import { revalidateBusinessListingPaths } from "@/lib/revalidate-paths";

export const maxDuration = 120;

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as AdminBusinessInput;
    if (!body.businessName?.trim()) {
      return NextResponse.json({ error: "Business name is required." }, { status: 400 });
    }

    const business = await publishAdminBusiness(body);

    revalidateBusinessListingPaths(business);
    revalidatePath(`/business/${business.id}`);
    revalidatePath("/listings");
    revalidatePath("/sitemap.xml");
    revalidatePath("/blog");

    return NextResponse.json({
      success: true,
      businessId: business.id,
      businessUrl: `/business/${business.id}`,
      message: "Listing published.",
    });
  } catch (err) {
    console.error("Admin listing publish failed:", err);
    if (err instanceof DuplicateGbpError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Could not publish listing.",
      },
      { status: 500 },
    );
  }
}
