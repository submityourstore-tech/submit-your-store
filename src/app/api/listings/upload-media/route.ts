import { NextResponse } from "next/server";
import {
  businessMediaDir,
  pendingMediaDir,
  publicUrlFromPath,
  saveGalleryFile,
  saveLogoFile,
} from "@/lib/listing-media";
import { processGalleryImage, processLogoImage, validateImageBuffer } from "@/lib/image-process";
import { validateManageToken } from "@/lib/listing-verification-store";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const type = String(form.get("type") ?? "");
    const sessionId = String(form.get("sessionId") ?? "").trim();
    const businessId = String(form.get("businessId") ?? "").trim();
    const token = String(form.get("token") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    if (type !== "logo" && type !== "gallery") {
      return NextResponse.json({ error: "Invalid upload type." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 8 MB)." }, { status: 400 });
    }

    let targetDir: string;
    if (businessId) {
      if (!token || !validateManageToken(businessId, token)) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }
      targetDir = businessMediaDir(businessId);
    } else if (sessionId) {
      targetDir = pendingMediaDir(sessionId);
    } else {
      return NextResponse.json({ error: "Missing session or business id." }, { status: 400 });
    }

    const input = Buffer.from(await file.arrayBuffer());
    await validateImageBuffer(input);

    const processed =
      type === "logo" ? await processLogoImage(input) : await processGalleryImage(input);

    const savedPath =
      type === "logo"
        ? saveLogoFile(targetDir, processed)
        : saveGalleryFile(targetDir, processed).filePath;

    return NextResponse.json({
      url: publicUrlFromPath(savedPath),
      type,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
