import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, MapPin, Clock, Users, Minus, Plus, Flag, Sun, Sunset, GraduationCap, User, Ticket, Info, ArrowLeft, ArrowRight, CheckCircle2, Mail, Phone, UserCircle, Loader2, CreditCard, MessageSquare, AlertTriangle } from "lucide-react";
import { format, isBefore, startOfDay, isWeekend, getDay } from "date-fns";
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

interface GolfBookingSystemProps {
  experience: any;
  partnerName: string;
  tickets: TicketExperience[];
  onBooking: (bookingData: any) => void;
}

function getTicketIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('18') && t.includes('werktag')) return <Flag className="h-5 w-5" />;
  if (t.includes('9') && t.includes('werktag')) return <Flag className="h-5 w-5" />;
  if (t.includes('18') && (t.includes('sa') || t.includes('so') || t.includes('feiertag'))) return <Sunset className="h-5 w-5" />;
  if (t.includes('9') && (t.includes('sa') || t.includes('so') || t.includes('feiertag'))) return <Sunset className="h-5 w-5" />;
  if (t.includes('student')) return <GraduationCap className="h-5 w-5" />;
  if (t.includes('schüler')) return <GraduationCap className="h-5 w-5" />;
  return <Flag className="h-5 w-5" />;
}

function getTicketColor(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('18') && t.includes('werktag')) return "bg-green-50 border-green-200 text-green-700";
  if (t.includes('9') && t.includes('werktag')) return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (t.includes('18') && (t.includes('sa') || t.includes('so') || t.includes('feiertag'))) return "bg-amber-50 border-amber-200 text-amber-700";
  if (t.includes('9') && (t.includes('sa') || t.includes('so') || t.includes('feiertag'))) return "bg-orange-50 border-orange-200 text-orange-700";
  if (t.includes('student')) return "bg-blue-50 border-blue-200 text-blue-700";
  if (t.includes('schüler')) return "bg-indigo-50 border-indigo-200 text-indigo-700";
  return "bg-gray-50 border-gray-200 text-gray-700";
}

function getTicketBadge(title: string): string | null {
  const t = title.toLowerCase();
  if (t.includes('student')) return "Ermäßigt";
  if (t.includes('schüler')) return "Ermäßigt";
  if (t.includes('18') && (t.includes('sa') || t.includes('so'))) return "Wochenende";
  if (t.includes('9') && (t.includes('sa') || t.includes('so'))) return "Wochenende";
  return null;
}

function isWeekendTicket(title: string): boolean {
  const t = title.toLowerCase();
  return t.includes('sa') || t.includes('so') || t.includes('feiertag');
}

function isWeekdayTicket(title: string): boolean {
  const t = title.toLowerCase();
  return t.includes('werktag');
}

type BookingStep = "tickets" | "tee_time" | "contact" | "confirmation";

