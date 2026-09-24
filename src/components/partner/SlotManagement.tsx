import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/partner/queryClient";
import { format, addDays, startOfWeek, addWeeks } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar, Plus, Trash2, Clock, Users, ChevronLeft, ChevronRight, Copy, Wand2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface Experience {
  id: number;
  title: string;
  price: number;
}

interface AvailabilitySlot {
  id: number;
  experienceId: number;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  priceOverride?: number;
  isBlocked: boolean;
}

// STATIC: local recurring-weekly mock standing in for the real
// /api/partner/slots response, generated relative to whichever week is
// being viewed so browsing forward/backward always shows a populated
// calendar instead of an empty one.
const SLOT_TEMPLATE: { dayOffset: number; times: [number, number][] }[] = [
  { dayOffset: 0, times: [[10, 0], [14, 0], [17, 0]] }, // Montag
  { dayOffset: 2, times: [[10, 0], [16, 0]] }, // Mittwoch
  { dayOffset: 4, times: [[14, 0], [18, 0], [19, 30]] }, // Freitag
  { dayOffset: 5, times: [[10, 0], [11, 15], [14, 0]] }, // Samstag
];

function generateWeeklySlots(weekStart: Date, experienceId: number): AvailabilitySlot[] {
  const capacity = 8;
  const slots: AvailabilitySlot[] = [];
  let seq = 0;
  for (const { dayOffset, times } of SLOT_TEMPLATE) {
    const day = addDays(weekStart, dayOffset);
    const dateStr = format(day, "yyyy-MM-dd");
    times.forEach(([h, m], i) => {
      const start = new Date(day);
      start.setHours(h, m, 0, 0);
      const end = new Date(start.getTime() + 60 * 60000);
      const fillPattern = (dayOffset + i) % 4;
      const bookedCount = [capacity, capacity - 1, Math.round(capacity / 2), 2][fillPattern];
      seq++;
      slots.push({
        id: experienceId * 10000 + dayOffset * 100 + seq,
        experienceId,
        date: dateStr,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        capacity,
        bookedCount,
        isBlocked: dayOffset === 4 && i === 0,
      });
    });
  }
  return slots;
}

