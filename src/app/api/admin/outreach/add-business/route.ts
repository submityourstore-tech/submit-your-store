import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth.server";
import { publishAdminBusiness } from "@/lib/businesses-write";
import { revalidateBusinessListingPaths } from "@/lib/revalidate-paths";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      businessName?: string;
      email?: string;
      gbpUrl?: string;
      city?: string;
      state?: string;
      phone?: string;
      website?: string;
      description?: string;
    };

    if (!body.businessName?.trim()) {
      return NextResponse.json({ error: "Business name is required." }, { status: 400 });
    }
    if (!body.email?.trim()) {
      return NextResponse.json({ error: "Business email is required for outreach." }, { status: 400 });
    }

    const business = await publishAdminBusiness({
      businessName: body.businessName.trim(),
      email: body.email.trim(),
      gbpUrl: body.gbpUrl?.trim(),
      city: body.city?.trim() || "Dallas",
      state: body.state?.trim() || "TX",
      phone: body.phone?.trim() || "(000) 000-0000",
      website: body.website?.trim(),
      description: body.description?.trim(),
      claimStatus: "unclaimed",
    });

    revalidateBusinessListingPaths(business);
    revalidatePath("/admin/outreach");
    revalidatePath("/admin/dashboard");

    return NextResponse.json({
      success: true,
      business: {
        id: business.id,
        name: business.name,
        email: business.email,
        claimUrl: `/claim/${business.id}`,
        businessUrl: `/business/${business.id}`,
      },
    });
  } catch (err) {
    console.error("Outreach add business failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not add business." },
      { status: 500 },
    );
  }
}
