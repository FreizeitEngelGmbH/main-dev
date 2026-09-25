import { beforeEach, describe, expect, it, vi } from "vitest";

// Firebase is fully mocked: no request to Google or Firebase is made by these tests.
const fb = vi.hoisted(() => {
  const providers: Array<{ setCustomParameters: ReturnType<typeof vi.fn>; addScope: ReturnType<typeof vi.fn> }> = [];
  class GoogleAuthProvider {
    static PROVIDER_ID = "google.com";
    setCustomParameters = vi.fn();
    addScope = vi.fn();
    constructor() { providers.push(this); }
  }
  return {
    providers,
    GoogleAuthProvider,
    apps: [] as unknown[],
    initializeApp: vi.fn(() => ({ name: "app" })),
    getAuth: vi.fn(() => ({ name: "auth" })),
    setPersistence: vi.fn(() => Promise.resolve()),
    browserSessionPersistence: { type: "SESSION" },
    signInWithPopup: vi.fn(),
    signInWithRedirect: vi.fn(() => Promise.resolve()),
    getRedirectResult: vi.fn((): Promise<unknown> => Promise.resolve(null)),
    onAuthStateChanged: vi.fn(() => () => {}),
    signOut: vi.fn(() => Promise.resolve()),
  };
});

vi.mock("firebase/app", () => ({
  initializeApp: fb.initializeApp,
  getApps: () => fb.apps,
  getApp: () => fb.apps[0],
}));
vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: fb.GoogleAuthProvider,
  getAuth: fb.getAuth,
  setPersistence: fb.setPersistence,
  browserSessionPersistence: fb.browserSessionPersistence,
  signInWithPopup: fb.signInWithPopup,
  signInWithRedirect: fb.signInWithRedirect,
  getRedirectResult: fb.getRedirectResult,
  onAuthStateChanged: fb.onAuthStateChanged,
  signOut: fb.signOut,
}));

const firebaseEnv = {
  VITE_FIREBASE_API_KEY: "test-api-key",
  VITE_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
  VITE_FIREBASE_PROJECT_ID: "test-project",
  VITE_FIREBASE_APP_ID: "1:123:web:abc",
  VITE_FIREBASE_MESSAGING_SENDER_ID: "123",
};

const googleUser = {
  uid: "uid-1",
  displayName: "Erika Muster",
  email: "erika@example.test",
  emailVerified: true,
  photoURL: "https://lh3.googleusercontent.com/a/photo",
  providerId: "firebase",
  providerData: [{ providerId: "google.com", displayName: "Erika Muster", email: "erika@example.test", photoURL: null }],
  // Secret material that must never leave the service:
  accessToken: "ya29.secret",
  refreshToken: "refresh-secret",
  stsTokenManager: { accessToken: "id-token-secret" },
  getIdToken: () => Promise.resolve("id-token-secret"),
};

async function loadService(configured = true) {
  vi.resetModules();
  vi.unstubAllEnvs();
  if (configured) for (const [k, v] of Object.entries(firebaseEnv)) vi.stubEnv(k, v);
  return import("@/auth/firebase/firebaseGoogleAuthService");
}

beforeEach(() => {
  fb.providers.length = 0;
  fb.apps.length = 0;
  for (const fn of [fb.initializeApp, fb.getAuth, fb.setPersistence, fb.signInWithPopup, fb.signInWithRedirect, fb.getRedirectResult, fb.signOut]) fn.mockClear();
});

