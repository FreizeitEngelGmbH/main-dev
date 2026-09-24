export const COOKIE_CONSENT_STORAGE_KEY = "freizeitengel-cookie-consent";
const LEGACY_COOKIE_CONSENT_STORAGE_KEY = "cookie-consent";

export const COOKIE_SETTINGS_EVENT = "freizeitengel:open-cookie-settings";
export const COOKIE_CONSENT_CHANGED_EVENT = "freizeitengel:cookie-consent-changed";

export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export const DEFAULT_COOKIE_CONSENT: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function isCookieConsent(value: unknown): value is CookieConsent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const consent = value as Partial<CookieConsent>;
  return (
    consent.necessary === true &&
    typeof consent.analytics === "boolean" &&
    typeof consent.marketing === "boolean"
  );
}

export function getStoredCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  if (stored) {
    try {
      const parsed: unknown = JSON.parse(stored);
      if (isCookieConsent(parsed)) {
        return parsed;
      }
    } catch {
      // An invalid value is treated like no decision instead of enabling anything.
    }
  }

  // Keep visitors who already answered the old two-button banner from seeing it again.
  const legacyConsent = window.localStorage.getItem(LEGACY_COOKIE_CONSENT_STORAGE_KEY);
  if (legacyConsent === "accepted" || legacyConsent === "declined") {
    return {
      necessary: true,
      analytics: legacyConsent === "accepted",
      marketing: legacyConsent === "accepted",
    };
  }

  return null;
}

export function saveCookieConsent(
  consent: Pick<CookieConsent, "analytics" | "marketing">,
): CookieConsent {
  const normalizedConsent: CookieConsent = {
    necessary: true,
    analytics: Boolean(consent.analytics),
    marketing: Boolean(consent.marketing),
  };

  window.localStorage.setItem(
    COOKIE_CONSENT_STORAGE_KEY,
    JSON.stringify(normalizedConsent),
  );
  window.localStorage.removeItem(LEGACY_COOKIE_CONSENT_STORAGE_KEY);
  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, {
      detail: normalizedConsent,
    }),
  );

  return normalizedConsent;
}

export function openCookieSettings(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
  }
}