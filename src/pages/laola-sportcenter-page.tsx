import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin, Phone, Mail, Globe, Clock, Users, Navigation,
  ArrowRight, Ticket, Trophy, Timer, Dumbbell
} from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";

const LAOLA_PARTNER_ID = 702;

interface SportZone {
  key: string;
  label: string;
  color: string;
  bgColor: string;
  heroImage: string;
  matchFn: (title: string) => boolean;
}

const sportZones: SportZone[] = [
  {
    key: "fussball",
    label: "Fußball",
    color: "text-green-600",
    bgColor: "bg-green-50",
    heroImage: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&h=400&fit=crop",
    matchFn: (t) => t.toLowerCase().includes("fussball") || t.toLowerCase().includes("fußball"),
  },
  {
    key: "bowling",
    label: "Bowling",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    heroImage: "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=600&h=400&fit=crop",
    matchFn: (t) => t.toLowerCase().includes("bowling"),
  },
  {
    key: "padel",
    label: "Padel",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    heroImage: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&fit=crop",
    matchFn: (t) => t.toLowerCase().includes("padel"),
  },
  {
    key: "basketball",
    label: "Basketball",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    heroImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop",
    matchFn: (t) => t.toLowerCase().includes("basketball"),
  },
  {
    key: "badminton",
    label: "Badminton",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    heroImage: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&h=400&fit=crop",
    matchFn: (t) => t.toLowerCase().includes("badminton"),
  },
];

function getZone(title: string): SportZone | undefined {
  return sportZones.find((z) => z.matchFn(title));
}

