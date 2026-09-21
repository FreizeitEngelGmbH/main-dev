import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Target, TrendingUp, DollarSign, Plus, Trash2, Edit, BarChart3, Filter,
  Megaphone, Users, Calendar, PieChart, MapPin, Building2, Eye, ArrowUpDown,
  CheckCircle2, Clock, Pause, XCircle, Pencil
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface MarketingAction {
  id: number;
  title: string;
  description: string | null;
  segment: string;
  type: string;
  channelType: string | null;
  channel: string | null;
  targetAudience: string | null;
  city: string | null;
  partnerId: number | null;
  status: string;
  priority: string | null;
  budget: number | null;
  budgetMonthly: number | null;
  spent: number | null;
  startDate: string | null;
  endDate: string | null;
  kpi1Name: string | null;
  kpi1Target: string | null;
  kpi1Actual: string | null;
  kpi2Name: string | null;
  kpi2Target: string | null;
  kpi2Actual: string | null;
  kpiTarget: string | null;
  kpiActual: string | null;
  notes: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MarketingKpi {
  id: number;
  name: string;
  category: string;
  description: string | null;
  unit: string | null;
  targetMonthly: string | null;
  currentValue: string | null;
  status: string | null;
  responsible: string | null;
  notes: string | null;
  sortOrder: number | null;
}

interface MarketingKpiValue {
  id: number;
  kpiId: number;
  year: number;
  month: number;
  value: string | null;
  target: string | null;
}

interface MarketingCalendarEntry {
  id: number;
  month: number;
  year: number;
  season: string | null;
  b2cCampaign: string | null;
  b2bCampaign: string | null;
  channel: string | null;
  budget: number | null;
  goal: string | null;
  status: string | null;
  responsible: string | null;
}

interface MarketingBudgetRoi {
  id: number;
  channel: string;
  segment: string;
  monthlyBudget: number | null;
  yearlyBudget: number | null;
  expectedBookings: number | null;
  expectedRevenue: number | null;
  cpa: number | null;
  roas: number | null;
  budgetShare: number | null;
  priority: string | null;
  optimizationNotes: string | null;
}

interface MarketingAdInventory {
  id: number;
  partnerId: number | null;
  partnerName: string | null;
  city: string | null;
  placementName: string;
  format: string | null;
  priceMonthly: number | null;
  status: string | null;
  bookedBy: string | null;
  notes: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  geplant: { label: "Geplant", icon: Clock, color: "bg-blue-100 text-blue-800" },
  aktiv: { label: "Aktiv", icon: CheckCircle2, color: "bg-green-100 text-green-800" },
  pausiert: { label: "Pausiert", icon: Pause, color: "bg-yellow-100 text-yellow-800" },
  abgeschlossen: { label: "Abgeschlossen", icon: CheckCircle2, color: "bg-gray-100 text-gray-800" },
};

const CHANNEL_TYPES_B2C: Record<string, string> = {
  google_search: "Google Ads (Search)",
  google_display: "Google Ads (Display)",
  meta_facebook: "Meta Ads (Facebook)",
  meta_instagram: "Meta Ads (Instagram)",
  tiktok: "TikTok",
  youtube: "YouTube",
  seo_content: "SEO / Content",
  seo_lokal: "SEO / Lokal",
  email_newsletter: "E-Mail / Newsletter",
  influencer: "Influencer Marketing",
  affiliate: "Affiliate / Partnerschaften",
  bewertungen: "Bewertungen / Reputation",
  flyer_plakate: "Flyer / Plakate",
  events_messen: "Events / Messen",
  pr_presse: "PR / Presse",
  kooperationen: "Kooperationen",
  guerilla: "Guerilla Marketing",
  empfehlung: "Empfehlungsprogramm",
};

const CHANNEL_TYPES_B2B: Record<string, string> = {
  linkedin: "LinkedIn",
  linkedin_ads: "LinkedIn Ads",
  email_outreach: "E-Mail Outreach",
  google_ads: "Google Ads",
  webinare: "Webinare",
  content_marketing: "Content Marketing",
  branchenportale: "Branchenportale",
  direktvertrieb: "Direktvertrieb",
  messen_events: "Messen & Events",
  kooperationen: "Kooperationen",
  empfehlung: "Empfehlungsprogramm",
  print: "Print",
  onboarding: "Onboarding",
  schulung: "Schulung",
};

const KPI_CATEGORIES: Record<string, string> = {
  "PLATTFORM-KPIs": "Plattform",
  "WEBSITE-KPIs": "Website",
  "SEO-KPIs": "SEO",
  "E-MAIL-KPIs": "E-Mail",
  "APP-KPIs": "App",
};

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

function formatCurrency(value: number | null | undefined) {
  if (value == null) return "–";
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

function getStatusBadge(status: string) {
  const config = STATUS_CONFIG[status];
  if (!config) return <Badge variant="outline">{status}</Badge>;
  const Icon = config.icon;
  return (
    <Badge className={`${config.color} gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function getPriorityBadge(priority: string | null) {
  const colors: Record<string, string> = {
    hoch: "bg-red-100 text-red-800 border-red-200",
    mittel: "bg-yellow-100 text-yellow-800 border-yellow-200",
    niedrig: "bg-green-100 text-green-800 border-green-200",
  };
  const labels: Record<string, string> = { hoch: "Hoch", mittel: "Mittel", niedrig: "Niedrig" };
  const p = priority || "mittel";
  return <Badge variant="outline" className={colors[p]}>{labels[p]}</Badge>;
}

export default function AdminMarketing() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("uebersicht");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Megaphone className="h-8 w-8" />
          Marketing & Kampagnen
        </h1>
        <p className="text-muted-foreground mt-1">Kampagnenmanager, KPIs, Budget & Werbeflächen</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 lg:grid-cols-7 w-full">
          <TabsTrigger value="uebersicht" className="gap-1 text-xs">
            <Eye className="h-3 w-3" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="b2c" className="gap-1 text-xs">
            <Users className="h-3 w-3" />
            B2C
          </TabsTrigger>
          <TabsTrigger value="b2b" className="gap-1 text-xs">
            <Building2 className="h-3 w-3" />
            B2B
          </TabsTrigger>
          <TabsTrigger value="kalender" className="gap-1 text-xs">
            <Calendar className="h-3 w-3" />
            Kalender
          </TabsTrigger>
          <TabsTrigger value="budget" className="gap-1 text-xs">
            <PieChart className="h-3 w-3" />
            Budget & ROI
          </TabsTrigger>
          <TabsTrigger value="kpi" className="gap-1 text-xs">
            <BarChart3 className="h-3 w-3" />
            KPI Dashboard
          </TabsTrigger>
          <TabsTrigger value="werbeflaechen" className="gap-1 text-xs">
            <MapPin className="h-3 w-3" />
            Werbeflächen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="uebersicht"><OverviewTab /></TabsContent>
        <TabsContent value="b2c"><CampaignTab segment="b2c" channelTypes={CHANNEL_TYPES_B2C} /></TabsContent>
        <TabsContent value="b2b"><CampaignTab segment="b2b" channelTypes={CHANNEL_TYPES_B2B} /></TabsContent>
        <TabsContent value="kalender"><CalendarTab /></TabsContent>
        <TabsContent value="budget"><BudgetRoiTab /></TabsContent>
        <TabsContent value="kpi"><KpiDashboardTab /></TabsContent>
        <TabsContent value="werbeflaechen"><AdInventoryTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab() {
  const { toast } = useToast();
  const { data: kpis = [], isLoading } = useQuery<MarketingKpi[]>({ queryKey: ["/api/admin/marketing/kpis"] });
  const [editKpi, setEditKpi] = useState<MarketingKpi | null>(null);
  const [kpiForm, setKpiForm] = useState({ currentValue: "", status: "neutral" });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/admin/marketing/kpis/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing/kpis"] });
      toast({ title: "KPI aktualisiert" });
      setEditKpi(null);
    },
  });

  const grouped = useMemo(() => {
    const groups: Record<string, MarketingKpi[]> = {};
    for (const kpi of kpis) {
      if (!groups[kpi.category]) groups[kpi.category] = [];
      groups[kpi.category].push(kpi);
    }
    return groups;
  }, [kpis]);

  function openEditKpi(kpi: MarketingKpi) {
    setEditKpi(kpi);
    setKpiForm({ currentValue: kpi.currentValue || "", status: kpi.status || "neutral" });
  }

  const filledCount = kpis.filter(k => k.currentValue).length;
  const greenCount = kpis.filter(k => k.status === "gut").length;

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">KPIs gesamt</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{kpis.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Erfasst</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{filledCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Im Ziel</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{greenCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Kategorien</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{Object.keys(grouped).length}</div></CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Laden...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Noch keine KPIs definiert. Bitte KPI-Daten seeden.</CardContent></Card>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                {KPI_CATEGORIES[category] || category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">KPI</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead>Einheit</TableHead>
                    <TableHead>Zielwert</TableHead>
                    <TableHead>Aktuell</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verantwortlich</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(kpi => (
                    <TableRow key={kpi.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEditKpi(kpi)}>
                      <TableCell className="font-medium">{kpi.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{kpi.description || "–"}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{kpi.unit || "–"}</Badge></TableCell>
                      <TableCell className="font-mono text-sm">{kpi.targetMonthly || "–"}</TableCell>
                      <TableCell className="font-mono text-sm font-semibold">{kpi.currentValue || "–"}</TableCell>
                      <TableCell>
                        {kpi.status === "gut" && <Badge className="bg-green-100 text-green-800">Gut</Badge>}
                        {kpi.status === "warnung" && <Badge className="bg-yellow-100 text-yellow-800">Warnung</Badge>}
                        {kpi.status === "kritisch" && <Badge className="bg-red-100 text-red-800">Kritisch</Badge>}
                        {(!kpi.status || kpi.status === "neutral") && <Badge variant="outline">–</Badge>}
                      </TableCell>
                      <TableCell className="text-sm">{kpi.responsible || "–"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditKpi(kpi); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={!!editKpi} onOpenChange={(o) => !o && setEditKpi(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>KPI aktualisieren: {editKpi?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Aktueller Wert</Label>
              <Input value={kpiForm.currentValue} onChange={(e) => setKpiForm({ ...kpiForm, currentValue: e.target.value })} placeholder="Wert eingeben" className="mt-1" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={kpiForm.status} onValueChange={(v) => setKpiForm({ ...kpiForm, status: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="gut">Gut (Im Ziel)</SelectItem>
                  <SelectItem value="warnung">Warnung</SelectItem>
                  <SelectItem value="kritisch">Kritisch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editKpi && (
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                <p>Zielwert: {editKpi.targetMonthly || "–"}</p>
                <p>Einheit: {editKpi.unit || "–"}</p>
                <p>Verantwortlich: {editKpi.responsible || "–"}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditKpi(null)}>Abbrechen</Button>
            <Button onClick={() => editKpi && updateMutation.mutate({ id: editKpi.id, data: kpiForm })} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Speichere..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CampaignTab({ segment, channelTypes }: { segment: string; channelTypes: Record<string, string> }) {
  const { toast } = useToast();
  const { data: allActions = [], isLoading } = useQuery<MarketingAction[]>({ queryKey: ["/api/admin/marketing"] });
  const { data: cities = [] } = useQuery<string[]>({ queryKey: ["/api/cities"] });
  const [statusFilter, setStatusFilter] = useState("alle");
  const [channelFilter, setChannelFilter] = useState("alle");
  const [cityFilter, setCityFilter] = useState("alle");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<MarketingAction | null>(null);

  const emptyForm = {
    title: "", description: "", segment, type: "campaign", channelType: "", channel: "",
    targetAudience: "", city: "", status: "geplant", priority: "mittel",
    budget: "", budgetMonthly: "", startDate: "", endDate: "",
    kpi1Name: "", kpi1Target: "", kpi2Name: "", kpi2Target: "",
    assignedTo: "", notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  const createMutation = useMutation({
    mutationFn: async (data: any) => { await apiRequest("POST", "/api/admin/marketing", data); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing"] });
      toast({ title: "Kampagne erstellt" });
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => { await apiRequest("PATCH", `/api/admin/marketing/${id}`, data); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing"] });
      toast({ title: "Kampagne aktualisiert" });
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/marketing/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing"] });
      toast({ title: "Kampagne gelöscht" });
    },
  });

  const actions = allActions.filter(a => a.segment === segment);
  const filtered = actions.filter(a => {
    if (statusFilter !== "alle" && a.status !== statusFilter) return false;
    if (channelFilter !== "alle" && a.channelType !== channelFilter) return false;
    if (cityFilter !== "alle" && a.city !== cityFilter) return false;
    return true;
  });

  function openCreate() {
    setEditingAction(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  }

  function openEdit(action: MarketingAction) {
    setEditingAction(action);
    setForm({
      title: action.title, description: action.description || "", segment,
      type: action.type, channelType: action.channelType || "", channel: action.channel || "",
      targetAudience: action.targetAudience || "", city: action.city || "",
      status: action.status, priority: action.priority || "mittel",
      budget: action.budget != null ? String(action.budget) : "",
      budgetMonthly: action.budgetMonthly != null ? String(action.budgetMonthly) : "",
      startDate: action.startDate ? new Date(action.startDate).toISOString().split("T")[0] : "",
      endDate: action.endDate ? new Date(action.endDate).toISOString().split("T")[0] : "",
      kpi1Name: action.kpi1Name || "", kpi1Target: action.kpi1Target || "",
      kpi2Name: action.kpi2Name || "", kpi2Target: action.kpi2Target || "",
      assignedTo: action.assignedTo || "", notes: action.notes || "",
    });
    setDialogOpen(true);
  }

  function closeDialog() { setDialogOpen(false); setEditingAction(null); setForm(emptyForm); }

  function handleSubmit() {
    if (!form.title.trim()) return;
    const payload: any = {
      title: form.title, description: form.description || null, segment,
      type: form.type, channelType: form.channelType || null, channel: form.channel || null,
      targetAudience: form.targetAudience || null, city: form.city || null,
      status: form.status, priority: form.priority,
      budget: form.budget ? parseFloat(form.budget) : null,
      budgetMonthly: form.budgetMonthly ? parseFloat(form.budgetMonthly) : null,
      startDate: form.startDate || null, endDate: form.endDate || null,
      kpi1Name: form.kpi1Name || null, kpi1Target: form.kpi1Target || null,
      kpi2Name: form.kpi2Name || null, kpi2Target: form.kpi2Target || null,
      assignedTo: form.assignedTo || null, notes: form.notes || null,
    };
    if (editingAction) updateMutation.mutate({ id: editingAction.id, data: payload });
    else createMutation.mutate(payload);
  }

  const totalBudget = actions.reduce((s, a) => s + (a.budgetMonthly || a.budget || 0), 0);
  const activeCount = actions.filter(a => a.status === "aktiv").length;
  const segmentLabel = segment === "b2c" ? "B2C" : "B2B";

  return (
    <div className="space-y-6 mt-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{segmentLabel} Marketing-Kampagnen</h2>
          <p className="text-sm text-muted-foreground">{actions.length} Kampagnen | {activeCount} aktiv | Budget: {formatCurrency(totalBudget)}/Monat</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Neue Kampagne</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Status</SelectItem>
            <SelectItem value="geplant">Geplant</SelectItem>
            <SelectItem value="aktiv">Aktiv</SelectItem>
            <SelectItem value="pausiert">Pausiert</SelectItem>
            <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
          </SelectContent>
        </Select>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Kanal" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Kanäle</SelectItem>
            {Object.entries(channelTypes).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Stadt" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Städte</SelectItem>
            {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        {(statusFilter !== "alle" || channelFilter !== "alle" || cityFilter !== "alle") && (
          <Button variant="outline" size="sm" onClick={() => { setStatusFilter("alle"); setChannelFilter("alle"); setCityFilter("alle"); }}>
            Filter zurücksetzen
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Laden...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {actions.length === 0 ? "Noch keine Kampagnen vorhanden" : "Keine Kampagnen für die gewählten Filter"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kanal</TableHead>
                    <TableHead>Kampagne</TableHead>
                    <TableHead>Zielgruppe</TableHead>
                    <TableHead>KPI 1</TableHead>
                    <TableHead>KPI 2</TableHead>
                    <TableHead>Budget/Mon.</TableHead>
                    <TableHead>Zeitraum</TableHead>
                    <TableHead>Priorität</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stadt</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(action => (
                    <TableRow key={action.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEdit(action)}>
                      <TableCell>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {channelTypes[action.channelType || ""] || action.channelType || action.channel || "–"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{action.title}</div>
                        {action.description && <div className="text-xs text-muted-foreground truncate max-w-[200px]">{action.description}</div>}
                      </TableCell>
                      <TableCell className="text-sm">{action.targetAudience || "–"}</TableCell>
                      <TableCell className="text-xs">
                        {action.kpi1Name && <div>{action.kpi1Name}: <span className="font-mono">{action.kpi1Target || "–"}</span></div>}
                      </TableCell>
                      <TableCell className="text-xs">
                        {action.kpi2Name && <div>{action.kpi2Name}: <span className="font-mono">{action.kpi2Target || "–"}</span></div>}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{formatCurrency(action.budgetMonthly || action.budget)}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {action.startDate ? format(new Date(action.startDate), "dd.MM.yy") : ""}
                        {action.endDate ? ` – ${format(new Date(action.endDate), "dd.MM.yy")}` : action.startDate ? " (laufend)" : "–"}
                      </TableCell>
                      <TableCell>{getPriorityBadge(action.priority)}</TableCell>
                      <TableCell>{getStatusBadge(action.status)}</TableCell>
                      <TableCell className="text-sm">{action.city || "–"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(action); }}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-600" onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Kampagne löschen?")) deleteMutation.mutate(action.id);
                          }}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAction ? "Kampagne bearbeiten" : `Neue ${segmentLabel}-Kampagne`}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Titel *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
              <div>
                <Label>Kanal-Typ</Label>
                <Select value={form.channelType || "none"} onValueChange={(v) => setForm({ ...form, channelType: v === "none" ? "" : v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Kanal</SelectItem>
                    {Object.entries(channelTypes).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Beschreibung</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Zielgruppe</Label><Input value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} className="mt-1" /></div>
              <div>
                <Label>Stadt</Label>
                <Select value={form.city || "none"} onValueChange={(v) => setForm({ ...form, city: v === "none" ? "" : v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Alle / Keine</SelectItem>
                    {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div><Label>KPI 1</Label><Input value={form.kpi1Name} onChange={(e) => setForm({ ...form, kpi1Name: e.target.value })} placeholder="z.B. Impressionen" className="mt-1" /></div>
              <div><Label>Zielwert KPI 1</Label><Input value={form.kpi1Target} onChange={(e) => setForm({ ...form, kpi1Target: e.target.value })} placeholder="z.B. 10.000" className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>KPI 2</Label><Input value={form.kpi2Name} onChange={(e) => setForm({ ...form, kpi2Name: e.target.value })} placeholder="z.B. CTR" className="mt-1" /></div>
              <div><Label>Zielwert KPI 2</Label><Input value={form.kpi2Target} onChange={(e) => setForm({ ...form, kpi2Target: e.target.value })} placeholder="z.B. > 8%" className="mt-1" /></div>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Budget/Monat (€)</Label><Input type="number" value={form.budgetMonthly} onChange={(e) => setForm({ ...form, budgetMonthly: e.target.value })} className="mt-1" /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geplant">Geplant</SelectItem>
                    <SelectItem value="aktiv">Aktiv</SelectItem>
                    <SelectItem value="pausiert">Pausiert</SelectItem>
                    <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priorität</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoch">Hoch</SelectItem>
                    <SelectItem value="mittel">Mittel</SelectItem>
                    <SelectItem value="niedrig">Niedrig</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-1" /></div>
              <div><Label>Ende</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Zuständig</Label><Input value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="mt-1" /></div>
            </div>
            <div><Label>Notizen</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1" rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Abbrechen</Button>
            <Button onClick={handleSubmit} disabled={!form.title || createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) ? "Speichere..." : editingAction ? "Aktualisieren" : "Erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CalendarTab() {
  const { toast } = useToast();
  const [year, setYear] = useState(new Date().getFullYear());
  const { data: entries = [], isLoading } = useQuery<MarketingCalendarEntry[]>({
    queryKey: ["/api/admin/marketing/calendar", year],
    queryFn: async () => {
      const res = await fetch(`/api/admin/marketing/calendar?year=${year}`);
      if (!res.ok) throw new Error("Fehler");
      return res.json();
    },
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MarketingCalendarEntry | null>(null);
  const [form, setForm] = useState({ month: "1", season: "", b2cCampaign: "", b2bCampaign: "", channel: "", budget: "", goal: "", status: "geplant", responsible: "" });

  const createMutation = useMutation({
    mutationFn: async (data: any) => { await apiRequest("POST", "/api/admin/marketing/calendar", data); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing/calendar", year] });
      toast({ title: "Eintrag erstellt" });
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => { await apiRequest("PATCH", `/api/admin/marketing/calendar/${id}`, data); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing/calendar", year] });
      toast({ title: "Eintrag aktualisiert" });
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/marketing/calendar/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing/calendar", year] });
      toast({ title: "Eintrag gelöscht" });
    },
  });

  function openCreate() {
    setEditing(null);
    setForm({ month: "1", season: "", b2cCampaign: "", b2bCampaign: "", channel: "", budget: "", goal: "", status: "geplant", responsible: "" });
    setDialogOpen(true);
  }

  function openEdit(entry: MarketingCalendarEntry) {
    setEditing(entry);
    setForm({
      month: String(entry.month), season: entry.season || "", b2cCampaign: entry.b2cCampaign || "",
      b2bCampaign: entry.b2bCampaign || "", channel: entry.channel || "",
      budget: entry.budget != null ? String(entry.budget) : "", goal: entry.goal || "",
      status: entry.status || "geplant", responsible: entry.responsible || "",
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    const payload: any = {
      month: parseInt(form.month), year,
      season: form.season || null, b2cCampaign: form.b2cCampaign || null,
      b2bCampaign: form.b2bCampaign || null, channel: form.channel || null,
      budget: form.budget ? parseFloat(form.budget) : null,
      goal: form.goal || null, status: form.status, responsible: form.responsible || null,
    };
    if (editing) updateMutation.mutate({ id: editing.id, data: payload });
    else createMutation.mutate(payload);
  }

  const totalBudget = entries.reduce((s, e) => s + (e.budget || 0), 0);

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Kampagnenkalender {year}</h2>
          <p className="text-sm text-muted-foreground">Jahresplanung B2C & B2B | Gesamtbudget: {formatCurrency(totalBudget)}</p>
        </div>
        <div className="flex gap-2">
          <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Eintrag</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Laden...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Monat</TableHead>
                    <TableHead>Saison / Anlass</TableHead>
                    <TableHead>B2C Kampagne</TableHead>
                    <TableHead>B2B Kampagne</TableHead>
                    <TableHead>Kanal</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Ziel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verantw.</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                    const monthEntries = entries.filter(e => e.month === m);
                    if (monthEntries.length === 0) {
                      return (
                        <TableRow key={m} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{MONTHS[m - 1]}</TableCell>
                          <TableCell colSpan={8} className="text-muted-foreground text-sm">
                            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => { setForm({ ...form, month: String(m) }); setEditing(null); setDialogOpen(true); }}>
                              <Plus className="h-3 w-3" /> Kampagne planen
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return monthEntries.map((entry, idx) => (
                      <TableRow key={entry.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEdit(entry)}>
                        {idx === 0 && <TableCell rowSpan={monthEntries.length} className="font-medium align-top">{MONTHS[m - 1]}</TableCell>}
                        <TableCell className="text-sm">{entry.season || "–"}</TableCell>
                        <TableCell className="text-sm max-w-[200px]">{entry.b2cCampaign || "–"}</TableCell>
                        <TableCell className="text-sm max-w-[200px]">{entry.b2bCampaign || "–"}</TableCell>
                        <TableCell className="text-sm">{entry.channel || "–"}</TableCell>
                        <TableCell className="font-mono text-sm">{formatCurrency(entry.budget)}</TableCell>
                        <TableCell className="text-sm">{entry.goal || "–"}</TableCell>
                        <TableCell>{getStatusBadge(entry.status || "geplant")}</TableCell>
                        <TableCell className="text-sm">{entry.responsible || "–"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="text-red-600" onClick={(e) => {
                            e.stopPropagation(); if (confirm("Eintrag löschen?")) deleteMutation.mutate(entry.id);
                          }}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </TableCell>
                      </TableRow>
                    ));
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Kalendereintrag bearbeiten" : "Neuer Kalendereintrag"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Monat</Label>
                <Select value={form.month} onValueChange={(v) => setForm({ ...form, month: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Saison / Anlass</Label><Input value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="mt-1" placeholder="z.B. Sommerferien" /></div>
            </div>
            <div><Label>B2C Kampagne</Label><Input value={form.b2cCampaign} onChange={(e) => setForm({ ...form, b2cCampaign: e.target.value })} className="mt-1" /></div>
            <div><Label>B2B Kampagne</Label><Input value={form.b2bCampaign} onChange={(e) => setForm({ ...form, b2bCampaign: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Kanal</Label><Input value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="mt-1" /></div>
              <div><Label>Budget (€)</Label><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="mt-1" /></div>
              <div><Label>Ziel</Label><Input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className="mt-1" placeholder="z.B. 500 Buchungen" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geplant">Geplant</SelectItem>
                    <SelectItem value="aktiv">Aktiv</SelectItem>
                    <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Verantwortlich</Label><Input value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} className="mt-1" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BudgetRoiTab() {
  const { toast } = useToast();
  const { data: entries = [], isLoading } = useQuery<MarketingBudgetRoi[]>({ queryKey: ["/api/admin/marketing/budget-roi"] });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MarketingBudgetRoi | null>(null);
  const emptyForm = { channel: "", segment: "b2c", monthlyBudget: "", yearlyBudget: "", expectedBookings: "", expectedRevenue: "", cpa: "", roas: "", budgetShare: "", priority: "mittel", optimizationNotes: "" };
  const [form, setForm] = useState(emptyForm);

  const createMutation = useMutation({
    mutationFn: async (data: any) => { await apiRequest("POST", "/api/admin/marketing/budget-roi", data); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing/budget-roi"] }); toast({ title: "Eintrag erstellt" }); setDialogOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => { await apiRequest("PATCH", `/api/admin/marketing/budget-roi/${id}`, data); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing/budget-roi"] }); toast({ title: "Eintrag aktualisiert" }); setDialogOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/marketing/budget-roi/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing/budget-roi"] }); toast({ title: "Eintrag gelöscht" }); },
  });

  function openCreate() { setEditing(null); setForm(emptyForm); setDialogOpen(true); }
  function openEdit(entry: MarketingBudgetRoi) {
    setEditing(entry);
    setForm({
      channel: entry.channel, segment: entry.segment,
      monthlyBudget: entry.monthlyBudget != null ? String(entry.monthlyBudget) : "",
      yearlyBudget: entry.yearlyBudget != null ? String(entry.yearlyBudget) : "",
      expectedBookings: entry.expectedBookings != null ? String(entry.expectedBookings) : "",
      expectedRevenue: entry.expectedRevenue != null ? String(entry.expectedRevenue) : "",
      cpa: entry.cpa != null ? String(entry.cpa) : "",
      roas: entry.roas != null ? String(entry.roas) : "",
      budgetShare: entry.budgetShare != null ? String(entry.budgetShare) : "",
      priority: entry.priority || "mittel",
      optimizationNotes: entry.optimizationNotes || "",
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!form.channel.trim()) return;
    const payload: any = {
      channel: form.channel, segment: form.segment,
      monthlyBudget: form.monthlyBudget ? parseFloat(form.monthlyBudget) : null,
      yearlyBudget: form.yearlyBudget ? parseFloat(form.yearlyBudget) : null,
      expectedBookings: form.expectedBookings ? parseInt(form.expectedBookings) : null,
      expectedRevenue: form.expectedRevenue ? parseFloat(form.expectedRevenue) : null,
      cpa: form.cpa ? parseFloat(form.cpa) : null,
      roas: form.roas ? parseFloat(form.roas) : null,
      budgetShare: form.budgetShare ? parseFloat(form.budgetShare) : null,
      priority: form.priority, optimizationNotes: form.optimizationNotes || null,
    };
    if (editing) updateMutation.mutate({ id: editing.id, data: payload });
    else createMutation.mutate(payload);
  }

  const totalMonthly = entries.reduce((s, e) => s + (e.monthlyBudget || 0), 0);
  const totalYearly = entries.reduce((s, e) => s + (e.yearlyBudget || 0), 0);
  const totalRevenue = entries.reduce((s, e) => s + (e.expectedRevenue || 0), 0);
  const b2cEntries = entries.filter(e => e.segment === "b2c");
  const b2bEntries = entries.filter(e => e.segment === "b2b");

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Budget & ROI</h2>
          <p className="text-sm text-muted-foreground">Budgetverteilung und erwarteter Return on Investment</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Neuer Eintrag</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Monatl. Budget</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(totalMonthly)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Jährl. Budget</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(totalYearly)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Erw. Umsatz</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Kanäle</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{entries.length}</div></CardContent></Card>
      </div>

      {[{ label: "B2C Kanäle", items: b2cEntries }, { label: "B2B Kanäle", items: b2bEntries }].map(({ label, items }) => (
        <Card key={label}>
          <CardHeader className="pb-3"><CardTitle className="text-lg">{label}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kanal</TableHead>
                    <TableHead>Monatl. Budget</TableHead>
                    <TableHead>Jährl. Budget</TableHead>
                    <TableHead>Erw. Buchungen</TableHead>
                    <TableHead>Erw. Umsatz</TableHead>
                    <TableHead>CPA</TableHead>
                    <TableHead>ROAS</TableHead>
                    <TableHead>Anteil</TableHead>
                    <TableHead>Priorität</TableHead>
                    <TableHead>Optimierung</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow><TableCell colSpan={11} className="text-center text-muted-foreground py-8">Keine Einträge</TableCell></TableRow>
                  ) : items.map(entry => (
                    <TableRow key={entry.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEdit(entry)}>
                      <TableCell className="font-medium">{entry.channel}</TableCell>
                      <TableCell className="font-mono text-sm">{formatCurrency(entry.monthlyBudget)}</TableCell>
                      <TableCell className="font-mono text-sm">{formatCurrency(entry.yearlyBudget)}</TableCell>
                      <TableCell className="font-mono text-sm">{entry.expectedBookings ?? "–"}</TableCell>
                      <TableCell className="font-mono text-sm">{formatCurrency(entry.expectedRevenue)}</TableCell>
                      <TableCell className="font-mono text-sm">{entry.cpa != null ? `${entry.cpa.toFixed(2)} €` : "–"}</TableCell>
                      <TableCell className="font-mono text-sm font-semibold">{entry.roas != null ? `${entry.roas}x` : "–"}</TableCell>
                      <TableCell>
                        {entry.budgetShare != null ? (
                          <div className="flex items-center gap-2">
                            <Progress value={entry.budgetShare} className="w-16 h-2" />
                            <span className="text-xs">{entry.budgetShare}%</span>
                          </div>
                        ) : "–"}
                      </TableCell>
                      <TableCell>{getPriorityBadge(entry.priority)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{entry.optimizationNotes || "–"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={(e) => {
                          e.stopPropagation(); if (confirm("Löschen?")) deleteMutation.mutate(entry.id);
                        }}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Budget-Eintrag bearbeiten" : "Neuer Budget-Eintrag"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Kanal *</Label><Input value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="mt-1" placeholder="z.B. Google Ads (Search)" /></div>
              <div>
                <Label>Segment</Label>
                <Select value={form.segment} onValueChange={(v) => setForm({ ...form, segment: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="b2c">B2C</SelectItem>
                    <SelectItem value="b2b">B2B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Monatl. Budget (€)</Label><Input type="number" value={form.monthlyBudget} onChange={(e) => setForm({ ...form, monthlyBudget: e.target.value })} className="mt-1" /></div>
              <div><Label>Jährl. Budget (€)</Label><Input type="number" value={form.yearlyBudget} onChange={(e) => setForm({ ...form, yearlyBudget: e.target.value })} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Erw. Buchungen</Label><Input type="number" value={form.expectedBookings} onChange={(e) => setForm({ ...form, expectedBookings: e.target.value })} className="mt-1" /></div>
              <div><Label>Erw. Umsatz (€)</Label><Input type="number" value={form.expectedRevenue} onChange={(e) => setForm({ ...form, expectedRevenue: e.target.value })} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>CPA (€)</Label><Input type="number" step="0.01" value={form.cpa} onChange={(e) => setForm({ ...form, cpa: e.target.value })} className="mt-1" /></div>
              <div><Label>ROAS</Label><Input type="number" step="0.1" value={form.roas} onChange={(e) => setForm({ ...form, roas: e.target.value })} className="mt-1" placeholder="z.B. 4.1" /></div>
              <div><Label>Anteil (%)</Label><Input type="number" value={form.budgetShare} onChange={(e) => setForm({ ...form, budgetShare: e.target.value })} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priorität</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoch">Hoch</SelectItem>
                    <SelectItem value="mittel">Mittel</SelectItem>
                    <SelectItem value="niedrig">Niedrig</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Optimierungspotenzial</Label><Textarea value={form.optimizationNotes} onChange={(e) => setForm({ ...form, optimizationNotes: e.target.value })} className="mt-1" rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSubmit} disabled={!form.channel || createMutation.isPending || updateMutation.isPending}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KpiDashboardTab() {
  const { toast } = useToast();
  const [year, setYear] = useState(new Date().getFullYear());
  const { data: kpis = [] } = useQuery<MarketingKpi[]>({ queryKey: ["/api/admin/marketing/kpis"] });
  const { data: values = [] } = useQuery<MarketingKpiValue[]>({
    queryKey: ["/api/admin/marketing/kpi-values", year],
    queryFn: async () => {
      const res = await fetch(`/api/admin/marketing/kpi-values?year=${year}`);
      if (!res.ok) throw new Error("Fehler");
      return res.json();
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (data: any) => { await apiRequest("POST", "/api/admin/marketing/kpi-values", data); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing/kpi-values", year] });
    },
  });

  const [editCell, setEditCell] = useState<{ kpiId: number; month: number } | null>(null);
  const [cellValue, setCellValue] = useState("");

  function getKpiValue(kpiId: number, month: number): string {
    const v = values.find(v => v.kpiId === kpiId && v.month === month);
    return v?.value || "";
  }

  function openCell(kpiId: number, month: number) {
    setEditCell({ kpiId, month });
    setCellValue(getKpiValue(kpiId, month));
  }

  function saveCell() {
    if (!editCell) return;
    upsertMutation.mutate({ kpiId: editCell.kpiId, year, month: editCell.month, value: cellValue || null });
    setEditCell(null);
  }

  const dashboardKpis = kpis.length > 0 ? kpis : [];

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">KPI Dashboard {year}</h2>
          <p className="text-sm text-muted-foreground">Monatliche KPI-Entwicklung verfolgen. Klicke auf eine Zelle zum Bearbeiten.</p>
        </div>
        <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
          <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
            <SelectItem value="2027">2027</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">KPI</TableHead>
                  {MONTHS.map(m => <TableHead key={m} className="text-center min-w-[70px]">{m}</TableHead>)}
                  <TableHead className="text-center min-w-[80px]">Ziel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardKpis.length === 0 ? (
                  <TableRow><TableCell colSpan={14} className="text-center py-12 text-muted-foreground">Noch keine KPIs definiert</TableCell></TableRow>
                ) : dashboardKpis.map(kpi => (
                  <TableRow key={kpi.id}>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium text-sm">{kpi.name}</TableCell>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                      const val = getKpiValue(kpi.id, month);
                      const isEditing = editCell?.kpiId === kpi.id && editCell?.month === month;
                      return (
                        <TableCell key={month} className="text-center p-1">
                          {isEditing ? (
                            <Input
                              autoFocus
                              value={cellValue}
                              onChange={(e) => setCellValue(e.target.value)}
                              onBlur={saveCell}
                              onKeyDown={(e) => { if (e.key === "Enter") saveCell(); if (e.key === "Escape") setEditCell(null); }}
                              className="h-7 text-xs text-center w-full"
                            />
                          ) : (
                            <button
                              onClick={() => openCell(kpi.id, month)}
                              className="w-full h-7 text-xs font-mono hover:bg-muted/50 rounded px-1 transition-colors"
                            >
                              {val || <span className="text-muted-foreground">–</span>}
                            </button>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center text-xs font-mono text-muted-foreground">{kpi.targetMonthly || "–"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdInventoryTab() {
  const { toast } = useToast();
  const { data: inventory = [], isLoading } = useQuery<MarketingAdInventory[]>({ queryKey: ["/api/admin/marketing/ad-inventory"] });
  const { data: cities = [] } = useQuery<string[]>({ queryKey: ["/api/cities"] });
  const { data: partners = [] } = useQuery<any[]>({ queryKey: ["/api/partners"] });
  const [cityFilter, setCityFilter] = useState("alle");
  const [statusFilter, setStatusFilter] = useState("alle");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MarketingAdInventory | null>(null);
  const emptyForm = { partnerId: "", partnerName: "", city: "", placementName: "", format: "", priceMonthly: "", status: "verfügbar", bookedBy: "", notes: "" };
  const [form, setForm] = useState(emptyForm);

  const createMutation = useMutation({
    mutationFn: async (data: any) => { await apiRequest("POST", "/api/admin/marketing/ad-inventory", data); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing/ad-inventory"] }); toast({ title: "Werbefläche erstellt" }); setDialogOpen(false); },
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => { await apiRequest("PATCH", `/api/admin/marketing/ad-inventory/${id}`, data); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing/ad-inventory"] }); toast({ title: "Werbefläche aktualisiert" }); setDialogOpen(false); },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/marketing/ad-inventory/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing/ad-inventory"] }); toast({ title: "Werbefläche gelöscht" }); },
  });

  function openCreate() { setEditing(null); setForm(emptyForm); setDialogOpen(true); }
  function openEdit(entry: MarketingAdInventory) {
    setEditing(entry);
    setForm({
      partnerId: entry.partnerId != null ? String(entry.partnerId) : "",
      partnerName: entry.partnerName || "", city: entry.city || "",
      placementName: entry.placementName, format: entry.format || "",
      priceMonthly: entry.priceMonthly != null ? String(entry.priceMonthly) : "",
      status: entry.status || "verfügbar", bookedBy: entry.bookedBy || "", notes: entry.notes || "",
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!form.placementName.trim()) return;
    const payload: any = {
      partnerId: form.partnerId ? parseInt(form.partnerId) : null,
      partnerName: form.partnerName || null, city: form.city || null,
      placementName: form.placementName, format: form.format || null,
      priceMonthly: form.priceMonthly ? parseFloat(form.priceMonthly) : null,
      status: form.status, bookedBy: form.bookedBy || null, notes: form.notes || null,
    };
    if (editing) updateMutation.mutate({ id: editing.id, data: payload });
    else createMutation.mutate(payload);
  }

  const filtered = inventory.filter(i => {
    if (cityFilter !== "alle" && i.city !== cityFilter) return false;
    if (statusFilter !== "alle" && i.status !== statusFilter) return false;
    return true;
  });

  const totalRevenue = inventory.filter(i => i.status === "gebucht").reduce((s, i) => s + (i.priceMonthly || 0), 0);
  const availableCount = inventory.filter(i => i.status === "verfügbar").length;
  const bookedCount = inventory.filter(i => i.status === "gebucht").length;

  const statusBadge = (s: string | null) => {
    if (s === "verfügbar") return <Badge className="bg-green-100 text-green-800">Verfügbar</Badge>;
    if (s === "gebucht") return <Badge className="bg-blue-100 text-blue-800">Gebucht</Badge>;
    if (s === "reserviert") return <Badge className="bg-yellow-100 text-yellow-800">Reserviert</Badge>;
    return <Badge variant="outline">{s || "–"}</Badge>;
  };

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Werbeflächen (Partner)</h2>
          <p className="text-sm text-muted-foreground">Werbeplätze bei Partnern verwalten und monetarisieren</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Neue Werbefläche</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Gesamt</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{inventory.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Verfügbar</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{availableCount}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Gebucht</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{bookedCount}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Monatl. Einnahmen</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div></CardContent></Card>
      </div>

      <div className="flex gap-3">
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Stadt" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Städte</SelectItem>
            {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Status</SelectItem>
            <SelectItem value="verfügbar">Verfügbar</SelectItem>
            <SelectItem value="gebucht">Gebucht</SelectItem>
            <SelectItem value="reserviert">Reserviert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Laden...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Stadt</TableHead>
                    <TableHead>Platzierung</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Preis/Monat</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gebucht von</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Keine Werbeflächen</TableCell></TableRow>
                  ) : filtered.map(entry => (
                    <TableRow key={entry.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEdit(entry)}>
                      <TableCell className="font-medium">{entry.partnerName || `Partner #${entry.partnerId}` || "–"}</TableCell>
                      <TableCell><Badge variant="outline" className="gap-1"><MapPin className="h-3 w-3" />{entry.city || "–"}</Badge></TableCell>
                      <TableCell>{entry.placementName}</TableCell>
                      <TableCell className="text-sm">{entry.format || "–"}</TableCell>
                      <TableCell className="font-mono font-semibold">{formatCurrency(entry.priceMonthly)}</TableCell>
                      <TableCell>{statusBadge(entry.status)}</TableCell>
                      <TableCell className="text-sm">{entry.bookedBy || "–"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={(e) => {
                          e.stopPropagation(); if (confirm("Löschen?")) deleteMutation.mutate(entry.id);
                        }}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Werbefläche bearbeiten" : "Neue Werbefläche"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Partner</Label>
                <Select value={form.partnerId || "none"} onValueChange={(v) => {
                  const p = partners.find((p: any) => String(p.id) === v);
                  setForm({ ...form, partnerId: v === "none" ? "" : v, partnerName: p ? p.companyName : form.partnerName });
                }}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Partner wählen" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Partner</SelectItem>
                    {partners.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.companyName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stadt</Label>
                <Select value={form.city || "none"} onValueChange={(v) => setForm({ ...form, city: v === "none" ? "" : v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keine Stadt</SelectItem>
                    {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Platzierung *</Label><Input value={form.placementName} onChange={(e) => setForm({ ...form, placementName: e.target.value })} className="mt-1" placeholder="z.B. Eingangsbereich, Kassenbereich" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Format</Label><Input value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} className="mt-1" placeholder="z.B. DIN A1, Digital Screen" /></div>
              <div><Label>Preis/Monat (€)</Label><Input type="number" value={form.priceMonthly} onChange={(e) => setForm({ ...form, priceMonthly: e.target.value })} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verfügbar">Verfügbar</SelectItem>
                    <SelectItem value="reserviert">Reserviert</SelectItem>
                    <SelectItem value="gebucht">Gebucht</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Gebucht von</Label><Input value={form.bookedBy} onChange={(e) => setForm({ ...form, bookedBy: e.target.value })} className="mt-1" placeholder="Firma / Marke" /></div>
            </div>
            <div><Label>Notizen</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1" rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSubmit} disabled={!form.placementName || createMutation.isPending || updateMutation.isPending}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