describe("firebaseGoogleAuthService", () => {
  it("opens the account chooser with prompt=select_account and default scopes only", async () => {
    const { firebaseGoogleAuthService } = await loadService();
    fb.signInWithPopup.mockResolvedValueOnce({ user: googleUser });
    await firebaseGoogleAuthService.signInWithGoogle();
    expect(fb.providers).toHaveLength(1);
    expect(fb.providers[0].setCustomParameters).toHaveBeenCalledWith({ prompt: "select_account" });
    expect(fb.providers[0].addScope).not.toHaveBeenCalled();
  });

  it("uses session-scoped persistence and initializes Firebase once", async () => {
    const { firebaseGoogleAuthService } = await loadService();
    fb.signInWithPopup.mockResolvedValue({ user: googleUser });
    await firebaseGoogleAuthService.signInWithGoogle();
    await firebaseGoogleAuthService.signInWithGoogle();
    expect(fb.initializeApp).toHaveBeenCalledTimes(1);
    expect(fb.setPersistence).toHaveBeenCalledWith(expect.anything(), fb.browserSessionPersistence);
  });

  it("reuses an existing Firebase app instead of initializing a second one", async () => {
    fb.apps.push({ name: "existing" });
    const { firebaseGoogleAuthService } = await loadService();
    firebaseGoogleAuthService.subscribe(() => {});
    expect(fb.initializeApp).not.toHaveBeenCalled();
  });

  it("returns only safe profile fields (no tokens)", async () => {
    const { firebaseGoogleAuthService } = await loadService();
    fb.signInWithPopup.mockResolvedValueOnce({ user: googleUser });
    const profile = await firebaseGoogleAuthService.signInWithGoogle();
    expect(profile).toEqual({
      uid: "uid-1",
      displayName: "Erika Muster",
      email: "erika@example.test",
      emailVerified: true,
      photoURL: "https://lh3.googleusercontent.com/a/photo",
      providerId: "google.com",
    });
    expect(JSON.stringify(profile)).not.toMatch(/secret|token/i);
  });

  it("falls back to redirect when the popup is blocked", async () => {
    const { firebaseGoogleAuthService } = await loadService();
    fb.signInWithPopup.mockRejectedValueOnce({ code: "auth/popup-blocked" });
    await expect(firebaseGoogleAuthService.signInWithGoogle()).resolves.toBe("redirecting");
    expect(fb.signInWithRedirect).toHaveBeenCalledTimes(1);
  });

  it("reports a closed popup as cancellation", async () => {
    const { firebaseGoogleAuthService } = await loadService();
    fb.signInWithPopup.mockRejectedValueOnce({ code: "auth/popup-closed-by-user" });
    await expect(firebaseGoogleAuthService.signInWithGoogle()).rejects.toMatchObject({ kind: "cancelled", code: "auth/popup-closed-by-user" });
    expect(fb.signInWithRedirect).not.toHaveBeenCalled();
  });

  it("does not initialize Firebase without configuration", async () => {
    const { firebaseGoogleAuthService } = await loadService(false);
    expect(firebaseGoogleAuthService.isConfigured()).toBe(false);
    await expect(firebaseGoogleAuthService.signInWithGoogle()).rejects.toMatchObject({ kind: "not-configured" });
    expect(fb.initializeApp).not.toHaveBeenCalled();
  });

  it("processes a pending redirect result", async () => {
    const { firebaseGoogleAuthService } = await loadService();
    fb.getRedirectResult.mockResolvedValueOnce({ user: googleUser });
    await expect(firebaseGoogleAuthService.completeRedirect()).resolves.toMatchObject({ uid: "uid-1" });
  });

  it.each([
    ["auth/popup-closed-by-user", "cancelled"],
    ["auth/cancelled-popup-request", "cancelled"],
    ["auth/popup-blocked", "popup-blocked"],
    ["auth/unauthorized-domain", "unauthorized-domain"],
    ["auth/network-request-failed", "network"],
    ["auth/operation-not-allowed", "provider-disabled"],
    ["auth/account-exists-with-different-credential", "account-exists"],
    ["auth/invalid-api-key", "not-configured"],
    ["auth/internal-error", "failed"],
  ])("classifies %s as %s", async (code, kind) => {
    const { classifyFirebaseError } = await loadService();
    expect(classifyFirebaseError({ code })).toBe(kind);
  });
});
