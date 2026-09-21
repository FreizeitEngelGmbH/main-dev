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
  Settings, Wifi, WifiOff, Package, RefreshCw, Search,
  CheckCircle, XCircle, AlertCircle, Loader2, ExternalLink,
  Building2, ShieldCheck, Ticket, Globe
} from "lucide-react";

interface RollerPartner {
  partnerId: number;
  companyName: string;
  city: string;
  environment: string;
  connectionStatus: string;
  productCount: number;
  isLive: boolean;
}

export default function AdminRoller() {
  const { toast } = useToast();
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configForm, setConfigForm] = useState({
    partnerId: 0,
    clientId: "",
    clientSecret: "",
    venueId: "",
    environment: "production",
  });

  const { data: allPartners } = useQuery<any[]>({
    queryKey: ["/api/partners"],
  });

  const { data: rollerOverview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery<{ partners: RollerPartner[]; total: number }>({
    queryKey: ["/api/admin/roller/overview"],
    queryFn: () => fetch("/api/admin/roller/overview", { credentials: "include" }).then(r => r.json()),
    refetchInterval: 60000,
  });

  const { data: selectedProducts, isLoading: productsLoading } = useQuery<any>({
    queryKey: ["/api/admin/partners", selectedPartnerId, "roller", "products"],
    queryFn: () => fetch(`/api/admin/partners/${selectedPartnerId}/roller/products`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedPartnerId,
  });

  const configureMutation = useMutation({
    mutationFn: async (data: typeof configForm) => {
      const res = await apiRequest("POST", `/api/admin/partners/${data.partnerId}/roller/configure`, {
        clientId: data.clientId,
        clientSecret: data.clientSecret,
        venueId: data.venueId,
        environment: data.environment,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "ROLLER konfiguriert", description: "Die API-Credentials wurden gespeichert." });
      setConfigDialogOpen(false);
      setConfigForm({ partnerId: 0, clientId: "", clientSecret: "", venueId: "", environment: "production" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roller/overview"] });
    },
    onError: (err: any) => {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (partnerId: number) => {
      const res = await apiRequest("POST", `/api/admin/partners/${partnerId}/roller/test`);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Verbindung erfolgreich", description: "ROLLER API ist erreichbar." });
      } else {
        toast({ title: "Verbindung fehlgeschlagen", description: data.error || "API nicht erreichbar", variant: "destructive" });
      }
      refetchOverview();
    },
    onError: (err: any) => {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    },
  });

  const nonRollerPartners = allPartners?.filter((p: any) => {
    const alreadyConfigured = rollerOverview?.partners?.some(rp => rp.partnerId === p.id);
    return !alreadyConfigured;
  }) || [];

  function statusIcon(status: string) {
    switch (status) {
      case "connected": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  }

  function statusBadge(status: string) {
    switch (status) {
      case "connected": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Verbunden</Badge>;
      case "error": return <Badge variant="destructive">Fehler</Badge>;
      default: return <Badge variant="secondary">Nicht konfiguriert</Badge>;
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ROLLER Integration</h1>
            <p className="text-muted-foreground">Externe Buchungssysteme verwalten und Partner-API-Credentials konfigurieren</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetchOverview()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Aktualisieren
            </Button>
            <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Partner konfigurieren
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>ROLLER-Credentials konfigurieren</DialogTitle>
                  <DialogDescription>
                    Hinterlege die API-Zugangsdaten für einen Partner. Jeder Partner braucht eigene Credentials von ROLLER.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Label>Partner auswählen</Label>
                    <Select
                      value={configForm.partnerId ? String(configForm.partnerId) : ""}
                      onValueChange={(v) => setConfigForm({ ...configForm, partnerId: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Partner wählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {nonRollerPartners.map((p: any) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.companyName} ({p.city || p.location})
                          </SelectItem>
                        ))}
                        {rollerOverview?.partners?.map(p => (
                          <SelectItem key={p.partnerId} value={String(p.partnerId)}>
                            {p.companyName} ({p.city}) – Aktualisieren
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Client ID</Label>
                    <Input
                      placeholder="roller-api-client-id..."
                      value={configForm.clientId}
                      onChange={(e) => setConfigForm({ ...configForm, clientId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Client Secret</Label>
                    <Input
                      type="password"
                      placeholder="roller-api-client-secret..."
                      value={configForm.clientSecret}
                      onChange={(e) => setConfigForm({ ...configForm, clientSecret: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Venue ID (optional)</Label>
                    <Input
                      placeholder="venue-id..."
                      value={configForm.venueId}
                      onChange={(e) => setConfigForm({ ...configForm, venueId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Umgebung</Label>
                    <Select
                      value={configForm.environment}
                      onValueChange={(v) => setConfigForm({ ...configForm, environment: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Production (api.roller.app)</SelectItem>
                        <SelectItem value="playground">Playground (api.play.roller.app)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => configureMutation.mutate(configForm)}
                    disabled={!configForm.partnerId || !configForm.clientId || !configForm.clientSecret || configureMutation.isPending}
                  >
                    {configureMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Credentials speichern
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
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rollerOverview?.total || 0}</p>
                  <p className="text-xs text-muted-foreground">ROLLER Partner</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Wifi className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rollerOverview?.partners?.filter(p => p.connectionStatus === "connected").length || 0}</p>
                  <p className="text-xs text-muted-foreground">Verbunden</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <WifiOff className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rollerOverview?.partners?.filter(p => p.connectionStatus === "error").length || 0}</p>
                  <p className="text-xs text-muted-foreground">Fehlerhaft</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Ticket className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rollerOverview?.partners?.reduce((s, p) => s + p.productCount, 0) || 0}</p>
                  <p className="text-xs text-muted-foreground">Produkte gesamt</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="partners">
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
            ) : rollerOverview?.partners?.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Keine ROLLER-Partner konfiguriert</h3>
                  <p className="text-muted-foreground mb-4">Klicke auf "Partner konfigurieren" um die ersten API-Credentials zu hinterlegen.</p>
                  <Button onClick={() => setConfigDialogOpen(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Ersten Partner konfigurieren
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {rollerOverview?.partners?.map((partner) => (
                  <Card key={partner.partnerId} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
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
                                {partner.environment === "production" ? "Production" : "Playground"}
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
                                clientId: "",
                                clientSecret: "",
                                venueId: "",
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
                  <p className="text-muted-foreground">Wähle einen ROLLER-Partner in der Übersicht, um dessen Produkte zu sehen.</p>
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
                    <Card key={product.Id || product.id || i}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{product.Name || product.name || `Produkt ${i + 1}`}</h4>
                            <p className="text-sm text-muted-foreground">
                              {product.Description || product.description || "Keine Beschreibung"}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {product.ProductType !== undefined && (
                                <Badge variant="outline">Typ: {product.ProductType}</Badge>
                              )}
                              {product.Price !== undefined && (
                                <Badge variant="secondary">
                                  {(product.Price / 100).toFixed(2)} €
                                </Badge>
                              )}
                              {(product.IsActive || product.isActive) && (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aktiv</Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            ID: {product.Id || product.id}
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
                <CardTitle>ROLLER API Informationen</CardTitle>
                <CardDescription>Technische Details zur ROLLER-Integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">API Endpunkte</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-muted rounded-lg">
                      <span className="font-mono">Production</span>
                      <span className="text-muted-foreground">https://api.roller.app</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded-lg">
                      <span className="font-mono">Playground</span>
                      <span className="text-muted-foreground">https://api.play.roller.app</span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Authentifizierung</h4>
                  <p className="text-sm text-muted-foreground">
                    OAuth 2.0 Client Credentials Grant. Jeder Partner benötigt eigene API-Credentials (Client ID + Secret) von ROLLER. 
                    Tokens werden automatisch gecacht und erneuert.
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Rate Limits</h4>
                  <p className="text-sm text-muted-foreground">600 Requests pro 60 Sekunden pro API-Key. Bei Überschreitung: 60 Sekunden Sperre.</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">API Subscription Pläne (pro Partner)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg border text-center">
                      <p className="font-semibold text-sm">API Lite</p>
                      <p className="text-2xl font-bold text-primary">5.000</p>
                      <p className="text-xs text-muted-foreground">Calls/Monat</p>
                    </div>
                    <div className="p-3 rounded-lg border border-primary text-center">
                      <p className="font-semibold text-sm">API Pro</p>
                      <p className="text-2xl font-bold text-primary">25.000</p>
                      <p className="text-xs text-muted-foreground">Calls/Monat</p>
                    </div>
                    <div className="p-3 rounded-lg border text-center">
                      <p className="font-semibold text-sm">API Premium</p>
                      <p className="text-2xl font-bold text-primary">100.000</p>
                      <p className="text-xs text-muted-foreground">Calls/Monat</p>
                    </div>
                    <div className="p-3 rounded-lg border text-center">
                      <p className="font-semibold text-sm">Enterprise</p>
                      <p className="text-2xl font-bold text-primary">500.000</p>
                      <p className="text-xs text-muted-foreground">Calls/Monat</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Integrations-Modell: Weg B (Kalender-Sync)</h4>
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200 mb-3">
                    <p className="text-sm text-green-800 font-medium">ROLLER wird nur zur Verfügbarkeitsprüfung und Kalender-Synchronisation genutzt. Buchung und Zahlung laufen komplett über FreizeitEngel + Stripe Connect.</p>
                    <p className="text-xs text-green-600 mt-1">Vorteil: Keine ROLLER-Transaktionsgebühren pro Buchung für den Partner.</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">1</Badge>
                      <span>Produkte & Preise von ROLLER abrufen (gecacht, 1x/Stunde)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">2</Badge>
                      <span>Verfügbarkeit live prüfen (1 API Call)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">3</Badge>
                      <span>Kunde bezahlt über Stripe Connect (89% Partner / 11% FreizeitEngel)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">4</Badge>
                      <span>Kalender-Slot bei ROLLER blockieren (1 API Call)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0">5</Badge>
                      <span>E-Mail-Bestätigung + QR-Code an Kunden</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">~ 2 API Calls pro Buchung. Mit API Lite (5.000 Calls) sind ca. 2.500 Buchungen/Monat pro Partner möglich.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
