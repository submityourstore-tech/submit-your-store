import { randomBytes, randomUUID } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { hashValue, isValidEmail } from "@/lib/gbp";
import type { AuthProviderKind, PublicUser, UserAccount, UsersStore } from "@/types/user";

const JSON_PATH = path.join(process.cwd(), "data", "users.json");
const SESSION_DAYS = 30;

function readStore(): UsersStore {
  return JSON.parse(readFileSync(JSON_PATH, "utf-8")) as UsersStore;
}

function writeStore(store: UsersStore): void {
  writeFileSync(JSON_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function normalizeUser(raw: UserAccount): UserAccount {
  return {
    ...raw,
    passwordHash: raw.passwordHash ?? null,
    image: raw.image ?? null,
    emailVerified: raw.emailVerified ?? false,
    provider: raw.provider ?? "credentials",
    providerAccountId: raw.providerAccountId ?? null,
  };
}

export function toPublicUser(user: UserAccount): PublicUser {
  const u = normalizeUser(user);
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    emailVerified: u.emailVerified,
    provider: u.provider,
  };
}

export function findUserByEmail(email: string): UserAccount | null {
  const key = email.trim().toLowerCase();
  const user = readStore().users.find((u) => u.email === key);
  return user ? normalizeUser(user) : null;
}

export function findUserById(id: string): UserAccount | null {
  const user = readStore().users.find((u) => u.id === id);
  return user ? normalizeUser(user) : null;
}

export function findUserByProvider(
  provider: AuthProviderKind,
  providerAccountId: string,
): UserAccount | null {
  const user = readStore().users.find(
    (u) => u.provider === provider && u.providerAccountId === providerAccountId,
  );
  return user ? normalizeUser(user) : null;
}

export function createUser(input: {
  name: string;
  email: string;
  password: string;
}): { ok: true; user: PublicUser } | { ok: false; error: string } {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (name.length < 2) {
    return { ok: false, error: "Enter your name (at least 2 characters)." };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  const store = readStore();
  if (store.users.some((u) => u.email === email)) {
    return { ok: false, error: "An account with this email already exists. Sign in instead." };
  }

  const user: UserAccount = {
    id: randomUUID(),
    name,
    email,
    passwordHash: hashValue(password),
    image: null,
    emailVerified: false,
    provider: "credentials",
    providerAccountId: null,
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  writeStore(store);
  return { ok: true, user: toPublicUser(user) };
}

export function upsertOAuthUser(input: {
  email: string;
  name: string;
  image: string | null;
  provider: AuthProviderKind;
  providerAccountId: string;
}): UserAccount {
  const store = readStore();
  const email = input.email.trim().toLowerCase();

  let user =
    store.users.find(
      (u) => u.provider === input.provider && u.providerAccountId === input.providerAccountId,
    ) ??
    store.users.find((u) => u.email === email) ??
    null;

  if (user) {
    user.name = input.name.trim() || user.name;
    user.email = email;
    user.image = input.image ?? user.image ?? null;
    user.emailVerified = true;
    user.provider = input.provider;
    user.providerAccountId = input.providerAccountId;
  } else {
    user = {
      id: randomUUID(),
      name: input.name.trim() || email.split("@")[0] || "Member",
      email,
      passwordHash: null,
      image: input.image,
      emailVerified: true,
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
  }

  writeStore(store);
  return normalizeUser(user);
}

export function verifyUserPassword(email: string, password: string): UserAccount | null {
  const user = findUserByEmail(email);
  if (!user?.passwordHash) return null;
  if (user.passwordHash !== hashValue(password)) return null;
  return user;
}

export function upsertVerifiedReviewUser(input: {
  name: string;
  email: string;
  phone?: string;
}): { user: UserAccount; tempPassword: string } {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const store = readStore();

  let user = store.users.find((u) => u.email === email) ?? null;
  const tempPassword = randomBytes(12).toString("base64url");

  if (user) {
    user.name = name.length >= 2 ? name : user.name;
    user.emailVerified = true;
    user.passwordHash = hashValue(tempPassword);
  } else {
    user = {
      id: randomUUID(),
      name: name.length >= 2 ? name : email.split("@")[0] || "Member",
      email,
      passwordHash: hashValue(tempPassword),
      image: null,
      emailVerified: true,
      provider: "credentials",
      providerAccountId: null,
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
  }

  writeStore(store);
  return { user: normalizeUser(user), tempPassword };
}

/** @deprecated Legacy cookie sessions — NextAuth JWT is used instead. */
export function findUserBySessionToken(token: string): UserAccount | null {
  if (!token) return null;
  const store = readStore();
  const tokenHash = hashValue(token);
  const session = store.sessions.find((s) => s.tokenHash === tokenHash);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) return null;
  const user = store.users.find((u) => u.id === session.userId);
  return user ? normalizeUser(user) : null;
}

export const USER_SESSION_COOKIE = "sys_session";
