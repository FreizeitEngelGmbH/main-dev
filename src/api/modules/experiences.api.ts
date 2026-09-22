import { apiClient } from "@/api/client";
import { withQuery } from "@/api/types";
import type { Category, Experience } from "@shared/schema";

export interface ExperienceFilters {
  featured?: boolean;
  city?: string;
  category?: string;
  search?: string;
}

export const experiencesApi = {
  list: (filters: ExperienceFilters = {}, signal?: AbortSignal) =>
    apiClient.request<Experience[]>(withQuery("/api/experiences", filters), { signal }),
  get: (id: number, signal?: AbortSignal) =>
    apiClient.request<Experience>(`/api/experiences/${id}`, { signal }),
  categories: (signal?: AbortSignal) =>
    apiClient.request<Category[]>("/api/categories", { signal }),
  cities: (signal?: AbortSignal) =>
    apiClient.request<string[]>("/api/cities", { signal }),
} as const;

