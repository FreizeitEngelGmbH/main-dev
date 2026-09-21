import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { daysAgo, daysFromNow } from "../data/core";

interface MarketingKpi { id: number; name: string; target: number; current: number; unit: string; }
interface MarketingAction { id: number; title: string; channel: string; status: string; budget: number; startDate: string; endDate: string; }
interface MarketingCalendarEntry { id: number; title: string; date: string; channel: string; notes: string | null; }
interface MarketingBudgetRoi { id: number; channel: string; month: string; spend: number; revenue: number; }
interface MarketingAdInventory { id: number; placement: string; size: string; status: string; monthlyImpressions: number; }

registerMock("GET", "/api/cities", () => ["Dortmund", "Bochum", "Essen", "Duisburg", "Köln"]);

const kpis = createStore<MarketingKpi>([
  { id: 1, name: "Newsletter-Abonnenten", target: 5000, current: 3120, unit: "Abonnenten" },
  { id: 2, name: "Monatliche Buchungen", target: 800, current: 512, unit: "Buchungen" },
  { id: 3, name: "Cost per Acquisition", target: 8, current: 11.4, unit: "€" },
]);
registerMock("GET", "/api/admin/marketing/kpis", () => kpis.list());
registerMock("PATCH", "/api/admin/marketing/kpis/:id", (p, _q, body) => kpis.update(Number(p.id), body as never));

const actions = createStore<MarketingAction>([
  { id: 1, title: "Instagram Kampagne Sommer", channel: "Social", status: "aktiv", budget: 2500, startDate: daysAgo(10), endDate: daysFromNow(20) },
  { id: 2, title: "Google Ads Bowling Dortmund", channel: "SEA", status: "aktiv", budget: 1200, startDate: daysAgo(5), endDate: daysFromNow(25) },
  { id: 3, title: "Influencer Kooperation", channel: "Influencer", status: "geplant", budget: 3000, startDate: daysFromNow(10), endDate: daysFromNow(40) },
]);
registerMock("GET", "/api/admin/marketing", () => actions.list());
registerMock("POST", "/api/admin/marketing", (_p, _q, body) => actions.create(body as Partial<MarketingAction>));
registerMock("PATCH", "/api/admin/marketing/:id", (p, _q, body) => actions.update(Number(p.id), body as never));
registerMock("DELETE", "/api/admin/marketing/:id", (p) => { actions.remove(Number(p.id)); return { success: true }; });

const calendar = createStore<MarketingCalendarEntry>([
  { id: 1, title: "Sommer-Newsletter Versand", date: daysFromNow(5), channel: "E-Mail", notes: null },
  { id: 2, title: "Blogartikel: Top 10 Bochum", date: daysFromNow(12), channel: "Content", notes: null },
]);
registerMock("GET", "/api/admin/marketing/calendar", () => calendar.list());
registerMock("POST", "/api/admin/marketing/calendar", (_p, _q, body) => calendar.create(body as Partial<MarketingCalendarEntry>));
registerMock("PATCH", "/api/admin/marketing/calendar/:id", (p, _q, body) => calendar.update(Number(p.id), body as never));
registerMock("DELETE", "/api/admin/marketing/calendar/:id", (p) => { calendar.remove(Number(p.id)); return { success: true }; });

const budgetRoi = createStore<MarketingBudgetRoi>([
  { id: 1, channel: "Social", month: "2025-07", spend: 2500, revenue: 9800 },
  { id: 2, channel: "SEA", month: "2025-07", spend: 1200, revenue: 4300 },
]);
registerMock("GET", "/api/admin/marketing/budget-roi", () => budgetRoi.list());
registerMock("POST", "/api/admin/marketing/budget-roi", (_p, _q, body) => budgetRoi.create(body as Partial<MarketingBudgetRoi>));
registerMock("PATCH", "/api/admin/marketing/budget-roi/:id", (p, _q, body) => budgetRoi.update(Number(p.id), body as never));
registerMock("DELETE", "/api/admin/marketing/budget-roi/:id", (p) => { budgetRoi.remove(Number(p.id)); return { success: true }; });

registerMock("GET", "/api/admin/marketing/kpi-values", () => []);
registerMock("POST", "/api/admin/marketing/kpi-values", (_p, _q, body) => ({ id: Date.now(), ...(body as object) }));

const adInventory = createStore<MarketingAdInventory>([
  { id: 1, placement: "Startseite Banner", size: "970x250", status: "belegt", monthlyImpressions: 84000 },
  { id: 2, placement: "Erlebnis-Detail Sidebar", size: "300x600", status: "frei", monthlyImpressions: 42000 },
]);
registerMock("GET", "/api/admin/marketing/ad-inventory", () => adInventory.list());
registerMock("POST", "/api/admin/marketing/ad-inventory", (_p, _q, body) => adInventory.create(body as Partial<MarketingAdInventory>));
registerMock("PATCH", "/api/admin/marketing/ad-inventory/:id", (p, _q, body) => adInventory.update(Number(p.id), body as never));
registerMock("DELETE", "/api/admin/marketing/ad-inventory/:id", (p) => { adInventory.remove(Number(p.id)); return { success: true }; });