export default function GolfBookingSystem({ experience, partnerName, tickets, onBooking }: GolfBookingSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<BookingStep>("tickets");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTeeTime, setSelectedTeeTime] = useState<string>("");
  const [drivingRange, setDrivingRange] = useState<boolean>(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [handicapConfirmed, setHandicapConfirmed] = useState(false);
  const [memberCompanion, setMemberCompanion] = useState("");

  const [contactName, setContactName] = useState(user?.fullName || "");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("vor_ort");

  const [bookingResult, setBookingResult] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const isSelectedWeekend = isWeekend(selectedDate);
  const selectedDayName = format(selectedDate, "EEEE", { locale: de });

  const updateQuantity = (ticketId: number, delta: number) => {
    setQuantities(prev => {
      const current = prev[ticketId] || 0;
      const next = Math.max(0, Math.min(4, current + delta));
      if (next === 0) {
        const { [ticketId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [ticketId]: next };
    });
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const title = t.title.toLowerCase();
      const hasStudent = title.includes('student');
      const hasSchueler = title.includes('schüler');
      if (hasStudent || hasSchueler) return true;
      if (isSelectedWeekend) {
        return isWeekendTicket(t.title);
      } else {
        return isWeekdayTicket(t.title);
      }
    });
  }, [tickets, isSelectedWeekend]);

  const selectedTickets = useMemo(() => {
    return Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const ticket = tickets.find(t => t.id === Number(id));
        return ticket ? { ...ticket, quantity: qty } : null;
      })
      .filter(Boolean) as (TicketExperience & { quantity: number })[];
  }, [quantities, tickets]);

  const drivingRangePrice = drivingRange ? 6.00 * selectedTickets.reduce((sum, t) => sum + t.quantity, 0) : 0;
  const ticketPrice = selectedTickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
  const totalPrice = ticketPrice + drivingRangePrice;
  const totalPersons = selectedTickets.reduce((sum, t) => sum + t.quantity, 0);

  const needsMemberCompanion = selectedTickets.some(t => {
    const title = t.title.toLowerCase();
    return (title.includes('sa') || title.includes('so') || title.includes('feiertag')) && !title.includes('werktag');
  });

  const generateTeeTimes = (): string[] => {
    const times: string[] = [];
    const day = getDay(selectedDate);
    let start: number, end: number;

    if (day === 0) { start = 9; end = 14; }
    else if (day === 6) { start = 9; end = 14; }
    else if (day === 1) { start = 8.5; end = 14; }
    else { start = 8.5; end = 17.5; }

    for (let h = start; h < end; h += 0.5) {
      const hours = Math.floor(h);
      const minutes = (h % 1) * 60;
      times.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }
    return times;
  };

  const teeTimes = generateTeeTimes();

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
          teeTime: selectedTeeTime,
          drivingRange,
          drivingRangePrice,
          handicapConfirmed,
          memberCompanion: needsMemberCompanion ? memberCompanion : undefined,
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
    if (!handicapConfirmed) {
      errors.handicap = "Bitte bestätigen Sie Ihr Handicap";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitBooking = () => {
    if (!validateContact()) return;
    bookingMutation.mutate();
  };

  const PAYMENT_OPTIONS = [
    { value: "vor_ort", label: "Vor Ort bezahlen (Greenfee)", icon: <CreditCard className="h-4 w-4" />, desc: "Greenfee vor der Runde entrichten" },
    { value: "paypal", label: "PayPal", icon: <CreditCard className="h-4 w-4" />, desc: "Sichere Online-Zahlung" },
  ];

  if (step === "confirmation" && bookingResult) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Tee-Time reserviert!</h2>
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
                    <span className="text-gray-500">Golfclub</span>
                    <span className="font-medium">{partnerName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Datum</span>
                    <span className="font-medium">{format(selectedDate, "dd. MMMM yyyy", { locale: de })}</span>
                  </div>
                  {selectedTeeTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tee-Time</span>
                      <span className="font-medium">{selectedTeeTime} Uhr</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Spieler</span>
                    <span className="font-medium">{totalPersons}</span>
                  </div>
                  <div className="border-t pt-2 space-y-1.5">
                    {selectedTickets.map(t => (
                      <div key={t.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{t.quantity}x {t.title}</span>
                        <span className="font-medium">{`${(t.price * t.quantity).toFixed(2)}€`}</span>
                      </div>
                    ))}
                    {drivingRange && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Driving Range ({totalPersons}x)</span>
                        <span className="font-medium">{drivingRangePrice.toFixed(2)}€</span>
                      </div>
                    )}
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
                  <p className="text-xs text-gray-500 mb-3">QR-Code beim Golfclub vorzeigen</p>
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
          <div className="bg-gradient-to-r from-green-700 to-emerald-600 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Flag className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{partnerName}</h2>
                <p className="text-green-100 text-sm">Schritt 3 von 3 – Kontaktdaten & Bezahlung</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-green-600" />
                    Ihre Kontaktdaten
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vollständiger Name *</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail-Adresse *</label>
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
                        Nachricht an den Golfclub <span className="text-gray-400">(optional)</span>
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="z.B. Handicap-Angabe, besondere Wünsche, E-Cart benötigt..."
                          className="pl-10 min-h-[80px]"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Handicap-Bestätigung *
                  </h3>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={handicapConfirmed}
                      onChange={(e) => { setHandicapConfirmed(e.target.checked); setFormErrors(prev => ({ ...prev, handicap: "" })); }}
                      className="mt-1 w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-sm text-green-700">
                      Ich bestätige, dass ich über einen gültigen Clubausweis mit eingetragenem Hcp -36,0 verfüge.
                    </span>
                  </label>
                  {formErrors.handicap && <p className="text-xs text-red-500 mt-2">{formErrors.handicap}</p>}
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    Bezahlmethode
                  </h3>
                  <div className="space-y-2">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPaymentMethod(opt.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          paymentMethod === opt.value
                            ? "border-green-400 bg-green-50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          paymentMethod === opt.value ? "border-green-500" : "border-gray-300"
                        }`}>
                          {paymentMethod === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
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
                    {selectedTeeTime && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Tee-Time: {selectedTeeTime} Uhr</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-3.5 w-3.5" />
                      <span>{totalPersons} {totalPersons === 1 ? "Spieler" : "Spieler"}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
                    {selectedTickets.map(t => (
                      <div key={t.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{t.quantity}x {t.title}</span>
                        <span className="font-medium">{`${(t.price * t.quantity).toFixed(2)}€`}</span>
                      </div>
                    ))}
                    {drivingRange && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Driving Range ({totalPersons}x)</span>
                        <span className="font-medium">{drivingRangePrice.toFixed(2)}€</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-semibold text-gray-800">Gesamt</span>
                    <span className="text-xl font-bold text-green-600">{totalPrice.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setStep("tee_time")} className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
            <Button
              onClick={handleSubmitBooking}
              disabled={bookingMutation.isPending}
              size="lg"
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 shadow-md"
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

  if (step === "tee_time") {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-700 to-emerald-600 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Flag className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{partnerName}</h2>
                <div className="flex items-center gap-2 text-green-100 text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{experience?.location || experience?.city || "Bochum"}</span>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-1">Schritt 2 von 3 – Tee-Time & Extras wählen</p>
          </div>

          <div className="p-4 sm:p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Tee-Time wählen
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  Verfügbare Startzeiten am {format(selectedDate, "EEEE, dd. MMMM", { locale: de })}
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {teeTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTeeTime(time)}
                      className={`py-2.5 px-2 rounded-lg text-sm font-medium transition-all ${
                        selectedTeeTime === time
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-gray-50 border border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-5">
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Flag className="h-5 w-5 text-green-600" />
                  Extras
                </h3>
                <button
                  onClick={() => setDrivingRange(!drivingRange)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    drivingRange
                      ? "border-green-400 bg-green-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      drivingRange ? "bg-green-100" : "bg-gray-100"
                    }`}>
                      <Flag className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-800">Driving Range</p>
                      <p className="text-xs text-gray-500">Übungsbereich vor dem Spiel nutzen</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-800">6,00€ / Person</span>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      drivingRange ? "border-green-500 bg-green-500" : "border-gray-300"
                    }`}>
                      {drivingRange && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                  </div>
                </button>
              </div>

              {needsMemberCompanion && (
                <div className="border-t pt-5">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-amber-800">Mitgliederbegleitung erforderlich</h4>
                        <p className="text-xs text-amber-700 mt-1 mb-3">
                          An Wochenenden und Feiertagen ist das Spielen nur in Begleitung eines Clubmitgliedes möglich.
                        </p>
                        <Input
                          value={memberCompanion}
                          onChange={(e) => setMemberCompanion(e.target.value)}
                          placeholder="Name des begleitenden Mitglieds"
                          className="bg-white border-amber-300 focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-green-50/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Button variant="outline" onClick={() => setStep("tickets")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zu Greenfees
              </Button>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Gesamtpreis</p>
                  <p className="text-2xl font-bold text-green-600">{totalPrice.toFixed(2)}€</p>
                </div>
                <Button
                  onClick={() => setStep("contact")}
                  disabled={!selectedTeeTime}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 shadow-md"
                >
                  Weiter
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {`${Number(ticket.price).toFixed(2)}€`}
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

  const weekdayTickets = filteredTickets.filter(t => {
    const tl = t.title.toLowerCase();
    return !tl.includes('student') && !tl.includes('schüler');
  });

  const discountTickets = filteredTickets.filter(t => {
    const tl = t.title.toLowerCase();
    return tl.includes('student') || tl.includes('schüler');
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-700 to-emerald-600 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Flag className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{partnerName}</h2>
              <div className="flex items-center gap-2 text-green-100 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                <span>{experience?.location || experience?.city || "Bochum"}</span>
              </div>
            </div>
          </div>
          <p className="text-green-100 text-sm mt-1">Schritt 1 von 3 – Datum & Greenfee wählen</p>
        </div>

        <div className="p-4 sm:p-5 border-b border-gray-100 bg-green-50/30">
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
                      setQuantities({});
                    }
                  }}
                  disabled={(date) => isBefore(date, startOfDay(new Date()))}
                  locale={de}
                />
              </PopoverContent>
            </Popover>

            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 px-3 py-1.5">
              <Flag className="h-3.5 w-3.5 mr-1" /> Golf
            </Badge>

            <Badge variant="outline" className={`px-3 py-1.5 ${
              isSelectedWeekend
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-green-50 text-green-700 border-green-200"
            }`}>
              {isSelectedWeekend ? (
                <><Sunset className="h-3.5 w-3.5 mr-1" /> {selectedDayName}</>
              ) : (
                <><Sun className="h-3.5 w-3.5 mr-1" /> {selectedDayName}</>
              )}
            </Badge>
          </div>

          {isSelectedWeekend && (
            <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>An Wochenenden und Feiertagen ist das Spielen nur in Begleitung eines Clubmitgliedes möglich (ein Gast pro spielendem Mitglied).</span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-700">Greenfee-Optionen</h3>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Info className="h-3 w-3" />
              <span>Clubausweis mit Hcp -36,0 erforderlich</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-4">Greenfee ist ausschließlich vor der Runde zu entrichten.</p>

          <div className="space-y-2.5">
            {weekdayTickets.map(renderTicketRow)}
          </div>

          {discountTickets.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-gray-700 mt-6 mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-500" />
                Ermäßigte Greenfees
              </h3>
              <div className="space-y-2.5">
                {discountTickets.map(renderTicketRow)}
              </div>
            </>
          )}
        </div>

        {selectedTickets.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-green-50/30">
            <div className="mb-3 space-y-1.5">
              {selectedTickets.map((t) => (
                <div key={t.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{t.quantity}x {t.title}</span>
                  <span className="font-medium text-gray-800">{`${(t.price * t.quantity).toFixed(2)}€`}</span>
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
                    {totalPersons} {totalPersons === 1 ? "Spieler" : "Spieler"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Greenfee</p>
                  <p className="text-2xl font-bold text-green-600">{ticketPrice.toFixed(2)}€</p>
                </div>
                <Button
                  onClick={() => setStep("tee_time")}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 shadow-md"
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
