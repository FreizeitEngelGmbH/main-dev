import { env } from "@/config/env";
import { safeNextPath } from "@/auth/redirects";

/**
 * NOT CURRENTLY WIRED: the "Mit Google fortfahren" button uses the Firebase preview
 * (src/auth/firebase/). This module is the future backend-session boundary and is only used by the
 * /auth/google/complete route, which the backend would redirect to once it implements the flow.
 *
 * Google sign-in / sign-up boundary (server-managed session).
 *
 * The frontend never talks to Google directly and never sees a Google token: it navigates the
 * whole page to the backend start endpoint (VITE_GOOGLE_AUTH_START_PATH), which runs the OAuth /
 * OpenID Connect flow, verifies the Google identity, finds/links/creates the user, regenerates the
 * normal session cookie and finally redirects to GOOGLE_AUTH_COMPLETE_PATH. That page then reads
 * the user from GET /api/user like every other login.
 *
 * Query parameters sent to the start endpoint:
 * - prompt=select_account  the backend must pass this to Google so the account chooser always shows
 * - next=<local path>      optional; already validated by safeNextPath, re-validated after login
 */

export const GOOGLE_AUTH_COMPLETE_PATH = "/auth/google/complete";

export type GoogleAuthUnavailableReason = "not-configured" | "mock-mode";

export type GoogleAuthStart =
  | { ok: true; url: string }
  | { ok: false; reason: GoogleAuthUnavailableReason };

/** Indirection so tests can observe navigation without leaving jsdom. */
export const browserNavigation = {
  assign(url: string) {
    window.location.assign(url);
  },
};

/** Builds the backend start URL, or explains why Google sign-in is unavailable. */
export function buildGoogleAuthStart(rawNext?: string | null): GoogleAuthStart {
  if (env.useMockApi) return { ok: false, reason: "mock-mode" };
  const startPath = env.googleAuthStartPath.trim();
  if (!startPath.startsWith("/api/")) return { ok: false, reason: "not-configured" };

  const params = new URLSearchParams({ prompt: "select_account" });
  const next = safeNextPath(rawNext);
  if (next) params.set("next", next);

  const base = env.apiBaseUrl.replace(/\/$/, "");
  return { ok: true, url: `${base}${startPath}?${params.toString()}` };
}

/** Starts the full-page redirect to the backend. Returns the start result for UI state. */
export function startGoogleSignIn(rawNext?: string | null): GoogleAuthStart {
  const start = buildGoogleAuthStart(rawNext);
  if (start.ok) browserNavigation.assign(start.url);
  return start;
}

export type GoogleAuthErrorInfo = { title: string; description: string; cancelled: boolean };

/**
 * Maps the `error` parameter of the completion redirect to a message. `access_denied` is what
 * Google returns when the user closes/cancels the account chooser.
 */
export function describeGoogleAuthError(code: string): GoogleAuthErrorInfo {
  switch (code) {
    case "access_denied":
      return {
        title: "Anmeldung abgebrochen",
        description: "Die Anmeldung mit Google wurde abgebrochen. Du kannst es jederzeit erneut versuchen.",
        cancelled: true,
      };
    case "email_not_verified":
      return {
        title: "E-Mail-Adresse nicht bestätigt",
        description: "Dein Google-Konto hat keine bestätigte E-Mail-Adresse. Bitte bestätige sie bei Google und versuche es erneut.",
        cancelled: false,
      };
    case "account_link_required":
      return {
        title: "Konto bereits vorhanden",
        description: "Zu dieser E-Mail-Adresse gibt es bereits ein Konto. Melde dich mit deinem Passwort an, um Google zu verknüpfen.",
        cancelled: false,
      };
    case "signup_not_allowed":
      return {
        title: "Registrierung nicht möglich",
        description: "Mit diesem Google-Konto kann derzeit kein neues Konto angelegt werden.",
        cancelled: false,
      };
    default:
      return {
        title: "Anmeldung mit Google fehlgeschlagen",
        description: "Die Anmeldung konnte nicht abgeschlossen werden. Bitte versuche es erneut.",
        cancelled: false,
      };
  }
}

export function googleUnavailableMessage(reason: GoogleAuthUnavailableReason): string {
  return reason === "mock-mode"
    ? "Die Anmeldung mit Google ist im lokalen Modus ohne Server nicht verfügbar."
    : "Die Anmeldung mit Google ist derzeit nicht eingerichtet.";
}
