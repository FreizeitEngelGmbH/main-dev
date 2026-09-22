import { apiClient } from "@/api/client";
import { withQuery } from "@/api/types";

export interface AvailabilitySlot {
  id: number;
  experienceId: number;
  date: string;
  startTime: string;
  endTime?: string | null;
  capacity?: number | null;
  availableCapacity?: number | null;
  available?: boolean;
}

export const availabilityApi = {
  list: (experienceId: number, date?: string, signal?: AbortSignal) =>
    apiClient.request<AvailabilitySlot[]>(
      withQuery("/api/availability", { experienceId, date }),
      { signal },
    ),
} as const;

