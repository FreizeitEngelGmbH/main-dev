import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addDays,
} from "date-fns";
import { de } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2, Clock, Edit, Mail, RefreshCw, CheckCircle2, XCircle, Download, Cloud, ExternalLink } from "lucide-react";

interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  type: string;
  startDate: string;
  endDate: string | null;
  allDay: boolean;
  color: string | null;
  relatedType: string | null;
  relatedId: number | null;
  createdBy: number | null;
  outlookEventId: string | null;
  outlookSynced: boolean | null;
  createdAt: string;
}

interface OutlookStatus {
  connected: boolean;
  email: string;
  error?: string;
}

const EVENT_TYPES: Record<string, { label: string; color: string }> = {
  termin: { label: "Termin", color: "#3b82f6" },
  kampagne: { label: "Kampagne", color: "#8b5cf6" },
  event: { label: "Event", color: "#f59e0b" },
  follow_up: { label: "Follow-up", color: "#10b981" },
  meeting: { label: "Meeting", color: "#ef4444" },
};

const DAY_NAMES = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function getTypeColor(type: string): string {
  return EVENT_TYPES[type]?.color || "#6b7280";
}

export default function AdminCalendar() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [syncToOutlook, setSyncToOutlook] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const outlookParam = params.get("outlook");
    if (outlookParam === "connected") {
      toast({ title: "Outlook erfolgreich verbunden!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/outlook/status"] });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (outlookParam === "error") {
      toast({ title: "Outlook-Verbindung fehlgeschlagen", variant: "destructive" });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState("termin");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formAllDay, setFormAllDay] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const allDays = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart.getTime(), calendarEnd.getTime()]
  );

  const while42 = useMemo(() => {
    const days = [...allDays];
    while (days.length < 42) {
      days.push(addDays(days[days.length - 1], 1));
    }
    return days;
  }, [allDays]);

  const queryStart = format(calendarStart, "yyyy-MM-dd");
  const queryEnd = format(calendarEnd, "yyyy-MM-dd");

  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: [`/api/admin/calendar?start=${queryStart}&end=${queryEnd}`],
  });

  const { data: outlookStatus } = useQuery<OutlookStatus>({
    queryKey: ["/api/admin/outlook/status"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/calendar", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => (query.queryKey[0] as string)?.startsWith("/api/admin/calendar") });
      toast({ title: "Event erstellt" });
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Fehler beim Erstellen", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/admin/calendar/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => (query.queryKey[0] as string)?.startsWith("/api/admin/calendar") });
      toast({ title: "Event aktualisiert" });
      setEditDialogOpen(false);
      setSelectedEvent(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Fehler beim Aktualisieren", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/calendar/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => (query.queryKey[0] as string)?.startsWith("/api/admin/calendar") });
      toast({ title: "Event gelöscht" });
      setEditDialogOpen(false);
      setSelectedEvent(null);
    },
    onError: () => {
      toast({ title: "Fehler beim Löschen", variant: "destructive" });
    },
  });

  const syncSingleMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const res = await apiRequest("POST", `/api/admin/calendar/${eventId}/sync-outlook`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => (query.queryKey[0] as string)?.startsWith("/api/admin/calendar") });
      toast({ title: "Mit Outlook synchronisiert" });
    },
    onError: () => {
      toast({ title: "Outlook-Sync fehlgeschlagen", variant: "destructive" });
    },
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const future = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      const res = await apiRequest("POST", "/api/admin/outlook/import", {
        start: now.toISOString(),
        end: future.toISOString(),
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ predicate: (query) => (query.queryKey[0] as string)?.startsWith("/api/admin/calendar") });
      toast({ title: `${data.imported} Outlook-Termine importiert` });
    },
    onError: () => {
      toast({ title: "Import fehlgeschlagen", variant: "destructive" });
    },
  });

  function resetForm() {
    setFormTitle("");
    setFormDescription("");
    setFormType("termin");
    setFormStartDate("");
    setFormEndDate("");
    setFormAllDay(false);
    setSyncToOutlook(true);
  }

  function openCreateDialog() {
    resetForm();
    setCreateDialogOpen(true);
  }

  function openEditDialog(event: CalendarEvent) {
    setSelectedEvent(event);
    setFormTitle(event.title);
    setFormDescription(event.description || "");
    setFormType(event.type);
    setFormStartDate(event.startDate ? event.startDate.slice(0, 16) : "");
    setFormEndDate(event.endDate ? event.endDate.slice(0, 16) : "");
    setFormAllDay(event.allDay);
    setEditDialogOpen(true);
  }

  function handleCreate() {
    if (!formTitle || !formStartDate) return;
    createMutation.mutate({
      title: formTitle,
      description: formDescription || null,
      type: formType,
      startDate: new Date(formStartDate).toISOString(),
      endDate: formEndDate ? new Date(formEndDate).toISOString() : null,
      allDay: formAllDay,
      color: getTypeColor(formType),
      syncToOutlook: syncToOutlook && outlookStatus?.connected,
    });
  }

  function handleUpdate() {
    if (!selectedEvent || !formTitle || !formStartDate) return;
    updateMutation.mutate({
      id: selectedEvent.id,
      data: {
        title: formTitle,
        description: formDescription || null,
        type: formType,
        startDate: new Date(formStartDate).toISOString(),
        endDate: formEndDate ? new Date(formEndDate).toISOString() : null,
        allDay: formAllDay,
        color: getTypeColor(formType),
      },
    });
  }

  function getEventsForDay(day: Date): CalendarEvent[] {
    return events.filter((e) => {
      const eventStart = new Date(e.startDate);
      return isSameDay(eventStart, day);
    });
  }

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const in7Days = addDays(now, 7);
    return events
      .filter((e) => {
        const d = new Date(e.startDate);
        return d >= now && d <= in7Days;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-8 w-8" />
            Kalender
          </h1>
          <p className="text-muted-foreground mt-1">Termine, Kampagnen und Events verwalten</p>
        </div>
        <div className="flex items-center gap-2">
          {outlookStatus?.connected && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => importMutation.mutate()}
              disabled={importMutation.isPending}
              className="gap-1.5"
            >
              <Download className="h-4 w-4" />
              {importMutation.isPending ? "Importiere..." : "Outlook importieren"}
            </Button>
          )}
          <Button onClick={openCreateDialog} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Neues Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-semibold min-w-[200px] text-center">
                    {format(currentDate, "MMMM yyyy", { locale: de })}
                  </h2>
                  <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Heute
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-96 text-muted-foreground">Laden...</div>
              ) : (
                <div>
                  <div className="grid grid-cols-7 mb-1">
                    {DAY_NAMES.map((d) => (
                      <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2 uppercase">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 border-t border-l">
                    {while42.map((day, idx) => {
                      const dayEvents = getEventsForDay(day);
                      const inMonth = isSameMonth(day, currentDate);
                      const today = isToday(day);
                      return (
                        <div
                          key={idx}
                          className={`border-r border-b min-h-[90px] p-1 transition-colors ${
                            inMonth ? "bg-background" : "bg-muted/30"
                          } ${today ? "bg-blue-50 dark:bg-blue-950/30" : ""} hover:bg-muted/50`}
                        >
                          <div className={`text-xs font-medium mb-1 ${
                            today
                              ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                              : inMonth
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}>
                            {format(day, "d")}
                          </div>
                          <div className="space-y-0.5">
                            {dayEvents.slice(0, 3).map((event) => (
                              <button
                                key={event.id}
                                onClick={() => openEditDialog(event)}
                                className="w-full text-left text-[10px] sm:text-xs px-1.5 py-0.5 rounded truncate font-medium text-white cursor-pointer hover:opacity-80 transition-opacity block relative"
                                style={{ backgroundColor: event.color || getTypeColor(event.type) }}
                                title={event.title}
                              >
                                {event.outlookSynced && (
                                  <Cloud className="h-2.5 w-2.5 inline-block mr-0.5 opacity-80" />
                                )}
                                {event.title}
                              </button>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-[10px] text-muted-foreground text-center">
                                +{dayEvents.length - 3} mehr
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Outlook Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Outlook Kalender
              </CardTitle>
            </CardHeader>
            <CardContent>
              {outlookStatus ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {outlookStatus.connected ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      {outlookStatus.connected ? "Verbunden" : "Nicht verbunden"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{outlookStatus.email}</p>
                  {outlookStatus.connected ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Neue Termine werden automatisch mit Outlook synchronisiert.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 text-xs"
                        onClick={() => importMutation.mutate()}
                        disabled={importMutation.isPending}
                      >
                        <Download className="h-3 w-3" />
                        {importMutation.isPending ? "Importiere..." : "Termine importieren"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full gap-1.5 text-xs"
                      onClick={async () => {
                        try {
                          const res = await apiRequest("GET", "/api/admin/outlook/connect");
                          const data = await res.json();
                          if (data.authUrl) {
                            window.location.href = data.authUrl;
                          }
                        } catch {
                          toast({ title: "Verbindung fehlgeschlagen", variant: "destructive" });
                        }
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Mit Outlook verbinden
                    </Button>
                  )}
                  {outlookStatus.error && !outlookStatus.connected && (
                    <p className="text-xs text-muted-foreground mt-1">{outlookStatus.error}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Prüfe Verbindung...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Legende</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(EVENT_TYPES).map(([key, { label, color }]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex items-center gap-2">
                <Cloud className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">= Mit Outlook synchronisiert</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Nächste 7 Tage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine anstehenden Events</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 10).map((event) => (
                    <button
                      key={event.id}
                      onClick={() => openEditDialog(event)}
                      className="w-full text-left flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: event.color || getTypeColor(event.type) }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {event.outlookSynced && <Cloud className="h-3 w-3 inline-block mr-1 text-muted-foreground" />}
                          {event.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.startDate), "dd.MM. HH:mm", { locale: de })}
                          {event.allDay && " (Ganztägig)"}
                        </p>
                        <Badge
                          variant="outline"
                          className="mt-1 text-[10px] px-1.5 py-0"
                          style={{ borderColor: getTypeColor(event.type), color: getTypeColor(event.type) }}
                        >
                          {EVENT_TYPES[event.type]?.label || event.type}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Neues Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titel</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Event-Titel" className="mt-1" />
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Beschreibung..." className="mt-1" rows={3} />
            </div>
            <div>
              <Label>Typ</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_TYPES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start</Label>
                <Input type="datetime-local" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Ende</Label>
                <Input type="datetime-local" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="allday-create" checked={formAllDay} onCheckedChange={(c) => setFormAllDay(!!c)} />
              <Label htmlFor="allday-create" className="cursor-pointer">Ganztägig</Label>
            </div>
            {outlookStatus?.connected && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <Checkbox id="sync-outlook-create" checked={syncToOutlook} onCheckedChange={(c) => setSyncToOutlook(!!c)} />
                <Label htmlFor="sync-outlook-create" className="cursor-pointer text-sm flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-blue-600" />
                  Mit Outlook synchronisieren
                </Label>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Farbe:</span>
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getTypeColor(formType) }} />
              <span className="text-xs text-muted-foreground">(automatisch nach Typ)</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleCreate} disabled={!formTitle || !formStartDate || createMutation.isPending}>
              {createMutation.isPending ? "Erstelle..." : "Erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Event bearbeiten
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <Label>Titel</Label>
                <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Beschreibung</Label>
                <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="mt-1" rows={3} />
              </div>
              <div>
                <Label>Typ</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EVENT_TYPES).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start</Label>
                  <Input type="datetime-local" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Ende</Label>
                  <Input type="datetime-local" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} className="mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="allday-edit" checked={formAllDay} onCheckedChange={(c) => setFormAllDay(!!c)} />
                <Label htmlFor="allday-edit" className="cursor-pointer">Ganztägig</Label>
              </div>

              {/* Outlook sync status for this event */}
              {outlookStatus?.connected && (
                <div className="p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Outlook</span>
                    </div>
                    {selectedEvent.outlookSynced ? (
                      <Badge variant="outline" className="text-green-600 border-green-300 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Synchronisiert
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs h-7"
                        onClick={() => syncSingleMutation.mutate(selectedEvent.id)}
                        disabled={syncSingleMutation.isPending}
                      >
                        <RefreshCw className={`h-3 w-3 ${syncSingleMutation.isPending ? "animate-spin" : ""}`} />
                        Jetzt synchronisieren
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Farbe:</span>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getTypeColor(formType) }} />
                <span className="text-xs text-muted-foreground">(automatisch nach Typ)</span>
              </div>
              <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                <p>Erstellt: {format(new Date(selectedEvent.createdAt), "dd.MM.yyyy HH:mm", { locale: de })}</p>
                {selectedEvent.relatedType && <p>Verknüpft: {selectedEvent.relatedType} #{selectedEvent.relatedId}</p>}
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => selectedEvent && deleteMutation.mutate(selectedEvent.id)}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              {deleteMutation.isPending ? "Lösche..." : "Löschen"}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Abbrechen</Button>
              <Button onClick={handleUpdate} disabled={!formTitle || !formStartDate || updateMutation.isPending}>
                {updateMutation.isPending ? "Speichere..." : "Speichern"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
