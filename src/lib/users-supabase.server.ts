import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type { AuthProviderKind, UserAccount } from "@/types/user";

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  image: string | null;
  email_verified: boolean;
  provider: string;
  provider_account_id: string | null;
  created_at: string;
};

function mapRow(row: UserRow): UserAccount {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    image: row.image,
    emailVerified: row.email_verified,
    provider: row.provider as AuthProviderKind,
    providerAccountId: row.provider_account_id,
    createdAt: row.created_at,
  };
}

function toRow(user: UserAccount): UserRow {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    password_hash: user.passwordHash ?? null,
    image: user.image ?? null,
    email_verified: user.emailVerified,
    provider: user.provider,
    provider_account_id: user.providerAccountId ?? null,
    created_at: user.createdAt,
  };
}

export async function findUserByEmailSupabase(email: string): Promise<UserAccount | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_users")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error) {
    if (error.message.includes("Could not find the table")) return null;
    throw new Error(error.message);
  }

  return data ? mapRow(data as UserRow) : null;
}

export async function findUserByIdSupabase(id: string): Promise<UserAccount | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from("site_users").select("*").eq("id", id).maybeSingle();

  if (error) {
    if (error.message.includes("Could not find the table")) return null;
    throw new Error(error.message);
  }

  return data ? mapRow(data as UserRow) : null;
}

export async function findUserByProviderSupabase(
  provider: AuthProviderKind,
  providerAccountId: string,
): Promise<UserAccount | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_users")
    .select("*")
    .eq("provider", provider)
    .eq("provider_account_id", providerAccountId)
    .maybeSingle();

  if (error) {
    if (error.message.includes("Could not find the table")) return null;
    throw new Error(error.message);
  }

  return data ? mapRow(data as UserRow) : null;
}

export async function upsertUserSupabase(user: UserAccount): Promise<UserAccount> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_users")
    .upsert(toRow(user), { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as UserRow);
}
