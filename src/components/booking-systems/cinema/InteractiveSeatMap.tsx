import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Film, Clock, Users, Minus, Plus, Star, ArrowLeft, ArrowRight, CheckCircle2, Mail, Phone, UserCircle, Loader2, CreditCard, MessageSquare, Armchair, Accessibility, AlertTriangle, Popcorn, Monitor } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isBefore, startOfDay, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { QRCode } from "@/components/ui/qr-code";

interface SeatMapProps {
  experience: any;
  partnerName: string;
  standardPrice: number;
  premiumPrice: number;
  onBooking: (bookingData: any) => void;
  preSelectedMovie?: string;
  onClose?: () => void;
  partnerId?: number;
}

const EXPERIENCE_TO_MOVIE: Record<number, string> = {
  2220: "perfekter-antrag",
  2221: "marty-supreme",
  2222: "scream-7",
  2224: "perfekter-antrag",
  2225: "marty-supreme",
  2226: "scream-7",
};

type SeatCategory = "parkett" | "loge";
type BookingStep = "movie" | "seats" | "contact" | "confirmation";

interface RowConfig {
  label: string;
  seats: number;
  category: SeatCategory;
  gaps?: number[];
  wheelchair?: number[];
}

interface HallLayout {
  rows: RowConfig[];
  maxSeats: number;
  name: string;
  totalSeats: number;
}

interface Movie {
  id: string;
  name: string;
  genre: string;
  duration: string;
  rating: string;
  showtimes: { time: string; hall: string; available: number }[];
}

const KINO_1: HallLayout = {
  name: "Kino 1 – Großer Saal",
  maxSeats: 16,
  totalSeats: 0,
  rows: [
    { label: "1", seats: 8,  category: "parkett" },
    { label: "2", seats: 10, category: "parkett" },
    { label: "3", seats: 12, category: "parkett" },
    { label: "4", seats: 14, category: "parkett" },
    { label: "5", seats: 14, category: "parkett", gaps: [7] },
    { label: "6", seats: 16, category: "parkett" },
    { label: "7", seats: 16, category: "parkett" },
    { label: "8", seats: 16, category: "parkett" },
    { label: "9", seats: 14, category: "loge", gaps: [7] },
    { label: "10", seats: 16, category: "loge" },
    { label: "11", seats: 16, category: "loge" },
    { label: "12", seats: 16, category: "loge" },
    { label: "13", seats: 12, category: "loge" },
    { label: "14", seats: 10, category: "loge" },
    { label: "15", seats: 4,  category: "loge", wheelchair: [1, 4] },
  ],
};
KINO_1.totalSeats = KINO_1.rows.reduce((s, r) => s + r.seats, 0);

const KINO_7: HallLayout = {
  name: "Kino 7 – Kleiner Saal",
  maxSeats: 16,
  totalSeats: 0,
  rows: [
    { label: "1", seats: 14, category: "parkett" },
    { label: "2", seats: 16, category: "parkett" },
    { label: "3", seats: 16, category: "parkett" },
    { label: "4", seats: 16, category: "parkett" },
    { label: "5", seats: 16, category: "loge" },
    { label: "6", seats: 16, category: "loge" },
    { label: "7", seats: 16, category: "loge" },
    { label: "8", seats: 14, category: "loge" },
    { label: "9", seats: 10, category: "loge" },
    { label: "10", seats: 4, category: "loge", wheelchair: [1, 4] },
  ],
};
KINO_7.totalSeats = KINO_7.rows.reduce((s, r) => s + r.seats, 0);

const MK_SAAL_1: HallLayout = {
  name: "Saal 1 – Großer Saal",
  maxSeats: 14,
  totalSeats: 0,
  rows: [
    { label: "1", seats: 8,  category: "parkett" },
    { label: "2", seats: 10, category: "parkett" },
    { label: "3", seats: 12, category: "parkett" },
    { label: "4", seats: 14, category: "parkett" },
    { label: "5", seats: 14, category: "parkett" },
    { label: "6", seats: 14, category: "parkett" },
    { label: "7", seats: 14, category: "loge" },
    { label: "8", seats: 14, category: "loge" },
    { label: "9", seats: 14, category: "loge" },
    { label: "10", seats: 12, category: "loge" },
    { label: "11", seats: 10, category: "loge" },
    { label: "12", seats: 4,  category: "loge", wheelchair: [1, 4] },
  ],
};
MK_SAAL_1.totalSeats = MK_SAAL_1.rows.reduce((s, r) => s + r.seats, 0);

const MK_SAAL_2: HallLayout = {
  name: "Saal 2 – Kleiner Saal",
  maxSeats: 12,
  totalSeats: 0,
  rows: [
    { label: "1", seats: 8,  category: "parkett" },
    { label: "2", seats: 10, category: "parkett" },
    { label: "3", seats: 12, category: "parkett" },
    { label: "4", seats: 12, category: "loge" },
    { label: "5", seats: 12, category: "loge" },
    { label: "6", seats: 12, category: "loge" },
    { label: "7", seats: 10, category: "loge" },
    { label: "8", seats: 4,  category: "loge", wheelchair: [1, 4] },
  ],
};
MK_SAAL_2.totalSeats = MK_SAAL_2.rows.reduce((s, r) => s + r.seats, 0);

