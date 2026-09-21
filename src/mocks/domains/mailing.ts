import { registerMock, MockApiError } from "../mockEngine";
import { createStore } from "../crudStore";
import { daysAgo } from "../data/core";

interface Campaign { id: number; name: string; subject: string; body: string; status: string; recipientCount: number; sentAt: string | null; createdAt: string; }
interface NewsletterSignup { id: number; email: string; name: string | null; createdAt: string; }
interface SystemEmailTemplate { key: string; name: string; category: string; subjectOverride: string | null; bodyHtmlOverride: string | null; enabled: boolean; defaultSubject: string; defaultBody: string; }

const campaignsStore = createStore<Campaign>([
  { id: 1, name: "Sommer-Aktion 2025", subject: "☀️ 20% auf alle Sommer-Erlebnisse", body: "<p>Jetzt sparen!</p>", status: "gesendet", recipientCount: 1204, sentAt: daysAgo(20), createdAt: daysAgo(21) },
  { id: 2, name: "Neue Partner in Bochum", subject: "Neu in deiner Stadt: 3 Erlebnisse", body: "<p>Entdecke Neues.</p>", status: "entwurf", recipientCount: 0, sentAt: null, createdAt: daysAgo(2) },
]);

const signupsStore = createStore<NewsletterSignup>([
  { id: 1, email: "j.koenig@example.com", name: "Julia König", createdAt: daysAgo(40) },
  { id: 2, email: "f.braun@example.com", name: "Felix Braun", createdAt: daysAgo(15) },
  { id: 3, email: "neuer.abonnent@example.com", name: null, createdAt: daysAgo(2) },
]);

const templates: SystemEmailTemplate[] = [
  { key: "welcome_day0", name: "Willkommen (Tag 0)", category: "Onboarding", subjectOverride: null, bodyHtmlOverride: null, enabled: true, defaultSubject: "Willkommen bei FreizeitEngel!", defaultBody: "<p>Schön, dass du da bist.</p>" },
  { key: "booking_confirmation", name: "Buchungsbestätigung", category: "Transaktional", subjectOverride: null, bodyHtmlOverride: null, enabled: true, defaultSubject: "Deine Buchung ist bestätigt", defaultBody: "<p>Details zu deiner Buchung.</p>" },
  { key: "password_reset", name: "Passwort zurücksetzen", category: "Transaktional", subjectOverride: null, bodyHtmlOverride: null, enabled: true, defaultSubject: "Passwort zurücksetzen", defaultBody: "<p>Klicke hier, um dein Passwort zurückzusetzen.</p>" },
];

registerMock("GET", "/api/admin/campaigns", () => campaignsStore.list());
registerMock("POST", "/api/admin/campaigns", (_p, _q, body) => campaignsStore.create({ status: "entwurf", recipientCount: 0, sentAt: null, createdAt: new Date().toISOString(), ...(body as object) } as Partial<Campaign>));
registerMock("POST", "/api/admin/campaigns/:id/send", (p) => campaignsStore.update(Number(p.id), { status: "gesendet", sentAt: new Date().toISOString(), recipientCount: signupsStore.list().length }));
registerMock("DELETE", "/api/admin/campaigns/:id", (p) => { campaignsStore.remove(Number(p.id)); return { success: true }; });

registerMock("GET", "/api/newsletter/signups", () => signupsStore.list());
registerMock("POST", "/api/newsletter/signup", (_p, _q, body) => {
  const { email, name } = (body ?? {}) as { email?: string; name?: string };
  return signupsStore.create({ email: email ?? "", name: name || null, createdAt: new Date().toISOString() });
});

registerMock("GET", "/api/admin/system-email-templates", () => templates);
registerMock("PATCH", "/api/admin/system-email-templates/:key", (p, _q, body) => {
  const t = templates.find((tpl) => tpl.key === p.key);
  if (!t) throw new MockApiError("Template nicht gefunden", 404);
  Object.assign(t, body as object);
  return t;
});
registerMock("POST", "/api/admin/system-email-templates/:key/reset", (p) => {
  const t = templates.find((tpl) => tpl.key === p.key);
  if (!t) throw new MockApiError("Template nicht gefunden", 404);
  t.subjectOverride = null;
  t.bodyHtmlOverride = null;
  return t;
});
registerMock("POST", "/api/admin/system-email-templates/:key/preview", (p) => {
  const t = templates.find((tpl) => tpl.key === p.key);
  if (!t) throw new MockApiError("Template nicht gefunden", 404);
  return { html: t.bodyHtmlOverride ?? t.defaultBody, subject: t.subjectOverride ?? t.defaultSubject };
});
registerMock("POST", "/api/admin/system-email-templates/:key/test-send", () => ({ success: true, message: "Test-E-Mail (Demo) versendet." }));
