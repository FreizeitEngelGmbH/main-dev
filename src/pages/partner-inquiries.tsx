import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, getPartnerInquiryById } from "@/partner-demo/queryClient";
import {
  Inbox, Mail, Phone, Calendar, Users, Clock, MessageSquare, Send, FileText,
  AlertCircle, CheckCircle2, XCircle, Trophy, Tag, Filter, ArrowLeft, Sparkles,
  Building2, Cake, GraduationCap, Briefcase, Plus, Edit, Trash2, BookmarkPlus,
  Search, MoreVertical, ChevronRight, Zap, Hourglass, FileSignature, ThumbsUp, ThumbsDown
} from "lucide-react";

// DEMO: this is the real, verbatim FreizeitEngel partner-inquiries.tsx from
// client/src/pages/partner/partner-inquiries.tsx, with exactly two changes -
// both confined to how data is fetched, none to markup/structure/behavior:
//   1. inquiriesQuery no longer has its own fetch()-based queryFn; it falls
//      through to the mock getQueryFn already wired up in "@/partner-demo/queryClient".
//   2. InquiryDetailSheet's detail queryFn calls the local, synchronous
//      getPartnerInquiryById() helper instead of fetch()-ing the API.
// Every mutation (reply, status/priority/notes, templates CRUD) still goes
// through the same apiRequest() calls as the real file - only the mock
// backend behind that chokepoint (queryClient.ts) is local instead of live.

const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  general: { label: "Allgemein", icon: MessageSquare, color: "bg-slate-100 text-slate-700" },
  kindergeburtstag: { label: "Kindergeburtstag", icon: Cake, color: "bg-pink-100 text-pink-700" },
  schulklasse: { label: "Schulklasse", icon: GraduationCap, color: "bg-blue-100 text-blue-700" },
  firmenevent: { label: "Firmenevent", icon: Briefcase, color: "bg-amber-100 text-amber-700" },
  gruppe: { label: "Gruppe", icon: Users, color: "bg-emerald-100 text-emerald-700" },
};

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: "Neu", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Sparkles },
  in_progress: { label: "In Bearbeitung", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Hourglass },
  quoted: { label: "Angebot gesendet", color: "bg-amber-100 text-amber-700 border-amber-200", icon: FileSignature },
  won: { label: "Gewonnen", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: ThumbsUp },
  lost: { label: "Abgelehnt", color: "bg-rose-100 text-rose-700 border-rose-200", icon: ThumbsDown },
  closed: { label: "Geschlossen", color: "bg-gray-100 text-gray-600 border-gray-200", icon: XCircle },
};

