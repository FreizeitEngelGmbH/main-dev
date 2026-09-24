// REFERENCE COPY (not routed): copied from EngelFolder client/src/pages/experience-shop-page-old.tsx.
// Also typed the query data and passed BookingTemplateEngine its required props (see LegacyOffer below).
// Syntax repair: in the source, the component's return ends at line 422 and lines 423-651 hold an
// older version's JSX that cannot parse. Those lines are kept below as line comments; nothing else changed.
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, MapPin, Clock, Users, Shield, Waves, Euro, Calendar, Phone, Mail, CheckCircle, Heart, ChevronDown, ChevronUp, ChevronRight, ShoppingCart, Tag, Award } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Import Template Engine
import BookingTemplateEngine, { ACTIVITY_TEMPLATES } from "@/components/booking-systems/BookingTemplateEngine";

// Fields this page reads from GET /api/experiences/:id and /api/experiences?partnerId=… (added to compile).
interface LegacyOffer {
  id: number;
  title: string;
  description?: string | null;
  city?: string | null;
  location?: string | null;
  price: number;
  basePrice?: number;
  duration: number;
  maxParticipants?: number | null;
  rating: number;
  reviewCount: number;
  featured?: boolean | null;
  trending?: boolean | null;
  specialNotes?: string | null;
  timeSlots?: string[];
  categoryId?: number;
  partnerId?: number;
  partner?: { companyName?: string; address?: string | null; phone?: string | null; contactEmail?: string | null } | null;
  category?: { name?: string } | null;
}

