import { useState, useMemo, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "./admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus, Trash2, Search, Filter, Download,
  Phone, Mail, MapPin, Globe, Building2, CalendarDays,
  CircleDot, ChevronDown, ChevronRight, ExternalLink,
  Users, TrendingUp, Clock, CheckCircle2, XCircle, Pencil,
  GripVertical, PanelRightOpen, PanelRightClose, UserPlus
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface SalesPipelineEntry {
  id: number;
  partnerId: number | null;
  companyName: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  website: string | null;
  category: string | null;
  status: string;
  priority: string | null;
  ampel: string | null;
  terminiert: string | null;
  wiedervorlage: string | null;
  assignedTo: string | null;
  notes: string | null;
  lastContact: string | null;
  source: string | null;
  dealValue: number | null;
  createdAt: string;
  updatedAt: string;
}

interface PartnerInfo {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  website: string | null;
  category: string | null;
  isLive: boolean;
}

const STATUS_ORDER = ["terminiert", "in_verhandlung", "wiedervorlage", "kontaktiert", "neu", "aktiv", "abgeschlossen", "pausiert", "abgelehnt"];

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; dropBg: string }> = {
  neu: { label: "Neu", color: "text-blue-800", bgColor: "bg-blue-500", dropBg: "bg-blue-50 border-blue-300" },
  kontaktiert: { label: "Kontaktiert", color: "text-purple-800", bgColor: "bg-purple-500", dropBg: "bg-purple-50 border-purple-300" },
  terminiert: { label: "Terminiert", color: "text-orange-800", bgColor: "bg-orange-500", dropBg: "bg-orange-50 border-orange-300" },
  in_verhandlung: { label: "In Verhandlung", color: "text-yellow-800", bgColor: "bg-yellow-500", dropBg: "bg-yellow-50 border-yellow-300" },
  wiedervorlage: { label: "Wiedervorlage", color: "text-cyan-800", bgColor: "bg-cyan-500", dropBg: "bg-cyan-50 border-cyan-300" },
  aktiv: { label: "Aktiv / Live", color: "text-green-800", bgColor: "bg-green-500", dropBg: "bg-green-50 border-green-300" },
  abgeschlossen: { label: "Abgeschlossen", color: "text-emerald-800", bgColor: "bg-emerald-600", dropBg: "bg-emerald-50 border-emerald-300" },
  abgelehnt: { label: "Abgelehnt", color: "text-red-800", bgColor: "bg-red-500", dropBg: "bg-red-50 border-red-300" },
  pausiert: { label: "Pausiert", color: "text-gray-800", bgColor: "bg-gray-400", dropBg: "bg-gray-50 border-gray-300" },
};

