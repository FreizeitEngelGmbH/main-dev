import { MockApiError, registerMock } from "../mockEngine";
import type { AuthUser } from "@/auth/auth.types";

/**
 * Temporary local-only accounts for reviewing protected screens without the
 * backend. The session exists only in memory and disappears on page reload.
 * Real API mode never imports these identities as authentication state.
 */
const mockAccounts: Array<{ username: string; password: string; user: AuthUser }> = [
  {
    username: "admin-demo",
    password: "local-admin-demo",
    user: {
      id: 9001,
      username: "admin-demo",
      email: "admin@example.invalid",
      fullName: "Admin Demo",
      profileImage: null,
      role: "admin",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  },
  {
    username: "partner-demo",
    password: "local-partner-demo",
    user: {
      id: 9002,
      username: "partner-demo",
      email: "partner@example.invalid",
      fullName: "Partner Demo",
      profileImage: null,
      role: "partner",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  },
];

let currentUser: AuthUser | null = null;

registerMock("GET", "/api/user", () => {
  if (!currentUser) throw new MockApiError("Not authenticated", 401);
  return currentUser;
});
registerMock("POST", "/api/login", (_params, _query, body) => {
  const credentials = body as { username?: string; password?: string } | undefined;
  const account = mockAccounts.find(
    ({ username, password }) => username === credentials?.username && password === credentials?.password,
  );
  if (!account) throw new MockApiError("Ungültiger Demo-Zugang.", 401);
  currentUser = account.user;
  return currentUser;
});
registerMock("POST", "/api/logout", () => {
  currentUser = null;
  return {};
});
registerMock("POST", "/api/register", () => {
  throw new MockApiError("Registrierung benötigt das konfigurierte Backend.", 501);
});
