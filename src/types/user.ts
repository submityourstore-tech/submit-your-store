export type AuthProviderKind = "credentials" | "google" | "facebook" | "twitter";

export type UserAccount = {
  id: string;
  name: string;
  email: string;
  passwordHash?: string | null;
  image?: string | null;
  emailVerified: boolean;
  provider: AuthProviderKind;
  providerAccountId?: string | null;
  createdAt: string;
};

export type UserSession = {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
};

export type UsersStore = {
  users: UserAccount[];
  sessions: UserSession[];
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  provider: AuthProviderKind;
};
