import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Sparkles, TrendingUp, Info } from "lucide-react";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { GroupActivityCard, type PartnerGroupActivity } from "@/components/partner/GroupActivityCard";

export default function PartnerGroupActivities() {
  const [createOpen, setCreateOpen] = useState(false);

  const { data: groups, isLoading } = useQuery<PartnerGroupActivity[]>({
    queryKey: ["/api/partner/group-activities"],
  });

  const open = (groups || []).filter(g => g.status === "open").length;
  const confirmed = (groups || []).filter(g => g.status === "confirmed").length;
  const totalSeats = (groups || []).reduce((s, g) => s + g.maxParticipants, 0);
  const filledSeats = (groups || []).reduce((s, g) => s + (g.currentParticipants || 0), 0);
  const fillRate = totalSeats ? Math.round((filledSeats / totalSeats) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/30">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-2">
          <Link href="/partner/dashboard"><Button variant="ghost" size="sm" className="gap-1" data-testid="link-back-dashboard"><ArrowLeft className="h-4 w-4" /> Dashboard</Button></Link>
        </div>

        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900">Mach-mit-Gruppen</h1>
              <p className="text-sm text-gray-600 mt-0.5">Fülle leere Wochentag-Slots, indem du selbst eine offene Gruppe startest.</p>
            </div>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 gap-1" onClick={() => setCreateOpen(true)} data-testid="button-create-partner-group">
            <Plus className="h-4 w-4" /> Neue Gruppe starten
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card><CardContent className="p-4">
            <div className="text-xs text-gray-500">Offene Gruppen</div>
            <div className="text-2xl font-black text-purple-700">{open}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-xs text-gray-500">Bestätigte Gruppen</div>
            <div className="text-2xl font-black text-emerald-600">{confirmed}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-xs text-gray-500">Gefüllte Plätze</div>
            <div className="text-2xl font-black text-gray-900">{filledSeats} / {totalSeats}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-xs text-gray-500">Auslastung</div>
            <div className="text-2xl font-black text-purple-700 flex items-center gap-1">{fillRate}% <TrendingUp className="h-4 w-4" /></div>
          </CardContent></Card>
        </div>

        <Card className="mb-4 border-0 bg-gradient-to-r from-purple-100 to-pink-100">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-purple-900">
              <strong>Tipp:</strong> Starte für jeden leeren Mo–Do-Slot eine Mach-mit-Gruppe mit reduziertem Preis. Wenn du z.B. mittwochs nur 30 % Auslastung hast, fülle die Lücke mit kleineren offenen Gruppen ab 2–4 Personen.
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-56" />)}
          </div>
        ) : !groups || groups.length === 0 ? (
          <Card className="border-dashed bg-white/60">
            <CardContent className="p-12 text-center">
              <Sparkles className="h-12 w-12 text-purple-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Noch keine Gruppen</h3>
              <p className="text-sm text-gray-500 mb-4">Starte deine erste Mach-mit-Gruppe und fülle damit leere Wochentage.</p>
              <Button className="bg-purple-600 hover:bg-purple-700 gap-1" onClick={() => setCreateOpen(true)} data-testid="button-create-first-group">
                <Plus className="h-4 w-4" /> Erste Gruppe starten
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(activity => (
              <GroupActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        <CreateGroupDialog open={createOpen} onOpenChange={setCreateOpen} hideTrigger />
      </div>
    </div>
  );
}