export default function SlotManagement() {
  const { toast } = useToast();
  const [selectedExperience, setSelectedExperience] = useState<number | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);

  const [newSlot, setNewSlot] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "10:00",
    endTime: "11:00",
    capacity: 20,
  });

  const [generateTemplate, setGenerateTemplate] = useState({
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0] as number[],
    timeSlots: [
      { startTime: "10:00", endTime: "11:00", capacity: 20 },
      { startTime: "11:15", endTime: "12:15", capacity: 20 },
      { startTime: "14:00", endTime: "15:00", capacity: 20 },
      { startTime: "15:15", endTime: "16:15", capacity: 20 },
    ],
    defaultCapacity: 20,
  });

  const { data: experiences, isLoading: isLoadingExperiences } = useQuery<Experience[]>({
    queryKey: ["/api/partner/experiences"],
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const { data: slots, isLoading: isLoadingSlots, refetch: refetchSlots } = useQuery<AvailabilitySlot[]>({
    queryKey: ["/api/partner/slots", selectedExperience, format(currentWeekStart, "yyyy-MM-dd")],
    // STATIC: real file called fetch(`/api/partner/slots?...`) directly here,
    // bypassing the shared mocked queryClient. Replaced with local mock
    // resolution so this component can never issue a real network request.
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 250));
      if (!selectedExperience) return [];
      return generateWeeklySlots(currentWeekStart, selectedExperience);
    },
    enabled: !!selectedExperience,
  });

  const createSlotMutation = useMutation({
    mutationFn: async (slotData: typeof newSlot) => {
      return apiRequest("POST", "/api/partner/slots", {
        experienceId: selectedExperience,
        slots: [slotData],
      });
    },
    onSuccess: () => {
      toast({ title: "Zeitslot erstellt", description: "Der neue Slot wurde erfolgreich hinzugefügt." });
      setIsCreateDialogOpen(false);
      refetchSlots();
    },
    onError: () => {
      toast({ title: "Fehler", description: "Slot konnte nicht erstellt werden.", variant: "destructive" });
    },
  });

  const generateSlotsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/partner/slots/generate", {
        experienceId: selectedExperience,
        startDate: generateTemplate.startDate,
        endDate: generateTemplate.endDate,
        template: {
          daysOfWeek: generateTemplate.daysOfWeek,
          timeSlots: generateTemplate.timeSlots,
          defaultCapacity: generateTemplate.defaultCapacity,
        },
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ 
        title: "Zeitslots generiert", 
        description: `${data.slots?.length || 0} Slots wurden erstellt.` 
      });
      setIsGenerateDialogOpen(false);
      refetchSlots();
    },
    onError: () => {
      toast({ title: "Fehler", description: "Slots konnten nicht generiert werden.", variant: "destructive" });
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId: number) => {
      return apiRequest("DELETE", `/api/partner/slots/${slotId}`);
    },
    onSuccess: () => {
      toast({ title: "Gelöscht", description: "Zeitslot wurde entfernt." });
      refetchSlots();
    },
    onError: () => {
      toast({ title: "Fehler", description: "Slot konnte nicht gelöscht werden.", variant: "destructive" });
    },
  });

  const getSlotsForDay = (date: Date) => {
    if (!slots) return [];
    const dateStr = format(date, "yyyy-MM-dd");
    return slots.filter(slot => {
      const slotDate = new Date(slot.date);
      return format(slotDate, "yyyy-MM-dd") === dateStr;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const formatSlotTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return format(date, "HH:mm");
    } catch {
      return timeStr;
    }
  };

  const toggleDayOfWeek = (day: number) => {
    setGenerateTemplate(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  };

  const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  if (isLoadingExperiences) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          Lade Erlebnisse...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Zeitslot-Verwaltung
          </CardTitle>
          <CardDescription>
            Verwalten Sie Ihre verfügbaren Buchungszeiten wie bei Roller.app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="w-full sm:w-64">
              <Label>Erlebnis auswählen</Label>
              <Select
                value={selectedExperience?.toString() || ""}
                onValueChange={(val) => setSelectedExperience(parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Erlebnis wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {experiences?.map((exp) => (
                    <SelectItem key={exp.id} value={exp.id.toString()}>
                      {exp.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedExperience && (
              <div className="flex gap-2">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-1" /> Slot hinzufügen
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Neuen Zeitslot erstellen</DialogTitle>
                      <DialogDescription>
                        Fügen Sie einen einzelnen Buchungsslot hinzu
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Datum</Label>
                        <Input
                          type="date"
                          value={newSlot.date}
                          onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Startzeit</Label>
                          <Input
                            type="time"
                            value={newSlot.startTime}
                            onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Endzeit</Label>
                          <Input
                            type="time"
                            value={newSlot.endTime}
                            onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Kapazität (max. Personen)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={newSlot.capacity}
                          onChange={(e) => setNewSlot({ ...newSlot, capacity: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Abbrechen
                      </Button>
                      <Button
                        onClick={() => createSlotMutation.mutate(newSlot)}
                        disabled={createSlotMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {createSlotMutation.isPending ? "Erstelle..." : "Erstellen"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Wand2 className="h-4 w-4 mr-1" /> Slots generieren
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Zeitslots automatisch generieren</DialogTitle>
                      <DialogDescription>
                        Erstellen Sie Slots für mehrere Tage auf einmal
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Von</Label>
                          <Input
                            type="date"
                            value={generateTemplate.startDate}
                            onChange={(e) => setGenerateTemplate({ ...generateTemplate, startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Bis</Label>
                          <Input
                            type="date"
                            value={generateTemplate.endDate}
                            onChange={(e) => setGenerateTemplate({ ...generateTemplate, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2 block">Wochentage</Label>
                        <div className="flex gap-2 flex-wrap">
                          {dayNames.map((name, idx) => (
                            <Button
                              key={idx}
                              size="sm"
                              variant={generateTemplate.daysOfWeek.includes(idx) ? "default" : "outline"}
                              onClick={() => toggleDayOfWeek(idx)}
                              className={generateTemplate.daysOfWeek.includes(idx) ? "bg-purple-600" : ""}
                            >
                              {name}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Standard-Kapazität</Label>
                        <Input
                          type="number"
                          min="1"
                          value={generateTemplate.defaultCapacity}
                          onChange={(e) => setGenerateTemplate({ ...generateTemplate, defaultCapacity: parseInt(e.target.value) || 20 })}
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Zeitslots pro Tag</Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {generateTemplate.timeSlots.map((ts, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                              <Clock className="h-4 w-4 text-gray-400" />
                              {ts.startTime} - {ts.endTime}
                              <span className="text-gray-400">|</span>
                              <Users className="h-4 w-4 text-gray-400" />
                              {ts.capacity} Plätze
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                        Abbrechen
                      </Button>
                      <Button
                        onClick={() => generateSlotsMutation.mutate()}
                        disabled={generateSlotsMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {generateSlotsMutation.isPending ? "Generiere..." : "Generieren"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {selectedExperience && (
            <>
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="sm" onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, -1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium">
                  {format(currentWeekStart, "d. MMM", { locale: de })} - {format(addDays(currentWeekStart, 6), "d. MMM yyyy", { locale: de })}
                </span>
                <Button variant="outline" size="sm" onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, idx) => (
                  <div key={idx} className="min-h-[200px] border rounded-lg p-2 bg-gray-50">
                    <div className="text-center mb-2">
                      <div className="text-xs text-gray-500">{format(day, "EEE", { locale: de })}</div>
                      <div className="font-medium">{format(day, "d")}</div>
                    </div>
                    <div className="space-y-1">
                      {isLoadingSlots ? (
                        <div className="text-xs text-gray-400 text-center">...</div>
                      ) : (
                        getSlotsForDay(day).map((slot) => (
                          <div
                            key={slot.id}
                            className={`text-xs p-1.5 rounded border ${
                              slot.isBlocked
                                ? "bg-red-50 border-red-200"
                                : slot.bookedCount >= slot.capacity
                                ? "bg-orange-50 border-orange-200"
                                : "bg-green-50 border-green-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {formatSlotTime(slot.startTime)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 hover:bg-red-100"
                                onClick={() => deleteSlotMutation.mutate(slot.id)}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                            <div className="text-gray-500 mt-0.5">
                              {slot.capacity - (slot.bookedCount || 0)} / {slot.capacity} frei
                            </div>
                          </div>
                        ))
                      )}
                      {!isLoadingSlots && getSlotsForDay(day).length === 0 && (
                        <div className="text-xs text-gray-400 text-center py-4">
                          Keine Slots
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!selectedExperience && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Wählen Sie ein Erlebnis aus, um die Zeitslots zu verwalten</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Wie funktioniert's?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p><strong>1. Slots erstellen:</strong> Fügen Sie einzelne Zeitfenster hinzu oder generieren Sie viele auf einmal.</p>
          <p><strong>2. Kapazität festlegen:</strong> Bestimmen Sie, wie viele Personen pro Slot buchen können.</p>
          <p><strong>3. Kunden buchen:</strong> Kunden sehen verfügbare Slots mit "X übrig" wie bei Roller.app.</p>
          <p><strong>4. Automatisch aktualisiert:</strong> Gebuchte Plätze werden automatisch abgezogen.</p>
        </CardContent>
      </Card>
    </div>
  );
}
