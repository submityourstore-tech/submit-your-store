import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "fs";
import path from "path";

const PUBLIC = path.join(process.cwd(), "public");

export function pendingMediaDir(sessionId: string): string {
  const safe = sessionId.replace(/[^a-zA-Z0-9-]/g, "");
  return path.join(PUBLIC, "uploads", "pending", safe);
}

export function businessMediaDir(businessId: string): string {
  const safe = businessId.replace(/[^a-zA-Z0-9-]/g, "");
  return path.join(PUBLIC, "businesses", safe);
}

export function ensureDir(dir: string) {
  mkdirSync(dir, { recursive: true });
}

export function saveLogoFile(dir: string, data: Buffer): string {
  ensureDir(dir);
  const filePath = path.join(dir, "logo.webp");
  writeFileSync(filePath, data);
  return filePath;
}

export function saveGalleryFile(dir: string, data: Buffer): { index: number; filePath: string } {
  ensureDir(dir);
  const existing = readdirSync(dir).filter((f) => f.startsWith("gallery-") && f.endsWith(".webp"));
  if (existing.length >= 3) {
    throw new Error("Maximum 3 gallery photos allowed.");
  }
  const index = existing.length + 1;
  const filePath = path.join(dir, `gallery-${index}.webp`);
  writeFileSync(filePath, data);
  return { index, filePath };
}

export function publicUrlFromPath(absPath: string): string {
  const rel = path.relative(PUBLIC, absPath).split(path.sep).join("/");
  return `/${rel}`;
}

export function listGalleryUrls(dir: string, urlPrefix: string): string[] {
  try {
    return readdirSync(dir)
      .filter((f) => f.startsWith("gallery-") && f.endsWith(".webp"))
      .sort()
      .map((f) => `${urlPrefix}/${f}`);
  } catch {
    return [];
  }
}

export function removeGalleryFile(dir: string, url: string): void {
  const name = path.basename(url);
  const filePath = path.join(dir, name);
  try {
    unlinkSync(filePath);
  } catch {
    /* ignore */
  }
}

export function mediaUrlsForPending(sessionId: string): { logo?: string; gallery: string[] } {
  const dir = pendingMediaDir(sessionId);
  const prefix = `/uploads/pending/${sessionId.replace(/[^a-zA-Z0-9-]/g, "")}`;
  const logoPath = path.join(dir, "logo.webp");
  let logo: string | undefined;
  if (existsSync(logoPath)) logo = `${prefix}/logo.webp`;
  return { logo, gallery: listGalleryUrls(dir, prefix) };
}

export function mediaUrlsForBusiness(businessId: string): { logo?: string; gallery: string[] } {
  const dir = businessMediaDir(businessId);
  const prefix = `/businesses/${businessId.replace(/[^a-zA-Z0-9-]/g, "")}`;
  const logoPath = path.join(dir, "logo.webp");
  let logo: string | undefined;
  if (existsSync(logoPath)) logo = `${prefix}/logo.webp`;
  return { logo, gallery: listGalleryUrls(dir, prefix) };
}
