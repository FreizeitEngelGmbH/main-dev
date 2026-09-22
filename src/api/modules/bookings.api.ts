import { apiClient } from "@/api/client";
import type { Booking } from "@shared/schema";

// Creation remains intentionally structural: guest and authenticated booking
// fields vary by booking archetype and the backend source is not in this repo.
export type CreateBookingRequest = Omit<Booking, "id" | "createdAt">;

export const bookingsApi = {
  list: (signal?: AbortSignal) =>
    apiClient.request<Booking[]>("/api/bookings", { signal }),
  create: (data: CreateBookingRequest, signal?: AbortSignal) =>
    apiClient.request<Booking, CreateBookingRequest>("/api/bookings", {
      method: "POST",
      body: data,
      signal,
    }),
  updateStatus: (id: number, status: string, signal?: AbortSignal) =>
    apiClient.request<Booking, { status: string }>(`/api/bookings/${id}/status`, {
      method: "PUT",
      body: { status },
      signal,
    }),
} as const;

