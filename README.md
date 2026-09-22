# FreizeitEngel (Landing Page + Admin Panel + Partner Demo)

One web frontend with public, partner, and admin areas. By default it uses the
real session-based backend through same-origin `/api/*` requests. The legacy
in-memory content mocks remain available only when `VITE_USE_MOCK_API=true`;
authentication uses temporary in-memory demo accounts in mock mode and is
never persisted in browser storage.

| Area | Routes | Who |
|---|---|---|
| Landing Page | `/` (`/landing` redirects here) | everyone |
| Login | `/auth` | everyone |
| Admin Panel | `/admin/*` (35 routes) | role `admin` |
| Partner Demo (protected) | `/partner/dashboard`, `/partner/inquiries`, `/partner/group-activities`, `/partner/group-activities/:id`, `/partner/scanner` | role `partner` |
| Partner Demo (public) | `/partner` (pitch + application), `/partners/:id` (shop), `/home`, `/bundles`, `/gruppen-events`, `/gruppen-events/:key` | everyone |

Any other URL redirects to `/` (as in the Partner Demo); unknown `/admin/*` URLs show the 404 page.

## Running it

```bash
npm install
npm run dev      # http://localhost:5050
```

Set `VITE_API_BASE_URL` only when the API is on a different origin. Leave it
empty for same-origin deployment. No secret belongs in a `VITE_*` variable.

With `VITE_USE_MOCK_API=true`, the login screen provides **Admin-Demo** and
**Partner-Demo** buttons. These temporary sessions reset on page reload.

`npm run build` / `npm run check` (`tsc --noEmit`) both pass.

## Flow, roles and route protection

Landing Page → **Anmelden** → `/auth` → role detection → dashboard → **Abmelden**.

- `GET /api/user` is the sole session bootstrap. The browser sends the
  backend-managed `connect.sid` cookie with `credentials: "include"`; no token
  or authoritative user is stored in localStorage/sessionStorage.
- `src/lib/protected-route.tsx` guards every `/admin/*` and `/partner/*`
  route: signed out → `/auth?next=...`; admin routes require `admin`; partner
  dashboard routes accept `partner` or `admin`.
- Logout (the sidebar/sheet button for admins, the **Konto → Abmelden** menu in
  the Partner Demo header) clears the session; on a protected page the user is
  sent to `/auth`.
- Accounts created through the **Registrieren** tab have role `user`. There is
  no customer area in this build, so they are sent to the Landing Page and
  cannot open admin or partner routes.
- Login, registration, and logout use `/api/login`, `/api/register`, and
  `/api/logout`, then synchronize the authoritative `/api/user` query.

## Partner Demo

The Partner Demo (`Documents/demo`, package `zytt-partner-demo`) is merged in
as verbatim copies of its screens and components at the same relative paths
(`src/pages/partner-*.tsx`, `src/components/partner/*`, `src/components/layout/{header,footer,main-layout}.tsx`,
`src/contexts`, `src/data`, `src/hooks/use-favorites.tsx`, `src/lib/*` helpers). The
demo's `/`, `/landing` and `/auth` are not used: the unified app keeps its own Landing
Page and login, and shares the demo's identical `use-auth`, `use-toast`, `index.css`
and shadcn primitives.

```
src/partner-demo/
  PartnerDemoApp.tsx   the demo's route table + providers (last route in App.tsx)
  queryClient.ts       the demo's static mock backend (in-memory, no network)
  demo-data.ts         the demo's static German mock data
```

Why the demo has its own data layer instead of registering in `src/mocks`: it
uses paths such as `/api/partners`, `/api/experiences`, `/api/categories` and
`/api/cities` with different data shapes than the admin panel's mock API, so
sharing one router would change what the admin screens show. `PartnerDemoApp`
therefore mounts its own `QueryClientProvider` in mock mode. Authentication
always stays in the root session query and is never supplied by demo data.

Edits made in the demo (new groups, inquiry replies, check-ins, cart) live in
memory and reset on reload, by design. Two hero images on the public shop page
(`partners/:id`) are Unsplash links inside `demo-data.ts`, so they need internet
access; nothing else leaves the browser.

The partner transport delegates to the centralized real API client when mocks
are disabled. In-memory partner datasets remain isolated to explicit mock mode.

## What's here vs. what isn't

- `src/pages/admin/*.tsx` (all 35 files) + `src/pages/admin-newsletter.tsx` +
  `src/pages/auth-page.tsx` — copied byte-for-byte from the source project.
  Not one line of UI/JSX was edited.
