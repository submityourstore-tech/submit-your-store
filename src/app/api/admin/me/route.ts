import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth.server";

export async function GET() {
  return NextResponse.json({ admin: await isAdminSession() });
}
