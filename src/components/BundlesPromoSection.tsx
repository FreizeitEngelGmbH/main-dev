import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, CheckCircle2, Gift, MapPin, Sparkles } from "lucide-react";

type Bundle = {
  id: number;
  slug: string;
  city: string;
  title: string;
  tagline: string | null;
  hero_image_url: string | null;
  num_activities: number;
  num_surprises: number;
  duration_weeks: number;
  price_per_person: string;
};

function formatEUR(s: string) {
  const n = parseFloat(s);
  return isNaN(n) ? s : n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

export default function BundlesPromoSection() {
  const { data: bundles, isLoading } = useQuery<Bundle[]>({ queryKey: ["/api/bundles"] });

  if (!isLoading && (!bundles || bundles.length === 0)) return null;

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-[#3D1A78] via-[#6C2BD9] to-[#A78BFA] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#FFC83D] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#FFC83D] text-[#3D1A78] text-[11px] font-black px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
              <Gift className="h-3 w-3" /> Neu: Stadt-Pakete
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Erlebnis-Bundles je Stadt
            </h2>
            <p className="text-white/90 mt-2 max-w-2xl text-base md:text-lg">
              5 kuratierte Aktivitäten + 1 Überraschung. Wir planen alle Termine,
              ihr genießt nur. Perfekt für Teams, Geburtstage und Freundeskreise.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/90">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />Wir planen alle Termine</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />Sammelzahlung</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />Überraschung inklusive</span>
            </div>
          </div>
          <Link href="/bundles">
            <Button size="lg" className="bg-white text-[#3D1A78] hover:bg-[#FFC83D] hover:text-[#3D1A78] font-bold rounded-full px-5 gap-2 shadow-lg" data-testid="button-all-bundles">
              Alle Pakete <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-72 rounded-2xl bg-white/20" />)
          ) : (
            bundles!.slice(0, 3).map((b) => (
              <Link key={b.id} href={`/bundles/${b.slug}`}>
                <Card className="overflow-hidden group cursor-pointer border-0 h-full flex flex-col text-gray-900 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all" data-testid={`card-home-bundle-${b.slug}`}>
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#6C2BD9] to-[#3D1A78]">
                    {b.hero_image_url && (
                      <img src={b.hero_image_url} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      <Badge className="bg-white/95 text-[#3D1A78] border-0 font-bold gap-1"><MapPin className="h-3 w-3" />{b.city}</Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-xl font-black text-white drop-shadow">{b.title}</h3>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    {b.tagline && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{b.tagline}</p>}
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-4 flex-wrap">
                      <span className="bg-purple-100 text-[#6C2BD9] px-2 py-0.5 rounded-full font-bold">{b.num_activities} Aktivitäten</span>
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5"><Sparkles className="h-3 w-3" />{b.num_surprises} Überraschung</span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-bold">{b.duration_weeks} Wochen</span>
                    </div>
                    <div className="mt-auto flex items-end justify-between">
                      <div>
                        <div className="text-[11px] text-gray-500">ab</div>
                        <div className="text-2xl font-black text-[#3D1A78]">{formatEUR(b.price_per_person)}</div>
                        <div className="text-[11px] text-gray-500">pro Person</div>
                      </div>
                      <Button size="sm" className="bg-[#6C2BD9] hover:bg-[#3D1A78] text-white font-bold rounded-full px-3 gap-1" data-testid={`button-home-bundle-${b.slug}`}>
                        Ansehen <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
