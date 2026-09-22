import { apiClient } from "@/api/client";
import type { Partner, User } from "@shared/schema";

export interface AdminDashboardStats {
  totalExperiences: number;
  totalBookings: number;
  totalPartners: number;
  totalUsers: number;
  totalRevenue: number;
  bookingsByStatus: Record<string, number>;
}

export type AdminPartner = Partner & { user?: User };

export const adminApi = {
  dashboard: (signal?: AbortSignal) =>
    apiClient.request<AdminDashboardStats>("/api/admin/stats", { signal }),
  partners: (signal?: AbortSignal) =>
    apiClient.request<AdminPartner[]>("/api/admin/partners", { signal }),
} as const;

