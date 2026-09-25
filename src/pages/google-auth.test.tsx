import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";

// jsdom has no ResizeObserver; the auth page's Radix checkbox needs one to mount.
if (!("ResizeObserver" in globalThis)) {
  class ResizeObserverStub { observe() {} unobserve() {} disconnect() {} }
  Object.defineProperty(globalThis, "ResizeObserver", { value: ResizeObserverStub, configurable: true });
}

const envState = vi.hoisted(() => ({ useMockApi: false, apiBaseUrl: "", googleAuthStartPath: "/api/auth/google" }));
vi.mock("@/config/env", () => ({ env: envState }));

const authState = vi.hoisted(() => ({
  user: null,
  isLoading: false,
  loginMutation: { mutate: () => {}, isPending: false },
  registerMutation: { mutate: () => {}, isPending: false },
}));
vi.mock("@/hooks/use-auth", () => ({ useAuth: () => authState }));

const currentUser = vi.hoisted(() => vi.fn());
vi.mock("@/api/modules/auth.api", () => ({ authApi: { currentUser } }));

import GoogleAuthCompletePage from "@/pages/google-auth-complete-page";

const user = (role: "user" | "partner" | "admin") => ({
  id: 1, username: "g", email: "g@example.test", fullName: "Google User", profileImage: null, role, createdAt: null,
});

function renderComplete(search: string) {
  window.history.replaceState(null, "", `/auth/google/complete${search}`);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <GoogleAuthCompletePage />
    </QueryClientProvider>,
  );
}

let setItem: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  envState.useMockApi = false;
  envState.googleAuthStartPath = "/api/auth/google";
  currentUser.mockReset();
  setItem = vi.spyOn(Storage.prototype, "setItem");
});
afterEach(() => {
  // No Google or session token may ever be written to browser storage.
  expect(setItem).not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

describe("Google sign-in completion", () => {
  it.each([
    ["admin", "", "/admin"],
    ["partner", "", "/partner/dashboard"],
    ["partner", "?next=%2Fpartner%2Fscanner", "/partner/scanner"],
    ["partner", "?next=%2Fadmin%2Fcrm", "/partner/dashboard"],
    ["user", "?next=%2Fpartner%2Fdashboard", "/"],
  ] as const)("refreshes /api/user and routes a %s (%s) by backend role", async (role, search, expected) => {
    currentUser.mockResolvedValue(user(role));
    renderComplete(search);
    await waitFor(() => expect(window.location.pathname).toBe(expected));
    expect(currentUser).toHaveBeenCalledTimes(1);
  });

  it("handles cancellation without calling the backend", () => {
    renderComplete("?error=access_denied&next=%2Fpartner%2Finquiries");
    expect(screen.getByText("Anmeldung abgebrochen")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/auth?next=%2Fpartner%2Finquiries");
    expect(currentUser).not.toHaveBeenCalled();
  });

  it("shows backend errors with a retry", () => {
    renderComplete("?error=server_error");
    expect(screen.getByText("Anmeldung mit Google fehlgeschlagen")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Erneut versuchen" })).toBeInTheDocument();
  });

  it("does not claim success when no session was created", async () => {
    currentUser.mockRejectedValue(new ApiError({ status: 401, message: "Not authenticated", responseInfo: { url: "/api/user", status: 401 } }));
    renderComplete("");
    expect(await screen.findByText(/Es wurde keine Sitzung aufgebaut/)).toBeInTheDocument();
    expect(window.location.pathname).toBe("/auth/google/complete");
  });

  it("reports network errors", async () => {
    currentUser.mockRejectedValue(new TypeError("Failed to fetch"));
    renderComplete("");
    expect(await screen.findByText("Verbindung fehlgeschlagen")).toBeInTheDocument();
  });
});
