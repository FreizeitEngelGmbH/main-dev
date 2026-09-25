import { describe, expect, it } from "vitest";
import { canRoleAccessPath, resolvePostLoginPath, safeNextPath } from "@/auth/redirects";

describe("safeNextPath", () => {
  it.each([
    ["/partner/dashboard", "/partner/dashboard"],
    ["/admin/crm?tab=partners#notes", "/admin/crm?tab=partners#notes"],
    ["/gruppen/2", "/gruppen/2"],
  ])("keeps local path %s", (raw, expected) => {
    expect(safeNextPath(raw)).toBe(expected);
  });

  it.each([
    "https://evil.example/phish",
    "//evil.example",
    "/\\evil.example",
    "\\\\evil.example",
    "javascript:alert(1)",
    "/%2F%2Fevil.example",
    "/%252F%252Fevil.example",
    "/%2Fjavascript:alert(1)",
    "/api/user",
    "/auth",
    "/auth/google/complete",
    "relative/path",
    "",
    null,
  ])("rejects %s", (raw) => {
    expect(safeNextPath(raw)).toBeNull();
  });
});

describe("role-aware redirects", () => {
  it("mirrors the router's role gates", () => {
    expect(canRoleAccessPath("admin", "/admin/crm")).toBe(true);
    expect(canRoleAccessPath("partner", "/admin/crm")).toBe(false);
    expect(canRoleAccessPath("partner", "/partner/inquiries")).toBe(true);
    expect(canRoleAccessPath("user", "/partner/dashboard")).toBe(false);
    expect(canRoleAccessPath("user", "/partner")).toBe(true);
    expect(canRoleAccessPath("user", "/home")).toBe(true);
  });

  it("sends each role to its own home without a next path", () => {
    expect(resolvePostLoginPath("admin", null)).toBe("/admin");
    expect(resolvePostLoginPath("partner", null)).toBe("/partner/dashboard");
    expect(resolvePostLoginPath("user", null)).toBe("/");
  });

  it("honours a permitted next path and falls back for forbidden or unsafe ones", () => {
    expect(resolvePostLoginPath("partner", "/partner/scanner")).toBe("/partner/scanner");
    expect(resolvePostLoginPath("partner", "/admin")).toBe("/partner/dashboard");
    expect(resolvePostLoginPath("user", "/admin/crm")).toBe("/");
    expect(resolvePostLoginPath("admin", "https://evil.example")).toBe("/admin");
  });
});
