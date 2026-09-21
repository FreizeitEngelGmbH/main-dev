import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface FavoritesButtonProps {
  experienceId: number;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export function FavoritesButton({ 
  experienceId, 
  variant = "ghost", 
  size = "icon",
  className,
  showText = false
}: FavoritesButtonProps) {
  const { user } = useAuth();
  const { addFavorite, removeFavorite, isAddingFavorite, isRemovingFavorite, isFavoriteQuery } = useFavorites();
  
  const { data: isFavorite = false, isLoading } = isFavoriteQuery(experienceId);
  
  if (!user) {
    // Show button for non-authenticated users but prompt login
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => {
          // Navigate to auth page or show login prompt
          window.location.href = "/auth";
        }}
        className={cn(className)}
        aria-label="Anmelden um Favoriten zu verwenden"
      >
        <Heart 
          className={cn(
            "h-4 w-4 transition-colors text-muted-foreground hover:text-red-500"
          )} 
        />
        {showText && (
          <span className="ml-2">
            Merken
          </span>
        )}
      </Button>
    );
  }
  
  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(experienceId);
    } else {
      addFavorite(experienceId);
    }
  };
  
  const isLoading_ = isLoading || isAddingFavorite || isRemovingFavorite;
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      disabled={isLoading_}
      className={cn(className)}
      aria-label={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
    >
      <Heart 
        className={cn(
          "h-4 w-4 transition-colors",
          isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
        )} 
      />
      {showText && (
        <span className="ml-2">
          {isFavorite ? "Favorit" : "Merken"}
        </span>
      )}
    </Button>
  );
}