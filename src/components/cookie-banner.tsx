import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Cookie, Shield } from "lucide-react";
import {
  COOKIE_SETTINGS_EVENT,
  DEFAULT_COOKIE_CONSENT,
  getStoredCookieConsent,
  saveCookieConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";

function CookieCategory({
  id,
  title,
  description,
  checked,
  disabled = false,
  onCheckedChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange?.(value === true)}
        className="mt-0.5"
      />
      <div className="space-y-1">
        <Label htmlFor={id} className="font-semibold text-gray-900">
          {title}
          {disabled && (
            <span className="ml-2 text-xs font-normal text-gray-500">Immer aktiv</span>
          )}
        </Label>
        <p className="text-sm leading-relaxed text-gray-600">{description}</p>
      </div>
    </div>
  );
}

export function CookieBanner() {
  const [location] = useLocation();
  const [consent, setConsent] = useState<CookieConsent | null | undefined>(undefined);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState<CookieConsent>(DEFAULT_COOKIE_CONSENT);
  const privacyHref =
    location === "/" || location === "/landing" || location.startsWith("/landing/")
      ? "/landing/datenschutz"
      : "/datenschutz";

  useEffect(() => {
    setConsent(getStoredCookieConsent());

    const handleOpenSettings = () => {
      setDraft(getStoredCookieConsent() ?? DEFAULT_COOKIE_CONSENT);
      setSettingsOpen(true);
    };

    window.addEventListener(COOKIE_SETTINGS_EVENT, handleOpenSettings);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, handleOpenSettings);
  }, []);

  const acceptNecessary = () => {
    const savedConsent = saveCookieConsent(DEFAULT_COOKIE_CONSENT);
    setConsent(savedConsent);
    setSettingsOpen(false);
  };

  const acceptAll = () => {
    const savedConsent = saveCookieConsent({ analytics: true, marketing: true });
    setConsent(savedConsent);
    setSettingsOpen(false);
  };

  const openSettings = () => {
    setDraft(consent ?? DEFAULT_COOKIE_CONSENT);
    setSettingsOpen(true);
  };

  const saveSettings = () => {
    const savedConsent = saveCookieConsent(draft);
    setConsent(savedConsent);
    setSettingsOpen(false);
  };

  if (consent === undefined) {
    return null;
  }

  return (
    <>
      {consent === null && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
              <div className="flex flex-1 items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-cyan-100">
                  <Cookie className="h-5 w-5 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-gray-900">Cookie-Einstellungen</h3>
                  <p className="text-sm text-gray-600">
                    Notwendige Speichertechnologien sind für Login, Sitzung und gewünschte
                    Funktionen erforderlich. Derzeit setzen wir keine Analyse- oder
                    Marketingtechnologien ein.
                  </p>
                  <button
                    type="button"
                    onClick={openSettings}
                    className="mt-1 text-sm text-cyan-600 underline hover:text-cyan-700"
                  >
                    Einstellungen anzeigen
                  </button>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={acceptNecessary}
                  className="text-gray-600"
                >
                  Nur notwendige
                </Button>
                <Button
                  size="sm"
                  onClick={acceptAll}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Alle akzeptieren
                </Button>
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500">
               Mehr Informationen findest du in unserer{" "}
               <Link href={privacyHref} className="text-cyan-600 hover:underline">
                Datenschutzerklärung
               </Link>
              .
            </p>
          </div>
        </div>
      )}

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cookie-Einstellungen</DialogTitle>
            <DialogDescription>
              Wähle aus, welche Kategorien zusätzlich zu den notwendigen
              Speichertechnologien erlaubt sein sollen. Deine Auswahl kannst du jederzeit
              über die Datenschutzerklärung ändern.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <CookieCategory
              id="cookie-necessary"
              title="Notwendige Speichertechnologien"
              description="Diese sind für Session-Verwaltung, Login-Status und grundlegende gewünschte Funktionen erforderlich."
              checked
              disabled
            />
            <CookieCategory
              id="cookie-analytics"
              title="Analyse"
              description="Derzeit ist keine Analyse-Technologie aktiv. Eine spätere Analyse-Einbindung würde erst nach deiner Zustimmung geladen."
              checked={draft.analytics}
              onCheckedChange={(analytics) => setDraft((current) => ({ ...current, analytics }))}
            />
            <CookieCategory
              id="cookie-marketing"
              title="Marketing"
              description="Derzeit ist keine Marketing-Technologie aktiv. Eine spätere Marketing-Einbindung würde erst nach deiner Zustimmung geladen."
              checked={draft.marketing}
              onCheckedChange={(marketing) => setDraft((current) => ({ ...current, marketing }))}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={acceptNecessary}>
              Nur notwendige
            </Button>
            <Button onClick={saveSettings}>Auswahl speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}