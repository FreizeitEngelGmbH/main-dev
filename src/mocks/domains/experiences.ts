import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { experiencesSeed, categoriesSeed, partnersSeed } from "../data/core";

const store = createStore(experiencesSeed);

function enrich(exp: (typeof experiencesSeed)[number]) {
  return { ...exp, partnerName: partnersSeed.find((p) => p.id === exp.partnerId)?.companyName };
}

registerMock("GET", "/api/experiences", () => store.list().map(enrich));
registerMock("GET", "/api/categories", () => categoriesSeed);
registerMock("POST", "/api/experiences", (_p, _q, body) => store.create(body as Partial<(typeof experiencesSeed)[number]>));
registerMock("PUT", "/api/experiences/:id", (p, _q, body) => store.update(Number(p.id), body as Partial<(typeof experiencesSeed)[number]>));
registerMock("DELETE", "/api/experiences/:id", (p) => {
  store.remove(Number(p.id));
  return { success: true };
});
