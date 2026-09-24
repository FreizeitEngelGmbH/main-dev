import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { KbArticle, KbCategory } from "@shared/schema";
import { daysAgo } from "../data/core";

const categories = createStore<KbCategory>([
  { id: 1, name: "Erste Schritte", slug: "erste-schritte", icon: "FileText", description: null, displayOrder: 0, createdAt: daysAgo(200) },
  { id: 2, name: "Zahlungen", slug: "zahlungen", icon: "Wallet", description: null, displayOrder: 1, createdAt: daysAgo(200) },
]);

const articles = createStore<KbArticle>([
  { id: 1, categoryId: 1, title: "Wie lege ich einen neuen Partner an?", slug: "neuer-partner", content: "<p>Schritt-für-Schritt-Anleitung ...</p>", excerpt: "Kurzanleitung zum Anlegen neuer Partner.", tags: ["Partner", "Onboarding"], published: true, views: 142, createdAt: daysAgo(180), updatedAt: daysAgo(20) },
  { id: 2, categoryId: 2, title: "Provisionsabrechnung verstehen", slug: "provisionsabrechnung", content: "<p>Die Provision wird monatlich berechnet ...</p>", excerpt: "So funktioniert die monatliche Abrechnung.", tags: ["Provisionen"], published: true, views: 87, createdAt: daysAgo(150), updatedAt: daysAgo(5) },
]);

registerMock("GET", "/api/admin/kb/categories", () => categories.list());
registerMock("GET", "/api/admin/kb/articles", (_p, q) => {
  const search = q.get("search");
  if (!search) return articles.list();
  const term = search.toLowerCase();
  return articles.list().filter((a) => a.title.toLowerCase().includes(term) || a.content.toLowerCase().includes(term));
});
registerMock("POST", "/api/admin/kb/seed", () => ({ imported: 0, message: "Beispieldaten sind bereits geladen." }));
registerMock("POST", "/api/admin/kb/articles", (_p, _q, body) => articles.create({ views: 0, published: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...(body as object) } as Partial<KbArticle>));
registerMock("PATCH", "/api/admin/kb/articles/:id", (p, _q, body) => articles.update(Number(p.id), { ...(body as object), updatedAt: new Date().toISOString() } as never));
registerMock("DELETE", "/api/admin/kb/articles/:id", (p) => { articles.remove(Number(p.id)); return { success: true }; });
registerMock("POST", "/api/admin/kb/categories", (_p, _q, body) => categories.create({ createdAt: new Date().toISOString(), ...(body as object) } as Partial<KbCategory>));
registerMock("PATCH", "/api/admin/kb/categories/:id", (p, _q, body) => categories.update(Number(p.id), body as never));
registerMock("DELETE", "/api/admin/kb/categories/:id", (p) => { categories.remove(Number(p.id)); return { success: true }; });
