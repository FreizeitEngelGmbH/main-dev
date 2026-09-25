import { Link } from "wouter";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { FirebaseGoogleUser } from "@/auth/firebase/firebaseGoogleAuthService";

function initials(user: FirebaseGoogleUser): string {
  const source = user.displayName?.trim() || user.email?.trim() || "?";
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/**
 * Firebase Google account selection preview: shows only safe profile fields. This account is not
 * linked to a FreizeitEngel account and carries no Admin/Partner role or server session.
 */
export function FirebaseGoogleAccountCard({
  user,
  onSignOut,
}: {
  user: FirebaseGoogleUser;
  onSignOut: () => void;
}) {
  const name = user.displayName || user.email || "Google-Konto";
  return (
    <div className="rounded-lg border p-4" data-testid="firebase-google-account">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          {user.photoURL && <AvatarImage src={user.photoURL} alt="" referrerPolicy="no-referrer" />}
          <AvatarFallback data-testid="firebase-google-avatar-fallback">{initials(user)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Mit Google angemeldet</p>
          <p className="font-semibold truncate">{name}</p>
          {user.email && <p className="text-sm text-muted-foreground truncate">{user.email}</p>}
        </div>
      </div>

      <p className={`mt-3 flex items-center gap-1.5 text-sm ${user.emailVerified ? "text-green-700" : "text-amber-700"}`}>
        {user.emailVerified ? (
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
        )}
        {user.emailVerified ? "E-Mail-Adresse bestätigt" : "E-Mail-Adresse nicht bestätigt"}
      </p>

      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
        <dt>Firebase-UID</dt>
        <dd className="font-mono truncate" data-testid="firebase-google-uid">{user.uid}</dd>
        <dt>Anbieter</dt>
        <dd className="font-mono" data-testid="firebase-google-provider">{user.providerId}</dd>
      </dl>

      <p className="mt-2 text-xs text-muted-foreground">
        Vorschau: Dieses Google-Konto ist noch nicht mit einem FreizeitEngel-Konto verbunden und hat keine
        Admin- oder Partner-Rechte.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" onClick={onSignOut}>
          Abmelden
        </Button>
        <Link href="/home">
          <Button type="button" className="w-full">
            Weiter
          </Button>
        </Link>
      </div>
    </div>
  );
}
