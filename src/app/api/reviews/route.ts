import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getBusinessById } from "@/lib/businesses";
import { revalidateBusinessListingPaths } from "@/lib/revalidate-paths";
import { getCurrentUser } from "@/lib/user-auth.server";
import { getReviewSummary } from "@/lib/reviews.server";
import { addReview } from "@/lib/reviews-write";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Sign in or create an account to post a review.", requiresAuth: true },
        { status: 401 },
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error:
            "Use Google, Facebook, or X to sign in so your identity is verified before posting a review.",
          requiresVerified: true,
        },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      businessId?: string;
      rating?: number;
      title?: string;
      body?: string;
    };

    const businessId = body.businessId?.trim() ?? "";
    const rating = body.rating;

    if (!businessId) {
      return NextResponse.json({ error: "Business ID is required." }, { status: 400 });
    }
    const business = getBusinessById(businessId);
    if (!business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }
    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Select a rating from 1 to 5 stars." }, { status: 400 });
    }

    const review = addReview({
      businessId,
      userId: user.id,
      userName: user.name,
      userImage: user.image,
      emailVerified: user.emailVerified,
      rating,
      title: body.title,
      body: body.body,
    });

    revalidatePath(`/business/${businessId}`);
    revalidateBusinessListingPaths(business);

    const summary = getReviewSummary(businessId);

    return NextResponse.json({ review, summary });
  } catch (err) {
    console.error("Review submit failed:", err);
    return NextResponse.json({ error: "Could not save your review. Try again." }, { status: 500 });
  }
}
