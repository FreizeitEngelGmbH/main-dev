import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route } from "wouter";
import { ProtectedRoute } from "@/lib/protected-route";

const authState = vi.hoisted(() => ({
  user: null as null | { role: "user" | "partner" | "admin" },
  isLoading: false,
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => authState,
}));

function ProtectedContent() {
  return <div>Protected content</div>;
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    authState.user = null;
    authState.isLoading = false;
    window.history.replaceState(null, "", "/partner/dashboard");
  });

  it("holds the route while session bootstrap is loading", () => {
    authState.isLoading = true;
    const { container } = render(
      <ProtectedRoute path="/partner/dashboard" component={ProtectedContent} allowedRoles={["partner", "admin"]} />,
    );
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("redirects signed-out users to login and preserves the requested route", async () => {
    render(<ProtectedRoute path="/partner/dashboard" component={ProtectedContent} allowedRoles={["partner", "admin"]} />);
    await waitFor(() => expect(window.location.pathname).toBe("/auth"));
    expect(new URLSearchParams(window.location.search).get("next")).toBe("/partner/dashboard");
  });

  it.each(["partner", "admin"] as const)("allows %s access to partner routes", (role) => {
    authState.user = { role };
    render(<ProtectedRoute path="/partner/dashboard" component={ProtectedContent} allowedRoles={["partner", "admin"]} />);
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("allows only admins into admin routes", () => {
    authState.user = { role: "admin" };
    window.history.replaceState(null, "", "/admin");
    render(<ProtectedRoute path="/admin" component={ProtectedContent} requiredRole="admin" />);
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("redirects an authenticated disallowed role to its existing home", async () => {
    authState.user = { role: "user" };
    render(<ProtectedRoute path="/partner/dashboard" component={ProtectedContent} allowedRoles={["partner", "admin"]} />);
    await waitFor(() => expect(window.location.pathname).toBe("/"));
  });

  it("leaves public routes accessible without a session", () => {
    window.history.replaceState(null, "", "/public");
    render(<Route path="/public"><div>Public content</div></Route>);
    expect(screen.getByText("Public content")).toBeInTheDocument();
  });
});

