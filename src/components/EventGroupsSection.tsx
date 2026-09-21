import { Link } from "wouter";
import {
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EVENT_CATEGORIES, type EventCategory } from "@/data/eventCategories";
import { resolvePartnerRoute } from "@/lib/activity-route-resolver";
import placeholderLogo from "@assets/event_groups/logos/placeholder_logo.png";

const CATEGORIES = EVENT_CATEGORIES;

function CategoryCard({ cat }: { cat: EventCategory }) {
  const Icon = cat.icon;
  return (
    <Card
      className="relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 rounded-3xl flex flex-col bg-white group hover:-translate-y-1"
      data-testid={`event-card-${cat.key}`}
    >
      {/* HERO HEAD */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={cat.bgImage}
          alt={cat.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

        {/* Ribbon */}
        <div className="absolute top-4 right-4 bg-white text-[11px] font-bold px-3 py-1 rounded-full shadow text-gray-900 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-[#6C2BD9]" />
          {cat.ribbon}
        </div>

        {/* Icon overlay */}
        <div className="absolute bottom-4 left-5">
          <div className={`${cat.iconBg} rounded-2xl p-3 shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* TITLE BLOCK */}
      <div className="px-5 pt-4">
        <h3 className="font-extrabold text-gray-900 text-xl leading-tight">
          {cat.title}
        </h3>
        <p className="text-xs text-gray-700 mt-1 line-clamp-2">
          {cat.subtitle}
        </p>
      </div>

      {/* BODY */}
      <div className="p-5 pt-4 flex flex-col gap-4 flex-1">
        {/* Bullets */}
        <div className="flex flex-wrap gap-2">
          {cat.bullets.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full"
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              {b}
            </span>
          ))}
        </div>

        {/* Partner thumbnails */}
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            Verfügbar bei diesen Partnern
          </p>
          <div className="grid grid-cols-2 gap-2">
            {cat.partners.map((p) => (
              <Link
                key={p.id}
                href={resolvePartnerRoute(p.id, p.badge)}
                className="group/p flex items-center gap-2 p-2 rounded-xl bg-gray-50 hover:bg-purple-50 border border-gray-100 hover:border-purple-200 transition cursor-pointer"
                data-testid={`partner-link-${p.id}`}
              >
                  <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={p.logo}
                      alt={p.name}
                      className="w-full h-full object-contain p-1"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = placeholderLogo;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-gray-900 line-clamp-1 group-hover/p:text-purple-700">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-gray-500 line-clamp-1">
                      {p.badge} · {p.city}
                    </div>
                  </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link href={`/gruppen-events/${cat.key}`}>
          <Button
            className="w-full h-11 mt-auto bg-[#6C2BD9] hover:bg-[#3D1A78] text-white font-bold rounded-full shadow group/cta"
            data-testid={`button-event-${cat.key}`}
          >
            <span className="flex items-center justify-center gap-1.5">
              {cat.cta}
              <ArrowRight className="h-4 w-4 group-hover/cta:translate-x-0.5 transition-transform" />
            </span>
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default function EventGroupsSection() {
  return (
    <section className="relative py-10 sm:py-14 bg-white">
      <div className="relative max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-7 gap-4">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 bg-[#6C2BD9] text-white text-[11px] font-bold px-3 py-1 rounded-full mb-3">
              <Users className="h-3 w-3" />
              GROSSE GRUPPEN
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              Plant euer Event mit FreizeitEngel
            </h2>
            <p className="text-sm text-gray-700 mt-1.5 max-w-xl">
              Geburtstag, Klassenausflug oder Firmenfeier – wir vermitteln euch
              direkt zum passenden Partner inkl. Sammelzahlung & Rechnungskauf.
            </p>
          </div>
          <Link href="/gruppen-events">
            <Button
              className="bg-[#6C2BD9] hover:bg-[#3D1A78] text-white font-semibold rounded-full px-5 gap-1 shadow whitespace-nowrap"
              data-testid="link-all-events"
            >
              Alle Event-Pakete <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.key} cat={cat} />
          ))}
        </div>

        {/* TRUST STRIP */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-700">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#6C2BD9]" />
            Persönlicher Event-Berater
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#6C2BD9]" />
            Stornierung bis 7 Tage vorher
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#6C2BD9]" />
            Rechnungskauf für Firmen & Schulen
          </span>
        </div>
      </div>
    </section>
  );
}
