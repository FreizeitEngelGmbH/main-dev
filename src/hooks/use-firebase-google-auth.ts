import { useCallback, useEffect, useRef, useState } from "react";
import {
  firebaseGoogleAuthService,
  FirebaseGoogleAuthError,
  type FirebaseGoogleErrorKind,
  type FirebaseGoogleUser,
} from "@/auth/firebase/firebaseGoogleAuthService";

export const FIREBASE_GOOGLE_MESSAGES: Record<FirebaseGoogleErrorKind, string> = {
  cancelled: "Die Google-Anmeldung wurde abgebrochen.",
  "popup-blocked": "Das Google-Anmeldefenster wurde vom Browser blockiert. Bitte erlaube Pop-ups für diese Seite und versuche es erneut.",
  "unauthorized-domain": "Diese Domain ist für die Google-Anmeldung nicht freigegeben (Firebase: autorisierte Domains).",
  "not-configured": "Die Anmeldung mit Google ist derzeit nicht eingerichtet (Firebase-Konfiguration fehlt).",
  network: "Keine Verbindung zu Google. Bitte prüfe deine Internetverbindung und versuche es erneut.",
  "provider-disabled": "Die Google-Anmeldung ist im Firebase-Projekt nicht aktiviert.",
  "account-exists": "Zu dieser E-Mail-Adresse gibt es bereits ein Konto mit einer anderen Anmeldemethode.",
  failed: "Die Anmeldung mit Google ist fehlgeschlagen. Bitte versuche es erneut.",
};

export type FirebaseGoogleNotice = { kind: FirebaseGoogleErrorKind; message: string; severity: "info" | "error"; code?: string };

/**
 * Separate preview state for Firebase Google account selection. It never touches the
 * FreizeitEngel server session (AuthProvider / GET /api/user) and assigns no role.
 */
export function useFirebaseGoogleAuth() {
  const configured = firebaseGoogleAuthService.isConfigured();
  const [user, setUser] = useState<FirebaseGoogleUser | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<FirebaseGoogleNotice | null>(null);
  const pendingRef = useRef(false);

  const report = useCallback((error: unknown) => {
    const kind = error instanceof FirebaseGoogleAuthError ? error.kind : "failed";
    const code = error instanceof FirebaseGoogleAuthError ? error.code : undefined;
    setNotice({ kind, message: FIREBASE_GOOGLE_MESSAGES[kind], severity: kind === "cancelled" ? "info" : "error", code });
  }, []);

  useEffect(() => {
    if (!configured) return;
    let active = true;
    // Pick up a redirect-fallback result once, then keep the session-scoped user in sync.
    firebaseGoogleAuthService
      .completeRedirect()
      .then((redirected) => {
        if (active && redirected) setUser(redirected);
      })
      .catch((error) => {
        if (active) report(error);
      });
    const unsubscribe = firebaseGoogleAuthService.subscribe((next) => {
      if (active) setUser(next);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [configured, report]);

  const signIn = useCallback(async () => {
    if (pendingRef.current) return;
    setNotice(null);
    if (!configured) {
      setNotice({ kind: "not-configured", message: FIREBASE_GOOGLE_MESSAGES["not-configured"], severity: "error" });
      return;
    }
    pendingRef.current = true;
    setPending(true);
    let redirecting = false;
    try {
      const result = await firebaseGoogleAuthService.signInWithGoogle();
      if (result === "redirecting") {
        redirecting = true; // the page navigates to Google; keep the button disabled
        return;
      }
      setUser(result);
    } catch (error) {
      report(error);
    } finally {
      if (!redirecting) {
        pendingRef.current = false;
        setPending(false);
      }
    }
  }, [configured, report]);

  const signOut = useCallback(async () => {
    setNotice(null);
    try {
      await firebaseGoogleAuthService.signOut();
      setUser(null);
    } catch (error) {
      report(error);
    }
  }, [report]);

  return { configured, user, pending, notice, signIn, signOut };
}
