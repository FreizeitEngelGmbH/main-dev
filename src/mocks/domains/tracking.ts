import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { daysAgo } from "../data/core";

// Shape matched against admin-tracking.tsx's local `TLink` type — `name`
// (not `label`), `clicks`/`uniqueClicks` (not `clickCount`).
interface TrackingLink {
  id: number; name: string; slug: string; targetUrl: string;
  campaign: string | null; notes: string | null;
  clicks: number; uniqueClicks: number;
  lastClickAt: string | null; createdAt: string;
}

const links = createStore<TrackingLink>([
  { id: 1, name: "Instagram Sommer-Kampagne", slug: "insta-sommer", targetUrl: "https://freizeitengel.de/gruppen-events", campaign: "Sommer 2025", notes: null, clicks: 342, uniqueClicks: 288, lastClickAt: daysAgo(1), createdAt: daysAgo(30) },
  { id: 2, name: "Flyer QR-Code Dortmund", slug: "flyer-dortmund", targetUrl: "https://freizeitengel.de", campaign: null, notes: null, clicks: 87, uniqueClicks: 74, lastClickAt: daysAgo(3), createdAt: daysAgo(10) },
]);

registerMock("GET", "/api/admin/tracking-links", () => links.list());
registerMock("GET", "/api/admin/tracking-links/:id/daily", (p) =>
  Array.from({ length: 7 }).map((_, i) => ({ date: daysAgo(6 - i).slice(0, 10), clicks: Math.max(0, Math.round(Math.sin(i + Number(p.id)) * 10 + 12)) }))
);
registerMock("GET", "/api/admin/tracking-links/:id/clicks", (p) =>
  Array.from({ length: 5 }).map((_, i) => ({ id: i + 1, linkId: Number(p.id), timestamp: daysAgo(i), referrer: i % 2 === 0 ? "instagram.com" : "direct" }))
);
registerMock("POST", "/api/admin/tracking-links", (_p, _q, body) => links.create({ clicks: 0, uniqueClicks: 0, lastClickAt: null, createdAt: new Date().toISOString(), ...(body as object) } as Partial<TrackingLink>));
registerMock("DELETE", "/api/admin/tracking-links/:id", (p) => { links.remove(Number(p.id)); return { success: true }; });
