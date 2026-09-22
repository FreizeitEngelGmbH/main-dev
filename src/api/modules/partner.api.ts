import { apiClient } from "@/api/client";
import type { Booking, Experience, Partner } from "@shared/schema";

export interface PartnerDashboardStats {
  [key: string]: unknown;
}

export const partnerApi = {
  profile: (signal?: AbortSignal) =>
    apiClient.request<Partner>("/api/partner/profile", { signal }),
  stats: (signal?: AbortSignal) =>
    apiClient.request<PartnerDashboardStats>("/api/partner/stats", { signal }),
  bookings: (signal?: AbortSignal) =>
    apiClient.request<Booking[]>("/api/partner/bookings", { signal }),
  experiences: (signal?: AbortSignal) =>
    apiClient.request<Experience[]>("/api/partner/experiences", { signal }),
} as const;

