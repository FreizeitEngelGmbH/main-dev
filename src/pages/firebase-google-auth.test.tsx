import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// jsdom has no ResizeObserver (Radix checkbox) and never loads images (Radix avatar):
// stub both so the page mounts and the profile photo can "load".
beforeAll(() => {
  if (!("ResizeObserver" in globalThis)) {
    class ResizeObserverStub { observe() {} unobserve() {} disconnect() {} }
    Object.defineProperty(globalThis, "ResizeObserver", { value: ResizeObserverStub, configurable: true });
  }
  class LoadingImage {
    onload: ((event: { currentTarget: unknown; target: unknown }) => void) | null = null;
    onerror: ((event: { currentTarget: unknown; target: unknown }) => void) | null = null;
    referrerPolicy = "";
    crossOrigin: string | null = null;
    naturalWidth = 1;
    complete = false;
    set src(_value: string) {
      setTimeout(() => { this.complete = true; this.onload?.({ currentTarget: this, target: this }); }, 0);
    }
    addEventListener(type: string, cb: (event: { currentTarget: unknown; target: unknown }) => void) { if (type === "load") this.onload = cb; if (type === "error") this.onerror = cb; }
    removeEventListener() {}
  }
  Object.defineProperty(window, "Image", { value: LoadingImage, configurable: true });
});

// The FreizeitEngel server session stays signed out throughout: Firebase must not change it.
const authState = vi.hoisted(() => ({
  user: null as null | { role: string },
  isLoading: false,
  loginMutation: { mutate: () => {}, isPending: false },
  registerMutation: { mutate: () => {}, isPending: false },
}));
vi.mock("@/hooks/use-auth", () => ({ useAuth: () => authState }));

const service = vi.hoisted(() => ({
  isConfigured: vi.fn(() => true),
  signInWithGoogle: vi.fn(),
  completeRedirect: vi.fn(() => Promise.resolve(null)),
  subscribe: vi.fn(() => () => {}),
  signOut: vi.fn(() => Promise.resolve()),
}));
vi.mock("@/auth/firebase/firebaseGoogleAuthService", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/auth/firebase/firebaseGoogleAuthService")>();
  return { ...original, firebaseGoogleAuthService: service };
});

import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/lib/protected-route";
import { FirebaseGoogleAuthError } from "@/auth/firebase/firebaseGoogleAuthService";

const profile = {
  uid: "uid-1",
  displayName: "Erika Muster",
  email: "erika@example.test",
  emailVerified: true,
  photoURL: "https://lh3.googleusercontent.com/a/photo",
  providerId: "google.com",
};

const googleButton = () => screen.getByRole("button", { name: "Mit Google fortfahren" });

let setItem: ReturnType<typeof vi.spyOn>;
let fetchSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  window.history.replaceState(null, "", "/auth");
  authState.user = null;
  service.isConfigured.mockReturnValue(true);
  service.signInWithGoogle.mockReset();
  service.signOut.mockClear();
  setItem = vi.spyOn(Storage.prototype, "setItem");
  fetchSpy = vi.spyOn(globalThis, "fetch");
});
afterEach(() => {
  // App code writes nothing to browser storage and calls no FreizeitEngel API for Google sign-in.
  expect(setItem).not.toHaveBeenCalled();
  expect(fetchSpy.mock.calls.some((call: unknown[]) => String(call[0]).includes("/api/"))).toBe(false);
  vi.restoreAllMocks();
});

