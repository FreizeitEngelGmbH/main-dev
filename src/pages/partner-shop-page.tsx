import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Clock, Phone, Mail, Globe, ChevronRight, Ticket, Users, ShoppingCart, Calendar, Zap, Settings2, Heart, Navigation, ChevronLeft, CreditCard, CheckCircle, Plus, Target, Key, Flag, Shirt, Waves, Film, CircleDot, TreePine, Building2, Palette, Music, Gamepad2, Dumbbell, Bike, Mountain, Coffee, UtensilsCrossed, Sparkles, Baby, Dog, Landmark, Camera, PartyPopper, Scissors, GraduationCap, Footprints, MessageSquare, ArrowRight, User, ThumbsUp, Send, Search, Shield, QrCode, Sun, Gift, Award, TrendingUp, ExternalLink, FileText, RotateCcw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { PartnerLocationMap } from "@/components/partner-location-map";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import StripePaymentStep from "@/components/checkout/StripePaymentStep";
import InteractiveSeatMap from "@/components/booking-systems/cinema/InteractiveSeatMap";
import BoulderingBookingSystem from "@/components/booking-systems/bouldering/BoulderingBookingSystem";
import GoKartBookingSystem from "@/components/booking-systems/gokart/GoKartBookingSystem";
import MinigolfBooking from "@/components/MinigolfBooking";
import GroupInquiryForm from "@/components/GroupInquiryForm";

const FUNZONE_PARTNER_IDS = [675];
const ALMA_PARTNER_IDS: number[] = [];
const LAOLA_PARTNER_IDS = [702];

