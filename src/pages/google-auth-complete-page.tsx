import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useSearch } from "wouter";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/api/queryKeys";
import { authUserQueryOptions } from "@/auth/auth.queries";
import { describeGoogleAuthError, type GoogleAuthErrorInfo } from "@/auth/google-auth";
import { resolvePostLoginPath, safeNextPath } from "@/auth/redirects";

/**
 * Landing route after the backend finished Google sign-in (GOOGLE_AUTH_COMPLETE_PATH).
 * The backend redirects here either with `?error=<code>` or after it has established the normal
 * session cookie. The page never reads tokens from the URL: it refreshes the shared auth query,
 * trusts only GET /api/user, and routes by the role the backend returned.
 */
export default function GoogleAuthCompletePage() {
  const params = new URLSearchParams(useSearch());
  const errorCode = params.get("error");
  const next = safeNextPath(params.get("next"));
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [failure, setFailure] = useState<GoogleAuthErrorInfo | null>(
    errorCode ? describeGoogleAuthError(errorCode) : null,
  );
  const started = useRef(false);

  useEffect(() => {
    if (errorCode || started.current) return;
    started.current = true;
    (async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
        const user = await queryClient.fetchQuery(authUserQueryOptions);
        if (user) {
          navigate(resolvePostLoginPath(user.role, next), { replace: true });
          return;
        }
        setFailure({
          title: "Anmeldung mit Google fehlgeschlagen",
          description: "Es wurde keine Sitzung aufgebaut. Bitte versuche es erneut.",
          cancelled: false,
        });
      } catch {
        setFailure({
          title: "Verbindung fehlgeschlagen",
          description: "Die Anmeldung konnte wegen eines Netzwerkfehlers nicht abgeschlossen werden. Bitte versuche es erneut.",
          cancelled: false,
        });
      }
    })();
  }, [errorCode, next, navigate, queryClient]);

  const retryHref = next ? `/auth?next=${encodeURIComponent(next)}` : "/auth";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          {failure ? (
            <>
              <h1 className="text-xl font-bold mb-2">{failure.title}</h1>
              <p className="text-muted-foreground mb-4" role="alert">{failure.description}</p>
              <Link href={retryHref}>
                <Button>{failure.cancelled ? "Zurück zur Anmeldung" : "Erneut versuchen"}</Button>
              </Link>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4" role="status" aria-live="polite">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Anmeldung wird abgeschlossen …</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
