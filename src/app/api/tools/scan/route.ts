import { NextResponse } from "next/server";
import { runChecker } from "@/lib/checkers/runner";
import { getTool, isToolAvailable } from "@/lib/tools/registry";
import { TOOL_DAILY_LIMIT } from "@/constants/tools";

// Side-effect: load registered checkers
import "@/lib/checkers/load-checkers";

const usage = new Map<string, number>();

function clientKey(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anon"
  );
}

function checkLimit(key: string, tool: string): boolean {
  const id = `${key}:${tool}:${new Date().toISOString().slice(0, 10)}`;
  const count = usage.get(id) ?? 0;
  if (count >= TOOL_DAILY_LIMIT) return false;
  usage.set(id, count + 1);
  return true;
}

type ScanBody = {
  tool?: string;
  url?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ScanBody;
  const toolSlug = body.tool?.trim();
  const url = body.url?.trim();

  if (!toolSlug) {
    return NextResponse.json({ error: "Missing tool id." }, { status: 400 });
  }
  if (!url) {
    return NextResponse.json({ error: "Missing URL." }, { status: 400 });
  }

  const tool = getTool(toolSlug);
  if (!tool) {
    return NextResponse.json({ error: "Unknown tool." }, { status: 404 });
  }

  if (!isToolAvailable(toolSlug)) {
    return NextResponse.json(
      { error: "This tool is not available yet." },
      { status: 400 },
    );
  }

  if (!checkLimit(clientKey(request), toolSlug)) {
    return NextResponse.json(
      { error: `Daily limit reached (${TOOL_DAILY_LIMIT} checks per tool). Try again tomorrow.` },
      { status: 429 },
    );
  }

  try {
    const result = await runChecker(toolSlug, url);
    return NextResponse.json({ result, tool: toolSlug });
  } catch (err) {
    console.error("Tool scan failed:", err);
    return NextResponse.json({ error: "Tool scan failed." }, { status: 500 });
  }
}
