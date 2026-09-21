import { Plus, Star, Users, Clock, Pencil } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { useDemoData } from "../context/demo-data-context";
import { formatEUR } from "../lib/format";

export default function Experiences() {
  const { experiences, toggleExperienceActive } = useDemoData();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Erlebnisse</h1>
          <p className="text-muted-foreground">{experiences.length} Angebote, davon {experiences.filter(e => e.active).length} aktiv</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Neues Erlebnis
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {experiences.map((exp) => (
          <Card key={exp.id} className="overflow-hidden">
            <div className="h-28 w-full" style={{ background: `linear-gradient(135deg, ${exp.imageColor}, ${exp.imageColor}99)` }} />
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold leading-snug text-foreground">{exp.title}</h3>
                <Switch checked={exp.active} onCheckedChange={() => toggleExperienceActive(exp.id)} />
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {exp.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> max. {exp.maxParticipants}
                </span>
                {exp.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {exp.rating.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-lg font-bold text-foreground">{formatEUR(exp.price)}</div>
                  <div className="text-xs text-muted-foreground">{exp.bookingsCount} Buchungen</div>
                </div>
                <Badge variant={exp.active ? "success" : "secondary"}>
                  {exp.active ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Pencil className="h-3.5 w-3.5" />
                Bearbeiten
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
