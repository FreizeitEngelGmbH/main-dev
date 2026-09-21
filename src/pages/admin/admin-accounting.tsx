import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminLayout from "./admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Euro, TrendingUp, TrendingDown, FileText, AlertTriangle, Receipt,
  Plus, Search, Download, Trash2, Edit, Eye, Users, Building2,
  PiggyBank, Calculator, BarChart3, ArrowUpRight, ArrowDownRight,
  CheckCircle2, Clock, XCircle, Send, CreditCard, Banknote
} from "lucide-react";

type KPIs = {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  invoiceCount: number;
  openInvoices: number;
  openInvoiceAmount: number;
  overdueInvoices: number;
  overdueAmount: number;
  vatCollected: number;
  vatPaid: number;
  vatDue: number;
};

function formatCurrency(cents: number) {
  return cents.toFixed(2).replace('.', ',') + '€';
}

function formatDate(date: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("de-DE");
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-200 text-gray-500",
  open: "bg-yellow-100 text-yellow-800",
  filed: "bg-green-100 text-green-800",
};

const statusLabels: Record<string, string> = {
  draft: "Entwurf",
  sent: "Versendet",
  paid: "Bezahlt",
  overdue: "Überfällig",
  cancelled: "Storniert",
  open: "Offen",
  filed: "Eingereicht",
};

const expenseCategories = [
  { value: "server", label: "Server & Hosting" },
  { value: "software", label: "Software & Lizenzen" },
  { value: "marketing", label: "Marketing & Werbung" },
  { value: "büro", label: "Büromaterial" },
  { value: "personal", label: "Personal & Freelancer" },
  { value: "versicherung", label: "Versicherungen" },
  { value: "reise", label: "Reise & Fahrtkosten" },
  { value: "telefon", label: "Telefon & Internet" },
  { value: "beratung", label: "Beratung & Rechtsanwalt" },
  { value: "sonstiges", label: "Sonstiges" },
];

