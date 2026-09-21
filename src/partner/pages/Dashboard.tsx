import { Link } from "wouter";
import { partnerPaths } from "../routes";
import {
  CalendarDays,
  Euro,
  Star,
  Layers,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useDemoData } from "../context/demo-data-context";
import { formatEUR, formatDateDE } from "../lib/format";

function StatCard({
  icon: Icon,
  label,
  value,
  changePct,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  changePct?: number;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          {changePct !== undefined && (
            <span
              className={`flex items-center gap-0.5 text-xs font-semibold ${
                changePct >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {changePct >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {Math.abs(changePct)}%
            </span>
          )}
        </div>
        <div className="mt-3 text-2xl font-bold text-foreground">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

const statusLabel: Record<string, { label: string; variant: "success" | "warning" | "secondary" | "destructive" }> = {
  confirmed: { label: "Bestätigt", variant: "success" },
  pending: { label: "Ausstehend", variant: "warning" },
  completed: { label: "Abgeschlossen", variant: "secondary" },
  cancelled: { label: "Storniert", variant: "destructive" },
};

export default function Dashboard() {
  const { profile, stats, bookings, messages } = useDemoData();
  const upcoming = bookings
    .filter((b) => b.status === "confirmed" || b.status === "pending")
    .slice(0, 5);
  const unreadMessages = messages.filter((m) => m.unread).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Willkommen zurück, {profile.contactPerson.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Hier ist dein Überblick für {profile.companyName}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Buchungen diesen Monat"
          value={String(stats.totalBookingsThisMonth)}
          changePct={stats.bookingsChangePct}
        />
        <StatCard
          icon={Euro}
          label="Umsatz diesen Monat"
          value={formatEUR(stats.revenueThisMonth)}
          changePct={stats.revenueChangePct}
        />
        <StatCard icon={Star} label={`${stats.reviewCount} Bewertungen`} value={stats.avgRating.toFixed(1)} />
        <StatCard icon={Layers} label="Aktive Erlebnisse" value={String(stats.activeExperiences)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Anstehende Buchungen</CardTitle>
            <Link href={partnerPaths.bookings} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Alle ansehen <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">{b.experienceTitle}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {b.customerName} · {formatDateDE(b.date)}, {b.time} Uhr · {b.participants} Pers.
                  </div>
                </div>
                <Badge variant={statusLabel[b.status].variant}>{statusLabel[b.status].label}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Neue Nachrichten</CardTitle>
            <Link href={partnerPaths.messages} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Alle <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {unreadMessages.length === 0 && (
              <p className="text-sm text-muted-foreground">Keine neuen Nachrichten.</p>
            )}
            {unreadMessages.map((m) => (
              <div key={m.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{m.customerName}</span>
                </div>
                <div className="mt-1 truncate text-xs text-muted-foreground">{m.preview}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