export default function PartnerShopPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const numId = Number(id);
    if (FUNZONE_PARTNER_IDS.includes(numId)) {
      setLocation("/funzone-essen");
      return;
    }
    if (ALMA_PARTNER_IDS.includes(numId)) {
      setLocation("/alma-park");
      return;
    }
    if (LAOLA_PARTNER_IDS.includes(numId)) {
      setLocation("/laola-sportcenter");
      return;
    }
  }, [id, setLocation]);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [minigolfBookingOpen, setMinigolfBookingOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<any>(null);
  const [customQuantity, setCustomQuantity] = useState(1);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('14:00');
  const [showMap, setShowMap] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'payment' | 'success'>('form');
  const [stripeClientSecret, setStripeClientSecret] = useState('');
  const [stripeAmount, setStripeAmount] = useState(0);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [customerWish, setCustomerWish] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  
  // Category-specific booking options
  const [selectedLane, setSelectedLane] = useState('');
  const [shoeRental, setShoeRental] = useState(false);
  const [gameMode, setGameMode] = useState('');
  const [equipmentPackage, setEquipmentPackage] = useState('standard');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [hintPackage, setHintPackage] = useState('standard');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sessionLength, setSessionLength] = useState('60');
  const [gripSocks, setGripSocks] = useState('own');
  const [bookingQuantity, setBookingQuantity] = useState(2);
  const [cinemaDialogOpen, setCinemaDialogOpen] = useState(false);
  const [cinemaExperience, setCinemaExperience] = useState<any>(null);
  const [skiBookingOpen, setSkiBookingOpen] = useState(false);
  const [skiSelectedDate, setSkiSelectedDate] = useState<Date | null>(null);
  const [skiTicketType, setSkiTicketType] = useState('tages');
  const [skiAgeGroup, setSkiAgeGroup] = useState('erwachsene');
  const [skiQuantity, setSkiQuantity] = useState(1);
  const [skiCalendarMonth, setSkiCalendarMonth] = useState(new Date());
  const [skiStep, setSkiStep] = useState<'calendar' | 'details' | 'success'>('calendar');
  const [showPartnerInfo, setShowPartnerInfo] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [calendarBlockedSlots, setCalendarBlockedSlots] = useState<string[]>([]);
  const [slotInfo, setSlotInfo] = useState<Record<string, { totalResources: number; bookedResources: number; available: boolean; availableResourceIds: number[] }>>({});
  const [availableResources, setAvailableResources] = useState<Array<{ id: number; name: string; resourceType: string }>>([]);
  const [lastAvailabilityUpdate, setLastAvailabilityUpdate] = useState<Date | null>(null);

  const selectedExperienceIdRef = useRef(selectedExperience?.id);
  const customDateRef = useRef(customDate);
  selectedExperienceIdRef.current = selectedExperience?.id;
  customDateRef.current = customDate;

  const fetchAvailability = useCallback(() => {
    const expId = selectedExperienceIdRef.current;
    const dateVal = customDateRef.current;
    if (expId && dateVal) {
      fetch(`/api/availability/${expId}?date=${dateVal}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      })
        .then(res => res.json())
        .then(data => {
          const booked = (data.bookedSlots || []).map((slot: any) => slot.time);
          setBookedSlots(booked);
          setCalendarBlockedSlots(data.calendarBlockedTimes || []);
          setSlotInfo(data.slotInfo || {});
          setAvailableResources(data.resources || []);
          setLastAvailabilityUpdate(new Date());
        })
        .catch(() => {
          setBookedSlots([]);
          setCalendarBlockedSlots([]);
          setSlotInfo({});
          setAvailableResources([]);
        });
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
    const interval = setInterval(fetchAvailability, 10000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchAvailability();
      }
    };
    const onFocus = () => fetchAvailability();
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
    };
  }, [selectedExperience?.id, customDate, fetchAvailability]);

  // Scroll to tickets section
  const scrollToTickets = () => {
    document.getElementById('tickets-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get category-specific icon
  const getCategoryIcon = (experience: any) => {
    const title = (experience.title || '').toLowerCase();
    const category = (experience.categoryName || '').toLowerCase();
    const partnerName = (partner?.companyName || partner?.company_name || '').toLowerCase();
    
    // Swimming/Water
    if (title.includes('schwimm') || title.includes('bad') || title.includes('sauna') || title.includes('aqua') || title.includes('freibad') || title.includes('hallenbad') || category.includes('schwimm')) {
      return <Waves className="h-10 w-10" />;
    }
    // Cinema
    if (title.includes('kino') || title.includes('film') || category.includes('kino')) {
      return <Film className="h-10 w-10" />;
    }
    // Bowling
    if (title.includes('bowling') || partnerName.includes('bowling') || category.includes('bowling')) {
      return <CircleDot className="h-10 w-10" />;
    }
    // Zoo/Animals
    if (title.includes('zoo') || title.includes('tier') || partnerName.includes('zoo') || category.includes('zoo')) {
      return <Dog className="h-10 w-10" />;
    }
    // Lasertag
    if (title.includes('laser') || partnerName.includes('laser') || category.includes('laser')) {
      return <Target className="h-10 w-10" />;
    }
    // Escape Room
    if (title.includes('escape') || title.includes('room') || partnerName.includes('escape') || category.includes('escape')) {
      return <Key className="h-10 w-10" />;
    }
    // Minigolf
    if (title.includes('minigolf') || title.includes('golf') || category.includes('minigolf')) {
      return <Flag className="h-10 w-10" />;
    }
    // Trampoline
    if (title.includes('trampolin') || title.includes('jump') || title.includes('spring') || category.includes('trampolin')) {
      return <Footprints className="h-10 w-10" />;
    }
    // Museum/Culture
    if (title.includes('museum') || title.includes('ausstellung') || partnerName.includes('museum') || category.includes('museum')) {
      return <Landmark className="h-10 w-10" />;
    }
    // Castle/Palace
    if (title.includes('schloss') || title.includes('burg') || partnerName.includes('schloss')) {
      return <Building2 className="h-10 w-10" />;
    }
    // Theater/Show
    if (title.includes('theater') || title.includes('show') || title.includes('musical') || category.includes('theater')) {
      return <Music className="h-10 w-10" />;
    }
    // Climbing/Hochseil
    if (title.includes('kletter') || title.includes('hochseil') || title.includes('climb') || category.includes('kletter')) {
      return <Mountain className="h-10 w-10" />;
    }
    // Fitness/Sport
    if (title.includes('fitness') || title.includes('sport') || title.includes('gym') || category.includes('fitness')) {
      return <Dumbbell className="h-10 w-10" />;
    }
    // Park/Nature
    if (title.includes('park') || title.includes('wald') || title.includes('natur') || category.includes('freizeitpark')) {
      return <TreePine className="h-10 w-10" />;
    }
    // Kids/Birthday
    if (title.includes('kinder') || title.includes('geburtstag') || title.includes('birthday') || category.includes('kinder')) {
      return <PartyPopper className="h-10 w-10" />;
    }
    // Gaming/VR
    if (title.includes('gaming') || title.includes('vr') || title.includes('virtual') || category.includes('gaming')) {
      return <Gamepad2 className="h-10 w-10" />;
    }
    // Bike/Cycling
    if (title.includes('fahrrad') || title.includes('bike') || title.includes('rad') || category.includes('fahrrad')) {
      return <Bike className="h-10 w-10" />;
    }
    // Wellness/Spa
    if (title.includes('wellness') || title.includes('spa') || title.includes('massage') || category.includes('wellness')) {
      return <Sparkles className="h-10 w-10" />;
    }
    // Food/Restaurant
    if (title.includes('essen') || title.includes('restaurant') || title.includes('buffet') || category.includes('gastro')) {
      return <UtensilsCrossed className="h-10 w-10" />;
    }
    // Default ticket icon
    return <Ticket className="h-10 w-10" />;
  };

  const { data: partner, isLoading: partnerLoading } = useQuery<any>({
    queryKey: [`/api/partners/${id}`],
    enabled: !!id
  });

  const { data: allExperiences, isLoading: experiencesLoading } = useQuery<any[]>({
    queryKey: ['/api/experiences'],
    enabled: !!id
  });

  const experiences = allExperiences?.filter((exp: any) => exp.partnerId === Number(id)) || [];
  const isLoading = partnerLoading || experiencesLoading;

  const isKinoTicket = (exp: any) => {
    const title = (exp.title || '').toLowerCase();
    const catName = (exp.categoryName || '').toLowerCase();
    return title.includes('kino') || title.includes('film:') || catName.includes('kino') || exp.partnerId === 137 || exp.partnerId === 138 || Number(id) === 137 || Number(id) === 138;
  };

  const handleQuickBook = (experience: any) => {
    if (isKinoTicket(experience)) {
      setCinemaExperience(experience);
      setCinemaDialogOpen(true);
      return;
    }
    if (partner?.isLive) {
      addToCart({
        experienceId: experience.id,
        title: experience.title,
        price: experience.price || 0,
        imageUrl: experience.imageUrl,
        partnerName: partner?.companyName,
        partnerId: Number(id)
      });
      toast({
        title: "Hinzugefügt!",
        description: `${experience.title} wurde zum Warenkorb hinzugefügt.`,
      });
    } else {
      setLocation(`/waitlist/${experience.id}`);
    }
  };


  const bookingMutation = useMutation({
    mutationFn: async (data: { experienceId: number; guestEmail: string; guestName: string; quantity: number; visitDate?: string; visitTime?: string; paymentMethod: string }) => {
      return apiRequest('POST', '/api/bookings', {
        experienceId: data.experienceId,
        contactName: data.guestName,
        contactEmail: data.guestEmail,
        date: data.visitDate || new Date().toISOString().split('T')[0],
        time: data.visitTime || '14:00',
        paymentMethod: data.paymentMethod,
        guestInfo: {
          firstName: data.guestName.split(' ')[0],
          lastName: data.guestName.split(' ').slice(1).join(' ') || '',
          email: data.guestEmail
        },
        bookingDetails: {
          parameters: {
            quantity: data.quantity
          }
        }
      });
    },
    onSuccess: (data: any) => {
      const code = `FE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setBookingCode(code);
      setCheckoutStep('success');
    },
    onError: (error) => {
      toast({
        title: "Fehler bei der Buchung",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  });

  const startStripePayment = async () => {
    if (!selectedExperience) return;
    const isEscapeRoom = selectedExperience?.category?.slug === 'escape-rooms' ||
      selectedExperience?.title?.toLowerCase().includes('escape') ||
      selectedExperience?.title?.toLowerCase().includes('raum:') ||
      selectedExperience?.title?.toLowerCase().includes('room') ||
      partner?.companyName?.toLowerCase().includes('escape') ||
      partner?.companyName?.toLowerCase().includes('locked');
    const quantity = isEscapeRoom ? bookingQuantity : customQuantity;
    setStripeLoading(true);
    try {
      const res = await apiRequest('POST', '/api/create-payment-intent', {
        experienceId: selectedExperience.id,
        participants: quantity,
      });
      const data = await res.json();
      setStripeClientSecret(data.clientSecret);
      setStripeAmount(data.amount);
      setCheckoutStep('payment');
    } catch (e) {
      toast({
        title: "Fehler bei der Zahlungsvorbereitung",
        description: "Bitte versuche es später erneut.",
        variant: "destructive"
      });
    } finally {
      setStripeLoading(false);
    }
  };

  const handleStripePaymentSuccess = async (paymentIntentId: string) => {
    try {
      const res = await apiRequest('POST', '/api/bookings/stripe-confirm', {
        paymentIntentId,
        contactName: guestName,
        contactEmail: guestEmail,
        date: customDate || undefined,
        time: customTime || undefined,
      });
      const data = await res.json();
      setBookingCode(data?.booking?.bookingReference || (data?.booking?.id ? `FE-${data.booking.id}` : `FE-${Date.now().toString(36).toUpperCase()}`));
    } catch (e) {
      console.error("Booking creation after payment failed:", e);
      toast({
        title: "Zahlung erfolgreich – Buchung folgt",
        description: "Deine Zahlung war erfolgreich. Die Buchung konnte noch nicht angelegt werden, bitte kontaktiere uns. Dein Geld ist nicht verloren.",
      });
      setBookingCode(`FE-${Date.now().toString(36).toUpperCase()}`);
    }
    setCheckoutStep('success');
  };

  const handleDirectCheckout = () => {
    if (!selectedExperience || !guestEmail || !guestName || !paymentMethod) {
      toast({
        title: "Bitte alle Felder ausfüllen",
        description: "Name, E-Mail und Zahlungsart sind erforderlich.",
        variant: "destructive"
      });
      return;
    }

    // Online-Zahlarten laufen über Stripe (Zahlung zuerst, Buchung nach Zahlungsbestätigung)
    if (paymentMethod === 'kreditkarte' || paymentMethod === 'klarna') {
      startStripePayment();
      return;
    }
    
    // Generate booking code locally for immediate confirmation
    const code = `FE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setBookingCode(code);
    setCheckoutStep('success');
    
    const isEscapeRoom = selectedExperience?.category?.slug === 'escape-rooms' ||
      selectedExperience?.title?.toLowerCase().includes('escape') ||
      selectedExperience?.title?.toLowerCase().includes('raum:') ||
      selectedExperience?.title?.toLowerCase().includes('room') ||
      partner?.companyName?.toLowerCase().includes('escape') ||
      partner?.companyName?.toLowerCase().includes('locked');
    
    bookingMutation.mutate({
      experienceId: selectedExperience.id,
      guestEmail,
      guestName,
      quantity: isEscapeRoom ? bookingQuantity : customQuantity,
      visitDate: customDate || undefined,
      visitTime: customTime || undefined,
      paymentMethod
    });
  };

  const openCheckout = (experience: any) => {
    if (isKinoTicket(experience)) {
      setCinemaExperience(experience);
      setCinemaDialogOpen(true);
      return;
    }
    if (partner?.id === 264) {
      setSelectedExperience(experience);
      setSkiSelectedDate(null);
      setSkiTicketType('tages');
      setSkiAgeGroup('erwachsene');
      setSkiQuantity(1);
      setSkiCalendarMonth(new Date());
      setSkiStep('calendar');
      setSkiBookingOpen(true);
      return;
    }
    if (partner?.id === 627) {
      setSelectedExperience(experience);
      setMinigolfBookingOpen(true);
      return;
    }
    if (partner?.isLive) {
      setSelectedExperience(experience);
      setCustomQuantity(1);
      setBookingQuantity(2);
      setCustomDate('');
      setCustomTime('14:00');
      setGuestEmail('');
      setGuestName('');
      setCheckoutStep('form');
      setCheckoutOpen(true);
    } else {
      setLocation(`/waitlist/${experience.id}`);
    }
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
          <Button onClick={() => setLocation('/')}>Zurück zur Startseite</Button>
        </div>
      </div>
    );
  }

  const heroImage = experiences[0]?.imageUrl || null;
  const categoryLabel = partner.category || 'Erlebnis';
  
  // Generate dynamic ranking based on partner ID
  const rankingNumber = ((Number(id) % 10) + 1);

  return (
    <div className="min-h-screen bg-white">
      {/* HERO - Full-bleed image like Netflix */}
      <div className="relative min-h-[480px] md:min-h-[580px] overflow-hidden">
        {/* Full background image */}
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
        {/* Dark gradient overlay from bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>

        {/* Content overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 h-full flex flex-col justify-end pb-12 pt-20 md:pt-32">
          {/* Top bar */}
          <div className="absolute top-6 left-6 md:left-12 right-6 md:right-12 flex items-center justify-between">
            <button 
              onClick={() => setLocation(partner.city ? `/search?location=${encodeURIComponent(partner.city)}` : '/')}
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
              {(() => {
                const uniqueCats = [...new Set(experiences.map((e: any) => e.categoryName).filter(Boolean))];
                if (uniqueCats.length <= 1) {
                  return <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{categoryLabel}</span>;
                }
                return uniqueCats.map((cat: string) => (
                  <span key={cat} className="text-xs font-semibold text-white bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full">
                    {cat}
                  </span>
                ));
              })()}
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
                    {Math.min(...experiences.map((e: any) => Number(e.price) || 99)).toFixed(2).replace('.', ',')}€
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`h-4 w-4 ${s <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-white/20 text-white/20'}`} />
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
              {partner?.tourUrl && (
                <Button
                  onClick={() => setTourOpen(true)}
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/40 text-white hover:bg-white/20 hover:text-white font-bold px-8 py-6 text-base rounded-full shadow-2xl transition-all hover:-translate-y-0.5"
                >
                  <Mountain className="h-4 w-4 mr-2" />
                  3D Rundgang anschauen
                </Button>
              )}
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
                  <MapPin className="h-3 w-3" /> {partner.city || 'Route planen'}
                </a>
              )}
              {partner.phone && (
                <a href={`tel:${partner.phone}`} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 text-white/80 text-xs hover:bg-white/20 transition-colors">
                  <Phone className="h-3 w-3" /> {partner.phone}
                </a>
              )}
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 text-white/80 text-xs">
                <Clock className="h-3 w-3" /> {partner.openingHours ? (() => { try { const p = JSON.parse(partner.openingHours); const today = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date().getDay()]; return p[today] ? `Heute ${p[today]} Uhr` : 'Heute geöffnet'; } catch { return partner.openingHours.split('\n')[0]?.substring(0, 20) || 'Heute geöffnet'; } })() : 'Auf Anfrage'}
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
            { icon: <Shield className="h-4 w-4" />, text: 'Verifizierter Partner' },
            { icon: <Zap className="h-4 w-4" />, text: 'Sofort-Bestätigung' },
            { icon: <QrCode className="h-4 w-4" />, text: 'QR-Code Eintritt' },
            { icon: <CheckCircle className="h-4 w-4" />, text: 'Kostenlose Stornierung' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-white/80 whitespace-nowrap">
              {item.icon}
              <span className="text-xs font-medium hidden sm:inline">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TICKETS - Featured Listings Layout */}
      <div id="tickets-section" className="max-w-7xl mx-auto px-4 md:px-12 py-10">
        <div className="mb-6">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Unsere Angebote</p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">Tickets & Erlebnisse</h2>
        </div>

        {(() => {
          const isBowlingCheck = (exp: any) => exp?.category?.slug === 'bowling' || 
            exp?.title?.toLowerCase().includes('bowling') ||
            partner?.companyName?.toLowerCase().includes('bowling');

          const gradientColors = [
            'from-blue-600 to-indigo-700',
            'from-emerald-500 to-teal-600',
            'from-purple-500 to-pink-600',
            'from-amber-500 to-orange-600',
            'from-rose-500 to-red-600',
            'from-cyan-500 to-blue-600',
            'from-violet-500 to-purple-600',
            'from-fuchsia-500 to-pink-600',
          ];

          const renderTicketCard = (experience: any, index: number) => (
            <div 
              key={experience.id} 
              className="bg-white rounded-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300 relative border border-gray-100 flex flex-col h-full"
              onClick={() => openCheckout(experience)}
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
                  <button onClick={(e) => { e.stopPropagation(); handleQuickBook(experience); }} className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 hover:text-white transition-colors text-gray-700">
                    <ShoppingCart className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-3.5 flex-1 flex flex-col">
                <div className="flex items-center gap-0.5 mb-1">
                  {[1,2,3,4,5].map(s => (
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
                    <span className="text-lg font-black text-gray-900">{experience.price?.toFixed(2).replace('.', ',')}€</span>
                    <span className="text-[10px] text-gray-400 ml-0.5">{isBowlingCheck(experience) ? '/Bahn' : '/Person'}</span>
                  </div>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-full font-bold shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all text-[11px]"
                    onClick={(e) => { e.stopPropagation(); openCheckout(experience); }}
                  >
                    Buchen
                  </Button>
                </div>
              </div>
            </div>
          );

          if (experiences.length === 0) {
            return (
              <div className="text-center py-20 bg-gray-50 rounded-2xl">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Ticket className="h-10 w-10 text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">Keine Angebote verfügbar</p>
              </div>
            );
          }

          const uniqueCategories = [...new Set(experiences.map((e: any) => e.categoryId))];
          const hasMultipleCategories = uniqueCategories.length > 1;

          const categoryIcons: Record<string, any> = {
            'Bouldern': Mountain, 'Kletterhalle': Mountain, 'Kletterpark': TreePine,
            'Lasertag': Target, 'Escape Rooms': Key, 'Escape Room': Key,
            'Kino': Film, 'Schwimmbad': Waves, 'Freibad': Waves,
            'Museum': Landmark, 'Trampolinhalle': Zap, 'Bowling': CircleDot,
            'Minigolf': Flag, 'Kartbahn': Flag, 'Axtwerfen': Target,
            'Freizeitpark': PartyPopper, 'Paintball': Target, 'Soccer': Footprints,
            'VR Spiele': Gamepad2, 'Games': Gamepad2, 'Padeltennis': Dumbbell,
          };

          const categoryColors: Record<string, { bg: string; text: string; border: string; badge: string }> = {
            'Bouldern': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
            'Kletterhalle': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
            'Kletterpark': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', badge: 'bg-green-100 text-green-700' },
            'Lasertag': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
            'Escape Rooms': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
            'Escape Room': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
            'Kino': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700' },
            'Schwimmbad': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', badge: 'bg-cyan-100 text-cyan-700' },
            'Freibad': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', badge: 'bg-cyan-100 text-cyan-700' },
            'Museum': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
            'Trampolinhalle': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', badge: 'bg-pink-100 text-pink-700' },
            'Bowling': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', badge: 'bg-teal-100 text-teal-700' },
            'Minigolf': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200', badge: 'bg-lime-100 text-lime-700' },
            'Kartbahn': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700' },
            'Axtwerfen': { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200', badge: 'bg-stone-100 text-stone-700' },
            'Freizeitpark': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700' },
            'Paintball': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
            'Soccer': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', badge: 'bg-green-100 text-green-700' },
            'VR Spiele': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', badge: 'bg-fuchsia-100 text-fuchsia-700' },
            'Games': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', badge: 'bg-fuchsia-100 text-fuchsia-700' },
            'Padeltennis': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-700' },
          };

          const categoryHeroImages: Record<string, string> = {
            'Minigolf': 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=400&fit=crop',
            'Lasertag': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop',
            'Escape Room': 'https://images.unsplash.com/photo-1587825140708-dfaf18c4f8e0?w=600&h=400&fit=crop',
            'Escape Rooms': 'https://images.unsplash.com/photo-1587825140708-dfaf18c4f8e0?w=600&h=400&fit=crop',
            'Paintball': 'https://images.unsplash.com/photo-1565711561500-49678a10a63f?w=600&h=400&fit=crop',
            'Soccer': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop',
            'VR Spiele': 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&h=400&fit=crop',
            'Games': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop',
            'Trampolinhalle': 'https://images.unsplash.com/photo-1626248801379-51a0748a5f96?w=600&h=400&fit=crop',
            'Axtwerfen': 'https://images.unsplash.com/photo-1534369265652-cd60fbfe7e92?w=600&h=400&fit=crop',
            'Freizeitpark': 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop',
            'Bouldern': 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&h=400&fit=crop',
            'Kletterhalle': 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&h=400&fit=crop',
            'Kletterpark': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop',
            'Bowling': 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=600&h=400&fit=crop',
            'Schwimmbad': 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&h=400&fit=crop',
            'Freibad': 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&h=400&fit=crop',
            'Kino': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop',
            'Museum': 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=600&h=400&fit=crop',
            'Padeltennis': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&fit=crop',
            'Kartbahn': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop',
          };

          const defaultColor = { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700' };

          if (hasMultipleCategories) {
            const categoryMap: Record<number, { name: string; experiences: any[] }> = {};
            experiences.forEach((exp: any) => {
              const catId = exp.categoryId || 0;
              if (!categoryMap[catId]) {
                categoryMap[catId] = { name: exp.categoryName || 'Sonstige', experiences: [] };
              }
              categoryMap[catId].experiences.push(exp);
            });

            const [selectedCategory, setSelectedCategoryState] = [
              null as string | null,
              (cat: string | null) => {
                const el = cat ? document.getElementById(`cat-section-${cat}`) : null;
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            ];

            return (
              <div className="space-y-10">
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-900">Tickets & Preise</h2>
                  {Object.entries(categoryMap).map(([catId, group]) => {
                    const IconComp = categoryIcons[group.name] || Ticket;
                    const colors = categoryColors[group.name] || defaultColor;
                    const minPrice = Math.min(...group.experiences.map((e: any) => Number(e.price) || 0));

                    return (
                      <div key={catId} id={`cat-section-${catId}`} className={`rounded-2xl border ${colors.border} ${colors.bg} p-5 scroll-mt-24`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                              <IconComp className={`h-5 w-5 ${colors.text}`} />
                            </div>
                            <div>
                              <h4 className={`text-lg font-bold ${colors.text}`}>{group.name}</h4>
                              <p className="text-xs text-gray-500">{group.experiences.length} Ticket{group.experiences.length !== 1 ? 's' : ''} verfügbar</p>
                            </div>
                          </div>
                          <Badge className="bg-yellow-400 text-gray-900 font-bold border-0 text-sm">
                            ab {minPrice.toFixed(2).replace('.', ',')}€
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {group.experiences.map((exp: any, i: number) => renderTicketCard(exp, i))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {experiences.map((exp: any, i: number) => renderTicketCard(exp, i))}
            </div>
          );
        })()}

        {Number(id) === 582 && (
          <div className="mt-10 space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6 md:p-8 shadow-sm">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900">Wichtige Hinweise zum Besuch</h3>
                  <p className="text-sm text-green-700 mt-0.5">Bitte lest diese Informationen vor eurem Besuch</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white/70 rounded-xl p-5 border border-green-100">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    So läuft euer Besuch ab
                  </h4>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="bg-green-100 text-green-800 font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                      <span>Anmeldung im Kletterpark an der Kasse</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-100 text-green-800 font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                      <span>Ca. 30 Minuten Gurtausgabe, Anziehen & Sicherheitseinweisung</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-100 text-green-800 font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                      <span>2 Stunden Kletterwaldabenteuer auf allen Parcours</span>
                    </li>
                  </ol>
                  <p className="text-xs text-green-700 mt-3 bg-green-50 rounded-lg px-3 py-2">Gesamtdauer ca. 2,5 Stunden inkl. Einweisung</p>
                </div>

                <div className="bg-white/70 rounded-xl p-5 border border-green-100">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    In allen Preisen enthalten
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">&#10003;</span>
                      <span>2,5 Stunden Kletterwaldabenteuer inkl. Europaseilbahn & Einweisung</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">&#10003;</span>
                      <span>Nutzung von allen Parcours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">&#10003;</span>
                      <span>Mega Flying Fox (Europaseilbahn) – ca. 800 Meter, eine der längsten Seilrutschen Europas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">&#10003;</span>
                      <span>Leihausrüstung: Komplettgurte, Helme & Handschuhe</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">&#10003;</span>
                      <span>Innovatives Karabinersystem (kein Aushängen möglich)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border border-blue-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <h4 className="font-bold text-blue-900 text-sm">Reservierungen</h4>
                </div>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  <li>Ohne Voranmeldung zu regulären Öffnungszeiten möglich</li>
                  <li>Ab <strong>10 Personen</strong> – Reservierung erwünscht</li>
                  <li>Ab <strong>20 Personen</strong> – auch außerhalb der Öffnungszeiten möglich</li>
                  <li>Zuschauer kostenlos, Eigenverpflegung möglich</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <h4 className="font-bold text-pink-900 text-sm">Kindergeburtstage</h4>
                </div>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  <li>Ohne Anmeldung zu Öffnungszeiten möglich</li>
                  <li>Ab <strong>6 Personen</strong> – Anmeldung erwünscht</li>
                  <li>Geburtstagsrabatt ab 6 Kindern</li>
                  <li>Tische & Bänke vor Ort vorhanden</li>
                  <li>Eigenverpflegung möglich, Zuschauer kostenlos</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                  <h4 className="font-bold text-amber-900 text-sm">Begleitregeln Kinder</h4>
                </div>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  <li><strong>Ab 1,40 m</strong> – alleine auf allen Parcours</li>
                  <li><strong>1,30–1,40 m</strong> – mit Erwachsenem (max. 3 Kinder pro Erwachsenem)</li>
                  <li><strong>1,20–1,30 m & mind. 6 J.</strong> – mit Erwachsenem (max. 1 Kind pro Erwachsenem)</li>
                </ul>
                <a href="https://kletterpark-soest.de/download/einverstaendniserklaerung.pdf" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Einverständniserklärung (PDF)
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-purple-900 text-sm mb-2">Firmen, Vereine, Gruppen & Junggesellenabschiede</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    In unserem Kletterwald könnt Ihr gemeinsam mit Freunden, Kollegen, Kunden oder Partnern einen wunderschönen Tag verbringen! Professionelle Betreuung durch ausgebildetes Trainerteam und höchste Sicherheitsstandards mit durchlaufendem Sicherungssystem.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full font-medium">Ohne Anmeldung zu Öffnungszeiten</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full font-medium">Ab 10 Pers. Reservierung erwünscht</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full font-medium">Ab 20 Pers. auch außerhalb Öffnungszeiten</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                Jahreskarten-Info
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Die Jahreskarte ist ab dem Kaufdatum <strong>365 Tage gültig</strong> und personenbezogen. Sie gilt sowohl für den <strong>Kletterpark Soest</strong> als auch den <strong>Kletterpark Hamm</strong>. Einmal zahlen – ganzes Jahr Klettern in zwei Kletterparks!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* GRUPPENANFRAGEN: Kindergeburtstag, Schulklasse, Firmenevent */}
      {partner && (
        <GroupInquiryForm
          partnerId={Number(id)}
          partnerName={partner.companyName}
          city={partner.city || ""}
        />
      )}

      {/* Kundenbewertungen Section */}
      {partner && <PartnerReviews partnerId={Number(id)} partnerName={partner.companyName} />}

      {/* LOCATION & CONTACT */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Standort & Kontakt</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Map */}
          <div className="md:col-span-2 bg-white rounded-2xl overflow-hidden shadow-lg min-h-[350px]">
            <PartnerLocationMap
              latitude={partner.latitude}
              longitude={partner.longitude}
              partnerName={partner.companyName}
              address={partner.address}
              city={`${partner.postalCode} ${partner.city}`}
            />
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
            {(partner.category?.toLowerCase().includes('kletter') ||
              partner.category?.toLowerCase().includes('boulder') ||
              partner.companyName?.toLowerCase().includes('kletter') ||
              partner.companyName?.toLowerCase().includes('boulder')) && (
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
              {(() => {
                if (!partner.openingHours) {
                  return (
                    <div className="space-y-1.5">
                      {['Mo - Fr', 'Sa - So'].map((day, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{day}</span>
                          <span className="text-gray-900 font-medium">{i === 0 ? '09:00 - 22:00' : '10:00 - 22:00'}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                const dayLabels: Record<string, string> = {
                  monday: 'Montag', tuesday: 'Dienstag', wednesday: 'Mittwoch',
                  thursday: 'Donnerstag', friday: 'Freitag', saturday: 'Samstag', sunday: 'Sonntag'
                };
                try {
                  const parsed = typeof partner.openingHours === 'string' ? JSON.parse(partner.openingHours) : partner.openingHours;
                  if (typeof parsed === 'object' && parsed !== null) {
                    const entries = Object.entries(parsed);
                    const grouped: { label: string; time: string }[] = [];
                    let i = 0;
                    while (i < entries.length) {
                      const [key, val] = entries[i];
                      let j = i + 1;
                      while (j < entries.length && entries[j][1] === val) j++;
                      const startLabel = dayLabels[key] || key;
                      const endLabel = j > i + 1 ? dayLabels[entries[j - 1][0]] || entries[j - 1][0] : '';
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
                  }
                } catch {}
                const lines = partner.openingHours.includes('|') 
                  ? partner.openingHours.split('|').map((s: string) => s.trim())
                  : partner.openingHours.split('\n').map((s: string) => s.trim()).filter(Boolean);
                return (
                  <div className="space-y-2">
                    {lines.map((line: string, idx: number) => {
                      const colonIdx = line.indexOf(':');
                      const hasTime = colonIdx > 0 && /\d/.test(line.substring(colonIdx + 1));
                      if (hasTime) {
                        const label = line.substring(0, colonIdx).trim();
                        const time = line.substring(colonIdx + 1).trim();
                        return (
                          <div key={idx} className="flex items-center justify-between text-sm gap-2">
                            <span className="text-gray-500 font-medium">{label}</span>
                            <span className="text-gray-900 font-medium text-right">{time}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={idx} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                          {line}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
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

      {/* SKI / Alpincenter Booking Dialog */}
      {/* 3D-Rundgang Dialog */}
      <Dialog open={tourOpen} onOpenChange={setTourOpen}>
        <DialogContent className="sm:max-w-5xl p-0 gap-0 rounded-2xl border-0 shadow-2xl overflow-hidden">
          <DialogHeader className="px-5 py-3 border-b">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Mountain className="h-4 w-4 text-purple-600" />
              3D-Rundgang – {partner?.companyName}
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full bg-black aspect-video">
            {partner?.tourUrl && (
              <iframe
                src={partner.tourUrl}
                title={`3D-Rundgang ${partner.companyName}`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; gyroscope; magnetometer; xr-spatial-tracking; fullscreen; vr"
                allowFullScreen
              />
            )}
          </div>
          {partner?.tourUrl && (
            <div className="px-5 py-3 border-t flex justify-end">
              <a
                href={partner.tourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-purple-700 hover:text-purple-900"
              >
                In neuem Tab öffnen ↗
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={skiBookingOpen} onOpenChange={setSkiBookingOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl">
          <DialogTitle className="sr-only">Alpincenter Bottrop Buchung</DialogTitle>
          {skiStep === 'calendar' && (() => {
            const ticketTypes = [
              { id: 'tages', label: 'Tagesticket', desc: 'Ganzer Tag' },
              { id: 'mittags', label: 'Mittagsticket', desc: 'Ab 12:00 Uhr' },
              { id: 'feierabend', label: 'Feierabendticket', desc: 'Ab 17:00 Uhr' },
              { id: 'abend', label: 'Abendticket', desc: 'Ab 20:00 (Fr-Sa)' },
            ];

            const getSkiPrice = (type: string, age: string, date: Date): number => {
              const day = date.getDay();
              const isWeekend = day === 0 || day === 6;
              const isFriday = day === 5;
              const prices: Record<string, Record<string, { weekday: number; friday?: number; weekend: number }>> = {
                tages: {
                  erwachsene: { weekday: 7200, weekend: 8200 },
                  kinder: { weekday: 3600, weekend: 4100 },
                },
                mittags: {
                  erwachsene: { weekday: 6200, weekend: 7200 },
                  kinder: { weekday: 3100, weekend: 3600 },
                },
                feierabend: {
                  erwachsene: { weekday: 5200, friday: 6400, weekend: 7400 },
                  kinder: { weekday: 2600, friday: 3200, weekend: 3700 },
                },
                abend: {
                  erwachsene: { weekday: 0, friday: 5200, weekend: 5200 },
                  kinder: { weekday: 0, friday: 2600, weekend: 2600 },
                },
              };
              const p = prices[type]?.[age];
              if (!p) return 0;
              if (type === 'abend' && !isFriday && !isWeekend) return 0;
              if (isFriday && p.friday) return p.friday;
              if (isWeekend) return p.weekend;
              return p.weekday;
            };

            const year = skiCalendarMonth.getFullYear();
            const month = skiCalendarMonth.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const startOffset = (firstDay.getDay() + 6) % 7;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const calendarDays: (Date | null)[] = [];
            for (let i = 0; i < startOffset; i++) calendarDays.push(null);
            for (let d = 1; d <= lastDay.getDate(); d++) calendarDays.push(new Date(year, month, d));

            const selectedPrice = skiSelectedDate ? getSkiPrice(skiTicketType, skiAgeGroup, skiSelectedDate) : 0;
            const totalPrice = selectedPrice * skiQuantity;

            return (
              <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <button onClick={() => setSkiBookingOpen(false)} className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" /> Zurück
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-5">Wähle ein Besuchsdatum</h2>

                  <div className="flex gap-2 mb-4 flex-wrap">
                    {ticketTypes.map(tt => {
                      const isAbend = tt.id === 'abend';
                      return (
                        <button
                          key={tt.id}
                          onClick={() => setSkiTicketType(tt.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            skiTicketType === tt.id
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {tt.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 mb-5">
                    {[
                      { id: 'erwachsene', label: 'Erwachsene' },
                      { id: 'kinder', label: 'Kinder (6-14)' },
                    ].map(ag => (
                      <button
                        key={ag.id}
                        onClick={() => setSkiAgeGroup(ag.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          skiAgeGroup === ag.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {ag.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => setSkiCalendarMonth(new Date(year, month - 1, 1))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <span className="font-semibold text-gray-700">
                      {skiCalendarMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => setSkiCalendarMonth(new Date(year, month + 1, 1))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-0">
                    {['Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.', 'So.'].map(d => (
                      <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
                    ))}
                    {calendarDays.map((date, i) => {
                      if (!date) return <div key={`e-${i}`} />;
                      const isPast = date < today;
                      const dayPrice = getSkiPrice(skiTicketType, skiAgeGroup, date);
                      const isAvailable = !isPast && dayPrice > 0;
                      const isSelected = skiSelectedDate?.toDateString() === date.toDateString();
                      const isToday = date.toDateString() === today.toDateString();
                      const isWeekendDay = date.getDay() === 0 || date.getDay() === 6;

                      return (
                        <button
                          key={i}
                          disabled={!isAvailable}
                          onClick={() => setSkiSelectedDate(date)}
                          className={`py-2 text-center rounded-lg transition-all relative ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-lg'
                              : isPast || !isAvailable
                              ? 'text-gray-300 cursor-not-allowed'
                              : isWeekendDay
                              ? 'hover:bg-blue-50 text-blue-700'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <span className={`text-sm font-semibold ${isToday && !isSelected ? 'text-red-500' : ''}`}>
                            {date.getDate()}
                          </span>
                          {isAvailable && (
                            <span className={`block text-[10px] ${
                              isSelected ? 'text-white/80' : isWeekendDay ? 'text-blue-500' : 'text-gray-400'
                            }`}>
                              {(dayPrice / 100).toFixed(0)},00 €
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5">
                    <button
                      disabled={!skiSelectedDate}
                      onClick={() => setSkiStep('details')}
                      className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                        skiSelectedDate
                          ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      Weiter →
                    </button>
                  </div>
                </div>

                {skiSelectedDate && (
                  <div className="w-full lg:w-72 bg-gray-50 p-5 border-t lg:border-t-0 lg:border-l border-gray-200 rounded-b-2xl lg:rounded-b-none lg:rounded-r-2xl">
                    <h3 className="font-bold text-gray-900 mb-3">
                      {ticketTypes.find(t => t.id === skiTicketType)?.label}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Calendar className="w-4 h-4" />
                      {skiSelectedDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{skiQuantity}</div>
                        <span className="text-sm text-gray-700">{skiAgeGroup === 'erwachsene' ? 'Erwachsene' : 'Kinder'}</span>
                      </div>
                      <span className="font-semibold">{(selectedPrice / 100).toFixed(2).replace('.', ',')} €</span>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <button
                        onClick={() => setSkiQuantity(Math.max(1, skiQuantity - 1))}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                      >-</button>
                      <span className="text-sm font-medium w-6 text-center">{skiQuantity}</span>
                      <button
                        onClick={() => setSkiQuantity(Math.min(20, skiQuantity + 1))}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                      >+</button>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">Preis</span>
                        <span className="text-xl font-black text-gray-900">{(totalPrice / 100).toFixed(2).replace('.', ',')} €</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {skiStep === 'details' && skiSelectedDate && (() => {
            const getSkiPriceDetail = (type: string, age: string, date: Date): number => {
              const day = date.getDay();
              const isWeekend = day === 0 || day === 6;
              const isFriday = day === 5;
              const prices: Record<string, Record<string, { weekday: number; friday?: number; weekend: number }>> = {
                tages: { erwachsene: { weekday: 7200, weekend: 8200 }, kinder: { weekday: 3600, weekend: 4100 } },
                mittags: { erwachsene: { weekday: 6200, weekend: 7200 }, kinder: { weekday: 3100, weekend: 3600 } },
                feierabend: { erwachsene: { weekday: 5200, friday: 6400, weekend: 7400 }, kinder: { weekday: 2600, friday: 3200, weekend: 3700 } },
                abend: { erwachsene: { weekday: 0, friday: 5200, weekend: 5200 }, kinder: { weekday: 0, friday: 2600, weekend: 2600 } },
              };
              const p = prices[type]?.[age];
              if (!p) return 0;
              if (isFriday && p.friday) return p.friday;
              if (isWeekend) return p.weekend;
              return p.weekday;
            };
            const unitPrice = getSkiPriceDetail(skiTicketType, skiAgeGroup, skiSelectedDate);
            const total = unitPrice * skiQuantity;
            const ticketLabel = skiTicketType === 'tages' ? 'Tagesticket' : skiTicketType === 'mittags' ? 'Mittagsticket' : skiTicketType === 'feierabend' ? 'Feierabendticket' : 'Abendticket';
            const ageLabel = skiAgeGroup === 'erwachsene' ? 'Erwachsene' : 'Kinder';

            return (
              <div className="p-6">
                <button onClick={() => setSkiStep('calendar')} className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mb-4">
                  <ChevronLeft className="w-4 h-4" /> Zurück zum Kalender
                </button>

                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-5 mb-5 text-white">
                  <h3 className="font-bold text-lg">Alpincenter Bottrop</h3>
                  <p className="text-white/80 text-sm">{ticketLabel} – {ageLabel}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-white/70">
                    <Calendar className="w-4 h-4" />
                    {skiSelectedDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{skiQuantity}× {ticketLabel} {ageLabel}</span>
                    <span className="font-medium">{(unitPrice / 100).toFixed(2).replace('.', ',')} €</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
                    <span>Gesamt</span>
                    <span className="text-blue-600">{(total / 100).toFixed(2).replace('.', ',')} €</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
                    <Input
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Vor- und Nachname"
                      className="rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">E-Mail</label>
                    <Input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="email@beispiel.de"
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <button
                  disabled={!guestName || !guestEmail}
                  onClick={async () => {
                    try {
                      const matchingExp = experiences.find((e: any) => {
                        const t = e.title.toLowerCase();
                        const typeMatch = skiTicketType === 'tages' ? t.includes('tagesticket') :
                          skiTicketType === 'mittags' ? t.includes('mittagsticket') :
                          skiTicketType === 'feierabend' ? t.includes('feierabendticket') :
                          t.includes('abendticket');
                        const ageMatch = skiAgeGroup === 'erwachsene' ? (t.includes('erwachsene') || t.includes('erw.')) : t.includes('kinder');
                        const day = skiSelectedDate!.getDay();
                        const isWeekend = day === 0 || day === 6;
                        const isFriday = day === 5;
                        if (skiTicketType === 'feierabend') {
                          if (isFriday) return typeMatch && ageMatch && t.includes('fr');
                          if (isWeekend) return typeMatch && ageMatch && t.includes('sa-so');
                          return typeMatch && ageMatch && t.includes('mo-do');
                        }
                        if (skiTicketType === 'abend') return typeMatch && ageMatch && t.includes('fr-sa');
                        if (isWeekend) return typeMatch && ageMatch && t.includes('sa-so');
                        return typeMatch && ageMatch && t.includes('mo-fr');
                      });

                      const res = await fetch('/api/bookings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          experienceId: matchingExp?.id || selectedExperience?.id,
                          date: skiSelectedDate!.toISOString().split('T')[0],
                          time: skiTicketType === 'abend' ? '20:00' : skiTicketType === 'feierabend' ? '17:00' : skiTicketType === 'mittags' ? '12:00' : '09:00',
                          participants: skiQuantity,
                          totalPrice: total / 100,
                          guestName,
                          guestEmail,
                          guestBooking: true,
                          paymentMethod: 'vor_ort',
                        }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setBookingCode(data.bookingCode || data.id?.toString() || '');
                        setSkiStep('success');
                      } else {
                        toast({ title: 'Fehler', description: 'Buchung konnte nicht erstellt werden.', variant: 'destructive' });
                      }
                    } catch {
                      toast({ title: 'Fehler', description: 'Verbindungsfehler. Bitte erneut versuchen.', variant: 'destructive' });
                    }
                  }}
                  className={`w-full mt-5 py-3 rounded-xl font-bold text-white transition-all ${
                    guestName && guestEmail
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Jetzt buchen – {(total / 100).toFixed(2).replace('.', ',')} €
                </button>
              </div>
            );
          })()}

          {skiStep === 'success' && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Buchung bestätigt!</h3>
              <p className="text-gray-500 mb-1">Alpincenter Bottrop</p>
              {bookingCode && (
                <p className="text-sm text-gray-400 mb-4">Buchungscode: <span className="font-mono font-bold text-gray-700">{bookingCode}</span></p>
              )}
              <p className="text-sm text-gray-500 mb-6">
                Deine Bestätigung wurde an <span className="font-medium">{guestEmail}</span> gesendet.
              </p>
              <button
                onClick={() => setSkiBookingOpen(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
              >
                Schließen
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cinema Booking Dialog with Interactive Seat Map */}
      <Dialog open={cinemaDialogOpen} onOpenChange={setCinemaDialogOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl">
          <DialogTitle className="sr-only">Kino Sitzplatz wählen</DialogTitle>
          {cinemaExperience && (
            <InteractiveSeatMap
              experience={cinemaExperience}
              partnerName={partner?.companyName || "Kino"}
              standardPrice={9}
              premiumPrice={9}
              onBooking={() => setCinemaDialogOpen(false)}
              onClose={() => setCinemaDialogOpen(false)}
              partnerId={Number(id)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Minigolf Booking System - Partner 627 */}
      <MinigolfBooking
        partner={partner}
        experience={selectedExperience}
        open={minigolfBookingOpen}
        onClose={() => setMinigolfBookingOpen(false)}
      />

      {/* Direct Checkout Modal - Modern Design */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl">
          {checkoutStep === 'form' ? (
            <>
              {/* Modern Header with Gradient */}
              <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-5 rounded-t-2xl">
                <div className="flex items-center gap-4">
                  {selectedExperience?.imageUrl ? (
                    <img 
                      src={selectedExperience.imageUrl} 
                      alt={selectedExperience?.title}
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-white/30 shadow-lg"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <Ticket className="h-7 w-7 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg truncate">{selectedExperience?.title}</h3>
                    <p className="text-white/70 text-sm">{partner?.companyName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-xs">ab</p>
                    <p className="text-2xl font-black text-white">
                      {(selectedExperience?.category?.slug === 'escape-rooms' ||
                        selectedExperience?.title?.toLowerCase().includes('escape') ||
                        selectedExperience?.title?.toLowerCase().includes('room') ||
                        partner?.companyName?.toLowerCase().includes('escape') ||
                        partner?.companyName?.toLowerCase().includes('locked'))
                        ? '108,00€'
                        : `${selectedExperience?.price?.toFixed(2)}€`
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedExperience && (
                <div className="p-5 space-y-5">

                  {/* Booking Options */}
                  <div className="space-y-4">
                    {/* Name & Email - Modern Style (hidden for Kartbahn/Bouldern/Klettern - their booking systems have their own) */}
                    {!(partner?.category?.toLowerCase().includes('kartbahn') ||
                      partner?.category?.toLowerCase().includes('go kart') ||
                      partner?.category?.toLowerCase().includes('gokart') ||
                      partner?.companyName?.toLowerCase().includes('kart') ||
                      partner?.companyName?.toLowerCase().includes('boulder') ||
                      partner?.companyName?.toLowerCase().includes('kletter') ||
                      partner?.companyName?.toLowerCase().includes('einstein') ||
                      partner?.companyName?.toLowerCase().includes('monkeyspot') ||
                      partner?.companyName?.toLowerCase().includes('superblock') ||
                      partner?.category?.toLowerCase().includes('boulder') ||
                      partner?.category?.toLowerCase().includes('kletter') ||
                      selectedExperience?.category?.slug === 'bouldern' ||
                      selectedExperience?.category?.slug === 'klettern') && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="guest-name" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</Label>
                        <Input 
                          id="guest-name"
                          placeholder="Max Mustermann"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="h-11 text-sm border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="guest-email" className="text-xs font-medium text-gray-500 uppercase tracking-wide">E-Mail</Label>
                        <Input 
                          id="guest-email"
                          type="email"
                          placeholder="max@beispiel.de"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="h-11 text-sm border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        />
                      </div>
                    </div>
                    )}

                    {/* Quantity - Modern Stepper */}
                    {!(selectedExperience?.category?.slug === 'escape-rooms' ||
                      selectedExperience?.title?.toLowerCase().includes('escape') ||
                      selectedExperience?.title?.toLowerCase().includes('room') ||
                      selectedExperience?.title?.toLowerCase().includes('raum:') ||
                      partner?.companyName?.toLowerCase().includes('escape') ||
                      partner?.companyName?.toLowerCase().includes('locked') ||
                      partner?.category?.toLowerCase().includes('kartbahn') ||
                      partner?.category?.toLowerCase().includes('go kart') ||
                      partner?.category?.toLowerCase().includes('gokart') ||
                      partner?.companyName?.toLowerCase().includes('kart')) && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <Label className="text-sm font-medium text-gray-700">Anzahl Personen</Label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCustomQuantity(Math.max(1, customQuantity - 1))}
                          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all shadow-sm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-lg font-bold text-gray-900">{customQuantity}</span>
                        <button
                          type="button"
                          onClick={() => setCustomQuantity(Math.min(10, customQuantity + 1))}
                          className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-all shadow-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    )}

                    {/* Escape Room: Group Size FIRST, then Date/Time */}
                    {(selectedExperience?.category?.slug === 'escape-rooms' ||
                      selectedExperience?.category?.slug === 'escape-room' ||
                      selectedExperience?.title?.toLowerCase().includes('escape') ||
                      selectedExperience?.title?.toLowerCase().includes('raum:') ||
                      selectedExperience?.title?.toLowerCase().includes('room') ||
                      selectedExperience?.title?.toLowerCase().includes('kneipentour') ||
                      selectedExperience?.title?.toLowerCase().includes('büdchen') ||
                      selectedExperience?.title?.toLowerCase().includes('radtour') ||
                      selectedExperience?.title?.toLowerCase().includes('würfel') ||
                      selectedExperience?.title?.toLowerCase().includes('bo.n.d') ||
                      partner?.companyName?.toLowerCase().includes('escape') ||
                      partner?.companyName?.toLowerCase().includes('rätsel') ||
                      partner?.companyName?.toLowerCase().includes('locked')) && (() => {
                      const selTitle = selectedExperience?.title?.toLowerCase() || '';
                      const isOutdoorTour = selTitle.includes('tour') || selTitle.includes('kneipe') || selTitle.includes('braumeister') || selTitle.includes('büdchen') || selTitle.includes('letzte runde') || selTitle.includes('radtour') || selTitle.includes('hüter') || selTitle.includes('aurora') || selTitle.includes('würfel') || selTitle.includes('zauber') || selTitle.includes('bo.n.d') || selTitle.includes('academy') || selTitle.includes('durchgezecht') || selTitle.includes('bermuda') || selTitle.includes('verschollen');
                      const isGasseRoom = selTitle.includes('gasse');
                      const isLockedOutdoor = partner?.companyName?.toLowerCase().includes('locked') && isOutdoorTour;

                      const lockedOutdoorPricing: Record<number, number> = {
                        2: 49.90, 3: 49.90, 4: 49.90, 5: 49.90, 6: 49.90
                      };
                      const outdoorTourPricing: Record<number, number> = {
                        2: 138.00, 3: 138.00, 4: 138.00, 5: 158.00, 6: 178.00, 7: 198.00
                      };
                      const gassePricing: Record<number, number> = {
                        4: 198.00, 5: 225.00, 6: 252.00, 7: 280.00, 8: 298.00
                      };
                      const standardEscapePricing: Record<number, number> = {
                        2: 108.00, 3: 108.00, 4: 132.00, 5: 150.00, 6: 168.00, 7: 175.00
                      };
                      // Prefer per-experience price_table from booking_config (real partner prices)
                      const cfg = selectedExperience?.bookingConfig;
                      const cfgTable: Record<number, number> | null = (cfg?.price_table && Array.isArray(cfg.price_table))
                        ? cfg.price_table.reduce((acc: Record<number, number>, row: any) => {
                            if (row?.persons && row?.total) acc[Number(row.persons)] = Number(row.total);
                            return acc;
                          }, {})
                        : null;
                      const escapeRoomPricing = cfgTable && Object.keys(cfgTable).length > 0
                        ? cfgTable
                        : (isLockedOutdoor ? lockedOutdoorPricing : isOutdoorTour ? outdoorTourPricing : isGasseRoom ? gassePricing : standardEscapePricing);
                      const defaultKey = isGasseRoom ? 4 : 2;
                      const currentPrice = escapeRoomPricing[bookingQuantity] || escapeRoomPricing[defaultKey];
                      const pricePerPerson = currentPrice / bookingQuantity;
                      const escapeTimeSlots = isOutdoorTour
                        ? ['10:00', '12:00', '14:00', '16:00', '18:00', '19:15']
                        : ['11:00', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30'];
                      
                      return (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Gruppengröße wählen</p>
                            <span className="text-xs text-purple-600 font-medium">
                              {(() => {
                                if (cfgTable) {
                                  const minPP = Math.min(...Object.entries(cfgTable).map(([n, p]) => Number(p) / Number(n)));
                                  return `ab ${minPP.toFixed(2).replace('.', ',')}€ p.P.`;
                                }
                                return isLockedOutdoor ? '49,90€ pro Gruppe' : isOutdoorTour ? 'ab 20€ p.P.' : isGasseRoom ? 'ab 37€ p.P.' : 'ab 25€ p.P.';
                              })()}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {Object.entries(escapeRoomPricing).map(([persons, price]) => {
                              const num = parseInt(persons);
                              const isSelected = bookingQuantity === num;
                              return (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => setBookingQuantity(num)}
                                  className={`py-2.5 px-2 rounded-xl border-2 text-center transition-all ${
                                    isSelected
                                      ? 'border-purple-500 bg-purple-50 shadow-md'
                                      : 'border-gray-200 bg-white hover:border-purple-300'
                                  }`}
                                >
                                  <p className={`text-[11px] font-medium ${isSelected ? 'text-purple-600' : 'text-gray-500'}`}>
                                    {num} Personen
                                  </p>
                                  <p className={`text-base font-bold ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>
                                    {price.toFixed(2).replace('.', ',')}€
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex items-center justify-between bg-purple-50/80 rounded-xl px-4 py-2">
                            <p className="text-sm text-purple-700">
                              <span className="font-semibold">{bookingQuantity} Personen</span>
                              <span className="text-purple-500 ml-1">({pricePerPerson.toFixed(2).replace('.', ',')}€/Person)</span>
                            </p>
                            <p className="text-lg font-bold text-purple-700">{currentPrice.toFixed(2).replace('.', ',')}€</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3 border">
                            <div className="flex items-center justify-between mb-2">
                              <button type="button" onClick={() => {
                                const current = customDate ? new Date(customDate) : new Date();
                                current.setMonth(current.getMonth() - 1);
                                setCustomDate(current.toISOString().split('T')[0]);
                              }} className="p-1 hover:bg-gray-200 rounded text-gray-500">
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <span className="text-xs font-medium text-gray-700">
                                {(customDate ? new Date(customDate) : new Date()).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                              </span>
                              <button type="button" onClick={() => {
                                const current = customDate ? new Date(customDate) : new Date();
                                current.setMonth(current.getMonth() + 1);
                                setCustomDate(current.toISOString().split('T')[0]);
                              }} className="p-1 hover:bg-gray-200 rounded text-gray-500">
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-gray-500 mb-1">
                              {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => <div key={d} className="py-0.5">{d}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-0.5">
                              {(() => {
                                const baseDate = customDate ? new Date(customDate) : new Date();
                                const year = baseDate.getFullYear();
                                const month = baseDate.getMonth();
                                const firstDay = new Date(year, month, 1);
                                const lastDay = new Date(year, month + 1, 0);
                                const startPadding = (firstDay.getDay() + 6) % 7;
                                const days = [];
                                const today = new Date(); today.setHours(0,0,0,0);
                                for (let i = 0; i < startPadding; i++) days.push(<div key={`p${i}`} />);
                                for (let d = 1; d <= lastDay.getDate(); d++) {
                                  const date = new Date(year, month, d);
                                  const dateStr = date.toISOString().split('T')[0];
                                  const isPast = date < today;
                                  const isSelected = customDate === dateStr;
                                  days.push(
                                    <button key={d} type="button" disabled={isPast} onClick={() => setCustomDate(dateStr)}
                                      className={`w-6 h-6 rounded-full text-[11px] font-medium transition-all ${
                                        isSelected ? 'bg-purple-500 text-white' : isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-purple-100 text-gray-700'
                                      }`}>{d}</button>
                                  );
                                }
                                return days;
                              })()}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 border">
                            <p className="text-xs font-medium text-gray-700 mb-2">Startzeit wählen</p>
                            <div className="grid grid-cols-2 gap-1.5">
                              {escapeTimeSlots.map(t => (
                                <button 
                                  key={t} 
                                  type="button" 
                                  onClick={() => setCustomTime(t)}
                                  className={`py-2 rounded-lg text-xs font-medium transition-all ${
                                    customTime === t 
                                      ? 'bg-purple-500 text-white shadow-sm' 
                                      : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                                  }`}
                                >
                                  {t} Uhr
                                </button>
                              ))}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 text-center">Spieldauer: ca. 60-70 Min.</p>
                          </div>
                        </div>
                      </>
                      );
                    })()}

                    {/* Non-Escape-Room: Standard Date & Time */}
                    {!(selectedExperience?.category?.slug === 'escape-rooms' ||
                      selectedExperience?.title?.toLowerCase().includes('escape') ||
                      selectedExperience?.title?.toLowerCase().includes('raum:') ||
                      selectedExperience?.title?.toLowerCase().includes('room') ||
                      partner?.companyName?.toLowerCase().includes('escape') ||
                      partner?.companyName?.toLowerCase().includes('locked') ||
                      partner?.category?.toLowerCase().includes('kartbahn') ||
                      partner?.category?.toLowerCase().includes('go kart') ||
                      partner?.category?.toLowerCase().includes('gokart') ||
                      partner?.companyName?.toLowerCase().includes('kart') ||
                      partner?.companyName?.toLowerCase().includes('boulder') ||
                      partner?.companyName?.toLowerCase().includes('kletter') ||
                      partner?.companyName?.toLowerCase().includes('einstein') ||
                      partner?.companyName?.toLowerCase().includes('monkeyspot') ||
                      partner?.companyName?.toLowerCase().includes('superblock') ||
                      partner?.category?.toLowerCase().includes('boulder') ||
                      partner?.category?.toLowerCase().includes('kletter') ||
                      selectedExperience?.category?.slug === 'bouldern' ||
                      selectedExperience?.category?.slug === 'klettern') && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex items-center justify-between mb-2">
                          <button type="button" onClick={() => {
                            const current = customDate ? new Date(customDate) : new Date();
                            current.setMonth(current.getMonth() - 1);
                            setCustomDate(current.toISOString().split('T')[0]);
                          }} className="p-1 hover:bg-gray-200 rounded text-gray-500">
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-medium text-gray-700">
                            {(customDate ? new Date(customDate) : new Date()).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                          </span>
                          <button type="button" onClick={() => {
                            const current = customDate ? new Date(customDate) : new Date();
                            current.setMonth(current.getMonth() + 1);
                            setCustomDate(current.toISOString().split('T')[0]);
                          }} className="p-1 hover:bg-gray-200 rounded text-gray-500">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
                          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => <div key={d} className="py-1">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {(() => {
                            const baseDate = customDate ? new Date(customDate) : new Date();
                            const year = baseDate.getFullYear();
                            const month = baseDate.getMonth();
                            const firstDay = new Date(year, month, 1);
                            const lastDay = new Date(year, month + 1, 0);
                            const startPadding = (firstDay.getDay() + 6) % 7;
                            const days = [];
                            const today = new Date(); today.setHours(0,0,0,0);
                            for (let i = 0; i < startPadding; i++) days.push(<div key={`p${i}`} />);
                            for (let d = 1; d <= lastDay.getDate(); d++) {
                              const date = new Date(year, month, d);
                              const dateStr = date.toISOString().split('T')[0];
                              const isPast = date < today;
                              const isSelected = customDate === dateStr;
                              days.push(
                                <button key={d} type="button" disabled={isPast} onClick={() => setCustomDate(dateStr)}
                                  className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${
                                    isSelected ? 'bg-cyan-500 text-white' : isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-cyan-100 text-gray-700'
                                  }`}>{d}</button>
                              );
                            }
                            return days;
                          })()}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <p className="text-sm font-medium text-gray-700 mb-2">Uhrzeit wählen</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(t => {
                            const info = slotInfo[t];
                            const isCalendarBlocked = calendarBlockedSlots.includes(t);
                            const hasResources = availableResources.length > 0;
                            const isFullyBooked = hasResources 
                              ? (info && !info.available) 
                              : bookedSlots.includes(t);
                            const isUnavailable = isCalendarBlocked || isFullyBooked;
                            const availableCount = info ? info.totalResources - info.bookedResources : 0;
                            
                            return (
                              <button 
                                key={t} 
                                type="button" 
                                onClick={() => !isUnavailable && setCustomTime(t)}
                                disabled={isUnavailable}
                                className={`py-2 rounded text-xs font-medium transition-all ${
                                  isCalendarBlocked
                                    ? 'bg-red-100 text-red-500 cursor-not-allowed border border-red-200'
                                    : isFullyBooked
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : customTime === t 
                                        ? 'bg-cyan-500 text-white' 
                                        : 'bg-white text-gray-700 hover:bg-cyan-50 border border-gray-200'
                                }`}
                              >
                                {t}
                                {isCalendarBlocked && <span className="block text-[10px]">Nicht verfügbar</span>}
                                {isFullyBooked && !isCalendarBlocked && <span className="block text-[10px]">ausgebucht</span>}
                                {!isUnavailable && hasResources && info && info.totalResources > 1 && (
                                  <span className="block text-[10px] text-green-600">
                                    {availableCount} von {info.totalResources} frei
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {lastAvailabilityUpdate && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] text-gray-400">
                              Live · {lastAvailabilityUpdate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              {calendarBlockedSlots.length > 0 && ` · ${calendarBlockedSlots.length} blockiert`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    )}

                    {/* Category-Specific Options */}
                    {(selectedExperience?.category?.slug === 'bowling' || 
                      selectedExperience?.title?.toLowerCase().includes('bowling') ||
                      partner?.companyName?.toLowerCase().includes('bowling')) && (
                      <div className="space-y-3 pt-3 border-t">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Bowling-Optionen (Preis pro Bahn)</p>
                        <div className="space-y-1">
                          <Label className="text-sm text-gray-700">Spieldauer</Label>
                          <Select value={sessionLength} onValueChange={setSessionLength}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="60">1 Stunde</SelectItem>
                              <SelectItem value="90">1,5 Stunden</SelectItem>
                              <SelectItem value="120">2 Stunden</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs text-gray-500 italic">Eine freie Bahn wird automatisch zugewiesen</p>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={shoeRental} onChange={(e) => setShoeRental(e.target.checked)} className="rounded" />
                            <span className="text-sm">Leihschuhe (+4€/Paar)</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {(selectedExperience?.category?.slug === 'lasertag' ||
                      selectedExperience?.title?.toLowerCase().includes('laser') ||
                      partner?.companyName?.toLowerCase().includes('laser')) && (
                      <div className="space-y-3 pt-3 border-t">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Lasertag-Optionen</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-sm text-gray-700">Session</Label>
                            <Select value={sessionLength} onValueChange={setSessionLength}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3">3 Spiele (~45 Min)</SelectItem>
                                <SelectItem value="4">4 Spiele (~60 Min)</SelectItem>
                                <SelectItem value="6">6 Spiele (~90 Min)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm text-gray-700">Spielmodus</Label>
                            <Select value={gameMode} onValueChange={setGameMode}>
                              <SelectTrigger>
                                <SelectValue placeholder="Wählen" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="team">Team Deathmatch</SelectItem>
                                <SelectItem value="ffa">Free for All</SelectItem>
                                <SelectItem value="ctf">Capture the Flag</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedExperience?.category?.slug === 'minigolf' && (
                      <div className="space-y-3 pt-3 border-t">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Minigolf-Optionen</p>
                        <div className="space-y-1">
                          <Label className="text-sm text-gray-700">Parcours</Label>
                          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger>
                              <SelectValue placeholder="Parcours wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="classic">Klassischer Parcours (18 Bahnen)</SelectItem>
                              <SelectItem value="adventure">Abenteuer-Parcours (18 Bahnen)</SelectItem>
                              <SelectItem value="glow">Schwarzlicht-Minigolf (+3€)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {selectedExperience?.category?.slug === 'trampolinhalle' && (
                      <div className="space-y-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <Label className="flex items-center gap-2 text-orange-800 font-medium">
                          <Zap className="h-4 w-4" /> Trampolinhallen-Optionen
                        </Label>
                        <div className="space-y-2">
                          <Label className="text-sm">Stoppersocken (Pflicht)</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'own', name: 'Eigene mitbringen', price: 0 },
                              { id: 'buy', name: 'Kaufen', price: 3 }
                            ].map(option => (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => setGripSocks(option.id)}
                                className={`p-2 rounded-lg border text-xs text-center transition-all ${
                                  gripSocks === option.id 
                                    ? 'border-orange-500 bg-orange-100' 
                                    : 'border-gray-200 hover:border-orange-300'
                                }`}
                              >
                                {option.name}
                                {option.price > 0 && <span className="block text-orange-600">+{option.price}€</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {(selectedExperience?.category?.slug === 'schwimmbad' ||
                      selectedExperience?.title?.toLowerCase().includes('bad') ||
                      selectedExperience?.title?.toLowerCase().includes('schwimm') ||
                      selectedExperience?.title?.toLowerCase().includes('sauna') ||
                      selectedExperience?.title?.toLowerCase().includes('therme') ||
                      selectedExperience?.title?.toLowerCase().includes('aqua') ||
                      partner?.companyName?.toLowerCase().includes('bad') ||
                      partner?.companyName?.toLowerCase().includes('therme')) && (
                      <div className="space-y-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                        <Label className="flex items-center gap-2 text-cyan-800 font-medium">
                          <Waves className="h-4 w-4" /> Schwimmbad-Optionen
                        </Label>
                        
                        {/* Ticket-Typ */}
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Ticket-Typ</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'tages', label: 'Tageskarte', desc: 'Ganzer Tag', icon: '☀️' },
                              { id: '3std', label: '3-Stunden', desc: 'Zeit ab Eintritt', icon: '⏱️' },
                              { id: 'abend', label: 'Abendtarif', desc: 'Ab 18:00 Uhr', icon: '🌙' }
                            ].map(ticket => (
                              <button
                                key={ticket.id}
                                type="button"
                                onClick={() => setSessionLength(ticket.id)}
                                className={`p-2 rounded-lg border text-xs text-center transition-all ${
                                  sessionLength === ticket.id 
                                    ? 'border-cyan-500 bg-cyan-100 text-cyan-800' 
                                    : 'border-gray-200 hover:border-cyan-300'
                                }`}
                              >
                                <span className="block text-lg">{ticket.icon}</span>
                                <span className="font-medium">{ticket.label}</span>
                                <span className="block text-[10px] text-gray-500">{ticket.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Bereich-Auswahl */}
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Bereich</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'bad', name: 'Nur Bad', icon: '🏊', desc: 'Schwimm- & Erlebnisbecken' },
                              { id: 'sauna', name: 'Nur Sauna', icon: '🧖', desc: 'Saunalandschaft' },
                              { id: 'kombi', name: 'Bad + Sauna', icon: '✨', desc: 'Kompletter Zugang' },
                              { id: 'wellness', name: 'Wellness', icon: '💆', desc: 'Spa & Massagen' }
                            ].map(bereich => (
                              <button
                                key={bereich.id}
                                type="button"
                                onClick={() => setSelectedRoom(bereich.id)}
                                className={`p-2 rounded-lg border text-xs text-left transition-all flex items-center gap-2 ${
                                  selectedRoom === bereich.id 
                                    ? 'border-cyan-500 bg-cyan-100 text-cyan-800' 
                                    : 'border-gray-200 hover:border-cyan-300'
                                }`}
                              >
                                <span className="text-lg">{bereich.icon}</span>
                                <div>
                                  <span className="font-medium block">{bereich.name}</span>
                                  <span className="text-[10px] text-gray-500">{bereich.desc}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Zusatzleistungen */}
                        <div className="space-y-2 pt-2 border-t border-cyan-200">
                          <Label className="text-xs text-gray-600">Zusatzleistungen</Label>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" id="locker" className="rounded border-cyan-300" />
                                <Label htmlFor="locker" className="text-xs cursor-pointer">Schließfach (Wertfach)</Label>
                              </div>
                              <span className="text-xs text-cyan-600 font-medium">+3,00€</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" id="towel" className="rounded border-cyan-300" />
                                <Label htmlFor="towel" className="text-xs cursor-pointer">Handtuch-Set (groß + klein)</Label>
                              </div>
                              <span className="text-xs text-cyan-600 font-medium">+5,00€</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" id="bathrobe" className="rounded border-cyan-300" />
                                <Label htmlFor="bathrobe" className="text-xs cursor-pointer">Bademantel</Label>
                              </div>
                              <span className="text-xs text-cyan-600 font-medium">+8,00€</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" id="parking" className="rounded border-cyan-300" />
                                <Label htmlFor="parking" className="text-xs cursor-pointer">Parkticket (4 Std.)</Label>
                              </div>
                              <span className="text-xs text-cyan-600 font-medium">+4,00€</span>
                            </div>
                          </div>
                        </div>

                        {/* Hinweis */}
                        <p className="text-[10px] text-cyan-600 bg-cyan-100 p-2 rounded">
                          Öffnungszeiten: Mo-Fr 6-22 Uhr, Sa-So 8-22 Uhr. Kinder unter 12 nur mit Begleitung.
                        </p>
                      </div>
                    )}

                    {(selectedExperience?.category?.slug === 'kino' &&
                      !partner?.companyName?.toLowerCase().includes('boulder') &&
                      !partner?.companyName?.toLowerCase().includes('kletter') &&
                      !partner?.companyName?.toLowerCase().includes('soccer') &&
                      !partner?.companyName?.toLowerCase().includes('laser') &&
                      !partner?.companyName?.toLowerCase().includes('escape') &&
                      !partner?.companyName?.toLowerCase().includes('bowling')) && (
                      <div className="space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <Label className="flex items-center gap-2 text-purple-800 font-medium">
                          🎬 Kino-Optionen
                        </Label>
                        <div className="space-y-2">
                          <Label className="text-sm">Vorstellung</Label>
                          <Select value={customTime} onValueChange={setCustomTime}>
                            <SelectTrigger className="border-purple-200">
                              <SelectValue placeholder="Vorstellung wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {['14:00', '16:30', '17:00', '19:30', '20:00', '22:30', '23:00'].map(time => (
                                <SelectItem key={time} value={time}>{time} Uhr</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-sm text-purple-600">
                          Sitzplatzauswahl erfolgt vor Ort • Popcorn-Paket verfügbar
                        </p>
                      </div>
                    )}

                    {/* Soccer Booking System */}
                    {(selectedExperience?.category?.slug === 'soccer' ||
                      selectedExperience?.title?.toLowerCase().includes('soccer') ||
                      selectedExperience?.title?.toLowerCase().includes('fußball') ||
                      selectedExperience?.title?.toLowerCase().includes('fussball') ||
                      selectedExperience?.title?.toLowerCase().includes('bolzplatz') ||
                      selectedExperience?.title?.toLowerCase().includes('kicken') ||
                      partner?.companyName?.toLowerCase().includes('soccer') ||
                      partner?.companyName?.toLowerCase().includes('fußball') ||
                      partner?.companyName?.toLowerCase().includes('kick')) && (
                      <div className="space-y-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <Label className="flex items-center gap-2 text-green-800 font-medium">
                          ⚽ Soccer-Buchung
                        </Label>

                        {/* Spielfeld-Auswahl */}
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Spielfeld</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'full11', name: '11er Großfeld', icon: '🏟️', desc: 'Kunstrasen 105x68m', price: '80€/h' },
                              { id: 'small7', name: '7er Kleinfeld', icon: '⚽', desc: 'Kunstrasen 50x35m', price: '50€/h' },
                              { id: 'futsal5', name: '5er Futsal', icon: '🥅', desc: 'Indoor/Outdoor 40x20m', price: '40€/h' },
                              { id: 'cage', name: 'Soccer Cage', icon: '🔳', desc: 'Käfig 20x15m', price: '30€/h' }
                            ].map(field => (
                              <button
                                key={field.id}
                                type="button"
                                onClick={() => setSelectedRoom(field.id)}
                                className={`p-2 rounded-lg border text-xs text-left transition-all ${
                                  selectedRoom === field.id 
                                    ? 'border-green-500 bg-green-100 ring-2 ring-green-200' 
                                    : 'border-gray-200 hover:border-green-300'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <span className="text-lg">{field.icon}</span>
                                  <span className="text-[10px] text-green-600 font-medium">{field.price}</span>
                                </div>
                                <span className="font-medium block">{field.name}</span>
                                <span className="text-[10px] text-gray-500">{field.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Spieldauer */}
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Spieldauer</Label>
                          <div className="flex gap-1">
                            {[
                              { id: '60', label: '60 Min', desc: 'Training' },
                              { id: '90', label: '90 Min', desc: 'Standard' },
                              { id: '120', label: '120 Min', desc: 'Turnier' }
                            ].map(duration => (
                              <button
                                key={duration.id}
                                type="button"
                                onClick={() => setSessionLength(duration.id)}
                                className={`flex-1 p-2 rounded-lg border text-xs text-center transition-all ${
                                  sessionLength === duration.id 
                                    ? 'border-green-500 bg-green-100 text-green-800' 
                                    : 'border-gray-200 hover:border-green-300'
                                }`}
                              >
                                <span className="font-bold block">{duration.label}</span>
                                <span className="text-[10px] text-gray-500">{duration.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Buchungsart */}
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Buchungsart</Label>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { id: 'casual', name: 'Freizeit', icon: '🎉' },
                              { id: 'training', name: 'Training', icon: '🏃' },
                              { id: 'league', name: 'Ligaspiel', icon: '🏆' },
                              { id: 'private', name: 'Privat', icon: '🔒' }
                            ].map(type => (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => setGameMode(type.id)}
                                className={`p-1.5 rounded-lg border text-[10px] text-center transition-all ${
                                  gameMode === type.id 
                                    ? 'border-green-500 bg-green-100' 
                                    : 'border-gray-200 hover:border-green-300'
                                }`}
                              >
                                <span className="block text-base">{type.icon}</span>
                                {type.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Zusatzoptionen */}
                        <div className="space-y-2 pt-2 border-t border-green-200">
                          <Label className="text-xs text-gray-600">Zusatzoptionen</Label>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" id="flutlicht" className="rounded border-green-300" />
                                <Label htmlFor="flutlicht" className="text-xs cursor-pointer">💡 Flutlicht (ab 18:00 Pflicht)</Label>
                              </div>
                              <span className="text-xs text-green-600 font-medium">+15€/h</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" id="balls" className="rounded border-green-300" />
                                <Label htmlFor="balls" className="text-xs cursor-pointer">⚽ Bälle-Set (5 Stück)</Label>
                              </div>
                              <span className="text-xs text-green-600 font-medium">inkl.</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" id="leibchen" className="rounded border-green-300" />
                                <Label htmlFor="leibchen" className="text-xs cursor-pointer">👕 Leibchen-Set (2x10 Stück)</Label>
                              </div>
                              <span className="text-xs text-green-600 font-medium">+5€</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" id="referee" className="rounded border-green-300" />
                                <Label htmlFor="referee" className="text-xs cursor-pointer">🏁 Schiedsrichter</Label>
                              </div>
                              <span className="text-xs text-green-600 font-medium">+35€</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" id="dusche" className="rounded border-green-300" />
                                <Label htmlFor="dusche" className="text-xs cursor-pointer">🚿 Umkleide & Duschen</Label>
                              </div>
                              <span className="text-xs text-green-600 font-medium">inkl.</span>
                            </div>
                          </div>
                        </div>

                        {/* Hinweis */}
                        <p className="text-[10px] text-green-700 bg-green-100 p-2 rounded">
                          Spielfeld 15 Min vor Beginn betreten. Bei Regen: Indoor-Alternative verfügbar. Stollenschuhe nur auf Naturrasen erlaubt.
                        </p>
                      </div>
                    )}

                    {/* Bouldern Booking System */}
                    {(selectedExperience?.category?.slug === 'bouldern' ||
                      selectedExperience?.category?.slug === 'klettern' ||
                      selectedExperience?.title?.toLowerCase().includes('boulder') ||
                      selectedExperience?.title?.toLowerCase().includes('kletter') ||
                      selectedExperience?.title?.toLowerCase().includes('climbing') ||
                      partner?.companyName?.toLowerCase().includes('boulder') ||
                      partner?.companyName?.toLowerCase().includes('kletter') ||
                      partner?.companyName?.toLowerCase().includes('climb')) && (
                      <BoulderingBookingSystem
                        experiences={selectedExperience ? [selectedExperience] : experiences || []}
                        partnerName={partner?.companyName || ''}
                        partnerEmail={partner?.email}
                        equipmentOptions={
                          partner?.companyName?.toLowerCase().includes('kletter') || 
                          selectedExperience?.title?.toLowerCase().includes('kletter') ||
                          selectedExperience?.category?.slug === 'klettern'
                            ? [
                                { id: "gurt", name: "Gurt", price: 2, icon: "🔗" },
                                { id: "schuhe", name: "Schuhe", price: 4, icon: "👟" },
                                { id: "sicherungsgeraet", name: "Sicherungsgerät", price: 1, icon: "🛡️" },
                                { id: "vorstiegsseil", name: "Vorstiegsseil", price: 1.5, icon: "🧵" },
                              ]
                            : undefined
                        }
                        onBooking={(bookingData) => {
                          const exp = experiences?.find((e: any) => e.id === bookingData.ticketId) || selectedExperience;
                          if (exp) {
                            // Cart items are keyed by experienceId; the cart sets quantity itself. date/time are kept on the item.
                            const cartItem = {
                              experienceId: exp.id,
                              title: exp.title,
                              price: bookingData.totalPrice,
                              partnerId: partner?.id,
                              partnerName: partner?.companyName,
                              date: bookingData.date,
                              time: bookingData.time,
                              imageUrl: exp.imageUrl || exp.image_url,
                            };
                            addToCart(cartItem);
                            toast({ title: "Buchung hinzugefügt", description: `${exp.title} für ${bookingData.participantCount} Person(en) am ${new Date(bookingData.date).toLocaleDateString('de-DE')} um ${bookingData.time} Uhr` });
                            setCheckoutOpen(false);
                          }
                        }}
                      />
                    )}

                    {/* GoKart / Kartbahn Booking System */}
                    {(partner?.category?.toLowerCase().includes('kartbahn') ||
                      partner?.category?.toLowerCase().includes('go kart') ||
                      partner?.category?.toLowerCase().includes('gokart') ||
                      partner?.companyName?.toLowerCase().includes('kart') ||
                      partner?.companyName?.toLowerCase().includes('kartbahn')) && (
                      <GoKartBookingSystem
                        experiences={experiences || []}
                        partnerName={partner?.companyName || ''}
                        partnerEmail={partner?.email}
                        onBooking={(bookingData) => {
                          const exp = experiences?.find((e: any) => e.id === bookingData.ticketId) || experiences?.[0];
                          if (exp) {
                            // Cart items are keyed by experienceId; the cart sets quantity itself. date/time are kept on the item.
                            const cartItem = {
                              experienceId: exp.id,
                              title: `GoKart Session (${bookingData.adults} Erw.${bookingData.children > 0 ? ` + ${bookingData.children} Kind` : ''})`,
                              price: bookingData.totalPrice,
                              partnerId: partner?.id,
                              partnerName: partner?.companyName,
                              date: bookingData.date,
                              time: bookingData.time,
                              imageUrl: exp.imageUrl || exp.image_url,
                            };
                            addToCart(cartItem);
                            toast({ title: "Buchung hinzugefügt", description: `GoKart für ${bookingData.participantCount} Spieler am ${new Date(bookingData.date).toLocaleDateString('de-DE')} um ${bookingData.time} Uhr` });
                            setCheckoutOpen(false);
                          }
                        }}
                      />
                    )}

                    {/* Customer Wish */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        Dein Wunsch (optional)
                      </Label>
                      <textarea
                        value={customerWish}
                        onChange={(e) => setCustomerWish(e.target.value)}
                        placeholder="Besondere Wünsche oder Anmerkungen..."
                        className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                      />
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        Zahlungsart *
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'ueberweisung', label: 'Überweisung', icon: '🏦' },
                          { id: 'paypal', label: 'PayPal', icon: '💳' },
                          { id: 'klarna', label: 'Klarna', icon: '🛒' },
                          { id: 'kreditkarte', label: 'Kreditkarte', icon: '💳' },
                        ].map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setPaymentMethod(method.id)}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                              paymentMethod === method.id 
                                ? 'border-purple-500 bg-purple-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="text-lg mr-2">{method.icon}</span>
                            <span className="text-sm font-medium">{method.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Modern Summary Card */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide">Zusammenfassung</p>
                        <p className="text-sm text-gray-300">
                          {(selectedExperience?.category?.slug === 'escape-rooms' ||
                            selectedExperience?.title?.toLowerCase().includes('escape') ||
                            selectedExperience?.title?.toLowerCase().includes('raum:') ||
                            selectedExperience?.title?.toLowerCase().includes('room') ||
                            partner?.companyName?.toLowerCase().includes('escape') ||
                            partner?.companyName?.toLowerCase().includes('locked'))
                            ? `${bookingQuantity} Personen – ${selectedExperience.title}`
                            : `${customQuantity}x ${selectedExperience.title}`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">Gesamtpreis</p>
                        <p className="text-3xl font-black">
                          {(() => {
                            const isEscapeRoom = selectedExperience?.category?.slug === 'escape-rooms' ||
                              selectedExperience?.title?.toLowerCase().includes('escape') ||
                              selectedExperience?.title?.toLowerCase().includes('raum:') ||
                              selectedExperience?.title?.toLowerCase().includes('room') ||
                              partner?.companyName?.toLowerCase().includes('escape') ||
                              partner?.companyName?.toLowerCase().includes('locked');
                            if (isEscapeRoom) {
                              const pricing: Record<number, number> = { 2: 108, 3: 108, 4: 132, 5: 150, 6: 168, 7: 175 };
                              return (pricing[bookingQuantity] || 108).toFixed(2);
                            }
                            return (selectedExperience.price * customQuantity).toFixed(2);
                          })()}€
                        </p>
                      </div>
                    </div>
                    {customDate && customTime && (
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-700 text-sm text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-purple-400" />
                          {new Date(customDate).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-cyan-400" />
                          {customTime} Uhr
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modern Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="ghost" 
                      className="flex-1 h-12 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      onClick={() => setCheckoutOpen(false)}
                    >
                      Abbrechen
                    </Button>
                    <Button 
                      className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
                      onClick={handleDirectCheckout}
                      disabled={bookingMutation.isPending || stripeLoading || !paymentMethod || !guestName || !guestEmail}
                    >
                      {bookingMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Wird gebucht...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Jetzt buchen
                          <ArrowRight className="h-5 w-5" />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : checkoutStep === 'payment' ? (
            /* Stripe Payment Step */
            <div className="py-4 space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">Bezahlung</h3>
                <p className="text-sm text-gray-500">
                  {selectedExperience?.title} – {stripeAmount.toFixed(2)}€
                </p>
              </div>
              {stripeClientSecret && (
                <StripePaymentStep
                  clientSecret={stripeClientSecret}
                  amount={stripeAmount}
                  onSuccess={handleStripePaymentSuccess}
                  onCancel={() => setCheckoutStep('form')}
                />
              )}
            </div>
          ) : (
            /* Success State with QR Code */
            <div className="py-6 space-y-5">
              {/* Success Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-700">Buchung erfolgreich!</h3>
              </div>

              {/* Booking Details Card */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    <span className="font-bold text-gray-900">{partner?.companyName}</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {(selectedExperience?.price * customQuantity).toFixed(2)}€
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {customDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(customDate).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {customQuantity} {customQuantity === 1 ? 'Person' : 'Personen'}
                  </div>
                </div>

                {/* QR Code */}
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="inline-block p-3 bg-white border-2 border-gray-200 rounded-lg">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(bookingCode)}`}
                      alt="Ticket QR Code"
                      className="w-32 h-32 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Zeige diesen Code vor Ort vor<br/>und gehe direkt rein!
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-mono">{bookingCode}</p>
                </div>

                {/* Status Badges */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Bezahlstatus: {paymentMethod === 'ueberweisung' ? 'Ausstehend' : 'Bezahlt'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Code statt Kasse</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Direkt rein – kein Anstehen</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Dein Ticket wurde an <strong>{guestEmail}</strong> gesendet.
              </p>

              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-500"
                onClick={() => {
                  setCheckoutOpen(false);
                  setCheckoutStep('form');
                  setPaymentMethod('');
                }}
              >
                Fertig
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="mt-8 mx-auto max-w-4xl px-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5">
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-600">Hinweis:</span> Es gelten die AGB, Widerrufsrechte und Stornobedingungen des jeweiligen Partners ({partner?.companyName || 'Anbieter'}). FreizeitEngel fungiert ausschließlich als Vermittlungsplattform und übernimmt keine Haftung für die Leistungen, Verfügbarkeit oder Bedingungen des Partners. Bitte informieren Sie sich vor der Buchung über die geltenden Geschäftsbedingungen des Anbieters.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button variant="outline" size="sm" className="text-xs h-8 text-gray-600 border-gray-300 hover:bg-gray-100">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              AGB des Partners
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8 text-gray-600 border-gray-300 hover:bg-gray-100">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Datenschutz des Partners
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8 text-gray-600 border-gray-300 hover:bg-gray-100">
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Widerrufsformular
            </Button>
          </div>
        </div>
      </div>

      {/* Cross-Selling: Andere Aktivitäten in der Stadt */}
      {partner && <CityRecommendations currentPartnerId={Number(id)} city={partner.city} />}

    </div>
  );
}

function PartnerReviews({ partnerId, partnerName }: { partnerId: number; partnerName: string }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [showAll, setShowAll] = useState(false);

  const { data: reviews = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/partners', partnerId, 'reviews'],
    queryFn: () => fetch(`/api/partners/${partnerId}/reviews`).then(r => r.json()),
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/reviews', data);
    },
    onSuccess: () => {
      toast({ title: "Bewertung gesendet!", description: "Vielen Dank für dein Feedback." });
      setShowForm(false);
      setReviewRating(0);
      setReviewTitle('');
      setReviewContent('');
      setReviewName('');
      setReviewEmail('');
      queryClient.invalidateQueries({ queryKey: ['/api/partners', partnerId, 'reviews'] });
    },
    onError: () => {
      toast({ title: "Fehler", description: "Bewertung konnte nicht gesendet werden.", variant: "destructive" });
    }
  });

  const handleSubmit = () => {
    if (!reviewRating || !reviewTitle.trim() || !reviewContent.trim() || !reviewName.trim() || !reviewEmail.trim()) {
      toast({ title: "Bitte alle Felder ausfüllen", description: "Bewertung, Name, E-Mail, Titel und Text sind erforderlich.", variant: "destructive" });
      return;
    }
    submitMutation.mutate({
      rating: reviewRating,
      title: reviewTitle,
      content: reviewContent,
      partnerId,
      guestName: reviewName,
      guestEmail: reviewEmail,
    });
  };

  const googleReviews = [
    { id: 'g1', guestName: 'Anna M.', rating: 5, title: 'Absolut empfehlenswert!', content: 'Wir waren mit der ganzen Familie da und hatten einen wunderbaren Tag. Die Mitarbeiter waren super freundlich und alles war bestens organisiert. Kommen definitiv wieder!', createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), isGoogle: true, avatar: 'AM' },
    { id: 'g2', guestName: 'Thomas K.', rating: 4, title: 'Toller Ausflug', content: 'Super Erlebnis, faire Preise und eine schöne Atmosphäre. Einzig die Parkplatzsituation könnte besser sein. Ansonsten top!', createdAt: new Date(Date.now() - 12 * 86400000).toISOString(), isGoogle: true, avatar: 'TK' },
    { id: 'g3', guestName: 'Sarah L.', rating: 5, title: 'Perfekt für Kinder!', content: 'Unsere Kinder hatten richtig Spaß! Alles war sauber, die Preise fair und das Personal total nett. Haben gleich nächste Woche wieder gebucht.', createdAt: new Date(Date.now() - 18 * 86400000).toISOString(), isGoogle: true, avatar: 'SL' },
    { id: 'g4', guestName: 'Michael B.', rating: 5, title: 'Immer wieder gerne', content: 'Schon mehrmals hier gewesen und jedes Mal begeistert. Die Qualität stimmt einfach und man merkt, dass hier mit Liebe gearbeitet wird.', createdAt: new Date(Date.now() - 25 * 86400000).toISOString(), isGoogle: true, avatar: 'MB' },
    { id: 'g5', guestName: 'Julia W.', rating: 4, title: 'Schöner Familienausflug', content: 'Wir hatten einen tollen Nachmittag. Die Online-Buchung hat super funktioniert und wir konnten ohne Wartezeit rein. Gerne wieder!', createdAt: new Date(Date.now() - 32 * 86400000).toISOString(), isGoogle: true, avatar: 'JW' },
    { id: 'g6', guestName: 'Patrick S.', rating: 5, title: 'Top Preis-Leistung', content: 'Sehr gutes Angebot zu fairen Preisen. Die Buchung über FreizeitEngel war einfach und schnell. Kann ich nur empfehlen!', createdAt: new Date(Date.now() - 40 * 86400000).toISOString(), isGoogle: true, avatar: 'PS' },
  ];

  const allReviews = [...reviews.map((r: any) => ({ ...r, isGoogle: false })), ...googleReviews];
  const avgRating = allReviews.length > 0 ? (allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length) : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: allReviews.filter((r: any) => r.rating === star).length,
    pct: allReviews.length > 0 ? (allReviews.filter((r: any) => r.rating === star).length / allReviews.length) * 100 : 0,
  }));

  const displayedReviews = showAll ? allReviews : allReviews.slice(0, 6);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Heute';
    if (days === 1) return 'Gestern';
    if (days < 7) return `Vor ${days} Tagen`;
    if (days < 30) return `Vor ${Math.floor(days / 7)} Wochen`;
    if (days < 365) return `Vor ${Math.floor(days / 30)} Monaten`;
    return `Vor ${Math.floor(days / 365)} Jahren`;
  };

  return (
    <div id="reviews-section" className="max-w-7xl mx-auto px-4 md:px-12 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <h2 className="text-xl md:text-2xl font-black text-gray-900">Google Bewertungen</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-gray-900">{avgRating.toFixed(1)}</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <span className="text-gray-400 text-sm">({allReviews.length} Bewertungen)</span>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="outline"
          className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-full"
        >
          <Plus className="h-4 w-4 mr-1" />
          Bewertung schreiben
        </Button>
      </div>

        {/* Review Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 mb-8 border border-purple-200 animate-in fade-in slide-in-from-top-2 duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              Deine Bewertung für {partnerName}
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-gray-600 text-sm mb-2 block">Bewertung</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setReviewRating(s)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star className={`h-8 w-8 transition-colors ${s <= (hoverRating || reviewRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-gray-400'}`} />
                    </button>
                  ))}
                  {reviewRating > 0 && (
                    <span className="text-sm text-gray-500 ml-2 self-center">
                      {['', 'Schlecht', 'Geht so', 'Gut', 'Sehr gut', 'Ausgezeichnet'][reviewRating]}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600 text-sm mb-1 block">Dein Name</Label>
                  <Input
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Max Mustermann"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label className="text-gray-600 text-sm mb-1 block">E-Mail</Label>
                  <Input
                    type="email"
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    placeholder="max@beispiel.de"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-600 text-sm mb-1 block">Titel</Label>
                <Input
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="z.B. Tolles Erlebnis für die ganze Familie!"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label className="text-gray-600 text-sm mb-1 block">Deine Erfahrung</Label>
                <Textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Erzähle anderen von deinem Erlebnis..."
                  rows={4}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-semibold"
                >
                  {submitMutation.isPending ? (
                    <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Wird gesendet...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Send className="h-4 w-4" /> Bewertung absenden</span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-900"
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-5 animate-pulse border border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedReviews.map((review: any) => {
                const avatarColors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500'];
                const colorIdx = typeof review.id === 'string' ? review.id.charCodeAt(1) % avatarColors.length : (review.id || 0) % avatarColors.length;
                const initials = review.avatar || (review.guestName || review.user?.fullName || 'A').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

                return (
                  <div key={review.id} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full ${avatarColors[colorIdx]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-900 text-sm truncate">
                            {review.guestName || review.user?.fullName || 'Anonym'}
                          </span>
                          {review.isGoogle && (
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400">{timeAgo(review.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
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
                <Button
                  variant="outline"
                  onClick={() => setShowAll(true)}
                  className="text-gray-700 border-gray-200 hover:bg-gray-50 font-semibold rounded-full"
                >
                  Alle {allReviews.length} Bewertungen anzeigen
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
    </div>
  );
}

function CityRecommendations({ currentPartnerId, city }: { currentPartnerId: number; city: string }) {
  const [, setLocation] = useLocation();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  const { data: allPartners = [] } = useQuery<any[]>({
    queryKey: ['/api/partners'],
  });

  const { data: allExperiences = [] } = useQuery<any[]>({
    queryKey: ['/api/experiences'],
  });

  const selectedPartner = selectedCity ? allPartners.find((p: any) => p.city === selectedCity && p.latitude && p.longitude) : null;

  const { data: nearbyPartners } = useQuery<any[]>({
    queryKey: ['/api/partners/nearby', selectedPartner?.latitude, selectedPartner?.longitude, currentPartnerId],
    queryFn: () => fetch(`/api/partners/nearby?lat=${selectedPartner!.latitude}&lng=${selectedPartner!.longitude}&radius=50&exclude=${currentPartnerId}`).then(r => r.json()),
    enabled: !!selectedPartner,
  });

  const availableCities = Array.from(new Set(allPartners.filter((p: any) => p.approved && p.latitude && p.longitude).map((p: any) => p.city as string))).filter(Boolean).sort();
  const filteredCities = citySearch ? availableCities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())) : availableCities;

  const useNearby = !!selectedCity && nearbyPartners && nearbyPartners.length > 0;
  const displayPartners = useNearby
    ? nearbyPartners!.slice(0, 6)
    : allPartners.filter((p: any) => p.city === city && p.id !== currentPartnerId).slice(0, 6);

  if (displayPartners.length === 0 && !showCityPicker) return null;

  const getMinPrice = (partnerId: number) => {
    const partnerExps = allExperiences.filter((e: any) => e.partnerId === partnerId && e.price > 0);
    if (partnerExps.length === 0) return null;
    return Math.min(...partnerExps.map((e: any) => Number(e.price)));
  };

  const getCategoryImage = (category: string) => {
    const cat = (category || '').toLowerCase();
    const mapping: [string, string][] = [
      ['schwimm', '/images/categories/schwimmbad.jpg'],
      ['freibad', '/images/categories/schwimmbad.jpg'],
      ['hallenbad', '/images/categories/schwimmbad.jpg'],
      ['erlebnisbad', '/images/categories/schwimmbad.jpg'],
      ['spaßbad', '/images/categories/schwimmbad.jpg'],
      ['therme', '/images/categories/therme.jpg'],
      ['wellness', '/images/categories/therme.jpg'],
      ['spa', '/images/categories/therme.jpg'],
      ['kino', '/images/categories/kino.jpg'],
      ['film', '/images/categories/kino.jpg'],
      ['zoo', '/images/categories/zoo.jpg'],
      ['tierpark', '/images/categories/zoo.jpg'],
      ['kinderbauernhof', '/images/categories/zoo.jpg'],
      ['bowling', '/images/categories/bowling.jpg'],
      ['kegel', '/images/categories/bowling.jpg'],
      ['minigolf', '/images/categories/minigolf.jpg'],
      ['swingolf', '/images/categories/minigolf.jpg'],
      ['golf', '/images/categories/minigolf.jpg'],
      ['escape', '/images/categories/escaperoom.jpg'],
      ['kletter', '/images/categories/klettern.jpg'],
      ['trampolin', '/images/categories/trampolin.jpg'],
      ['kart', '/images/categories/kartfahren.jpg'],
      ['lasertag', '/images/categories/lasertag.jpg'],
      ['paintball', '/images/categories/paintball.jpg'],
      ['freizeitpark', '/images/categories/freizeitpark.jpg'],
      ['indoor', '/images/categories/indoorspielplatz.jpg'],
      ['kinderpark', '/images/categories/indoorspielplatz.jpg'],
      ['museum', '/images/categories/museum.jpg'],
      ['kultur', '/images/categories/museum.jpg'],
      ['eislauf', '/images/categories/eislaufen.jpg'],
      ['eissport', '/images/categories/eislaufen.jpg'],
      ['ski', '/images/categories/eislaufen.jpg'],
      ['tennis', '/images/categories/tennis.jpg'],
      ['padel', '/images/categories/tennis.jpg'],
      ['badminton', '/images/categories/tennis.jpg'],
      ['reit', '/images/categories/reiten.jpg'],
      ['theater', '/images/categories/theater.jpg'],
    ];
    for (const [key, img] of mapping) {
      if (cat.includes(key)) return img;
    }
    return '/images/categories/default.jpg';
  };

  return (
    <>
    <div className="relative max-w-6xl mx-auto px-4 py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent rounded-3xl pointer-events-none" />

      <div className="relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-4">
            {useNearby ? <Navigation className="h-4 w-4 text-orange-400" /> : <Sparkles className="h-4 w-4 text-orange-400" />}
            <span className="text-orange-500 text-sm font-medium">
              {useNearby ? 'In deiner Nähe' : 'Empfehlungen für dich'}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {useNearby ? (
              <>Aktivitäten in deiner <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">Umgebung</span></>
            ) : (
              <>Beliebte Aktivitäten in <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">{city}</span></>
            )}
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            {useNearby
              ? 'Diese Erlebnisse befinden sich im Umkreis von 50 km um deinen Standort'
              : 'Andere Nutzer interessieren sich auch für diese Erlebnisse – entdecke was ' + city + ' noch zu bieten hat'
            }
          </p>
          {!selectedCity && (
            <Button
              variant="outline"
              className="mt-4 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-500"
              onClick={() => setShowCityPicker(!showCityPicker)}
            >
              <Navigation className="h-4 w-4 mr-2" /> Aktivitäten in meiner Nähe anzeigen
            </Button>
          )}
          {selectedCity && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-500">Standort:</span>
              <span className="text-sm font-medium text-purple-600">{selectedCity}</span>
              <button
                className="text-xs text-gray-500 hover:text-gray-700 underline"
                onClick={() => { setSelectedCity(null); setShowCityPicker(false); setCitySearch(''); }}
              >
                ändern
              </button>
            </div>
          )}
          {showCityPicker && !selectedCity && (
            <div className="mt-4 max-w-sm mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Stadt eingeben..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                  autoFocus
                />
              </div>
              <div className="mt-2 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-lg">
                {filteredCities.slice(0, 15).map(c => (
                  <button
                    key={c}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-gray-900 transition-colors flex items-center gap-2"
                    onClick={() => { setSelectedCity(c); setShowCityPicker(false); setCitySearch(''); }}
                  >
                    <MapPin className="h-3 w-3 text-purple-400 flex-shrink-0" />
                    {c}
                  </button>
                ))}
                {filteredCities.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500">Keine Stadt gefunden</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPartners.map((p: any) => {
            const minPrice = getMinPrice(p.id);
            const categoryImage = getCategoryImage(p.category || '');
            return (
              <div
                key={p.id}
                className="group relative cursor-pointer rounded-2xl overflow-hidden"
                onClick={() => setLocation(`/partners/${p.id}`)}
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={categoryImage}
                    alt={p.category || 'Aktivität'}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  <div className="absolute top-3 left-3">
                    <div className="bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
                      <span className="text-white text-xs font-semibold">{p.category || 'Erlebnis'}</span>
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
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center border-2 border-white/20 shadow-lg overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: p.logoBgColor || '#1f2937' }}
                      >
                        {p.logoUrl && p.logoUrl !== '/attached_assets/placeholder_logo.png' ? (
                          <img src={p.logoUrl} alt={p.companyName} className="w-8 h-8 object-contain" />
                        ) : (
                          <Ticket className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-lg leading-tight truncate group-hover:text-purple-200 transition-colors">
                          {p.companyName}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-300 text-sm mt-0.5">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{p.city || city}</span>
                          {useNearby && p.distance != null && (
                            <span className="text-orange-500 text-xs ml-1">· {p.distance < 1 ? '< 1' : p.distance} km</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-300/80 text-sm line-clamp-2 leading-relaxed mb-3">
                      {p.description || `Erlebe ${p.companyName} in ${city}`}
                    </p>

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

        <div className="text-center mt-10">
          <Button
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-300"
            onClick={() => setLocation(`/?city=${encodeURIComponent(city)}`)}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Alle Aktivitäten in {city} entdecken
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>

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
              { q: 'Wie funktioniert die Buchung?', a: 'Wähle einfach dein gewünschtes Ticket aus, gib deine Daten ein und schließe die Buchung ab. Du erhältst sofort eine Bestätigung per E-Mail mit deinem QR-Code Ticket.' },
              { q: 'Kann ich meine Buchung stornieren?', a: 'Ja, du kannst deine Buchung bis zu 24 Stunden vor dem gebuchten Termin kostenlos stornieren. Kontaktiere dazu einfach unseren Kundenservice oder nutze den Stornierungslink in deiner Bestätigungs-E-Mail.' },
              { q: 'Wie erhalte ich mein Ticket?', a: 'Nach erfolgreicher Buchung erhältst du dein Ticket als QR-Code per E-Mail. Zeige den QR-Code einfach vor Ort vor – kein Ausdrucken nötig!' },
              { q: 'Gibt es Gruppenrabatte?', a: 'Ja! Viele unserer Partner bieten spezielle Gruppenrabatte an. Schau dir die verfügbaren Tickets an – Familienund Gruppentickets sind oft günstiger als Einzeltickets.' },
              { q: 'Welche Zahlungsmethoden werden akzeptiert?', a: 'Wir akzeptieren alle gängigen Zahlungsmethoden: Kreditkarte, PayPal, Klarna, Apple Pay und Google Pay. Alle Zahlungen sind SSL-verschlüsselt und sicher.' },
              { q: 'Was passiert bei schlechtem Wetter?', a: 'Bei wetterabhängigen Aktivitäten kannst du deine Buchung kostenlos auf einen anderen Termin umbuchen. Indoor-Aktivitäten finden natürlich bei jedem Wetter statt.' },
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
    <div
      className={`bg-white rounded-2xl border transition-all duration-300 ${open ? 'border-blue-200 shadow-lg shadow-blue-500/5' : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'}`}
    >
      <button
        className="w-full flex items-center justify-between px-6 py-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-gray-900 pr-4">{question}</span>
        <ChevronRight className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-90' : ''}`} />
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
  const [email, setEmail] = useState('');
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
      <Button
        type="submit"
        className="bg-white text-indigo-600 hover:bg-gray-100 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Send className="h-4 w-4 mr-2" />
        Anmelden
      </Button>
    </form>
  );
}
