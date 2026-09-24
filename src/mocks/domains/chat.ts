import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { usersSeed, daysAgo } from "../data/core";

interface ChatChannel { id: number; name: string; description: string | null; type: string; createdBy: number | null; createdAt: string; }
interface ChatMessage { id: number; channelId: number; senderId: number; content: string; type: string; replyToId: number | null; isEdited: boolean; createdAt: string; }
interface ChatMeeting { id: number; title: string; description: string | null; channelId: number | null; organizerId: number; startTime: string; endTime: string; location: string | null; meetingUrl: string | null; status: string; createdAt: string; }

const channels = createStore<ChatChannel>([
  { id: 1, name: "allgemein", description: "Team-weite Ankündigungen", type: "channel", createdBy: 1, createdAt: daysAgo(200) },
  { id: 2, name: "partner-support", description: "Partneranfragen abstimmen", type: "channel", createdBy: 1, createdAt: daysAgo(150) },
]);

const messages = createStore<ChatMessage>([
  { id: 1, channelId: 1, senderId: 1, content: "Willkommen im Team-Chat!", type: "text", replyToId: null, isEdited: false, createdAt: daysAgo(5) },
  { id: 2, channelId: 1, senderId: 1, content: "Neue Partneranfrage aus Essen eingegangen.", type: "text", replyToId: null, isEdited: false, createdAt: daysAgo(1) },
]);

const meetings = createStore<ChatMeeting>([
  { id: 1, title: "Wöchentliches Standup", description: null, channelId: 1, organizerId: 1, startTime: daysAgo(-1), endTime: daysAgo(-1), location: null, meetingUrl: "https://meet.freizeitengel.test/standup", status: "scheduled", createdAt: daysAgo(20) },
]);

registerMock("GET", "/api/chat/channels", () => channels.list());
registerMock("GET", "/api/chat/users", () => usersSeed);
registerMock("GET", "/api/chat/channels/:id/messages", (p) => messages.list().filter((m) => m.channelId === Number(p.id)));
registerMock("GET", "/api/chat/meetings", () => meetings.list());
registerMock("POST", "/api/chat/channels/:id/messages", (p, _q, body) =>
  messages.create({ channelId: Number(p.id), senderId: 1, type: "text", replyToId: null, isEdited: false, createdAt: new Date().toISOString(), ...(body as object) } as Partial<ChatMessage>)
);
registerMock("POST", "/api/chat/channels", (_p, _q, body) => channels.create({ createdBy: 1, createdAt: new Date().toISOString(), ...(body as object) } as Partial<ChatChannel>));
registerMock("DELETE", "/api/chat/channels/:id", (p) => { channels.remove(Number(p.id)); return { success: true }; });
registerMock("POST", "/api/chat/meetings", (_p, _q, body) => meetings.create({ organizerId: 1, status: "scheduled", createdAt: new Date().toISOString(), ...(body as object) } as Partial<ChatMeeting>));

// The real app also opens a raw WebSocket to /ws/chat as a live-update
// channel on top of these REST routes. There is no mock WebSocket server
// here (nothing to connect to client-side) — the page's existing 5s
// `refetchInterval` polling fallback covers it instead; the
// WebSocket simply fails to connect silently, same as any other
// unreachable-server case the page already has to tolerate.
