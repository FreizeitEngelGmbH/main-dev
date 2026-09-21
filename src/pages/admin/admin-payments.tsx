import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminLayout from "./admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  TrendingUp,
  Users,
  ArrowDownToLine,
  CreditCard,
  Building2,
  RefreshCw,
  Settings,
  Sparkles,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Banknote,
  Search,
  Eye,
  RotateCcw,
  Send,
  ShieldCheck,
  Info,
  FileCheck,
  Scale,
  Lock,
  ExternalLink,
  CheckCircle2,
  Circle,
} from "lucide-react";
import type { PaymentAccount, PaymentTransaction, PaymentPayout } from "@shared/schema";

const CI_COLOR = "#36C9C2";
const CI_DARK = "#2DB5AF";

function formatCurrency(amount: number): string {
  return amount.toFixed(2).replace('.', ',') + '€';
}

function formatDate(date: string | Date | null): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: string; icon: any }> = {
    completed: { label: "Abgeschlossen", variant: "bg-green-100 text-green-800", icon: CheckCircle },
    pending: { label: "Ausstehend", variant: "bg-yellow-100 text-yellow-800", icon: Clock },
    failed: { label: "Fehlgeschlagen", variant: "bg-red-100 text-red-800", icon: XCircle },
    active: { label: "Aktiv", variant: "bg-green-100 text-green-800", icon: CheckCircle },
    pending_verification: { label: "Verifizierung", variant: "bg-blue-100 text-blue-800", icon: AlertCircle },
    processing: { label: "Verarbeitung", variant: "bg-blue-100 text-blue-800", icon: RefreshCw },
    refunded: { label: "Erstattet", variant: "bg-purple-100 text-purple-800", icon: RotateCcw },
  };
  const config = map[status] || { label: status, variant: "bg-gray-100 text-gray-800", icon: Clock };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.variant}`}>
      <Icon className="h-3 w-3" />{config.label}
    </span>
  );
}

export default function AdminPayments() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCommissionDialog, setShowCommissionDialog] = useState(false);
  const [commissionInput, setCommissionInput] = useState("");
  const [showFeeDialog, setShowFeeDialog] = useState(false);
  const [feeInput, setFeeInput] = useState("");
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState<PaymentTransaction | null>(null);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutPartnerId, setPayoutPartnerId] = useState<number | null>(null);
  const [payoutAmount, setPayoutAmount] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/admin/payments/stats"],
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<PaymentAccount[]>({
    queryKey: ["/api/admin/payments/accounts"],
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery<PaymentTransaction[]>({
    queryKey: ["/api/admin/payments/transactions"],
  });

  const { data: payouts = [], isLoading: payoutsLoading } = useQuery<PaymentPayout[]>({
    queryKey: ["/api/admin/payments/payouts"],
  });

  const seedMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/payments/seed"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/payouts"] });
      toast({ title: "Demo-Daten erstellt" });
    },
  });

  const commissionMutation = useMutation({
    mutationFn: (rate: number) => apiRequest("POST", "/api/admin/payments/settings/commission", { rate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/settings"] });
      setShowCommissionDialog(false);
      toast({ title: "Provisionssatz aktualisiert" });
    },
  });

  const feeMutation = useMutation({
    mutationFn: (fee: number) => apiRequest("POST", "/api/admin/payments/settings/online-fee", { fee }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/settings"] });
      setShowFeeDialog(false);
      toast({ title: "Online-Zahlungsgebühr aktualisiert" });
    },
  });

  const refundMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/admin/payments/transactions/${id}/refund`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/accounts"] });
      setShowTransactionDetail(null);
      toast({ title: "Erstattung verarbeitet" });
    },
  });

  const payoutMutation = useMutation({
    mutationFn: (data: { partnerId: number; amount?: number }) => apiRequest("POST", "/api/admin/payments/payouts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/payouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/stats"] });
      setShowPayoutDialog(false);
      toast({ title: "Auszahlung erstellt" });
    },
  });

  const completePayoutMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/admin/payments/payouts/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/payouts"] });
      toast({ title: "Auszahlung abgeschlossen" });
    },
  });

  const filteredTransactions = searchQuery.trim()
    ? transactions.filter(t =>
        t.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transactions;

  const filteredAccounts = searchQuery.trim() && activeTab === "accounts"
    ? accounts.filter(a =>
        a.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : accounts;

  const isLoading = statsLoading || accountsLoading || txLoading || payoutsLoading;

  const getPartnerName = (partnerId: number) => {
    const account = accounts.find(a => a.partnerId === partnerId);
    return account?.companyName || `Partner #${partnerId}`;
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="rounded-xl p-8 text-white" style={{ background: `linear-gradient(135deg, ${CI_COLOR}, ${CI_DARK})` }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Payment Service Provider</h1>
              <p style={{ color: "#d0f5f3" }}>Mehrmandantenfähiges Zahlungs- & Transaktionsmanagement</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="bg-white/20 text-white hover:bg-white/30 border-0"
                onClick={() => {
                  setCommissionInput(stats?.commissionRate?.toString() || "0");
                  setShowCommissionDialog(true);
                }}
              >
                <Percent className="h-4 w-4 mr-2" />
                Provision: {stats?.commissionRate ?? "x"}%
              </Button>
              <Button
                variant="secondary"
                className="bg-white/20 text-white hover:bg-white/30 border-0"
                onClick={() => {
                  setFeeInput(stats?.onlinePaymentFee?.toString() || "0.50");
                  setShowFeeDialog(true);
                }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Online-Gebühr: {stats?.onlinePaymentFee ?? "0.50"}€
              </Button>
              {accounts.length === 0 && (
                <Button
                  variant="secondary"
                  className="bg-white/20 text-white hover:bg-white/30 border-0"
                  onClick={() => seedMutation.mutate()}
                  disabled={seedMutation.isPending}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {seedMutation.isPending ? "Wird geladen..." : "Demo-Daten"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4" style={{ color: CI_COLOR }} />
                    <span className="text-xs text-muted-foreground">Gesamtumsatz</span>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4" style={{ color: CI_COLOR }} />
                    <span className="text-xs text-muted-foreground">Plattform-Gebühren</span>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(stats?.totalPlatformFees || 0)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowDownToLine className="h-4 w-4" style={{ color: CI_COLOR }} />
                    <span className="text-xs text-muted-foreground">Partner-Anteile</span>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(stats?.totalPartnerPayments || 0)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4" style={{ color: CI_COLOR }} />
                    <span className="text-xs text-muted-foreground">Ausstehend</span>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(stats?.totalPendingPayouts || 0)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="h-4 w-4" style={{ color: CI_COLOR }} />
                    <span className="text-xs text-muted-foreground">Transaktionen</span>
                  </div>
                  <p className="text-lg font-bold">{stats?.transactionCount || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4" style={{ color: CI_COLOR }} />
                    <span className="text-xs text-muted-foreground">Aktive Konten</span>
                  </div>
                  <p className="text-lg font-bold">{stats?.activeAccounts || 0}</p>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="overview">Übersicht</TabsTrigger>
                  <TabsTrigger value="transactions">Transaktionen</TabsTrigger>
                  <TabsTrigger value="accounts">Partner-Konten</TabsTrigger>
                  <TabsTrigger value="payouts">Auszahlungen</TabsTrigger>
                  <TabsTrigger value="compliance" className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Compliance
                  </TabsTrigger>
                </TabsList>
                {(activeTab === "transactions" || activeTab === "accounts") && (
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Suchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="h-4 w-4" style={{ color: CI_COLOR }} />
                        Letzte Transaktionen
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {transactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Keine Transaktionen vorhanden</p>
                      ) : (
                        <div className="space-y-2">
                          {transactions.slice(0, 8).map(tx => (
                            <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div className="flex items-center gap-3">
                                {tx.type === "payment" ? (
                                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                                )}
                                <div>
                                  <p className="text-sm font-medium">{tx.customerName || tx.customerEmail || tx.transactionRef}</p>
                                  <p className="text-xs text-muted-foreground">{getPartnerName(tx.partnerId)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-semibold ${tx.type === "refund" ? "text-red-600" : "text-green-600"}`}>
                                  {tx.type === "refund" ? "-" : "+"}{formatCurrency(Math.abs(tx.grossAmount))}
                                </p>
                                <StatusBadge status={tx.status} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4" style={{ color: CI_COLOR }} />
                        Partner-Konten
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {accounts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Keine Partner-Konten vorhanden</p>
                      ) : (
                        <div className="space-y-2">
                          {accounts.slice(0, 8).map(acc => (
                            <div key={acc.id} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div>
                                <p className="text-sm font-medium">{acc.companyName}</p>
                                <p className="text-xs text-muted-foreground">{acc.email}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold">{formatCurrency(acc.pendingBalance || 0)}</p>
                                <StatusBadge status={acc.accountStatus} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Settings className="h-4 w-4" style={{ color: CI_COLOR }} />
                      Zahlungsaufteilung (Split-Modell)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <DollarSign className="h-8 w-8 mx-auto mb-2" style={{ color: CI_COLOR }} />
                        <p className="text-2xl font-bold">100%</p>
                        <p className="text-sm text-muted-foreground">Kundenzahlung (brutto)</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <Percent className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                        <p className="text-2xl font-bold">{stats?.commissionRate ?? "x"}%</p>
                        <p className="text-sm text-muted-foreground">Provision (auf Brutto)</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setCommissionInput(stats?.commissionRate?.toString() || "0");
                            setShowCommissionDialog(true);
                          }}
                        >
                          Ändern
                        </Button>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <CreditCard className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                        <p className="text-2xl font-bold">{stats?.onlinePaymentFee ?? "0.50"}€</p>
                        <p className="text-sm text-muted-foreground">Online-Zahlungsgebühr</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setFeeInput(stats?.onlinePaymentFee?.toString() || "0.50");
                            setShowFeeDialog(true);
                          }}
                        >
                          Ändern
                        </Button>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <Banknote className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="text-2xl font-bold">Rest</p>
                        <p className="text-sm text-muted-foreground">Partner-Anteil</p>
                        <p className="text-xs text-muted-foreground mt-1">Wöchentliche Auszahlung</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-sm text-blue-800 font-medium mb-1">Beispielrechnung (20,00 € Buchung brutto):</p>
                      <div className="grid grid-cols-4 gap-2 text-xs text-blue-700">
                        <span>Buchung: 20,00 €</span>
                        <span>Provision: {formatCurrency(20 * (stats?.commissionRate ?? 10) / 100)}</span>
                        <span>Online-Gebühr: {formatCurrency(stats?.onlinePaymentFee ?? 0.50)}</span>
                        <span className="font-bold">Partner: {formatCurrency(20 - 20 * (stats?.commissionRate ?? 10) / 100 - (stats?.onlinePaymentFee ?? 0.50))}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* BaFin Compliance Info Banner */}
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-amber-100">
                        <ShieldCheck className="h-5 w-5 text-amber-700" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 flex items-center gap-2">
                          BaFin-Regulierung beachten
                          <Badge className="bg-amber-200 text-amber-800 text-xs">Pflicht</Badge>
                        </h4>
                        <p className="text-sm text-amber-800 mt-1">
                          Alle Zahlungen müssen über Stripe Connect abgewickelt werden (lizenzierter Zahlungsdienstleister).
                          Manuelle Geldtransfers an Partner ohne Stripe sind gemäß ZAG (Zahlungsdiensteaufsichtsgesetz) nicht zulässig
                          und können zu BaFin-Sanktionen führen.
                        </p>
                        <Button variant="link" className="text-amber-700 p-0 h-auto mt-1 text-xs" onClick={() => setActiveTab("compliance")}>
                          Compliance-Details anzeigen →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4">
                <Card>
                  <CardContent className="pt-4">
                    {filteredTransactions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Keine Transaktionen gefunden</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Referenz</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Typ</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Kunde</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Partner</th>
                              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Brutto</th>
                              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Gebühr</th>
                              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Partner</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Datum</th>
                              <th className="text-right py-2 px-2"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTransactions.map(tx => (
                              <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="py-2 px-2 font-mono text-xs">{tx.transactionRef}</td>
                                <td className="py-2 px-2">
                                  <Badge variant={tx.type === "payment" ? "default" : "destructive"} className="text-xs">
                                    {tx.type === "payment" ? "Zahlung" : "Erstattung"}
                                  </Badge>
                                </td>
                                <td className="py-2 px-2">{tx.customerName || tx.customerEmail || "-"}</td>
                                <td className="py-2 px-2">{getPartnerName(tx.partnerId)}</td>
                                <td className="py-2 px-2 text-right font-medium">{formatCurrency(tx.grossAmount)}</td>
                                <td className="py-2 px-2 text-right text-orange-600">{formatCurrency(tx.platformFee)}</td>
                                <td className="py-2 px-2 text-right text-green-600">{formatCurrency(tx.partnerAmount)}</td>
                                <td className="py-2 px-2"><StatusBadge status={tx.status} /></td>
                                <td className="py-2 px-2 text-xs text-muted-foreground">{formatDate(tx.createdAt)}</td>
                                <td className="py-2 px-2 text-right">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowTransactionDetail(tx)}>
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="accounts" className="space-y-4">
                <Card>
                  <CardContent className="pt-4">
                    {filteredAccounts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Keine Partner-Konten gefunden</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Unternehmen</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">E-Mail</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Bank</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Provision</th>
                              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Verdient</th>
                              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Ausstehend</th>
                              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Ausgezahlt</th>
                              <th className="text-right py-2 px-2"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAccounts.map(acc => (
                              <tr key={acc.id} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="py-2 px-2 font-medium">{acc.companyName}</td>
                                <td className="py-2 px-2 text-muted-foreground">{acc.email}</td>
                                <td className="py-2 px-2">
                                  {acc.bankName ? (
                                    <span className="text-xs">{acc.bankName} ****{acc.bankAccountLast4}</span>
                                  ) : "-"}
                                </td>
                                <td className="py-2 px-2"><StatusBadge status={acc.accountStatus} /></td>
                                <td className="py-2 px-2 text-right">
                                  {acc.commissionRate !== null && acc.commissionRate !== undefined ? `${acc.commissionRate}%` : "Standard"}
                                </td>
                                <td className="py-2 px-2 text-right font-medium text-green-600">{formatCurrency(acc.totalEarnings || 0)}</td>
                                <td className="py-2 px-2 text-right font-medium text-orange-600">{formatCurrency(acc.pendingBalance || 0)}</td>
                                <td className="py-2 px-2 text-right text-muted-foreground">{formatCurrency(acc.totalPayouts || 0)}</td>
                                <td className="py-2 px-2 text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    disabled={(acc.pendingBalance || 0) <= 0}
                                    onClick={() => {
                                      setPayoutPartnerId(acc.partnerId);
                                      setPayoutAmount((acc.pendingBalance || 0).toString());
                                      setShowPayoutDialog(true);
                                    }}
                                  >
                                    <Send className="h-3 w-3 mr-1" />Auszahlen
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payouts" className="space-y-4">
                <Card>
                  <CardContent className="pt-4">
                    {payouts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Banknote className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Keine Auszahlungen vorhanden</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Referenz</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Partner</th>
                              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Betrag</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Bank</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Erstellt</th>
                              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Verarbeitet</th>
                              <th className="text-right py-2 px-2"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {payouts.map(payout => (
                              <tr key={payout.id} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="py-2 px-2 font-mono text-xs">{payout.payoutRef}</td>
                                <td className="py-2 px-2">{getPartnerName(payout.partnerId)}</td>
                                <td className="py-2 px-2 text-right font-medium">{formatCurrency(payout.amount)}</td>
                                <td className="py-2 px-2 text-xs">{payout.bankAccountLast4 ? `****${payout.bankAccountLast4}` : "-"}</td>
                                <td className="py-2 px-2"><StatusBadge status={payout.status} /></td>
                                <td className="py-2 px-2 text-xs text-muted-foreground">{formatDate(payout.createdAt)}</td>
                                <td className="py-2 px-2 text-xs text-muted-foreground">{formatDate(payout.processedAt)}</td>
                                <td className="py-2 px-2 text-right">
                                  {payout.status === "pending" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs"
                                      onClick={() => completePayoutMutation.mutate(payout.id)}
                                      disabled={completePayoutMutation.isPending}
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />Abschließen
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* COMPLIANCE TAB */}
              <TabsContent value="compliance" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Stripe Connect Status */}
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lock className="h-4 w-4" style={{ color: CI_COLOR }} />
                        Stripe Connect Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-green-800">Integration aktiv</span>
                        </div>
                        <p className="text-xs text-green-700">
                          Stripe ist als lizenzierter E-Geld-Agent der BaFin registriert und übernimmt die
                          regulierte Zahlungsabwicklung.
                        </p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-muted-foreground">Zahlungsdienstleister</span>
                          <span className="font-medium">Stripe Payments Europe Ltd.</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-muted-foreground">Lizenz</span>
                          <span className="font-medium">EU E-Geld-Lizenz (Irland)</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-muted-foreground">Modell</span>
                          <span className="font-medium">Stripe Connect (Express)</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-muted-foreground">BaFin-Pflicht für FE</span>
                          <Badge className="bg-green-100 text-green-800">Entfällt</Badge>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-muted-foreground">Partner-Konten</span>
                          <span className="font-medium">{accounts.filter(a => a.stripeAccountId).length} / {accounts.length} verbunden</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* BaFin Regelwerk */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Scale className="h-4 w-4" style={{ color: CI_COLOR }} />
                        BaFin-Regulierung & ZAG-Compliance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="font-semibold text-blue-900 text-sm">Warum ist das wichtig?</h5>
                            <p className="text-xs text-blue-800 mt-1">
                              Das Zahlungsdiensteaufsichtsgesetz (ZAG) regelt, wer in Deutschland Zahlungsdienste
                              erbringen darf. Wer ohne Lizenz Gelder entgegennimmt und weiterleitet, begeht eine
                              Ordnungswidrigkeit mit Bußgeldern bis zu <strong>5 Mio. Euro</strong>.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h5 className="font-semibold text-sm">Relevante Vorschriften</h5>
                        <div className="space-y-2">
                          {[
                            {
                              title: "§ 1 Abs. 1 Satz 2 Nr. 4 ZAG - Finanztransfergeschäft",
                              desc: "Das Weiterleiten von Geldern (Kundengelder → Partner) ist ein erlaubnispflichtiger Zahlungsdienst, sofern es nicht über einen lizenzierten Dienstleister abgewickelt wird.",
                            },
                            {
                              title: "§ 10 Abs. 1 ZAG - Erlaubnispflicht",
                              desc: "Wer Zahlungsdienste erbringen will, bedarf der schriftlichen Erlaubnis der BaFin. Eine Ausnahme besteht bei Nutzung lizenzierter Drittanbieter (Stripe Connect).",
                            },
                            {
                              title: "§ 2 Abs. 1 Nr. 12 ZAG - Ausnahme für technische Dienstleister",
                              desc: "Plattformen, die nur als technischer Vermittler auftreten und die Zahlungsabwicklung an lizenzierte Institute delegieren, sind von der Erlaubnispflicht ausgenommen.",
                            },
                            {
                              title: "PSD2 / EU 2015/2366 - Zahlungsdiensterichtlinie",
                              desc: "Europäische Richtlinie zur Regulierung von Zahlungsdiensten. Stripe Connect ist PSD2-konform und übernimmt die starke Kundenauthentifizierung (SCA).",
                            },
                            {
                              title: "§ 63 ZAG - Bußgeldvorschriften",
                              desc: "Bußgelder bis zu 5 Millionen Euro bei Verstößen gegen das ZAG, einschließlich unerlaubter Erbringung von Zahlungsdiensten.",
                            },
                          ].map((rule, i) => (
                            <div key={i} className="p-3 rounded-lg border bg-white">
                              <h6 className="text-sm font-medium text-gray-900">{rule.title}</h6>
                              <p className="text-xs text-muted-foreground mt-1">{rule.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Compliance Checklist */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileCheck className="h-4 w-4" style={{ color: CI_COLOR }} />
                      Compliance-Checkliste für FreizeitEngel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { check: true, text: "Stripe Connect als lizenzierter Zahlungsdienstleister integriert" },
                        { check: true, text: "Keine eigene Geldannahme – Zahlungen fließen direkt über Stripe" },
                        { check: true, text: "Automatische Provisionsaufteilung über Stripe Connect (Split Payments)" },
                        { check: true, text: "Partner-Onboarding über Stripe Express (KYC/AML durch Stripe)" },
                        { check: true, text: "Keine Wallet-/Guthaben-Funktion für Endkunden implementiert" },
                        { check: true, text: "Transaktions-Audit-Trail mit Referenznummern vorhanden" },
                        { check: true, text: "PSD2/SCA-konforme Zahlungsauthentifizierung (durch Stripe)" },
                        { check: true, text: "Rückerstattungen laufen über Stripe (kein manueller Geldtransfer)" },
                        { check: false, text: "Rechtliche Prüfung durch Fachanwalt für Finanzaufsichtsrecht (empfohlen vor Go-Live)" },
                        { check: false, text: "AGB mit Hinweis auf Zahlungsabwicklung durch Stripe aktualisiert" },
                        { check: false, text: "Datenschutzerklärung um Stripe-Datenverarbeitung ergänzt" },
                        { check: false, text: "Impressum mit Hinweis auf Zahlungsdienstleister ergänzt" },
                      ].map((item, i) => (
                        <div key={i} className={`flex items-start gap-2 p-3 rounded-lg ${item.check ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
                          {item.check ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${item.check ? "text-green-800" : "text-amber-800"}`}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Dos and Don'ts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-base text-red-700 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Verboten (BaFin-Verstoß)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {[
                          "Kundengelder auf eigenes FreizeitEngel-Konto sammeln",
                          "Manuelle Überweisungen an Partner außerhalb von Stripe",
                          "Wallet-/Guthaben-System für Endkunden anbieten",
                          "Zahlungen über eigene Bankverbindung abwickeln",
                          "Gelder zwischenzeitlich halten oder verzögert weiterleiten",
                          "Partner in bar oder per manueller Überweisung auszahlen",
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-red-700">
                            <XCircle className="h-3 w-3 mt-1 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="text-base text-green-700 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Erlaubt & Empfohlen
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {[
                          "Alle Zahlungen über Stripe Connect abwickeln",
                          "Provisionsaufteilung automatisch über Stripe Split Payments",
                          "Partner-Onboarding über Stripe Express (KYC durch Stripe)",
                          "Erstattungen über Stripe Refund API verarbeiten",
                          "Auszahlungen an Partner über Stripe Payouts auslösen",
                          "Transaktionsdaten für Buchhaltung/Reporting speichern",
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-green-700">
                            <CheckCircle className="h-3 w-3 mt-1 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendation */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Scale className="h-5 w-5 text-blue-700" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900">Empfehlung vor Go-Live</h4>
                        <p className="text-sm text-blue-800 mt-1">
                          Vor dem offiziellen Launch sollte ein Fachanwalt für Finanzaufsichtsrecht
                          das Zahlungsmodell prüfen (geschätzte Kosten: 500–1.500 €). So stellt ihr sicher,
                          dass das Stripe-Connect-Modell korrekt aufgesetzt ist und keine BaFin-Erlaubnis
                          erforderlich ist. Außerdem sollten AGB, Datenschutzerklärung und Impressum
                          entsprechend angepasst werden.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      <Dialog open={showCommissionDialog} onOpenChange={setShowCommissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provisionssatz ändern</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Provisionssatz (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={commissionInput}
                onChange={(e) => setCommissionInput(e.target.value)}
                placeholder="z.B. 10"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Gilt als Standard für alle Partner ohne individuelle Vereinbarung.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm">Beispiel: Bei einer Buchung von <strong>20,00 €</strong> (brutto)</p>
              <div className="flex justify-between mt-2 text-sm">
                <span>Provision ({commissionInput || "0"}%):</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(20 * (parseFloat(commissionInput) || 0) / 100)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Online-Zahlungsgebühr:</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(stats?.onlinePaymentFee ?? 0.50)}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-1 mt-1">
                <span className="font-medium">FreizeitEngel gesamt:</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(20 * (parseFloat(commissionInput) || 0) / 100 + (stats?.onlinePaymentFee ?? 0.50))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Partner erhält:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(20 - 20 * (parseFloat(commissionInput) || 0) / 100 - (stats?.onlinePaymentFee ?? 0.50))}
                </span>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => commissionMutation.mutate(parseFloat(commissionInput))}
              disabled={commissionMutation.isPending || !commissionInput}
            >
              Speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFeeDialog} onOpenChange={setShowFeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Online-Zahlungsgebühr ändern</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Gebühr pro Online-Buchung (€)</Label>
              <Input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={feeInput}
                onChange={(e) => setFeeInput(e.target.value)}
                placeholder="z.B. 0.50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Fester Betrag pro Online-Buchung zur Deckung der Zahlungsdienstleister-Kosten.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm">Beispiel: Bei einer Buchung von <strong>20,00 €</strong> (brutto)</p>
              <div className="flex justify-between mt-2 text-sm">
                <span>Provision ({stats?.commissionRate ?? 10}%):</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(20 * (stats?.commissionRate ?? 10) / 100)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Online-Zahlungsgebühr:</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(parseFloat(feeInput) || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-1 mt-1">
                <span className="font-medium">Partner erhält:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(20 - 20 * (stats?.commissionRate ?? 10) / 100 - (parseFloat(feeInput) || 0))}
                </span>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => feeMutation.mutate(parseFloat(feeInput))}
              disabled={feeMutation.isPending || !feeInput}
            >
              Speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showTransactionDetail} onOpenChange={() => setShowTransactionDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaktionsdetails</DialogTitle>
          </DialogHeader>
          {showTransactionDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Referenz:</span>
                  <p className="font-mono font-medium">{showTransactionDetail.transactionRef}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Typ:</span>
                  <p><Badge variant={showTransactionDetail.type === "payment" ? "default" : "destructive"}>
                    {showTransactionDetail.type === "payment" ? "Zahlung" : "Erstattung"}
                  </Badge></p>
                </div>
                <div>
                  <span className="text-muted-foreground">Kunde:</span>
                  <p className="font-medium">{showTransactionDetail.customerName || "-"}</p>
                  <p className="text-xs">{showTransactionDetail.customerEmail}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Partner:</span>
                  <p className="font-medium">{getPartnerName(showTransactionDetail.partnerId)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Zahlungsmethode:</span>
                  <p className="font-medium capitalize">{showTransactionDetail.paymentMethod || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p><StatusBadge status={showTransactionDetail.status} /></p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bruttobetrag:</span>
                  <span className="font-bold">{formatCurrency(showTransactionDetail.grossAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Provision ({showTransactionDetail.commissionRate}%):</span>
                  <span className="text-orange-600 font-medium">{formatCurrency(showTransactionDetail.platformFee)}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span>Partner-Anteil:</span>
                  <span className="text-green-600 font-bold">{formatCurrency(showTransactionDetail.partnerAmount)}</span>
                </div>
                {showTransactionDetail.refundedAmount ? (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Erstattet:</span>
                    <span className="font-medium">{formatCurrency(showTransactionDetail.refundedAmount)}</span>
                  </div>
                ) : null}
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Erstellt: {formatDate(showTransactionDetail.createdAt)}</p>
                {showTransactionDetail.paidAt && <p>Bezahlt: {formatDate(showTransactionDetail.paidAt)}</p>}
              </div>
              {showTransactionDetail.type === "payment" && showTransactionDetail.status === "completed" && !showTransactionDetail.refundedAmount && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    if (confirm("Transaktion wirklich erstatten?")) {
                      refundMutation.mutate(showTransactionDetail.id);
                    }
                  }}
                  disabled={refundMutation.isPending}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />Vollständige Erstattung
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auszahlung erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Partner</Label>
              <p className="text-sm font-medium">{payoutPartnerId ? getPartnerName(payoutPartnerId) : "-"}</p>
            </div>
            {payoutPartnerId && !accounts.find(a => a.partnerId === payoutPartnerId)?.stripeAccountId && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Stripe-Konto fehlt</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Dieser Partner hat noch kein Stripe Connect Konto. Gemäß BaFin/ZAG-Regulierung
                      müssen alle Auszahlungen über Stripe Connect erfolgen. Bitte den Partner zuerst
                      über Stripe Express onboarden.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <Label>Betrag (€)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (payoutPartnerId) {
                  payoutMutation.mutate({
                    partnerId: payoutPartnerId,
                    amount: parseFloat(payoutAmount) || undefined,
                  });
                }
              }}
              disabled={payoutMutation.isPending || !payoutPartnerId || (payoutPartnerId != null && !accounts.find(a => a.partnerId === payoutPartnerId)?.stripeAccountId)}
            >
              <Send className="h-4 w-4 mr-2" />Auszahlung erstellen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
