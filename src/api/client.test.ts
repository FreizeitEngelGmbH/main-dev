import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { onUnauthorized } from "@/api/sessionEvents";
import { authUserQueryOptions } from "@/auth/auth.queries";
import { loginAndRestore, logoutAndClear } from "@/auth/auth.mutations";

const user = {
  id: 7,
  username: "session-user",
  email: "user@example.com",
  fullName: "Session User",
  profileImage: null,
  role: "partner" as const,
  createdAt: "2026-01-01T00:00:00.000Z",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("session API client", () => {
  beforeEach(() => {
    vi.spyOn(window, "fetch");
  });

  it("includes credentials and never creates a Bearer header", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ok: true }));

    await apiClient.request("/api/example", { method: "POST", body: { value: 1 } });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(init?.credentials).toBe("include");
    const headers = new Headers(init?.headers);
    expect(headers.get("Authorization")).toBeNull();
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("does not add Content-Type when no JSON body is sent", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));
    await apiClient.request("/api/example");
    const headers = new Headers(vi.mocked(fetch).mock.calls[0][1]?.headers);
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("bootstraps a valid session", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(user));
    const result = await authUserQueryOptions.queryFn({ signal: new AbortController().signal });
    expect(result).toEqual(user);
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe("/api/user");
  });

  it("maps an unauthenticated bootstrap to logged out without retrying", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ message: "Not authenticated" }, 401));
    await expect(authUserQueryOptions.queryFn({ signal: new AbortController().signal })).resolves.toBeNull();
    expect(authUserQueryOptions.retry).toBe(false);
  });

  it("logs in and then refreshes authoritative user state", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
      .mockResolvedValueOnce(jsonResponse(user));

    await expect(loginAndRestore({ username: "session-user", password: "secret" })).resolves.toEqual(user);
    expect(vi.mocked(fetch).mock.calls.map(([url]) => url)).toEqual(["/api/login", "/api/user"]);
  });

  it("logout clears auth and protected query data", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));
    const client = new QueryClient();
    client.setQueryData(queryKeys.auth.user, user);
    client.setQueryData(queryKeys.admin.dashboard, { total: 1 });
    client.setQueryData(queryKeys.favorites.all, [{ id: 1 }]);

    await logoutAndClear(client);

    expect(client.getQueryData(queryKeys.auth.user)).toBeNull();
    expect(client.getQueryData(queryKeys.admin.dashboard)).toBeUndefined();
    expect(client.getQueryData(queryKeys.favorites.all)).toBeUndefined();
  });

  it("normalizes 403 without treating it as logout", async () => {
    const listener = vi.fn();
    const unsubscribe = onUnauthorized(listener);
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ message: "Forbidden" }, 403));

    await expect(apiClient.request("/api/admin/stats")).rejects.toMatchObject({
      status: 403,
      message: "Forbidden",
    });
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("expires a protected session once without looping on the bootstrap 401", async () => {
    const listener = vi.fn();
    const unsubscribe = onUnauthorized(listener);
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ message: "Expired" }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: "Not authenticated" }, 401));

    await expect(apiClient.request("/api/bookings")).rejects.toMatchObject({ status: 401 });
    await expect(authUserQueryOptions.queryFn({ signal: new AbortController().signal })).resolves.toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith("/api/bookings");
    unsubscribe();
  });
});
