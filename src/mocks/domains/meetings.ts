import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { Meeting } from "@shared/schema";
import { daysAgo } from "../data/core";

const store = createStore<Meeting>([
  {
    id: 1, title: "Onboarding-Call: Trampolinpark Dortmund", description: "Vorstellung der Plattform", date: "2025-09-25",
    startTime: "10:00", endTime: "10:30", duration: 30, type: "video", status: "geplant", roomId: "room-local-1",
    meetingUrl: "https://meet.freizeitengel.test/onboarding-1", organizer: "Admin", participants: ["Nina Fischer"], notes: null,
    recurring: null, color: "#36C9C2", createdAt: daysAgo(5),
  },
]);

registerMock("GET", "/api/admin/meetings", () => store.list());
registerMock("POST", "/api/admin/meetings", (_p, _q, body) => store.create({ status: "geplant", color: "#36C9C2", createdAt: new Date().toISOString(), ...(body as object) } as Partial<Meeting>));
registerMock("PATCH", "/api/admin/meetings/:id", (p, _q, body) => store.update(Number(p.id), body as never));
registerMock("DELETE", "/api/admin/meetings/:id", (p) => { store.remove(Number(p.id)); return { success: true }; });
