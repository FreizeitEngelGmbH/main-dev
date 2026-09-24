import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin, Phone, Mail, Globe, Clock, Users, Axe, Zap, DoorOpen, Navigation,
  ArrowRight, Ticket, Trophy, PartyPopper, Timer, ChevronRight,
  Trophy as TrophyIcon, Flag, Target, Mic2, Map as MapIcon
} from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
// MISSING ASSET: the source imports @assets/image_1775330071029.png, which does not exist in EngelFolder either.
// Uses the current image helper's neutral local placeholder instead (reference page, not routed).
import { getGroupActivityImage } from "@/lib/group-activity-images";
const funzoneHeroImg = getGroupActivityImage({});

const FUNZONE_PARTNER_ID = 675;

const zoneConfig: Record<string, { icon: any; color: string; bgColor: string; label: string; sublabel: string; heroImage: string }> = {
  axezone: {
    icon: Axe,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    label: "AxeZone",
    sublabel: "Axtwerfen",
    heroImage: "/images/tickets/funzone/axezone.jpg",
  },
  laserzone: {
    icon: Zap,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    label: "LaserZone",
    sublabel: "LaserTag",
    heroImage: "/images/tickets/funzone/laserzone.jpg",
  },
  exitzone: {
    icon: DoorOpen,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    label: "ExitZone",
    sublabel: "Escape Room",
    heroImage: "/images/tickets/funzone/exitzone.jpg",
  },
  bashzone: {
    icon: TrophyIcon,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    label: "BashZone",
    sublabel: "Live-Gameshow",
    heroImage: "/images/tickets/funzone/bashzone.jpg",
  },
  golfzone: {
    icon: Flag,
    color: "text-green-600",
    bgColor: "bg-green-50",
    label: "GolfZone",
    sublabel: "Hollywood Minigolf",
    heroImage: "/images/tickets/funzone/golfzone.jpg",
  },
  paintzone: {
    icon: Target,
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "PaintZone",
    sublabel: "Paintball",
    heroImage: "/images/tickets/funzone/paintzone.jpg",
  },
  rallyezone: {
    icon: MapIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    label: "RallyeZone",
    sublabel: "Stadtrallye",
    heroImage: "/images/tickets/funzone/rallyezone.jpg",
  },
  karaokezone: {
    icon: Mic2,
    color: "text-fuchsia-600",
    bgColor: "bg-fuchsia-50",
    label: "KaraokeZone",
    sublabel: "Karaoke-Privatraum",
    heroImage: "/images/tickets/funzone/karaokezone.jpg",
  },
};

function getZoneKey(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("axe") || t.includes("axt")) return "axezone";
  if (t.includes("bash")) return "bashzone";
  if (t.includes("golf") || t.includes("minigolf")) return "golfzone";
  if (t.includes("paint")) return "paintzone";
  if (t.includes("rallye") || t.includes("stadtrallye") || t.includes("schnitzel")) return "rallyezone";
  if (t.includes("karaoke")) return "karaokezone";
  if (t.includes("laser")) return "laserzone";
  if (t.includes("exit") || t.includes("escape")) return "exitzone";
  return "laserzone";
}

const locations = [
  {
    name: "FunZone Essen West",
    address: "Wüstenhöferstraße 234, 45355 Essen",
    zones: ["axezone", "laserzone", "golfzone", "bashzone"],
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2486.7!2d6.9347!3d51.4747!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sW%C3%BCstenh%C3%B6ferstra%C3%9Fe+234%2C+45355+Essen!5e0!3m2!1sde!2sde",
  },
  {
    name: "FunZone Essen Kray",
    address: "Am Zehnthof 194, 45307 Essen",
    zones: ["laserzone", "exitzone", "paintzone", "rallyezone", "karaokezone"],
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2486.7!2d7.0847!3d51.4547!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sAm+Zehnthof+194%2C+45307+Essen!5e0!3m2!1sde!2sde",
  },
];

