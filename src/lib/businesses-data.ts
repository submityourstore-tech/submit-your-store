import { readFileSync } from "fs";
import path from "path";
import type { Business } from "@/types/business";

const JSON_PATH = path.join(process.cwd(), "data", "businesses.json");

export function readBusinesses(): Business[] {
  try {
    return JSON.parse(readFileSync(JSON_PATH, "utf-8")) as Business[];
  } catch {
    return [];
  }
}
