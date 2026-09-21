import { registerMock } from "../mockEngine";
import { SupportConversation, SupportMessage } from "@shared/schema";
import { daysAgo } from "../data/core";

const conversations: SupportConversation[] = [
  { id: 1, sessionId: "sess-demo-1", userId: null, visitorName: "Anonymer Besucher", visitorEmail: null, status: "closed", category: "Buchung", summary: "Frage zur Stornierung einer Bowling-Buchung.", satisfaction: 5, createdAt: daysAgo(4), updatedAt: daysAgo(4) },
  { id: 2, sessionId: "sess-demo-2", userId: 5, visitorName: "Julia König", visitorEmail: "j.koenig@example.com", status: "active", category: "Partner", summary: null, satisfaction: null, createdAt: daysAgo(1), updatedAt: daysAgo(1) },
];

const messages: SupportMessage[] = [
  { id: 1, conversationId: 1, role: "user", content: "Kann ich meine Buchung stornieren?", metadata: null, createdAt: daysAgo(4) },
  { id: 2, conversationId: 1, role: "assistant", content: "Ja, kostenlose Stornierung bis 24 Std. vor dem Termin.", metadata: null, createdAt: daysAgo(4) },
  { id: 3, conversationId: 2, role: "user", content: "Wie kann ich Partner werden?", metadata: null, createdAt: daysAgo(1) },
];

registerMock("GET", "/api/admin/support/conversations", () => conversations);
registerMock("GET", "/api/admin/support/conversations/:id/messages", (p) => messages.filter((m) => m.conversationId === Number(p.id)));
