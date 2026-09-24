# Web API architecture

This document applies to the Vite/React web application only.

## Session authentication

- The backend session cookie (`connect.sid`) is the source of truth.
- `GET /api/user` bootstraps and restores the session under the stable
  `['auth', 'user']` TanStack Query key.
- Every real API request uses `credentials: 'include'`. The client never adds
  an `Authorization` header and never reads or writes an authentication token.
- Login and registration call their backend endpoints and then fetch
  `/api/user`; their initial response is not treated as authoritative session
  state. Logout calls the backend before clearing auth and protected caches.
- A non-bootstrap `401` clears in-memory auth/protected data. `403` remains an
  authorization error and does not destroy the session.

## Client and modules

`src/api/client.ts` is the real transport. It supports cancellation, JSON and
empty responses, non-JSON failures, credentialed cookies, and normalized
`ApiError` instances with status, backend message, validation details, and
response metadata. `src/lib/queryClient.ts` is a compatibility facade for
legacy pages while they move to typed functions under `src/api/modules/`.

The initial module boundaries cover auth, users/profile, experiences,
categories, cities, availability, bookings, favorites, partner dashboard, and
admin dashboard. Query key factories live in `src/api/queryKeys.ts`.

Mutation retries and `401`/`403` query retries are disabled. Route guards wait
for bootstrap, preserve the requested URL for signed-out users, require admin
for admin routes, and allow partner or admin for partner dashboard routes.

## Deployment and cookies

Same-origin deployment is preferred: leave `VITE_API_BASE_URL` empty. For a
different API origin, set the public base URL and configure the backend with an
explicit allowed frontend origin plus credentialed CORS; `*` cannot be used
with credentials. Production must use HTTPS. The backend must choose cookie
`SameSite`, `Secure`, host/domain, proxy trust, and expiry settings appropriate
to the actual origins. Cross-site cookies generally require `SameSite=None`
and `Secure`. These controls cannot be weakened or repaired in frontend code.

No backend/session/CORS source exists in this repository, so those settings
cannot be verified here. CSRF protection also cannot be confirmed; because the
application uses cookie-authenticated state-changing requests, the backend
should be audited for CSRF defenses rather than adding an invented frontend
header.

## Static-data migration

Real API mode is now the default. The old admin content router and partner static
datasets remain available only with `VITE_USE_MOCK_API=true`; mock mode includes
temporary in-memory Admin/Partner login buttons for local review. These sessions
are never persisted and do not exist in real API mode. Some screens still contain
presentation/static data directly:

- home discovery groupings, partner shop/reviews, bundles and group events;
- partner dashboard/inquiries/group activity static records and local slot data;
- landing-page marketing content and partner application marketing copy;
- admin dashboard revenue chart, roadmap phases, and predefined mailing data;
- the remaining admin modules backed by `src/mocks/domains/*` when mock mode is
  explicitly enabled.

These datasets were not removed because this checkout has neither current
backend route implementations nor confirmed response contracts for all of
them. Replace each only after its backend contract is verified.

## Backend gaps and security follow-up

- The UI calls `PUT /api/partners/:id` for partner approval/editing. The prior
  backend audit reported this route missing; there is no backend here to
  recheck it, so approval remains a backend blocker and is not faked.
- The prior audit also reported a hardcoded admin credential bypass and a
  fallback session secret. They cannot be rechecked or fixed in this
  frontend-only repository and must be removed/fail-closed in the backend.
- Backend authorization for all admin and partner endpoints must be audited;
  frontend role guards are UX only.
- Login request fields and registration fields are based on current frontend
  usage and the checked-in shared registration schema. They must be compared
  against the actual backend `auth.ts` before deployment because that source is
  absent here.
