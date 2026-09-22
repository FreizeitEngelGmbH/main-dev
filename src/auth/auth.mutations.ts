import type { QueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/modules/auth.api";
import { queryKeys } from "@/api/queryKeys";
import type { LoginRequest, RegisterRequest } from "@/auth/auth.types";

async function authoritativeUser() {
  return authApi.currentUser();
}

export async function loginAndRestore(credentials: LoginRequest) {
  await authApi.login(credentials);
  return authoritativeUser();
}

export async function registerAndRestore(data: RegisterRequest) {
  await authApi.register(data);
  return authoritativeUser();
}

export function clearProtectedQueryData(queryClient: QueryClient): void {
  const protectedRoots = new Set(["admin", "partner", "bookings", "favorites", "users"]);
  queryClient.removeQueries({
    predicate: ({ queryKey }) => {
      const root = queryKey[0];
      if (typeof root !== "string") return false;
      return protectedRoots.has(root)
        || root.startsWith("/api/admin")
        || root.startsWith("/api/partner")
        || root.startsWith("/api/bookings")
        || root.startsWith("/api/favorites");
    },
  });
}

export async function logoutAndClear(queryClient: QueryClient, additionalClients: QueryClient[] = []): Promise<void> {
  await authApi.logout();
  clearProtectedQueryData(queryClient);
  additionalClients.forEach(clearProtectedQueryData);
  queryClient.setQueryData(queryKeys.auth.user, null);
}
