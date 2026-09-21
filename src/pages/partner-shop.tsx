import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Star, MapPin, Clock, Phone, Mail, Globe, ChevronRight, Ticket, ShoppingCart,
  Navigation, ChevronLeft, CheckCircle, Shield, Zap, QrCode, TrendingUp,
  MessageSquare, Gift, Users, ArrowRight, Send, Plus, ThumbsUp, Sparkles,
  Mountain, TreePine, Waves, Film, CircleDot, Target, Key, Flag, Footprints,
  Landmark, Music, Dumbbell,
} from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import GroupInquiryForm from "@/components/GroupInquiryForm";
import { demoShopPartners, demoShopExperiences } from "@/partner-demo/demo-data";
import { partnerIdExists, DEFAULT_ACTIVITY_PARTNER_ID } from "@/lib/activity-route-resolver";

/**
 * Public partner storefront ("Shop ansehen" from the Partner Dashboard).
 * Ported section-for-section from the real app's client/src/pages/
 * partner-shop-page.tsx: hero, trust strip, ticket grid, group-inquiry
 * form, reviews, location & contact and the FAQ/newsletter/footer block.
 * Backed by local mock data instead of GET /api/partners/:id and
 * GET /api/experiences - the "Buchen" actions add to the existing demo
 * cart instead of opening the real app's full booking/payment dialogs,
 * which are out of scope for this demo.
 */
