import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { env } from "@/config/env";
import { mockFetch } from "@/mocks/mockEngine";
import "@/mocks/registerAll";

async function throwIfResNotOk(res: Response | Awaited<ReturnType<typeof mockFetch>>) {
  if (!res.ok) {
    const text = (await res.text()) || String(res.status);
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Same signature as the source project's `apiRequest` — every admin page
 * calls this unchanged. Internally it routes to the mock engine or a real
 * `fetch` depending on `env.useMockApi`, so nothing above this layer knows
 * or cares which one is answering.
 */
export async function apiRequest(method: string, url: string, data?: unknown | undefined) {
  if (env.useMockApi) {
    const res = await mockFetch(method, url, data);
    await throwIfResNotOk(res);
    return res;
  }

  const res = await fetch(`${env.apiBaseUrl}${url}`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: { on401: UnauthorizedBehavior }) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const res = env.useMockApi
      ? await mockFetch("GET", url)
      : await fetch(`${env.apiBaseUrl}${url}`, { credentials: "include" });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