const AMPEL_CONFIG: Record<string, { label: string; emoji: string; className: string }> = {
  gruen: { label: "Grün", emoji: "🟢", className: "bg-green-100 text-green-800 border-green-300" },
  gelb: { label: "Gelb", emoji: "🟡", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  rot: { label: "Rot", emoji: "🔴", className: "bg-red-100 text-red-800 border-red-300" },
};

function formatDateShort(date: string | null) {
  if (!date) return "";
  return format(new Date(date), "dd.MM.yy");
}

export default function AdminSales() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("alle");
  const [categoryFilter, setCategoryFilter] = useState("alle");
  const [ampelFilter, setAmpelFilter] = useState("alle");
  const [assignedFilter, setAssignedFilter] = useState("alle");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SalesPipelineEntry | null>(null);
  const [inlineEdit, setInlineEdit] = useState<{ id: number; field: string } | null>(null);
  const [inlineValue, setInlineValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [partnerSearch, setPartnerSearch] = useState("");
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragDataRef = useRef<{ type: "entry" | "partner"; id: number } | null>(null);

  const { data: entries = [], isLoading } = useQuery<SalesPipelineEntry[]>({
    queryKey: ["/api/admin/sales"],
  });

  const { data: stats = [] } = useQuery<{ status: string; count: number }[]>({
    queryKey: ["/api/admin/sales/stats"],
  });

  const { data: availablePartners = [] } = useQuery<PartnerInfo[]>({
    queryKey: ["/api/admin/sales/available-partners"],
  });

  const { data: cities = [] } = useQuery<string[]>({ queryKey: ["/api/cities"] });

  const seedMutation = useMutation({
    mutationFn: async () => { await apiRequest("POST", "/api/admin/sales/seed"); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sales/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sales/available-partners"] });
      toast({ title: "Partner importiert", description: "Alle neuen Partner wurden in die Sales-Pipeline übernommen." });
    },
    onError: () => { toast({ title: "Fehler", description: "Import fehlgeschlagen", variant: "destructive" }); },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => { await apiRequest("POST", "/api/admin/sales", data); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sales/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sales/available-partners"] });
      toast({ title: "Eintrag erstellt", description: "Der neue Eintrag wurde erfolgreich gespeichert." });
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Fehler beim Erstellen", description: error?.message || "Bitte versuche es erneut.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => { await apiRequest("PATCH", `/api/admin/sales/${id}`, data); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sales/stats"] });
      toast({ title: "Gespeichert", description: "Änderungen wurden erfolgreich gespeichert." });
      setDialogOpen(false);
      setInlineEdit(null);
    },
    onError: (error: any) => {
      toast({ title: "Fehler beim Speichern", description: error?.message || "Bitte versuche es erneut.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/sales/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sales/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sales/available-partners"] });
      toast({ title: "Eintrag gelöscht" });
    },
  });

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!e.companyName.toLowerCase().includes(q) &&
          !(e.contactPerson || "").toLowerCase().includes(q) &&
          !(e.email || "").toLowerCase().includes(q) &&
          !(e.city || "").toLowerCase().includes(q) &&
          !(e.category || "").toLowerCase().includes(q)) return false;
      }
      if (cityFilter !== "alle" && e.city !== cityFilter) return false;
      if (categoryFilter !== "alle" && e.category !== categoryFilter) return false;
      if (ampelFilter !== "alle" && e.ampel !== ampelFilter) return false;
      if (assignedFilter !== "alle") {
        if (assignedFilter === "unassigned" && e.assignedTo) return false;
        if (assignedFilter !== "unassigned" && e.assignedTo !== assignedFilter) return false;
      }
      return true;
    });
  }, [entries, searchQuery, cityFilter, categoryFilter, ampelFilter, assignedFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, SalesPipelineEntry[]> = {};
    for (const s of STATUS_ORDER) groups[s] = [];
    for (const e of filtered) {
      if (!groups[e.status]) groups[e.status] = [];
      groups[e.status].push(e);
    }
    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [filtered]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    entries.forEach(e => { if (e.category) cats.add(e.category); });
    return Array.from(cats).sort();
  }, [entries]);

  const assignees = useMemo(() => {
    const set = new Set<string>();
    entries.forEach(e => { if (e.assignedTo) set.add(e.assignedTo); });
    return Array.from(set).sort();
  }, [entries]);

  const filteredPartners = useMemo(() => {
    if (!partnerSearch) return availablePartners;
    const q = partnerSearch.toLowerCase();
    return availablePartners.filter(p =>
      p.companyName.toLowerCase().includes(q) ||
      (p.city || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      p.contactPerson.toLowerCase().includes(q)
    );
  }, [availablePartners, partnerSearch]);

  function toggleGroup(status: string) {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  const emptyForm = {
    companyName: "", contactPerson: "", email: "", phone: "", address: "", city: "",
    website: "", category: "", status: "neu", priority: "mittel", ampel: "gelb",
    terminiert: "", wiedervorlage: "", assignedTo: "", notes: "", source: "", dealValue: "",
  };
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditingEntry(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(entry: SalesPipelineEntry) {
    setEditingEntry(entry);
    setForm({
      companyName: entry.companyName,
      contactPerson: entry.contactPerson || "",
      email: entry.email || "",
      phone: entry.phone || "",
      address: entry.address || "",
      city: entry.city || "",
      website: entry.website || "",
      category: entry.category || "",
      status: entry.status,
      priority: entry.priority || "mittel",
      ampel: entry.ampel || "gelb",
      terminiert: entry.terminiert ? new Date(entry.terminiert).toISOString().split("T")[0] : "",
      wiedervorlage: entry.wiedervorlage ? new Date(entry.wiedervorlage).toISOString().split("T")[0] : "",
      assignedTo: entry.assignedTo || "",
      notes: entry.notes || "",
      source: entry.source || "",
      dealValue: entry.dealValue != null ? String(entry.dealValue) : "",
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!form.companyName.trim()) return;
    const payload: any = {
      companyName: form.companyName,
      contactPerson: form.contactPerson || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      city: form.city || null,
      website: form.website || null,
      category: form.category || null,
      status: form.status,
      priority: form.priority,
      ampel: form.ampel,
      terminiert: form.terminiert || null,
      wiedervorlage: form.wiedervorlage || null,
      assignedTo: form.assignedTo || null,
      notes: form.notes || null,
      source: form.source || null,
      dealValue: form.dealValue ? parseFloat(form.dealValue) : null,
    };
    if (editingEntry) updateMutation.mutate({ id: editingEntry.id, data: payload });
    else createMutation.mutate(payload);
  }

  function handleInlineStatusChange(id: number, newStatus: string) {
    updateMutation.mutate({ id, data: { status: newStatus } });
  }

  function handleInlineAmpelChange(id: number, newAmpel: string) {
    updateMutation.mutate({ id, data: { ampel: newAmpel } });
  }

  function startInlineEdit(id: number, field: string, currentValue: string) {
    setInlineEdit({ id, field });
    setInlineValue(currentValue);
  }

  const handleDragStartEntry = useCallback((e: React.DragEvent, entryId: number) => {
    dragDataRef.current = { type: "entry", id: entryId };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `entry:${entryId}`);
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "0.5";
    setIsDragging(true);
  }, []);

  const handleDragStartPartner = useCallback((e: React.DragEvent, partnerId: number) => {
    dragDataRef.current = { type: "partner", id: partnerId };
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", `partner:${partnerId}`);
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "0.5";
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "1";
    setDragOverStatus(null);
    setIsDragging(false);
    dragDataRef.current = null;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = dragDataRef.current?.type === "partner" ? "copy" : "move";
    setDragOverStatus(status);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const related = e.relatedTarget as HTMLElement | null;
    if (!related || !e.currentTarget.contains(related)) {
      setDragOverStatus(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOverStatus(null);
    const dragData = dragDataRef.current;
    if (!dragData) return;

    if (dragData.type === "entry") {
      const entry = entries.find(en => en.id === dragData.id);
      if (entry && entry.status !== targetStatus) {
        updateMutation.mutate({ id: dragData.id, data: { status: targetStatus } });
      }
    } else if (dragData.type === "partner") {
      const partner = availablePartners.find(p => p.id === dragData.id);
      if (partner) {
        createMutation.mutate({
          partnerId: partner.id,
          companyName: partner.companyName,
          contactPerson: partner.contactPerson,
          email: partner.email,
          phone: partner.phone,
          address: partner.address,
          city: partner.city,
          website: partner.website,
          category: partner.category,
          status: targetStatus,
          source: "Partner-Import (Drag & Drop)",
        });
      }
    }
    dragDataRef.current = null;
  }, [entries, availablePartners, updateMutation, createMutation]);

  function addPartnerToBoard(partner: PartnerInfo, status: string = "neu") {
    createMutation.mutate({
      partnerId: partner.id,
      companyName: partner.companyName,
      contactPerson: partner.contactPerson,
      email: partner.email,
      phone: partner.phone,
      address: partner.address,
      city: partner.city,
      website: partner.website,
      category: partner.category,
      status,
      source: "Partner-Import",
    });
  }

  const totalEntries = entries.length;
  const activeEntries = entries.filter(e => e.status === "aktiv").length;
  const terminatedEntries = entries.filter(e => e.status === "terminiert").length;
  const hasFilters = searchQuery || cityFilter !== "alle" || categoryFilter !== "alle" || ampelFilter !== "alle" || assignedFilter !== "alle";

  return (
    <AdminLayout>
    <div className="flex h-full">
      <div className={`flex-1 space-y-4 transition-all duration-300 ${sidebarOpen ? "mr-0" : ""}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="h-8 w-8" />
              Vertrieb / Sales Board
            </h1>
            <p className="text-muted-foreground mt-1">{totalEntries} Einträge | {terminatedEntries} terminiert | {activeEntries} aktiv</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
              <Download className="h-4 w-4 mr-2" />
              {seedMutation.isPending ? "Importiere..." : `Alle importieren${availablePartners.length > 0 ? ` (${availablePartners.length})` : ""}`}
            </Button>
            <Button variant="outline" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <PanelRightClose className="h-4 w-4 mr-2" /> : <PanelRightOpen className="h-4 w-4 mr-2" />}
              Partner-Liste {availablePartners.length > 0 && <Badge variant="secondary" className="ml-1">{availablePartners.length}</Badge>}
            </Button>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Neuer Eintrag</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { key: "neu", label: "Neu", icon: CircleDot, color: "text-blue-600" },
            { key: "terminiert", label: "Terminiert", icon: CalendarDays, color: "text-orange-600" },
            { key: "in_verhandlung", label: "Verhandlung", icon: Users, color: "text-yellow-600" },
            { key: "aktiv", label: "Aktiv", icon: CheckCircle2, color: "text-green-600" },
            { key: "abgelehnt", label: "Abgelehnt", icon: XCircle, color: "text-red-600" },
          ].map(item => {
            const count = stats.find(s => s.status === item.key)?.count || 0;
            return (
              <Card key={item.key} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCollapsedGroups(new Set())}>
                <CardContent className="p-3 flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <div>
                    <div className="text-lg font-bold">{count}</div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Einträge durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Stadt" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Städte</SelectItem>
              {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Kategorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Kategorien</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={ampelFilter} onValueChange={setAmpelFilter}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Ampel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Ampeln</SelectItem>
              <SelectItem value="gruen">🟢 Grün</SelectItem>
              <SelectItem value="gelb">🟡 Gelb</SelectItem>
              <SelectItem value="rot">🔴 Rot</SelectItem>
            </SelectContent>
          </Select>
          <Select value={assignedFilter} onValueChange={setAssignedFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Zuständig" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle</SelectItem>
              <SelectItem value="unassigned">Nicht zugewiesen</SelectItem>
              {assignees.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={() => {
              setSearchQuery(""); setCityFilter("alle"); setCategoryFilter("alle"); setAmpelFilter("alle"); setAssignedFilter("alle");
            }}>Filter zurücksetzen</Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Laden...</div>
        ) : totalEntries === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Noch keine Einträge</h3>
              <p className="text-muted-foreground mb-4">Importiere alle bestehenden Partner oder öffne die Partner-Liste rechts, um einzelne Partner per Drag & Drop hinzuzufügen.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
                  <Download className="h-4 w-4 mr-2" />
                  {seedMutation.isPending ? "Importiere..." : "Alle Partner importieren"}
                </Button>
                <Button variant="outline" onClick={() => setSidebarOpen(true)}>
                  <PanelRightOpen className="h-4 w-4 mr-2" />
                  Partner-Liste öffnen
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {STATUS_ORDER.map(status => {
              const items = grouped.find(([s]) => s === status)?.[1] || [];
              const config = STATUS_CONFIG[status] || { label: status, color: "text-gray-800", bgColor: "bg-gray-400", dropBg: "bg-gray-50 border-gray-300" };
              const isCollapsed = collapsedGroups.has(status);
              const isStatusDragOver = dragOverStatus === status;

              if (items.length === 0 && !isDragging) return null;

              return (
                <Card
                  key={status}
                  className={`overflow-hidden transition-all duration-200 ${isStatusDragOver ? `border-2 border-dashed ${config.dropBg} shadow-lg` : "border"}`}
                  onDragOver={(e) => handleDragOver(e, status)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  <button
                    onClick={() => toggleGroup(status)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                  >
                    <div className={`w-1.5 h-8 rounded-full ${config.bgColor}`} />
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className={`font-semibold ${config.color}`}>{config.label}</span>
                    <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                    {isStatusDragOver && (
                      <span className="text-xs text-muted-foreground ml-auto animate-pulse">
                        Hier ablegen um Status zu "{config.label}" zu ändern
                      </span>
                    )}
                  </button>

                  {!isCollapsed && items.length > 0 && (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="w-[30px]"></TableHead>
                            <TableHead className="w-[30px]"></TableHead>
                            <TableHead className="min-w-[200px]">Kontakt</TableHead>
                            <TableHead className="min-w-[100px]">Kategorie</TableHead>
                            <TableHead className="min-w-[140px]">Telefon</TableHead>
                            <TableHead className="min-w-[180px]">E-Mail</TableHead>
                            <TableHead className="min-w-[100px]">Stadt</TableHead>
                            <TableHead className="min-w-[90px]">Terminiert</TableHead>
                            <TableHead className="min-w-[90px]">Wiedervorlage</TableHead>
                            <TableHead className="min-w-[70px]">Ampel</TableHead>
                            <TableHead className="min-w-[100px]">Status</TableHead>
                            <TableHead className="min-w-[100px]">Zuständig</TableHead>
                            <TableHead className="w-[60px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map(entry => (
                            <TableRow
                              key={entry.id}
                              className="group hover:bg-muted/20 cursor-grab active:cursor-grabbing"
                              draggable
                              onDragStart={(e) => handleDragStartEntry(e, entry.id)}
                              onDragEnd={handleDragEnd}
                              onClick={() => openEdit(entry)}
                            >
                              <TableCell className="px-1">
                                <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground" />
                              </TableCell>
                              <TableCell className="text-center px-1">
                                {entry.ampel && (
                                  <span className="text-sm">{AMPEL_CONFIG[entry.ampel]?.emoji || "⚪"}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-sm">{entry.companyName}</div>
                                {entry.contactPerson && (
                                  <div className="text-xs text-muted-foreground">{entry.contactPerson}</div>
                                )}
                              </TableCell>
                              <TableCell>
                                {entry.category && <Badge variant="outline" className="text-xs">{entry.category}</Badge>}
                              </TableCell>
                              <TableCell className="text-sm">
                                {entry.phone ? (
                                  <a href={`tel:${entry.phone}`} onClick={(e) => e.stopPropagation()} className="hover:text-primary flex items-center gap-1">
                                    <Phone className="h-3 w-3" />{entry.phone}
                                  </a>
                                ) : "–"}
                              </TableCell>
                              <TableCell className="text-sm">
                                {entry.email ? (
                                  <a href={`mailto:${entry.email}`} onClick={(e) => e.stopPropagation()} className="hover:text-primary truncate max-w-[180px] block">
                                    {entry.email}
                                  </a>
                                ) : "–"}
                              </TableCell>
                              <TableCell className="text-sm">{entry.city || "–"}</TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                {inlineEdit?.id === entry.id && inlineEdit?.field === "terminiert" ? (
                                  <Input
                                    type="date"
                                    autoFocus
                                    value={inlineValue}
                                    onChange={(e) => setInlineValue(e.target.value)}
                                    onBlur={() => { updateMutation.mutate({ id: entry.id, data: { terminiert: inlineValue || null } }); setInlineEdit(null); }}
                                    onKeyDown={(e) => { if (e.key === "Enter") { updateMutation.mutate({ id: entry.id, data: { terminiert: inlineValue || null } }); setInlineEdit(null); } }}
                                    className="h-7 text-xs w-[120px]"
                                  />
                                ) : (
                                  <button
                                    className="text-xs font-mono hover:bg-muted px-1 py-0.5 rounded w-full text-left"
                                    onClick={() => startInlineEdit(entry.id, "terminiert", entry.terminiert ? new Date(entry.terminiert).toISOString().split("T")[0] : "")}
                                  >
                                    {formatDateShort(entry.terminiert) || <span className="text-muted-foreground">+ Termin</span>}
                                  </button>
                                )}
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                {inlineEdit?.id === entry.id && inlineEdit?.field === "wiedervorlage" ? (
                                  <Input
                                    type="date"
                                    autoFocus
                                    value={inlineValue}
                                    onChange={(e) => setInlineValue(e.target.value)}
                                    onBlur={() => { updateMutation.mutate({ id: entry.id, data: { wiedervorlage: inlineValue || null } }); setInlineEdit(null); }}
                                    onKeyDown={(e) => { if (e.key === "Enter") { updateMutation.mutate({ id: entry.id, data: { wiedervorlage: inlineValue || null } }); setInlineEdit(null); } }}
                                    className="h-7 text-xs w-[120px]"
                                  />
                                ) : (
                                  <button
                                    className="text-xs font-mono hover:bg-muted px-1 py-0.5 rounded w-full text-left"
                                    onClick={() => startInlineEdit(entry.id, "wiedervorlage", entry.wiedervorlage ? new Date(entry.wiedervorlage).toISOString().split("T")[0] : "")}
                                  >
                                    {formatDateShort(entry.wiedervorlage) || <span className="text-muted-foreground">+ Datum</span>}
                                  </button>
                                )}
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Select
                                  value={entry.ampel || "gelb"}
                                  onValueChange={(v) => handleInlineAmpelChange(entry.id, v)}
                                >
                                  <SelectTrigger className="h-7 w-[70px] text-xs border-0 shadow-none p-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="gruen">🟢</SelectItem>
                                    <SelectItem value="gelb">🟡</SelectItem>
                                    <SelectItem value="rot">🔴</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Select
                                  value={entry.status}
                                  onValueChange={(v) => handleInlineStatusChange(entry.id, v)}
                                >
                                  <SelectTrigger className="h-7 w-[120px] text-xs border-0 shadow-none p-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                      <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                {inlineEdit?.id === entry.id && inlineEdit?.field === "assignedTo" ? (
                                  <Input
                                    autoFocus
                                    value={inlineValue}
                                    onChange={(e) => setInlineValue(e.target.value)}
                                    onBlur={() => { updateMutation.mutate({ id: entry.id, data: { assignedTo: inlineValue || null } }); setInlineEdit(null); }}
                                    onKeyDown={(e) => { if (e.key === "Enter") { updateMutation.mutate({ id: entry.id, data: { assignedTo: inlineValue || null } }); setInlineEdit(null); } }}
                                    className="h-7 text-xs w-[100px]"
                                    placeholder="Name"
                                  />
                                ) : (
                                  <button
                                    className="text-xs hover:bg-muted px-1 py-0.5 rounded w-full text-left"
                                    onClick={() => startInlineEdit(entry.id, "assignedTo", entry.assignedTo || "")}
                                  >
                                    {entry.assignedTo || <span className="text-muted-foreground">+ Seller</span>}
                                  </button>
                                )}
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(entry)}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => {
                                    if (confirm("Eintrag löschen?")) deleteMutation.mutate(entry.id);
                                  }}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {items.length === 0 && (
                    <div className="px-4 pb-3">
                      <div className={`border-2 border-dashed rounded-lg text-center text-sm text-muted-foreground transition-all ${isStatusDragOver ? "p-6 bg-accent/30" : "p-3"}`}>
                        {isStatusDragOver ? "Partner hier ablegen" : "Leer — Partner hierher ziehen"}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}

            {filtered.length === 0 && totalEntries > 0 && (
              <div className="text-center py-12 text-muted-foreground">Keine Einträge für die gewählten Filter</div>
            )}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEntry ? `${editingEntry.companyName} bearbeiten` : "Neuer Eintrag"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Firma / Partner *</Label><Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="mt-1" /></div>
                <div><Label>Kontaktperson</Label><Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>E-Mail</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" /></div>
                <div><Label>Telefon</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Adresse</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" /></div>
                <div><Label>Stadt</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Website</Label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="mt-1" /></div>
                <div><Label>Kategorie</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1" placeholder="z.B. Bowling, Zoo, Kino" /></div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ampel</Label>
                  <Select value={form.ampel} onValueChange={(v) => setForm({ ...form, ampel: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gruen">🟢 Grün</SelectItem>
                      <SelectItem value="gelb">🟡 Gelb</SelectItem>
                      <SelectItem value="rot">🔴 Rot</SelectItem>
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
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Terminiert</Label><Input type="date" value={form.terminiert} onChange={(e) => setForm({ ...form, terminiert: e.target.value })} className="mt-1" /></div>
                <div><Label>Wiedervorlage</Label><Input type="date" value={form.wiedervorlage} onChange={(e) => setForm({ ...form, wiedervorlage: e.target.value })} className="mt-1" /></div>
                <div><Label>Zuständig (Seller)</Label><Input value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="mt-1" placeholder="Name" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Quelle</Label><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="mt-1" placeholder="z.B. Kaltakquise, Empfehlung" /></div>
                <div><Label>Deal-Wert (€)</Label><Input type="number" value={form.dealValue} onChange={(e) => setForm({ ...form, dealValue: e.target.value })} className="mt-1" /></div>
              </div>
              <div><Label>Notizen</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1" rows={3} placeholder="Interne Notizen zum Kontakt..." /></div>

              {editingEntry?.website && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-3">
                  <Globe className="h-4 w-4" />
                  <a href={editingEntry.website.startsWith("http") ? editingEntry.website : `https://${editingEntry.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-1">
                    {editingEntry.website} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
              <Button onClick={handleSubmit} disabled={!form.companyName || createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? "Speichere..." : editingEntry ? "Aktualisieren" : "Erstellen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sidebarOpen && (
        <div className="w-80 border-l bg-background flex flex-col ml-4 shrink-0">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Verfügbare Partner
              </h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSidebarOpen(false)}>
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Partner suchen..."
                value={partnerSearch}
                onChange={(e) => setPartnerSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {filteredPartners.length} Partner verfügbar — per Drag & Drop in eine Status-Gruppe ziehen
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredPartners.map(partner => (
                <div
                  key={partner.id}
                  draggable
                  onDragStart={(e) => handleDragStartPartner(e, partner.id)}
                  onDragEnd={handleDragEnd}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-grab active:cursor-grabbing transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{partner.companyName}</div>
                      <div className="text-xs text-muted-foreground truncate">{partner.contactPerson}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {partner.city && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />{partner.city}
                          </span>
                        )}
                        {partner.category && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0">{partner.category}</Badge>
                        )}
                        {partner.isLive && (
                          <Badge className="text-[10px] px-1 py-0 bg-green-100 text-green-800 border-green-300">Live</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        addPartnerToBoard(partner);
                      }}
                      title="Zum Board hinzufügen"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredPartners.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  {availablePartners.length === 0 ? "Alle Partner sind bereits im Board" : "Keine Partner gefunden"}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
    </AdminLayout>
  );
}