const CINEMAHLEN_SAAL_1: HallLayout = {
  name: "Saal 1",
  maxSeats: 14,
  totalSeats: 0,
  rows: [
    { label: "1", seats: 8,  category: "parkett" },
    { label: "2", seats: 10, category: "parkett" },
    { label: "3", seats: 12, category: "parkett" },
    { label: "4", seats: 14, category: "parkett" },
    { label: "5", seats: 14, category: "parkett" },
    { label: "6", seats: 14, category: "parkett" },
    { label: "7", seats: 14, category: "loge" },
    { label: "8", seats: 14, category: "loge" },
    { label: "9", seats: 12, category: "loge" },
    { label: "10", seats: 10, category: "loge" },
    { label: "11", seats: 4,  category: "loge", wheelchair: [1, 4] },
  ],
};
CINEMAHLEN_SAAL_1.totalSeats = CINEMAHLEN_SAAL_1.rows.reduce((s, r) => s + r.seats, 0);

const CINEMAHLEN_SAAL_2: HallLayout = {
  name: "Saal 2",
  maxSeats: 12,
  totalSeats: 0,
  rows: [
    { label: "1", seats: 8,  category: "parkett" },
    { label: "2", seats: 10, category: "parkett" },
    { label: "3", seats: 12, category: "parkett" },
    { label: "4", seats: 12, category: "parkett" },
    { label: "5", seats: 12, category: "loge" },
    { label: "6", seats: 12, category: "loge" },
    { label: "7", seats: 10, category: "loge" },
    { label: "8", seats: 4,  category: "loge", wheelchair: [1, 4] },
  ],
};
CINEMAHLEN_SAAL_2.totalSeats = CINEMAHLEN_SAAL_2.rows.reduce((s, r) => s + r.seats, 0);

const HALLS_BY_PARTNER: Record<number, Record<string, HallLayout>> = {
  137: { "Kino 1": KINO_1, "Kino 7": KINO_7 },
  138: { "Saal 1": MK_SAAL_1, "Saal 2": MK_SAAL_2 },
  808: { "Saal 1": CINEMAHLEN_SAAL_1, "Saal 2": CINEMAHLEN_SAAL_2 },
};

interface CinemaAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  perTicket: boolean;
}

const ADDONS_BY_PARTNER: Record<number, CinemaAddon[]> = {
  808: [
    { id: "ueberlange", name: "Überlängen-Zuschlag", description: "Ab 150 Min. Laufzeit", price: 150, perTicket: true },
    { id: "3d", name: "3D-Zuschlag", description: "Für 3D-Filme", price: 300, perTicket: true },
    { id: "3d-brille", name: "3D-Brille", description: "Ihre persönliche 3D-Brille", price: 100, perTicket: true },
    { id: "loge", name: "Logenplatz-Zuschlag", description: "Reihe A–C", price: 150, perTicket: true },
  ],
};

const MOVIES_BY_PARTNER: Record<number, Movie[]> = {
  137: [
    { id: "perfekter-antrag", name: "Ein Fast perfekter Antrag", genre: "Komödie", duration: "105 Min.", rating: "FSK 0", showtimes: [
      { time: "16:00", hall: "Kino 1", available: 142 }, { time: "18:00", hall: "Kino 1", available: 98 }, { time: "20:00", hall: "Kino 1", available: 67 }
    ]},
    { id: "marty-supreme", name: "Marty Supreme", genre: "Abenteuer, Drama", duration: "150 Min.", rating: "FSK 6", showtimes: [
      { time: "16:45", hall: "Kino 7", available: 58 }, { time: "19:45", hall: "Kino 7", available: 41 }
    ]},
    { id: "scream-7", name: "Scream 7", genre: "Horror", duration: "114 Min.", rating: "FSK 16", showtimes: [
      { time: "16:45", hall: "Kino 7", available: 62 }, { time: "21:00", hall: "Kino 7", available: 38 }
    ]},
  ],
  138: [
    { id: "perfekter-antrag", name: "Ein Fast perfekter Antrag", genre: "Komödie", duration: "105 Min.", rating: "FSK 0", showtimes: [
      { time: "15:30", hall: "Saal 1", available: 96 }, { time: "17:45", hall: "Saal 1", available: 72 }, { time: "20:15", hall: "Saal 1", available: 54 }
    ]},
    { id: "marty-supreme", name: "Marty Supreme", genre: "Abenteuer, Drama", duration: "150 Min.", rating: "FSK 6", showtimes: [
      { time: "16:00", hall: "Saal 2", available: 48 }, { time: "19:30", hall: "Saal 2", available: 35 }
    ]},
    { id: "scream-7", name: "Scream 7", genre: "Horror", duration: "114 Min.", rating: "FSK 16", showtimes: [
      { time: "17:00", hall: "Saal 2", available: 52 }, { time: "20:45", hall: "Saal 2", available: 30 }
    ]},
  ],
  808: [
    { id: "perfekter-antrag", name: "Ein Fast perfekter Antrag", genre: "Komödie", duration: "105 Min.", rating: "FSK 0", showtimes: [
      { time: "15:30", hall: "Saal 1", available: 88 }, { time: "18:00", hall: "Saal 1", available: 65 }, { time: "20:30", hall: "Saal 1", available: 42 }
    ]},
    { id: "marty-supreme", name: "Marty Supreme", genre: "Abenteuer, Drama", duration: "150 Min.", rating: "FSK 6", showtimes: [
      { time: "16:00", hall: "Saal 2", available: 52 }, { time: "19:30", hall: "Saal 2", available: 38 }
    ]},
    { id: "scream-7", name: "Scream 7", genre: "Horror", duration: "114 Min.", rating: "FSK 16", showtimes: [
      { time: "17:15", hall: "Saal 2", available: 56 }, { time: "21:00", hall: "Saal 2", available: 32 }
    ]},
  ],
};

