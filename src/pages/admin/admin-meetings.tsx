import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminLayout from "./admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Play,
  Search,
  ChevronLeft,
  ChevronRight,
  Phone,
  Monitor,
  Link2,
  X,
  UserPlus,
} from "lucide-react";
import type { Meeting } from "@shared/schema";

const ACCENT = "#36C9C2";

const MEETING_TYPES = [
  { value: "video", label: "Videokonferenz", icon: Video, color: "bg-blue-100 text-blue-700" },
  { value: "audio", label: "Telefonkonferenz", icon: Phone, color: "bg-green-100 text-green-700" },
  { value: "screen", label: "Bildschirmfreigabe", icon: Monitor, color: "bg-purple-100 text-purple-700" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  geplant: { label: "Geplant", color: "bg-blue-100 text-blue-700" },
  aktiv: { label: "Aktiv", color: "bg-green-100 text-green-700" },
  beendet: { label: "Beendet", color: "bg-gray-100 text-gray-600" },
  abgesagt: { label: "Abgesagt", color: "bg-red-100 text-red-700" },
};

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];
const MEETING_COLORS = ["#36C9C2", "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444"];

function generateRoomId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `fe-${segment()}-${segment()}-${segment()}`;
}

function getJitsiUrl(roomId: string): string {
  return `https://meet.jit.si/${roomId}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
}

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
}

function isFuture(dateStr: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return dateStr >= today;
}

export default function AdminMeetings() {
  const { toast } = useToast();
  const [tab, setTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showVideoRoom, setShowVideoRoom] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState("");
  const [activeRoomTitle, setActiveRoomTitle] = useState("");
  const [editing, setEditing] = useState<Partial<Meeting> | null>(null);
  const [newParticipant, setNewParticipant] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const meetingsQuery = useQuery<Meeting[]>({ queryKey: ["/api/admin/meetings"] });
  const allMeetings = meetingsQuery.data || [];

  const todayStr = new Date().toISOString().split("T")[0];

  const upcomingMeetings = allMeetings.filter((m) => m.date >= todayStr && m.status !== "abgesagt");
  const pastMeetings = allMeetings.filter((m) => m.date < todayStr || m.status === "beendet");
  const todayMeetings = allMeetings.filter((m) => isToday(m.date) && m.status !== "abgesagt");

  const filteredMeetings = (tab === "upcoming" ? upcomingMeetings : tab === "past" ? pastMeetings : allMeetings).filter(
    (m) => !searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.organizer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createMut = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/meetings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/meetings"] });
      setShowDialog(false);
      setEditing(null);
      toast({ title: "Meeting erstellt" });
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, ...data }: any) => apiRequest("PATCH", `/api/admin/meetings/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/meetings"] });
      setShowDialog(false);
      setEditing(null);
      toast({ title: "Meeting aktualisiert" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/meetings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/meetings"] });
      toast({ title: "Meeting gelöscht" });
    },
  });

  const handleSave = () => {
    if (!editing) return;
    if (editing.id) {
      updateMut.mutate(editing);
    } else {
      createMut.mutate(editing);
    }
  };

  const handleNewMeeting = () => {
    const roomId = generateRoomId();
    setEditing({
      title: "",
      date: todayStr,
      startTime: "10:00",
      duration: 30,
      type: "video",
      status: "geplant",
      roomId,
      meetingUrl: getJitsiUrl(roomId),
      participants: [],
      color: ACCENT,
    });
    setShowDialog(true);
  };

  const handleInstantMeeting = () => {
    const roomId = generateRoomId();
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const data = {
      title: "Sofort-Meeting",
      date: todayStr,
      startTime: time,
      duration: 30,
      type: "video",
      status: "aktiv",
      roomId,
      meetingUrl: getJitsiUrl(roomId),
      organizer: "Admin",
      participants: [],
      color: ACCENT,
    };
    createMut.mutate(data, {
      onSuccess: () => {
        setActiveRoomId(roomId);
        setActiveRoomTitle("Sofort-Meeting");
        setShowVideoRoom(true);
      },
    });
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    setActiveRoomId(meeting.roomId);
    setActiveRoomTitle(meeting.title);
    setShowVideoRoom(true);
    if (meeting.status === "geplant") {
      updateMut.mutate({ id: meeting.id, status: "aktiv" });
    }
  };

  const handleCopyLink = (meeting: Meeting) => {
    const url = meeting.meetingUrl || getJitsiUrl(meeting.roomId);
    navigator.clipboard.writeText(url);
    toast({ title: "Meeting-Link kopiert" });
  };

  const handleAddParticipant = () => {
    if (!newParticipant.trim() || !editing) return;
    setEditing({ ...editing, participants: [...(editing.participants || []), newParticipant.trim()] });
    setNewParticipant("");
  };

  const handleRemoveParticipant = (idx: number) => {
    if (!editing) return;
    const p = [...(editing.participants || [])];
    p.splice(idx, 1);
    setEditing({ ...editing, participants: p });
  };

  // Calendar logic
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7;
    const days: { date: string; dayNum: number; isCurrentMonth: boolean }[] = [];
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d.toISOString().split("T")[0], dayNum: d.getDate(), isCurrentMonth: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dt = new Date(year, month, d);
      days.push({ date: dt.toISOString().split("T")[0], dayNum: d, isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const dt = new Date(year, month + 1, d);
      days.push({ date: dt.toISOString().split("T")[0], dayNum: d, isCurrentMonth: false });
    }
    return days;
  }, [calendarMonth]);

  const getMeetingsForDate = (dateStr: string) => allMeetings.filter((m) => m.date === dateStr);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Video className="w-7 h-7" style={{ color: ACCENT }} />
                Meetings & Videokonferenzen
              </h1>
              <p className="text-sm text-gray-500 mt-1">Meetings planen, Videokonferenzen starten und Team-Calls verwalten</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleInstantMeeting} className="border-dashed">
                <Play className="w-4 h-4 mr-1" />
                Sofort-Meeting
              </Button>
              <Button onClick={handleNewMeeting} style={{ backgroundColor: ACCENT }} className="text-white hover:opacity-90">
                <Plus className="w-4 h-4 mr-1" />
                Meeting planen
              </Button>
            </div>
          </div>
        </div>

        {/* Today's quick stats */}
        <div className="px-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${ACCENT}20` }}>
                    <Video className="w-6 h-6" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{todayMeetings.length}</p>
                    <p className="text-sm text-gray-500">Meetings heute</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{upcomingMeetings.length}</p>
                    <p className="text-sm text-gray-500">Geplante Meetings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-green-50">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{allMeetings.length}</p>
                    <p className="text-sm text-gray-500">Meetings gesamt</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="px-6 pb-6">
          <Tabs value={tab} onValueChange={setTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="upcoming">Anstehend</TabsTrigger>
                <TabsTrigger value="past">Vergangen</TabsTrigger>
                <TabsTrigger value="calendar">Kalender</TabsTrigger>
              </TabsList>
              {tab !== "calendar" && (
                <div className="relative max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Meeting suchen..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                </div>
              )}
            </div>

            {/* UPCOMING + PAST TABS */}
            {["upcoming", "past"].map((tabKey) => (
              <TabsContent key={tabKey} value={tabKey}>
                {filteredMeetings.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Video className="w-16 h-16 mx-auto mb-3" style={{ color: ACCENT }} />
                    <h3 className="text-lg font-medium text-gray-600">
                      {tabKey === "upcoming" ? "Keine anstehenden Meetings" : "Keine vergangenen Meetings"}
                    </h3>
                    <p className="text-sm mt-1">
                      {tabKey === "upcoming" ? "Plane dein erstes Meeting oder starte ein Sofort-Meeting" : "Vergangene Meetings erscheinen hier"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMeetings.map((m) => {
                      const typeInfo = MEETING_TYPES.find((t) => t.value === m.type) || MEETING_TYPES[0];
                      const statusInfo = STATUS_MAP[m.status || "geplant"];
                      const TypeIcon = typeInfo.icon;
                      return (
                        <Card key={m.id} className="group hover:shadow-md transition-shadow">
                          <CardContent className="py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-1 h-14 rounded-full flex-shrink-0" style={{ backgroundColor: m.color || ACCENT }} />
                              <div className="p-2 rounded-lg" style={{ backgroundColor: `${m.color || ACCENT}15` }}>
                                <TypeIcon className="w-5 h-5" style={{ color: m.color || ACCENT }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900">{m.title}</h4>
                                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {isToday(m.date) ? "Heute" : formatDate(m.date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {m.startTime} Uhr
                                    {m.duration && <span className="text-gray-400">({m.duration} Min.)</span>}
                                  </span>
                                  {m.participants && m.participants.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      {m.participants.length} Teilnehmer
                                    </span>
                                  )}
                                  {m.organizer && (
                                    <span className="text-gray-400">von {m.organizer}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isFuture(m.date) && m.status !== "beendet" && m.status !== "abgesagt" && (
                                  <Button size="sm" onClick={() => handleJoinMeeting(m)} style={{ backgroundColor: ACCENT }} className="text-white hover:opacity-90">
                                    <Video className="w-4 h-4 mr-1" />
                                    Beitreten
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" onClick={() => handleCopyLink(m)}>
                                  <Copy className="w-4 h-4 mr-1" />
                                  Link
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => { setEditing(m); setShowDialog(true); }}>
                                      <Pencil className="w-4 h-4 mr-2" /> Bearbeiten
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleCopyLink(m)}>
                                      <Link2 className="w-4 h-4 mr-2" /> Link kopieren
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open(m.meetingUrl || getJitsiUrl(m.roomId), "_blank")}>
                                      <ExternalLink className="w-4 h-4 mr-2" /> In neuem Tab öffnen
                                    </DropdownMenuItem>
                                    {m.status !== "beendet" && (
                                      <DropdownMenuItem onClick={() => updateMut.mutate({ id: m.id, status: "beendet" })}>
                                        <X className="w-4 h-4 mr-2" /> Beenden
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600" onClick={() => deleteMut.mutate(m.id)}>
                                      <Trash2 className="w-4 h-4 mr-2" /> Löschen
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}

            {/* CALENDAR TAB */}
            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {calendarMonth.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setCalendarMonth(new Date())}>
                        Heute
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                    {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
                      <div key={d} className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-500">{d}</div>
                    ))}
                    {calendarDays.map((day, idx) => {
                      const dayMeetings = getMeetingsForDate(day.date);
                      const isNow = day.date === todayStr;
                      return (
                        <div
                          key={idx}
                          className={`bg-white min-h-[100px] p-2 ${!day.isCurrentMonth ? "opacity-40" : ""} ${isNow ? "ring-2 ring-inset ring-[#36C9C2]" : ""}`}
                        >
                          <div className={`text-sm font-medium mb-1 ${isNow ? "text-white w-6 h-6 rounded-full flex items-center justify-center" : "text-gray-700"}`} style={isNow ? { backgroundColor: ACCENT } : undefined}>
                            {day.dayNum}
                          </div>
                          <div className="space-y-1">
                            {dayMeetings.slice(0, 3).map((m) => (
                              <button
                                key={m.id}
                                className="w-full text-left text-xs px-1.5 py-0.5 rounded truncate text-white"
                                style={{ backgroundColor: m.color || ACCENT }}
                                onClick={() => { setEditing(m); setShowDialog(true); }}
                              >
                                {m.startTime} {m.title}
                              </button>
                            ))}
                            {dayMeetings.length > 3 && (
                              <span className="text-xs text-gray-400">+{dayMeetings.length - 3} mehr</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Meeting Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing?.id ? "Meeting bearbeiten" : "Neues Meeting planen"}</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Titel *</label>
                  <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="z.B. Team-Standup, Partner-Call..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Datum *</label>
                    <Input type="date" value={editing.date || ""} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Uhrzeit *</label>
                    <Input type="time" value={editing.startTime || ""} onChange={(e) => setEditing({ ...editing, startTime: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Dauer</label>
                    <Select value={String(editing.duration || 30)} onValueChange={(v) => setEditing({ ...editing, duration: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DURATION_OPTIONS.map((d) => <SelectItem key={d} value={String(d)}>{d} Minuten</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Typ</label>
                    <Select value={editing.type || "video"} onValueChange={(v) => setEditing({ ...editing, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MEETING_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Organisator</label>
                  <Input value={editing.organizer || ""} onChange={(e) => setEditing({ ...editing, organizer: e.target.value })} placeholder="Name des Organisators" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Teilnehmer</label>
                  <div className="flex gap-2 mb-2">
                    <Input value={newParticipant} onChange={(e) => setNewParticipant(e.target.value)} placeholder="Name oder E-Mail" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddParticipant())} />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddParticipant}>
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                  {editing.participants && editing.participants.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {editing.participants.map((p, i) => (
                        <Badge key={i} variant="secondary" className="flex items-center gap-1">
                          {p}
                          <button onClick={() => handleRemoveParticipant(i)} className="ml-1 hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Meeting-Link</label>
                  <div className="flex gap-2">
                    <Input value={editing.meetingUrl || ""} readOnly className="bg-gray-50" />
                    <Button type="button" variant="outline" size="sm" onClick={() => {
                      navigator.clipboard.writeText(editing.meetingUrl || "");
                      toast({ title: "Link kopiert" });
                    }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Farbe</label>
                  <div className="flex gap-2">
                    {MEETING_COLORS.map((c) => (
                      <button
                        key={c}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${editing.color === c ? "border-gray-900 scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setEditing({ ...editing, color: c })}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Notizen</label>
                  <Textarea value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={2} placeholder="Agenda, Links, etc." />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDialog(false); setEditing(null); }}>Abbrechen</Button>
              <Button
                onClick={handleSave}
                disabled={!editing?.title || !editing?.date || !editing?.startTime}
                style={{ backgroundColor: ACCENT }}
                className="text-white hover:opacity-90"
              >
                {editing?.id ? "Speichern" : "Meeting erstellen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Video Room Dialog (Jitsi) */}
        <Dialog open={showVideoRoom} onOpenChange={setShowVideoRoom}>
          <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-900 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: ACCENT }}>
                  <Video className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{activeRoomTitle}</h3>
                  <p className="text-xs text-gray-400">Raum: {activeRoomId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-300 hover:text-white"
                  onClick={() => {
                    navigator.clipboard.writeText(getJitsiUrl(activeRoomId));
                    toast({ title: "Meeting-Link kopiert" });
                  }}
                >
                  <Copy className="w-4 h-4 mr-1" /> Link kopieren
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-300 hover:text-white"
                  onClick={() => window.open(getJitsiUrl(activeRoomId), "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-1" /> Neuer Tab
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300"
                  onClick={() => setShowVideoRoom(false)}
                >
                  <X className="w-4 h-4 mr-1" /> Verlassen
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-black">
              <iframe
                src={`https://meet.jit.si/${activeRoomId}#config.prejoinConfig.enabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=false&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","chat","desktop","fullscreen","hangup","profile","settings","tileview","raisehand"]`}
                allow="camera;microphone;display-capture;autoplay;clipboard-write"
                style={{ width: "100%", height: "calc(85vh - 60px)", border: "none" }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
