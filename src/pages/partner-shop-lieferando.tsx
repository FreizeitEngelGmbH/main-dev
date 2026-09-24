import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Clock, Users, ShoppingCart, Plus, Minus, Search, X } from "lucide-react";
import SimpleBookingForm from "@/components/booking-systems/SimpleBookingForm";
import CinemaBookingForm from "@/components/booking-systems/CinemaBookingForm";

interface Experience {
  id: number;
  title: string;
  partnerId: number;
  price: number;
  partner?: Partner;
  category?: Category;
  rating?: number;
  city?: string;
  [key: string]: any;
}

interface Partner {
  id: number;
  companyName: string;
  category?: string;
  rating?: number;
  city?: string;
  [key: string]: any;
}

interface Category {
  id: number;
  name: string;
  bookingArchetype?: string;
  requiresEquipment?: boolean;
  [key: string]: any;
}

export default function PartnerShopLieferando() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("beliebte");

  const isPartnerRoute = window.location.pathname.startsWith('/partners/');
  const partnerId = isPartnerRoute ? id : null;
  const experienceId = !isPartnerRoute ? id : null;

  const { data: experience, isLoading } = useQuery<Experience>({
    queryKey: [`/api/experiences/${experienceId}`],
    enabled: !!experienceId
  });

  const { data: partnerData, isLoading: partnerDataLoading } = useQuery<Partner>({
    queryKey: [`/api/partners/${partnerId || experience?.partnerId}`],
    enabled: !!(partnerId || experience?.partnerId)
  });

  const { data: partnerExperiences, isLoading: partnerLoading } = useQuery<Experience[]>({
    queryKey: [`/api/experiences?partnerId=${partnerId || experience?.partnerId}`],
    enabled: !!(partnerId || experience?.partnerId)
  });

  if (isLoading || partnerLoading || partnerDataLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded-full w-full max-w-md mb-6"></div>
            <div className="flex gap-2 mb-6">
              <div className="h-10 w-24 bg-gray-200 rounded-full"></div>
              <div className="h-10 w-32 bg-gray-200 rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-white rounded-xl overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!experience && !partnerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Partner nicht gefunden</h2>
          <Button onClick={() => setLocation('/')}>Zurück zur Startseite</Button>
        </div>
      </div>
    );
  }

  const partner = partnerData || (experience as any)?.partner;
  
  const getSelectedOfferCategory = () => {
    const selected = cart[0] || selectedOffer;
    if (selected?.category) return selected.category;
    if (experience?.category) return (experience as any).category;
    const firstExp = partnerExperiences?.[0];
    if (firstExp?.category) return (firstExp as any).category;
    return null;
  };
  
  const categoryData = getSelectedOfferCategory();
  const categoryName = categoryData?.name || partner?.category || 'Aktivität';
  const activityType = partner?.category || 
                      (categoryName.toLowerCase().includes('bowling') ? 'bowling' :
                       categoryName.toLowerCase().includes('kino') ? 'cinema' :
                       categoryName.toLowerCase().includes('schwimm') ? 'swimming' :
                       categoryName.toLowerCase().includes('zoo') ? 'zoo' :
                       categoryName.toLowerCase().includes('minigolf') ? 'minigolf' : 'default');

  const getBookingType = (activity: string): "TIME_SLOT" | "DAY_PASS" | "RESOURCE" | "EVENT" => {
    const dayPass = ['cinema', 'kino', 'theater', 'swimming', 'zoo', 'museum', 'spa', 'wellness', 'freibad', 'schwimmbad', 'tierpark', 'kletterhalle', 'indoorspielplatz', 'kinderpark', 'kletterpark'];
    const resource = ['golf', 'soccer', 'paintball', 'reiten', 'day-spa'];
    const event = ['fitness', 'sport', 'kultur', 'gastronomie', 'kurs'];
    
    const lowerActivity = activity.toLowerCase();
    if (dayPass.some(d => lowerActivity.includes(d))) return 'DAY_PASS';
    if (resource.some(r => lowerActivity.includes(r))) return 'RESOURCE';
    if (event.some(e => lowerActivity.includes(e))) return 'EVENT';
    return 'TIME_SLOT';
  };

  const bookingType = categoryData?.bookingArchetype || getBookingType(activityType);

  const getAuthenticOffers = (partnerName: string, activityType: string) => {
    switch(activityType) {
      case 'cinema':
        return [
          { id: 1001, title: 'Kinoticket Standard', description: 'Aktuelle Blockbuster in bester Qualität mit Dolby Surround.', price: 9.50, basePrice: 9.50, featured: true, duration: 120, maxParticipants: 10 },
          { id: 1002, title: 'Sneak Preview', description: 'Überraschungsfilm vor dem offiziellen Kinostart.', price: 8.00, basePrice: 8.00, featured: true, duration: 120, maxParticipants: 10 },
          { id: 1003, title: 'Pärchen-Abend', description: 'Romantischer Kinoabend mit Popcorn und Getränken inklusive.', price: 22.00, basePrice: 22.00, trending: true, duration: 180, maxParticipants: 2 },
          { id: 1004, title: 'Familienpaket Kino', description: '2 Erwachsene + 2 Kinder inkl. Snacks und Getränke.', price: 38.00, basePrice: 38.00, trending: true, duration: 150, maxParticipants: 4 },
          { id: 1005, title: 'VIP Loge', description: 'Premium-Sitze mit extra Beinfreiheit und Service am Platz.', price: 18.50, basePrice: 18.50, featured: false, duration: 120, maxParticipants: 6 },
          { id: 1006, title: 'Kinderkino', description: 'Kinderfilme am Wochenende mit kleinem Popcorn gratis.', price: 6.50, basePrice: 6.50, featured: false, duration: 90, maxParticipants: 10 }
        ];
      case 'bowling':
        return [
          { id: 2001, title: 'Standard Bowling', description: 'Professionelle Bahnen mit modernstem Equipment pro Stunde.', price: 28.00, basePrice: 28.00, featured: true, duration: 60, maxParticipants: 6 },
          { id: 2002, title: 'Happy Hour Bowling', description: 'Vergünstigte Preise Mo-Do von 14-17 Uhr.', price: 19.00, basePrice: 19.00, featured: true, duration: 60, maxParticipants: 6 },
          { id: 2003, title: 'Bowling-Party Paket', description: 'Geburtstags-Special mit 2h Bowling, Pizza und Getränken.', price: 89.00, basePrice: 89.00, trending: true, duration: 120, maxParticipants: 8 },
          { id: 2004, title: 'Cosmic Bowling', description: 'Bowling im Schwarzlicht mit DJ und Disco-Atmosphäre.', price: 35.00, basePrice: 35.00, trending: true, duration: 60, maxParticipants: 6 },
          { id: 2005, title: 'Familien-Bowling', description: 'Spezialpreis für Familien am Wochenende inkl. Kinderbahn.', price: 45.00, basePrice: 45.00, featured: false, duration: 90, maxParticipants: 6 },
          { id: 2006, title: 'After-Work Bowling', description: 'Firmenpaket ab 17 Uhr mit Snacks und Getränken.', price: 25.00, basePrice: 25.00, featured: false, duration: 60, maxParticipants: 6 }
        ];
      case 'swimming':
        return [
          { id: 3001, title: 'Tageskarte Erwachsene', description: 'Ganztägiger Zugang zum Schwimmbad und Außenbereich.', price: 8.50, basePrice: 8.50, featured: true, duration: 0, maxParticipants: 1 },
          { id: 3002, title: 'Tageskarte Kinder', description: 'Ermäßigter Eintritt für Kinder von 4-14 Jahren.', price: 5.00, basePrice: 5.00, featured: true, duration: 0, maxParticipants: 1 },
          { id: 3003, title: 'Familien-Ticket', description: '2 Erwachsene + bis zu 3 Kinder zum Sparpreis.', price: 24.00, basePrice: 24.00, trending: true, duration: 0, maxParticipants: 5 },
          { id: 3004, title: 'Sauna-Tageskarte', description: 'Entspannung pur in finnischer Sauna und Dampfbad.', price: 18.00, basePrice: 18.00, trending: true, duration: 0, maxParticipants: 1 },
          { id: 3005, title: 'Schwimmkurs Kinder', description: 'Professioneller Schwimmkurs für Anfänger (10 Einheiten).', price: 95.00, basePrice: 95.00, featured: false, duration: 45, maxParticipants: 8 },
          { id: 3006, title: 'Aqua-Fitness Kurs', description: 'Gelenkschonendes Training im Wasser mit Trainer.', price: 12.00, basePrice: 12.00, featured: false, duration: 45, maxParticipants: 15 }
        ];
      case 'zoo':
        return [
          { id: 4001, title: 'Tagesticket Erwachsene', description: 'Voller Zugang zum gesamten Zoo mit über 500 Tierarten.', price: 19.50, basePrice: 19.50, featured: true, duration: 0, maxParticipants: 1 },
          { id: 4002, title: 'Tagesticket Kinder', description: 'Ermäßigter Eintritt für Kinder von 4-14 Jahren.', price: 9.50, basePrice: 9.50, featured: true, duration: 0, maxParticipants: 1 },
          { id: 4003, title: 'Familienkarte', description: '2 Erwachsene + bis zu 4 Kinder zum Familienpreis.', price: 52.00, basePrice: 52.00, trending: true, duration: 0, maxParticipants: 6 },
          { id: 4004, title: 'Führung mit Tierpfleger', description: 'Exklusive 90-min Führung hinter die Kulissen.', price: 15.00, basePrice: 15.00, trending: true, duration: 90, maxParticipants: 15 },
          { id: 4005, title: 'Jahrespass Erwachsene', description: 'Unbegrenzter Zugang für 365 Tage inkl. Sonderevents.', price: 85.00, basePrice: 85.00, featured: false, duration: 0, maxParticipants: 1 },
          { id: 4006, title: 'Kindergeburtstag Zoo', description: 'Tierische Party mit Führung, Kuchen und Überraschung.', price: 120.00, basePrice: 120.00, featured: false, duration: 180, maxParticipants: 10 }
        ];
      case 'minigolf':
        return [
          { id: 5001, title: 'Adventure Golf Standard', description: 'Abenteuer-Minigolf mit 18 thematischen Bahnen.', price: 9.90, basePrice: 9.90, featured: true, duration: 60, maxParticipants: 6 },
          { id: 5002, title: 'Adventure Golf Kinder', description: 'Ermäßigter Preis für Kinder bis 14 Jahre.', price: 7.50, basePrice: 7.50, featured: true, duration: 60, maxParticipants: 6 },
          { id: 5003, title: '3D Schwarzlicht Golf', description: 'Einzigartiges 3D-Erlebnis mit leuchtenden Spezialeffekten.', price: 13.50, basePrice: 13.50, trending: true, duration: 60, maxParticipants: 6 },
          { id: 5004, title: 'Familien-Runde', description: '2 Erwachsene + 2 Kinder zum Paketpreis.', price: 32.00, basePrice: 32.00, trending: true, duration: 75, maxParticipants: 4 },
          { id: 5005, title: 'Glow-Turnier', description: 'Wöchentliches Turnier mit Preisen im Schwarzlicht.', price: 16.00, basePrice: 16.00, featured: false, duration: 90, maxParticipants: 20 },
          { id: 5006, title: 'Minigolf Party-Paket', description: 'Kindergeburtstag mit Minigolf, Getränken und Eis.', price: 99.00, basePrice: 99.00, featured: false, duration: 120, maxParticipants: 10 }
        ];
      case 'lasertag':
        return [
          { id: 6001, title: 'Lasertag Standard', description: 'Action-geladenes Lasertag-Spiel in moderner Arena.', price: 12.00, basePrice: 12.00, featured: true, duration: 20, maxParticipants: 20 },
          { id: 6002, title: 'Lasertag 3er Pack', description: '3 Spiele zum vergünstigten Preis.', price: 28.00, basePrice: 28.00, featured: true, duration: 60, maxParticipants: 20 },
          { id: 6003, title: 'Lasertag Party', description: 'Geburtstagsparty mit 2h Lasertag und Verpflegung.', price: 150.00, basePrice: 150.00, trending: true, duration: 120, maxParticipants: 15 },
          { id: 6004, title: 'Team-Battle', description: 'Firmen-Event mit Turniermodus und Siegerehrung.', price: 180.00, basePrice: 180.00, trending: true, duration: 90, maxParticipants: 30 },
          { id: 6005, title: 'Kids Lasertag', description: 'Spezielle Sessions für Kinder von 8-12 Jahren.', price: 9.00, basePrice: 9.00, featured: false, duration: 15, maxParticipants: 16 },
          { id: 6006, title: 'VIP Arena Miete', description: 'Exklusive Nutzung der Arena für 2 Stunden.', price: 250.00, basePrice: 250.00, featured: false, duration: 120, maxParticipants: 30 }
        ];
      default:
        return [
          { id: 9001, title: 'Standard-Ticket', description: 'Klassisches Erlebnis für alle Altersgruppen.', price: 15.00, basePrice: 15.00, featured: true, duration: 60, maxParticipants: 10 },
          { id: 9002, title: 'Ermäßigt (Kinder/Senioren)', description: 'Vergünstigter Eintritt für Kinder und Senioren.', price: 10.00, basePrice: 10.00, featured: true, duration: 60, maxParticipants: 10 },
          { id: 9003, title: 'Premium-Erlebnis', description: 'Gehobenes Angebot mit besonderen Extras und Service.', price: 25.00, basePrice: 25.00, trending: true, duration: 90, maxParticipants: 10 },
          { id: 9004, title: 'Familien-Paket', description: '2 Erwachsene + 2 Kinder zum Familienpreis.', price: 45.00, basePrice: 45.00, trending: true, duration: 120, maxParticipants: 4 },
          { id: 9005, title: 'Gruppenrabatt', description: 'Ab 10 Personen mit 15% Ermäßigung.', price: 12.75, basePrice: 12.75, featured: false, duration: 60, maxParticipants: 30 },
          { id: 9006, title: 'Jahreskarte', description: 'Unbegrenzter Zugang für 12 Monate.', price: 120.00, basePrice: 120.00, featured: false, duration: 0, maxParticipants: 1 }
        ];
    }
  };

  const partnerName = partner?.companyName || experience?.partner?.companyName || experience?.title?.split(' ')[0] || 'Partner';
  const offers = (partnerExperiences && partnerExperiences.length >= 1)
    ? partnerExperiences 
    : getAuthenticOffers(partnerName, activityType);

  const categories = [
    { id: 'beliebte', name: 'Beliebte', offers: offers?.filter((o: any) => o.featured) || [] },
    { id: 'specials', name: 'Spezial-Angebote', offers: offers?.filter((o: any) => o.trending) || [] },
    { id: 'alle', name: 'Alle Angebote', offers: offers || [] },
  ].filter(cat => cat.offers && cat.offers.length > 0);

  const filteredOffers = (offers || []).filter((offer: any) => 
    offer.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (offer: any) => {
    if (partner?.isLive) {
      const existingItem = cart.find(item => item.id === offer.id);
      if (existingItem) {
        setCart(cart.map(item =>
          item.id === offer.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      } else {
        setCart([...cart, { ...offer, quantity: 1 }]);
      }
    } else {
      setLocation(`/waitlist/${offer.id}`);
    }
  };

  const removeFromCart = (offerId: number) => {
    const existingItem = cart.find(item => item.id === offerId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item => 
        item.id === offerId ? { ...item, quantity: item.quantity - 1 } : item
      ));
    } else {
      setCart(cart.filter(item => item.id !== offerId));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + ((item.price || item.basePrice) * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getActivityImage = (offer: any) => {
    const title = offer.title?.toLowerCase() || '';
    if (title.includes('kino') || title.includes('film')) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop';
    if (title.includes('bowling')) return 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=400&h=300&fit=crop';
    if (title.includes('schwimm') || title.includes('sauna') || title.includes('pool')) return 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop';
    if (title.includes('zoo') || title.includes('tier')) return 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=400&h=300&fit=crop';
    if (title.includes('golf') || title.includes('minigolf')) return 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop';
    return 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=400&h=300&fit=crop';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Partner Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {partnerName.charAt(0)}
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">{partnerName}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span>{experience?.rating?.toFixed(1) || '4.7'}</span>
                  </div>
                  <span>•</span>
                  <span>{experience?.city || 'Bochum'}</span>
                </div>
              </div>
            </div>

            {/* Cart Button */}
            {cart.length > 0 && (
              <Button 
                onClick={() => setSelectedOffer(cart[0])}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                data-testid="button-cart"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {cartItemCount} • {cartTotal.toFixed(2)}€
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder={`Suche ${partnerName} Bochum`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base border-gray-200 rounded-full bg-white shadow-sm"
            data-testid="input-search"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className={`rounded-full whitespace-nowrap ${
                activeCategory === category.id 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600' 
                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
              data-testid={`button-category-${category.id}`}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Content */}
        {searchQuery ? (
          <div>
            <h2 className="text-xl font-bold mb-4">
              Suchergebnisse für "{searchQuery}" ({filteredOffers.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredOffers.map((offer: any) => (
                <ProductCard 
                  key={offer.id} 
                  offer={offer} 
                  onAdd={addToCart} 
                  cart={cart}
                  getImage={getActivityImage}
                />
              ))}
            </div>
          </div>
        ) : (
          categories
            .filter(cat => cat.id === activeCategory || activeCategory === 'alle')
            .map((category) => (
              <div key={category.id} className="mb-10">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                  {category.id === 'beliebte' && (
                    <p className="text-sm text-gray-500">Unsere beliebtesten Angebote</p>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {category.offers.map((offer: any) => (
                    <ProductCard 
                      key={offer.id} 
                      offer={offer} 
                      onAdd={addToCart} 
                      cart={cart}
                      getImage={getActivityImage}
                    />
                  ))}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Floating Cart Button (Mobile) */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-50 lg:hidden">
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white h-14 rounded-xl shadow-lg text-base font-medium"
            onClick={() => setSelectedOffer(cart[0])}
            data-testid="button-mobile-cart"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Buchungskorb ({cartItemCount}) • {cartTotal.toFixed(2)}€
          </Button>
        </div>
      )}

      {/* Booking Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Buchung abschließen</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOffer(null)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              {cart.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-medium mb-3">Ihre Auswahl:</h3>
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded text-sm font-medium">
                          {item.quantity}x
                        </span>
                        <span>{item.title}</span>
                      </div>
                      <span className="font-medium">{((item.price || item.basePrice) * item.quantity).toFixed(2)}€</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 font-bold text-lg">
                    <span>Gesamtsumme:</span>
                    <span className="text-purple-600">{cartTotal.toFixed(2)}€</span>
                  </div>
                </div>
              )}
              
              {activityType === 'cinema' ? (
                <CinemaBookingForm
                  experience={cart[0] || selectedOffer}
                  partner={partner}
                />
              ) : (
                <SimpleBookingForm
                  offer={cart[0] || selectedOffer}
                  partner={partner}
                  activityType={activityType}
                  cart={cart}
                  cartTotal={cartTotal}
                  bookingArchetype={bookingType}
                  category={categoryData}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({ offer, onAdd, cart, getImage }: { 
  offer: any, 
  onAdd: (offer: any) => void, 
  cart: any[],
  getImage: (offer: any) => string 
}) {
  const cartItem = cart.find(item => item.id === offer.id);
  const quantity = cartItem?.quantity || 0;
  const price = offer.price || offer.basePrice || 0;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={offer.imageUrl || getImage(offer)} 
          alt={offer.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {offer.featured && (
            <Badge className="bg-purple-600 text-white text-xs px-2 py-0.5">
              Beliebt
            </Badge>
          )}
          {offer.trending && (
            <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
              Trend
            </Badge>
          )}
        </div>
        {/* Quantity */}
        {quantity > 0 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
            {quantity}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1 mb-1" data-testid={`text-product-title-${offer.id}`}>
          {offer.title}
        </h3>
        
        <p className="text-xs text-gray-500 line-clamp-2 mb-2 min-h-[2rem]">
          {offer.description || 'Ein tolles Erlebnis für Jung und Alt!'}
        </p>
        
        {/* Info Row */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{offer.duration > 0 ? `${offer.duration} Min` : 'Flexibel'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>Bis {offer.maxParticipants || 6}</span>
          </div>
        </div>
        
        {/* Price & Button */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-gray-900" data-testid={`text-price-${offer.id}`}>
              ab {price.toFixed(2)}€
            </div>
            <div className="text-xs text-gray-400">pro Person</div>
          </div>
          
          <Button
            size="sm"
            onClick={() => onAdd(offer)}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-9 px-3"
            data-testid={`button-add-${offer.id}`}
          >
            <Plus className="h-4 w-4 mr-1" />
            Hinzufügen
          </Button>
        </div>
      </div>
    </div>
  );
}
