import path from "path";
import { createJsonStore } from "@/lib/json-store-cache.server";
import type { UsersStore } from "@/types/user";

const JSON_PATH = path.join(process.cwd(), "data", "users.json");

const usersStore = createJsonStore<UsersStore>({
  path: JSON_PATH,
  cacheKey: "users-store",
  tag: "users-store",
  revalidate: 120,
  pretty: true,
  fallback: () => ({ users: [], sessions: [] }),
});

export { usersStore };
