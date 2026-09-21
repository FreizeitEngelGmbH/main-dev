import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "./admin-layout";
import {
  Settings, Wifi, WifiOff, Package, RefreshCw,
  CheckCircle, XCircle, AlertCircle, Loader2,
  Building2, ShieldCheck, Globe, Key, CalendarCheck
} from "lucide-react";

interface PlanyoPartner {
  partnerId: number;
  companyName: string;
  city: string;
  environment: string;
  connectionStatus: string;
  resourceCount: number;
  isLive: boolean;
}

export default function AdminPlanyo() {
  const { toast } = useToast();
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configForm, setConfigForm] = useState({
    partnerId: 0,
    apiKey: "",
    hashKey: "",
    siteId: "",
    environment: "production",
  });

  const { data: allPartners } = useQuery<any[]>({
    queryKey: ["/api/partners"],
  });

  const { data: planyoOverview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery<{ partners: PlanyoPartner[]; total: number }>({
    queryKey: ["/api/admin/planyo/overview"],
    queryFn: () => fetch("/api/admin/planyo/overview", { credentials: "include" }).then(r => r.json()),
    refetchInterval: 60000,
  });

  const { data: selectedResources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["/api/admin/partners", selectedPartnerId, "planyo/resources"],
    queryFn: () => fetch(`/api/admin/partners/${selectedPartnerId}/planyo/resources`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedPartnerId,
  });

  const configureMutation = useMutation({
    mutationFn: async (data: typeof configForm) => {
      const res = await apiRequest("POST", `/api/admin/partners/${data.partnerId}/planyo/configure`, {
        apiKey: data.apiKey,
        hashKey: data.hashKey,
        siteId: data.siteId,
        environment: data.environment,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Gespeichert", description: "Planyo-Konfiguration wurde gespeichert." });
      setConfigDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/planyo/overview"] });
    },
    onError: (error: any) => {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (partnerId: number) => {
      const res = await apiRequest("POST", `/api/admin/partners/${partnerId}/planyo/test`);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Verbunden", description: "Planyo-Verbindung erfolgreich." });
      } else {
        toast({ title: "Fehler", description: data.error || "Verbindung fehlgeschlagen.", variant: "destructive" });
      }
    },
    onError: (error: any) => {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    },
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case "connected": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error": return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <WifiOff className="h-5 w-5 text-gray-400" />;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "connected": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Verbunden</Badge>;
      case "error": return <Badge variant="destructive">Fehler</Badge>;
      default: return <Badge variant="secondary">Nicht konfiguriert</Badge>;
    }
  };

  const unconfiguredPartners = allPartners?.filter(
    (p: any) => p.bookingSystem !== "planyo" || !p.planyoApiKey
  ) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CalendarCheck className="h-6 w-6 text-teal-600" />
              Planyo Integration
            </h1>
            <p className="text-muted-foreground mt-1">
              Weg B — Kalender-Sync: Verfügbarkeitsprüfung und Reservierungen über Planyo. Buchung und Zahlung laufen über FreizeitEngel + Stripe Connect.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetchOverview()}>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Aktualisieren
            </Button>
            <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
              <Button size="sm" onClick={() => setConfigDialogOpen(true)}>
                <Settings className="h-4 w-4 mr-1.5" />
                Partner konfigurieren
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Planyo-Verbindung konfigurieren</DialogTitle>
                  <DialogDescription>API-Credentials für einen Partner hinterlegen.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Partner auswählen</Label>
                    <Select
                      value={configForm.partnerId ? configForm.partnerId.toString() : ""}
                      onValueChange={(v) => setConfigForm({ ...configForm, partnerId: parseInt(v) })}
                    >
                      <SelectTrigger><SelectValue placeholder="Partner wählen..." /></SelectTrigger>
                      <SelectContent>
                        {unconfiguredPartners.map((p: any) => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.companyName} ({p.city})</SelectItem>
                        ))}
                        {planyoOverview?.partners?.map((p) => (
                          <SelectItem key={p.partnerId} value={p.partnerId.toString()}>{p.companyName} ({p.city}) - Aktualisieren</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>API Key</Label>
                    <Input
                      value={configForm.apiKey}
                      onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                      placeholder="Planyo API Key"
                    />
                  </div>
                  <div>
                    <Label>Hash Key (optional, empfohlen)</Label>
                    <Input
                      type="password"
                      value={configForm.hashKey}
                      onChange={(e) => setConfigForm({ ...configForm, hashKey: e.target.value })}
                      placeholder="MD5 Hash Key für Extrasicherheit"
                    />
                  </div>
                  <div>
                    <Label>Site ID</Label>
                    <Input
                      value={configForm.siteId}
                      onChange={(e) => setConfigForm({ ...configForm, siteId: e.target.value })}
                      placeholder="Planyo Site ID"
                    />
                  </div>
                  <div>
                    <Label>Umgebung</Label>
                    <Select
                      value={configForm.environment}
                      onValueChange={(v) => setConfigForm({ ...configForm, environment: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="test">Test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => configureMutation.mutate(configForm)}
                    disabled={configureMutation.isPending || !configForm.partnerId || !configForm.apiKey}
                  >
                    {configureMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Konfiguration speichern
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-teal-500" />
                <div>
                  <p className="text-2xl font-bold">{planyoOverview?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Planyo-Partner</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Wifi className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {planyoOverview?.partners?.filter(p => p.connectionStatus === "connected").length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Verbunden</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {planyoOverview?.partners?.reduce((sum, p) => sum + p.resourceCount, 0) || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Ressourcen gesamt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {planyoOverview?.partners?.filter(p => p.connectionStatus === "error").length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Fehler</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="partners" className="space-y-4">
          <TabsList>
            <TabsTrigger value="partners">Partner-Übersicht</TabsTrigger>
            <TabsTrigger value="resources">Ressourcen</TabsTrigger>
            <TabsTrigger value="info">API Info</TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="space-y-4">
            {overviewLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !planyoOverview?.partners?.length ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CalendarCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Keine Planyo-Partner konfiguriert</h3>
                  <p className="text-muted-foreground mb-4">Klicke auf &quot;Partner konfigurieren&quot;, um die erste Planyo-Verbindung einzurichten.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {planyoOverview.partners.map((partner) => (
                  <Card key={partner.partnerId}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-muted">
                            {statusIcon(partner.connectionStatus)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{partner.companyName}</h3>
                              {statusBadge(partner.connectionStatus)}
                              {partner.isLive && <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Live</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{partner.city}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {partner.environment === "test" ? "Test" : "Production"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {partner.resourceCount} Ressourcen
                              </span>
                              <span className="flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                Partner ID: {partner.partnerId}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testMutation.mutate(partner.partnerId)}
                            disabled={testMutation.isPending}
                          >
                            {testMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wifi className="h-3 w-3" />}
                            <span className="ml-1.5">Testen</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPartnerId(partner.partnerId)}
                          >
                            <Package className="h-3 w-3 mr-1.5" />
                            Ressourcen
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setConfigForm({
                                partnerId: partner.partnerId,
                                apiKey: "",
                                hashKey: "",
                                siteId: "",
                                environment: partner.environment || "production",
                              });
                              setConfigDialogOpen(true);
                            }}
                          >
                            <Settings className="h-3 w-3 mr-1.5" />
                            Bearbeiten
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            {!selectedPartnerId ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Partner auswählen</h3>
                  <p className="text-muted-foreground">Wähle einen Planyo-Partner in der Übersicht, um dessen Ressourcen zu sehen.</p>
                </CardContent>
              </Card>
            ) : resourcesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : selectedResources?.resources ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedResources.partnerName}</h3>
                    <p className="text-sm text-muted-foreground">{selectedResources.resources.length} Ressourcen gefunden</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPartnerId(null)}>
                    Zurück zur Übersicht
                  </Button>
                </div>
                <div className="grid gap-3">
                  {selectedResources.resources.map((resource: any, i: number) => (
                    <Card key={resource.id || resource.resource_id || i}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{resource.name || "Unbenannt"}</h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              {resource.id && <span>ID: {resource.id}</span>}
                              {resource.quantity && <span>Kapazität: {resource.quantity}</span>}
                              {resource.unit_name && <Badge variant="outline">{resource.unit_name}</Badge>}
                            </div>
                            {resource.description && (
                              <p className="text-xs text-muted-foreground mt-1 max-w-lg truncate">{resource.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {resource.published !== undefined && (
                              <Badge className={resource.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                {resource.published ? "Veröffentlicht" : "Entwurf"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Keine Ressourcen geladen</h3>
                  <p className="text-muted-foreground">Prüfe die API-Verbindung des Partners.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Planyo API Informationen</CardTitle>
                <CardDescription>Technische Details zur Planyo-Integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">API Endpunkt</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-muted rounded-lg">
                      <span className="font-mono">REST</span>
                      <span className="text-muted-foreground">https://www.planyo.com/rest/</span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Authentifizierung</h4>
                  <p className="text-sm text-muted-foreground">
                    API Key + optionaler Hash Key. Jeder Partner benötigt einen eigenen API Key von Planyo.
                    Mit aktiviertem Hash Key wird jeder Request mit MD5-Hash aus Hash Key + Timestamp + Methodenname gesichert.
                  </p>
                  <div className="mt-2 grid gap-1 text-xs font-mono bg-muted p-3 rounded-lg">
                    <span>Parameter: api_key → Planyo API Key</span>
                    <span>Parameter: hash_timestamp → Unix Timestamp (UTC)</span>
                    <span>Parameter: hash_key → MD5(hashKey + timestamp + method)</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Antwortformat</h4>
                  <p className="text-sm text-muted-foreground">
                    JSON. Erfolgreiche Antworten haben response_code = 0. Fehler: 1 = Auth, 3 = Input, 4 = Method Error, 5 = Rate Limit, 6 = Fatal.
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Integrations-Modell: Weg B (Kalender-Sync)</h4>
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200 mb-3">
                    <p className="text-sm text-green-800 font-medium">Planyo wird nur zur Verfügbarkeitsprüfung und Kalender-Synchronisation genutzt. Buchung und Zahlung laufen komplett über FreizeitEngel + Stripe Connect.</p>
                    <p className="text-xs text-green-600 mt-1">Vorteil: Keine Planyo-Transaktionsgebühren (PRO-COMM) für den Partner.</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">1</Badge>
                      <span>Ressourcen & Verfügbarkeit von Planyo abrufen (gecacht, 1x/Stunde)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">2</Badge>
                      <span>Verfügbarkeit prüfen via can_make_reservation (1 API Call)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">3</Badge>
                      <span>Kunde bezahlt über Stripe Connect (89% Partner / 11% FreizeitEngel)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">4</Badge>
                      <span>Reservation bei Planyo erstellen — Slot wird blockiert (1 API Call)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">5</Badge>
                      <span>E-Mail-Bestätigung + QR-Code an Kunden</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">~ 2 API Calls pro Buchung (can_make_reservation + make_reservation).</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Verfügbare Methoden (Auszug)</h4>
                  <div className="grid gap-1 text-xs">
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-mono">list_resources</span>
                      <span className="text-muted-foreground">Ressourcen eines Sites abrufen</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-mono">get_resource_info</span>
                      <span className="text-muted-foreground">Details einer Ressource</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-mono">can_make_reservation</span>
                      <span className="text-muted-foreground">Verfügbarkeit & Constraints prüfen</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-mono">is_resource_available</span>
                      <span className="text-muted-foreground">Reine Verfügbarkeitsprüfung</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-mono">get_rental_price</span>
                      <span className="text-muted-foreground">Preis für Zeitraum berechnen</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-mono">make_reservation</span>
                      <span className="text-muted-foreground">Reservierung erstellen (Sync)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-mono">do_reservation_action</span>
                      <span className="text-muted-foreground">Stornierung / Bestätigung</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-mono">get_resource_usage_for_month</span>
                      <span className="text-muted-foreground">Monatskalender-Auslastung</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-mono">list_reservations</span>
                      <span className="text-muted-foreground">Reservierungen auflisten</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