export default function FunZoneEssenPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: allExperiences = [] } = useQuery<any[]>({ queryKey: ["/api/experiences"] });

  const funzoneExperiences = allExperiences.filter((e: any) => e.partnerId === FUNZONE_PARTNER_ID);

  const handleAddToCart = (exp: any) => {
    const zone = zoneConfig[getZoneKey(exp.title)];
    addToCart({
      experienceId: exp.id,
      title: `${zone?.label || "FunZone"}: ${exp.title}`,
      price: Number(exp.price),
      partnerId: FUNZONE_PARTNER_ID,
      partnerName: "FunZone Essen",
    });
    toast({ title: "In den Warenkorb gelegt", description: exp.title });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="relative bg-gradient-to-br from-gray-900 via-yellow-900/80 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src={funzoneHeroImg} alt="FunZone Essen" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <Badge className="bg-yellow-500/30 text-yellow-300 border-yellow-400/40 mb-4 text-sm px-3 py-1">
              8 Aktivitäten · 2 Standorte in Essen
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-yellow-400">Fun</span>Zone Essen
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-2">
              LaserTag · Axtwerfen · Escape Rooms · Minigolf · Paintball · Karaoke · Stadtrallye · Live-Gameshow
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-white/70 mb-6">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-yellow-400" />
                <span>Essen West & Essen Kray</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-8">
              {Object.entries(zoneConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <Badge key={key} variant="outline" className="border-white/30 text-white bg-white/10 text-xs px-2 py-1">
                    <Icon className="h-3 w-3 mr-1" />
                    {config.label} {config.sublabel}
                  </Badge>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold"
                onClick={() => setActiveTab("tickets")}
              >
                <Ticket className="h-5 w-5 mr-2" />
                Tickets buchen
              </Button>
              <a href="https://www.laserzone.de" target="_blank" rel="noopener noreferrer">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-12 relative z-10 mb-8">
          <Card className="bg-white shadow-lg border-t-4 border-t-yellow-400">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">8</div>
              <div className="text-sm text-gray-500">Aktivitäten</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-t-4 border-t-yellow-400">
            <CardContent className="p-4 text-center">
              <Navigation className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">2</div>
              <div className="text-sm text-gray-500">Standorte</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-t-4 border-t-yellow-400">
            <CardContent className="p-4 text-center">
              <PartyPopper className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">Events</div>
              <div className="text-sm text-gray-500">JGA & Partys</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-t-4 border-t-yellow-400">
            <CardContent className="p-4 text-center">
              <Timer className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">66 Min</div>
              <div className="text-sm text-gray-500">Escape Rooms</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-white border p-1">
            <TabsTrigger value="overview" className="flex-1 min-w-[120px]">Übersicht</TabsTrigger>
            <TabsTrigger value="tickets" className="flex-1 min-w-[120px]">Tickets & Preise</TabsTrigger>
            <TabsTrigger value="info" className="flex-1 min-w-[120px]">Standorte & Kontakt</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <h2 className="text-2xl font-bold mb-6">Alle Aktivitäten bei FunZone Essen</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {funzoneExperiences.map((exp: any) => {
                const zoneKey = getZoneKey(exp.title);
                const config = zoneConfig[zoneKey];
                if (!config) return null;
                const Icon = config.icon;

                return (
                  <Card key={exp.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => setActiveTab("tickets")}>
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={config.heroImage}
                        alt={config.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <Badge className={`${config.bgColor} ${config.color} border-0 mb-1`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.sublabel}
                        </Badge>
                        <p className="text-white text-sm font-bold">{config.label}</p>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-yellow-400 text-gray-900 font-bold border-0">
                          ab {(Number(exp.price)).toFixed(2).replace('.', ',')}€
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <MapPin className="h-3 w-3" />
                        Essen
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{exp.shortDescription || exp.title}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-400">Tickets verfügbar</span>
                        <ArrowRight className="h-4 w-4 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="mt-6">
            <h2 className="text-2xl font-bold mb-6">Tickets & Preise</h2>

            <div className="space-y-8">
              {funzoneExperiences
                .sort((a: any, b: any) => Number(a.price) - Number(b.price))
                .map((exp: any) => {
                  const zoneKey = getZoneKey(exp.title);
                  const config = zoneConfig[zoneKey];
                  if (!config) return null;
                  const Icon = config.icon;

                  return (
                    <div key={exp.id}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                          <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold">{config.label} – {config.sublabel}</h4>
                        </div>
                      </div>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-sm">{exp.title}</h4>
                            <span className="text-lg font-bold text-yellow-600 whitespace-nowrap ml-2">
                              ab {(Number(exp.price)).toFixed(2).replace('.', ',')}€
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
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold"
                            onClick={() => handleAddToCart(exp)}
                          >
                            <Ticket className="h-3 w-3 mr-1" />
                            Jetzt buchen
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
            </div>
          </TabsContent>

          <TabsContent value="info" className="mt-6">
            <h2 className="text-2xl font-bold mb-6">Standorte & Kontakt</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {locations.map((loc) => (
                <Card key={loc.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-yellow-500" />
                      {loc.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Navigation className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{loc.address}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {loc.zones.map((zoneKey) => {
                            const cfg = zoneConfig[zoneKey];
                            if (!cfg) return null;
                            const Icon = cfg.icon;
                            return (
                              <Badge key={zoneKey} className={`${cfg.bgColor} ${cfg.color} border-0 text-xs`}>
                                <Icon className="h-3 w-3 mr-1" />
                                {cfg.label} {cfg.sublabel}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <div className="text-sm">
                        <p>Mo–Do: 15:00–22:00 Uhr</p>
                        <p>Fr: 15:00–00:00 Uhr</p>
                        <p>Sa: 10:00–24:00 Uhr</p>
                        <p>So: 10:00–21:00 Uhr</p>
                      </div>
                    </div>
                    <iframe
                      src={loc.mapUrl}
                      width="100%"
                      height="200"
                      style={{ border: 0, borderRadius: "8px" }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </CardContent>
                </Card>
              ))}

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Kontakt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">FunZone Essen West (AxeZone, LaserZone, GolfZone, BashZone)</h4>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-yellow-500" />
                        <a href="tel:020164703202" className="text-sm hover:underline">0201 64703202</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-yellow-500" />
                        <a href="mailto:essen@fun-zone.de" className="text-sm hover:underline">essen@fun-zone.de</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-yellow-500" />
                        <a href="https://www.fun-zone.de" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">fun-zone.de</a>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">FunZone Essen Kray (LaserZone, ExitZone, PaintZone, RallyeZone, KaraokeZone)</h4>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-yellow-500" />
                        <a href="tel:020164703280" className="text-sm hover:underline">0201 64703280</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-yellow-500" />
                        <a href="mailto:kray@fun-zone.de" className="text-sm hover:underline">kray@fun-zone.de</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-yellow-500" />
                        <a href="https://www.fun-zone.de" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">fun-zone.de</a>
                      </div>
                    </div>
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
