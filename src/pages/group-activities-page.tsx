import { useState } from "react";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { CreateGroupDialog, CATEGORIES } from "@/components/CreateGroupDialog";
import { getGroupActivityImage } from "@/lib/group-activity-images";
import { groupActivities, getGroupActivity, type GroupActivity } from "@/data/groupActivities";
import {
  Sparkles, MapPin, Clock, Users, ArrowLeft, Plus, Calendar as CalendarIcon, CheckCircle2,
  Mail, Search, Trophy, Send, Info, AlertCircle,
  Bell, Share2, MessageCircle, Copy, UserPlus, Stamp, BellRing,
} from "lucide-react";

/**
 * Public "Mach-mit-Gruppen" pages (`/gruppen`, `/gruppen/:id`), adapted from the
 * source app's group-activities-page.tsx with the same layout and markup.
 *
 * STATIC: groups come from `@/data/groupActivities` instead of
 * `/api/group-activities`. Everything that needs the backend - joining, the
 * members-only chat, the loyalty stamp status, subscribing and creating a
 * group - shows its signed-out / non-member state or a "not available yet"
 * notice instead of pretending to save anything.
 */

const JOIN_UNAVAILABLE = "Gruppenbeitritte werden in dieser Version noch nicht gespeichert.";
const SUBSCRIBE_UNAVAILABLE = "Benachrichtigungen können in dieser Version noch nicht aktiviert werden.";
const CREATE_UNAVAILABLE = "Neue Gruppen können in dieser Version noch nicht erstellt werden.";

function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}
function formatTime(d: string | Date): string {
  return new Date(d).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr";
}

