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
  Settings, Wifi, WifiOff, Calendar, RefreshCw, Search,
  CheckCircle, XCircle, AlertCircle, Loader2, ExternalLink,
  Building2, ShieldCheck, Users, Globe, Dumbbell, Clock
} from "lucide-react";

interface EversportPartner {
  partnerId: number;
  companyName: string;
  city: string;
  environment: string;
  connectionStatus: string;
  sessionCount: number;
  isLive: boolean;
}

export default function AdminEversport() {
  const { toast } = useToast();
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [configForm, setConfigForm] = useState({
    partnerId: 0,
    apiToken: "",
    venueId: "",
    environment: "production",
  });

  const { data: allPartners } = useQuery<any[]>({
    queryKey: ["/api/partners"],
  });

  const { data: eversportOverview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery<{ partners: EversportPartner[]; total: number }>({
    queryKey: ["/api/admin/eversport/overview"],
    queryFn: () => fetch("/api/admin/eversport/overview", { credentials: "include" }).then(r => r.json()),
    refetchInterval: 60000,
  });

  const { data: selectedSessions, isLoading: sessionsLoading } = useQuery<any>({
    queryKey: ["/api/admin/partners", selectedPartnerId, "eversport", "sessions", sessionDate],
    queryFn: () => {
      const to = new Date(new Date(sessionDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      return fetch(`/api/admin/partners/${selectedPartnerId}/eversport/sessions?from=${sessionDate}T00:00:00Z&to=${to}T23:59:59Z`, { credentials: "include" }).then(r => r.json());
    },
    enabled: !!selectedPartnerId,
  });

  const { data: apiInfo } = useQuery<any>({
    queryKey: ["/api/admin/eversport/api-info"],
    queryFn: () => fetch("/api/admin/eversport/api-info", { credentials: "include" }).then(r => r.json()),
  });

  const configureMutation = useMutation({
    mutationFn: async (data: typeof configForm) => {
      const res = await apiRequest("POST", `/api/admin/partners/${data.partnerId}/eversport/configure`, {
        apiToken: data.apiToken,
        venueId: data.venueId,
        environment: data.environment,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Eversport konfiguriert", description: "Die API-Credentials wurden gespeichert." });
      setConfigDialogOpen(false);
      setConfigForm({ partnerId: 0, apiToken: "", venueId: "", environment: "production" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/eversport/overview"] });
    },
    onError: (err: any) => {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (partnerId: number) => {
      const res = await apiRequest("POST", `/api/admin/partners/${partnerId}/eversport/test`);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Verbindung erfolgreich", description: `${data.data?.count || 0} Venue(s) gefunden.` });
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Dumbbell className="h-8 w-8 text-purple-600" />
              Eversport Integration
            </h1>
            <p className="text-muted-foreground mt-1">
              GraphQL Provider API – Kursplan-Sync für Fitness & Sport Partner (Weg B)
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
                  <DialogTitle>Eversport API konfigurieren</DialogTitle>
                  <DialogDescription>
                    Bearer Token und Venue ID des Partners eingeben.
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
                    <Label>API Bearer Token</Label>
                    <Input
                      type="password"
                      placeholder="eyJhbGci..."
                      value={configForm.apiToken}
                      onChange={(e) => setConfigForm(f => ({ ...f, apiToken: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Von Eversport bereitgestellt</p>
                  </div>
                  <div>
                    <Label>Venue ID</Label>
                    <Input
                      placeholder="1b177b79-ffad-416d-..."
                      value={configForm.venueId}
                      onChange={(e) => setConfigForm(f => ({ ...f, venueId: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">UUID der Venue aus dem Eversport Manager</p>
                  </div>
                  <div>
                    <Label>Umgebung</Label>
                    <Select
                      value={configForm.environment}
                      onValueChange={(v) => setConfigForm(f => ({ ...f, environment: v }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="test">Test (Aggregator)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => configureMutation.mutate(configForm)}
                    disabled={!configForm.partnerId || !configForm.apiToken || !configForm.venueId || configureMutation.isPending}
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
            <TabsTrigger value="sessions">Sessions / Kurse</TabsTrigger>
            <TabsTrigger value="api-info">API Info</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Konfigurierte Partner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{eversportOverview?.total || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Verbunden</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {eversportOverview?.partners?.filter(p => p.connectionStatus === "connected").length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">API-Typ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">GraphQL</div>
                  <p className="text-xs text-muted-foreground">Relay Cursor Pagination</p>
                </CardContent>
              </Card>
            </div>

            {overviewLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : (eversportOverview?.partners?.length || 0) === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Keine Eversport-Partner konfiguriert</h3>
                  <p className="text-muted-foreground mb-4">
                    Klicke auf "Partner konfigurieren" um einen Partner mit der Eversport API zu verbinden.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {eversportOverview?.partners?.map((p) => (
                  <Card key={p.partnerId} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StatusIcon status={p.connectionStatus} />
                          <div>
                            <h3 className="font-semibold">{p.companyName}</h3>
                            <p className="text-sm text-muted-foreground">{p.city} · {p.environment}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={p.connectionStatus === "connected" ? "default" : "destructive"}>
                            {p.connectionStatus === "connected" ? "Verbunden" : p.connectionStatus === "error" ? "Fehler" : "Nicht konfiguriert"}
                          </Badge>
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {p.sessionCount} Sessions (7 Tage)
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
                            Sessions
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Sessions / Kursplan
                </CardTitle>
                <CardDescription>
                  Wähle einen Partner und Zeitraum um die Sessions aus der Eversport API abzurufen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>Partner</Label>
                    <Select
                      value={selectedPartnerId?.toString() || ""}
                      onValueChange={(v) => setSelectedPartnerId(parseInt(v))}
                    >
                      <SelectTrigger><SelectValue placeholder="Partner wählen..." /></SelectTrigger>
                      <SelectContent>
                        {eversportOverview?.partners?.map((p) => (
                          <SelectItem key={p.partnerId} value={p.partnerId.toString()}>
                            {p.companyName} ({p.city})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ab Datum</Label>
                    <Input
                      type="date"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                    />
                  </div>
                </div>

                {sessionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Sessions werden geladen...</span>
                  </div>
                ) : selectedSessions?.sessions?.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {selectedSessions.sessions.length} Sessions gefunden für {selectedSessions.partnerName}
                    </p>
                    <div className="rounded-md border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="p-3 text-left font-medium">Kurs / Aktivität</th>
                            <th className="p-3 text-left font-medium">Datum & Zeit</th>
                            <th className="p-3 text-left font-medium">Trainer</th>
                            <th className="p-3 text-left font-medium">Raum</th>
                            <th className="p-3 text-center font-medium">Plätze</th>
                            <th className="p-3 text-center font-medium">Status</th>
                            <th className="p-3 text-center font-medium">Buchen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSessions.sessions.map((s: any, i: number) => (
                            <tr key={s.id || i} className="border-t hover:bg-muted/30">
                              <td className="p-3 font-medium">{s.name}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(s.start).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" })}
                                  {" "}
                                  {new Date(s.start).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                                  –
                                  {new Date(s.end).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                                </div>
                              </td>
                              <td className="p-3">{s.teachers?.map((t: any) => t.name).join(", ") || "–"}</td>
                              <td className="p-3">{s.room?.name || s.location?.name || "–"}</td>
                              <td className="p-3 text-center">
                                {s.availableSpots !== null && s.availableSpots !== undefined ? (
                                  <Badge variant={s.availableSpots > 3 ? "default" : s.availableSpots > 0 ? "secondary" : "destructive"}>
                                    {s.availableSpots}
                                  </Badge>
                                ) : "∞"}
                              </td>
                              <td className="p-3 text-center">
                                <Badge variant={s.state === "cancelled" ? "destructive" : "default"}>
                                  {s.state === "cancelled" ? "Abgesagt" : "Aktiv"}
                                </Badge>
                              </td>
                              <td className="p-3 text-center">
                                {s.checkoutUrl ? (
                                  <a href={s.checkoutUrl} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </a>
                                ) : "–"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : selectedPartnerId ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine Sessions für diesen Zeitraum gefunden.
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Wähle einen Partner um Sessions anzuzeigen.
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
                  <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-700 dark:text-purple-300">Weg B – Kalender-Sync</h4>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                      Eversport wird nur für Verfügbarkeitsprüfung und Kursplan-Synchronisation verwendet.
                      Buchungen und Zahlungen laufen über FreizeitEngel + Stripe Connect.
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Kursplan/Sessions abrufen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Verfügbare Plätze prüfen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Trainer-Informationen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Checkout-Links</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Standort & Raum-Details</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-muted-foreground">Buchungen erstellen (Read-Only API)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Unterstützte Aktivitäten</CardTitle>
                  <CardDescription>Die Eversport API liefert folgende Aktivitätstypen</CardDescription>
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
                  <div className="flex gap-4">
                    <a href="https://helpcenter.eversportsmanager.com/what-is-the-provider-api" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Help Center – Provider API
                      </Button>
                    </a>
                    <a href="https://provider-api.eversportsmanager.io/api/graphql" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        GraphQL Playground
                      </Button>
                    </a>
                    <a href="https://aggregator.eversports.io/" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Aggregator Lab
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
