/**
 * A tiny in-memory HTTP router that stands in for the real backend.
 *
 * `src/lib/queryClient.ts` calls `mockFetch(method, url, body)` instead of
 * the browser's `fetch` when `config.useMockApi` is true (see
 * `src/config/env.ts`). Every `useQuery`/`apiRequest` call in the copied
 * admin page components is unchanged — they still call the exact same URL
 * strings the real API uses — so swapping mock -> real later is just
 * flipping that one flag (see README.md).
 *
 * Each domain under `src/mocks/domains/*.ts` calls `registerMock` (or the
 * `registerCrud` helper in `crudStore.ts`) once, at module load time, to
 * wire its own routes.
 */

export type MockHandler = (
  params: Record<string, string>,
  query: URLSearchParams,
  body: unknown
) => unknown | Promise<unknown>;

export class MockApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

interface Route {
  method: string;
  paramNames: string[];
  regex: RegExp;
  handler: MockHandler;
}

const routes: Route[] = [];

function compilePath(path: string): { regex: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];
  const escaped = path
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        paramNames.push(segment.slice(1));
        return "([^/]+)";
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return { regex: new RegExp(`^${escaped}$`), paramNames };
}

/** Register one mock route. Later registrations for the same (method, path) win, so a domain file can override a generic CRUD route with a bespoke handler if needed. */
export function registerMock(method: string, path: string, handler: MockHandler): void {
  const { regex, paramNames } = compilePath(path);
  routes.push({ method: method.toUpperCase(), paramNames, regex, handler });
}

export interface MockResponse {
  status: number;
  ok: boolean;
  // Typed `any`, matching the real DOM `Response.json()` signature exactly —
  // callers (admin pages written against the real fetch API) rely on that
  // looseness, e.g. `useQuery` inferring its type from an untyped `.json()`.
  json: () => Promise<any>;
  text: () => Promise<string>;
}

function makeResponse(status: number, data: unknown): MockResponse {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => data,
    text: async () => (typeof data === "string" ? data : JSON.stringify(data)),
  };
}

const ARTIFICIAL_LATENCY_MS = 120;

/** Finds the most-recently-registered matching route (so overrides win) and invokes it. */
export async function mockFetch(method: string, url: string, body?: unknown): Promise<MockResponse> {
  await new Promise((r) => setTimeout(r, ARTIFICIAL_LATENCY_MS));

  const [pathPart, queryPart] = url.split("?");
  const query = new URLSearchParams(queryPart || "");
  const upperMethod = method.toUpperCase();

  for (let i = routes.length - 1; i >= 0; i--) {
    const route = routes[i];
    if (route.method !== upperMethod) continue;
    const match = route.regex.exec(pathPart);
    if (!match) continue;
    const params: Record<string, string> = {};
    route.paramNames.forEach((name, idx) => {
      params[name] = decodeURIComponent(match[idx + 1]);
    });
    try {
      const data = await route.handler(params, query, body);
      return makeResponse(200, data ?? {});
    } catch (err) {
      if (err instanceof MockApiError) {
        return makeResponse(err.status, { message: err.message });
      }
      return makeResponse(500, { message: err instanceof Error ? err.message : "Mock handler error" });
    }
  }

  return makeResponse(404, { message: `[mock] No handler registered for ${upperMethod} ${pathPart}` });
}
