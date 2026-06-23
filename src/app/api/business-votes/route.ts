import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { castBusinessVote } from "@/lib/business-votes-write";
import { getBusinessById } from "@/lib/businesses";
import { getCurrentUser } from "@/lib/user-auth.server";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Sign in to vote for a business.", requiresAuth: true },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { businessId?: string; choice?: string };
    const businessId = body.businessId?.trim() ?? "";
    const choice = body.choice;

    if (!businessId) {
      return NextResponse.json({ error: "Business ID is required." }, { status: 400 });
    }
    if (choice !== "up" && choice !== "down") {
      return NextResponse.json({ error: "Vote must be up or down." }, { status: 400 });
    }

    const business = await getBusinessById(businessId);
    if (!business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    const record = await castBusinessVote({ businessId, userId: user.id, choice });

    revalidatePath(`/business/${businessId}`);
    revalidatePath("/blog");

    return NextResponse.json({
      upvotes: record.upvotes,
      downvotes: record.downvotes,
      userVote: choice,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "ALREADY_VOTED") {
      return NextResponse.json({ error: "You have already voted for this business." }, { status: 409 });
    }
    console.error("Vote failed:", err);
    return NextResponse.json({ error: "Could not record vote." }, { status: 500 });
  }
}
