import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import {
  findUserById,
  toPublicUser,
  upsertOAuthUser,
  verifyUserPassword,
} from "@/lib/user-store";
import type { AuthProviderKind } from "@/types/user";

function oauthProviderKind(provider: string): AuthProviderKind {
  if (provider === "google") return "google";
  if (provider === "facebook") return "facebook";
  if (provider === "twitter") return "twitter";
  return "credentials";
}

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email;
      const password = credentials?.password;
      if (typeof email !== "string" || typeof password !== "string") return null;

      const user = verifyUserPassword(email, password);
      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ?? undefined,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.unshift(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
  providers.unshift(
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

if (process.env.AUTH_TWITTER_ID && process.env.AUTH_TWITTER_SECRET) {
  providers.unshift(
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID,
      clientSecret: process.env.AUTH_TWITTER_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? (process.env.NODE_ENV === "development" ? "dev-auth-secret" : undefined),
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 86400 },
  pages: {
    signIn: "/auth/sign-in",
  },
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account) return false;
      if (account.provider === "credentials") return true;

      const prof = profile as {
        email?: string;
        picture?: string;
        image_url?: string;
        data?: { email?: string };
      };

      const email = user.email ?? prof.email ?? prof.data?.email;
      if (!email) {
        return "/auth/sign-in?error=OAuthEmailMissing";
      }

      const image = user.image ?? prof.picture ?? prof.image_url ?? null;
      const providerAccountId = account.providerAccountId ?? `${account.provider}-${email}`;

      const dbUser = upsertOAuthUser({
        email,
        name: user.name ?? email.split("@")[0] ?? "Member",
        image,
        provider: oauthProviderKind(account.provider),
        providerAccountId,
      });

      user.id = dbUser.id;
      user.email = dbUser.email;
      user.name = dbUser.name;
      user.image = dbUser.image ?? undefined;

      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (typeof token.userId === "string") {
        const dbUser = findUserById(token.userId);
        if (dbUser) {
          const pub = toPublicUser(dbUser);
          session.user.id = pub.id;
          session.user.name = pub.name;
          session.user.email = pub.email;
          session.user.image = pub.image ?? null;
          session.user.verified = pub.emailVerified;
          session.user.provider = pub.provider;
        }
      }
      return session;
    },
  },
});
