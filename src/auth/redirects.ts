import type { Role } from "@shared/schema";
import { homeForRole } from "@/lib/auth-routing";

/**
 * Post-login redirect rules shared by the password login and the Google sign-in completion.
 * The role always comes from the backend's GET /api/user response; nothing here trusts URL input
 * for authorization.
 */

const LOCAL_BASE = "http://local.invalid";

/** Role gates mirror the ProtectedRoute definitions in App.tsx and partner/PartnerApp.tsx. */
const PROTECTED_PREFIXES: Array<{ prefix: string; roles: Role[] }> = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/partner/dashboard", roles: ["partner", "admin"] },
  { prefix: "/partner/inquiries", roles: ["partner", "admin"] },
  { prefix: "/partner/scanner", roles: ["partner", "admin"] },
  { prefix: "/partner/group-activities", roles: ["partner", "admin"] },
];

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Returns a normalized same-origin path, or null for anything that could leave the app:
 * absolute/protocol-relative/`javascript:` URLs, backslash tricks, control characters, encoded
 * external targets, API paths and the auth pages themselves (which would loop).
 */
export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  if (/[\\\u0000-\u001f\u007f]/.test(raw)) return null;

  // Reject targets that only become external after another round of decoding (e.g. /%2F%2Fevil.com).
  let decoded = raw;
  for (let i = 0; i < 2; i++) {
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      return null;
    }
    if (decoded.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(decoded) || /^\/*[a-z][a-z0-9+.-]*:/i.test(decoded)) {
      return null;
    }
  }

  let url: URL;
  try {
    url = new URL(raw, LOCAL_BASE);
  } catch {
    return null;
  }
  if (url.origin !== LOCAL_BASE) return null;
  if (url.pathname === "/api" || url.pathname.startsWith("/api/")) return null;
  if (url.pathname === "/auth" || url.pathname.startsWith("/auth/")) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Whether a signed-in user with this role may open the path (public paths: any role). */
export function canRoleAccessPath(role: Role, path: string): boolean {
  const pathname = new URL(path, LOCAL_BASE).pathname;
  const rule = PROTECTED_PREFIXES.find(({ prefix }) => matchesPrefix(pathname, prefix));
  return !rule || rule.roles.includes(role);
}

/** Where to send a freshly authenticated user: the safe, permitted `next` or the role's home. */
export function resolvePostLoginPath(role: Role, rawNext: string | null | undefined): string {
  const next = safeNextPath(rawNext);
  return next && canRoleAccessPath(role, next) ? next : homeForRole(role);
}