const STATUS_ORDER = ["new", "in_progress", "quoted", "won", "lost", "closed"];

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  low: { label: "Niedrig", color: "bg-gray-100 text-gray-600" },
  normal: { label: "Normal", color: "bg-blue-50 text-blue-600" },
  high: { label: "Hoch", color: "bg-rose-100 text-rose-700" },
};

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  const now = new Date();
  const diffH = (now.getTime() - date.getTime()) / 3600000;
  if (diffH < 1) return `vor ${Math.max(1, Math.round(diffH * 60))} Min`;
  if (diffH < 24) return `vor ${Math.round(diffH)} Std`;
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function initials(name: string): string {
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function PartnerInquiries() {
  const { toast } = useToast();
  const [view, setView] = useState<"pipeline" | "list">("pipeline");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const inquiriesQuery = useQuery<any[]>({
    queryKey: ["/api/partner/inquiries", filterType, filterStatus],
    refetchInterval: 30000,
  });

  const statsQuery = useQuery<any>({
    queryKey: ["/api/partner/inquiries/stats"],
    refetchInterval: 30000,
  });

  const templatesQuery = useQuery<any[]>({
    queryKey: ["/api/partner/inquiry-templates"],
  });

  const inquiries = (inquiriesQuery.data || []).filter((i: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [i.contactName, i.contactEmail, i.subject, i.message].some(s => s?.toLowerCase().includes(q));
  });

  const stats = statsQuery.data || { new: 0, in_progress: 0, quoted: 0, won: 0, lost: 0, total: 0, avgResponseTimeHours: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/partner/dashboard">
              <Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" />Zum Dashboard</Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-2">
                <Inbox className="h-7 w-7 text-purple-600" />
                Anfragemanagement
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Verwalten Sie eingehende Anfragen aus allen Kanälen — schnell, übersichtlich, ohne Mailchaos.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setTemplateDialogOpen(true)} className="gap-1">
              <FileText className="h-4 w-4" /> Antwortvorlagen
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <StatCard label="Neu" value={stats.new} color="purple" icon={Sparkles} />
          <StatCard label="In Bearbeitung" value={stats.in_progress} color="blue" icon={Hourglass} />
          <StatCard label="Angebot gesendet" value={stats.quoted} color="amber" icon={FileSignature} />
          <StatCard label="Gewonnen" value={stats.won} color="emerald" icon={ThumbsUp} />
          <StatCard label="Ø Antwortzeit" value={`${stats.avgResponseTimeHours}h`} color="cyan" icon={Clock} />
          <StatCard label="Gesamt" value={stats.total} color="slate" icon={Inbox} />
        </div>

        {/* Filters */}
        <Card className="mb-4 border-0 shadow-sm">
          <CardContent className="p-3 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="Suche nach Name, E-Mail, Betreff…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Anfragearten</SelectItem>
                {Object.entries(TYPE_META).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                {STATUS_ORDER.map(k => (
                  <SelectItem key={k} value={k}>{STATUS_META[k].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs value={view} onValueChange={(v) => setView(v as any)}>
              <TabsList className="h-9">
                <TabsTrigger value="pipeline" className="text-xs">Pipeline</TabsTrigger>
                <TabsTrigger value="list" className="text-xs">Liste</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Body */}
        {inquiriesQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-40" />)}
          </div>
        ) : inquiries.length === 0 ? (
          <EmptyState />
        ) : view === "pipeline" ? (
          <PipelineBoard inquiries={inquiries} onSelect={setSelectedId} />
        ) : (
          <ListView inquiries={inquiries} onSelect={setSelectedId} />
        )}

        {/* Detail Sheet */}
        <InquiryDetailSheet
          inquiryId={selectedId}
          open={!!selectedId}
          onClose={() => setSelectedId(null)}
          templates={templatesQuery.data || []}
        />

        {/* Templates Dialog */}
        <TemplatesDialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} templates={templatesQuery.data || []} />
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }: any) {
  const colorMap: any = {
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
  };
  return (
    <Card className={`border ${colorMap[color]}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <Icon className="h-4 w-4 opacity-70" />
          <div className="text-2xl font-black">{value}</div>
        </div>
        <div className="text-xs font-semibold mt-1 opacity-80">{label}</div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="p-12 text-center">
        <Inbox className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Noch keine Anfragen</h3>
        <p className="text-sm text-gray-500 mb-4">Sobald Nutzer auf Ihrer Partnerseite eine Anfrage senden, erscheinen sie hier.</p>
        <p className="text-xs text-gray-400">Tipp: Pflegen Sie Ihre Antwortvorlagen, um in wenigen Klicks zu antworten.</p>
      </CardContent>
    </Card>
  );
}

function PipelineBoard({ inquiries, onSelect }: { inquiries: any[]; onSelect: (id: number) => void }) {
  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    STATUS_ORDER.forEach(s => g[s] = []);
    inquiries.forEach(i => { (g[i.status] || (g[i.status] = [])).push(i); });
    return g;
  }, [inquiries]);

  const visibleColumns = STATUS_ORDER.filter(s => s !== "closed" || grouped["closed"]?.length > 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {visibleColumns.slice(0, 5).map(status => {
        const meta = STATUS_META[status];
        const Icon = meta.icon;
        return (
          <div key={status} className="flex flex-col">
            <div className={`flex items-center justify-between p-2 rounded-t-lg border-b-2 ${meta.color.replace("bg-", "border-").split(" ")[0]} bg-white`}>
              <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                <span className="font-semibold text-xs">{meta.label}</span>
              </div>
              <Badge variant="secondary" className="text-xs h-5">{grouped[status].length}</Badge>
            </div>
            <div className="bg-gray-50/50 rounded-b-lg p-2 space-y-2 min-h-[200px] flex-1">
              {grouped[status].map(i => <InquiryCard key={i.id} inquiry={i} onClick={() => onSelect(i.id)} />)}
              {grouped[status].length === 0 && (
                <div className="text-center text-xs text-gray-400 py-8">Keine Einträge</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InquiryCard({ inquiry, onClick }: { inquiry: any; onClick: () => void }) {
  const typeMeta = TYPE_META[inquiry.type] || TYPE_META.general;
  const TypeIcon = typeMeta.icon;
  const isUnread = inquiry.status === "new" && !inquiry.respondedAt;
  return (
    <Card className={`cursor-pointer hover:shadow-md transition-shadow border ${isUnread ? "border-purple-300 ring-1 ring-purple-200" : ""}`} onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge className={`${typeMeta.color} border-0 text-[10px] px-1.5 py-0`}>
            <TypeIcon className="h-2.5 w-2.5 mr-1" />
            {typeMeta.label}
          </Badge>
          {inquiry.priority === "high" && (
            <Badge className="bg-rose-100 text-rose-700 border-0 text-[10px] px-1.5 py-0">
              <AlertCircle className="h-2.5 w-2.5 mr-0.5" /> Hoch
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px] bg-purple-100 text-purple-700">{initials(inquiry.contactName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{inquiry.contactName}</div>
            <div className="text-[11px] text-gray-500 truncate">{inquiry.contactEmail}</div>
          </div>
        </div>
        <div className="text-xs text-gray-700 line-clamp-2 mb-2">{inquiry.subject || inquiry.message}</div>
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(inquiry.createdAt)}</span>
          {inquiry.replyCount > 0 && <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {inquiry.replyCount}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function ListView({ inquiries, onSelect }: { inquiries: any[]; onSelect: (id: number) => void }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="divide-y">
          {inquiries.map(i => {
            const typeMeta = TYPE_META[i.type] || TYPE_META.general;
            const statusMeta = STATUS_META[i.status] || STATUS_META.new;
            return (
              <div key={i.id} className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4" onClick={() => onSelect(i.id)}>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-purple-100 text-purple-700 text-sm">{initials(i.contactName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-semibold text-sm">{i.contactName}</span>
                    <Badge className={`${typeMeta.color} border-0 text-[10px] px-1.5 py-0`}>{typeMeta.label}</Badge>
                    <Badge className={`${statusMeta.color} border text-[10px] px-1.5 py-0`}>{statusMeta.label}</Badge>
                    {i.priority === "high" && <Badge className="bg-rose-100 text-rose-700 border-0 text-[10px] px-1.5 py-0">Hoch</Badge>}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{i.subject || i.message}</div>
                </div>
                <div className="text-right text-xs text-gray-400 hidden sm:block">
                  <div>{formatDate(i.createdAt)}</div>
                  {i.replyCount > 0 && <div className="flex items-center gap-1 justify-end mt-0.5"><MessageSquare className="h-3 w-3" /> {i.replyCount}</div>}
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function InquiryDetailSheet({ inquiryId, open, onClose, templates }: { inquiryId: number | null; open: boolean; onClose: () => void; templates: any[] }) {
  const { toast } = useToast();
  const [reply, setReply] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [internalNotes, setInternalNotes] = useState("");
  const [notesDirty, setNotesDirty] = useState(false);

  const detail = useQuery<any>({
    queryKey: ["/api/partner/inquiries", inquiryId],
    enabled: !!inquiryId,
    queryFn: async () => {
      const d = getPartnerInquiryById(inquiryId!);
      setInternalNotes(d.internalNotes || "");
      setNotesDirty(false);
      setNewStatus("");
      return d;
    },
  });

  const inquiry = detail.data;
  const typeMeta = inquiry ? (TYPE_META[inquiry.type] || TYPE_META.general) : null;
  const statusMeta = inquiry ? (STATUS_META[inquiry.status] || STATUS_META.new) : null;

  const replyMutation = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", `/api/partner/inquiries/${inquiryId}/reply`, {
        message: reply,
        isInternal,
        newStatus: newStatus || undefined,
      });
      if (!r.ok) throw new Error("Fehler beim Senden");
      return r.json();
    },
    onSuccess: () => {
      toast({ title: isInternal ? "Notiz gespeichert" : "Antwort gesendet", description: isInternal ? "Interne Notiz wurde dem Vorgang hinzugefügt." : "Die Antwort wurde per E-Mail an den Anfragenden zugestellt." });
      setReply(""); setIsInternal(false); setNewStatus("");
      queryClient.invalidateQueries({ queryKey: ["/api/partner/inquiries", inquiryId] });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/inquiries/stats"] });
    },
    onError: () => toast({ title: "Fehler", description: "Bitte erneut versuchen.", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async (patch: any) => {
      const r = await apiRequest("PATCH", `/api/partner/inquiries/${inquiryId}`, patch);
      if (!r.ok) throw new Error();
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partner/inquiries", inquiryId] });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/inquiries/stats"] });
      setNotesDirty(false);
    },
  });

  if (!inquiry && !detail.isLoading) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {detail.isLoading || !inquiry ? (
          <div className="space-y-3"><Skeleton className="h-12" /><Skeleton className="h-32" /><Skeleton className="h-48" /></div>
        ) : (
          <>
            <SheetHeader className="pb-4 border-b">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-purple-100 text-purple-700">{initials(inquiry.contactName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-lg">{inquiry.contactName}</SheetTitle>
                  <SheetDescription className="text-xs space-y-0.5">
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge className={`${typeMeta!.color} border-0 text-[10px]`}>{typeMeta!.label}</Badge>
                      <Badge className={`${statusMeta!.color} border text-[10px]`}>{statusMeta!.label}</Badge>
                      <Badge className={`${PRIORITY_META[inquiry.priority || "normal"].color} border-0 text-[10px]`}>Priorität: {PRIORITY_META[inquiry.priority || "normal"].label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs">
                      <a href={`mailto:${inquiry.contactEmail}`} className="hover:underline flex items-center gap-1"><Mail className="h-3 w-3" /> {inquiry.contactEmail}</a>
                      {inquiry.contactPhone && <a href={`tel:${inquiry.contactPhone}`} className="hover:underline flex items-center gap-1"><Phone className="h-3 w-3" /> {inquiry.contactPhone}</a>}
                    </div>
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="py-4 space-y-4">
              {/* Quick Status / Priorität */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-500">Status ändern</Label>
                  <Select value={inquiry.status} onValueChange={(v) => updateMutation.mutate({ status: v })}>
                    <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_ORDER.map(s => <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Priorität</Label>
                  <Select value={inquiry.priority || "normal"} onValueChange={(v) => updateMutation.mutate({ priority: v })}>
                    <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Niedrig</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Hoch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Anfrage-Details */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Anfrage-Details</CardTitle></CardHeader>
                <CardContent className="text-xs space-y-1.5">
                  {inquiry.subject && <DetailRow label="Betreff" value={inquiry.subject} />}
                  {inquiry.preferredDate && <DetailRow label="Wunschtermin" value={inquiry.preferredDate} />}
                  {inquiry.alternativeDate && <DetailRow label="Alternativtermin" value={inquiry.alternativeDate} />}
                  {inquiry.preferredTime && <DetailRow label="Uhrzeit" value={inquiry.preferredTime} />}
                  {inquiry.groupSize && <DetailRow label="Gruppengröße" value={inquiry.groupSize} />}
                  {inquiry.childrenAge && <DetailRow label="Alter Kinder" value={inquiry.childrenAge} />}
                  {inquiry.schoolName && <DetailRow label="Schule" value={inquiry.schoolName} />}
                  {inquiry.className && <DetailRow label="Klasse" value={inquiry.className} />}
                  {inquiry.companyName && <DetailRow label="Firma" value={inquiry.companyName} />}
                  {inquiry.budget && <DetailRow label="Budget" value={inquiry.budget} />}
                  {inquiry.cateringWished && <DetailRow label="Catering gewünscht" value="Ja" />}
                  {inquiry.specialRequests && <DetailRow label="Sonderwünsche" value={inquiry.specialRequests} />}
                  <div className="pt-2 mt-2 border-t">
                    <div className="text-[10px] uppercase font-semibold text-gray-500 mb-1">Originalnachricht</div>
                    <div className="bg-gray-50 p-3 rounded text-xs whitespace-pre-wrap">{inquiry.message}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Verlauf */}
              {inquiry.replies && inquiry.replies.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-gray-500 font-semibold">Verlauf</Label>
                  {inquiry.replies.map((r: any) => (
                    <div key={r.id} className={`p-3 rounded-lg text-xs ${r.fromType === "partner" ? "bg-purple-50 border border-purple-100" : "bg-gray-50 border"} ${r.isInternal ? "ring-1 ring-amber-200 bg-amber-50" : ""}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-gray-700 flex items-center gap-1">
                          {r.isInternal ? <Tag className="h-3 w-3 text-amber-600" /> : <MessageSquare className="h-3 w-3" />}
                          {r.authorName} {r.isInternal && <span className="text-amber-600 text-[10px]">(intern)</span>}
                        </div>
                        <span className="text-[10px] text-gray-400">{formatDate(r.createdAt)}</span>
                      </div>
                      <div className="whitespace-pre-wrap text-gray-700">{r.message}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Antwort schreiben */}
              <Card className="border-purple-200">
                <CardHeader className="pb-2 flex-row items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-1"><Send className="h-4 w-4" /> Antworten</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="internal" className="text-xs cursor-pointer text-amber-700">Interne Notiz</Label>
                    <Switch id="internal" checked={isInternal} onCheckedChange={setIsInternal} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {templates.length > 0 && !isInternal && (
                    <Select onValueChange={(v) => {
                      const t = templates.find(x => String(x.id) === v);
                      if (t) setReply(t.body);
                    }}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Vorlage einfügen…" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                  <Textarea
                    placeholder={isInternal ? "Interne Notiz (nur für Sie sichtbar)…" : `Antwort an ${inquiry.contactName}…`}
                    rows={5}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  {!isInternal && (
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500 whitespace-nowrap">Status setzen auf:</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Unverändert" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                          <SelectItem value="quoted">Angebot gesendet</SelectItem>
                          <SelectItem value="won">Gewonnen</SelectItem>
                          <SelectItem value="lost">Abgelehnt</SelectItem>
                          <SelectItem value="closed">Geschlossen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button
                    onClick={() => replyMutation.mutate()}
                    disabled={!reply.trim() || replyMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700 gap-1"
                  >
                    {replyMutation.isPending ? "Sende…" : isInternal ? <><Tag className="h-4 w-4" /> Notiz speichern</> : <><Send className="h-4 w-4" /> Antwort senden</>}
                  </Button>
                </CardContent>
              </Card>

              {/* Interne Notizen (Header) */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Interne Notizen (Header)</CardTitle></CardHeader>
                <CardContent>
                  <Textarea
                    rows={3}
                    placeholder="Schnellnotizen zu diesem Vorgang…"
                    value={internalNotes}
                    onChange={(e) => { setInternalNotes(e.target.value); setNotesDirty(true); }}
                  />
                  {notesDirty && (
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => updateMutation.mutate({ internalNotes })}>
                      Notizen speichern
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="text-gray-500">{label}</div>
      <div className="col-span-2 font-medium text-gray-900">{value}</div>
    </div>
  );
}

function TemplatesDialog({ open, onClose, templates }: { open: boolean; onClose: () => void; templates: any[] }) {
  const { toast } = useToast();
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", category: "custom", subject: "", body: "" });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing?.id) {
        const r = await apiRequest("PATCH", `/api/partner/inquiry-templates/${editing.id}`, form);
        return r.json();
      }
      const r = await apiRequest("POST", "/api/partner/inquiry-templates", form);
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "Vorlage gespeichert" });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/inquiry-templates"] });
      setEditing(null);
      setForm({ name: "", category: "custom", subject: "", body: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/partner/inquiry-templates/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Vorlage gelöscht" });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/inquiry-templates"] });
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Antwortvorlagen</DialogTitle>
          <DialogDescription>Speichern Sie Ihre häufigsten Antworten, um in einem Klick zu antworten.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Ihre Vorlagen</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {templates.length === 0 && <div className="text-sm text-gray-400 p-4 border border-dashed rounded">Noch keine Vorlagen.</div>}
              {templates.map(t => (
                <Card key={t.id} className="cursor-pointer hover:border-purple-300" onClick={() => { setEditing(t); setForm({ name: t.name, category: t.category, subject: t.subject || "", body: t.body }); }}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm">{t.name}</div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(t.id); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-2 mt-1">{t.body}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2">{editing ? "Vorlage bearbeiten" : "Neue Vorlage"}</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="z.B. Standard-Antwort Kindergeburtstag" />
              </div>
              <div>
                <Label className="text-xs">Kategorie</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="greeting">Begrüßung</SelectItem>
                    <SelectItem value="quote">Angebot</SelectItem>
                    <SelectItem value="follow_up">Nachfass</SelectItem>
                    <SelectItem value="decline">Absage</SelectItem>
                    <SelectItem value="custom">Eigene</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Betreff (optional)</Label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Nachrichtentext</Label>
                <Textarea rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Hallo {{name}}, vielen Dank für Ihre Anfrage…" />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => saveMutation.mutate()} disabled={!form.name || !form.body || saveMutation.isPending} className="flex-1">
                  {editing ? "Speichern" : "Anlegen"}
                </Button>
                {editing && (
                  <Button variant="outline" onClick={() => { setEditing(null); setForm({ name: "", category: "custom", subject: "", body: "" }); }}>
                    Neu
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
