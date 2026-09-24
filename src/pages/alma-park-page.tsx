import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin, Phone, Mail, Globe, Clock, Star, Users, ChevronRight, Swords, Target,
  Axe, Circle, DoorOpen, Zap, Paintbrush, Volleyball, Gamepad2, Goal, Glasses, PersonStanding,
  ArrowRight, Ticket, Shield, PartyPopper, Baby, Trophy
} from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";

const ALMA_PARTNER_IDS = [481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492];

const categoryConfig: Record<number, { icon: any; color: string; bgColor: string; label: string; heroImage: string }> = {
  481: { icon: Target, color: "text-green-600", bgColor: "bg-green-50", label: "Abenteuergolf", heroImage: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=400&fit=crop" },
  482: { icon: Swords, color: "text-red-600", bgColor: "bg-red-50", label: "Arrowtag", heroImage: "https://images.unsplash.com/photo-1565711561500-49678a10a63f?w=600&h=400&fit=crop" },
  483: { icon: Axe, color: "text-amber-700", bgColor: "bg-amber-50", label: "Axtwerfen", heroImage: "https://images.unsplash.com/photo-1534369265652-cd60fbfe7e92?w=600&h=400&fit=crop" },
  484: { icon: Circle, color: "text-blue-500", bgColor: "bg-blue-50", label: "Bubbleball", heroImage: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop" },
  485: { icon: DoorOpen, color: "text-purple-600", bgColor: "bg-purple-50", label: "Escape Room", heroImage: "https://images.unsplash.com/photo-1587825140708-dfaf18c4f8e0?w=600&h=400&fit=crop" },
  486: { icon: Zap, color: "text-cyan-600", bgColor: "bg-cyan-50", label: "Lasertag", heroImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop" },
  487: { icon: Paintbrush, color: "text-orange-600", bgColor: "bg-orange-50", label: "Paintball", heroImage: "https://images.unsplash.com/photo-1565711561500-49678a10a63f?w=600&h=400&fit=crop" },
  488: { icon: Volleyball, color: "text-indigo-600", bgColor: "bg-indigo-50", label: "Poolball", heroImage: "https://images.unsplash.com/photo-1570498839593-e565b39455fc?w=600&h=400&fit=crop" },
  489: { icon: Gamepad2, color: "text-pink-600", bgColor: "bg-pink-50", label: "Pixel-Games", heroImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop" },
  490: { icon: Goal, color: "text-emerald-600", bgColor: "bg-emerald-50", label: "Indoor Soccer", heroImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop" },
  491: { icon: Glasses, color: "text-violet-600", bgColor: "bg-violet-50", label: "Virtual Reality", heroImage: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&h=400&fit=crop" },
  492: { icon: PersonStanding, color: "text-rose-600", bgColor: "bg-rose-50", label: "Trampolinpark", heroImage: "https://images.unsplash.com/photo-1626248801379-51a0748a5f96?w=600&h=400&fit=crop" },
};

export default function AlmaParkPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: allPartners = [] } = useQuery<any[]>({ queryKey: ["/api/partners"] });
  const { data: allExperiences = [] } = useQuery<any[]>({ queryKey: ["/api/experiences"] });

  const almaPartners = allPartners.filter((p: any) => ALMA_PARTNER_IDS.includes(p.id));
  const almaExperiences = allExperiences.filter((e: any) => ALMA_PARTNER_IDS.includes(e.partnerId));

  const handleAddToCart = (exp: any, partner: any) => {
    addToCart({
      experienceId: exp.id,
      title: `${categoryConfig[partner.id]?.label || partner.companyName}: ${exp.title}`,
      price: Number(exp.price),
      partnerId: partner.id,
      partnerName: "Alma Park",
    });
    toast({ title: "In den Warenkorb gelegt", description: exp.title });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526309841631-2ae38a4ec823?w=1600&h=600&fit=crop')] bg-cover bg-center" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 text-sm px-3 py-1">
              12 Aktivitäten an einem Ort
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Alma Park
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-2">
              Deutschlands größter Indoor-Freizeitpark
            </p>
            <div className="flex items-center text-white/70 mb-6">
              <MapPin className="h-5 w-5 mr-2" />
              <span>Almastraße 39, 45886 Gelsenkirchen</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-8">
              {Object.entries(categoryConfig).map(([id, config]) => {
                const Icon = config.icon;
                return (
                  <Badge key={id} variant="outline" className="border-white/30 text-white bg-white/10 text-xs px-2 py-1">
                    <Icon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-[hsl(258,80%,55%)] hover:bg-[hsl(258,80%,48%)] text-white"
                onClick={() => setActiveTab("tickets")}
              >
                <Ticket className="h-5 w-5 mr-2" />
                Tickets buchen
              </Button>
              <a href="https://www.alma-park.de" target="_blank" rel="noopener noreferrer">
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
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-[hsl(258,80%,55%)]" />
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-gray-500">Aktivitäten</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-[hsl(258,80%,55%)]" />
              <div className="text-2xl font-bold">2-50+</div>
              <div className="text-sm text-gray-500">Personen</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4 text-center">
              <PartyPopper className="h-6 w-6 mx-auto mb-2 text-[hsl(258,80%,55%)]" />
              <div className="text-2xl font-bold">JGA</div>
              <div className="text-sm text-gray-500">& Partys</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4 text-center">
              <Baby className="h-6 w-6 mx-auto mb-2 text-[hsl(258,80%,55%)]" />
              <div className="text-2xl font-bold">Ab 6</div>
              <div className="text-sm text-gray-500">Jahren</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-white border p-1">
            <TabsTrigger value="overview" className="flex-1 min-w-[120px]">Übersicht</TabsTrigger>
            <TabsTrigger value="tickets" className="flex-1 min-w-[120px]">Tickets & Preise</TabsTrigger>
            <TabsTrigger value="info" className="flex-1 min-w-[120px]">Info & Kontakt</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <h2 className="text-2xl font-bold mb-6">Alle Aktivitäten im Alma Park</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {almaPartners.map((partner: any) => {
                const config = categoryConfig[partner.id];
                if (!config) return null;
                const Icon = config.icon;
                const partnerExperiences = almaExperiences.filter((e: any) => e.partnerId === partner.id);
                const minPrice = partnerExperiences.length > 0
                  ? Math.min(...partnerExperiences.map((e: any) => Number(e.price)))
                  : null;

                return (
                  <Card key={partner.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => setActiveTab("tickets")}>
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={config.heroImage}
                        alt={config.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <Badge className={`${config.bgColor} ${config.color} border-0`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      {minPrice && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-white text-gray-900 font-bold">
                            ab {minPrice.toFixed(0)}€
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-1">{config.label}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{partner.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-400">{partnerExperiences.length} Angebote</span>
                        <ArrowRight className="h-4 w-4 text-[hsl(258,80%,55%)]" />
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
              {almaPartners.map((partner: any) => {
                const config = categoryConfig[partner.id];
                if (!config) return null;
                const Icon = config.icon;
                const partnerExperiences = almaExperiences.filter((e: any) => e.partnerId === partner.id);
                if (partnerExperiences.length === 0) return null;

                return (
                  <div key={partner.id}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${config.bgColor}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <h3 className="text-xl font-bold">{config.label}</h3>
                      <span className="text-sm text-gray-500">{partner.description}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {partnerExperiences
                        .sort((a: any, b: any) => Number(a.price) - Number(b.price))
                        .map((exp: any) => (
                        <Card key={exp.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-sm">{exp.title}</h4>
                              <span className="text-lg font-bold text-[hsl(258,80%,55%)] whitespace-nowrap ml-2">
                                {(Number(exp.price)).toFixed(2)}€
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">{exp.description}</p>
                            <Button
                              size="sm"
                              className="w-full bg-[hsl(258,80%,55%)] hover:bg-[hsl(258,80%,48%)] text-white"
                              onClick={() => handleAddToCart(exp, partner)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kontakt & Adresse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[hsl(258,80%,55%)] mt-0.5" />
                    <div>
                      <p className="font-medium">Alma Park</p>
                      <p className="text-sm text-gray-500">Almastraße 39</p>
                      <p className="text-sm text-gray-500">45886 Gelsenkirchen</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-[hsl(258,80%,55%)]" />
                    <a href="tel:020995709400" className="text-sm hover:underline">0209 95709400</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-[hsl(258,80%,55%)]" />
                    <a href="mailto:info@alma-park.de" className="text-sm hover:underline">info@alma-park.de</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-[hsl(258,80%,55%)]" />
                    <a href="https://www.alma-park.de" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">www.alma-park.de</a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Über den Alma Park</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Der Alma Park in Gelsenkirchen ist einer der größten Indoor-Freizeitparks in Deutschland.
                    Auf über 8.000 m² bietet er 12 verschiedene Aktivitäten für alle Altersgruppen –
                    vom Lasertag über Escape Rooms bis zum Trampolinpark.
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Ideal für Kindergeburtstage, JGA-Feiern, Teamevents und Familienausflüge.
                    Alle Aktivitäten sind wetterunabhängig und ganzjährig verfügbar.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline">Indoor</Badge>
                    <Badge variant="outline">Ganzjährig</Badge>
                    <Badge variant="outline">Kindergeburtstag</Badge>
                    <Badge variant="outline">JGA</Badge>
                    <Badge variant="outline">Teamevents</Badge>
                    <Badge variant="outline">Familienfreundlich</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Anfahrt</CardTitle>
                </CardHeader>
                <CardContent>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2486.7!2d7.0847!3d51.5247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b8e0f4c0b0c0a1%3A0x0!2sAlmastra%C3%9Fe+39%2C+45886+Gelsenkirchen!5e0!3m2!1sde!2sde!4v1234567890"
                    width="100%"
                    height="300"
                    style={{ border: 0, borderRadius: "8px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
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
