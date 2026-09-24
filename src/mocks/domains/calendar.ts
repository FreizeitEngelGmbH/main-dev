import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { daysFromNow } from "../data/core";

interface CalendarEvent { id: number; title: string; description: string | null; start: string; end: string; allDay: boolean; color: string | null; }

const store = createStore<CalendarEvent>([
  { id: 1, title: "Partner-Meeting Bowlorado", description: "Jahresgespräch", start: daysFromNow(2), end: daysFromNow(2), allDay: false, color: "#6366f1" },
  { id: 2, title: "Team-Offsite", description: null, start: daysFromNow(14), end: daysFromNow(15), allDay: true, color: "#36C9C2" },
]);

registerMock("GET", "/api/admin/calendar", () => store.list());
registerMock("POST", "/api/admin/calendar", (_p, _q, body) => store.create(body as Partial<CalendarEvent>));
registerMock("PATCH", "/api/admin/calendar/:id", (p, _q, body) => store.update(Number(p.id), body as never));
registerMock("DELETE", "/api/admin/calendar/:id", (p) => { store.remove(Number(p.id)); return { success: true }; });
registerMock("POST", "/api/admin/calendar/:eventId/sync-outlook", () => ({ success: true, synced: false, message: "Outlook-Sync ist im lokalen Modus deaktiviert." }));

// Outlook integration is intentionally inert in local mode — reports "not connected" rather than attempting a real OAuth flow.
registerMock("GET", "/api/admin/outlook/status", () => ({ connected: false }));
registerMock("GET", "/api/admin/outlook/connect", () => ({ authUrl: null, message: "Outlook-Verbindung ist im lokalen Modus nicht verfügbar." }));
registerMock("GET", "/api/admin/outlook/events", () => []);
registerMock("POST", "/api/admin/outlook/import", () => ({ imported: 0, message: "Outlook-Import ist im lokalen Modus nicht verfügbar." }));
