import { initializeApp, getApps, cert, type App, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let cachedApp: App | null | undefined;

function getAdminApp(): App | null {
  if (cachedApp !== undefined) return cachedApp;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!json) {
    cachedApp = null;
    return null;
  }

  try {
    const serviceAccount = JSON.parse(json) as ServiceAccount;

    if (getApps().length > 0) {
      cachedApp = getApps()[0]!;
      return cachedApp;
    }

    cachedApp = initializeApp({
      credential: cert(serviceAccount),
    });
    return cachedApp;
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON", err);
    cachedApp = null;
    return null;
  }
}

export function isFirebaseAdminConfigured(): boolean {
  return getAdminApp() !== null;
}

export async function verifyFirebasePhoneToken(
  idToken: string,
): Promise<{ ok: true; phone: string } | { ok: false; error: string }> {
  const app = getAdminApp();
  if (!app) {
    return {
      ok: false,
      error:
        "Phone verification is not configured. Add FIREBASE_SERVICE_ACCOUNT_JSON to your environment variables.",
    };
  }

  try {
    const auth = getAuth(app);
    const decoded = await auth.verifyIdToken(idToken);
    const phone = decoded.phone_number;

    if (!phone) {
      return { ok: false, error: "Phone number missing from Firebase token." };
    }

    return { ok: true, phone };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid Firebase token.";
    console.error("Firebase token verification failed", message);
    return { ok: false, error: "Phone verification failed. Request a new code and try again." };
  }
}
