# FreizeitEngel (Landing Page + Admin Panel + Partner Panel)

One static frontend with three areas, running against an in-memory mock API
(no backend and no API calls; only the Inter web font is fetched), with the seam already in
place to swap that mock for the real API later without touching any page.

| Area | Routes | Who |
|---|---|---|
| Landing Page | `/` (`/landing` redirects here) | everyone |
| Login | `/auth` | everyone |
| Admin Panel | `/admin/*` (35 routes) | role `admin` |
| Partner Panel | `/partner`, `/partner/bookings`, `/partner/experiences`, `/partner/availability`, `/partner/payouts`, `/partner/messages`, `/partner/profile` | role `partner` |

## Running it

```bash
npm install
npm run dev      # http://localhost:5050
```

Demo logins (shown nowhere in the UI on purpose — they are demo credentials,
deliberately different from anything in the source project):

| Role | Username | Password | Opens |
|---|---|---|---|
| Admin | `admin` | `demo1234` | `/admin` |
| Partner | `partner` | `demo1234` | `/partner` (Kletterhalle Vertical Dortmund) |

`npm run build` / `npm run check` (`tsc --noEmit`) both pass.

## Flow, roles and route protection

Landing Page → **Anmelden** → `/auth` → role detection → dashboard → **Abmelden**.

- The mock session (`localStorage` key `fe-mock-session`, see
  `src/mocks/domains/auth.ts`) carries the user's `role`. The login page sends
  the user to `homeForRole(role)` (`src/lib/auth-routing.ts`).
- `src/lib/protected-route.tsx` guards every `/admin/*` and `/partner/*`
  route: signed out → `/auth`; signed in with the wrong role → own dashboard
  (an admin opening `/partner/...` lands on `/admin`, a partner opening
  `/admin/...` lands on `/partner`).
- Logout (sidebar on desktop, account menu on mobile for partners; the
  existing sidebar/sheet button for admins) clears the session and returns to
  `/auth`.
- Accounts created through the **Registrieren** tab have role `user`. There is
  no customer area in this build, so they are sent to the Landing Page and
  cannot open admin or partner routes.
- To connect real auth later, replace the `/api/user`, `/api/login`,
  `/api/logout` handlers with the real endpoints (see the mock → real API
  section); nothing in the UI needs to change.

## Partner Panel

Reused from the standalone Partner demo (`Documents/demo`), kept
self-contained in `src/partner/`:

```
src/partner/
  PartnerApp.tsx          router shell (wouter) + data provider + layout
  routes.ts               single source of truth for /partner/* paths
  partner-theme.css       Partner design tokens, scoped to <html class="partner-theme">
  components/layout/      PartnerLayout (sidebar, mobile bottom bar, account menu, logout)
  components/ui/          the 8 lightweight primitives the Partner pages use
  context/                local-state data provider (booking/experience/message/profile edits)
  mock-data/              static German mock data + types
  pages/                  Dashboard, Bookings, Experiences, Availability, Payouts, Messages, Profile
```

Why the Partner UI primitives are not merged into `src/components/ui`: they
share names with the admin shadcn components (`button`, `badge`, `select`, ...)
but have different APIs (e.g. a native `<select>` vs Radix) and different
spacing/radius, so swapping them would change either panel's look. Shared
pieces that were identical are reused instead (`cn`, the router, auth, toasts,
the dropdown menu in the mobile account menu).

The Partner tokens (purple, `--radius: 0.75rem`, Inter) are applied only while
the Partner layout is mounted, so the admin panel, login and landing page keep
their own tokens. Partner edits (confirm a booking, toggle an experience, reply
to a message, edit the profile) live in React state and reset on page reload,
by design.

## What's here vs. what isn't

- `src/pages/admin/*.tsx` (all 35 files) + `src/pages/admin-newsletter.tsx` +
  `src/pages/auth-page.tsx` — copied byte-for-byte from the source project.
  Not one line of UI/JSX was edited.
- `src/components/ui/*` — the full shadcn "new-york" component set, copied
  verbatim, minus 5 files that are customer-site-only widgets with zero
  admin usage (`experience-card`, `category-card`, `header-search`,
  `search-box`, `star-rating` — see the audit notes below).
- `src/index.css`, `tailwind.config.ts`, `components.json` — identical
  design tokens to the source project (same color/radius/font variables).
- `src/pages/landing-page.tsx` is the source project's landing page, plus one
  addition: an **Anmelden** link in the header. Its footer links (`/impressum`,
  `/datenschutz`, `/agb`) point at pages that are not part of this build and
  show the 404 page. The customer shop (home, search, checkout, ...) is not
  included.
- No `server/`, no database, no `drizzle-orm` — nothing here needs a
  backend to run.

## The mock → real API architecture

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

`src/config/env.ts`'s `useMockApi` flag is the single switch. Turn it off
(`VITE_USE_MOCK_API=false` + `VITE_API_BASE_URL=https://...`) and every
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
  endpoint, and a hardcoded `admin`/`admin123` login backdoor in
  `server/auth.ts`. Several admin API modules (Knowledge Base, Payments
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