export default function PartnerShop() {
  const { id: rawId } = useParams();
  const [, setLocation] = useLocation();
  const { addToCart } = useCart();
  const { toast } = useToast();

  // This demo only has fully working shop data for a handful of partner
  // ids (demoShopPartners). Any other/unknown id (a stale link, a typo,
  // a card whose real id has no matching shop) falls back to the Bowling
  // shop instead of showing a dead "not found" screen - see
  // src/lib/activity-route-resolver.ts for the click-site version of the
  // same fallback.
  const id = partnerIdExists(rawId) ? String(rawId) : String(DEFAULT_ACTIVITY_PARTNER_ID);

  const { data: partner, isLoading: partnerLoading } = useQuery<any>({
    queryKey: [`/api/partners/${id}`],
    enabled: !!id,
  });

  const { data: allExperiences, isLoading: experiencesLoading } = useQuery<any[]>({
    queryKey: ["/api/experiences"],
    enabled: !!id,
  });

  const experiences = allExperiences?.filter((exp: any) => exp.partnerId === Number(id)) || [];
  const isLoading = partnerLoading || experiencesLoading;

  const scrollToTickets = () => {
    document.getElementById("tickets-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/");
    }
  };

  const handleBook = (experience: any) => {
    addToCart({
      experienceId: experience.id,
      title: experience.title,
      price: experience.price || 0,
      imageUrl: experience.imageUrl,
      partnerName: partner?.companyName,
      partnerId: Number(id),
    });
    toast({
      title: "Hinzugefügt!",
      description: `${experience.title} wurde zum Warenkorb hinzugefügt.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-72 bg-gray-200"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-48 bg-gray-200 rounded-xl"></div>
              <div className="h-48 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Partner nicht gefunden</h2>
          <Button onClick={() => setLocation("/")}>Zurück zur Startseite</Button>
        </div>
      </div>
    );
  }

  const heroImage = experiences[0]?.imageUrl || null;
  const categoryLabel = partner.category || "Erlebnis";
  const rankingNumber = (Number(id) % 10) + 1;

  return (
    <div className="min-h-screen bg-white">
      {/* HERO - Full-bleed image like Netflix */}
      <div className="relative min-h-[480px] md:min-h-[580px] overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage}
            alt={partner.companyName}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="scale-[8]">{getCategoryIcon(experiences[0] || {})}</div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 h-full flex flex-col justify-end pb-12 pt-20 md:pt-32">
          {/* Top bar */}
          <div className="absolute top-6 left-6 md:left-12 right-6 md:right-12 flex items-center justify-between">
            <button
              onClick={goBack}
              className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all"
              data-testid="btn-back"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="bg-white backdrop-blur-md border border-white/30 rounded-2xl px-4 py-2 shadow-lg">
              {partner.logoUrl ? (
                <img src={partner.logoUrl} alt="Logo" className="h-7 md:h-8 w-auto object-contain" />
              ) : (
                <span className="text-sm md:text-base font-bold text-gray-800 tracking-tight">{partner.companyName}</span>
              )}
            </div>
          </div>

          {/* Bottom content */}
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded-full">TOP {rankingNumber} in {partner.city}</span>
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{categoryLabel}</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight mb-4 leading-[1.05] drop-shadow-lg">
              {partner.companyName}<span className="text-blue-400">.</span>
            </h1>

            <p className="text-white/70 text-base md:text-lg leading-relaxed mb-5 max-w-xl">
              {partner.description || `Entdecke ${partner.companyName} – das perfekte Erlebnis für unvergessliche Momente.`}
            </p>

            {/* Price + Rating + Status */}
            <div className="flex flex-wrap items-center gap-5 mb-7">
              {experiences.length > 0 && (
                <div>
                  <span className="text-sm text-white/50">Ab</span>
                  <span className="text-3xl font-black text-white ml-1">
                    {Math.min(...experiences.map((e: any) => Number(e.price) || 99)).toFixed(2).replace(".", ",")}€
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-4 w-4 ${s <= 4 ? "fill-amber-400 text-amber-400" : "fill-white/20 text-white/20"}`} />
                ))}
                <span className="text-white font-bold text-sm ml-1">4,7</span>
              </div>
              <span className="text-green-400 font-semibold text-sm flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                Geöffnet
              </span>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <Button
                onClick={scrollToTickets}
                className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-6 text-base rounded-full shadow-2xl transition-all hover:-translate-y-0.5"
              >
                Jetzt buchen
              </Button>
            </div>

            {/* Quick info chips */}
            <div className="flex flex-wrap gap-2">
              {partner.address && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${partner.address}, ${partner.postalCode} ${partner.city}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 text-white/80 text-xs hover:bg-white/20 transition-colors"
                >
                  <MapPin className="h-3 w-3" /> {partner.city || "Route planen"}
                </a>
              )}
              {partner.phone && (
                <a href={`tel:${partner.phone}`} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 text-white/80 text-xs hover:bg-white/20 transition-colors">
                  <Phone className="h-3 w-3" /> {partner.phone}
                </a>
              )}
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 text-white/80 text-xs">
                <Clock className="h-3 w-3" /> {formatTodayHours(partner.openingHours)}
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute bottom-12 right-6 md:right-12 hidden md:flex flex-col gap-3">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Verifizierter Partner</p>
                <p className="text-[10px] text-white/50">Geprüft & sicher</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center">
                <QrCode className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">QR-Code Eintritt</p>
                <p className="text-[10px] text-white/50">Einfach vorzeigen</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRUST STRIP */}
      <div className="bg-gray-900 py-3 overflow-hidden">
        <div className="flex items-center justify-center gap-8 md:gap-16 px-6">
          {[
            { icon: <Shield className="h-4 w-4" />, text: "Verifizierter Partner" },
            { icon: <Zap className="h-4 w-4" />, text: "Sofort-Bestätigung" },
            { icon: <QrCode className="h-4 w-4" />, text: "QR-Code Eintritt" },
            { icon: <CheckCircle className="h-4 w-4" />, text: "Kostenlose Stornierung" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-white/80 whitespace-nowrap">
              {item.icon}
              <span className="text-xs font-medium hidden sm:inline">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TICKETS */}
      <div id="tickets-section" className="max-w-7xl mx-auto px-4 md:px-12 py-10">
        <div className="mb-6">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Unsere Angebote</p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">Tickets & Erlebnisse</h2>
        </div>

        {experiences.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Ticket className="h-10 w-10 text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">Keine Angebote verfügbar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {experiences.map((exp: any, i: number) => (
              <TicketCard key={exp.id} experience={exp} index={i} partner={partner} onBook={handleBook} />
            ))}
          </div>
        )}
      </div>

      {/* GRUPPENANFRAGEN: Kindergeburtstag, Schulklasse, Firmenevent */}
      {partner && (
        <GroupInquiryForm partnerId={Number(id)} partnerName={partner.companyName} city={partner.city || ""} />
      )}

      {/* Kundenbewertungen */}
      {partner && <PartnerReviews partnerName={partner.companyName} />}

      {/* LOCATION & CONTACT */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Standort & Kontakt</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Static map card (no live map tiles in the demo) */}
          <div className="md:col-span-2 relative bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 rounded-2xl overflow-hidden shadow-lg min-h-[350px] flex flex-col items-center justify-center border border-gray-100">
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{ backgroundImage: "radial-gradient(circle, #475569 1px, transparent 1px)", backgroundSize: "22px 22px" }}
            />
            <div className="relative z-10 flex flex-col items-center text-center px-6">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <p className="font-bold text-gray-900 text-lg">{partner.companyName}</p>
              <p className="text-gray-500 text-sm mt-1">{partner.address}</p>
              <p className="text-gray-500 text-sm">{partner.postalCode} {partner.city}</p>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${partner.address}, ${partner.postalCode} ${partner.city}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 mt-6"
            >
              <Button className="bg-white hover:bg-gray-50 text-gray-900 font-bold shadow-lg border border-gray-200 rounded-xl" data-testid="btn-directions">
                <Navigation className="h-4 w-4 mr-2" />
                Route planen
              </Button>
            </a>
          </div>

          {/* Info sidebar */}
          <div className="space-y-4">
            {/* Address card */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5" />
                <h3 className="font-bold text-sm">Adresse</h3>
              </div>
              <p className="text-white/90 text-sm">{partner.address}</p>
              <p className="text-white/90 text-sm">{partner.postalCode} {partner.city}</p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${partner.address}, ${partner.postalCode} ${partner.city}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold bg-white/20 hover:bg-white/30 rounded-full px-3 py-1.5 transition-colors"
              >
                <Navigation className="h-3 w-3" /> Route planen
              </a>
            </div>

            {/* Verleihmaterial - nur für Klettern/Bouldern */}
            {(partner.category?.toLowerCase().includes("kletter") ||
              partner.category?.toLowerCase().includes("boulder") ||
              partner.companyName?.toLowerCase().includes("kletter") ||
              partner.companyName?.toLowerCase().includes("boulder")) && (
              <div className="bg-stone-800 rounded-2xl shadow-md p-5 text-white">
                <h3 className="text-cyan-400 font-bold text-sm mb-3 text-center tracking-widest uppercase">
                  Verleihmaterial
                </h3>
                <div className="border border-stone-600 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-4 text-xs">
                    <div className="p-2.5 border-b border-r border-stone-600 font-semibold text-stone-300">Gurt</div>
                    <div className="p-2.5 border-b border-r border-stone-600 font-semibold text-stone-300">Schuhe</div>
                    <div className="p-2.5 border-b border-r border-stone-600 font-semibold text-stone-300">Sicherungsgerät</div>
                    <div className="p-2.5 border-b border-stone-600 font-semibold text-stone-300">Vorstiegsseil</div>
                    <div className="p-2.5 border-r border-stone-600 text-white font-medium">2,00€</div>
                    <div className="p-2.5 border-r border-stone-600 text-white font-medium">4,00€</div>
                    <div className="p-2.5 border-r border-stone-600 text-white font-medium">1,00€</div>
                    <div className="p-2.5 text-white font-medium">1,50€</div>
                  </div>
                </div>
              </div>
            )}

            {/* Opening Hours */}
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h3 className="text-gray-900 font-bold text-sm mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Öffnungszeiten
              </h3>
              <OpeningHours openingHours={partner.openingHours} />
              <div className="mt-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-600 text-xs font-bold">Jetzt geöffnet</span>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h3 className="text-gray-900 font-bold text-sm mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-500" />
                Kontakt
              </h3>
              <div className="space-y-2.5">
                {partner.phone && (
                  <a href={`tel:${partner.phone}`} className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-blue-600 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Phone className="h-4 w-4 text-blue-500" />
                    </div>
                    {partner.phone}
                  </a>
                )}
                {partner.email && (
                  <a href={`mailto:${partner.email}`} className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-blue-600 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Mail className="h-4 w-4 text-blue-500" />
                    </div>
                    {partner.email}
                  </a>
                )}
                {partner.website && (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-blue-600 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Globe className="h-4 w-4 text-blue-500" />
                    </div>
                    Website besuchen
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Selling: Andere Aktivitäten in der Stadt (+ FAQ, Newsletter, Footer) */}
      {partner && <CityRecommendations currentPartnerId={Number(id)} city={partner.city} />}
    </div>
  );
}

