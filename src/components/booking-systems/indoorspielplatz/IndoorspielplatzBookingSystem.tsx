import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Clock, Users, Minus, Plus, Baby, User, UsersIcon, GraduationCap, Accessibility, Ticket, Info, ArrowLeft, ArrowRight, CheckCircle2, Mail, Phone, UserCircle, Loader2, CreditCard, MessageSquare } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { QRCode } from "@/components/ui/qr-code";

interface TicketExperience {
  id: number;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  duration: string | null;
  maxParticipants: string | number | null;
}

interface IndoorspielplatzBookingSystemProps {
  experience: any;
  partnerName: string;
  tickets: TicketExperience[];
  onBooking: (bookingData: any) => void;
}

function getTicketIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('baby') || t.includes('bis 1 jahr')) return <Baby className="h-5 w-5" />;
  if (t.includes('kleinkind') || t.includes('1-2')) return <Baby className="h-5 w-5" />;
  if (t.includes('kinder') || t.includes('jugend')) return <User className="h-5 w-5" />;
  if (t.includes('erwachsene')) return <User className="h-5 w-5" />;
  if (t.includes('familie')) return <UsersIcon className="h-5 w-5" />;
  if (t.includes('kindergarten') || t.includes('schule')) return <GraduationCap className="h-5 w-5" />;
  if (t.includes('rollstuhl')) return <Accessibility className="h-5 w-5" />;
  if (t.includes('10er')) return <Ticket className="h-5 w-5" />;
  return <Ticket className="h-5 w-5" />;
}

function getTicketColor(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('baby') || t.includes('bis 1 jahr')) return "bg-pink-50 border-pink-200 text-pink-700";
  if (t.includes('kleinkind') || t.includes('1-2')) return "bg-pink-50 border-pink-200 text-pink-700";
  if (t.includes('kinder') || t.includes('jugend')) return "bg-blue-50 border-blue-200 text-blue-700";
  if (t.includes('erwachsene')) return "bg-slate-50 border-slate-200 text-slate-700";
  if (t.includes('familie')) return "bg-purple-50 border-purple-200 text-purple-700";
  if (t.includes('kindergarten') || t.includes('schule')) return "bg-amber-50 border-amber-200 text-amber-700";
  if (t.includes('rollstuhl')) return "bg-green-50 border-green-200 text-green-700";
  if (t.includes('10er')) return "bg-orange-50 border-orange-200 text-orange-700";
  return "bg-gray-50 border-gray-200 text-gray-700";
}

function getTicketBadge(title: string): string | null {
  const t = title.toLowerCase();
  if (t.includes('10er')) return "Sparpaket";
  if (t.includes('familie')) return "Familienangebot";
  if (t.includes('rollstuhl')) return "Kostenlos";
  if (t.includes('baby') || t.includes('bis 1 jahr')) return "Kostenlos";
  return null;
}

type BookingStep = "tickets" | "contact" | "confirmation";

