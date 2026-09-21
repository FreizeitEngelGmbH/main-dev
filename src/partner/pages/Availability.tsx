import { Plus } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useDemoData } from "../context/demo-data-context";
import { formatDateDE } from "../lib/format";

export default function Availability() {
  const { availabilitySlots } = useDemoData();

  const byDate = availabilitySlots.reduce<Record<string, typeof availabilitySlots>>((acc, s) => {
    (acc[s.date] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verfügbarkeit</h1>
          <p className="text-muted-foreground">Zeitfenster der nächsten Tage verwalten</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Zeitfenster hinzufügen
        </Button>
      </div>

      <div className="space-y-4">
        {Object.entries(byDate).map(([date, slots]) => (
          <Card key={date}>
            <CardContent className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">{formatDateDE(date)}</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {slots.map((slot) => {
                  const pct = Math.round((slot.booked / slot.capacity) * 100);
                  const full = slot.booked >= slot.capacity;
                  return (
                    <div key={slot.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{slot.time} Uhr</span>
                        <Badge variant={full ? "destructive" : pct > 60 ? "warning" : "success"}>
                          {slot.booked}/{slot.capacity}
                        </Badge>
                      </div>
                      <div className="mt-1 truncate text-xs text-muted-foreground">{slot.experienceTitle}</div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