describe("Firebase Google account selection preview", () => {
  it("renders the Google button with its icon", () => {
    render(<AuthPage />);
    expect(googleButton()).toBeEnabled();
    expect(googleButton().querySelector("svg")).toBeInTheDocument();
  });

  it("shows name, email, photo and the verified state after selection", async () => {
    service.signInWithGoogle.mockResolvedValueOnce(profile);
    render(<AuthPage />);
    fireEvent.click(googleButton());
    expect(await screen.findByText("Mit Google angemeldet")).toBeInTheDocument();
    expect(screen.getByText("Erika Muster")).toBeInTheDocument();
    expect(screen.getByText("erika@example.test")).toBeInTheDocument();
    expect(screen.getByText("E-Mail-Adresse bestätigt")).toBeInTheDocument();
    expect(screen.getByTestId("firebase-google-uid")).toHaveTextContent("uid-1");
    expect(screen.getByTestId("firebase-google-provider")).toHaveTextContent("google.com");
    await waitFor(() => expect(document.querySelector('[data-testid="firebase-google-account"] img')).toHaveAttribute("src", profile.photoURL));
    expect(screen.queryByRole("button", { name: "Mit Google fortfahren" })).not.toBeInTheDocument();
    expect(within(screen.getByTestId("firebase-google-account")).getByRole("link")).toHaveAttribute("href", "/home");
  });

  it("falls back to initials without a photo and flags an unverified email", async () => {
    service.signInWithGoogle.mockResolvedValueOnce({ ...profile, photoURL: null, emailVerified: false });
    render(<AuthPage />);
    fireEvent.click(googleButton());
    expect(await screen.findByTestId("firebase-google-avatar-fallback")).toHaveTextContent("EM");
    expect(screen.getByText("E-Mail-Adresse nicht bestätigt")).toBeInTheDocument();
  });

  it("treats a closed popup as a quiet cancellation", async () => {
    service.signInWithGoogle.mockRejectedValueOnce(new FirebaseGoogleAuthError("cancelled"));
    render(<AuthPage />);
    fireEvent.click(googleButton());
    expect(await screen.findByRole("status")).toHaveTextContent("abgebrochen");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(googleButton()).toBeEnabled();
  });

  it("explains a blocked popup", async () => {
    service.signInWithGoogle.mockRejectedValueOnce(new FirebaseGoogleAuthError("popup-blocked"));
    render(<AuthPage />);
    fireEvent.click(googleButton());
    expect(await screen.findByRole("alert")).toHaveTextContent("blockiert");
    expect(googleButton()).toBeEnabled();
  });

  it("shows a configuration message instead of signing in when Firebase is not configured", () => {
    service.isConfigured.mockReturnValue(false);
    render(<AuthPage />);
    fireEvent.click(googleButton());
    expect(service.signInWithGoogle).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("nicht eingerichtet");
  });

  it("ignores repeated clicks while the chooser is open", async () => {
    let resolve!: (value: typeof profile) => void;
    service.signInWithGoogle.mockReturnValueOnce(new Promise((r) => { resolve = r; }));
    render(<AuthPage />);
    fireEvent.click(googleButton());
    const busy = screen.getByRole("button", { name: /Google-Konto wird ausgewählt/ });
    expect(busy).toBeDisabled();
    fireEvent.click(busy);
    expect(service.signInWithGoogle).toHaveBeenCalledTimes(1);
    await act(async () => resolve(profile));
    expect(await screen.findByText("Erika Muster")).toBeInTheDocument();
  });

  it("signs out of Firebase only and clears the displayed account", async () => {
    service.signInWithGoogle.mockResolvedValueOnce(profile);
    render(<AuthPage />);
    fireEvent.click(googleButton());
    fireEvent.click(await screen.findByRole("button", { name: "Abmelden" }));
    await waitFor(() => expect(screen.queryByText("Erika Muster")).not.toBeInTheDocument());
    expect(service.signOut).toHaveBeenCalledTimes(1);
    expect(googleButton()).toBeInTheDocument();
    expect(authState.user).toBeNull();
  });

  it("assigns no role and opens no protected route", async () => {
    service.signInWithGoogle.mockResolvedValueOnce(profile);
    render(<AuthPage />);
    fireEvent.click(googleButton());
    await screen.findByText("Mit Google angemeldet");
    expect(window.location.pathname).toBe("/auth");
    expect(authState.user).toBeNull();
    expect(profile).not.toHaveProperty("role");

    window.history.replaceState(null, "", "/partner/dashboard");
    render(<ProtectedRoute path="/partner/dashboard" component={() => <div>Partner area</div>} allowedRoles={["partner", "admin"]} />);
    await waitFor(() => expect(window.location.pathname).toBe("/auth"));
    expect(screen.queryByText("Partner area")).not.toBeInTheDocument();
  });
});
