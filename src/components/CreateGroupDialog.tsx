import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/partner-demo/queryClient";
import { Plus } from "lucide-react";

const CATEGORIES = [
  { value: "Bowling", label: "Bowling" },
  { value: "Lasertag", label: "Lasertag" },
  { value: "Escape Room", label: "Escape Room" },
  { value: "Trampolin", label: "Trampolin" },
  { value: "Klettern", label: "Klettern" },
  { value: "Minigolf", label: "Minigolf" },
  { value: "Paintball", label: "Paintball" },
  { value: "Schwimmen", label: "Schwimmen" },
  { value: "Sonstiges", label: "Sonstiges" },
];

// DEMO: adapted from the real app's CreateGroupDialog (group-activities-page.tsx).
// The one behavioral change: the real version navigates to the newly
// created group's public detail page ("/gruppen/:id") on success - that
// page isn't part of this sanitized bundle, so this version just closes
// the dialog and lets the (already visible) group list refresh in place.
export function CreateGroupDialog({ open, onOpenChange, hideTrigger }: { open: boolean; onOpenChange: (o: boolean) => void; hideTrigger?: boolean }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "", description: "", category: "Bowling", city: "", location: "",
    activityDate: "", activityTime: "19:00", durationMinutes: 120,
    maxParticipants: 4, minParticipants: 2, pricePerPerson: "15",
    organizerName: user?.fullName || "", organizerEmail: user?.email || "",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const dateTime = `${form.activityDate}T${form.activityTime}:00`;
      const r = await apiRequest("POST", "/api/group-activities", { ...form, activityDate: dateTime });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      toast({ title: "Gruppe gestartet!", description: "Andere Nutzer können jetzt beitreten." });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/group-activities"] });
      onOpenChange(false);
    },
    onError: (e: any) => toast({ title: "Fehler", description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button className="bg-purple-600 hover:bg-purple-700 gap-1"><Plus className="h-4 w-4" /> Eigene Gruppe starten</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Starte deine Gruppe</DialogTitle>
          <DialogDescription>Plane ein Erlebnis und lasse andere mitkommen. Wir kümmern uns um die Benachrichtigungen.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Titel *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="z.B. Bowling Abend" />
            </div>
            <div>
              <Label>Kategorie *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Beschreibung</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Worauf freust du dich? Was sollen Mitkommer wissen?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Stadt *</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Bochum" /></div>
            <div><Label>Location *</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Lasertag Arena Bochum" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Datum *</Label><Input type="date" value={form.activityDate} onChange={(e) => setForm({ ...form, activityDate: e.target.value })} /></div>
            <div><Label>Uhrzeit *</Label><Input type="time" value={form.activityTime} onChange={(e) => setForm({ ...form, activityTime: e.target.value })} /></div>
            <div><Label>Dauer (Min)</Label><Input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) })} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Max. Teilnehmer *</Label><Input type="number" min="2" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: parseInt(e.target.value) })} /></div>
            <div><Label>Min. Teilnehmer</Label><Input type="number" min="2" value={form.minParticipants} onChange={(e) => setForm({ ...form, minParticipants: parseInt(e.target.value) })} /></div>
            <div><Label>Preis p. P. (€) *</Label><Input value={form.pricePerPerson} onChange={(e) => setForm({ ...form, pricePerPerson: e.target.value })} placeholder="15" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Dein Name *</Label><Input value={form.organizerName} onChange={(e) => setForm({ ...form, organizerName: e.target.value })} /></div>
            <div><Label>Deine E-Mail *</Label><Input type="email" value={form.organizerEmail} onChange={(e) => setForm({ ...form, organizerEmail: e.target.value })} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.title || !form.city || !form.location || !form.activityDate || !form.organizerName || !form.organizerEmail}>
            {createMutation.isPending ? "Erstelle…" : "Gruppe starten"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
