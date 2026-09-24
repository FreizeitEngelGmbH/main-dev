import { registerMock, MockApiError } from "../mockEngine";
import { createStore } from "../crudStore";
import { PartnerOnboarding } from "@shared/schema";
import { partnersSeed, daysAgo } from "../data/core";

// Note: `GET /api/admin/payments/accounts` (also used by this page) is
// registered in `domains/payments.ts` — both files load into the same
// mock router via `registerAll.ts`, so no re-registration is needed here.

const store = createStore<PartnerOnboarding>(
  partnersSeed.map((p, i) => ({
    id: i + 1, partnerId: p.id,
    stepRegistration: true, stepRegistrationDate: daysAgo(300 - i * 10), stepRegistrationNotes: null,
    stepContract: p.approved, stepContractDate: p.approved ? daysAgo(280 - i * 10) : null, stepContractNotes: null,
    stepStripe: p.approved, stepStripeDate: p.approved ? daysAgo(270 - i * 10) : null, stepStripeNotes: null,
    stepExperiences: p.approved, stepExperiencesDate: p.approved ? daysAgo(260 - i * 10) : null, stepExperiencesNotes: null,
    stepBranding: p.isLive, stepBrandingDate: p.isLive ? daysAgo(250 - i * 10) : null, stepBrandingNotes: null,
    stepMarketing: p.isLive, stepMarketingDate: p.isLive ? daysAgo(240 - i * 10) : null, stepMarketingNotes: null,
    stepTesting: p.isLive, stepTestingDate: p.isLive ? daysAgo(230 - i * 10) : null, stepTestingNotes: null,
    stepGoLive: p.isLive, stepGoLiveDate: p.isLive ? daysAgo(220 - i * 10) : null, stepGoLiveNotes: null,
    overallStatus: p.isLive ? "live" : p.approved ? "in_bearbeitung" : "nicht_gestartet",
    assignedTo: "Admin", priority: "normal", createdAt: daysAgo(300 - i * 10), updatedAt: daysAgo(5),
  }))
);

registerMock("GET", "/api/admin/onboarding", () => store.list());
registerMock("GET", "/api/admin/onboarding/:partnerId", (p) => {
  const item = store.list().find((o) => o.partnerId === Number(p.partnerId));
  if (!item) throw new MockApiError("Onboarding-Eintrag nicht gefunden", 404);
  return item;
});
registerMock("POST", "/api/admin/onboarding", (_p, _q, body) => store.create({ overallStatus: "nicht_gestartet", priority: "normal", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...(body as object) } as Partial<PartnerOnboarding>));
registerMock("PATCH", "/api/admin/onboarding/:partnerId", (p, _q, body) => {
  const item = store.list().find((o) => o.partnerId === Number(p.partnerId));
  if (!item) throw new MockApiError("Onboarding-Eintrag nicht gefunden", 404);
  return store.update(item.id, { ...(body as object), updatedAt: new Date().toISOString() } as never);
});
