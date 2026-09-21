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
  Building2, ShieldCheck, Globe, Info, Key, Calendar
} from "lucide-react";

interface RegiondoPartner {
  partnerId: number;
  companyName: string;
  city: string;
  environment: string;
  connectionStatus: string;
  productCount: number;
  isLive: boolean;
}

export default function AdminRegiondo() {
  const { toast } = useToast();
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configForm, setConfigForm] = useState({
    partnerId: 0,
    apiKey: "",
    secretKey: "",
    supplierId: "",
    environment: "production",
  });

  const { data: allPartners } = useQuery<any[]>({
    queryKey: ["/api/partners"],
  });

  const { data: regiondoOverview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery<{ partners: RegiondoPartner[]; total: number }>({
    queryKey: ["/api/admin/regiondo/overview"],
    queryFn: () => fetch("/api/admin/regiondo/overview", { credentials: "include" }).then(r => r.json()),
    refetchInterval: 60000,
  });

  const { data: selectedProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/admin/partners", selectedPartnerId, "regiondo/products"],
    queryFn: () => fetch(`/api/admin/partners/${selectedPartnerId}/regiondo/products`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedPartnerId,
  });

  const configureMutation = useMutation({
    mutationFn: async (data: typeof configForm) => {
      const res = await apiRequest("POST", `/api/admin/partners/${data.partnerId}/regiondo/configure`, {
        apiKey: data.apiKey,
        secretKey: data.secretKey,
        supplierId: data.supplierId,
        environment: data.environment,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Gespeichert", description: "Regiondo-Konfiguration wurde gespeichert." });
      setConfigDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/regiondo/overview"] });
    },
    onError: (error: any) => {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (partnerId: number) => {
      const res = await apiRequest("POST", `/api/admin/partners/${partnerId}/regiondo/test`);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Verbunden", description: "Regiondo-Verbindung erfolgreich." });
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
    (p: any) => p.bookingSystem !== "regiondo" || !p.regiondoApiKey
  ) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              Regiondo Integration
            </h1>
            <p className="text-muted-foreground mt-1">
              Weg B — Kalender-Sync: Verfügbarkeitsprüfung und Slot-Blockierung über Regiondo. Buchung und Zahlung laufen über FreizeitEngel + Stripe Connect.
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
                  <DialogTitle>Regiondo-Verbindung konfigurieren</DialogTitle>
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
                        {regiondoOverview?.partners?.map((p) => (
                          <SelectItem key={p.partnerId} value={p.partnerId.toString()}>{p.companyName} ({p.city}) - Aktualisieren</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Public API Key</Label>
                    <Input
                      value={configForm.apiKey}
                      onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                      placeholder="Regiondo Public API Key"
                    />
                  </div>
                  <div>
                    <Label>Secret Key (HMAC)</Label>
                    <Input
                      type="password"
                      value={configForm.secretKey}
                      onChange={(e) => setConfigForm({ ...configForm, secretKey: e.target.value })}
                      placeholder="HMAC Secret Key"
                    />
                  </div>
                  <div>
                    <Label>Supplier ID (optional)</Label>
                    <Input
                      value={configForm.supplierId}
                      onChange={(e) => setConfigForm({ ...configForm, supplierId: e.target.value })}
                      placeholder="Regiondo Supplier ID"
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
                        <SelectItem value="sandbox">Sandbox</SelectItem>
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
                <Building2 className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{regiondoOverview?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Regiondo-Partner</p>
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
                    {regiondoOverview?.partners?.filter(p => p.connectionStatus === "connected").length || 0}
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
                    {regiondoOverview?.partners?.reduce((sum, p) => sum + p.productCount, 0) || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Produkte gesamt</p>
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
                    {regiondoOverview?.partners?.filter(p => p.connectionStatus === "error").length || 0}
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
            <TabsTrigger value="products">Produkte</TabsTrigger>
            <TabsTrigger value="info">API Info</TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="space-y-4">
            {overviewLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !regiondoOverview?.partners?.length ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Keine Regiondo-Partner konfiguriert</h3>
                  <p className="text-muted-foreground mb-4">Klicke auf &quot;Partner konfigurieren&quot;, um die erste Regiondo-Verbindung einzurichten.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {regiondoOverview.partners.map((partner) => (
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
                                {partner.environment === "sandbox" ? "Sandbox" : "Production"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {partner.productCount} Produkte
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
                            Produkte
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setConfigForm({
                                partnerId: partner.partnerId,
                                apiKey: "",
                                secretKey: "",
                                supplierId: "",
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

          <TabsContent value="products" className="space-y-4">
            {!selectedPartnerId ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Partner auswählen</h3>
                  <p className="text-muted-foreground">Wähle einen Regiondo-Partner in der Übersicht, um dessen Produkte zu sehen.</p>
                </CardContent>
              </Card>
            ) : productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : selectedProducts?.products ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedProducts.partnerName}</h3>
                    <p className="text-sm text-muted-foreground">{selectedProducts.products.length} Produkte gefunden</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPartnerId(null)}>
                    Zurück zur Übersicht
                  </Button>
                </div>
                <div className="grid gap-3">
                  {selectedProducts.products.map((product: any, i: number) => (
                    <Card key={product.product_id || product.entity_id || i}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{product.name || product.title || "Unbenannt"}</h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              {product.price && <span>{(parseFloat(product.price) || 0).toFixed(2).replace('.', ',')}€</span>}
                              {product.product_id && <span>ID: {product.product_id}</span>}
                              {product.status && <Badge variant="outline">{product.status}</Badge>}
                              {product.category_name && <Badge variant="secondary">{product.category_name}</Badge>}
                            </div>
                            {product.short_description && (
                              <p className="text-xs text-muted-foreground mt-1 max-w-lg truncate">{product.short_description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {product.has_timeslots && <Badge className="bg-blue-100 text-blue-700">Timeslots</Badge>}
                            {product.variations_count > 0 && (
                              <Badge variant="outline">{product.variations_count} Varianten</Badge>
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
                  <h3 className="font-semibold text-lg mb-2">Keine Produkte geladen</h3>
                  <p className="text-muted-foreground">Prüfe die API-Verbindung des Partners.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Regiondo API Informationen</CardTitle>
                <CardDescription>Technische Details zur Regiondo-Integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">API Endpunkte</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-muted rounded-lg">
                      <span className="font-mono">Production</span>
                      <span className="text-muted-foreground">https://api.regiondo.com/v1</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded-lg">
                      <span className="font-mono">Sandbox</span>
                      <span className="text-muted-foreground">https://sandbox-api.regiondo.com/v1</span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Authentifizierung</h4>
                  <p className="text-sm text-muted-foreground">
                    HMAC-SHA256 Signierung. Jeder Partner benötigt einen Public API Key + Secret Key von Regiondo. 
                    Jeder Request wird mit Timestamp + HMAC-Signatur versehen. Im Sandbox-Modus reicht der Public API Key allein.
                  </p>
                  <div className="mt-2 grid gap-1 text-xs font-mono bg-muted p-3 rounded-lg">
                    <span>Header: X-API-KEY → Public API Key</span>
                    <span>Header: X-API-TIMESTAMP → Unix Timestamp</span>
                    <span>Header: X-API-SIGNATURE → HMAC-SHA256(secretKey, timestamp)</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Rate Limits</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border text-center">
                      <p className="text-2xl font-bold text-primary">50.000</p>
                      <p className="text-xs text-muted-foreground">Requests / Tag</p>
                    </div>
                    <div className="p-3 rounded-lg border text-center">
                      <p className="text-2xl font-bold text-primary">2.083</p>
                      <p className="text-xs text-muted-foreground">Requests / Stunde</p>
                    </div>
                    <div className="p-3 rounded-lg border text-center">
                      <p className="text-2xl font-bold text-primary">157</p>
                      <p className="text-xs text-muted-foreground">Requests / 5 Min.</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Bei Überschreitung: Mindestens 5 Minuten Sperre.</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Integrations-Modell: Weg B (Kalender-Sync)</h4>
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200 mb-3">
                    <p className="text-sm text-green-800 font-medium">Regiondo wird nur zur Verfügbarkeitsprüfung und Kalender-Synchronisation genutzt. Buchung und Zahlung laufen komplett über FreizeitEngel + Stripe Connect.</p>
                    <p className="text-xs text-green-600 mt-1">Vorteil: Keine Regiondo-Transaktionsgebühren pro Buchung für den Partner.</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">1</Badge>
                      <span>Produkte, Varianten & Timeslots von Regiondo abrufen (gecacht, 1x/Stunde)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">2</Badge>
                      <span>Verfügbarkeit live prüfen via Timeslots + Options (1–2 API Calls)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">3</Badge>
                      <span>Kunde bezahlt über Stripe Connect (89% Partner / 11% FreizeitEngel)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">4</Badge>
                      <span>Permanent Reservation bei Regiondo erstellen — Slot wird blockiert (1 API Call)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">5</Badge>
                      <span>E-Mail-Bestätigung + QR-Code an Kunden</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">~ 3 API Calls pro Buchung (Timeslots + Options + Permanent Reservation). Bei 500 Buchungen/Monat = ca. 1.524 Calls — weit unter dem Tageslimit.</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Verfügbare Endpunkte (Katalog)</h4>
                  <div className="grid gap-1 text-xs">
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-mono">GET /products</span>
                      <span className="text-muted-foreground">Produktliste mit Pagination</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-mono">GET /products/:id</span>
                      <span className="text-muted-foreground">Produktdetails mit Varianten & Zeiten</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-mono">GET /products/:id/timeslots</span>
                      <span className="text-muted-foreground">Verfügbare Zeitfenster</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-mono">GET /products/:id/variations</span>
                      <span className="text-muted-foreground">Produktvarianten (Preisoptionen)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-mono">GET /products/options</span>
                      <span className="text-muted-foreground">Optionen mit Preisen für Buchung</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-mono">POST /checkout/permanent-reservation</span>
                      <span className="text-muted-foreground">Slot blockieren (ohne Kauf)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-mono">DELETE /checkout/permanent-reservation/:id</span>
                      <span className="text-muted-foreground">Blockierung aufheben (Storno)</span>
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
