import { registerMock, MockApiError } from "../mockEngine";
import { createStore } from "../crudStore";
import { PaymentAccount, PaymentTransaction, PaymentPayout } from "@shared/schema";
import { partnersSeed, daysAgo } from "../data/core";

const accounts = createStore<PaymentAccount>(
  partnersSeed.slice(0, 4).map((p, i) => ({
    id: i + 1, partnerId: p.id, stripeAccountId: `acct_demo_${p.id}`, accountStatus: i === 3 ? "pending" : "active",
    onboardingComplete: i !== 3, payoutsEnabled: i !== 3, chargesEnabled: i !== 3, defaultCurrency: "eur", commissionRate: 0.11,
    businessType: "company", companyName: p.companyName, email: p.email, country: "DE", bankAccountLast4: "4242", bankName: "Demo Bank",
    totalEarnings: 4200 - i * 600, totalPayouts: 3800 - i * 600, pendingBalance: 400, createdAt: daysAgo(200 - i * 10), updatedAt: daysAgo(5),
  }))
);

const transactions = createStore<PaymentTransaction>(
  Array.from({ length: 6 }).map((_, i) => {
    const partner = partnersSeed[i % partnersSeed.length];
    const gross = 18.5 * (i + 1);
    const fee = Math.round(gross * 0.11 * 100) / 100;
    return {
      id: i + 1, transactionRef: `TX-${(500000 + i).toString(36).toUpperCase()}`, bookingId: i + 1, partnerId: partner.id,
      customerId: null, customerEmail: `kunde${i}@example.com`, customerName: `Kunde ${i + 1}`, type: "payment",
      status: i === 5 ? "refunded" : "paid", grossAmount: gross, platformFee: fee, partnerAmount: Math.round((gross - fee) * 100) / 100,
      commissionRate: 0.11, currency: "EUR", paymentMethod: i % 2 === 0 ? "stripe" : "paypal", stripePaymentIntentId: null,
      stripeTransferId: null, description: null, metadata: null, failureReason: null, refundedAmount: i === 5 ? gross : 0,
      paidAt: daysAgo(10 - i), createdAt: daysAgo(10 - i), updatedAt: daysAgo(10 - i),
    };
  })
);

const payouts = createStore<PaymentPayout>(
  accounts.list().map((acc, i) => ({
    id: i + 1, payoutRef: `PO-${(700000 + i).toString(36).toUpperCase()}`, partnerId: acc.partnerId, paymentAccountId: acc.id,
    amount: acc.totalPayouts ?? 0, currency: "EUR", status: i === 0 ? "pending" : "completed", stripePayoutId: `po_demo_${i}`,
    periodStart: daysAgo(37), periodEnd: daysAgo(7), transactionCount: 4 + i, bankAccountLast4: "4242", failureReason: null,
    processedAt: i === 0 ? null : daysAgo(6), createdAt: daysAgo(7),
  }))
);

const commissionSettings = { rate: 0.11 };
const onlineFeeSettings = { rate: 0.019, fixed: 0.25 };

registerMock("GET", "/api/admin/payments/stats", () => ({
  totalRevenue: transactions.list().reduce((s, t) => s + t.grossAmount, 0),
  totalCommission: transactions.list().reduce((s, t) => s + t.platformFee, 0),
  totalPayouts: payouts.list().reduce((s, p) => s + p.amount, 0),
  pendingPayouts: payouts.list().filter((p) => p.status === "pending").length,
  activeAccounts: accounts.list().filter((a) => a.accountStatus === "active").length,
}));
registerMock("GET", "/api/admin/payments/accounts", () => accounts.list());
registerMock("GET", "/api/admin/payments/transactions", () => transactions.list());
registerMock("GET", "/api/admin/payments/payouts", () => payouts.list());
registerMock("POST", "/api/admin/payments/seed", () => ({ imported: 0, message: "Demo-Daten sind bereits geladen." }));
registerMock("GET", "/api/admin/payments/settings", () => ({ commission: commissionSettings, onlineFee: onlineFeeSettings }));
registerMock("POST", "/api/admin/payments/settings/commission", (_p, _q, body) => {
  Object.assign(commissionSettings, body as object);
  return commissionSettings;
});
registerMock("POST", "/api/admin/payments/settings/online-fee", (_p, _q, body) => {
  Object.assign(onlineFeeSettings, body as object);
  return onlineFeeSettings;
});
registerMock("POST", "/api/admin/payments/transactions/:id/refund", (p) => transactions.update(Number(p.id), { status: "refunded", refundedAmount: transactions.get(Number(p.id)).grossAmount }));
registerMock("POST", "/api/admin/payments/payouts", (_p, _q, body) => payouts.create({ status: "pending", createdAt: new Date().toISOString(), ...(body as object) } as Partial<PaymentPayout>));
registerMock("POST", "/api/admin/payments/payouts/:id/complete", (p) => payouts.update(Number(p.id), { status: "completed", processedAt: new Date().toISOString() }));
registerMock("GET", "/api/admin/payments/partner/:partnerId/summary", (p) => {
  const account = accounts.list().find((a) => a.partnerId === Number(p.partnerId));
  if (!account) throw new MockApiError("Kein Zahlungskonto für diesen Partner", 404);
  return account;
});

export { accounts as paymentAccountsStore };
