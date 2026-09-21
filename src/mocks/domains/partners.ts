import { registerMock, MockApiError } from "../mockEngine";
import { createStore } from "../crudStore";
import { partnersSeed, usersSeed } from "../data/core";

const store = createStore(partnersSeed);

function withUser(partner: (typeof partnersSeed)[number]) {
  return { ...partner, user: usersSeed.find((u) => u.id === partner.userId) };
}

registerMock("GET", "/api/admin/partners", () => store.list().map(withUser));
registerMock("GET", "/api/partners", () => store.list());
// Landing-page "Partner werden" application: lands in the admin list as an unapproved partner.
registerMock("POST", "/api/partners", (_p, _q, body) => {
  const data = (body ?? {}) as Partial<(typeof partnersSeed)[number]>;
  return store.create({
    country: "Deutschland",
    status: "aktiv",
    approved: false,
    isLive: false,
    createdAt: new Date().toISOString(),
    ...data,
  });
});
registerMock("GET", "/api/partners/:id", (p) => {
  const partner = store.tryGet(Number(p.id));
  if (!partner) throw new MockApiError("Partner nicht gefunden", 404);
  return partner;
});

// The source app's PUT for partner edits/approval toggles intentionally
// omits the /admin prefix (`/api/partners/:id`, not `/api/admin/partners/:id`)
// — preserved exactly since admin-partners.tsx calls it that way.
registerMock("PUT", "/api/partners/:id", (p, _q, body) => store.update(Number(p.id), body as Partial<(typeof partnersSeed)[number]>));
