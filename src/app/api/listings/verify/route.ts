import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getBusinessById } from "@/lib/businesses";
import { publishNewListing, updateBusiness } from "@/lib/businesses-write";
import { revalidateBusinessListingPaths } from "@/lib/revalidate-paths";
import { sendManageAccessEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-config";
import { verifyListingToken } from "@/lib/listing-submit";
import { createManageSession } from "@/lib/listing-verification-store";

function persistenceErrorResponse(err: unknown) {
  console.error("Listing persistence failed:", err);
  const detail = err instanceof Error ? err.message : "Unknown persistence error";
  return NextResponse.json(
    {
      error:
        "We verified your email but could not save your listing. Storage is temporarily unavailable — please try again in a few minutes or contact support@submityourstore.com.",
      code: "PERSISTENCE_FAILED",
      detail: process.env.NODE_ENV === "development" ? detail : undefined,
    },
    { status: 503 },
  );
}

function isPersistenceFailure(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("supabase") ||
    msg.includes("read-only") ||
    msg.includes("ero") ||
    msg.includes("eacces") ||
    msg.includes("persist") ||
    msg.includes("failed to save business")
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    verificationId?: string;
    token?: string;
  };
  const verificationId = body.verificationId ?? body.token;

  if (!verificationId) {
    return NextResponse.json({ error: "Verification token is required." }, { status: 400 });
  }

  const result = await verifyListingToken(verificationId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const record = result.record;

  if (record.type === "new" && record.payload) {
    try {
      const business = await publishNewListing(record.payload);

      revalidateBusinessListingPaths(business);
      revalidatePath(`/business/${business.id}`);

      return NextResponse.json({
        success: true,
        type: "new",
        businessId: business.id,
        businessUrl: `/business/${business.id}`,
        message: "Business email verified. Your listing is now live!",
      });
    } catch (err) {
      if (isPersistenceFailure(err)) {
        return persistenceErrorResponse(err);
      }
      console.error("publishNewListing failed:", err);
      return NextResponse.json(
        {
          error: "Could not publish your listing. Please try again.",
          code: "PUBLISH_FAILED",
        },
        { status: 500 },
      );
    }
  }

  if (record.type === "claim" && record.businessId) {
    const business = await getBusinessById(record.businessId);
    const businessName = business?.name ?? "your business";

    await updateBusiness(record.businessId, { claimStatus: "claimed" });
    revalidatePath(`/business/${record.businessId}`);

    const { token } = createManageSession(record.businessId, record.businessEmail);
    const baseUrl = getSiteUrl();
    const manageUrl = `${baseUrl}/manage-listing/${record.businessId}?token=${token}`;

    if (record.businessEmail) {
      await sendManageAccessEmail({
        to: record.businessEmail,
        businessName,
        manageUrl,
      });
    }

    const cookieStore = await cookies();
    cookieStore.set(`manage_${record.businessId}`, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 86400,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      type: "claim",
      businessId: record.businessId,
      manageUrl,
      message: "Email verified. Manage access link sent to your business email.",
    });
  }

  return NextResponse.json({ error: "Unable to complete verification." }, { status: 400 });
}
