import { useEffect } from "react";
import { Link, useParams } from "wouter";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Users,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EVENT_CATEGORIES, getEventCategory } from "@/data/eventCategories";
import { resolvePartnerRoute } from "@/lib/activity-route-resolver";
import placeholderLogo from "@assets/event_groups/logos/placeholder_logo.png";

export default function EventCategoryPage() {
  const { key } = useParams();
  const category = getEventCategory(key);

  useEffect(() => {
    if (category) {
      document.title = category.metaTitle;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", category.metaDescription);
    }
    return () => {
      document.title = "FreizeitEngel";
    };
  }, [category]);

  if (!category) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">
          Kategorie nicht gefunden
        </h1>
        <p className="text-gray-600 mb-6">
          Diese Event-Kategorie gibt es leider nicht (mehr).
        </p>
        <Link href="/">
          <Button className="bg-[#6C2BD9] hover:bg-[#3D1A78] text-white rounded-full">
            Zur Startseite
          </Button>
        </Link>
      </div>
    );
  }

  const Icon = category.icon;
  const others = EVENT_CATEGORIES.filter((c) => c.key !== category.key);

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className={`relative bg-gradient-to-br ${category.gradient} text-white`}>
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-white/80 mb-6">
            <Link href="/" className="hover:text-white">Start</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white font-semibold">{category.title}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur text-white text-[11px] font-bold px-3 py-1 rounded-full mb-4">
                <Users className="h-3 w-3" />
                GROSSE GRUPPEN
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/15 rounded-2xl p-3">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                  {category.title}
                </h1>
              </div>
              <p className="text-white/90 text-base sm:text-lg max-w-xl mb-5">
                {category.longDescription}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a href="#anbieter">
                  <Button className="bg-white text-[#3D1A78] hover:bg-white/90 font-bold rounded-full px-6 h-12 gap-1.5">
                    Passende Anbieter ansehen
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                <span className="inline-flex items-center gap-1.5 bg-[#FFC83D] text-[#3D1A78] text-sm font-bold px-4 py-2 rounded-full">
                  <Sparkles className="h-4 w-4" />
                  {category.ribbon}
                </span>
              </div>
            </div>

            {/* Foreground image card (not a background) */}
            <div className="hidden md:block">
              <div className="rounded-3xl overflow-hidden shadow-2xl bg-white/10 aspect-[4/3]">
                <img
                  src={category.bgImage}
                  alt={category.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
          Das ist inklusive
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {category.highlights.map((h) => (
            <div
              key={h}
              className="flex items-start gap-3 bg-[#F4F1FB] rounded-2xl p-4"
            >
              <CheckCircle2 className="h-5 w-5 text-[#6C2BD9] flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-gray-800">{h}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PROVIDERS */}
      <section id="anbieter" className="bg-[#F4F1FB] py-12 scroll-mt-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-7">
            <h2 className="text-2xl font-extrabold text-gray-900">
              Anbieter für {category.title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Wählt euren Wunsch-Partner und stellt direkt eine unverbindliche Anfrage.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {category.partners.map((p) => (
              <Card
                key={`${category.key}-${p.id}`}
                className="border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden bg-white flex flex-col"
                data-testid={`provider-card-${p.id}`}
              >
                <div className="p-5 flex flex-col gap-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={p.logo}
                        alt={p.name}
                        className="w-full h-full object-contain p-1.5"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = placeholderLogo;
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-gray-900 leading-tight line-clamp-1">
                        {p.name}
                      </h3>
                      {p.badge && (
                        <span className="inline-block text-[11px] font-bold text-[#6C2BD9] bg-[#6C2BD9]/10 px-2 py-0.5 rounded-full mt-1">
                          {p.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 flex-1">
                      {p.description}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-[#6C2BD9]" />
                    {p.city}
                  </div>

                  {/* DEMO: p.id is the real production partner id, which has
                      no matching shop page in this demo - resolvePartnerRoute
                      sends it to the closest category match (or Bowling)
                      instead of a dead /partners/:id link. */}
                  <Link
                    href={resolvePartnerRoute(p.id, p.badge)}
                    className="w-full"
                    data-testid={`provider-link-${p.id}`}
                  >
                    <Button className="w-full h-11 bg-[#6C2BD9] hover:bg-[#3D1A78] text-white font-bold rounded-full gap-1.5">
                      <MessageSquare className="h-4 w-4" />
                      Anbieter ansehen & anfragen
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">
          So einfach funktioniert's
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {category.steps.map((step, i) => (
            <div key={step.title} className="relative text-center px-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#6C2BD9] text-white font-extrabold text-lg flex items-center justify-center mb-4">
                {i + 1}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-[#3D1A78] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#FFC83D]" />
            Persönlicher Event-Berater
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#FFC83D]" />
            Stornierung bis 7 Tage vorher
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#FFC83D]" />
            Sammelzahlung & Rechnungskauf
          </span>
        </div>
      </section>

      {/* OTHER OCCASIONS */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
          Weitere Anlässe
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {others.map((c) => {
            const OtherIcon = c.icon;
            return (
              <Link
                key={c.key}
                href={`/gruppen-events/${c.key}`}
                className="group flex items-center justify-between gap-4 bg-[#F4F1FB] hover:bg-[#6C2BD9] hover:text-white transition-colors rounded-3xl p-5"
                data-testid={`other-category-${c.key}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="bg-[#6C2BD9] group-hover:bg-white/20 rounded-2xl p-3 flex-shrink-0">
                    <OtherIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold leading-tight">{c.title}</h3>
                    <p className="text-sm text-gray-600 group-hover:text-white/80 line-clamp-1">
                      {c.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6C2BD9] hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Startseite
          </Link>
        </div>
      </section>
    </div>
  );
}
