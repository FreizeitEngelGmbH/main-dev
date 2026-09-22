import { mockFetch } from "./mockEngine";
import { env } from "@/config/env";
import { notifyUnauthorized } from "@/api/sessionEvents";

/**
 * Several copied admin pages (admin-apm.tsx, admin-documents.tsx,
 * admin-eversport.tsx, admin-knowledge-base.tsx, admin-materials.tsx, and
 * others — the ones with custom `queryFn`s) call the browser's `fetch()`
 * directly instead of going through `apiRequest`/`getQueryFn`. Patching
 * the global `fetch` here — once, before the app renders — means every
 * admin page is mocked consistently regardless of which fetch path it
 * uses, without editing any of those page components.
 *
 * Only same-origin `/api/...` calls are intercepted; anything else (fonts,
 * external services) passes through to the real `fetch` untouched. When
 * `env.useMockApi` is false, this is a no-op passthrough.
 */
const realFetch = window.fetch.bind(window);

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  if (!url.startsWith("/api")) {
    return realFetch(input, init);
  }

  // Compatibility for legacy page-level fetch calls: even before each page is
  // migrated to apiClient, relative API requests honor the configured backend
  // and always participate in the cookie session.
  if (!env.useMockApi) {
    const response = await realFetch(`${env.apiBaseUrl.replace(/\/$/, "")}${url}`, {
      ...init,
      credentials: "include",
    });
    if (response.status === 401) notifyUnauthorized(url.split("?")[0]);
    return response;
  }

  const method = init?.method ?? "GET";
  let body: unknown;
  if (init?.body) {
    try {
      body = JSON.parse(init.body as string);
    } catch {
      body = init.body;
    }
  }

  const mockRes = await mockFetch(method, url, body);
  const data = await mockRes.json();
  return new Response(JSON.stringify(data), {
    status: mockRes.status,
    headers: { "Content-Type": "application/json" },
  });
};
