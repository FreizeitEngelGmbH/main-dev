import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

/**
 * "Meine Favoriten" (`/favorites`), adapted from the source app's favorites-page.tsx
 * with the same layout and texts.
 *
 * STATIC: the source loads the list from /api/favorites. Favorites cannot be saved
 * in this build, so signed-in users see the page's own empty state and signed-out
 * users the login prompt. The layout comes from the route (MainLayout), as for
 * every other page here.
 */
function FavoritesContent() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Melden Sie sich an</h2>
        <p className="text-muted-foreground mb-6">
          Um Ihre Favoriten zu verwalten, müssen Sie sich anmelden.
        </p>
        <Link href="/auth?next=%2Ffavorites">
          <Button>Jetzt anmelden</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">Noch keine Favoriten</h2>
      <p className="text-muted-foreground mb-6">
        Entdecken Sie spannende Erlebnisse und fügen Sie sie zu Ihrer Wunschliste hinzu.
      </p>
      <Link href="/search">
        <Button>Erlebnisse entdecken</Button>
      </Link>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meine Favoriten</h1>
        <p className="text-muted-foreground">
          Ihre gespeicherten Erlebnisse und Aktivitäten
        </p>
      </div>

      <FavoritesContent />
    </div>
  );
}