// STATIC: the source chat polls and posts to /api/group-activities/:id/chat for
// members only. Nobody can join in this build, so it shows the same
// signed-out and non-member cards the source renders in those states.
function GroupActivityChat({ user }: { user: unknown }) {
  if (!user) {
    return (
      <Card className="border-purple-200 bg-purple-50/40">
        <CardContent className="py-8 text-center">
          <MessageCircle className="h-10 w-10 text-purple-500 mx-auto mb-3" />
          <h3 className="font-bold text-purple-950">Gruppenchat</h3>
          <p className="text-sm text-gray-600 mt-1 mb-4">Tritt der Gruppe bei und melde dich an, um die anderen Mitglieder kennenzulernen.</p>
          <Link href="/auth"><Button className="bg-purple-600 hover:bg-purple-700">Anmelden</Button></Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-purple-200">
      <CardContent className="py-7 text-center">
        <MessageCircle className="h-9 w-9 text-purple-400 mx-auto mb-2" />
        <h3 className="font-semibold">Chat nur für Gruppenmitglieder</h3>
        <p className="text-sm text-gray-500 mt-1">Sobald du dieser Gruppe beitrittst, wird der Chat automatisch für dich freigeschaltet.</p>
      </CardContent>
    </Card>
  );
}

export function GroupActivitiesListPage() {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterCity, setFilterCity] = useState("");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  const filtered = groupActivities.filter(g => {
    if (filterCategory !== "all" && g.category !== filterCategory) return false;
    if (filterCity && !g.city.toLowerCase().includes(filterCity.toLowerCase())) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!g.title.toLowerCase().includes(q) && !g.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/30">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/"><Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" /> Startseite</Button></Link>
        </div>
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900">Mach-mit-Gruppen</h1>
                <Badge className="bg-pink-500 text-white text-[10px]">NEU</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-0.5">Tritt offenen Gruppen bei oder starte dein eigenes Erlebnis – perfekt für unter der Woche.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 gap-1" onClick={() => setSubscribeOpen(true)}>
              <Bell className="h-4 w-4" /> Benachrichtigen
            </Button>
            <CreateGroupDialog open={createOpen} onOpenChange={setCreateOpen} unavailableMessage={CREATE_UNAVAILABLE} />
          </div>
        </div>

        <LoyaltyTeaser />
        <SubscribeDialog open={subscribeOpen} onOpenChange={setSubscribeOpen} prefillCity={filterCity} prefillCategory={filterCategory !== "all" ? filterCategory : ""} />

        <Card className="mb-4 border-0 shadow-sm">
          <CardContent className="p-3 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input className="pl-8 h-9" placeholder="Suche nach Aktivität…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input className="w-[180px] h-9" placeholder="Stadt…" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} />
          </CardContent>
        </Card>

        {filtered.length === 0 ? (
          <Card className="border-dashed bg-white/60">
            <CardContent className="p-12 text-center">
              <Sparkles className="h-12 w-12 text-purple-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Keine Gruppen gefunden</h3>
              <p className="text-sm text-gray-500 mb-4">Probiere andere Filter oder starte selbst eine Gruppe!</p>
              <Button className="bg-purple-600 hover:bg-purple-700 gap-1" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> Eigene Gruppe starten
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(g => <GroupGridCard key={g.id} group={g} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function GroupGridCard({ group }: { group: GroupActivity }) {
  const free = group.maxParticipants - (group.currentParticipants || 0);
  const img = getGroupActivityImage(group);
  return (
    <div className="relative">
      <div className="absolute top-3 right-3 z-10" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
        <ShareDropdown group={group} />
      </div>
      <Link href={`/gruppen/${group.id}`}>
        <Card className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1 border-0 shadow-md h-full" data-testid={`card-group-${group.id}`}>
        <div className="relative h-44 overflow-hidden">
          <img src={img} alt={group.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {free > 0 ? (
            <div className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">Noch {free} {free === 1 ? "Platz" : "Plätze"}</div>
          ) : (
            <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">Voll</div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="text-xs text-gray-500 capitalize">{group.category}</div>
          <h3 className="font-bold text-base mb-2 line-clamp-1">{group.title}</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-gray-400" /> {group.city}</div>
            <div className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-gray-400" /> {new Date(group.activityDate).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short" })} · {formatTime(group.activityDate)}</div>
            <div className="flex items-center gap-1.5"><Users className="h-3 w-3 text-gray-400" /> {group.currentParticipants}/{group.maxParticipants}</div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="text-sm font-black text-gray-900">{group.pricePerPerson} € <span className="text-xs font-normal text-gray-500">p. P.</span></div>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Beitreten</Button>
          </div>
        </CardContent>
      </Card>
    </Link>
    </div>
  );
}

export function GroupActivityDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const id = Number(params.id);
  const group = Number.isInteger(id) ? getGroupActivity(id) : undefined;
  const [joinForm, setJoinForm] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    message: "",
    wantsBuddy: false,
  });

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-2">Gruppe nicht gefunden</h2>
            <p className="text-muted-foreground mb-4">
              Diese Mach-mit-Gruppe existiert nicht (mehr).
            </p>
            <Link href="/gruppen">
              <Button>Alle Gruppen</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const free = group.maxParticipants - (group.currentParticipants || 0);
  const img = getGroupActivityImage(group);
  const progress = ((group.currentParticipants || 0) / group.maxParticipants) * 100;
  const minReached = (group.currentParticipants || 0) >= (group.minParticipants || 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/30">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="mb-4">
          <Link href="/gruppen"><Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" /> Alle Gruppen</Button></Link>
        </div>

        <Card className="overflow-hidden border-0 shadow-xl mb-6">
          <div className="relative h-64 md:h-80">
            <img src={img} alt={group.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
              <Badge className="bg-purple-600 text-white border-0 capitalize">{group.category}</Badge>
              <div className="flex gap-2">
                <ShareDropdown group={group} />
                {free > 0 ? (
                  <Badge className="bg-white/90 text-purple-700 border-0 font-bold">{free} {free === 1 ? "Platz" : "Plätze"} frei</Badge>
                ) : (
                  <Badge className="bg-emerald-600 text-white border-0">Bestätigt</Badge>
                )}
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h1 className="text-2xl md:text-4xl font-black mb-2">{group.title}</h1>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {group.location}, {group.city}</span>
                <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" /> {formatDate(group.activityDate)}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatTime(group.activityDate)}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Worum geht's?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{group.description || "Keine Beschreibung – aber Hauptsache, ihr habt Spaß zusammen!"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" /> Teilnehmer ({group.currentParticipants}/{group.maxParticipants})</CardTitle>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-700 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {group.members.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 bg-purple-50 rounded-full pl-1 pr-3 py-1">
                      <Avatar className="h-7 w-7"><AvatarFallback className="bg-purple-200 text-purple-800 text-[10px]">{m.name.split(" ").map((p) => p[0]).join("").slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                      <span className="text-sm font-medium">{m.name}</span>
                      {m.isOrganizer && <Badge variant="secondary" className="text-[9px] py-0 px-1.5"><Trophy className="h-2.5 w-2.5 mr-0.5" /> Host</Badge>}
                    </div>
                  ))}
                  {Array.from({ length: free }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex items-center gap-2 bg-gray-50 rounded-full pl-1 pr-3 py-1 border border-dashed">
                      <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center"><Plus className="h-3 w-3 text-gray-400" /></div>
                      <span className="text-xs text-gray-500">Freier Platz</span>
                    </div>
                  ))}
                </div>
                {!minReached && (
                  <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded text-xs text-amber-800 flex gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Mindestteilnehmer:</strong> {group.minParticipants}. Sollten sich nicht genug Leute finden, werden alle rechtzeitig per Mail informiert.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <GroupActivityChat user={user} />
          </div>

          <div className="space-y-4">
            <Card className="border-purple-200 sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Mitmachen</CardTitle>
                <CardDescription className="text-xs">{group.pricePerPerson} € pro Person · vor Ort oder per Online-Buchung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {free === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                    <div className="font-semibold">Gruppe ist komplett!</div>
                    <div className="text-xs text-gray-500 mt-1">Alle Teilnehmer wurden bereits informiert.</div>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label className="text-xs">Dein Name *</Label>
                      <Input value={joinForm.name} onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })} placeholder="Max Mustermann" />
                    </div>
                    <div>
                      <Label className="text-xs">E-Mail *</Label>
                      <Input type="email" value={joinForm.email} onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })} placeholder="max@example.de" />
                    </div>
                    <div>
                      <Label className="text-xs">Telefon (optional)</Label>
                      <Input value={joinForm.phone} onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Nachricht an die Gruppe (optional)</Label>
                      <Textarea rows={2} value={joinForm.message} onChange={(e) => setJoinForm({ ...joinForm, message: e.target.value })} placeholder="Hi Leute, freue mich euch kennenzulernen!" />
                    </div>
                    <label className="flex items-start gap-2 cursor-pointer rounded-lg border border-pink-200 bg-pink-50/50 p-2.5 hover:bg-pink-50 transition-colors">
                      <Checkbox checked={joinForm.wantsBuddy} onCheckedChange={(c) => setJoinForm({ ...joinForm, wantsBuddy: !!c })} className="mt-0.5 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500" />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-pink-700 flex items-center gap-1">
                          <UserPlus className="h-3 w-3" /> Komme alleine – Buddy gesucht
                        </div>
                        <div className="text-[10px] text-pink-600/80 mt-0.5">Wir paaren dich mit einer anderen Person, die ebenfalls alleine kommt.</div>
                      </div>
                    </label>
                    {/* STATIC: the source POSTs to /api/group-activities/:id/join here. */}
                    <Button onClick={() => toast({ title: "Nicht verfügbar", description: JOIN_UNAVAILABLE })} disabled={!joinForm.name || !joinForm.email} className="w-full bg-purple-600 hover:bg-purple-700 gap-1">
                      <Send className="h-4 w-4" /> Gruppe beitreten
                    </Button>
                    {(() => {
                      const dow = new Date(group.activityDate).getDay();
                      if (dow >= 1 && dow <= 4) {
                        return (
                          <div className="flex items-start gap-2 rounded-md bg-amber-50 border-l-4 border-amber-400 p-2 text-[10px] text-amber-800">
                            <Stamp className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                            <span>Mit dem Beitritt erhältst du <strong>1 Wochentag-Stempel</strong>. 5 Stempel = 5 € Gutschein.</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <p className="text-[10px] text-gray-500 leading-relaxed flex gap-1"><Info className="h-3 w-3 flex-shrink-0 mt-0.5" /> Du erhältst eine E-Mail-Bestätigung. Sollte die Gruppe nicht zustande kommen, informieren wir dich rechtzeitig.</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareDropdown({ group }: { group: GroupActivity }) {
  const { toast } = useToast();
  const url = typeof window !== "undefined" ? `${window.location.origin}/gruppen/${group.id}` : `/gruppen/${group.id}`;
  const dateStr = new Date(group.activityDate).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" });
  const text = `Hey! Ich gehe am ${dateStr} zu ${group.title} in ${group.city}. Komm doch mit – wir suchen noch Mitstreiter!`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(text + "\n\n" + url)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent("Komm mit: " + group.title)}&body=${encodeURIComponent(text + "\n\n" + url)}`;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white text-purple-700 border-0 gap-1 h-7" data-testid="button-share-group">
          <Share2 className="h-3.5 w-3.5" /> Teilen
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
            <MessageCircle className="h-4 w-4 mr-2 text-green-600" /> WhatsApp
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={mailUrl} className="cursor-pointer">
            <Mail className="h-4 w-4 mr-2 text-blue-600" /> E-Mail
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(url); toast({ title: "Link kopiert!", description: url }); }} className="cursor-pointer">
          <Copy className="h-4 w-4 mr-2" /> Link kopieren
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// STATIC: the source loads /api/loyalty/status for signed-in users. Without it
// the stamp card shows its empty state (no stamps, no vouchers).
function LoyaltyTeaser() {
  const { user } = useAuth();
  if (!user) {
    return (
      <Card className="mb-4 border-0 shadow-sm bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
            <Stamp className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-amber-900">Wochentag-Stempelpass</div>
            <div className="text-xs text-amber-700/90">5 Mach-mit-Aktivitäten Mo–Do = 5 € Treuegutschein. Logge dich ein, um Stempel zu sammeln.</div>
          </div>
          <Link href="/auth"><Button size="sm" variant="outline" className="border-amber-400 text-amber-800">Login</Button></Link>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="mb-4 border-0 shadow-sm bg-gradient-to-r from-amber-50 to-orange-50">
      <CardContent className="p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
          <Stamp className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="font-semibold text-sm text-amber-900">Dein Wochentag-Stempelpass</div>
            <div className="flex gap-1">
              {[0,1,2,3,4].map(i => (
                <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-white border-2 border-dashed border-amber-300 text-amber-300">
                  {i+1}
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-amber-700/90 mt-0.5">Sammle 5 Mo–Do-Stempel für 5 € Gutschein.</div>
        </div>
      </CardContent>
    </Card>
  );
}

function SubscribeDialog({ open, onOpenChange, prefillCity, prefillCategory }: { open: boolean; onOpenChange: (o: boolean) => void; prefillCity?: string; prefillCategory?: string; }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState(user?.email || "");
  const [city, setCity] = useState(prefillCity || "");
  const [category, setCategory] = useState(prefillCategory || "all");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><BellRing className="h-5 w-5 text-purple-600" /> Neue Gruppe? Sag mir Bescheid!</DialogTitle>
          <DialogDescription>Wir mailen dir, sobald eine neue Mach-mit-Gruppe in deiner Stadt oder zu deiner Lieblings-Aktivität startet.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">E-Mail *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="du@example.de" data-testid="input-subscribe-email" />
          </div>
          <div>
            <Label className="text-xs">Stadt (optional)</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="z.B. Bochum – leer = alle Städte" data-testid="input-subscribe-city" />
          </div>
          <div>
            <Label className="text-xs">Kategorie (optional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-subscribe-category"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <p className="text-[10px] text-gray-500">Du kannst dich jederzeit per Klick im Mail wieder abmelden.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          {/* STATIC: the source POSTs to /api/group-subscriptions here. */}
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => toast({ title: "Nicht verfügbar", description: SUBSCRIBE_UNAVAILABLE })} disabled={!email} data-testid="button-subscribe-confirm">
            Abo aktivieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