function generateOccupied(movieId: string, showtime: string, hall: HallLayout): string[] {
  let seed = 0;
  for (let i = 0; i < movieId.length; i++) seed += movieId.charCodeAt(i);
  for (let i = 0; i < showtime.length; i++) seed += showtime.charCodeAt(i) * 3;

  const occupied: string[] = [];
  const occupiedCount = Math.floor(hall.totalSeats * 0.12) + (seed % Math.floor(hall.totalSeats * 0.08));

  for (let i = 0; i < occupiedCount; i++) {
    const rowIdx = (seed * (i + 7) * 13) % hall.rows.length;
    const row = hall.rows[rowIdx];
    const seatNum = ((seed * (i + 3) * 17) % row.seats) + 1;
    const seatId = `R${row.label}-${seatNum}`;
    const isWheelchair = row.wheelchair?.includes(seatNum);
    if (!occupied.includes(seatId) && !isWheelchair) {
      occupied.push(seatId);
    }
  }
  return occupied;
}

function getGenreColor(genre: string): string {
  if (genre.includes("Komödie")) return "bg-yellow-500 text-gray-800";
  if (genre.includes("Horror")) return "bg-gray-800";
  if (genre.includes("Abenteuer")) return "bg-orange-500";
  if (genre.includes("Drama")) return "bg-indigo-500";
  if (genre.includes("Action")) return "bg-red-500";
  if (genre.includes("Animation")) return "bg-purple-500";
  return "bg-blue-500";
}

