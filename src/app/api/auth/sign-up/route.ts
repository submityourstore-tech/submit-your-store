import { NextResponse } from "next/server";
import { createUser } from "@/lib/user-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const result = createUser({
      name: body.name ?? "",
      email: body.email ?? "",
      password: body.password ?? "",
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ user: result.user });
  } catch (err) {
    console.error("Sign up failed:", err);
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }
}
