import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { daysAgo, partnersSeed } from "../data/core";

interface SalesPipelineEntry {
  id: number; partnerId: number | null; companyName: string; contactPerson: string | null; email: string | null; phone: string | null;
  address: string | null; city: string | null; website: string | null; category: string | null; status: string; priority: string | null;
  ampel: string | null; terminiert: string | null; wiedervorlage: string | null; assignedTo: string | null; notes: string | null;
  lastContact: string | null; source: string | null; dealValue: number | null; createdAt: string; updatedAt: string;
}

const store = createStore<SalesPipelineEntry>([
  { id: 1, partnerId: null, companyName: "Trampolinpark Dortmund", contactPerson: "Nina Fischer", email: "n.fischer@trampolinpark-do.de", phone: "+49 231 5551010", address: "Airportring 5", city: "Dortmund", website: "https://trampolinpark-do.de", category: "Trampolin", status: "kontaktiert", priority: "hoch", ampel: "gruen", terminiert: null, wiedervorlage: daysAgo(-3), assignedTo: "Admin", notes: "Sehr interessiert, wartet auf Vertragsentwurf.", lastContact: daysAgo(2), source: "Kaltakquise", dealValue: 0, createdAt: daysAgo(14), updatedAt: daysAgo(2) },
  { id: 2, partnerId: null, companyName: "Lasertag Arena Essen", contactPerson: "David Roth", email: "d.roth@lasertag-essen.de", phone: "+49 201 5552020", address: "Industriestr. 22", city: "Essen", website: "https://lasertag-essen.de", category: "Lasertag", status: "neu", priority: "mittel", ampel: "gelb", terminiert: null, wiedervorlage: null, assignedTo: "Admin", notes: null, lastContact: null, source: "Empfehlung", dealValue: 0, createdAt: daysAgo(3), updatedAt: daysAgo(3) },
  { id: 3, partnerId: 1, companyName: "Bowlorado Dortmund", contactPerson: "Markus Schmidt", email: "m.schmidt@bowlorado.de", phone: "+49 231 5550101", address: "Westfalendamm 12", city: "Dortmund", website: "https://bowlorado.de", category: "Bowling", status: "gewonnen", priority: "hoch", ampel: "gruen", terminiert: null, wiedervorlage: null, assignedTo: "Admin", notes: "Live seit letztem Quartal.", lastContact: daysAgo(30), source: "Messe", dealValue: 0, createdAt: daysAgo(310), updatedAt: daysAgo(300) },
]);

registerMock("GET", "/api/admin/sales", () => store.list());
// Shape matched against admin-sales.tsx: `{ status: string; count: number }[]`
// (the page does `stats.find(s => s.status === item.key)`), not a summary object.
registerMock("GET", "/api/admin/sales/stats", () => {
  const items = store.list();
  const counts = items.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.status]: (acc[i.status] ?? 0) + 1 }), {});
  return Object.entries(counts).map(([status, count]) => ({ status, count }));
});
registerMock("GET", "/api/admin/sales/available-partners", () => partnersSeed.filter((p) => !store.list().some((s) => s.partnerId === p.id)));
registerMock("POST", "/api/admin/sales/seed", () => ({ imported: 0, message: "Beispieldaten sind bereits geladen." }));
registerMock("POST", "/api/admin/sales", (_p, _q, body) => store.create({ status: "neu", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...(body as object) } as Partial<SalesPipelineEntry>));
registerMock("PATCH", "/api/admin/sales/:id", (p, _q, body) => store.update(Number(p.id), { ...(body as object), updatedAt: new Date().toISOString() } as never));
registerMock("DELETE", "/api/admin/sales/:id", (p) => { store.remove(Number(p.id)); return { success: true }; });