- `src/components/ui/*` — the full shadcn "new-york" component set, copied
  verbatim, minus customer-site-only widgets with zero admin usage
  (`category-card`, `header-search`, `star-rating`; `experience-card` and
  `search-box` came back with the Partner Demo, which uses them).
- `src/index.css`, `tailwind.config.ts`, `components.json` — identical
  design tokens to the source project (same color/radius/font variables).
- `src/pages/landing-page.tsx` is the source project's landing page, plus one
  addition: an **Anmelden** link in the header. Its footer links (`/impressum`,
  `/datenschutz`, `/agb`) point at pages that are not part of this build and
  redirect to `/`. The customer shop (search, checkout, ...) is not included; the
  Partner Demo's public pages are.
- No `server/`, session configuration, CORS configuration, or database code is
  included in this checkout. Protected and authenticated flows require the
  existing backend.

## API architecture

See [`docs/API_ARCHITECTURE.md`](docs/API_ARCHITECTURE.md) for the session,
client, domain module, deployment, migration, and backend-gap details.

## Legacy compatibility

Every admin page still calls the exact same URL it always did
(`useQuery({ queryKey: ["/api/admin/partners"] })`,
`apiRequest("PUT", "/api/partners/1", data)`, or in a handful of pages a
raw `fetch("/api/admin/apm/overview")`). Nothing about how a page fetches
data changed. What changed is what answers those calls:

```
src/lib/queryClient.ts        same apiRequest/getQueryFn signature as source
src/mocks/mockEngine.ts       tiny in-memory HTTP router (method+path -> handler)
src/mocks/installFetchInterceptor.ts   patches window.fetch so pages using
                                       raw fetch() are mocked too, not just
                                       apiRequest-based ones
src/mocks/crudStore.ts        generic list/get/create/update/delete store
src/mocks/domains/*.ts        one file per admin module, registers that
                               module's routes + seed data
src/mocks/registerAll.ts      imports every domain file once, for its
                               side effects
```

`src/config/env.ts`'s `useMockApi` flag is the single switch. It defaults to
real API mode; with `VITE_USE_MOCK_API=false` and an optional
`VITE_API_BASE_URL=https://...`, every
`apiRequest`/`getQueryFn`/intercepted `fetch()` call goes to a real server
at that base URL instead — using the exact same paths, so a real backend
just needs to serve them. See `src/mocks/domains/*.ts` for the literal
endpoint list already wired up; each file's top comment says what to
delete once its real counterpart exists.

`shared/schema.ts` is a plain-TypeScript mirror of the source project's
Drizzle schema (trimmed to the ~25 tables the admin panel actually
imports), so `Partner`, `Booking`, etc. are the same shape either way —
swap this file for a real `@shared/schema` import once there's a real
schema client-side code should read.

## Known pre-existing quirks (present in the source project too, not introduced here)

- `admin-partner-overview.tsx`: the `recentBookings` `useQuery` had no generic
  (so `tsc` typed it `{}`); it is now `useQuery<any[]>`. Type-only change,
  no runtime or UI difference.
- `admin-dashboard.tsx` imports `BarChart`/`LineChart` from
  `@/components/ui/card` — dead names never actually rendered (the real
  chart components come from `recharts`, imported separately under an
  alias). `card.tsx` re-exports two no-op stubs under those names purely
  so the import resolves; nothing behavioral depends on them.
- `admin-crm.tsx` has one React "missing key prop" console warning on a
  table row map — cosmetic, dev-mode only, present in the source file as-is.
  (All 34 routes were swept headlessly, logged in, checking for page
  crashes and console errors — this was the only one left standing, and it
  doesn't crash anything.)
- Two production security findings surfaced while auditing the source
  project's `server/routes.ts` — unrelated to this extraction, but worth
  fixing there regardless: an unauthenticated `POST /api/promote-to-admin`
  endpoint, and a hardcoded administrative login bypass in `server/auth.ts`.
  Several admin API modules (Knowledge Base, Payments
  settings, Documents, HR, Onboarding, Meetings, Support viewer,
  Accounting) also have no server-side auth check at all on the real
  backend — see the full audit for the line-by-line list.

## Not done here

- Native browser push/WebSocket: `admin-chat.tsx`'s `new WebSocket(...)`
  has nothing to connect to in this standalone app — it fails silently and
  the page's own 5-second polling fallback (already in the source file)
  covers the demo instead.
- File uploads in Document Manager / HR profile photos accept a selection
  but don't persist actual file bytes anywhere beyond the in-memory mock
  record — there's no storage backend to persist to yet.