export default function ExperienceShopPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // States
  const [selectedOffer, setSelectedOffer] = useState<LegacyOffer | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  // Fetch experience data
  const { data: experience, isLoading } = useQuery<LegacyOffer>({
    queryKey: [`/api/experiences/${id}`],
    enabled: !!id
  });

  // Fetch partner experiences (multiple offers)
  const { data: partnerExperiences, isLoading: partnerLoading } = useQuery<LegacyOffer[]>({
    queryKey: [`/api/experiences?partnerId=${experience?.partnerId}`],
    enabled: !!experience?.partnerId
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

  // Determine activity type
  const experienceTitle = typeof experience.title === 'string' ? experience.title.toLowerCase() : '';
  const isCinema = experienceTitle.includes('kino') || 
                   experienceTitle.includes('cinema') ||
                   experienceTitle.includes('bermuda');
  const isBowling = experienceTitle.includes('bowling');
  const isSwimmingPool = experienceTitle.includes('schwimm') || 
                         experienceTitle.includes('wellness') ||
                         experienceTitle.includes('spa');

  // Get activity template based on experience type
  const getActivityTemplate = () => {
    if (isCinema) {
      return ACTIVITY_TEMPLATES.cinema;
    } else if (isBowling) {
      return ACTIVITY_TEMPLATES.bowling;
    } else if (isSwimmingPool) {
      return ACTIVITY_TEMPLATES.swimming;
    } else if (typeof experience.categoryId === 'number' && experience.categoryId === 4) { // Zoo category
      return ACTIVITY_TEMPLATES.zoo;
    } else if (experienceTitle.includes('minigolf')) {
      return ACTIVITY_TEMPLATES.minigolf;
    } else {
      return ACTIVITY_TEMPLATES.swimming; // Generic fallback
    }
  };

  // Get appropriate offers based on experience type
  const getShopOffers = () => {
    const template = getActivityTemplate();
    
    if (template.id === 'cinema') {
      return [
        {
          id: 'avatar-3-2d',
          title: 'Avatar: The Way of Water',
          description: '2D Version - Sci-Fi Blockbuster von James Cameron',
          price: 15.50,
          duration: '192 Minuten',
          maxParticipants: 12,
          movieDetails: {
            genre: 'Sci-Fi, Action',
            rating: 'FSK 12',
            language: 'Deutsch',
            format: '2D',
            poster: 'https://via.placeholder.com/300x450/0066cc/ffffff?text=Avatar+2',
            trailer: 'https://www.youtube.com/watch?v=d9MyW72ELq0'
          },
          includes: ['Dolby Digital Sound', 'Große Leinwand', 'Klimatisiert'],
          timeSlots: ['14:30', '17:45', '20:30']
        }
      ];
    } else {
      return [{
        id: 'standard',
        title: typeof experience.title === 'string' ? experience.title : 'Standard Erlebnis',
        description: typeof experience.description === 'string' ? experience.description : 'Tolles Erlebnis',
        price: typeof experience.basePrice === 'number' ? experience.basePrice : 15.00,
        duration: typeof experience.duration === 'string' ? experience.duration : '2 Stunden',
        maxParticipants: typeof experience.maxParticipants === 'number' ? experience.maxParticipants : 8,
        includes: ['Teilnahme am Erlebnis', 'Professionelle Betreuung'],
        timeSlots: ['09:00', '11:00', '13:00', '15:00', '17:00']
      }];
    }
  };

  const shopOffers = getShopOffers();

  const handleBooking = (bookingData?: unknown) => {
    if (bookingData) {
      // Booking data from template engine
      setShowCheckout(true);
      return;
    }

    // Fallback for old booking flow
    if (!selectedOffer || !selectedDate || (!selectedTime && selectedOffer.timeSlots && selectedOffer.timeSlots[0] !== 'Flexibel nutzbar')) {
      toast({
        title: "Unvollständige Auswahl",
        description: "Bitte wählen Sie ein Angebot, Datum und Uhrzeit aus.",
        variant: "destructive",
      });
      return;
    }
    setShowCheckout(true);
  };

  const offers = partnerExperiences || [experience];
  const partner = experience.partner;
  
  const categoryName = experience.category?.name || 'Aktivität';
  const activityType = categoryName.toLowerCase().includes('bowling') ? 'bowling' :
                      categoryName.toLowerCase().includes('kino') ? 'cinema' :
                      categoryName.toLowerCase().includes('schwimm') ? 'swimming' :
                      categoryName.toLowerCase().includes('zoo') ? 'zoo' :
                      categoryName.toLowerCase().includes('minigolf') ? 'minigolf' : 'default';

  const handleSelectOffer = (offer: LegacyOffer) => {
    setSelectedOffer(offer);
    setShowCheckout(true);
    
    // Smooth scroll to checkout section
    setTimeout(() => {
      document.getElementById('checkout-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
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
                        {Math.min(...offers.map(e => e.price)).toFixed(2)}€
                      </div>
                      <div className="text-sm opacity-90">ab Preis</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {(offers.reduce((sum, e) => sum + e.rating, 0) / offers.length).toFixed(1)}
                      </div>
                      <div className="text-sm opacity-90">⭐ Bewertung</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {offers.reduce((sum, e) => sum + e.reviewCount, 0)}
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
          {offers.map((offer, index) => (
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
                        {offer.price.toFixed(2)}€
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        {offer.duration > 0 ? `pro ${offer.duration} Min` : 'einmalig'}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                          {offer.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {offer.description}
                        </p>
                        
                        {/* Special Notes */}
                        {offer.specialNotes && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-blue-800">
                              <strong>Wichtiger Hinweis:</strong> {offer.specialNotes}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => handleSelectOffer(offer)}
                        className={`ml-4 ${selectedOffer?.id === offer.id 
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
                  {selectedOffer.price.toFixed(2)}€
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    {selectedOffer.duration > 0 ? `für ${selectedOffer.duration} Minuten` : 'einmalig'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <BookingTemplateEngine
                  template={getActivityTemplate()}
                  offer={selectedOffer}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onBooking={handleBooking}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
  // --- Orphaned remainder of an older version (after the return above), kept as comments ---
//                       <Users className="w-5 h-5 text-blue-600" />
//                       <span className="text-sm">Max. {typeof experience.maxParticipants === 'number' ? experience.maxParticipants : 8} Personen</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <MapPin className="w-5 h-5 text-blue-600" />
//                       <span className="text-sm">{typeof experience.city === 'string' ? experience.city : 'Deutschland'}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Shield className="w-5 h-5 text-blue-600" />
//                       <span className="text-sm">Versichert</span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//               
//               <Button 
//                 variant="outline" 
//                 onClick={() => setShowMoreInfo(!showMoreInfo)}
//                 className="mt-4"
//               >
//                 {showMoreInfo ? (
//                   <>
//                     <ChevronUp className="w-4 h-4 mr-2" />
//                     Weniger anzeigen
//                   </>
//                 ) : (
//                   <>
//                     <ChevronDown className="w-4 h-4 mr-2" />
//                     Mehr anzeigen
//                   </>
//                 )}
//               </Button>
//             </div>
//           </div>
// 
//           {/* Right Column - Booking */}
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold">Verfügbare Angebote</h2>
//             
//             <div className="space-y-4">
//               {shopOffers.map((offer) => (
//                 <Card 
//                   key={offer.id} 
//                   className={`cursor-pointer transition-all duration-200 ${
//                     selectedOffer?.id === offer.id 
//                       ? 'ring-2 ring-blue-500 shadow-lg' 
//                       : 'hover:shadow-md border-gray-200'
//                   }`}
//                   onClick={() => setSelectedOffer(offer)}
//                 >
//                   <CardHeader className="pb-3">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <CardTitle className="text-lg">{offer.title}</CardTitle>
//                         <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-2xl font-bold text-blue-600">
//                           ab {offer.price.toFixed(2)}€
//                         </div>
//                         <div className="text-sm text-gray-500">pro Person</div>
//                       </div>
//                     </div>
//                   </CardHeader>
//                   
//                   {selectedOffer?.id === offer.id && (
//                     <CardContent>
//                       <div className="space-y-4">
//                         {/* Basic Info */}
//                         <div className="grid grid-cols-2 gap-4 text-sm">
//                           <div className="flex items-center gap-2">
//                             <Clock className="w-4 h-4 text-gray-500" />
//                             <span>{offer.duration}</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Users className="w-4 h-4 text-gray-500" />
//                             <span>max. {offer.maxParticipants}</span>
//                           </div>
//                         </div>
// 
//                         <Separator />
// 
//                         {/* Booking Form */}
//                         <div className="booking-form" onClick={(e) => e.stopPropagation()}>
//                           {!showCheckout ? (
//                             <form className="space-y-4">
//                               <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                   <label className="block text-sm font-medium mb-1">Datum</label>
//                                   <Input 
//                                     type="date" 
//                                     className="w-full" 
//                                     value={selectedDate}
//                                     onChange={(e) => setSelectedDate(e.target.value)}
//                                   />
//                                 </div>
//                                 <div>
//                                   <label className="block text-sm font-medium mb-1">Zeit</label>
//                                   <Select value={selectedTime} onValueChange={setSelectedTime}>
//                                     <SelectTrigger 
//                                       className="select-trigger"
//                                       onClick={(e) => e.stopPropagation()}
//                                       onPointerDown={(e) => e.stopPropagation()}
//                                     >
//                                       <SelectValue placeholder="Wählen..." />
//                                     </SelectTrigger>
//                                     <SelectContent 
//                                       className="select-content"
//                                       onClick={(e) => e.stopPropagation()}
//                                       onPointerDown={(e) => e.stopPropagation()}
//                                     >
//                                       {offer.timeSlots?.map((time, idx) => (
//                                         <SelectItem 
//                                           key={idx} 
//                                           value={time}
//                                           onClick={(e) => e.stopPropagation()}
//                                           onPointerDown={(e) => e.stopPropagation()}
//                                         >
//                                           {time}
//                                         </SelectItem>
//                                       ))}
//                                     </SelectContent>
//                                   </Select>
//                                 </div>
//                               </div>
// 
//                               {/* Template-based booking system */}
//                               <BookingTemplateEngine
//                                 template={getActivityTemplate()}
//                                 offer={offer}
//                                 selectedDate={selectedDate}
//                                 selectedTime={selectedTime}
//                                 onBooking={handleBooking}
//                               />
//                             </form>
//                           ) : (
//                             /* Checkout Form */
//                             <div className="space-y-4">
//                               <h4 className="font-semibold mb-4">Buchungsdetails</h4>
//                               
//                               <div className="space-y-3">
//                                 <div>
//                                   <Label htmlFor="firstName">Vorname *</Label>
//                                   <Input 
//                                     id="firstName" 
//                                     name="firstName" 
//                                     required 
//                                     className="mt-1" 
//                                   />
//                                 </div>
//                                 
//                                 <div>
//                                   <Label htmlFor="lastName">Nachname *</Label>
//                                   <Input 
//                                     id="lastName" 
//                                     name="lastName" 
//                                     required 
//                                     className="mt-1" 
//                                   />
//                                 </div>
//                                 
//                                 <div>
//                                   <Label htmlFor="email">E-Mail *</Label>
//                                   <Input 
//                                     id="email" 
//                                     name="email" 
//                                     type="email" 
//                                     required 
//                                     className="mt-1" 
//                                   />
//                                 </div>
//                                 
//                                 <div>
//                                   <Label htmlFor="phone">Telefon</Label>
//                                   <Input 
//                                     id="phone" 
//                                     name="phone" 
//                                     type="tel" 
//                                     className="mt-1" 
//                                   />
//                                 </div>
//                                 
//                                 <div>
//                                   <Label htmlFor="notes">Anmerkungen</Label>
//                                   <Textarea 
//                                     id="notes" 
//                                     name="notes" 
//                                     rows={3} 
//                                     className="mt-1" 
//                                   />
//                                 </div>
//                               </div>
//                               
//                               <div className="flex gap-2 pt-4">
//                                 <Button 
//                                   type="button" 
//                                   variant="outline" 
//                                   onClick={() => setShowCheckout(false)}
//                                   className="flex-1"
//                                 >
//                                   Zurück
//                                 </Button>
//                                 <Button 
//                                   type="button" 
//                                   onClick={() => {
//                                     // Store current experience data for confirmation page
//                                     localStorage.setItem('currentExperienceId', id?.toString() || '');
//                                     localStorage.setItem('currentExperienceTitle', experience?.title || '');
//                                     setLocation('/confirmation');
//                                   }}
//                                   className="flex-1"
//                                 >
//                                   Jetzt buchen
//                                 </Button>
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </CardContent>
//                   )}
//                 </Card>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
}