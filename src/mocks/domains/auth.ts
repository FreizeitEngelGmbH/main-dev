import { registerMock, MockApiError } from "../mockEngine";
import { User } from "@shared/schema";
import { DEMO_CREDENTIALS as PARTNER_DEMO_CREDENTIALS, demoUser as DEMO_PARTNER } from "@/partner-demo/demo-data";

/**
 * Mock session store. Demo credentials are deliberately NOT the same as any
 * real-project credential — see README.md's security note on why.
 *
 * Session persists in localStorage so a page reload keeps you logged in,
 * same UX as a real cookie session would give. The session's `role`
 * ("admin" | "partner") decides which dashboard the frontend opens.
 */
const SESSION_KEY = "fe-mock-session";

const DEMO_ADMIN: User = {
  id: 1,
  username: "admin",
  password: "",
  email: "admin@freizeitengel.demo",
  fullName: "Admin Demo",
  profileImage: null,
  role: "admin",
  createdAt: new Date("2024-01-01").toISOString(),
};

const DEMO_PASSWORD = "demo1234";

export const DEMO_CREDENTIALS = {
  admin: { username: DEMO_ADMIN.username, password: DEMO_PASSWORD },
  partner: PARTNER_DEMO_CREDENTIALS,
};

const demoAccounts = [
  { user: DEMO_ADMIN, password: DEMO_PASSWORD },
  { user: DEMO_PARTNER, password: PARTNER_DEMO_CREDENTIALS.password },
];

// Accounts created through the Registrieren tab (customer role, no dashboard).
const registeredUsers: User[] = [];

function readSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeSession(user: User | null) {
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore storage failures (private mode, etc.) */
  }
}

registerMock("GET", "/api/user", () => {
  const user = readSession();
  if (!user) throw new MockApiError("Not authenticated", 401);
  return user;
});

registerMock("POST", "/api/login", (_p, _q, body) => {
  const { username, password } = (body ?? {}) as { username?: string; password?: string };
  const demo = demoAccounts.find((a) => a.user.username === username);
  if (demo) {
    if (demo.password !== password) throw new MockApiError("Ungültiger Benutzername oder Passwort.", 401);
    writeSession(demo.user);
    return demo.user;
  }
  const existing = registeredUsers.find((u) => u.username === username || u.email === username);
  if (existing) {
    // Demo registration accounts are accepted back in with any password —
    // there is no real password hash to check against in this mock.
    writeSession(existing);
    return existing;
  }
  throw new MockApiError("Ungültiger Benutzername oder Passwort.", 401);
});

registerMock("POST", "/api/register", (_p, _q, body) => {
  const data = (body ?? {}) as { username: string; email: string; fullName: string };
  const allUsers = [...demoAccounts.map((a) => a.user), ...registeredUsers];
  if (allUsers.some((u) => u.username === data.username)) {
    throw new MockApiError("Benutzername bereits vergeben.", 400);
  }
  const user: User = {
    id: allUsers.reduce((max, u) => Math.max(max, u.id), 0) + 1,
    username: data.username,
    password: "",
    email: data.email,
    fullName: data.fullName,
    profileImage: null,
    role: "user",
    createdAt: new Date().toISOString(),
  };
  registeredUsers.push(user);
  writeSession(user);
  return user;
});

registerMock("POST", "/api/logout", () => {
  writeSession(null);
  return {};
});
