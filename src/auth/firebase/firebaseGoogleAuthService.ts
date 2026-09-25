import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserSessionPersistence,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import { readFirebaseConfig } from "@/auth/firebase/firebaseConfig";

/**
 * Firebase Google account selection / profile PREVIEW.
 *
 * This is deliberately separate from the FreizeitEngel server session (connect.sid, GET /api/user,
 * AuthProvider, ProtectedRoute): a Firebase user has no FreizeitEngel role and grants no Admin or
 * Partner access. Only the safe profile fields below leave this module; tokens and credentials
 * stay inside the Firebase SDK and are never returned, stored by app code, displayed or logged.
 */
export interface FirebaseGoogleUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  photoURL: string | null;
  providerId: string;
}

export type FirebaseGoogleErrorKind =
  | "cancelled"
  | "popup-blocked"
  | "unauthorized-domain"
  | "not-configured"
  | "network"
  | "provider-disabled"
  | "account-exists"
  | "failed";

export class FirebaseGoogleAuthError extends Error {
  /** `code` is Firebase's error code (e.g. auth/popup-blocked); it never contains tokens. */
  constructor(public readonly kind: FirebaseGoogleErrorKind, public readonly code?: string) {
    super(kind);
    this.name = "FirebaseGoogleAuthError";
  }
}

export function toFirebaseGoogleUser(user: User): FirebaseGoogleUser {
  const google = user.providerData.find((p) => p.providerId === GoogleAuthProvider.PROVIDER_ID);
  return {
    uid: user.uid,
    displayName: user.displayName ?? google?.displayName ?? null,
    email: user.email ?? google?.email ?? null,
    emailVerified: user.emailVerified,
    photoURL: user.photoURL ?? google?.photoURL ?? null,
    providerId: google?.providerId ?? user.providerId,
  };
}

/** Firebase error codes → UI categories (see https://firebase.google.com/docs/reference/js/auth#autherrorcodes). */
export function classifyFirebaseError(error: unknown): FirebaseGoogleErrorKind {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code: unknown }).code) : "";
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
    case "auth/user-cancelled":
      return "cancelled";
    case "auth/popup-blocked":
      return "popup-blocked";
    case "auth/unauthorized-domain":
      return "unauthorized-domain";
    case "auth/network-request-failed":
      return "network";
    case "auth/operation-not-allowed":
      return "provider-disabled";
    case "auth/account-exists-with-different-credential":
      return "account-exists";
    case "auth/invalid-api-key":
    case "auth/configuration-not-found":
    case "auth/invalid-app-id":
      return "not-configured";
    default:
      return "failed";
  }
}

let authInstance: Auth | null = null;
let persistenceReady: Promise<void> | null = null;

/** Initializes Firebase at most once; returns null when the web config is incomplete. */
function errorCode(error: unknown): string | undefined {
  return typeof error === "object" && error && "code" in error ? String((error as { code: unknown }).code) : undefined;
}

function getFirebaseAuth(): Auth | null {
  if (authInstance) return authInstance;
  const config = readFirebaseConfig();
  if (!config.ok) return null;
  const app = getApps().length ? getApp() : initializeApp(config.options);
  authInstance = getAuth(app);
  // Session-scoped: the selected account survives reloads in this tab only.
  persistenceReady = setPersistence(authInstance, browserSessionPersistence);
  return authInstance;
}

function createGoogleProvider(): GoogleAuthProvider {
  // Default identity scopes only (openid, email, profile); no Calendar/Drive/Contacts scopes.
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

export const firebaseGoogleAuthService = {
  isConfigured(): boolean {
    return readFirebaseConfig().ok;
  },

  /**
   * Opens Google's account chooser in a popup. If the browser blocks popups (or cannot use them),
   * falls back to a full-page redirect; the result is then picked up by completeRedirect().
   * Resolves with the profile, or with "redirecting" when the page is about to navigate away.
   */
  async signInWithGoogle(): Promise<FirebaseGoogleUser | "redirecting"> {
    const auth = getFirebaseAuth();
    if (!auth) throw new FirebaseGoogleAuthError("not-configured");
    const provider = createGoogleProvider();
    try {
      await persistenceReady;
      const result = await signInWithPopup(auth, provider);
      return toFirebaseGoogleUser(result.user);
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String((error as { code: unknown }).code) : "";
      if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
        try {
          await signInWithRedirect(auth, provider);
          return "redirecting";
        } catch (redirectError) {
          throw new FirebaseGoogleAuthError(classifyFirebaseError(redirectError), errorCode(redirectError));
        }
      }
      throw new FirebaseGoogleAuthError(classifyFirebaseError(error), errorCode(error));
    }
  },

  /** Processes a pending redirect result once after returning from Google (no-op otherwise). */
  async completeRedirect(): Promise<FirebaseGoogleUser | null> {
    const auth = getFirebaseAuth();
    if (!auth) return null;
    try {
      const result = await getRedirectResult(auth);
      return result ? toFirebaseGoogleUser(result.user) : null;
    } catch (error) {
      throw new FirebaseGoogleAuthError(classifyFirebaseError(error), errorCode(error));
    }
  },

  /** Restores/observes the session-scoped Firebase user. Returns an unsubscribe function. */
  subscribe(listener: (user: FirebaseGoogleUser | null) => void): () => void {
    const auth = getFirebaseAuth();
    if (!auth) return () => {};
    return onAuthStateChanged(auth, (user) => listener(user ? toFirebaseGoogleUser(user) : null));
  },

  /** Signs out of Firebase only. The FreizeitEngel server session is not affected. */
  async signOut(): Promise<void> {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
  },
};
