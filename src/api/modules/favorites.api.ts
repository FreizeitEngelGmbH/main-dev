import { apiClient } from "@/api/client";
import type { Experience } from "@shared/schema";

export const favoritesApi = {
  list: (signal?: AbortSignal) =>
    apiClient.request<Experience[]>("/api/favorites", { signal }),
  add: (experienceId: number, signal?: AbortSignal) =>
    apiClient.request<unknown>(`/api/favorites/${experienceId}`, { method: "POST", signal }),
  remove: (experienceId: number, signal?: AbortSignal) =>
    apiClient.request<unknown>(`/api/favorites/${experienceId}`, { method: "DELETE", signal }),
  check: (experienceId: number, signal?: AbortSignal) =>
    apiClient.request<{ isFavorite: boolean }>(`/api/favorites/${experienceId}/check`, { signal }),
} as const;