export default function InteractiveSeatMap({ experience, partnerName, standardPrice, premiumPrice, onBooking, preSelectedMovie, onClose, partnerId = 137 }: SeatMapProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const MOVIES = MOVIES_BY_PARTNER[partnerId] || MOVIES_BY_PARTNER[137];
  const HALLS = HALLS_BY_PARTNER[partnerId] || HALLS_BY_PARTNER[137];

  const resolvedPreSelect = preSelectedMovie || EXPERIENCE_TO_MOVIE[experience?.id] || "";

  const [step, setStep] = useState<BookingStep>("movie");
  const [selectedMovie, setSelectedMovie] = useState<string>(resolvedPreSelect);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedShowtime, setSelectedShowtime] = useState<string>("");
  const [selectedHall, setSelectedHall] = useState<string>("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [contactName, setContactName] = useState(user?.fullName || "");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("vor_ort");

  const [bookingResult, setBookingResult] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const availableAddons = ADDONS_BY_PARTNER[partnerId] || [];

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId) ? prev.filter(a => a !== addonId) : [...prev, addonId]
    );
  };

  const addonsTotal = useMemo(() => {
    return selectedAddons.reduce((sum, addonId) => {
      const addon = availableAddons.find(a => a.id === addonId);
      if (!addon) return sum;
      return sum + (addon.perTicket ? addon.price * selectedSeats.length : addon.price);
    }, 0);
  }, [selectedAddons, selectedSeats.length, availableAddons]);

  const defaultHall = Object.values(HALLS)[0] || KINO_1;
  const hallLayout = useMemo(() => {
    return HALLS[selectedHall] || defaultHall;
  }, [selectedHall, HALLS]);

  const occupiedSeats = useMemo(() => {
    if (!selectedMovie || !selectedShowtime) return [];
    return generateOccupied(selectedMovie, selectedShowtime, hallLayout);
  }, [selectedMovie, selectedShowtime, hallLayout]);

  const getSeatCategory = (rowLabel: string): SeatCategory => {
    const row = hallLayout.rows.find(r => r.label === rowLabel);
    return row?.category || "parkett";
  };

  const isWheelchair = (rowLabel: string, seatNum: number): boolean => {
    const row = hallLayout.rows.find(r => r.label === rowLabel);
    return row?.wheelchair?.includes(seatNum) || false;
  };

  const getSeatPrice = (rowLabel: string) => {
    return getSeatCategory(rowLabel) === "loge" ? premiumPrice : standardPrice;
  };

  const toggleSeat = (seatId: string) => {
    const rowLabel = seatId.split("-")[0].replace("R", "");
    const seatNum = parseInt(seatId.split("-")[1]);
    if (occupiedSeats.includes(seatId)) return;

    setSelectedSeats(prev => {
      if (prev.includes(seatId)) return prev.filter(s => s !== seatId);
      if (prev.length >= 10) return prev;
      return [...prev, seatId];
    });
  };

  const seatsPrice = useMemo(() => {
    return selectedSeats.reduce((sum, seatId) => {
      const rowLabel = seatId.split("-")[0].replace("R", "");
      return sum + getSeatPrice(rowLabel);
    }, 0);
  }, [selectedSeats, hallLayout]);

  const totalPrice = seatsPrice + addonsTotal;

  const parkettCount = selectedSeats.filter(s => getSeatCategory(s.split("-")[0].replace("R", "")) === "parkett").length;
  const logeCount = selectedSeats.filter(s => getSeatCategory(s.split("-")[0].replace("R", "")) === "loge").length;

  const movie = MOVIES.find(m => m.id === selectedMovie);

  const formatSeatDisplay = (seatId: string) => {
    const parts = seatId.split("-");
    return `Reihe ${parts[0].replace("R", "")}, Platz ${parts[1]}`;
  };

  const formatSeatShort = (seatId: string) => {
    const parts = seatId.split("-");
    return `R${parts[0].replace("R", "")}/P${parts[1]}`;
  };

  const sortedSeats = [...selectedSeats].sort((a, b) => {
    const [aRow, aSeat] = [parseInt(a.split("-")[0].replace("R", "")), parseInt(a.split("-")[1])];
    const [bRow, bSeat] = [parseInt(b.split("-")[0].replace("R", "")), parseInt(b.split("-")[1])];
    return aRow !== bRow ? aRow - bRow : aSeat - bSeat;
  });

  const bookingMutation = useMutation({
    mutationFn: async () => {
      const bookingData = {
        experienceId: experience.id,
        contactName,
        contactEmail,
        contactPhone,
        date: selectedDate.toISOString(),
        message: contactMessage,
        paymentMethod,
        offerTitle: `${partnerName} - ${movie?.name || 'Kinotickets'} (${selectedSeats.length} Plätze)`,
        bookingDetails: {
          movie: movie?.name,
          showtime: selectedShowtime,
          hall: selectedHall,
          seats: sortedSeats.map(formatSeatShort),
          parkettSeats: parkettCount,
          logeSeats: logeCount,
          addons: selectedAddons.map(id => {
            const a = availableAddons.find(x => x.id === id);
            return a ? { id: a.id, name: a.name, price: a.price, perTicket: a.perTicket, total: a.perTicket ? a.price * selectedSeats.length : a.price } : null;
          }).filter(Boolean),
          addonsTotal,
          parameters: {},
        },
        totalPrice,
        participants: selectedSeats.length,
      };
      const res = await apiRequest("POST", "/api/bookings", bookingData);
      return await res.json();
    },
    onSuccess: (data) => {
      setBookingResult(data);
      setStep("confirmation");
      toast({ title: "Buchung erfolgreich!", description: `Bestätigung wurde an ${contactEmail} gesendet.` });
      if (user) queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: Error) => {
      toast({ title: "Buchung fehlgeschlagen", description: error.message, variant: "destructive" });
    },
  });

  const validateContact = (): boolean => {
    const errors: Record<string, string> = {};
    if (!contactName || contactName.trim().length < 3) errors.name = "Bitte vollständigen Namen eingeben";
    if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) errors.email = "Bitte gültige E-Mail eingeben";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitBooking = () => {
    if (!validateContact()) return;
    bookingMutation.mutate();
  };

  const PAYMENT_OPTIONS = [
    { value: "vor_ort", label: "Vor Ort bezahlen", icon: <CreditCard className="h-4 w-4" />, desc: "Bezahlung an der Kinokasse" },
    { value: "paypal", label: "PayPal", icon: <CreditCard className="h-4 w-4" />, desc: "Sichere Online-Zahlung" },
  ];

  const headerGradient = "bg-gradient-to-r from-[#8B7435] to-[#6B5A2B]";

  if (step === "confirmation" && bookingResult) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className={`${headerGradient} p-6 sm:p-8 text-center`}>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Kinotickets reserviert!</h2>
            <p className="text-white/80">Bestätigung wurde an {contactEmail} gesendet</p>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Buchungsdetails</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Buchungsnr.</span><span className="font-semibold">#{bookingResult.id}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Kino</span><span className="font-medium">{partnerName}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Film</span><span className="font-medium">{movie?.name}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Datum</span><span className="font-medium">{format(selectedDate, "dd. MMMM yyyy", { locale: de })}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Vorstellung</span><span className="font-medium">{selectedShowtime} Uhr – {hallLayout.name}</span></div>
                  <div className="flex justify-between text-sm items-start"><span className="text-gray-500">Plätze</span><span className="font-medium text-right">{sortedSeats.map(formatSeatShort).join(', ')}</span></div>
                  <div className="border-t pt-2 space-y-1.5">
                    {parkettCount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-600">{parkettCount}x Parkett</span><span className="font-medium">{(parkettCount * standardPrice / 100).toFixed(2).replace('.', ',')}€</span></div>}
                    {logeCount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-600">{logeCount}x Loge</span><span className="font-medium">{(logeCount * premiumPrice / 100).toFixed(2).replace('.', ',')}€</span></div>}
                    {selectedAddons.map(addonId => {
                      const addon = availableAddons.find(a => a.id === addonId);
                      if (!addon) return null;
                      const cost = addon.perTicket ? addon.price * selectedSeats.length : addon.price;
                      return (
                        <div key={addonId} className="flex justify-between text-sm">
                          <span className="text-gray-600">{addon.perTicket ? `${selectedSeats.length}x ` : ''}{addon.name}</span>
                          <span className="font-medium">{(cost / 100).toFixed(2).replace('.', ',')}€</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t pt-2 flex justify-between"><span className="font-semibold">Gesamtpreis</span><span className="text-lg font-bold text-[#8B7435]">{(totalPrice / 100).toFixed(2).replace('.', ',')}€</span></div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Kontaktdaten</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><UserCircle className="h-4 w-4 text-gray-400" /><span>{contactName}</span></div>
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /><span>{contactEmail}</span></div>
                  {contactPhone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /><span>{contactPhone}</span></div>}
                </div>
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500 mb-3">QR-Code an der Kasse vorzeigen</p>
                  <QRCode value={bookingResult.qrCode || `booking-${bookingResult.id}`} size={160} className="mx-auto" />
                  <p className="text-xs text-gray-400 mt-2">Ticket-ID: {bookingResult.qrCode || `booking-${bookingResult.id}`}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => onClose ? onClose() : window.location.href = `/partner/${partnerId}`}>Zurück zum Kino</Button>
            <Button onClick={() => window.location.href = "/"} className="bg-[#8B7435] hover:bg-[#6B5A2B]">Zur Startseite</Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "contact") {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className={`${headerGradient} p-4 sm:p-6`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"><Film className="h-5 w-5 text-white" /></div>
              <div>
                <h2 className="text-xl font-bold text-white">{partnerName}</h2>
                <p className="text-white/80 text-sm">Schritt 3 von 3 – Kontaktdaten & Bezahlung</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-[#8B7435]" />
                    Ihre Kontaktdaten
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vollständiger Name *</label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input value={contactName} onChange={(e) => { setContactName(e.target.value); setFormErrors(prev => ({ ...prev, name: "" })); }} placeholder="Max Mustermann" className={`pl-10 ${formErrors.name ? "border-red-400" : ""}`} />
                      </div>
                      {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail-Adresse *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input type="email" value={contactEmail} onChange={(e) => { setContactEmail(e.target.value); setFormErrors(prev => ({ ...prev, email: "" })); }} placeholder="max@beispiel.de" className={`pl-10 ${formErrors.email ? "border-red-400" : ""}`} />
                      </div>
                      {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefonnummer <span className="text-gray-400">(optional)</span></label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+49 123 456789" className="pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nachricht <span className="text-gray-400">(optional)</span></label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="z.B. Rollstuhlplatz benötigt, Kindergeburtstag..." className="pl-10 min-h-[80px]" rows={3} />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#8B7435]" />
                    Bezahlmethode
                  </h3>
                  <div className="space-y-2">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <button key={opt.value} onClick={() => setPaymentMethod(opt.value)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${paymentMethod === opt.value ? "border-[#8B7435] bg-amber-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === opt.value ? "border-[#8B7435]" : "border-gray-300"}`}>
                          {paymentMethod === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-[#8B7435]" />}
                        </div>
                        <div className="flex-1"><p className="text-sm font-medium text-gray-800">{opt.label}</p><p className="text-xs text-gray-500">{opt.desc}</p></div>
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
                    <div className="flex items-center gap-2 text-gray-600"><Film className="h-3.5 w-3.5" /><span className="truncate">{movie?.name}</span></div>
                    <div className="flex items-center gap-2 text-gray-600"><CalendarIcon className="h-3.5 w-3.5" /><span>{format(selectedDate, "dd. MMMM yyyy", { locale: de })}</span></div>
                    <div className="flex items-center gap-2 text-gray-600"><Clock className="h-3.5 w-3.5" /><span>{selectedShowtime} Uhr – {hallLayout.name}</span></div>
                    <div className="flex items-start gap-2 text-gray-600"><Armchair className="h-3.5 w-3.5 mt-0.5" /><span>{sortedSeats.map(formatSeatShort).join(', ')}</span></div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
                    {parkettCount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-600">{parkettCount}x Parkett</span><span className="font-medium">{(parkettCount * standardPrice / 100).toFixed(2).replace('.', ',')}€</span></div>}
                    {logeCount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-600">{logeCount}x Loge</span><span className="font-medium">{(logeCount * premiumPrice / 100).toFixed(2).replace('.', ',')}€</span></div>}
                    {selectedAddons.map(addonId => {
                      const addon = availableAddons.find(a => a.id === addonId);
                      if (!addon) return null;
                      const cost = addon.perTicket ? addon.price * selectedSeats.length : addon.price;
                      return (
                        <div key={addonId} className="flex justify-between text-sm">
                          <span className="text-gray-600">{addon.perTicket ? `${selectedSeats.length}x ` : ''}{addon.name}</span>
                          <span className="font-medium">{(cost / 100).toFixed(2).replace('.', ',')}€</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-semibold text-gray-800">Gesamt</span>
                    <span className="text-xl font-bold text-[#8B7435]">{(totalPrice / 100).toFixed(2).replace('.', ',')}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setStep("seats")} className="w-full sm:w-auto"><ArrowLeft className="h-4 w-4 mr-2" />Zurück zum Sitzplan</Button>
            <Button onClick={handleSubmitBooking} disabled={bookingMutation.isPending} size="lg" className="w-full sm:w-auto bg-[#8B7435] hover:bg-[#6B5A2B] text-white px-8 shadow-md">
              {bookingMutation.isPending ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Wird gebucht...</>) : (<>Jetzt verbindlich buchen<ArrowRight className="h-4 w-4 ml-2" /></>)}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "seats") {
    const getSeatColor = (seatId: string, rowLabel: string, seatNum: number) => {
      if (occupiedSeats.includes(seatId)) return "bg-[#6B3A3A] border-[#5A2D2D] cursor-not-allowed text-[#6B3A3A]";
      if (selectedSeats.includes(seatId)) return "bg-purple-500 border-purple-600 text-white shadow-lg scale-110 ring-2 ring-purple-300";
      if (isWheelchair(rowLabel, seatNum)) return "bg-blue-100 border-blue-400 hover:bg-blue-200 cursor-pointer text-blue-700";
      const cat = getSeatCategory(rowLabel);
      if (cat === "loge") return "bg-[#2D6B3A] border-[#1F5A2D] hover:bg-[#3A8B4A] cursor-pointer text-white";
      return "bg-[#D4C8A0] border-[#B8A878] hover:bg-[#C0B488] cursor-pointer text-[#6B5A2B]";
    };

    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className={`${headerGradient} p-4 sm:p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"><Armchair className="h-5 w-5 text-white" /></div>
                <div>
                  <h2 className="text-xl font-bold text-white">{partnerName}</h2>
                  <p className="text-white/80 text-sm">Schritt 2 von 3 – Sitzplätze wählen</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-white/70 text-xs">{movie?.name}</p>
                <p className="text-white font-semibold">{format(selectedDate, "dd.MM.yyyy", { locale: de })} – {selectedShowtime} Uhr</p>
                <p className="text-white/70 text-xs">{hallLayout.name}</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-[#E8E0D0]">
            <div className="bg-[#8B7435] text-white text-center py-1.5 rounded-t-lg mb-0 font-semibold text-sm tracking-wide">
              Saalplan ({selectedHall})
            </div>
            <div className="bg-[#D4CDB8] rounded-b-lg p-4 sm:p-6 border border-[#B8A878]">
              <div className="max-w-3xl mx-auto">
                <div className="bg-black text-white text-center py-2 font-medium text-sm tracking-widest mb-6 rounded-sm">
                  Leinwand
                </div>

                <div className="space-y-1 mb-6 overflow-x-auto">
                  {hallLayout.rows.map((row, rowIndex) => {
                    const paddingPerSide = Math.floor((hallLayout.maxSeats - row.seats) / 2);
                    const isLoge = row.category === "loge";

                    return (
                      <div key={row.label} className="flex items-center justify-center">
                        <div className={`w-7 text-center text-[10px] font-bold mr-1 ${isLoge ? "text-[#2D6B3A]" : "text-[#8B7435]"}`}>
                          {row.label}
                        </div>

                        <div className="flex items-center gap-[2px]">
                          {Array.from({ length: paddingPerSide }).map((_, i) => (
                            <div key={`pad-l-${i}`} className="w-6 h-6 sm:w-7 sm:h-7" />
                          ))}

                          {Array.from({ length: row.seats }, (_, i) => {
                            const seatNumber = i + 1;
                            const seatId = `R${row.label}-${seatNumber}`;
                            const isOccupied = occupiedSeats.includes(seatId);
                            const isSelected = selectedSeats.includes(seatId);
                            const wheelchair = isWheelchair(row.label, seatNumber);
                            const hasGap = row.gaps?.includes(seatNumber);

                            return (
                              <div key={seatId} className="flex items-center">
                                <button
                                  onClick={() => !isOccupied && toggleSeat(seatId)}
                                  disabled={isOccupied}
                                  className={`w-6 h-6 sm:w-7 sm:h-7 text-[9px] sm:text-[10px] font-bold border rounded-t-lg transition-all duration-150 flex items-center justify-center ${getSeatColor(seatId, row.label, seatNumber)}`}
                                  title={
                                    isOccupied ? "Belegt" :
                                    wheelchair ? `Rollstuhlplatz Reihe ${row.label}, Platz ${seatNumber}` :
                                    `${isLoge ? "Loge" : "Parkett"} Reihe ${row.label}, Platz ${seatNumber} – ${(getSeatPrice(row.label) / 100).toFixed(2).replace('.', ',')}€`
                                  }
                                >
                                  {wheelchair ? "♿" : seatNumber}
                                </button>
                                {hasGap && <div className="w-2 sm:w-3" />}
                              </div>
                            );
                          })}

                          {Array.from({ length: paddingPerSide }).map((_, i) => (
                            <div key={`pad-r-${i}`} className="w-6 h-6 sm:w-7 sm:h-7" />
                          ))}
                        </div>

                        <div className={`w-7 text-center text-[10px] font-bold ml-1 ${isLoge ? "text-[#2D6B3A]" : "text-[#8B7435]"}`}>
                          {row.label}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs border-t border-[#B8A878] pt-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-[#D4C8A0] border border-[#B8A878] rounded-t-md" />
                    <span className="text-gray-700">Parkett ({(standardPrice / 100).toFixed(2).replace('.', ',')}€)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-[#2D6B3A] border border-[#1F5A2D] rounded-t-md" />
                    <span className="text-gray-700">Loge ({(premiumPrice / 100).toFixed(2).replace('.', ',')}€)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-purple-500 border border-purple-600 rounded-t-md" />
                    <span className="text-gray-700">Ausgewählt</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-[#6B3A3A] border border-[#5A2D2D] rounded-t-md" />
                    <span className="text-gray-700">Belegt</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-blue-100 border border-blue-400 rounded-t-md text-[8px] flex items-center justify-center">♿</div>
                    <span className="text-gray-700">Rollstuhl</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <div className="mt-4 p-4 bg-white border border-[#B8A878] rounded-xl shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {selectedSeats.length} {selectedSeats.length === 1 ? 'Platz' : 'Plätze'} ausgewählt
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{sortedSeats.map(formatSeatShort).join(', ')}</p>
                    <div className="flex gap-3 mt-1 text-xs">
                      {parkettCount > 0 && <span className="text-[#8B7435]">{parkettCount}× Parkett</span>}
                      {logeCount > 0 && <span className="text-[#2D6B3A]">{logeCount}× Loge</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#8B7435]">{(totalPrice / 100).toFixed(2).replace('.', ',')}€</p>
                  </div>
                </div>

                {availableAddons.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#B8A878]/50">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Popcorn className="h-4 w-4 text-[#8B7435]" />
                      Zuschläge & Extras
                    </p>
                    <div className="space-y-2">
                      {availableAddons.map(addon => {
                        const isSelected = selectedAddons.includes(addon.id);
                        const addonCost = addon.perTicket ? addon.price * selectedSeats.length : addon.price;
                        return (
                          <button
                            key={addon.id}
                            onClick={() => toggleAddon(addon.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
                              isSelected
                                ? "border-[#8B7435] bg-amber-50 shadow-sm"
                                : "border-gray-200 bg-gray-50 hover:border-[#8B7435]/40"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected ? "border-[#8B7435] bg-[#8B7435]" : "border-gray-300 bg-white"
                              }`}>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{addon.name}</p>
                                <p className="text-xs text-gray-500">{addon.description}{addon.perTicket ? " · pro Ticket" : ""}</p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-3">
                              <p className="text-sm font-semibold text-[#8B7435]">+{(addon.price).toFixed(2).replace('.', ',')}€</p>
                              {addon.perTicket && selectedSeats.length > 1 && (
                                <p className="text-[10px] text-gray-400">= {(addonCost / 100).toFixed(2).replace('.', ',')}€</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {addonsTotal > 0 && (
                      <div className="mt-2 text-right text-xs text-gray-500">
                        Zuschläge gesamt: +{(addonsTotal / 100).toFixed(2).replace('.', ',')}€
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button variant="outline" onClick={() => { setStep("movie"); setSelectedSeats([]); }} className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />Zurück zur Filmauswahl
            </Button>
            <Button onClick={() => setStep("contact")} disabled={selectedSeats.length === 0} size="lg" className="w-full sm:w-auto bg-[#8B7435] hover:bg-[#6B5A2B] text-white px-8 shadow-md">
              Weiter zur Buchung<ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasPreselection = !!resolvedPreSelect;
  const moviesToShow = hasPreselection && movie ? [movie] : MOVIES;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className={`${headerGradient} p-4 sm:p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"><Film className="h-5 w-5 text-white" /></div>
            <div>
              <h2 className="text-xl font-bold text-white">{partnerName}</h2>
              <p className="text-white/80 text-sm">
                {hasPreselection
                  ? "Schritt 1 von 3 – Datum & Vorstellung wählen"
                  : "Schritt 1 von 3 – Film, Datum & Vorstellung wählen"
                }
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-b border-gray-100 bg-amber-50/30">
          <div className="flex flex-wrap items-center gap-3">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-white border-gray-200">
                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                  {format(selectedDate, "dd. MMMM yyyy", { locale: de })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={selectedDate} onSelect={(date) => { if (date) { setSelectedDate(date); setCalendarOpen(false); setSelectedShowtime(""); }}} disabled={(date) => isBefore(date, startOfDay(new Date())) || isBefore(addDays(new Date(), 14), date)} locale={de} />
              </PopoverContent>
            </Popover>
            <Badge variant="secondary" className="bg-[#8B7435]/10 text-[#8B7435] border-[#8B7435]/30 px-3 py-1.5">
              <Film className="h-3.5 w-3.5 mr-1" /> Union Filmtheater
            </Badge>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-[#D4C8A0]/30 border border-[#B8A878]/50 rounded-full text-[#6B5A2B]">Parkett: {(standardPrice / 100).toFixed(2).replace('.', ',')}€</span>
              <span className="px-2 py-1 bg-[#2D6B3A]/10 border border-[#2D6B3A]/30 rounded-full text-[#2D6B3A]">Loge: {(premiumPrice / 100).toFixed(2).replace('.', ',')}€</span>
            </div>
          </div>
        </div>

        {hasPreselection && movie ? (
          <div className="p-4 sm:p-5">
            <div className="p-4 rounded-xl border border-[#8B7435] bg-amber-50 ring-1 ring-[#8B7435]/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center flex-shrink-0">
                  <Monitor className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-gray-800">{movie.name}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${getGenreColor(movie.genre)}`}>{movie.genre}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{movie.rating}</span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" />{movie.duration}</span>
                    <span className="text-[10px] text-gray-400">{movie.showtimes[0].hall}</span>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-700 mt-5 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#8B7435]" />
              Vorstellung wählen
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {movie.showtimes.map((show, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedShowtime(show.time); setSelectedHall(show.hall); setSelectedSeats([]); }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedShowtime === show.time && selectedHall === show.hall
                      ? "border-[#8B7435] bg-amber-50 shadow-sm ring-1 ring-[#8B7435]/30"
                      : "border-gray-200 bg-white hover:border-[#8B7435]/40"
                  }`}
                >
                  <p className="text-lg font-bold text-gray-800">{show.time} Uhr</p>
                  <p className="text-xs text-gray-500">{show.hall}</p>
                  <p className="text-xs text-green-600 mt-1">{show.available} Plätze frei</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Film className="h-4 w-4 text-[#8B7435]" />
                Aktuelles Programm
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {moviesToShow.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMovie(m.id); setSelectedShowtime(""); setSelectedHall(""); setSelectedSeats([]); }}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      selectedMovie === m.id
                        ? "border-[#8B7435] bg-amber-50 shadow-sm ring-1 ring-[#8B7435]/30"
                        : "border-gray-200 bg-white hover:border-[#8B7435]/40 hover:bg-amber-50/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center flex-shrink-0">
                        <Monitor className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800">{m.name}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full text-white ${getGenreColor(m.genre)}`}>{m.genre}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-600">{m.rating}</span>
                          <span className="text-[9px] text-gray-500 flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{m.duration}</span>
                          <span className="text-[9px] text-gray-400">{m.showtimes[0].hall}</span>
                          {m.showtimes.map((s, i) => (
                            <span key={i} className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">{s.time} Uhr</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedMovie && movie && (
              <div className="p-4 sm:p-5 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#8B7435]" />
                  Vorstellungen – {movie.name}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {movie.showtimes.map((show, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setSelectedShowtime(show.time); setSelectedHall(show.hall); setSelectedSeats([]); }}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        selectedShowtime === show.time && selectedHall === show.hall
                          ? "border-[#8B7435] bg-amber-50 shadow-sm ring-1 ring-[#8B7435]/30"
                          : "border-gray-200 bg-white hover:border-[#8B7435]/40"
                      }`}
                    >
                      <p className="text-sm font-bold text-gray-800">{show.time} Uhr</p>
                      <p className="text-[10px] text-gray-500">{show.hall}</p>
                      <p className="text-[10px] text-green-600 mt-0.5">{show.available} Plätze frei</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {selectedShowtime && (
          <div className="p-4 sm:p-5 border-t border-gray-200 bg-gradient-to-r from-amber-50/50 to-[#D4C8A0]/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">{movie?.name}</p>
                <p className="text-xs text-gray-500">{format(selectedDate, "EEEE, dd. MMMM yyyy", { locale: de })} – {selectedShowtime} Uhr, {selectedHall}</p>
              </div>
              <Button onClick={() => setStep("seats")} size="lg" className="bg-[#8B7435] hover:bg-[#6B5A2B] text-white px-8 shadow-md">
                Sitzplätze wählen
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
