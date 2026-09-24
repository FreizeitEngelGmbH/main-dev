import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { partnersSeed, usersSeed, daysAgo } from "../data/core";

// Same shape as the backend's crm_notes / crm_activities rows (shared/schema.ts).
interface CrmNote { id: number; entityType: "partner" | "customer"; entityId: number; authorUserId: number | null; note: string; createdAt: string; }
interface CrmActivity { id: number; entityType: "partner" | "customer"; entityId: number; activityType: string; summary: string; authorUserId: number | null; occurredAt: string; createdAt: string; }

const LOCAL_ADMIN_ID = 1;

// The real endpoint selects `partners.id AS partnerId`; the page keys rows and detail queries by it.
const crmPartners = partnersSeed.map((p) => ({ ...p, partnerId: p.id, lastContact: daysAgo(5), pipelineStage: p.approved ? "aktiv" : "in_pruefung" }));
const crmCustomers = usersSeed
  .filter((u) => u.role === "user")
  .map((u, i) => ({ id: u.id, userId: u.id, fullName: u.fullName, email: u.email, phone: null, totalBookings: 3 + i, totalSpent: 120 + i * 45, lastContact: daysAgo(10 + i), createdAt: u.createdAt }));

const notesStore = createStore<CrmNote>([
  { id: 1, entityType: "partner", entityId: 1, authorUserId: LOCAL_ADMIN_ID, note: "Vertragsverlängerung besprochen, Partner sehr zufrieden.", createdAt: daysAgo(3) },
  { id: 2, entityType: "customer", entityId: 5, authorUserId: LOCAL_ADMIN_ID, note: "Fragt nach Gruppenrabatt für Firmenevent.", createdAt: daysAgo(7) },
]);
const activitiesStore = createStore<CrmActivity>([
  { id: 1, entityType: "partner", entityId: 1, activityType: "call", summary: "Telefonat zur Onboarding-Nachbereitung", authorUserId: LOCAL_ADMIN_ID, occurredAt: daysAgo(4), createdAt: daysAgo(4) },
  { id: 2, entityType: "customer", entityId: 5, activityType: "email", summary: "Angebot für Gruppenbuchung versendet", authorUserId: LOCAL_ADMIN_ID, occurredAt: daysAgo(6), createdAt: daysAgo(6) },
]);

const partnersStore = createStore(crmPartners);
const customersStore = createStore(crmCustomers);

registerMock("GET", "/api/admin/crm/partners", () => partnersStore.list());
registerMock("GET", "/api/admin/crm/customers", () => customersStore.list());
registerMock("PUT", "/api/admin/crm/partners/:id", (p, _q, body) => partnersStore.update(Number(p.id), body as never));
registerMock("PUT", "/api/admin/crm/customers/:id", (p, _q, body) => customersStore.update(Number(p.id), body as never));

// Backend orders both lists by createdAt DESC.
const newestFirst = <T extends { createdAt: string }>(rows: T[]) => [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

registerMock("GET", "/api/admin/crm/notes/partner/:partnerId", (p) =>
  newestFirst(notesStore.list().filter((n) => n.entityType === "partner" && n.entityId === Number(p.partnerId)))
);
registerMock("GET", "/api/admin/crm/notes/customer/:customerId", (p) =>
  newestFirst(notesStore.list().filter((n) => n.entityType === "customer" && n.entityId === Number(p.customerId)))
);
registerMock("GET", "/api/admin/crm/activities/partner/:partnerId", (p) =>
  newestFirst(activitiesStore.list().filter((a) => a.entityType === "partner" && a.entityId === Number(p.partnerId)))
);
registerMock("GET", "/api/admin/crm/activities/customer/:customerId", (p) =>
  newestFirst(activitiesStore.list().filter((a) => a.entityType === "customer" && a.entityId === Number(p.customerId)))
);
// Like the backend, the author comes from the session, and timestamps default to now.
registerMock("POST", "/api/admin/crm/notes", (_p, _q, body) => {
  const now = new Date().toISOString();
  return notesStore.create({ createdAt: now, ...(body as object), authorUserId: LOCAL_ADMIN_ID } as Partial<CrmNote>);
});
registerMock("POST", "/api/admin/crm/activities", (_p, _q, body) => {
  const now = new Date().toISOString();
  return activitiesStore.create({ occurredAt: now, createdAt: now, ...(body as object), authorUserId: LOCAL_ADMIN_ID } as Partial<CrmActivity>);
});
