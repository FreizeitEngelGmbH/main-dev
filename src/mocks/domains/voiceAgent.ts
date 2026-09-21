import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { daysAgo } from "../data/core";

interface VoiceCallback { id: number; callerName: string; phone: string; reason: string; status: string; createdAt: string; }
interface VoiceConversation { id: number; callerPhone: string; durationSec: number; summary: string | null; createdAt: string; }

const callbacks = createStore<VoiceCallback>([
  { id: 1, callerName: "Herr Weber", phone: "+49 151 5559999", reason: "Frage zu Gruppenbuchung", status: "offen", createdAt: daysAgo(1) },
]);
const conversations = createStore<VoiceConversation>([
  { id: 1, callerPhone: "+49 151 5558888", durationSec: 92, summary: "Nutzer fragte nach Öffnungszeiten der Kletterhalle.", createdAt: daysAgo(2) },
]);

let ragStats = { indexedDocuments: 48, lastIndexedAt: daysAgo(3), reindexing: false };

registerMock("GET", "/api/admin/voice-agent/stats", () => ({
  totalCalls: conversations.list().length,
  avgDurationSec: 92,
  openCallbacks: callbacks.list().filter((c) => c.status === "offen").length,
}));
registerMock("GET", "/api/admin/voice-agent/callbacks", () => callbacks.list());
registerMock("GET", "/api/admin/voice-agent/conversations", () => conversations.list());
registerMock("GET", "/api/admin/voice-agent/rag/stats", () => ragStats);
registerMock("PATCH", "/api/admin/voice-agent/callbacks/:id", (p, _q, body) => callbacks.update(Number(p.id), body as never));
registerMock("POST", "/api/admin/voice-agent/rag/reindex", () => {
  ragStats = { ...ragStats, reindexing: false, lastIndexedAt: new Date().toISOString() };
  return ragStats;
});
registerMock("POST", "/api/admin/voice-agent/rag/test", (_p, _q, body) => {
  const { query } = (body ?? {}) as { query?: string };
  return { query, results: [{ document: "FAQ: Öffnungszeiten", score: 0.87, excerpt: "Die meisten Partner öffnen ab 09:00 Uhr ..." }] };
});
