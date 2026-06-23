import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getBusinessById } from "@/lib/businesses";
import {
  deleteAdminBusiness,
  updateAdminBusiness,
  type AdminBusinessUpdateInput,
} from "@/lib/businesses-write";
import { isAdminSession } from "@/lib/admin-auth.server";
import { DuplicateGbpError } from "@/lib/gbp";
import { revalidateBusinessListingPaths } from "@/lib/revalidate-paths";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const business = await getBusinessById(id);
  if (!business) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }

  return NextResponse.json({ business });
}

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as AdminBusinessUpdateInput;
    const business = await updateAdminBusiness(id, body);

    revalidateBusinessListingPaths(business);
    revalidatePath(`/business/${business.id}`);
    revalidatePath("/listings");
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ success: true, business });
  } catch (err) {
    if (err instanceof DuplicateGbpError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("Admin business update failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getBusinessById(id);
  if (!existing) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }

  try {
    await deleteAdminBusiness(id);
    revalidateBusinessListingPaths(existing);
    revalidatePath(`/business/${id}`);
    revalidatePath("/listings");
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/dashboard");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin business delete failed:", err);
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}
