import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { isApiError } from "@/api/errors";
import type { HttpMethod } from "@/api/types";

/**
 * Same signature as the source project's `apiRequest` — every admin page
 * calls this unchanged. Internally it routes to the mock engine or a real
 * `fetch` depending on `env.useMockApi`, so nothing above this layer knows
 * or cares which one is answering.
 */
export async function apiRequest(method: string, url: string, data?: unknown) {
  return apiClient.raw(url, {
    method: method.toUpperCase() as HttpMethod,
    body: data,
  });
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: { on401: UnauthorizedBehavior }) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey, signal }) => {
    const url = queryKey[0] as string;
    try {
      return await apiClient.request<any>(url, { signal });
    } catch (error) {
      if (unauthorizedBehavior === "returnNull" && isApiError(error) && error.status === 401) {
        return null as any;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Typed `<any>` here (not just left to infer) so that a page's
      // `useQuery({ queryKey: [...] })` call with no explicit generic and
      // no local queryFn — several admin pages do this, same as they
      // would against the real API's untyped JSON response — resolves to
      // `data: any` instead of TypeScript's `{}` inference fallback.
      queryFn: getQueryFn<any>({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
