import { registerMock } from "../mockEngine";
import { createStore } from "../crudStore";
import { daysAgo } from "../data/core";

interface AccountingContact { id: number; name: string; type: string; email: string | null; vatId: string | null; createdAt: string; }
interface AccountingInvoice { id: number; number: string; contactId: number | null; amount: number; status: string; issueDate: string; dueDate: string; }
interface AccountingExpense { id: number; description: string; category: string; amount: number; date: string; }
interface AccountingRevenue { id: number; description: string; category: string; amount: number; date: string; }
interface TaxPeriod { id: number; period: string; status: string; vatDue: number; }

const contacts = createStore<AccountingContact>([
  { id: 1, name: "Bowlorado Dortmund GmbH", type: "Partner", email: "buchhaltung@bowlorado.de", vatId: "DE123456789", createdAt: daysAgo(200) },
  { id: 2, name: "Google Ireland Ltd.", type: "Lieferant", email: null, vatId: "IE6388047V", createdAt: daysAgo(300) },
]);
const invoices = createStore<AccountingInvoice>([
  { id: 1, number: "RE-2025-0031", contactId: 1, amount: 428.4, status: "bezahlt", issueDate: "2025-08-01", dueDate: "2025-08-15" },
  { id: 2, number: "RE-2025-0032", contactId: 1, amount: 512.0, status: "offen", issueDate: "2025-09-01", dueDate: "2025-09-15" },
]);
const expenses = createStore<AccountingExpense>([
  { id: 1, description: "Google Ads September", category: "Marketing", amount: 1200, date: "2025-09-05" },
  { id: 2, description: "Serverkosten", category: "IT", amount: 340, date: "2025-09-01" },
]);
const revenues = createStore<AccountingRevenue>([
  { id: 1, description: "Provisionen August", category: "Provisionen", amount: 4280, date: "2025-08-31" },
]);
const taxPeriods = createStore<TaxPeriod>([{ id: 1, period: "2025-Q3", status: "offen", vatDue: 812.6 }]);

registerMock("GET", "/api/admin/accounting/kpis", () => ({
  revenue: revenues.list().reduce((s, r) => s + r.amount, 0),
  expenses: expenses.list().reduce((s, e) => s + e.amount, 0),
  openInvoices: invoices.list().filter((i) => i.status === "offen").length,
  vatDue: taxPeriods.list().reduce((s, t) => s + t.vatDue, 0),
}));
registerMock("GET", "/api/admin/accounting/invoices", () => invoices.list());
registerMock("GET", "/api/admin/accounting/contacts", () => contacts.list());
registerMock("GET", "/api/admin/accounting/expenses", () => expenses.list());
registerMock("GET", "/api/admin/accounting/revenues", () => revenues.list());
registerMock("GET", "/api/admin/accounting/tax-periods", () => taxPeriods.list());
registerMock("POST", "/api/admin/accounting/seed", () => ({ imported: 0, message: "Beispieldaten sind bereits geladen." }));

registerMock("POST", "/api/admin/accounting/invoices", (_p, _q, body) => invoices.create(body as Partial<AccountingInvoice>));
registerMock("PATCH", "/api/admin/accounting/invoices/:id", (p, _q, body) => invoices.update(Number(p.id), body as never));
registerMock("DELETE", "/api/admin/accounting/invoices/:id", (p) => { invoices.remove(Number(p.id)); return { success: true }; });
registerMock("POST", "/api/admin/accounting/expenses", (_p, _q, body) => expenses.create(body as Partial<AccountingExpense>));
registerMock("DELETE", "/api/admin/accounting/expenses/:id", (p) => { expenses.remove(Number(p.id)); return { success: true }; });
registerMock("POST", "/api/admin/accounting/revenues", (_p, _q, body) => revenues.create(body as Partial<AccountingRevenue>));
registerMock("DELETE", "/api/admin/accounting/revenues/:id", (p) => { revenues.remove(Number(p.id)); return { success: true }; });
registerMock("POST", "/api/admin/accounting/contacts", (_p, _q, body) => contacts.create({ createdAt: new Date().toISOString(), ...(body as object) } as Partial<AccountingContact>));
registerMock("DELETE", "/api/admin/accounting/contacts/:id", (p) => { contacts.remove(Number(p.id)); return { success: true }; });
