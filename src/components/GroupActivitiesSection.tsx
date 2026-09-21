import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Users,
  Plus,
  Sparkles,
  Clock,
  MapPin,
  Share2,
  ArrowRight,
  Flame,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getGroupActivityImage } from "@/lib/group-activity-images";
import { resolveCategoryRoute } from "@/lib/activity-route-resolver";

const WEEKDAY_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function inDays(days: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// DEMO: local mock data standing in for the real /api/group-activities
// response, so this section shows a populated grid instead of the "Noch
// keine offenen Gruppen" empty state.
const DEMO_GROUPS = [
  {
    id: 1,
    title: "Mission Mars – 60 Min Rätsel-Spaß",
    category: "escape room",
    city: "Bielefeld",
    maxParticipants: 5,
    currentParticipants: 3,
    activityDate: inDays(1, 18, 30),
  },
  {
    id: 2,
    title: "Feierabend-Bowling mit Cocktails",
    category: "bowling",
    city: "Dortmund",
    maxParticipants: 8,
    currentParticipants: 5,
    activityDate: inDays(2, 19, 0),
  },
  {
    id: 3,
    title: "Boulder-Session für Einsteiger",
    category: "klettern",
    city: "Köln",
    maxParticipants: 6,
    currentParticipants: 6,
    activityDate: inDays(3, 17, 0),
  },
  {
    id: 4,
    title: "Schwimm-Date nach der Arbeit",
    category: "schwimmen",
    city: "Essen",
    maxParticipants: 10,
    currentParticipants: 4,
    activityDate: inDays(4, 18, 0),
  },
];

function formatStart(d: string | Date): string {
  return new Date(d).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CircularProgress({
  value,
  max,
  size = 44,
}: {
  value: number;
  max: number;
  size?: number;
}) {
  const pct = Math.min(value / max, 1);
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#E5E7EB"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#6C2BD9"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${dash} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 600ms ease" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="font-bold"
        style={{ fontSize: size * 0.32, fill: "#111" }}
      >
        {value}/{max}
      </text>
    </svg>
  );
}

function GroupCard({ group }: { group: any }) {
  const max = group.maxParticipants;
  const cur = group.currentParticipants || 0;
  const free = max - cur;
  const date = new Date(group.activityDate);
  const start = formatStart(date);
  const weekday = WEEKDAY_SHORT[date.getDay()];
  const day = date.getDate();
  const img = getGroupActivityImage(group);
  const avatarsToShow = Math.min(cur || 1, 3);
  const extraCount = Math.max((cur || 0) - avatarsToShow, 0);
  const isAlmostFull = free > 0 && free <= 2;
  // DEMO: this group has no real detail page/API yet - route to the closest
  // matching (or Bowling, as a last resort) working partner shop instead of
  // a dead /gruppen/:id link. See src/lib/activity-route-resolver.ts.
  const detailRoute = resolveCategoryRoute(group.category);

  return (
    <Card
      className="relative overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 rounded-3xl flex flex-col cursor-pointer"
      data-testid={`group-card-${group.id}`}
    >
      <Link href={detailRoute}>
        <div className="relative h-36 overflow-hidden">
          <img
            src={img}
            alt={group.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Date chip */}
          <div className="absolute top-3 left-3 bg-white rounded-2xl px-2.5 py-1 shadow flex flex-col items-center leading-none">
            <span className="text-[9px] font-bold text-[#6C2BD9] uppercase tracking-wider">
              {weekday}
            </span>
            <span className="text-lg font-extrabold text-gray-900">{day}</span>
          </div>

          {/* Top-right badges */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
            {isAlmostFull && (
              <div className="bg-[#FFC83D] text-gray-900 text-[10px] font-bold px-2 py-1 rounded-full shadow flex items-center gap-1">
                <Flame className="h-3 w-3" />
                Fast voll
              </div>
            )}
            <button
              className="w-8 h-8 rounded-full bg-white text-gray-800 hover:text-[#6C2BD9] flex items-center justify-center transition shadow"
              aria-label="Teilen"
              data-testid={`button-share-${group.id}`}
              onClick={(e) => {
                e.preventDefault();
                if (navigator.share) {
                  navigator.share({
                    title: group.title,
                    url: `${window.location.origin}${detailRoute}`,
                  });
                } else {
                  navigator.clipboard.writeText(
                    `${window.location.origin}${detailRoute}`,
                  );
                }
              }}
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </Link>

      {/* BODY */}
      <Link href={detailRoute}>
        <div className="p-4 flex flex-col gap-3 flex-1">
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2">
              {group.title}
            </h3>
            <div className="flex items-center gap-2.5 mt-1.5 text-[11px] text-gray-700 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {start}
              </span>
              {group.city && (
                <>
                  <span className="opacity-50">•</span>
                  <span className="flex items-center gap-1 line-clamp-1">
                    <MapPin className="h-3 w-3" />
                    {group.city}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CircularProgress value={cur} max={max} />
            <div className="flex items-center -space-x-2 flex-1 min-w-0">
              {Array.from({ length: avatarsToShow }).map((_, i) => (
                <Avatar
                  key={i}
                  className="h-8 w-8 border-2 border-white shadow"
                >
                  <AvatarFallback className="text-[11px] font-bold bg-[#6C2BD9] text-white">
                    {String.fromCharCode(65 + i)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {extraCount > 0 && (
                <div className="h-8 px-2.5 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[11px] font-bold text-gray-900 shadow">
                  +{extraCount}
                </div>
              )}
            </div>
          </div>

          <Button
            size="sm"
            className="w-full h-10 bg-[#6C2BD9] hover:bg-[#3D1A78] text-white text-sm font-bold rounded-full shadow"
            disabled={free === 0}
            data-testid={`button-join-${group.id}`}
          >
            {free === 0 ? (
              "Ausgebucht"
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                Mitmachen
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            )}
          </Button>
        </div>
      </Link>
    </Card>
  );
}

function CreateOwnCard() {
  return (
    <Link href="/gruppen">
      <Card
        className="relative overflow-hidden border-2 border-dashed border-[#A78BFA] bg-white hover:bg-purple-50 transition-all duration-300 rounded-3xl cursor-pointer flex items-center justify-center group hover:shadow-lg hover:-translate-y-1 min-h-[280px]"
        data-testid="card-create-group"
      >
        <div className="text-center px-4">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#6C2BD9] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Plus className="h-7 w-7 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-1">
            Eigene Gruppe starten
          </h3>
          <p className="text-xs text-gray-700 leading-snug">
            Lade Freunde ein oder warte, bis sich Spontane anschließen.
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#6C2BD9]">
            Jetzt loslegen <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function GroupActivitiesSection() {
  const { data: groups, isLoading } = useQuery<any[]>({
    queryKey: ["/api/group-activities", "open"],
    // DEMO: real file called fetch("/api/group-activities?...") directly here,
    // bypassing the shared mocked queryClient. Replaced with local mock
    // resolution so this component can never issue a real network request.
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 250));
      return DEMO_GROUPS;
    },
  });

  const visibleGroups = (groups || []).slice(0, 4);

  return (
    <section className="relative py-10 sm:py-14 bg-white">
      <div className="relative max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-7 gap-4">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 bg-[#6C2BD9] text-white text-[11px] font-bold px-3 py-1 rounded-full mb-3">
              <Sparkles className="h-3 w-3" />
              MACH-MIT-GRUPPEN
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              Andere sind schon dabei. Sei spontan dabei.
            </h2>
            <p className="text-sm text-gray-700 mt-1.5 max-w-xl">
              Tritt offenen Gruppen bei oder starte deine eigene Aktivität –
              perfekt unter der Woche.
            </p>
          </div>
          <Link href="/gruppen">
            <Button
              className="bg-[#6C2BD9] hover:bg-[#3D1A78] text-white font-semibold rounded-full px-5 gap-1 shadow whitespace-nowrap"
              data-testid="link-all-groups"
            >
              Alle Gruppen <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* GRID */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-72 rounded-3xl" />
            ))}
          </div>
        ) : visibleGroups.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 rounded-3xl border-2 border-dashed border-gray-200 bg-white p-10 text-center flex flex-col items-center justify-center">
              <Users className="h-12 w-12 text-[#A78BFA] mb-2" />
              <p className="text-base font-semibold text-gray-900 mb-1">
                Noch keine offenen Gruppen
              </p>
              <p className="text-sm text-gray-700">
                Sei die/der Erste und starte eine Aktivität!
              </p>
            </div>
            <CreateOwnCard />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleGroups.map((g) => (
              <GroupCard key={g.id} group={g} />
            ))}
            {visibleGroups.length < 4 && <CreateOwnCard />}
          </div>
        )}

        {/* FOOTER STRIP */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-700">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#6C2BD9]" />
            Sichere Sammelzahlung mit Stripe
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#6C2BD9]" />
            5 Mo–Do-Aktivitäten = 5 € Gutschein
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#6C2BD9]" />
            Buddy-System für Singles
          </span>
        </div>
      </div>
    </section>
  );
}
