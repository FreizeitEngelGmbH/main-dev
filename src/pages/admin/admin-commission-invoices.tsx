import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "./admin-layout";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, Euro, Send, CheckCircle2, AlertCircle, Clock, Download, Trash2,
  Building2, Calendar, Receipt, TrendingUp, Filter, RefreshCw, ChevronDown, ChevronRight,
} from "lucide-react";

interface CommissionInvoice {
  id: number;
  partnerId: number;
  invoiceNumber: string;
  periodMonth: number;
  periodYear: number;
  bookingCount: number;
  grossRevenue: number;
  commissionRate: number;
  commissionNet: number;
  commissionTax: number;
  commissionGross: number;
  status: string;
  issueDate: string | null;
  dueDate: string | null;
  paidDate: string | null;
  sentAt: string | null;
  notes: string | null;
  createdAt: string;
  partnerName: string;
  partnerCity: string;
}

const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

function cents(val: number) {
  return (val / 100).toFixed(2).replace(".", ",");
}

export default function AdminCommissionInvoices() {
  const { toast } = useToast();
  const [genMonth, setGenMonth] = useState(String(new Date().getMonth() + 1));
  const [genYear, setGenYear] = useState(String(new Date().getFullYear()));
  const [filterStatus, setFilterStatus] = useState("alle");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: invoices, isLoading } = useQuery<CommissionInvoice[]>({
    queryKey: ["/api/admin/commission-invoices"],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/commission-invoices/generate", {
        month: parseInt(genMonth),
        year: parseInt(genYear),
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Rechnungen generiert", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commission-invoices"] });
    },
    onError: () => {
      toast({ title: "Fehler", description: "Rechnungen konnten nicht generiert werden", variant: "destructive" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/commission-invoices/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Status aktualisiert" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commission-invoices"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/commission-invoices/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Rechnung gelöscht" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commission-invoices"] });
    },
  });

  const filtered = invoices?.filter(inv => {
    if (filterStatus !== "alle" && inv.status !== filterStatus) return false;
    if (searchTerm && !inv.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) && !inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }) || [];

  const totalOpen = invoices?.filter(i => i.status === "offen" || i.status === "versendet").reduce((s, i) => s + i.commissionGross, 0) || 0;
  const totalPaid = invoices?.filter(i => i.status === "bezahlt").reduce((s, i) => s + i.commissionGross, 0) || 0;
  const totalAll = invoices?.reduce((s, i) => s + i.commissionGross, 0) || 0;

  const statusBadge = (status: string) => {
    switch (status) {
      case "entwurf":
        return <Badge variant="outline" className="text-gray-500 border-gray-300"><Clock className="w-3 h-3 mr-1" />Entwurf</Badge>;
      case "offen":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><AlertCircle className="w-3 h-3 mr-1" />Offen</Badge>;
      case "versendet":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Send className="w-3 h-3 mr-1" />Versendet</Badge>;
      case "bezahlt":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" />Bezahlt</Badge>;
      case "überfällig":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><AlertCircle className="w-3 h-3 mr-1" />Überfällig</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Receipt className="h-8 w-8 text-purple-600" />
            Provisionsrechnungen
          </h1>
          <p className="text-gray-500 mt-1">
            Monatliche Provisionsrechnungen an Partner – 11% Vermittlungsprovision + 19% MwSt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Rechnungen gesamt</p>
                  <p className="text-2xl font-bold">{invoices?.length || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-500 opacity-70" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Provisionen gesamt</p>
                  <p className="text-2xl font-bold">{cents(totalAll)} €</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500 opacity-70" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Offen / Versendet</p>
                  <p className="text-2xl font-bold text-amber-600">{cents(totalOpen)} €</p>
                </div>
                <AlertCircle className="h-8 w-8 text-amber-500 opacity-70" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Bezahlt</p>
                  <p className="text-2xl font-bold text-green-600">{cents(totalPaid)} €</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-70" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-purple-600" />
                  Rechnungen generieren
                </CardTitle>
                <CardDescription>
                  Provisionsrechnungen für einen bestimmten Monat automatisch erstellen
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select value={genMonth} onValueChange={setGenMonth}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((m, i) => (
                      <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={genYear} onValueChange={setGenYear}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {generateMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Receipt className="w-4 h-4 mr-2" />
                  )}
                  Generieren
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Rechnungsübersicht
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input
                    placeholder="Partner oder Nr. suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-[220px] pl-9"
                  />
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle">Alle Status</SelectItem>
                    <SelectItem value="entwurf">Entwurf</SelectItem>
                    <SelectItem value="offen">Offen</SelectItem>
                    <SelectItem value="versendet">Versendet</SelectItem>
                    <SelectItem value="bezahlt">Bezahlt</SelectItem>
                    <SelectItem value="überfällig">Überfällig</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-gray-400">Lade Rechnungen...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Keine Rechnungen gefunden</p>
                <p className="text-sm mt-1">Generiere Rechnungen für einen bestimmten Monat oben</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((inv) => (
                  <div key={inv.id} className="border rounded-lg overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                    >
                      <div className="flex items-center gap-4">
                        {expandedId === inv.id ? (
                          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{inv.invoiceNumber}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Building2 className="w-3 h-3" />
                            {inv.partnerName}
                            {inv.partnerCity && <span className="text-gray-400">· {inv.partnerCity}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-gray-400">Zeitraum</p>
                          <p className="font-medium text-sm">{monthNames[inv.periodMonth - 1]} {inv.periodYear}</p>
                        </div>
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-gray-400">Buchungen</p>
                          <p className="font-medium">{inv.bookingCount}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Netto</p>
                          <p className="font-medium">{cents(inv.commissionNet)} €</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Brutto</p>
                          <p className="font-bold text-purple-700">{cents(inv.commissionGross)} €</p>
                        </div>
                        {statusBadge(inv.status)}
                      </div>
                    </div>

                    {expandedId === inv.id && (
                      <div className="border-t bg-gray-50 p-5">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
                          <div className="bg-white border rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase">Partner-Umsatz (Brutto)</p>
                            <p className="text-lg font-bold">{cents(inv.grossRevenue)} €</p>
                          </div>
                          <div className="bg-white border rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase">Provision ({inv.commissionRate}%)</p>
                            <p className="text-lg font-bold">{cents(inv.commissionNet)} €</p>
                          </div>
                          <div className="bg-white border rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase">MwSt. (19%)</p>
                            <p className="text-lg font-bold">{cents(inv.commissionTax)} €</p>
                          </div>
                          <div className="bg-white border border-purple-200 rounded-lg p-3 bg-purple-50">
                            <p className="text-xs text-purple-600 uppercase font-medium">Rechnungsbetrag</p>
                            <p className="text-lg font-bold text-purple-700">{cents(inv.commissionGross)} €</p>
                          </div>
                          <div className="bg-white border rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase">Fällig am</p>
                            <p className="text-lg font-bold">
                              {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("de-DE") : "-"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {inv.status !== "bezahlt" && (
                            <>
                              {inv.status === "offen" || inv.status === "entwurf" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                  onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: inv.id, status: "versendet" }); }}
                                >
                                  <Send className="w-4 h-4 mr-1" /> Als versendet markieren
                                </Button>
                              ) : null}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: inv.id, status: "bezahlt" }); }}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" /> Als bezahlt markieren
                              </Button>
                            </>
                          )}
                          {inv.status === "bezahlt" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-amber-600 border-amber-200 hover:bg-amber-50"
                              onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: inv.id, status: "offen" }); }}
                            >
                              <AlertCircle className="w-4 h-4 mr-1" /> Zurück auf offen
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(inv.id); }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Löschen
                          </Button>
                        </div>

                        {inv.paidDate && (
                          <p className="text-xs text-green-600 mt-3">
                            Bezahlt am: {new Date(inv.paidDate).toLocaleDateString("de-DE")}
                          </p>
                        )}
                        {inv.sentAt && (
                          <p className="text-xs text-blue-600 mt-1">
                            Versendet am: {new Date(inv.sentAt).toLocaleDateString("de-DE")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Euro className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Abrechnungsmodell: Provisionsrechnung</h3>
                <p className="text-sm text-gray-600 mt-1">
                  FreizeitEngel agiert als Vermittler. Die Zahlung erfolgt direkt zwischen Kunde und Partner.
                  FreizeitEngel stellt dem Partner monatlich eine Provisionsrechnung über 11% des vermittelten Umsatzes zzgl. 19% MwSt.
                  Kein ZAG-Risiko, keine Zahlungsdienstleister-Lizenz erforderlich.
                </p>
                <div className="flex items-center gap-6 mt-3 text-sm">
                  <span className="flex items-center gap-1 text-purple-700">
                    <Receipt className="w-4 h-4" /> Provision: 11%
                  </span>
                  <span className="flex items-center gap-1 text-purple-700">
                    <Euro className="w-4 h-4" /> MwSt.: 19%
                  </span>
                  <span className="flex items-center gap-1 text-purple-700">
                    <Calendar className="w-4 h-4" /> Zahlungsziel: 15 Tage
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}