export default function IndoorspielplatzBookingSystem({ experience, partnerName, tickets, onBooking }: IndoorspielplatzBookingSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<BookingStep>("tickets");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [contactName, setContactName] = useState(user?.fullName || "");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("vor_ort");

  const [bookingResult, setBookingResult] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const updateQuantity = (ticketId: number, delta: number) => {
    setQuantities(prev => {
      const current = prev[ticketId] || 0;
      const next = Math.max(0, Math.min(20, current + delta));
      if (next === 0) {
        const { [ticketId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [ticketId]: next };
    });
  };

  const selectedTickets = useMemo(() => {
    return Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const ticket = tickets.find(t => t.id === Number(id));
        return ticket ? { ...ticket, quantity: qty } : null;
      })
      .filter(Boolean) as (TicketExperience & { quantity: number })[];
  }, [quantities, tickets]);

  const totalPrice = selectedTickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
  const totalPersons = selectedTickets.reduce((sum, t) => sum + (Number(t.maxParticipants) || 1) * t.quantity, 0);

  const bookingMutation = useMutation({
    mutationFn: async () => {
      const ticketSummary = selectedTickets.map(t => `${t.quantity}x ${t.title}`).join(', ');
      const bookingData = {
        experienceId: experience.id,
        contactName,
        contactEmail,
        contactPhone,
        date: selectedDate.toISOString(),
        message: contactMessage,
        paymentMethod,
        offerTitle: `${partnerName} - ${ticketSummary}`,
        bookingDetails: {
          tickets: selectedTickets.map(t => ({
            id: t.id,
            title: t.title,
            quantity: t.quantity,
            pricePerUnit: t.price,
          })),
          totalPersons,
          parameters: {},
        },
        totalPrice,
        participants: totalPersons,
      };
      const res = await apiRequest("POST", "/api/bookings", bookingData);
      return await res.json();
    },
    onSuccess: (data) => {
      setBookingResult(data);
      setStep("confirmation");
      toast({
        title: "Buchung erfolgreich!",
        description: `Bestätigung wurde an ${contactEmail} gesendet.`,
      });
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Buchung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validateContact = (): boolean => {
    const errors: Record<string, string> = {};
    if (!contactName || contactName.trim().length < 3) {
      errors.name = "Bitte geben Sie Ihren vollständigen Namen ein (min. 3 Zeichen)";
    }
    if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      errors.email = "Bitte geben Sie eine gültige E-Mail-Adresse ein";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitBooking = () => {
    if (!validateContact()) return;
    bookingMutation.mutate();
  };

  const regularTickets = tickets.filter(t => {
    const tl = t.title.toLowerCase();
    return !tl.includes('10er') && !tl.includes('kindergarten') && !tl.includes('schule') && !tl.includes('rollstuhl');
  });

  const specialTickets = tickets.filter(t => {
    const tl = t.title.toLowerCase();
    return tl.includes('10er') || tl.includes('kindergarten') || tl.includes('schule') || tl.includes('rollstuhl');
  });

  const renderTicketRow = (ticket: TicketExperience) => {
    const qty = quantities[ticket.id] || 0;
    const badge = getTicketBadge(ticket.title);
    const colorClass = getTicketColor(ticket.title);

    return (
      <div
        key={ticket.id}
        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
          qty > 0 ? `${colorClass} shadow-sm` : "bg-white border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            qty > 0 ? "bg-white/60" : "bg-gray-100"
          }`}>
            {getTicketIcon(ticket.title)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-800">{ticket.title}</p>
              {badge && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">{ticket.shortDescription}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <span className="text-sm font-bold text-gray-800 w-16 text-right">
            {ticket.price === 0 ? "Gratis" : `${Number(ticket.price).toFixed(2)}€`}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => updateQuantity(ticket.id, -1)}
              disabled={qty === 0}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-semibold">{qty}</span>
            <button
              onClick={() => updateQuantity(ticket.id, 1)}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PAYMENT_OPTIONS = [
    { value: "vor_ort", label: "Vor Ort bezahlen", icon: <CreditCard className="h-4 w-4" />, desc: "Bezahlung direkt beim Partner" },
    { value: "paypal", label: "PayPal", icon: <CreditCard className="h-4 w-4" />, desc: "Sichere Online-Zahlung" },
  ];

  if (step === "confirmation" && bookingResult) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Buchung erfolgreich!</h2>
            <p className="text-green-100">
              Bestätigung wurde an {contactEmail} gesendet
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Buchungsdetails</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Buchungsnr.</span>
                    <span className="font-semibold">#{bookingResult.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Partner</span>
                    <span className="font-medium">{partnerName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Datum</span>
                    <span className="font-medium">{format(selectedDate, "dd. MMMM yyyy", { locale: de })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Personen</span>
                    <span className="font-medium">{totalPersons}</span>
                  </div>
                  <div className="border-t pt-2 space-y-1.5">
                    {selectedTickets.map(t => (
                      <div key={t.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{t.quantity}x {t.title}</span>
                        <span className="font-medium">{t.price === 0 ? "Gratis" : `${(t.price * t.quantity).toFixed(2)}€`}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold">Gesamtpreis</span>
                    <span className="text-lg font-bold text-green-600">{totalPrice.toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Kontaktdaten</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-gray-400" />
                    <span>{contactName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{contactEmail}</span>
                  </div>
                  {contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{contactPhone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500 mb-3">QR-Code beim Einlass vorzeigen</p>
                  <QRCode
                    value={bookingResult.qrCode || `booking-${bookingResult.id}`}
                    size={160}
                    className="mx-auto"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Ticket-ID: {bookingResult.qrCode || `booking-${bookingResult.id}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => window.location.href = `/experience/${experience.id}`}>
              Zurück zum Erlebnis
            </Button>
            <Button onClick={() => window.location.href = "/"} className="bg-green-600 hover:bg-green-700">
              Zur Startseite
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "contact") {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🎪</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{partnerName}</h2>
                <p className="text-orange-100 text-sm">Schritt 2 von 2 – Kontaktdaten & Bezahlung</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-orange-500" />
                    Ihre Kontaktdaten
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vollständiger Name *
                      </label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          value={contactName}
                          onChange={(e) => { setContactName(e.target.value); setFormErrors(prev => ({ ...prev, name: "" })); }}
                          placeholder="Max Mustermann"
                          className={`pl-10 ${formErrors.name ? "border-red-400" : ""}`}
                        />
                      </div>
                      {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        E-Mail-Adresse *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => { setContactEmail(e.target.value); setFormErrors(prev => ({ ...prev, email: "" })); }}
                          placeholder="max@beispiel.de"
                          className={`pl-10 ${formErrors.email ? "border-red-400" : ""}`}
                        />
                      </div>
                      {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                      <p className="text-xs text-gray-400 mt-1">Buchungsbestätigung wird an diese Adresse gesendet</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefonnummer <span className="text-gray-400">(optional)</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+49 123 456789"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nachricht an den Partner <span className="text-gray-400">(optional)</span>
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="z.B. Kindergeburtstag für 8 Kinder, besondere Wünsche..."
                          className="pl-10 min-h-[80px]"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-orange-500" />
                    Bezahlmethode
                  </h3>
                  <div className="space-y-2">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPaymentMethod(opt.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          paymentMethod === opt.value
                            ? "border-orange-400 bg-orange-50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          paymentMethod === opt.value ? "border-orange-500" : "border-gray-300"
                        }`}>
                          {paymentMethod === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                          <p className="text-xs text-gray-500">{opt.desc}</p>
                        </div>
                        {opt.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:sticky lg:top-4 self-start">
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Buchungsübersicht</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span>{format(selectedDate, "dd. MMMM yyyy", { locale: de })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-3.5 w-3.5" />
                      <span>{totalPersons} {totalPersons === 1 ? "Person" : "Personen"}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
                    {selectedTickets.map(t => (
                      <div key={t.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{t.quantity}x {t.title}</span>
                        <span className="font-medium">{t.price === 0 ? "Gratis" : `${(t.price * t.quantity).toFixed(2)}€`}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-semibold text-gray-800">Gesamt</span>
                    <span className="text-xl font-bold text-orange-600">{totalPrice.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setStep("tickets")} className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zu Tickets
            </Button>
            <Button
              onClick={handleSubmitBooking}
              disabled={bookingMutation.isPending}
              size="lg"
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 shadow-md"
            >
              {bookingMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird gebucht...
                </>
              ) : (
                <>
                  Jetzt verbindlich buchen
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">🎪</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{partnerName}</h2>
              <div className="flex items-center gap-2 text-orange-100 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                <span>{experience?.location || experience?.city || "Burscheid"}</span>
              </div>
            </div>
          </div>
          <p className="text-orange-100 text-sm mt-1">Schritt 1 von 2 – Tickets & Datum auswählen</p>
        </div>

        <div className="p-4 sm:p-5 border-b border-gray-100 bg-orange-50/30">
          <div className="flex flex-wrap items-center gap-3">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-white border-gray-200">
                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                  {format(selectedDate, "dd. MMMM yyyy", { locale: de })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }
                  }}
                  disabled={(date) => isBefore(date, startOfDay(new Date()))}
                  locale={de}
                />
              </PopoverContent>
            </Popover>

            <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 px-3 py-1.5">
              🎪 Indoorspielplatz
            </Badge>

            <Badge variant="outline" className="bg-white text-gray-600 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 mr-1" /> Ganzer Tag
            </Badge>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-700">Eintrittstickets</h3>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Info className="h-3 w-3" />
              <span>Zur Altersprüfung ist ein Nachweis erforderlich</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-4">Die Kegelbahn ist nicht im Preis enthalten.</p>

          <div className="space-y-2.5">
            {regularTickets.map(renderTicketRow)}
          </div>

          {specialTickets.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-gray-700 mt-6 mb-3">Sonderangebote & Gruppen</h3>
              <div className="space-y-2.5">
                {specialTickets.map(renderTicketRow)}
              </div>
            </>
          )}
        </div>

        {selectedTickets.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50/30">
            <div className="mb-3 space-y-1.5">
              {selectedTickets.map((t) => (
                <div key={t.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{t.quantity}x {t.title}</span>
                  <span className="font-medium text-gray-800">
                    {t.price === 0 ? "Gratis" : `${(t.price * t.quantity).toFixed(2)}€`}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500">
                  {format(selectedDate, "EEEE, dd. MMMM yyyy", { locale: de })}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-gray-600 text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {totalPersons} {totalPersons === 1 ? "Person" : "Personen"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Gesamtpreis</p>
                  <p className="text-2xl font-bold text-orange-600">{totalPrice.toFixed(2)}€</p>
                </div>
                <Button
                  onClick={() => setStep("contact")}
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 shadow-md"
                >
                  Weiter
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
