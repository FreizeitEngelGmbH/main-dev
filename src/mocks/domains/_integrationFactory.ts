import { registerMock } from "../mockEngine";
import { partnersSeed } from "../data/core";

/**
 * The five booking-system integrations (Roller, Regiondo, Eversport,
 * Planyo, Pretix) all follow the same three-tier shape in the source app:
 * an admin overview, per-partner configure/test, and one or more
 * per-partner resource lists (products/sessions/items/...). This factory
 * registers that common shape once per system instead of duplicating it
 * five times.
 */
export function registerIntegrationMock(
  system: string,
  resources: { path: string; sample: (partnerId: number) => unknown[] }[],
  opts?: { apiInfo?: boolean }
) {
  const connectedPartnerIds = new Set(partnersSeed.filter((p) => p.bookingSystem === system).map((p) => p.id));

  registerMock("GET", `/api/admin/${system}/overview`, () => ({
    connectedPartners: connectedPartnerIds.size,
    totalPartners: partnersSeed.length,
    partners: partnersSeed.map((p) => ({
      partnerId: p.id,
      companyName: p.companyName,
      connected: connectedPartnerIds.has(p.id),
      status: connectedPartnerIds.has(p.id) ? "verbunden" : "nicht verbunden",
    })),
  }));

  for (const resource of resources) {
    registerMock("GET", `/api/admin/partners/:partnerId/${system}/${resource.path}`, (p) => resource.sample(Number(p.partnerId)));
  }

  registerMock("POST", `/api/admin/partners/:partnerId/${system}/configure`, (p, _q, body) => {
    connectedPartnerIds.add(Number(p.partnerId));
    return { success: true, partnerId: Number(p.partnerId), config: body };
  });

  registerMock("POST", `/api/admin/partners/:partnerId/${system}/test`, (p) => ({
    success: connectedPartnerIds.has(Number(p.partnerId)),
    message: connectedPartnerIds.has(Number(p.partnerId))
      ? "Verbindung erfolgreich (lokal)."
      : "Keine Zugangsdaten hinterlegt — bitte zuerst konfigurieren.",
  }));

  if (opts?.apiInfo) {
    registerMock("GET", `/api/admin/${system}/api-info`, () => ({
      system,
      docsUrl: `https://developer.${system}.example/docs`,
      version: "local",
    }));
  }
}
