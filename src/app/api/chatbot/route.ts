import { NextResponse } from "next/server";
import { processListingChat, type ChatInput } from "@/lib/listing-chatbot";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatInput;
    const reply = processListingChat(body);
    return NextResponse.json(reply);
  } catch (err) {
    console.error("Chatbot failed:", err);
    return NextResponse.json(
      {
        messages: ["Something went wrong. Please try again or contact us on WhatsApp."],
        step: "welcome",
        draft: {},
        inputType: "none",
      },
      { status: 500 },
    );
  }
}
