import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/partner/queryClient";
import { Experience } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: favorites = [],
    isLoading,
    error,
  } = useQuery<Experience[]>({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async (experienceId: number) => {
      const res = await apiRequest("POST", `/api/favorites/${experienceId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Zu Favoriten hinzugefügt",
        description: "Das Erlebnis wurde zu Ihrer Wunschliste hinzugefügt.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Hinzufügen zu Favoriten",
        variant: "destructive",
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (experienceId: number) => {
      const res = await apiRequest("DELETE", `/api/favorites/${experienceId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Aus Favoriten entfernt",
        description: "Das Erlebnis wurde aus Ihrer Wunschliste entfernt.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Entfernen aus Favoriten",
        variant: "destructive",
      });
    },
  });

  const isFavoriteQuery = (experienceId: number) => {
    return useQuery({
      queryKey: ["/api/favorites", experienceId, "check"],
      queryFn: async () => {
        const res = await apiRequest("GET", `/api/favorites/${experienceId}/check`);
        const data = await res.json();
        return data.isFavorite;
      },
      enabled: !!user,
    });
  };

  return {
    favorites,
    isLoading,
    error,
    addFavorite: addFavoriteMutation.mutate,
    removeFavorite: removeFavoriteMutation.mutate,
    isAddingFavorite: addFavoriteMutation.isPending,
    isRemovingFavorite: removeFavoriteMutation.isPending,
    isFavoriteQuery,
  };
}
