import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { daysAgo } from "../data/core";

interface Material { id: number; title: string; category: string; description: string | null; format: string; previewUrl: string | null; createdAt: string; }

const store = createStore<Material>([
  { id: 1, title: "Partner-Flyer A5", category: "Print", description: "Werbe-Flyer für neue Partnerstandorte.", format: "PDF", previewUrl: null, createdAt: daysAgo(90) },
  { id: 2, title: "Social-Media Kit Sommer", category: "Social", description: "Instagram-Story-Vorlagen.", format: "HTML", previewUrl: null, createdAt: daysAgo(30) },
  { id: 3, title: "Schaufenster-Poster", category: "Print", description: "A2 Poster für Partner-Ladenfront.", format: "PDF", previewUrl: null, createdAt: daysAgo(120) },
]);

registerMock("GET", "/api/admin/materials", (_p, q) => {
  const category = q.get("category");
  return category ? store.list().filter((m) => m.category === category) : store.list();
});
registerMock("GET", "/api/admin/materials/:id/download", (p) => ({ url: `about:blank#material-${p.id}`, message: "Download ist im Demo-Modus simuliert." }));
registerMock("GET", "/api/admin/materials/:id/html", (p) => ({ html: `<p>Vorschau für Material #${p.id} (Demo)</p>` }));
registerMock("POST", "/api/admin/materials/seed", () => ({ imported: 0, message: "Demo-Daten sind bereits geladen." }));
registerMock("POST", "/api/admin/materials", (_p, _q, body) => store.create({ createdAt: new Date().toISOString(), ...(body as object) } as Partial<Material>));
registerMock("DELETE", "/api/admin/materials/:id", (p) => { store.remove(Number(p.id)); return { success: true }; });
