import { randomBytes, randomUUID } from "crypto";
import { hashValue, isValidEmail } from "@/lib/gbp";
import { usersStore } from "@/lib/users-store-cache.server";
import {
  findUserByEmailSupabase,
  findUserByIdSupabase,
  findUserByProviderSupabase,
  upsertUserSupabase,
} from "@/lib/users-supabase.server";
import type { AuthProviderKind, PublicUser, UserAccount, UsersStore } from "@/types/user";

export const USER_SESSION_COOKIE = "sys_session";

function normalizeGoogleProfileImage(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.includes("googleusercontent.com")) {
    return trimmed.replace(/=s\d+(-c)?$/, "=s128-c");
  }
  return trimmed;
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

async function findUserByEmailJson(email: string): Promise<UserAccount | null> {
  const key = email.trim().toLowerCase();
  const store = await usersStore.read();
  const user = store.users.find((u) => u.email === key);
  return user ? normalizeUser(user) : null;
}

async function findUserByIdJson(id: string): Promise<UserAccount | null> {
  const store = await usersStore.read();
  const user = store.users.find((u) => u.id === id);
  return user ? normalizeUser(user) : null;
}

async function upsertUserJson(user: UserAccount): Promise<UserAccount> {
  const store = usersStore.readForWrite();
  const index = store.users.findIndex((u) => u.id === user.id);
  if (index === -1) {
    store.users.push(user);
  } else {
    store.users[index] = user;
  }
  usersStore.write(store);
  return normalizeUser(user);
}

async function persistUser(user: UserAccount): Promise<UserAccount> {
  try {
    return await upsertUserSupabase(user);
  } catch (err) {
    console.error("Supabase user persist failed:", err);
    if (process.env.VERCEL) {
      throw err;
    }
    console.error("Falling back to JSON user store");
    return upsertUserJson(user);
  }
}

export async function findUserByEmail(email: string): Promise<UserAccount | null> {
  try {
    const user = await findUserByEmailSupabase(email);
    if (user) return user;
  } catch (err) {
    console.error("findUserByEmail Supabase failed:", err);
  }
  return findUserByEmailJson(email);
}

export async function findUserById(id: string): Promise<UserAccount | null> {
  try {
    const user = await findUserByIdSupabase(id);
    if (user) return user;
  } catch (err) {
    console.error("findUserById Supabase failed:", err);
  }
  return findUserByIdJson(id);
}

export async function findUserByProvider(
  provider: AuthProviderKind,
  providerAccountId: string,
): Promise<UserAccount | null> {
  try {
    const user = await findUserByProviderSupabase(provider, providerAccountId);
    if (user) return user;
  } catch (err) {
    console.error("findUserByProvider Supabase failed:", err);
  }

  const store = await usersStore.read();
  const user = store.users.find(
    (u) => u.provider === provider && u.providerAccountId === providerAccountId,
  );
  return user ? normalizeUser(user) : null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }> {
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

  if (await findUserByEmail(email)) {
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

  const saved = await persistUser(user);
  return { ok: true, user: toPublicUser(saved) };
}

export async function upsertOAuthUser(input: {
  email: string;
  name: string;
  image: string | null;
  provider: AuthProviderKind;
  providerAccountId: string;
}): Promise<UserAccount> {
  const email = input.email.trim().toLowerCase();

  let user =
    (await findUserByProvider(input.provider, input.providerAccountId)) ??
    (await findUserByEmail(email));

  if (user) {
    const googleImage =
      input.provider === "google" && input.image ? normalizeGoogleProfileImage(input.image) : null;
    user = {
      ...user,
      name: input.name.trim() || user.name,
      email,
      image: googleImage ?? input.image ?? user.image ?? null,
      emailVerified: input.provider === "google" ? true : user.emailVerified,
      provider: input.provider,
      providerAccountId: input.providerAccountId,
    };
  } else {
    user = {
      id: randomUUID(),
      name: input.name.trim() || email.split("@")[0] || "Member",
      email,
      passwordHash: null,
      image:
        input.provider === "google" && input.image
          ? normalizeGoogleProfileImage(input.image)
          : input.image,
      emailVerified: input.provider === "google",
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      createdAt: new Date().toISOString(),
    };
  }

  return persistUser(user);
}

export async function markUserEmailVerified(userId: string): Promise<UserAccount | null> {
  const user = await findUserById(userId);
  if (!user) return null;
  const updated = { ...user, emailVerified: true };
  return persistUser(updated);
}

export async function verifyUserPassword(email: string, password: string): Promise<UserAccount | null> {
  const user = await findUserByEmail(email);
  if (!user?.passwordHash) return null;
  if (user.passwordHash !== hashValue(password)) return null;
  return user;
}

export async function upsertVerifiedReviewUser(input: {
  name: string;
  email: string;
  phone?: string;
}): Promise<{ user: UserAccount; tempPassword: string }> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const tempPassword = randomBytes(12).toString("base64url");

  let user = await findUserByEmail(email);

  if (user) {
    user = {
      ...user,
      name: name.length >= 2 ? name : user.name,
      emailVerified: true,
      passwordHash: hashValue(tempPassword),
    };
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
  }

  const saved = await persistUser(user);
  return { user: saved, tempPassword };
}

/** @deprecated Legacy cookie sessions — NextAuth JWT is used instead. */
export function findUserBySessionToken(token: string): UserAccount | null {
  if (!token) return null;
  const store = usersStore.readForWrite();
  const tokenHash = hashValue(token);
  const session = store.sessions.find((s) => s.tokenHash === tokenHash);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) return null;
  const user = store.users.find((u) => u.id === session.userId);
  return user ? normalizeUser(user) : null;
}

export type { UsersStore };
