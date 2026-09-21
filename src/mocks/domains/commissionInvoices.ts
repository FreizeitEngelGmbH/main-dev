import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { partnersSeed, daysAgo } from "../data/core";

interface CommissionInvoice {
  id: number; partnerId: number; partnerName: string; city: string | null; month: number; year: number;
  bookingCount: number; grossAmount: number; commissionRate: number; commissionAmount: number; taxAmount: number;
  totalAmount: number; status: string; createdAt: string;
}

const store = createStore<CommissionInvoice>(
  partnersSeed.filter((p) => p.approved).map((p, i) => {
    const gross = 1200 + i * 340;
    const commission = Math.round(gross * 0.11 * 100) / 100;
    const tax = Math.round(commission * 0.19 * 100) / 100;
    return {
      id: i + 1, partnerId: p.id, partnerName: p.companyName, city: p.city, month: 8, year: 2025,
      bookingCount: 12 + i * 3, grossAmount: gross, commissionRate: 0.11, commissionAmount: commission, taxAmount: tax,
      totalAmount: Math.round((commission + tax) * 100) / 100, status: i === 0 ? "bezahlt" : "versendet", createdAt: daysAgo(15 - i),
    };
  })
);

registerMock("GET", "/api/admin/commission-invoices", () => store.list());
registerMock("POST", "/api/admin/commission-invoices/generate", (_p, _q, body) => {
  const { month, year } = (body ?? {}) as { month: number; year: number };
  const generated = partnersSeed
    .filter((p) => p.approved)
    .map((p) => {
      const gross = 900 + Math.round(Math.random() * 600);
      const commission = Math.round(gross * 0.11 * 100) / 100;
      const tax = Math.round(commission * 0.19 * 100) / 100;
      return store.create({
        partnerId: p.id, partnerName: p.companyName, city: p.city, month, year,
        bookingCount: 8 + Math.round(Math.random() * 10), grossAmount: gross, commissionRate: 0.11,
        commissionAmount: commission, taxAmount: tax, totalAmount: Math.round((commission + tax) * 100) / 100,
        status: "entwurf", createdAt: new Date().toISOString(),
      });
    });
  return { generated: generated.length, invoices: generated };
});
registerMock("PATCH", "/api/admin/commission-invoices/:id/status", (p, _q, body) => store.update(Number(p.id), body as never));
registerMock("DELETE", "/api/admin/commission-invoices/:id", (p) => { store.remove(Number(p.id)); return { success: true }; });
