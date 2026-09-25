import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const envState = vi.hoisted(() => ({ useMockApi: false, apiBaseUrl: "", googleAuthStartPath: "/api/auth/google" }));
vi.mock("@/config/env", () => ({ env: envState }));

import { browserNavigation, buildGoogleAuthStart, describeGoogleAuthError, startGoogleSignIn } from "@/auth/google-auth";

describe("Google sign-in start", () => {
  beforeEach(() => {
    envState.useMockApi = false;
    envState.apiBaseUrl = "";
    envState.googleAuthStartPath = "/api/auth/google";
  });
  afterEach(() => vi.restoreAllMocks());

  it("always asks Google for the account chooser", () => {
    const start = buildGoogleAuthStart(null);
    expect(start.ok).toBe(true);
    if (start.ok) {
      const url = new URL(start.url, "http://app.test");
      expect(url.pathname).toBe("/api/auth/google");
      expect(url.searchParams.get("prompt")).toBe("select_account");
      expect(url.searchParams.has("next")).toBe(false);
    }
  });

  it("preserves a safe next path and drops unsafe ones", () => {
    const safe = buildGoogleAuthStart("/partner/inquiries");
    const unsafe = buildGoogleAuthStart("https://evil.example");
    expect(safe.ok && new URL(safe.url, "http://app.test").searchParams.get("next")).toBe("/partner/inquiries");
    expect(unsafe.ok && new URL(unsafe.url, "http://app.test").searchParams.has("next")).toBe(false);
  });

  it("uses the configured API origin", () => {
    envState.apiBaseUrl = "https://api.staging.example/";
    const start = buildGoogleAuthStart(null);
    expect(start.ok && start.url.startsWith("https://api.staging.example/api/auth/google?")).toBe(true);
  });

  it.each([
    ["", "not-configured"],
    ["/auth/google", "not-configured"],
    ["https://evil.example/api/auth/google", "not-configured"],
  ])("reports missing or invalid configuration (%s)", (path, reason) => {
    envState.googleAuthStartPath = path;
    expect(buildGoogleAuthStart(null)).toEqual({ ok: false, reason });
  });

  it("is unavailable in local mock mode", () => {
    envState.useMockApi = true;
    expect(buildGoogleAuthStart(null)).toEqual({ ok: false, reason: "mock-mode" });
  });

  it("navigates the page only when configured", () => {
    const assign = vi.spyOn(browserNavigation, "assign").mockImplementation(() => {});
    startGoogleSignIn("/admin");
    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign.mock.calls[0][0]).toContain("prompt=select_account");
    envState.googleAuthStartPath = "";
    startGoogleSignIn(null);
    expect(assign).toHaveBeenCalledTimes(1);
  });

  it("describes cancellation separately from failures", () => {
    expect(describeGoogleAuthError("access_denied").cancelled).toBe(true);
    expect(describeGoogleAuthError("server_error").cancelled).toBe(false);
  });
});
