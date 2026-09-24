import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, MapPin, Clock, Users, ChevronDown, ChevronUp, Check } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, getDay, isToday, isBefore, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
// MISSING ASSETS: the source imports @assets/image_1772651135880.png, image_1772651145204.png,
// image_1772651154354.png and image_1772651162623.png, which do not exist in EngelFolder either;
// uses the current image helper's neutral local placeholder instead.
import { getGroupActivityImage } from "@/lib/group-activity-images";
const tennisImg1 = getGroupActivityImage({});
const tennisImg2 = tennisImg1;
const tennisImg3 = tennisImg1;
const tennisImg4 = tennisImg1;

interface TimeSlot {
  time: string;
  price: number;
  available: boolean;
  label?: string;
  isDoppelpack?: boolean;
}

interface Court {
  id: number;
  name: string;
  type: "indoor" | "outdoor";
  image: string;
  timeSlots: TimeSlot[];
}

interface TennisBookingSystemProps {
  experience: any;
  partnerName: string;
  courts: any[];
  onBooking: (bookingData: any) => void;
}

interface PriceRule {
  dayType: "weekday" | "weekend";
  startHour: number;
  endHour: number;
  price: number;
  label: string;
}

const PRICE_RULES: PriceRule[] = [
  { dayType: "weekday", startHour: 6, endHour: 14, price: 14, label: "Mo-Fr Vormittag" },
  { dayType: "weekday", startHour: 14, endHour: 17, price: 16, label: "Mo-Fr Nachmittag" },
  { dayType: "weekday", startHour: 17, endHour: 22, price: 19, label: "Mo-Fr Abend" },
  { dayType: "weekday", startHour: 22, endHour: 24, price: 14, label: "Mo-Fr Spät" },
  { dayType: "weekend", startHour: 6, endHour: 19, price: 14, label: "Sa/So Tagsüber" },
  { dayType: "weekend", startHour: 19, endHour: 24, price: 17, label: "Sa/So Abend" },
];

const DOPPELPACK_RULES = [
  { startHour: 6, endHour: 8, price: 24, label: "Doppelpack Früh (2 Std.)" },
  { startHour: 22, endHour: 24, price: 24, label: "Doppelpack Spät (2 Std.)" },
];

function getPriceForSlot(hour: number, dayOfWeek: number): { price: number; label: string } {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dayType = isWeekend ? "weekend" : "weekday";

  for (const rule of PRICE_RULES) {
    if (rule.dayType === dayType && hour >= rule.startHour && hour < rule.endHour) {
      return { price: rule.price, label: rule.label };
    }
  }
  return { price: 14, label: "Standard" };
}

function generateTimeSlots(date: Date, courtIndex: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dayOfWeek = date.getDay();
  const seed = date.getDate() + courtIndex * 7;

  for (let hour = 6; hour < 24; hour++) {
    const timeStr = `${hour.toString().padStart(2, "0")}:00`;
    const { price, label } = getPriceForSlot(hour, dayOfWeek);

    const hash = (seed * 31 + hour * 17) % 100;
    const available = hash > 15;

    const isDoppelpack = DOPPELPACK_RULES.some(
      (r) => hour >= r.startHour && hour < r.endHour
    );

    slots.push({ time: timeStr, price, available, label, isDoppelpack });
  }
  return slots;
}

