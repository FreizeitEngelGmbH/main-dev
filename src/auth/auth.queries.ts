import { isApiError } from "@/api/errors";
import { authApi } from "@/api/modules/auth.api";
import { queryKeys } from "@/api/queryKeys";
import type { AuthUser } from "@/auth/auth.types";

export const authUserQueryOptions = {
  queryKey: queryKeys.auth.user,
  queryFn: async ({ signal }: { signal: AbortSignal }): Promise<AuthUser | null> => {
    try {
      return await authApi.currentUser(signal);
    } catch (error) {
      if (isApiError(error) && error.status === 401) return null;
      throw error;
    }
  },
  retry: false,
  staleTime: 0,
  refetchOnWindowFocus: true,
} as const;
