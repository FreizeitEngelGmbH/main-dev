import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { daysAgo } from "../data/core";

interface InboxMessage { id: number; folder: string; from: string; to: string; subject: string; body: string; read: boolean; createdAt: string; }

const store = createStore<InboxMessage>([
  { id: 1, folder: "inbox", from: "n.fischer@trampolinpark-do.de", to: "kontakt@freizeitengel.de", subject: "Interesse an Partnerschaft", body: "Wir würden gerne Partner werden ...", read: false, createdAt: daysAgo(2) },
  { id: 2, folder: "inbox", from: "kunde@example.com", to: "kontakt@freizeitengel.de", subject: "Frage zur Buchung BK-1A2B3C", body: "Kann ich meine Buchung verschieben?", read: true, createdAt: daysAgo(5) },
]);

registerMock("GET", "/api/admin/inbox", () => store.list());
registerMock("POST", "/api/admin/inbox", (_p, _q, body) => store.create({ folder: "sent", read: true, createdAt: new Date().toISOString(), ...(body as object) } as Partial<InboxMessage>));
registerMock("PATCH", "/api/admin/inbox/:id", (p, _q, body) => store.update(Number(p.id), body as never));
registerMock("DELETE", "/api/admin/inbox/:id", (p) => { store.remove(Number(p.id)); return { success: true }; });
registerMock("POST", "/api/admin/inbox/:id/send", (p) => store.update(Number(p.id), { folder: "sent" }));
