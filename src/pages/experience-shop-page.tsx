import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Users, ShoppingCart, Tag, Award, Phone, Mail, ChevronRight, CheckCircle, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import BookingTemplateEngine, { ACTIVITY_TEMPLATES } from "@/components/booking-systems/BookingTemplateEngine";

// REFERENCE COPY (not routed): copied from EngelFolder client/src/pages/experience-shop-page.tsx.
// Adapted only to compile: typed the query data below and passed BookingTemplateEngine the props it
// requires (the source still used an older prop set).
interface ShopOffer {
  id: number;
  title: string;
  description?: string | null;
  shortDescription?: string | null;
  city?: string | null;
  location?: string | null;
  price: number;
  duration: number;
  maxParticipants?: number | string | null;
  rating?: number | null;
  reviewCount?: number | null;
  featured?: boolean | null;
  trending?: boolean | null;
  specialNotes?: string | null;
  partnerId?: number;
  partner?: { companyName?: string; address?: string | null; phone?: string | null; contactEmail?: string | null } | null;
  category?: { name?: string } | null;
}

export default function ExperienceShopPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [selectedOffer, setSelectedOffer] = useState<ShopOffer | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(new Set());

  const toggleDescription = (expId: number) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(expId)) {
        newSet.delete(expId);
      } else {
        newSet.add(expId);
      }
      return newSet;
    });
  };

  // Fetch experience data
  const { data: experience, isLoading } = useQuery<ShopOffer>({
    queryKey: [`/api/experiences/${id}`],
    enabled: !!id
  });

  // Fetch partner experiences (multiple offers)
  const { data: partnerExperiences, isLoading: partnerLoading } = useQuery<ShopOffer[]>({
    queryKey: [`/api/experiences?partnerId=${experience?.partnerId}`],
    enabled: !!experience?.partnerId
  });

  const { data: partnerInfo } = useQuery<any>({
    queryKey: [`/api/partners/${experience?.partnerId}`],
    enabled: !!experience?.partnerId,
  });

  if (isLoading || partnerLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="grid gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Partner nicht gefunden</h2>
          <Button onClick={() => setLocation('/')}>
            Zurück zur Startseite
          </Button>
        </div>
      </div>
    );
  }

  const offers = partnerExperiences || [experience];
  const partner = experience.partner;
  
  const categoryName = experience.category?.name || 'Aktivität';
  const activityType = categoryName.toLowerCase().includes('bowling') ? 'bowling' :
                      categoryName.toLowerCase().includes('kino') ? 'cinema' :
                      categoryName.toLowerCase().includes('schwimm') ? 'swimming' :
                      categoryName.toLowerCase().includes('zoo') ? 'zoo' :
                      categoryName.toLowerCase().includes('minigolf') ? 'minigolf' : 'default';

  const handleSelectOffer = (offer: any) => {
    if (partnerInfo?.isLive) {
      setSelectedOffer(offer);
      setShowCheckout(true);
      setTimeout(() => {
        document.getElementById('checkout-section')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    } else {
      setLocation(`/waitlist/${offer.id || id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>Startseite</span>
            <ChevronRight className="h-4 w-4" />
            <span>{categoryName}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-purple-600 font-medium">{partner?.companyName}</span>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Partner Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                  {partner?.companyName?.charAt(0) || 'P'}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{partner?.companyName}</h1>
                  <p className="text-gray-600 mb-4">{experience.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{partner?.address || experience.city}</span>
                    </div>
                    {partner?.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{partner.phone}</span>
                      </div>
                    )}
                    {partner?.contactEmail && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>{partner.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="lg:w-80">
              <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Auf einen Blick</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{offers.length}</div>
                      <div className="text-sm opacity-90">Angebote</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.min(...offers.map((e: any) => e.price)).toFixed(2)}€
                      </div>
                      <div className="text-sm opacity-90">ab Preis</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {(offers.reduce((sum: number, e: any) => sum + e.rating, 0) / offers.length).toFixed(1)}
                      </div>
                      <div className="text-sm opacity-90">⭐ Bewertung</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {offers.reduce((sum: number, e: any) => sum + e.reviewCount, 0)}
                      </div>
                      <div className="text-sm opacity-90">Bewertungen</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            <ShoppingCart className="inline h-6 w-6 mr-2" />
            Verfügbare Angebote
          </h2>
          <p className="text-gray-600">Wählen Sie aus {offers.length} verschiedenen Angeboten</p>
        </div>

        {/* Offers Grid */}
        <div className="grid gap-6 mb-8">
          {offers.map((offer: any, index: number) => (
            <Card key={offer.id} 
                  className={`group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 
                    ${selectedOffer?.id === offer.id ? 'border-l-purple-500 ring-2 ring-purple-200 bg-purple-50' : 'border-l-gray-200 hover:border-l-purple-400'}`}>
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Image */}
                  <div className="lg:w-64 h-48 lg:h-auto bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center relative overflow-hidden">
                    <div className="text-6xl opacity-20">
                      {activityType === 'bowling' && '🎳'}
                      {activityType === 'cinema' && '🎬'}
                      {activityType === 'swimming' && '🏊'}
                      {activityType === 'zoo' && '🦁'}
                      {activityType === 'minigolf' && '⛳'}
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {offer.featured && (
                        <Badge className="bg-yellow-500 text-white">
                          <Award className="h-3 w-3 mr-1" />
                          Beliebt
                        </Badge>
                      )}
                      {offer.trending && (
                        <Badge className="bg-red-500 text-white">
                          <Tag className="h-3 w-3 mr-1" />
                          Trend
                        </Badge>
                      )}
                      {index === 0 && (
                        <Badge className="bg-green-500 text-white">
                          Empfohlen
                        </Badge>
                      )}
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-4 right-4 bg-white rounded-full px-4 py-2 shadow-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {(offer.price).toFixed(2)}€
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        {offer.duration > 0 ? `pro ${offer.duration} Min` : 'einmalig'}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                          {offer.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {offer.shortDescription}
                        </p>
                      </div>
                      
                      <Button
                        onClick={() => handleSelectOffer(offer)}
                        className={`ml-4 flex-shrink-0 ${selectedOffer?.id === offer.id 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                        } text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg`}
                      >
                        {selectedOffer?.id === offer.id ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Ausgewählt
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Auswählen
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Ausklappbare Beschreibung */}
                    {offer.description && (
                      <div className="mb-3">
                        <p className={`text-sm text-gray-600 leading-relaxed ${!expandedDescriptions.has(offer.id) ? 'line-clamp-2' : ''}`}>
                          {offer.description}
                        </p>
                        {offer.description.length > 100 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDescription(offer.id);
                            }}
                            className="mt-1 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors"
                          >
                            {expandedDescriptions.has(offer.id) ? (
                              <>
                                <ChevronUp className="h-3.5 w-3.5" />
                                weniger anzeigen
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3.5 w-3.5" />
                                mehr anzeigen
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Special Notes */}
                    {offer.specialNotes && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-amber-800">
                          <strong>⚠️ Wichtiger Hinweis:</strong> {offer.specialNotes}
                        </p>
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{offer.duration > 0 ? `${offer.duration} Minuten` : 'Flexibel'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>Bis {offer.maxParticipants} Personen</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{offer.rating} ({offer.reviewCount} Bewertungen)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{offer.location || offer.city}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Booking Section */}
        {showCheckout && selectedOffer && (
          <div id="checkout-section" className="scroll-mt-8">
            <Card className="bg-white shadow-xl border-t-4 border-t-purple-500">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Buchung für: {selectedOffer.title}
                </CardTitle>
                <div className="text-2xl font-bold text-purple-600">
                  {(selectedOffer.price).toFixed(2)}€
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    {selectedOffer.duration > 0 ? `für ${selectedOffer.duration} Minuten` : 'einmalig'}
                  </span>
                </div>
                {/* Ticket Description - wichtige Details vor der Buchung */}
                {(selectedOffer.description || selectedOffer.shortDescription) && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">Was ist enthalten:</p>
                    <p className="text-gray-600 text-sm whitespace-pre-line">
                      {selectedOffer.description || selectedOffer.shortDescription}
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <BookingTemplateEngine
                  template={ACTIVITY_TEMPLATES[activityType] ?? ACTIVITY_TEMPLATES.swimming}
                  offer={selectedOffer}
                  selectedDate=""
                  selectedTime=""
                  onBooking={() => setShowCheckout(true)}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}