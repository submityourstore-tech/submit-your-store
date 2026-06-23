import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { hashValue } from "@/lib/gbp";
import { findUserById, toPublicUser, upsertOAuthUser, verifyUserPassword } from "@/lib/user-store";

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

      const user = await verifyUserPassword(email, password);
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
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  );
}

function normalizeGooglePicture(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.includes("googleusercontent.com")) {
    return trimmed.replace(/=s\d+(-c)?$/, "=s128-c");
  }
  return trimmed;
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

      if (account.provider !== "google") return false;

      const prof = profile as { email?: string; picture?: string; sub?: string };
      const email = user.email ?? prof.email;
      if (!email) {
        return "/auth/sign-in?error=OAuthEmailMissing";
      }

      const image = normalizeGooglePicture(user.image ?? prof.picture ?? null);
      const providerAccountId = account.providerAccountId ?? prof.sub ?? `google-${email}`;

      try {
        const dbUser = await upsertOAuthUser({
          email,
          name: user.name ?? email.split("@")[0] ?? "Member",
          image,
          provider: "google",
          providerAccountId,
        });

        user.id = dbUser.id;
        user.email = dbUser.email;
        user.name = dbUser.name;
        user.image = dbUser.image ?? undefined;
      } catch (err) {
        console.error("Google sign-in user persist failed:", err);
        user.id = user.id ?? `google-${hashValue(email).slice(0, 32)}`;
        user.email = email;
      }

      return true;
    },
    async jwt({ token, user, account, trigger }) {
      if (user?.id) {
        token.userId = user.id;
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
        if (user.image) token.picture = user.image;
        token.provider = account?.provider ?? "credentials";

        const dbUser = await findUserById(user.id);
        if (dbUser) {
          token.verified = dbUser.emailVerified;
          token.picture = dbUser.image ?? user.image ?? undefined;
          token.name = dbUser.name;
          token.email = dbUser.email;
        } else {
          token.verified = account?.provider === "google";
        }
      }

      if (trigger === "update" && typeof token.userId === "string") {
        const dbUser = await findUserById(token.userId);
        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image ?? undefined;
          token.verified = dbUser.emailVerified;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (typeof token.userId === "string") {
        const dbUser = await findUserById(token.userId);
        if (dbUser) {
          const pub = toPublicUser(dbUser);
          session.user.id = pub.id;
          session.user.name = pub.name;
          session.user.email = pub.email;
          session.user.image = pub.image ?? null;
          session.user.verified = pub.emailVerified;
          session.user.provider = pub.provider;
        } else {
          session.user.id = token.userId;
          session.user.email = (token.email as string | undefined) ?? session.user.email ?? "";
          session.user.name = (token.name as string | undefined) ?? session.user.name ?? "Member";
          session.user.image = (token.picture as string | undefined) ?? null;
          session.user.verified = Boolean(token.verified);
          session.user.provider =
            (token.provider as "credentials" | "google" | "facebook" | "twitter" | undefined) ?? "google";
        }
      }
      return session;
    },
  },
});
