import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Gift, MapPin, Sparkles } from "lucide-react";
import { DEFAULT_ACTIVITY_DETAIL_ROUTE } from "@/lib/activity-route-resolver";

type Bundle = {
  id: number;
  slug: string;
  city: string;
  title: string;
  tagline: string | null;
  hero_image_url: string | null;
  num_activities: number;
  num_surprises: number;
  price_per_person: string;
  duration_weeks: number;
};

function formatEUR(s: string) {
  const n = parseFloat(s);
  return isNaN(n) ? s : n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

function BundleCard({ b }: { b: Bundle }) {
  return (
    // DEMO: no bundle detail page/API exists yet - route to the working
    // Bowling shop instead of a dead /bundles/:slug link. See
    // src/lib/activity-route-resolver.ts.
    <Link href={DEFAULT_ACTIVITY_DETAIL_ROUTE}>
      <Card className="overflow-hidden cursor-pointer group hover:shadow-xl transition-shadow border-2 border-transparent hover:border-[#6C2BD9]/40 h-full flex flex-col" data-testid={`card-bundle-${b.slug}`}>
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#6C2BD9] to-[#3D1A78]">
          {b.hero_image_url && (
            <img src={b.hero_image_url} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            <Badge className="bg-white/95 text-[#3D1A78] border-0 font-bold gap-1"><MapPin className="h-3 w-3" />{b.city}</Badge>
            <Badge className="bg-[#FFC83D] text-[#3D1A78] border-0 font-bold gap-1"><Gift className="h-3 w-3" />Stadt-Paket</Badge>
          </div>
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="text-xl font-black drop-shadow">{b.title}</h3>
            {b.tagline && <p className="text-sm text-white/90 mt-0.5 line-clamp-2">{b.tagline}</p>}
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div className="bg-purple-50 rounded-lg py-2">
              <div className="text-lg font-black text-[#6C2BD9]">{b.num_activities}</div>
              <div className="text-[10px] text-gray-600 leading-tight">Aktivitäten</div>
            </div>
            <div className="bg-amber-50 rounded-lg py-2">
              <div className="text-lg font-black text-amber-600 flex items-center justify-center gap-0.5"><Sparkles className="h-3.5 w-3.5" />{b.num_surprises}</div>
              <div className="text-[10px] text-gray-600 leading-tight">Überraschung</div>
            </div>
            <div className="bg-gray-50 rounded-lg py-2">
              <div className="text-lg font-black text-gray-800">{b.duration_weeks}</div>
              <div className="text-[10px] text-gray-600 leading-tight">Wochen</div>
            </div>
          </div>
          <div className="mt-auto flex items-end justify-between">
            <div>
              <div className="text-xs text-gray-500">ab</div>
              <div className="text-2xl font-black text-[#3D1A78]">{formatEUR(b.price_per_person)}</div>
              <div className="text-xs text-gray-500">pro Person</div>
            </div>
            <Button className="bg-[#6C2BD9] hover:bg-[#3D1A78] text-white font-bold rounded-full px-4 gap-1" data-testid={`button-bundle-${b.slug}`}>
              Ansehen <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function BundlesListPage() {
  const { data: bundles, isLoading } = useQuery<Bundle[]>({ queryKey: ["/api/bundles"] });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 to-white">
      <div className="bg-gradient-to-br from-[#3D1A78] via-[#6C2BD9] to-[#A78BFA] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur text-white text-[11px] font-bold px-3 py-1 rounded-full mb-3">
            <Gift className="h-3 w-3" /> NEU: STADT-PAKETE
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Erlebnis-Bundles je Stadt</h1>
          <p className="text-white/90 mt-3 max-w-2xl text-base md:text-lg">
            Wir kuratieren euch <strong>7 Aktivitäten + 1 Überraschung</strong> – Termine, Reservierungen
            und Sammelzahlung übernehmen wir. Ihr genießt nur. Perfekt für Teams, Geburtstage und Freundeskreise.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/90">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />Wir planen alle Termine</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />Sammelzahlung & Rechnung</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />Überraschungs-Aktivität inklusive</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Card key={i} className="h-96 animate-pulse bg-gray-100" />)}
          </div>
        ) : !bundles?.length ? (
          <Card className="p-10 text-center text-gray-500">Aktuell sind keine Bundles online.</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map(b => <BundleCard key={b.id} b={b} />)}
          </div>
        )}
      </div>
    </div>
  );
}
