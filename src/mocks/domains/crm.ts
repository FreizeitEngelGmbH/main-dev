import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { partnersSeed, usersSeed, daysAgo } from "../data/core";

interface CrmNote { id: number; entityType: "partner" | "customer"; entityId: number; content: string; createdBy: string; createdAt: string; }
interface CrmActivity { id: number; entityType: "partner" | "customer"; entityId: number; type: string; description: string; createdBy: string; createdAt: string; }

const crmPartners = partnersSeed.map((p) => ({ ...p, lastContact: daysAgo(5), pipelineStage: p.approved ? "aktiv" : "in_pruefung" }));
const crmCustomers = usersSeed
  .filter((u) => u.role === "user")
  .map((u, i) => ({ id: u.id, userId: u.id, fullName: u.fullName, email: u.email, phone: null, totalBookings: 3 + i, totalSpent: 120 + i * 45, lastContact: daysAgo(10 + i), createdAt: u.createdAt }));

const notesStore = createStore<CrmNote>([
  { id: 1, entityType: "partner", entityId: 1, content: "Vertragsverlängerung besprochen, Partner sehr zufrieden.", createdBy: "Admin Demo", createdAt: daysAgo(3) },
  { id: 2, entityType: "customer", entityId: 5, content: "Fragt nach Gruppenrabatt für Firmenevent.", createdBy: "Admin Demo", createdAt: daysAgo(7) },
]);
const activitiesStore = createStore<CrmActivity>([
  { id: 1, entityType: "partner", entityId: 1, type: "call", description: "Telefonat zur Onboarding-Nachbereitung", createdBy: "Admin Demo", createdAt: daysAgo(4) },
  { id: 2, entityType: "customer", entityId: 5, type: "email", description: "Angebot für Gruppenbuchung versendet", createdBy: "Admin Demo", createdAt: daysAgo(6) },
]);

const partnersStore = createStore(crmPartners);
const customersStore = createStore(crmCustomers);

registerMock("GET", "/api/admin/crm/partners", () => partnersStore.list());
registerMock("GET", "/api/admin/crm/customers", () => customersStore.list());
registerMock("PUT", "/api/admin/crm/partners/:id", (p, _q, body) => partnersStore.update(Number(p.id), body as never));
registerMock("PUT", "/api/admin/crm/customers/:id", (p, _q, body) => customersStore.update(Number(p.id), body as never));

registerMock("GET", "/api/admin/crm/notes/partner/:partnerId", (p) =>
  notesStore.list().filter((n) => n.entityType === "partner" && n.entityId === Number(p.partnerId))
);
registerMock("GET", "/api/admin/crm/notes/customer/:customerId", (p) =>
  notesStore.list().filter((n) => n.entityType === "customer" && n.entityId === Number(p.customerId))
);
registerMock("GET", "/api/admin/crm/activities/partner/:partnerId", (p) =>
  activitiesStore.list().filter((a) => a.entityType === "partner" && a.entityId === Number(p.partnerId))
);
registerMock("GET", "/api/admin/crm/activities/customer/:customerId", (p) =>
  activitiesStore.list().filter((a) => a.entityType === "customer" && a.entityId === Number(p.customerId))
);
registerMock("POST", "/api/admin/crm/notes", (_p, _q, body) => notesStore.create({ createdBy: "Admin Demo", createdAt: new Date().toISOString(), ...(body as object) } as Partial<CrmNote>));
registerMock("POST", "/api/admin/crm/activities", (_p, _q, body) => activitiesStore.create({ createdBy: "Admin Demo", createdAt: new Date().toISOString(), ...(body as object) } as Partial<CrmActivity>));