function TicketCard({ experience, index, partner, onBook }: { experience: any; index: number; partner: any; onBook: (e: any) => void }) {
  const gradientColors = [
    "from-blue-600 to-indigo-700",
    "from-emerald-500 to-teal-600",
    "from-purple-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-red-600",
    "from-cyan-500 to-blue-600",
  ];
  const isBowling = (experience.categoryName || "").toLowerCase().includes("bowling") ||
    (partner?.companyName || "").toLowerCase().includes("bowling");

  return (
    <div
      className="bg-white rounded-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300 relative border border-gray-100 flex flex-col h-full"
      onClick={() => onBook(experience)}
    >
      <div className="relative h-40 overflow-hidden flex-shrink-0">
        {experience.imageUrl ? (
          <img src={experience.imageUrl} alt={experience.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradientColors[index % gradientColors.length]} flex items-center justify-center`}>
            <div className="text-white/30 scale-[2.5] group-hover:scale-[3] transition-transform duration-700">{getCategoryIcon(experience)}</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {index === 0 && (
          <div className="absolute top-2.5 left-2.5 bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
            <TrendingUp className="h-2.5 w-2.5" /> TOP-TICKET
          </div>
        )}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onBook(experience); }}
            className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 hover:text-white transition-colors text-gray-700"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="p-3.5 flex-1 flex flex-col">
        <div className="flex items-center gap-0.5 mb-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
          ))}
          <span className="text-[9px] text-gray-400 ml-1">(47)</span>
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
          {experience.title}
        </h3>
        <p className="text-gray-400 text-[11px] mb-2 line-clamp-2 flex-1">
          {experience.shortDescription || `Erlebe ${experience.title} bei ${partner.companyName}`}
        </p>
        <div className="flex items-end justify-between mt-auto pt-2 border-t border-gray-100">
          <div>
            <span className="text-lg font-black text-gray-900">{experience.price?.toFixed(2).replace(".", ",")}€</span>
            <span className="text-[10px] text-gray-400 ml-0.5">{isBowling ? "/Bahn" : "/Person"}</span>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-full font-bold shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all text-[11px]"
            onClick={(e) => { e.stopPropagation(); onBook(experience); }}
          >
            Buchen
          </Button>
        </div>
      </div>
    </div>
  );
}

function getCategoryIcon(experience: any) {
  const title = (experience?.title || "").toLowerCase();
  const category = (experience?.categoryName || "").toLowerCase();
  if (category.includes("boulder") || category.includes("kletter") || title.includes("kletter") || title.includes("boulder")) {
    return <Mountain className="h-10 w-10" />;
  }
  if (category.includes("bowling") || title.includes("bowling")) return <CircleDot className="h-10 w-10" />;
  if (category.includes("escape") || title.includes("escape")) return <Key className="h-10 w-10" />;
  if (category.includes("kino") || title.includes("kino") || title.includes("film")) return <Film className="h-10 w-10" />;
  if (category.includes("minigolf") || title.includes("minigolf")) return <Flag className="h-10 w-10" />;
  if (category.includes("lasertag") || title.includes("laser")) return <Target className="h-10 w-10" />;
  if (category.includes("trampolin") || title.includes("trampolin")) return <Footprints className="h-10 w-10" />;
  if (category.includes("museum") || title.includes("museum")) return <Landmark className="h-10 w-10" />;
  if (category.includes("schwimm") || title.includes("schwimm") || title.includes("bad")) return <Waves className="h-10 w-10" />;
  if (category.includes("theater") || title.includes("theater")) return <Music className="h-10 w-10" />;
  if (category.includes("fitness") || category.includes("sport")) return <Dumbbell className="h-10 w-10" />;
  if (category.includes("park") || category.includes("natur")) return <TreePine className="h-10 w-10" />;
  return <Ticket className="h-10 w-10" />;
}

function formatTodayHours(openingHoursJson?: string) {
  if (!openingHoursJson) return "Auf Anfrage";
  try {
    const parsed = JSON.parse(openingHoursJson);
    const today = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date().getDay()];
    return parsed[today] ? `Heute ${parsed[today]} Uhr` : "Heute geöffnet";
  } catch {
    return "Heute geöffnet";
  }
}

function OpeningHours({ openingHours }: { openingHours?: string }) {
  const dayLabels: Record<string, string> = {
    monday: "Montag", tuesday: "Dienstag", wednesday: "Mittwoch",
    thursday: "Donnerstag", friday: "Freitag", saturday: "Samstag", sunday: "Sonntag",
  };
  if (!openingHours) {
    return (
      <div className="space-y-1.5">
        {["Mo - Fr", "Sa - So"].map((day, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{day}</span>
            <span className="text-gray-900 font-medium">{i === 0 ? "09:00 - 22:00" : "10:00 - 22:00"}</span>
          </div>
        ))}
      </div>
    );
  }
  try {
    const parsed = JSON.parse(openingHours);
    const entries = Object.entries(parsed);
    const grouped: { label: string; time: string }[] = [];
    let i = 0;
    while (i < entries.length) {
      const [key, val] = entries[i];
      let j = i + 1;
      while (j < entries.length && entries[j][1] === val) j++;
      const startLabel = dayLabels[key] || key;
      const endLabel = j > i + 1 ? dayLabels[entries[j - 1][0]] || entries[j - 1][0] : "";
      const label = endLabel ? `${startLabel} – ${endLabel}` : startLabel;
      grouped.push({ label, time: val as string });
      i = j;
    }
    return (
      <div className="space-y-1.5">
        {grouped.map((g, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{g.label}</span>
            <span className="text-gray-900 font-medium">{g.time} Uhr</span>
          </div>
        ))}
      </div>
    );
  } catch {
    return null;
  }
}

function PartnerReviews({ partnerName }: { partnerName: string }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [localReviews, setLocalReviews] = useState<any[]>([]);

  const googleReviews = [
    { id: "g1", guestName: "Anna M.", rating: 5, title: "Absolut empfehlenswert!", content: "Wir waren mit der ganzen Familie da und hatten einen wunderbaren Tag. Die Mitarbeiter waren super freundlich und alles war bestens organisiert. Kommen definitiv wieder!", createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), isGoogle: true, avatar: "AM" },
    { id: "g2", guestName: "Thomas K.", rating: 4, title: "Toller Ausflug", content: "Super Erlebnis, faire Preise und eine schöne Atmosphäre. Einzig die Parkplatzsituation könnte besser sein. Ansonsten top!", createdAt: new Date(Date.now() - 12 * 86400000).toISOString(), isGoogle: true, avatar: "TK" },
    { id: "g3", guestName: "Sarah L.", rating: 5, title: "Perfekt für Kinder!", content: "Unsere Kinder hatten richtig Spaß! Alles war sauber, die Preise fair und das Personal total nett. Haben gleich nächste Woche wieder gebucht.", createdAt: new Date(Date.now() - 18 * 86400000).toISOString(), isGoogle: true, avatar: "SL" },
    { id: "g4", guestName: "Michael B.", rating: 5, title: "Immer wieder gerne", content: "Schon mehrmals hier gewesen und jedes Mal begeistert. Die Qualität stimmt einfach und man merkt, dass hier mit Liebe gearbeitet wird.", createdAt: new Date(Date.now() - 25 * 86400000).toISOString(), isGoogle: true, avatar: "MB" },
    { id: "g5", guestName: "Julia W.", rating: 4, title: "Schöner Familienausflug", content: "Wir hatten einen tollen Nachmittag. Die Online-Buchung hat super funktioniert und wir konnten ohne Wartezeit rein. Gerne wieder!", createdAt: new Date(Date.now() - 32 * 86400000).toISOString(), isGoogle: true, avatar: "JW" },
    { id: "g6", guestName: "Patrick S.", rating: 5, title: "Top Preis-Leistung", content: "Sehr gutes Angebot zu fairen Preisen. Die Buchung über FreizeitEngel war einfach und schnell. Kann ich nur empfehlen!", createdAt: new Date(Date.now() - 40 * 86400000).toISOString(), isGoogle: true, avatar: "PS" },
  ];

  const allReviews = [...localReviews, ...googleReviews];
  const avgRating = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0;
  const displayedReviews = showAll ? allReviews : allReviews.slice(0, 6);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Heute";
    if (days === 1) return "Gestern";
    if (days < 7) return `Vor ${days} Tagen`;
    if (days < 30) return `Vor ${Math.floor(days / 7)} Wochen`;
    return `Vor ${Math.floor(days / 30)} Monaten`;
  };

  const handleSubmit = () => {
    if (!reviewRating || !reviewTitle.trim() || !reviewContent.trim() || !reviewName.trim()) {
      toast({ title: "Bitte alle Felder ausfüllen", description: "Bewertung, Name, Titel und Text sind erforderlich.", variant: "destructive" });
      return;
    }
    setLocalReviews((prev) => [
      { id: `local-${Date.now()}`, guestName: reviewName, rating: reviewRating, title: reviewTitle, content: reviewContent, createdAt: new Date().toISOString(), isGoogle: false },
      ...prev,
    ]);
    toast({ title: "Bewertung gesendet!", description: "Vielen Dank für dein Feedback." });
    setShowForm(false);
    setReviewRating(0);
    setReviewTitle("");
    setReviewContent("");
    setReviewName("");
  };

  return (
    <div id="reviews-section" className="max-w-7xl mx-auto px-4 md:px-12 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <h2 className="text-xl md:text-2xl font-black text-gray-900">Google Bewertungen</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-gray-900">{avgRating.toFixed(1)}</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
              ))}
            </div>
            <span className="text-gray-400 text-sm">({allReviews.length} Bewertungen)</span>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-full">
          <Plus className="h-4 w-4 mr-1" />
          Bewertung schreiben
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 mb-8 border border-purple-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400" />
            Deine Bewertung für {partnerName}
          </h3>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-600 text-sm mb-2 block">Bewertung</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setReviewRating(s)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star className={`h-8 w-8 transition-colors ${s <= (hoverRating || reviewRating) ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-gray-400"}`} />
                  </button>
                ))}
                {reviewRating > 0 && (
                  <span className="text-sm text-gray-500 ml-2 self-center">
                    {["", "Schlecht", "Geht so", "Gut", "Sehr gut", "Ausgezeichnet"][reviewRating]}
                  </span>
                )}
              </div>
            </div>
            <div>
              <Label className="text-gray-600 text-sm mb-1 block">Dein Name</Label>
              <Input value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="Max Mustermann" className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" />
            </div>
            <div>
              <Label className="text-gray-600 text-sm mb-1 block">Titel</Label>
              <Input value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="z.B. Tolles Erlebnis für die ganze Familie!" className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" />
            </div>
            <div>
              <Label className="text-gray-600 text-sm mb-1 block">Deine Erfahrung</Label>
              <Textarea value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} placeholder="Erzähle anderen von deinem Erlebnis..." rows={4} className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSubmit} className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-semibold">
                <span className="flex items-center gap-2"><Send className="h-4 w-4" /> Bewertung absenden</span>
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-900">
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedReviews.map((review: any) => {
          const avatarColors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-rose-500", "bg-amber-500", "bg-cyan-500", "bg-indigo-500", "bg-pink-500"];
          const colorIdx = typeof review.id === "string" ? review.id.charCodeAt(1) % avatarColors.length : 0;
          const initials = review.avatar || (review.guestName || "A").split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
          return (
            <div key={review.id} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full ${avatarColors[colorIdx]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-900 text-sm truncate">{review.guestName || "Anonym"}</span>
                    {review.isGoogle && (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400">{timeAgo(review.createdAt)}</div>
                </div>
              </div>
              <div className="flex items-center gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                ))}
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">{review.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{review.content}</p>
              {review.helpfulCount > 0 && (
                <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                  <ThumbsUp className="h-3 w-3" />
                  {review.helpfulCount} hilfreich
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allReviews.length > 6 && !showAll && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={() => setShowAll(true)} className="text-gray-700 border-gray-200 hover:bg-gray-50 font-semibold rounded-full">
            Alle {allReviews.length} Bewertungen anzeigen
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

function CityRecommendations({ currentPartnerId, city }: { currentPartnerId: number; city: string }) {
  const [, setLocation] = useLocation();
  const displayPartners = demoShopPartners.filter((p) => p.city === city && p.id !== currentPartnerId).slice(0, 6);

  const getMinPrice = (partnerId: number) => {
    const partnerExps = demoShopExperiences.filter((e) => e.partnerId === partnerId);
    if (partnerExps.length === 0) return null;
    return Math.min(...partnerExps.map((e) => Number(e.price)));
  };

  return (
    <>
      {displayPartners.length > 0 && (
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <div className="relative">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-4">
                <Sparkles className="h-4 w-4 text-orange-400" />
                <span className="text-orange-500 text-sm font-medium">Empfehlungen für dich</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Beliebte Aktivitäten in <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">{city}</span>
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">
                Andere Nutzer interessieren sich auch für diese Erlebnisse – entdecke was {city} noch zu bieten hat
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayPartners.map((p) => {
                const minPrice = getMinPrice(p.id);
                return (
                  <div key={p.id} className="group relative cursor-pointer rounded-2xl overflow-hidden" onClick={() => setLocation(`/partners/${p.id}`)}>
                    <div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900">
                      <div className="absolute inset-0 flex items-center justify-center opacity-20 scale-[2.5]">
                        {getCategoryIcon({ categoryName: p.category })}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <div className="bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
                          <span className="text-white text-xs font-semibold">{p.category}</span>
                        </div>
                      </div>
                      {minPrice !== null && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-emerald-500 rounded-full px-3 py-1.5 shadow-lg shadow-emerald-500/30">
                            <span className="text-white text-xs font-bold">Tickets ab {minPrice.toFixed(0)}€</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center border-2 border-white/20 shadow-lg overflow-hidden flex-shrink-0 bg-gray-800">
                            <Ticket className="h-5 w-5 text-gray-300" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-white text-lg leading-tight truncate group-hover:text-purple-200 transition-colors">
                              {p.companyName}
                            </h3>
                            <div className="flex items-center gap-1 text-gray-300 text-sm mt-0.5">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{p.city}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-300/80 text-sm line-clamp-2 leading-relaxed mb-3">{p.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                            <Users className="h-3.5 w-3.5" />
                            <span>Beliebt bei Nutzern</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-sm font-medium group-hover:bg-purple-500/80 transition-all duration-300">
                            <span>Entdecken</span>
                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FAQ SECTION */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <MessageSquare className="h-4 w-4" />
              Häufige Fragen
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">Hast du noch Fragen?</h2>
            <p className="text-gray-500 mt-2">Hier findest du Antworten auf die häufigsten Fragen rund um deine Buchung</p>
          </div>
          <div className="space-y-3">
            {[
              { q: "Wie funktioniert die Buchung?", a: "Wähle einfach dein gewünschtes Ticket aus, gib deine Daten ein und schließe die Buchung ab. Du erhältst sofort eine Bestätigung per E-Mail mit deinem QR-Code Ticket." },
              { q: "Kann ich meine Buchung stornieren?", a: "Ja, du kannst deine Buchung bis zu 24 Stunden vor dem gebuchten Termin kostenlos stornieren. Kontaktiere dazu einfach unseren Kundenservice oder nutze den Stornierungslink in deiner Bestätigungs-E-Mail." },
              { q: "Wie erhalte ich mein Ticket?", a: "Nach erfolgreicher Buchung erhältst du dein Ticket als QR-Code per E-Mail. Zeige den QR-Code einfach vor Ort vor – kein Ausdrucken nötig!" },
              { q: "Gibt es Gruppenrabatte?", a: "Ja! Viele unserer Partner bieten spezielle Gruppenrabatte an. Schau dir die verfügbaren Tickets an – Familien- und Gruppentickets sind oft günstiger als Einzeltickets." },
              { q: "Welche Zahlungsmethoden werden akzeptiert?", a: "Wir akzeptieren alle gängigen Zahlungsmethoden: Kreditkarte, PayPal, Klarna, Apple Pay und Google Pay. Alle Zahlungen sind SSL-verschlüsselt und sicher." },
              { q: "Was passiert bei schlechtem Wetter?", a: "Bei wetterabhängigen Aktivitäten kannst du deine Buchung kostenlos auf einen anderen Termin umbuchen. Indoor-Aktivitäten finden natürlich bei jedem Wetter statt." },
            ].map((faq, idx) => (
              <FaqItem key={idx} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </div>

      {/* NEWSLETTER SECTION */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 md:px-12 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white rounded-full px-4 py-1.5 text-sm font-semibold mb-6 border border-white/20">
            <Gift className="h-4 w-4" />
            Exklusive Angebote
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Verpasse keine Angebote mehr!</h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Melde dich für unseren Newsletter an und erhalte exklusive Rabatte, neue Aktivitäten und Insider-Tipps für {city} direkt in dein Postfach.
          </p>
          <NewsletterForm city={city} />
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>100% kostenlos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Jederzeit abbestellbar</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              <span>Exklusive Rabatte</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER TRUST BAR */}
      <div className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span>SSL-verschlüsselt</span>
            </div>
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-blue-400" />
              <span>Mobile Tickets</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span>Geprüfte Partner</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span>4.8/5 Bewertung</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              <span>10.000+ zufriedene Kunden</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`bg-white rounded-2xl border transition-all duration-300 ${open ? "border-blue-200 shadow-lg shadow-blue-500/5" : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"}`}>
      <button className="w-full flex items-center justify-between px-6 py-5 text-left" onClick={() => setOpen(!open)}>
        <span className="font-semibold text-gray-900 pr-4">{question}</span>
        <ChevronRight className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 -mt-1">
          <p className="text-gray-600 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

function NewsletterForm({ city }: { city: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md mx-auto">
        <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-3" />
        <h3 className="text-white font-bold text-lg">Erfolgreich angemeldet!</h3>
        <p className="text-white/70 text-sm mt-1">Du erhältst bald die besten Angebote für {city}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
      <input
        type="email"
        placeholder="Deine E-Mail-Adresse"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 px-5 py-3.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white placeholder-white/50 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all"
      />
      <Button type="submit" className="bg-white text-indigo-600 hover:bg-gray-100 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
        <Send className="h-4 w-4 mr-2" />
        Anmelden
      </Button>
    </form>
  );
}