export default function LaOlaSportcenterPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: allExperiences = [] } = useQuery<any[]>({ queryKey: ["/api/experiences"] });
  const laolaExperiences = allExperiences.filter((e: any) => e.partnerId === LAOLA_PARTNER_ID);

  const handleAddToCart = (exp: any) => {
    const zone = getZone(exp.title);
    addToCart({
      experienceId: exp.id,
      title: `LaOla ${zone?.label || "Sport"}: ${exp.title}`,
      price: Number(exp.price),
      partnerId: LAOLA_PARTNER_ID,
      partnerName: "LaOla Sportcenter",
    });
    toast({ title: "In den Warenkorb gelegt", description: exp.title });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="relative bg-gradient-to-br from-gray-900 via-emerald-900/80 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&h=600&fit=crop')] bg-cover bg-center" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <Badge className="bg-emerald-500/30 text-emerald-300 border-emerald-400/40 mb-4 text-sm px-3 py-1">
              5 Sportarten · 1 Standort in Essen
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-emerald-400">LaOla</span> Sportcenter
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-2">
              Fußball · Bowling · Padel · Basketball · Badminton
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-white/70 mb-6">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-emerald-400" />
                <span>Heßlerstraße 37, 45329 Essen</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-8">
              {sportZones.map((zone) => (
                <Badge key={zone.key} variant="outline" className="border-white/30 text-white bg-white/10 text-xs px-2 py-1">
                  <Dumbbell className="h-3 w-3 mr-1" />
                  {zone.label}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                onClick={() => setActiveTab("tickets")}
              >
                <Ticket className="h-5 w-5 mr-2" />
                Tickets buchen
              </Button>
              <a href="https://www.laola-sportcenter.de/" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Globe className="h-5 w-5 mr-2" />
                  Website besuchen
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 -mt-12 relative z-10 mb-8">
          {sportZones.map((zone) => {
            const zoneExps = laolaExperiences.filter((e: any) => zone.matchFn(e.title));
            const minPrice = zoneExps.length > 0 ? Math.min(...zoneExps.map((e: any) => Number(e.price))) : null;
            return (
              <Card key={zone.key} className="bg-white shadow-lg border-t-4 border-t-emerald-400">
                <CardContent className="p-3 text-center">
                  <Dumbbell className={`h-5 w-5 mx-auto mb-1 ${zone.color}`} />
                  <div className="text-sm font-bold">{zone.label}</div>
                  {minPrice !== null && (
                    <div className="text-xs text-gray-500">ab {minPrice.toFixed(2).replace('.', ',')}€</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-white border p-1">
            <TabsTrigger value="overview" className="flex-1 min-w-[120px]">Übersicht</TabsTrigger>
            <TabsTrigger value="tickets" className="flex-1 min-w-[120px]">Tickets & Preise</TabsTrigger>
            <TabsTrigger value="info" className="flex-1 min-w-[120px]">Standort & Kontakt</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <h2 className="text-2xl font-bold mb-6">Alle Sportarten bei LaOla Sportcenter</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sportZones.map((zone) => {
                const zoneExps = laolaExperiences.filter((e: any) => zone.matchFn(e.title));
                const minPrice = zoneExps.length > 0 ? Math.min(...zoneExps.map((e: any) => Number(e.price))) : null;

                return (
                  <Card key={zone.key} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => setActiveTab("tickets")}>
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={zone.heroImage}
                        alt={zone.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <Badge className={`${zone.bgColor} ${zone.color} border-0 mb-1`}>
                          <Dumbbell className="h-3 w-3 mr-1" />
                          {zone.label}
                        </Badge>
                      </div>
                      {minPrice !== null && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-emerald-400 text-gray-900 font-bold border-0">
                            ab {minPrice.toFixed(2).replace('.', ',')}€
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <MapPin className="h-3 w-3" />
                        Essen
                      </div>
                      <p className="text-xs text-gray-500">{zoneExps.length} Angebote (60/90/120 min)</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-400">Tickets verfügbar</span>
                        <ArrowRight className="h-4 w-4 text-emerald-500" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="mt-6">
            <h2 className="text-2xl font-bold mb-6">Tickets & Preise</h2>

            <div className="space-y-10">
              {sportZones.map((zone) => {
                const zoneExps = laolaExperiences
                  .filter((e: any) => zone.matchFn(e.title))
                  .sort((a: any, b: any) => Number(a.price) - Number(b.price));
                if (zoneExps.length === 0) return null;

                return (
                  <div key={zone.key}>
                    <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-emerald-400">
                      <div className={`p-2 rounded-lg ${zone.bgColor}`}>
                        <Dumbbell className={`h-5 w-5 ${zone.color}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{zone.label}</h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {zoneExps.map((exp: any) => (
                        <Card key={exp.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-sm">{exp.title}</h4>
                              <span className="text-lg font-bold text-emerald-600 whitespace-nowrap ml-2">
                                {(Number(exp.price)).toFixed(2).replace('.', ',')}€
                              </span>
                            </div>
                            {exp.duration && (
                              <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                                <Timer className="h-3 w-3" />
                                {exp.duration}
                              </div>
                            )}
                            {exp.maxParticipants && (
                              <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                                <Users className="h-3 w-3" />
                                {exp.maxParticipants}
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{exp.shortDescription}</p>
                            <Button
                              size="sm"
                              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                              onClick={() => handleAddToCart(exp)}
                            >
                              <Ticket className="h-3 w-3 mr-1" />
                              Jetzt buchen
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="info" className="mt-6">
            <h2 className="text-2xl font-bold mb-6">Standort & Kontakt</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-500" />
                    LaOla Sportcenter Essen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Navigation className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Heßlerstraße 37, 45329 Essen</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {sportZones.map((zone) => (
                          <Badge key={zone.key} className={`${zone.bgColor} ${zone.color} border-0 text-xs`}>
                            <Dumbbell className="h-3 w-3 mr-1" />
                            {zone.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-emerald-500" />
                    <div className="text-sm">
                      <p>Mo–Fr: 08:00–00:00 Uhr</p>
                      <p>Sa–So: 10:00–00:00 Uhr</p>
                    </div>
                  </div>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2486.7!2d6.9847!3d51.4847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sHe%C3%9Flerstra%C3%9Fe+37%2C+45329+Essen!5e0!3m2!1sde!2sde"
                    width="100%"
                    height="200"
                    style={{ border: 0, borderRadius: "8px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kontakt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-emerald-500" />
                    <a href="tel:020189060290" className="hover:underline">0201 / 890 602 90</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-emerald-500" />
                    <a href="mailto:kontakt@laola-sportcenter.de" className="hover:underline">kontakt@laola-sportcenter.de</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-emerald-500" />
                    <a href="https://www.laola-sportcenter.de/" target="_blank" rel="noopener noreferrer" className="hover:underline">www.laola-sportcenter.de</a>
                  </div>
                  <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Besondere Highlights</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 5 Sportarten unter einem Dach</li>
                      <li>• Moderne 4-Bahn Bowlinganlage</li>
                      <li>• Indoor-Fußball mit Stadionrasen-Qualität</li>
                      <li>• Padel Courts mit Verleih-Service</li>
                      <li>• Ideal für Firmenevents & JGA</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