function generateCourts(date: Date, courtExperiences: any[]): Court[] {
  const courtImages = [tennisImg1, tennisImg2, tennisImg3, tennisImg4];
  const courtDefs = [
    { name: "Hallenplatz 1", type: "indoor" as const },
    { name: "Außenplatz 2", type: "outdoor" as const },
    { name: "Außenplatz 3", type: "outdoor" as const },
  ];

  return courtDefs.map((def, idx) => ({
    id: courtExperiences[idx]?.id || idx + 1,
    name: def.name,
    type: def.type,
    image: courtImages[idx % courtImages.length],
    timeSlots: generateTimeSlots(date, idx),
  }));
}

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function TennisBookingSystem({ experience, partnerName, courts: courtExperiences, onBooking }: TennisBookingSystemProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [expandedCourt, setExpandedCourt] = useState<number | null>(null);
  const [showPriceTable, setShowPriceTable] = useState(false);

  const courts = useMemo(() => generateCourts(selectedDate, courtExperiences), [selectedDate, courtExperiences]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    let startDay = getDay(start);
    startDay = startDay === 0 ? 6 : startDay - 1;

    const paddedDays: (Date | null)[] = Array(startDay).fill(null);
    days.forEach((d) => paddedDays.push(d));

    while (paddedDays.length % 7 !== 0) {
      paddedDays.push(null);
    }

    return paddedDays;
  }, [currentMonth]);

  const selectedCourtData = courts.find((c) => c.id === selectedCourt);
  const selectedSlot = selectedCourtData?.timeSlots.find((s) => s.time === selectedTime);
  const totalPrice = selectedSlot ? selectedSlot.price : 0;

  const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;

  const handleBooking = () => {
    if (!selectedCourt || !selectedTime || !selectedDate) return;
    onBooking({
      courtId: selectedCourt,
      courtName: selectedCourtData?.name,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      duration: 60,
      totalPrice,
      sport: "Tennis",
      activityType: "tennis",
    });
  };

  const handleDateSelect = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return;
    setSelectedDate(date);
    setSelectedTime(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img src={tennisImg1} alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a3150] via-[#1a3150]/95 to-[#1a3150]/80" />
          </div>
          <div className="relative p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#96bc42]/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🎾</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{partnerName}</h2>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{experience?.location || "Hohenstein, 58453 Witten"}</span>
                </div>
              </div>
            </div>
            <p className="text-[#96bc42] text-sm font-medium mt-1">365 Tage Tennis</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-[#96bc42]/10 text-[#96bc42] border-[#96bc42]/30 px-3 py-1.5">
              🎾 Tennis · 3 Plätze
            </Badge>
            <Badge variant="outline" className="bg-white text-gray-600 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 mr-1" />
              60 Min. pro Buchung
            </Badge>
            <Badge variant="outline" className="bg-white text-gray-600 px-3 py-1.5">
              <Users className="h-3.5 w-3.5 mr-1" />
              max. 2 Spieler
            </Badge>
            <button
              onClick={() => setShowPriceTable(!showPriceTable)}
              className="text-sm text-[#1a3150] hover:text-[#96bc42] font-medium underline underline-offset-2 transition-colors"
            >
              {showPriceTable ? "Preistabelle ausblenden" : "Preistabelle anzeigen"}
            </button>
          </div>

          {showPriceTable && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-[#1a3150] px-3 py-2">
                  <p className="text-white text-sm font-semibold">Montag – Freitag</p>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="flex justify-between px-3 py-2 text-sm">
                    <span className="text-gray-600">06:00 – 14:00</span>
                    <span className="font-semibold text-[#1a3150]">€ 14,–</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 text-sm">
                    <span className="text-gray-600">14:00 – 17:00</span>
                    <span className="font-semibold text-[#1a3150]">€ 16,–</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 text-sm">
                    <span className="text-gray-600">17:00 – 22:00</span>
                    <span className="font-semibold text-[#1a3150]">€ 19,–</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 text-sm">
                    <span className="text-gray-600">22:00 – 24:00</span>
                    <span className="font-semibold text-[#1a3150]">€ 14,–</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-3">
                  <div className="bg-[#96bc42] px-3 py-2">
                    <p className="text-white text-sm font-semibold">Samstag / Sonntag</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <div className="flex justify-between px-3 py-2 text-sm">
                      <span className="text-gray-600">06:00 – 19:00</span>
                      <span className="font-semibold text-[#1a3150]">€ 14,–</span>
                    </div>
                    <div className="flex justify-between px-3 py-2 text-sm">
                      <span className="text-gray-600">19:00 – 24:00</span>
                      <span className="font-semibold text-[#1a3150]">€ 17,–</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-[#96bc42]/30 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#1a3150] to-[#96bc42] px-3 py-2">
                    <p className="text-white text-sm font-semibold">Doppelpack (2 Std.)</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <div className="flex justify-between px-3 py-2 text-sm">
                      <span className="text-gray-600">06:00 – 08:00</span>
                      <span className="font-semibold text-[#96bc42]">€ 24,–</span>
                    </div>
                    <div className="flex justify-between px-3 py-2 text-sm">
                      <span className="text-gray-600">22:00 – 24:00</span>
                      <span className="font-semibold text-[#96bc42]">€ 24,–</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              </button>
              <h3 className="text-sm font-semibold text-gray-800">{format(currentMonth, "MMMM yyyy", { locale: de })}</h3>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {WEEKDAY_LABELS.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-400 py-1.5">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="h-9" />;
                const isPast = isBefore(day, startOfDay(new Date()));
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);
                const inMonth = isSameMonth(day, currentMonth);
                const dayIsWeekend = day.getDay() === 0 || day.getDay() === 6;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateSelect(day)}
                    disabled={isPast}
                    className={`h-9 rounded-lg text-sm font-medium transition-all
                      ${!inMonth ? "text-gray-300" : ""}
                      ${isPast ? "text-gray-300 cursor-not-allowed" : "hover:bg-[#96bc42]/10 cursor-pointer"}
                      ${isSelected ? "bg-[#1a3150] text-white hover:bg-[#1a3150]/90 shadow-sm" : ""}
                      ${isCurrentDay && !isSelected ? "border border-[#96bc42] text-[#96bc42]" : ""}
                      ${dayIsWeekend && !isSelected && !isPast ? "text-[#96bc42] font-semibold" : ""}
                    `}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Ausgewählt:</p>
              <p className="text-sm font-semibold text-gray-800">
                {format(selectedDate, "EEEE, dd. MMMM yyyy", { locale: de })}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {isWeekend ? "Wochenendtarif" : "Wochentagstarif"}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-3 h-3 rounded bg-[#96bc42]/20 border border-[#96bc42]/40" />
                <span>Wochenende</span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Verfügbare Plätze – {format(selectedDate, "dd.MM.yyyy")}
              <span className="text-xs text-gray-400 ml-2">({isWeekend ? "Wochenende" : "Werktag"})</span>
            </h3>

            {courts.map((court) => {
              const isExpanded = expandedCourt === court.id;
              const availableSlots = court.timeSlots.filter((s) => s.available);
              const cheapestPrice = availableSlots.length > 0 ? Math.min(...availableSlots.map((s) => s.price)) : 0;

              return (
                <div key={court.id} className="mb-3 border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => {
                      setExpandedCourt(isExpanded ? null : court.id);
                      if (!isExpanded) setSelectedCourt(court.id);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 transition-colors ${
                      isExpanded ? "bg-[#1a3150]/5 border-b border-[#1a3150]/10" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={court.image} alt={court.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">{court.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                            court.type === "indoor" 
                              ? "bg-blue-50 text-blue-600 border-blue-200" 
                              : "bg-green-50 text-green-600 border-green-200"
                          }`}>
                            {court.type === "indoor" ? "Halle" : "Outdoor"}
                          </Badge>
                          <span className="text-xs text-gray-500">{availableSlots.length} Zeiten frei</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#96bc42]">
                        {availableSlots.length > 0 ? `ab ${cheapestPrice}€/Std.` : "ausgebucht"}
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-3.5 bg-white">
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {court.timeSlots.map((slot) => {
                          const isSlotSelected = selectedCourt === court.id && selectedTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              onClick={() => {
                                if (!slot.available) return;
                                setSelectedCourt(court.id);
                                setSelectedTime(slot.time);
                              }}
                              disabled={!slot.available}
                              className={`relative flex flex-col items-center p-2.5 rounded-lg text-center transition-all border
                                ${!slot.available
                                  ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                                  : isSlotSelected
                                    ? "bg-[#1a3150] border-[#1a3150] text-white shadow-md scale-[1.02]"
                                    : slot.isDoppelpack
                                      ? "bg-gradient-to-b from-[#96bc42]/5 to-white border-[#96bc42]/30 hover:border-[#96bc42] hover:bg-[#96bc42]/10 cursor-pointer"
                                      : "bg-white border-gray-200 hover:border-[#96bc42]/50 hover:bg-[#96bc42]/5 cursor-pointer"
                                }
                              `}
                            >
                              <span className={`text-xs font-bold ${
                                !slot.available ? "text-gray-300" : isSlotSelected ? "text-white" : "text-gray-800"
                              }`}>
                                {slot.time}
                              </span>
                              <span className={`text-[11px] font-semibold mt-0.5 ${
                                !slot.available ? "text-gray-300" : isSlotSelected ? "text-gray-200" : "text-[#96bc42]"
                              }`}>
                                {slot.price}€
                              </span>
                              {slot.isDoppelpack && !isSlotSelected && slot.available && (
                                <span className="text-[9px] text-[#96bc42] mt-0.5 font-medium">Doppelpack</span>
                              )}
                              {isSlotSelected && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#96bc42] rounded-full flex items-center justify-center shadow">
                                  <Check className="h-2.5 w-2.5 text-white" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {selectedCourt && selectedTime && (
          <div className="p-4 sm:p-5 border-t border-gray-200 bg-gradient-to-r from-[#1a3150]/5 to-[#96bc42]/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Ihre Buchung</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-[#1a3150] text-white">
                    {selectedCourtData?.name}
                  </Badge>
                  <Badge variant="outline" className="text-gray-600">
                    {format(selectedDate, "dd.MM.yyyy")}
                  </Badge>
                  <Badge variant="outline" className="text-gray-600">
                    {selectedTime} Uhr
                  </Badge>
                  <Badge variant="outline" className="text-gray-600">
                    60 Min.
                  </Badge>
                  <Badge variant="outline" className="text-gray-500 text-xs">
                    max. 2 Spieler
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Platzmiete / Std.</p>
                  <p className="text-2xl font-bold text-[#1a3150]">{totalPrice.toFixed(2)}€</p>
                </div>
                <Button
                  onClick={handleBooking}
                  size="lg"
                  className="bg-[#96bc42] hover:bg-[#86ac32] text-white px-8 shadow-md"
                >
                  Jetzt buchen
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
