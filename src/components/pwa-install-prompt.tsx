import { useEffect, useState } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "fe_pwa_install_dismissed_until";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedUntil && Date.now() < dismissedUntil) return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-ignore iOS
      window.navigator.standalone === true;
    if (standalone) return;

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    if (ios) {
      setIsIos(true);
      const t = setTimeout(() => setVisible(true), 5000);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const dismissFor = (days: number) => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + days * 24 * 3600 * 1000));
    setVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
      setDeferredPrompt(null);
    } else {
      dismissFor(7);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-md rounded-2xl border border-purple-200 bg-white p-4 shadow-2xl md:left-auto md:right-4"
      role="dialog"
      aria-label="App installieren"
      data-testid="pwa-install-prompt"
    >
      <button
        type="button"
        onClick={() => dismissFor(14)}
        aria-label="Schließen"
        className="absolute right-2 top-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        data-testid="pwa-install-close"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-500 text-white">
          <Smartphone className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">FreizeitEngel als App</h3>
          {isIos ? (
            <p className="mt-1 text-sm leading-snug text-slate-600">
              Tippe in Safari auf <span className="font-medium">Teilen</span> und dann auf{" "}
              <span className="font-medium">„Zum Home-Bildschirm"</span>, um FreizeitEngel wie eine App zu nutzen.
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm leading-snug text-slate-600">
                Installiere FreizeitEngel auf deinem Startbildschirm – schneller Zugriff, eigenes Icon, Vollbild.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={install}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  data-testid="pwa-install-button"
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  Installieren
                </Button>
                <Button
                  onClick={() => dismissFor(14)}
                  size="sm"
                  variant="ghost"
                  data-testid="pwa-install-later"
                >
                  Später
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
