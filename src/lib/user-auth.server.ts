import { auth } from "@/auth";
import { findUserById, toPublicUser } from "@/lib/user-store";
import type { PublicUser } from "@/types/user";

export async function getCurrentUser(): Promise<PublicUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await findUserById(session.user.id);
  if (user) return toPublicUser(user);

  if (session.user.email && session.user.name) {
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image ?? null,
      emailVerified: session.user.verified ?? false,
      provider: (session.user.provider as PublicUser["provider"]) ?? "credentials",
    };
  }

  return null;
}
