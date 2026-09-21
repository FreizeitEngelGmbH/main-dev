import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "./admin-layout";
import {
  Settings, Wifi, Calendar, RefreshCw, Search,
  CheckCircle, XCircle, AlertCircle, Loader2, ExternalLink,
  ShieldCheck, Globe, Ticket, Package, BarChart3, Clock
} from "lucide-react";

interface PretixPartner {
  partnerId: number;
  companyName: string;
  city: string;
  environment: string;
  connectionStatus: string;
  itemCount: number;
  eventName: string | null;
  isLive: boolean;
}

export default function AdminPretix() {
  const { toast } = useToast();
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configForm, setConfigForm] = useState({
    partnerId: 0,
    apiToken: "",
    organizerSlug: "",
    eventSlug: "",
    environment: "production",
  });

  const { data: allPartners } = useQuery<any[]>({
    queryKey: ["/api/partners"],
  });

  const { data: pretixOverview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery<{ partners: PretixPartner[]; total: number }>({
    queryKey: ["/api/admin/pretix/overview"],
    queryFn: () => fetch("/api/admin/pretix/overview", { credentials: "include" }).then(r => r.json()),
    refetchInterval: 60000,
  });

  const { data: selectedItems, isLoading: itemsLoading } = useQuery<any>({
    queryKey: ["/api/admin/partners", selectedPartnerId, "pretix", "items"],
    queryFn: () => fetch(`/api/admin/partners/${selectedPartnerId}/pretix/items`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedPartnerId,
  });

  const { data: selectedQuotas, isLoading: quotasLoading } = useQuery<any>({
    queryKey: ["/api/admin/partners", selectedPartnerId, "pretix", "quotas"],
    queryFn: () => fetch(`/api/admin/partners/${selectedPartnerId}/pretix/quotas`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedPartnerId,
  });

  const { data: apiInfo } = useQuery<any>({
    queryKey: ["/api/admin/pretix/api-info"],
    queryFn: () => fetch("/api/admin/pretix/api-info", { credentials: "include" }).then(r => r.json()),
  });

  const configureMutation = useMutation({
    mutationFn: async (data: typeof configForm) => {
      const res = await apiRequest("POST", `/api/admin/partners/${data.partnerId}/pretix/configure`, {
        apiToken: data.apiToken,
        organizerSlug: data.organizerSlug,
        eventSlug: data.eventSlug,
        environment: data.environment,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Pretix konfiguriert", description: "Die API-Credentials wurden gespeichert." });
      setConfigDialogOpen(false);
      setConfigForm({ partnerId: 0, apiToken: "", organizerSlug: "", eventSlug: "", environment: "production" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pretix/overview"] });
    },
    onError: (err: any) => {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (partnerId: number) => {
      const res = await apiRequest("POST", `/api/admin/partners/${partnerId}/pretix/test`);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Verbindung erfolgreich", description: `Organizer: ${data.data?.organizer || "OK"}, Event: ${data.data?.event || "–"}` });
      } else {
        toast({ title: "Verbindung fehlgeschlagen", description: data.error, variant: "destructive" });
      }
    },
    onError: (err: any) => {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    },
  });

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "connected": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatPrice = (price: string | number, currency: string = "EUR") => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(num / 100);
  };

  const getLocalizedString = (obj: any): string => {
    if (!obj) return "–";
    if (typeof obj === "string") return obj;
    return obj.de || obj.en || Object.values(obj)[0] as string || "–";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Ticket className="h-8 w-8 text-blue-600" />
              Pretix Integration
            </h1>
            <p className="text-muted-foreground mt-1">
              REST API v1 – Ticketing & Event-Sync für Partner (Weg B)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetchOverview()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Aktualisieren
            </Button>
            <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Partner konfigurieren
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Pretix API konfigurieren</DialogTitle>
                  <DialogDescription>
                    API Token, Organizer Slug und Event Slug des Partners eingeben.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Partner auswählen</Label>
                    <Select
                      value={configForm.partnerId ? configForm.partnerId.toString() : ""}
                      onValueChange={(v) => setConfigForm(f => ({ ...f, partnerId: parseInt(v) }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Partner wählen..." /></SelectTrigger>
                      <SelectContent>
                        {allPartners?.filter((p: any) => p.approved).map((p: any) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.companyName} ({p.city})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>API Token</Label>
                    <Input
                      type="password"
                      placeholder="abcdef1234567890..."
                      value={configForm.apiToken}
                      onChange={(e) => setConfigForm(f => ({ ...f, apiToken: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Aus Pretix Backend → Team → API Tokens</p>
                  </div>
                  <div>
                    <Label>Organizer Slug</Label>
                    <Input
                      placeholder="mein-veranstalter"
                      value={configForm.organizerSlug}
                      onChange={(e) => setConfigForm(f => ({ ...f, organizerSlug: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">URL-Slug des Veranstalters (z.B. pretix.eu/control/organizer/<strong>slug</strong>)</p>
                  </div>
                  <div>
                    <Label>Event Slug</Label>
                    <Input
                      placeholder="mein-event"
                      value={configForm.eventSlug}
                      onChange={(e) => setConfigForm(f => ({ ...f, eventSlug: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">URL-Slug des Events (optional für Multi-Event Organizer)</p>
                  </div>
                  <div>
                    <Label>Umgebung</Label>
                    <Select
                      value={configForm.environment}
                      onValueChange={(v) => setConfigForm(f => ({ ...f, environment: v }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Production (pretix.eu)</SelectItem>
                        <SelectItem value="test">Self-hosted / Test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => configureMutation.mutate(configForm)}
                    disabled={!configForm.partnerId || !configForm.apiToken || !configForm.organizerSlug || configureMutation.isPending}
                  >
                    {configureMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Konfiguration speichern
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="items">Produkte / Items</TabsTrigger>
            <TabsTrigger value="quotas">Quotas & Verfügbarkeit</TabsTrigger>
            <TabsTrigger value="api-info">API Info</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Konfigurierte Partner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{pretixOverview?.total || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Verbunden</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {pretixOverview?.partners?.filter(p => p.connectionStatus === "connected").length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">API-Typ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">REST API v1</div>
                  <p className="text-xs text-muted-foreground">Token Authentication, JSON</p>
                </CardContent>
              </Card>
            </div>

            {overviewLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (pretixOverview?.partners?.length || 0) === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Keine Pretix-Partner konfiguriert</h3>
                  <p className="text-muted-foreground mb-4">
                    Klicke auf "Partner konfigurieren" um einen Partner mit der Pretix API zu verbinden.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pretixOverview?.partners?.map((p) => (
                  <Card key={p.partnerId} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StatusIcon status={p.connectionStatus} />
                          <div>
                            <h3 className="font-semibold">{p.companyName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {p.city} · {p.environment} {p.eventName ? `· ${p.eventName}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={p.connectionStatus === "connected" ? "default" : "destructive"}>
                            {p.connectionStatus === "connected" ? "Verbunden" : p.connectionStatus === "error" ? "Fehler" : "Nicht konfiguriert"}
                          </Badge>
                          <Badge variant="outline">
                            <Package className="h-3 w-3 mr-1" />
                            {p.itemCount} Produkte
                          </Badge>
                          <Badge variant={p.isLive ? "default" : "secondary"}>
                            {p.isLive ? "Live" : "Inaktiv"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testMutation.mutate(p.partnerId)}
                            disabled={testMutation.isPending}
                          >
                            {testMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPartnerId(p.partnerId)}
                          >
                            <Search className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produkte / Items
                </CardTitle>
                <CardDescription>
                  Wähle einen Partner um die Produkte aus der Pretix API abzurufen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Partner</Label>
                  <Select
                    value={selectedPartnerId?.toString() || ""}
                    onValueChange={(v) => setSelectedPartnerId(parseInt(v))}
                  >
                    <SelectTrigger><SelectValue placeholder="Partner wählen..." /></SelectTrigger>
                    <SelectContent>
                      {pretixOverview?.partners?.map((p) => (
                        <SelectItem key={p.partnerId} value={p.partnerId.toString()}>
                          {p.companyName} ({p.city})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {itemsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Produkte werden geladen...</span>
                  </div>
                ) : selectedItems?.items?.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {selectedItems.items.length} Produkte gefunden für {selectedItems.partnerName}
                    </p>
                    <div className="rounded-md border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="p-3 text-left font-medium">ID</th>
                            <th className="p-3 text-left font-medium">Produkt</th>
                            <th className="p-3 text-left font-medium">Kategorie</th>
                            <th className="p-3 text-right font-medium">Preis</th>
                            <th className="p-3 text-center font-medium">Variationen</th>
                            <th className="p-3 text-center font-medium">Aktiv</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedItems.items.map((item: any, i: number) => (
                            <tr key={item.id || i} className="border-t hover:bg-muted/30">
                              <td className="p-3 font-mono text-xs">{item.id}</td>
                              <td className="p-3 font-medium">{getLocalizedString(item.name)}</td>
                              <td className="p-3 text-muted-foreground">{item.category ? `#${item.category}` : "–"}</td>
                              <td className="p-3 text-right">{item.default_price ? formatPrice(item.default_price) : "–"}</td>
                              <td className="p-3 text-center">
                                <Badge variant="outline">{item.variations?.length || 0}</Badge>
                              </td>
                              <td className="p-3 text-center">
                                <Badge variant={item.active ? "default" : "secondary"}>
                                  {item.active ? "Ja" : "Nein"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : selectedPartnerId ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine Produkte gefunden oder Event nicht konfiguriert.
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Wähle einen Partner um Produkte anzuzeigen.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quotas & Verfügbarkeit
                </CardTitle>
                <CardDescription>
                  Kontingente und verfügbare Plätze der konfigurierten Events.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Partner</Label>
                  <Select
                    value={selectedPartnerId?.toString() || ""}
                    onValueChange={(v) => setSelectedPartnerId(parseInt(v))}
                  >
                    <SelectTrigger><SelectValue placeholder="Partner wählen..." /></SelectTrigger>
                    <SelectContent>
                      {pretixOverview?.partners?.map((p) => (
                        <SelectItem key={p.partnerId} value={p.partnerId.toString()}>
                          {p.companyName} ({p.city})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {quotasLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Quotas werden geladen...</span>
                  </div>
                ) : selectedQuotas?.quotas?.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {selectedQuotas.quotas.length} Quotas gefunden
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedQuotas.quotas.map((q: any, i: number) => (
                        <Card key={q.id || i}>
                          <CardContent className="py-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm">{q.name || `Quota #${q.id}`}</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {q.items?.length || 0} Produkte zugewiesen
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold">
                                  {q.available_number !== null ? q.available_number : "∞"}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  von {q.size || "∞"} verfügbar
                                </p>
                              </div>
                            </div>
                            {q.size && q.available_number !== null && (
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${q.available_number / q.size > 0.5 ? "bg-green-500" : q.available_number / q.size > 0.2 ? "bg-yellow-500" : "bg-red-500"}`}
                                  style={{ width: `${Math.min(100, (q.available_number / q.size) * 100)}%` }}
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : selectedPartnerId ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine Quotas gefunden oder Event nicht konfiguriert.
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Wähle einen Partner um Quotas anzuzeigen.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    API-Spezifikation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {apiInfo && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Typ</span>
                        <span className="font-medium">{apiInfo.type}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Base URL</span>
                        <span className="font-mono text-xs">{apiInfo.baseUrl}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Auth</span>
                        <span className="font-medium">{apiInfo.authMethod}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Format</span>
                        <span className="font-medium">{apiInfo.dataFormat}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Caching</span>
                        <span className="font-medium">{apiInfo.cacheStrategy}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Rate Limits</span>
                        <span className="font-medium text-right text-xs">{apiInfo.rateLimits}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Integrations-Modell
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300">Weg B – Kalender-Sync</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Pretix wird für Verfügbarkeitsprüfung (Quotas) und Produkt-Synchronisation verwendet.
                      Buchungen und Zahlungen laufen über FreizeitEngel + Stripe Connect.
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Events & Subevents abrufen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Produkte/Items mit Variationen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Quotas & Verfügbarkeit prüfen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Bestellungen einsehen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Check-in Listen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Webhook-Unterstützung</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Multi-Organizer & Mehrsprachig</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Unterstützte Funktionen</CardTitle>
                  <CardDescription>Die Pretix API bietet folgende Funktionen</CardDescription>
                </CardHeader>
                <CardContent>
                  {apiInfo?.features && (
                    <div className="flex flex-wrap gap-2">
                      {apiInfo.features.map((f: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-sm py-1">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Hilfreiche Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 flex-wrap">
                    <a href="https://docs.pretix.eu/dev/api/index.html" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        API Dokumentation
                      </Button>
                    </a>
                    <a href="https://docs.pretix.eu/dev/api/fundamentals.html" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Auth & Grundlagen
                      </Button>
                    </a>
                    <a href="https://docs.pretix.eu/dev/api/resources/items.html" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Items / Produkte
                      </Button>
                    </a>
                    <a href="https://docs.pretix.eu/dev/api/resources/quotas.html" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Quotas
                      </Button>
                    </a>
                    <a href="https://docs.pretix.eu/dev/api/resources/orders.html" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Orders / Bestellungen
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
