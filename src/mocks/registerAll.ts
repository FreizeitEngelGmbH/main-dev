/**
 * Importing each domain module runs its top-level `registerMock`/`registerCrud`
 * calls, wiring it into the shared mock router (`mockEngine.ts`). This file
 * is imported once, for its side effects, from `lib/queryClient.ts`.
 *
 * To connect a domain to the real backend later: delete its import here
 * (and its file under `domains/`) once `src/config/env.ts`'s
 * `useMockApi` is false and the real API serves the same URL — the admin
 * page component itself needs no change either way.
 */
import "./installFetchInterceptor";
import "./domains/auth";
import "./domains/dashboard";
import "./domains/partners";
import "./domains/experiences";
import "./domains/bookings";
import "./domains/crm";
import "./domains/mailing";
import "./domains/marketing";
import "./domains/analytics";
import "./domains/calendar";
import "./domains/chat";
import "./domains/sales";
import "./domains/projects";
import "./domains/materials";
import "./domains/knowledgeBase";
import "./domains/payments";
import "./domains/documents";
import "./domains/hr";
import "./domains/meetings";
import "./domains/onboarding";
import "./domains/tracking";
import "./domains/support";
import "./domains/commissionInvoices";
import "./domains/accounting";
import "./domains/apm";
import "./domains/inbox";
import "./domains/voiceAgent";
import "./domains/roller";
import "./domains/regiondo";
import "./domains/eversport";
import "./domains/planyo";
import "./domains/pretix";