// Dashboard Tab
function DashboardTab() {
  const { data: kpis, isLoading } = useQuery<KPIs>({ queryKey: ["/api/admin/accounting/kpis"] });

  if (isLoading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamtumsatz</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(kpis?.totalRevenue || 0)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamtausgaben</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(kpis?.totalExpenses || 0)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gewinn / Verlust</p>
                <p className={`text-2xl font-bold ${(kpis?.profit || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(kpis?.profit || 0)}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${(kpis?.profit || 0) >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                <Euro className={`h-6 w-6 ${(kpis?.profit || 0) >= 0 ? "text-green-600" : "text-red-600"}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">USt.-Zahllast</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(kpis?.vatDue || 0)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Rechnungen gesamt</span>
            </div>
            <p className="text-3xl font-bold">{kpis?.invoiceCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Offene Rechnungen</span>
            </div>
            <p className="text-3xl font-bold">{kpis?.openInvoices || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">{formatCurrency(kpis?.openInvoiceAmount || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">Überfällige Rechnungen</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{kpis?.overdueInvoices || 0}</p>
            <p className="text-sm text-red-500 mt-1">{formatCurrency(kpis?.overdueAmount || 0)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-green-500" />
              Umsatzsteuer (erhoben)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(kpis?.vatCollected || 0)}</p>
            <p className="text-sm text-muted-foreground mt-1">Auf Einnahmen erhobene Mehrwertsteuer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-blue-500" />
              Vorsteuer (gezahlt)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(kpis?.vatPaid || 0)}</p>
            <p className="text-sm text-muted-foreground mt-1">Auf Ausgaben gezahlte Mehrwertsteuer</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Invoices Tab
function InvoicesTab() {
  const { data: invoices = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/accounting/invoices"] });
  const { data: contacts = [] } = useQuery<any[]>({ queryKey: ["/api/admin/accounting/contacts"] });
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const [form, setForm] = useState({
    contactId: "",
    invoiceNumber: "",
    status: "draft",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    taxRate: 19,
    notes: "",
    items: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 19 }],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const items = data.items.map((item: any) => {
        const lineNet = item.quantity * item.unitPrice;
        const lineTax = Math.round(lineNet * item.taxRate / 100);
        return { ...item, unitPrice: item.unitPrice, lineNet, lineTax, lineGross: lineNet + lineTax };
      });
      const netAmount = items.reduce((s: number, i: any) => s + i.lineNet, 0);
      const taxAmount = items.reduce((s: number, i: any) => s + i.lineTax, 0);
      return apiRequest("POST", "/api/admin/accounting/invoices", {
        ...data,
        contactId: data.contactId ? Number(data.contactId) : null,
        issueDate: new Date(data.issueDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        netAmount, taxAmount, grossAmount: netAmount + taxAmount,
        items,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/kpis"] });
      setShowCreate(false);
      toast({ title: "Rechnung erstellt" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/admin/accounting/invoices/${id}`, {
        status,
        ...(status === "paid" ? { paymentDate: new Date() } : {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/kpis"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/accounting/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/kpis"] });
      toast({ title: "Rechnung gelöscht" });
    },
  });

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: "", quantity: 1, unitPrice: 0, taxRate: 19 }] }));
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i: number, field: string, value: any) => {
    setForm(f => ({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item) }));
  };

  const filtered = invoices.filter((inv: any) => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (search && !inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getContactName = (id: number | null) => {
    if (!id) return "-";
    const c = contacts.find((c: any) => c.id === id);
    return c ? c.name : "-";
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechnung suchen..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="draft">Entwurf</SelectItem>
              <SelectItem value="sent">Versendet</SelectItem>
              <SelectItem value="paid">Bezahlt</SelectItem>
              <SelectItem value="overdue">Überfällig</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Neue Rechnung</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Neue Rechnung erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rechnungsnummer</Label>
                  <Input value={form.invoiceNumber} onChange={(e) => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} placeholder="RE-2026-005" />
                </div>
                <div>
                  <Label>Kontakt</Label>
                  <Select value={form.contactId} onValueChange={(v) => setForm(f => ({ ...f, contactId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Kontakt wählen" /></SelectTrigger>
                    <SelectContent>
                      {contacts.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Rechnungsdatum</Label>
                  <Input type="date" value={form.issueDate} onChange={(e) => setForm(f => ({ ...f, issueDate: e.target.value }))} />
                </div>
                <div>
                  <Label>Fälligkeitsdatum</Label>
                  <Input type="date" value={form.dueDate} onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>

              <div>
                <Label>Positionen</Label>
                <div className="space-y-2 mt-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex items-end gap-2 p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <Label className="text-xs">Beschreibung</Label>
                        <Input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} placeholder="Leistung..." />
                      </div>
                      <div className="w-20">
                        <Label className="text-xs">Menge</Label>
                        <Input type="number" value={item.quantity} onChange={(e) => updateItem(i, "quantity", Number(e.target.value))} />
                      </div>
                      <div className="w-28">
                        <Label className="text-xs">Einzelpreis (Ct)</Label>
                        <Input type="number" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))} />
                      </div>
                      <div className="w-20">
                        <Label className="text-xs">MwSt %</Label>
                        <Input type="number" value={item.taxRate} onChange={(e) => updateItem(i, "taxRate", Number(e.target.value))} />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(i)} className="shrink-0">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-3 w-3 mr-1" />Position hinzufügen
                  </Button>
                </div>
              </div>

              <div>
                <Label>Notizen</Label>
                <Textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optionale Bemerkungen..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Abbrechen</Button>
              <Button onClick={() => createMutation.mutate(form)} disabled={!form.invoiceNumber || createMutation.isPending}>
                {createMutation.isPending ? "Erstellen..." : "Rechnung erstellen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium">Nr.</th>
                  <th className="text-left p-3 text-sm font-medium">Kontakt</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-left p-3 text-sm font-medium">Datum</th>
                  <th className="text-left p-3 text-sm font-medium">Fällig</th>
                  <th className="text-right p-3 text-sm font-medium">Netto</th>
                  <th className="text-right p-3 text-sm font-medium">Brutto</th>
                  <th className="text-right p-3 text-sm font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Keine Rechnungen gefunden</td></tr>
                ) : (
                  filtered.map((inv: any) => (
                    <tr key={inv.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-mono text-sm">{inv.invoiceNumber}</td>
                      <td className="p-3 text-sm">{getContactName(inv.contactId)}</td>
                      <td className="p-3">
                        <Badge className={statusColors[inv.status] || ""}>{statusLabels[inv.status] || inv.status}</Badge>
                      </td>
                      <td className="p-3 text-sm">{formatDate(inv.issueDate)}</td>
                      <td className="p-3 text-sm">{formatDate(inv.dueDate)}</td>
                      <td className="p-3 text-sm text-right">{formatCurrency(inv.netAmount / 100)}</td>
                      <td className="p-3 text-sm text-right font-medium">{formatCurrency(inv.grossAmount / 100)}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {inv.status === "draft" && (
                            <Button variant="ghost" size="sm" onClick={() => updateStatusMutation.mutate({ id: inv.id, status: "sent" })}>
                              <Send className="h-3 w-3 mr-1" />Senden
                            </Button>
                          )}
                          {(inv.status === "sent" || inv.status === "overdue") && (
                            <Button variant="ghost" size="sm" onClick={() => updateStatusMutation.mutate({ id: inv.id, status: "paid" })}>
                              <CheckCircle2 className="h-3 w-3 mr-1" />Bezahlt
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(inv.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Expenses Tab
function ExpensesTab() {
  const { data: expenses = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/accounting/expenses"] });
  const { data: contacts = [] } = useQuery<any[]>({ queryKey: ["/api/admin/accounting/contacts"] });
  const [showCreate, setShowCreate] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  const [form, setForm] = useState({
    category: "sonstiges",
    description: "",
    date: new Date().toISOString().split("T")[0],
    netAmount: 0,
    taxRate: 19,
    paymentMethod: "",
    contactId: "",
    recurring: false,
    notes: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const taxAmount = Math.round(data.netAmount * data.taxRate / 100);
      return apiRequest("POST", "/api/admin/accounting/expenses", {
        ...data,
        contactId: data.contactId ? Number(data.contactId) : null,
        date: new Date(data.date),
        taxAmount,
        grossAmount: data.netAmount + taxAmount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/kpis"] });
      setShowCreate(false);
      setForm({ category: "sonstiges", description: "", date: new Date().toISOString().split("T")[0], netAmount: 0, taxRate: 19, paymentMethod: "", contactId: "", recurring: false, notes: "" });
      toast({ title: "Ausgabe erfasst" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/accounting/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/kpis"] });
      toast({ title: "Ausgabe gelöscht" });
    },
  });

  const filtered = expenses.filter((e: any) => categoryFilter === "all" || e.category === categoryFilter);
  const totalNet = filtered.reduce((s: number, e: any) => s + e.netAmount, 0);
  const totalGross = filtered.reduce((s: number, e: any) => s + e.grossAmount, 0);

  if (isLoading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {expenseCategories.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Neue Ausgabe</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neue Ausgabe erfassen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kategorie</Label>
                  <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Datum</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Beschreibung</Label>
                <Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Was wurde bezahlt?" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nettobetrag (in Cent)</Label>
                  <Input type="number" value={form.netAmount} onChange={(e) => setForm(f => ({ ...f, netAmount: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>MwSt.-Satz %</Label>
                  <Input type="number" value={form.taxRate} onChange={(e) => setForm(f => ({ ...f, taxRate: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Zahlungsmethode</Label>
                  <Select value={form.paymentMethod} onValueChange={(v) => setForm(f => ({ ...f, paymentMethod: v }))}>
                    <SelectTrigger><SelectValue placeholder="Wählen..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banküberweisung">Banküberweisung</SelectItem>
                      <SelectItem value="kreditkarte">Kreditkarte</SelectItem>
                      <SelectItem value="lastschrift">Lastschrift</SelectItem>
                      <SelectItem value="bar">Barzahlung</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lieferant</Label>
                  <Select value={form.contactId} onValueChange={(v) => setForm(f => ({ ...f, contactId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      {contacts.filter((c: any) => c.type === "supplier").map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Notizen</Label>
                <Textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Abbrechen</Button>
              <Button onClick={() => createMutation.mutate(form)} disabled={!form.description || createMutation.isPending}>
                {createMutation.isPending ? "Speichern..." : "Ausgabe speichern"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Summe Netto</p>
            <p className="text-xl font-bold">{formatCurrency(totalNet / 100)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Summe Brutto</p>
            <p className="text-xl font-bold">{formatCurrency(totalGross / 100)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium">Datum</th>
                  <th className="text-left p-3 text-sm font-medium">Kategorie</th>
                  <th className="text-left p-3 text-sm font-medium">Beschreibung</th>
                  <th className="text-left p-3 text-sm font-medium">Zahlung</th>
                  <th className="text-right p-3 text-sm font-medium">Netto</th>
                  <th className="text-right p-3 text-sm font-medium">Brutto</th>
                  <th className="text-right p-3 text-sm font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Keine Ausgaben gefunden</td></tr>
                ) : (
                  filtered.map((exp: any) => (
                    <tr key={exp.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 text-sm">{formatDate(exp.date)}</td>
                      <td className="p-3">
                        <Badge variant="outline">{expenseCategories.find(c => c.value === exp.category)?.label || exp.category}</Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {exp.description}
                        {exp.recurring && <Badge className="ml-2 bg-purple-100 text-purple-800 text-xs">Wiederkehrend</Badge>}
                      </td>
                      <td className="p-3 text-sm capitalize">{exp.paymentMethod || "-"}</td>
                      <td className="p-3 text-sm text-right">{formatCurrency(exp.netAmount / 100)}</td>
                      <td className="p-3 text-sm text-right font-medium">{formatCurrency(exp.grossAmount / 100)}</td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(exp.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Revenues Tab
function RevenuesTab() {
  const { data: revenues = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/accounting/revenues"] });
  const [showCreate, setShowCreate] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    source: "manual",
    description: "",
    date: new Date().toISOString().split("T")[0],
    netAmount: 0,
    taxRate: 19,
    category: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const taxAmount = Math.round(data.netAmount * data.taxRate / 100);
      return apiRequest("POST", "/api/admin/accounting/revenues", {
        ...data,
        date: new Date(data.date),
        taxAmount,
        grossAmount: data.netAmount + taxAmount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/revenues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/kpis"] });
      setShowCreate(false);
      toast({ title: "Einnahme erfasst" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/accounting/revenues/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/revenues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/kpis"] });
      toast({ title: "Einnahme gelöscht" });
    },
  });

  const totalNet = revenues.reduce((s: number, r: any) => s + r.netAmount, 0);
  const totalGross = revenues.reduce((s: number, r: any) => s + r.grossAmount, 0);

  if (isLoading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 gap-4 flex-1 mr-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Einnahmen Netto</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalNet / 100)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Einnahmen Brutto</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalGross / 100)}</p>
            </CardContent>
          </Card>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Neue Einnahme</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neue Einnahme erfassen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Beschreibung</Label>
                <Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Einnahmequelle..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Datum</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <Label>Kategorie</Label>
                  <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Wählen..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="provisionen">Provisionen</SelectItem>
                      <SelectItem value="werbung">Werbung</SelectItem>
                      <SelectItem value="beratung">Beratung</SelectItem>
                      <SelectItem value="abonnements">Abonnements</SelectItem>
                      <SelectItem value="sonstiges">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nettobetrag (in Cent)</Label>
                  <Input type="number" value={form.netAmount} onChange={(e) => setForm(f => ({ ...f, netAmount: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>MwSt.-Satz %</Label>
                  <Input type="number" value={form.taxRate} onChange={(e) => setForm(f => ({ ...f, taxRate: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <Label>Quelle</Label>
                <Select value={form.source} onValueChange={(v) => setForm(f => ({ ...f, source: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking">Buchung</SelectItem>
                    <SelectItem value="manual">Manuell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Abbrechen</Button>
              <Button onClick={() => createMutation.mutate(form)} disabled={!form.description || createMutation.isPending}>
                {createMutation.isPending ? "Speichern..." : "Einnahme speichern"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium">Datum</th>
                  <th className="text-left p-3 text-sm font-medium">Beschreibung</th>
                  <th className="text-left p-3 text-sm font-medium">Quelle</th>
                  <th className="text-left p-3 text-sm font-medium">Kategorie</th>
                  <th className="text-right p-3 text-sm font-medium">Netto</th>
                  <th className="text-right p-3 text-sm font-medium">MwSt.</th>
                  <th className="text-right p-3 text-sm font-medium">Brutto</th>
                  <th className="text-right p-3 text-sm font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {revenues.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Keine Einnahmen gefunden</td></tr>
                ) : (
                  revenues.map((rev: any) => (
                    <tr key={rev.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 text-sm">{formatDate(rev.date)}</td>
                      <td className="p-3 text-sm">{rev.description}</td>
                      <td className="p-3"><Badge variant="outline">{rev.source === "booking" ? "Buchung" : "Manuell"}</Badge></td>
                      <td className="p-3 text-sm capitalize">{rev.category || "-"}</td>
                      <td className="p-3 text-sm text-right">{formatCurrency(rev.netAmount / 100)}</td>
                      <td className="p-3 text-sm text-right">{formatCurrency(rev.taxAmount / 100)}</td>
                      <td className="p-3 text-sm text-right font-medium text-green-600">{formatCurrency(rev.grossAmount / 100)}</td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(rev.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Tax Tab
function TaxTab() {
  const { data: periods = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/accounting/tax-periods"] });
  const { data: kpis } = useQuery<KPIs>({ queryKey: ["/api/admin/accounting/kpis"] });

  if (isLoading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowUpRight className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">USt. erhoben</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(kpis?.vatCollected || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Auf Einnahmen erhobene MwSt.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowDownRight className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Vorsteuer gezahlt</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(kpis?.vatPaid || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Auf Ausgaben gezahlte MwSt.</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">USt.-Zahllast</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(kpis?.vatDue || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">An das Finanzamt zu zahlen</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            USt.-Voranmeldungen
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium">Zeitraum</th>
                  <th className="text-right p-3 text-sm font-medium">USt. erhoben</th>
                  <th className="text-right p-3 text-sm font-medium">Vorsteuer</th>
                  <th className="text-right p-3 text-sm font-medium">Zahllast</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-left p-3 text-sm font-medium">Eingereicht</th>
                </tr>
              </thead>
              <tbody>
                {periods.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Keine Steuerperioden vorhanden</td></tr>
                ) : (
                  periods.map((p: any) => (
                    <tr key={p.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 text-sm font-medium">{p.periodLabel}</td>
                      <td className="p-3 text-sm text-right">{formatCurrency(p.vatCollected / 100)}</td>
                      <td className="p-3 text-sm text-right">{formatCurrency(p.vatPaid / 100)}</td>
                      <td className="p-3 text-sm text-right font-medium text-orange-600">{formatCurrency(p.vatDue / 100)}</td>
                      <td className="p-3">
                        <Badge className={statusColors[p.status] || ""}>{statusLabels[p.status] || p.status}</Badge>
                      </td>
                      <td className="p-3 text-sm">{formatDate(p.filedDate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Reports Tab
function ReportsTab() {
  const { data: kpis } = useQuery<KPIs>({ queryKey: ["/api/admin/accounting/kpis"] });
  const { data: expenses = [] } = useQuery<any[]>({ queryKey: ["/api/admin/accounting/expenses"] });
  const { data: revenues = [] } = useQuery<any[]>({ queryKey: ["/api/admin/accounting/revenues"] });

  const expensesByCategory = expenses.reduce((acc: Record<string, number>, e: any) => {
    acc[e.category] = (acc[e.category] || 0) + e.grossAmount;
    return acc;
  }, {});

  const revenuesByCategory = revenues.reduce((acc: Record<string, number>, r: any) => {
    const cat = r.category || "sonstiges";
    acc[cat] = (acc[cat] || 0) + r.grossAmount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gewinn- und Verlustrechnung (GuV)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold text-green-700 mb-3">Einnahmen</h3>
              {Object.entries(revenuesByCategory).map(([cat, amount]) => (
                <div key={cat} className="flex justify-between py-1">
                  <span className="capitalize">{cat}</span>
                  <span className="text-green-600 font-medium">{formatCurrency((amount as number) / 100)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 mt-2 border-t font-bold">
                <span>Gesamteinnahmen</span>
                <span className="text-green-600">{formatCurrency(kpis?.totalRevenue || 0)}</span>
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="font-semibold text-red-700 mb-3">Ausgaben</h3>
              {Object.entries(expensesByCategory).map(([cat, amount]) => (
                <div key={cat} className="flex justify-between py-1">
                  <span>{expenseCategories.find(c => c.value === cat)?.label || cat}</span>
                  <span className="text-red-600 font-medium">-{formatCurrency((amount as number) / 100)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 mt-2 border-t font-bold">
                <span>Gesamtausgaben</span>
                <span className="text-red-600">-{formatCurrency(kpis?.totalExpenses || 0)}</span>
              </div>
            </div>

            <div className={`flex justify-between py-3 text-lg font-bold rounded-lg px-4 ${(kpis?.profit || 0) >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              <span>Ergebnis (Gewinn/Verlust)</span>
              <span>{formatCurrency(kpis?.profit || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Steuerübersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Erhobene USt. (auf Einnahmen)</span>
              <span className="font-medium">{formatCurrency(kpis?.vatCollected || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gezahlte Vorsteuer (auf Ausgaben)</span>
              <span className="font-medium">-{formatCurrency(kpis?.vatPaid || 0)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t text-lg font-bold text-orange-600">
              <span>USt.-Zahllast</span>
              <span>{formatCurrency(kpis?.vatDue || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ausgaben nach Kategorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(expensesByCategory)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([cat, amount]) => {
                const totalExpGross = expenses.reduce((s: number, e: any) => s + e.grossAmount, 0);
                const pct = totalExpGross > 0 ? ((amount as number) / totalExpGross * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{expenseCategories.find(c => c.value === cat)?.label || cat}</span>
                      <span className="font-medium">{formatCurrency((amount as number) / 100)} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Contacts Tab
function ContactsTab() {
  const { data: contacts = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/accounting/contacts"] });
  const [showCreate, setShowCreate] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();

  const [form, setForm] = useState({
    type: "customer",
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    vatId: "",
    notes: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/accounting/contacts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/contacts"] });
      setShowCreate(false);
      setForm({ type: "customer", name: "", company: "", email: "", phone: "", address: "", city: "", zip: "", vatId: "", notes: "" });
      toast({ title: "Kontakt erstellt" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/accounting/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting/contacts"] });
      toast({ title: "Kontakt gelöscht" });
    },
  });

  const filtered = contacts.filter((c: any) => typeFilter === "all" || c.type === typeFilter);

  if (isLoading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="customer">Kunden</SelectItem>
            <SelectItem value="supplier">Lieferanten</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Neuer Kontakt</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Kontakt anlegen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Typ</Label>
                  <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Kunde</SelectItem>
                      <SelectItem value="supplier">Lieferant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>USt-IdNr.</Label>
                  <Input value={form.vatId} onChange={(e) => setForm(f => ({ ...f, vatId: e.target.value }))} placeholder="DE123456789" />
                </div>
              </div>
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>Firma</Label>
                <Input value={form.company} onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>E-Mail</Label>
                  <Input value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <Label>Telefon</Label>
                  <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Adresse</Label>
                <Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>PLZ</Label>
                  <Input value={form.zip} onChange={(e) => setForm(f => ({ ...f, zip: e.target.value }))} />
                </div>
                <div>
                  <Label>Stadt</Label>
                  <Input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Notizen</Label>
                <Textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Abbrechen</Button>
              <Button onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending}>
                {createMutation.isPending ? "Speichern..." : "Kontakt speichern"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-muted-foreground">Keine Kontakte gefunden</CardContent>
          </Card>
        ) : (
          filtered.map((c: any) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${c.type === "customer" ? "bg-green-100" : "bg-blue-100"}`}>
                      {c.type === "customer" ? <Users className="h-5 w-5 text-green-600" /> : <Building2 className="h-5 w-5 text-blue-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      {c.company && <p className="text-sm text-muted-foreground">{c.company}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {c.email && <p>{c.email}</p>}
                  {c.phone && <p>{c.phone}</p>}
                  {c.city && <p>{c.zip} {c.city}</p>}
                  {c.vatId && <p className="font-mono text-xs">{c.vatId}</p>}
                </div>
                <Badge className="mt-2" variant="outline">{c.type === "customer" ? "Kunde" : "Lieferant"}</Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Main Component
export default function AdminAccounting() {
  const { toast } = useToast();
  const seedMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/admin/accounting/seed"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounting"] });
      toast({ title: "Demo-Daten angelegt" });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Buchhaltung</h1>
            <p className="text-muted-foreground">Finanzverwaltung im Lexoffice-Stil</p>
          </div>
          <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
            {seedMutation.isPending ? "Laden..." : "Demo-Daten laden"}
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 mr-1 hidden sm:block" />Dashboard
            </TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs sm:text-sm">
              <FileText className="h-4 w-4 mr-1 hidden sm:block" />Rechnungen
            </TabsTrigger>
            <TabsTrigger value="expenses" className="text-xs sm:text-sm">
              <CreditCard className="h-4 w-4 mr-1 hidden sm:block" />Ausgaben
            </TabsTrigger>
            <TabsTrigger value="revenues" className="text-xs sm:text-sm">
              <Banknote className="h-4 w-4 mr-1 hidden sm:block" />Einnahmen
            </TabsTrigger>
            <TabsTrigger value="tax" className="text-xs sm:text-sm">
              <Calculator className="h-4 w-4 mr-1 hidden sm:block" />Steuer
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">
              <PiggyBank className="h-4 w-4 mr-1 hidden sm:block" />Berichte
            </TabsTrigger>
            <TabsTrigger value="contacts" className="text-xs sm:text-sm">
              <Users className="h-4 w-4 mr-1 hidden sm:block" />Kontakte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="invoices"><InvoicesTab /></TabsContent>
          <TabsContent value="expenses"><ExpensesTab /></TabsContent>
          <TabsContent value="revenues"><RevenuesTab /></TabsContent>
          <TabsContent value="tax"><TaxTab /></TabsContent>
          <TabsContent value="reports"><ReportsTab /></TabsContent>
          <TabsContent value="contacts"><ContactsTab /></TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}