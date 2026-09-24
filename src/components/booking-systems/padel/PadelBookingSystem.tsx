import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, MapPin, Clock, Users, ChevronDown, ChevronUp, Check } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, getDay, isToday, isBefore, startOfDay } from "date-fns";
import { de } from "date-fns/locale";

interface TimeSlot {
  time: string;
  price: number;
  available: boolean;
}

interface Court {
  id: number;
  name: string;
  sport: string;
  timeSlots: TimeSlot[];
}

interface PadelBookingSystemProps {
  experience: any;
  partnerName: string;
  courts: any[];
  onBooking: (bookingData: any) => void;
}

const DURATIONS = [
  { value: "60", label: "60 Min." },
  { value: "90", label: "90 Min." },
  { value: "120", label: "120 Min." },
];

function generateTimeSlots(date: Date, courtIndex: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const seed = date.getDate() + courtIndex * 7;

  for (let hour = 8; hour <= 22; hour++) {
    for (let min = 0; min < 60; min += 30) {
      if (hour === 22 && min === 30) continue;
      const timeStr = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;

      let price: number;
      if (hour < 12) {
        price = isWeekend ? 35 : 30;
      } else if (hour < 16) {
        price = isWeekend ? 40 : 35;
      } else if (hour < 18) {
        price = isWeekend ? 55 : 50;
      } else {
        price = isWeekend ? 50 : 40;
      }

      const hash = (seed * 31 + hour * 17 + min) % 100;
      const available = hash > 20;

      slots.push({ time: timeStr, price, available });
    }
  }
  return slots;
}

function generateCourts(date: Date, courtExperiences: any[]): Court[] {
  return courtExperiences.map((exp, idx) => ({
    id: exp.id || idx + 1,
    name: exp.title?.replace(/ - Padel$/, '') || `padelBOX ${idx + 1}`,
    sport: "Padel",
    timeSlots: generateTimeSlots(date, idx),
  }));
}

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function PadelBookingSystem({ experience, partnerName, courts: courtExperiences, onBooking }: PadelBookingSystemProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDuration, setSelectedDuration] = useState("60");
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [expandedCourt, setExpandedCourt] = useState<number | null>(null);

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

  const durationMultiplier = parseInt(selectedDuration) / 60;
  const totalPrice = selectedSlot ? selectedSlot.price * durationMultiplier : 0;

  const handleBooking = () => {
    if (!selectedCourt || !selectedTime || !selectedDate) return;
    onBooking({
      courtId: selectedCourt,
      courtName: selectedCourtData?.name,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      duration: parseInt(selectedDuration),
      totalPrice,
      sport: "Padel",
      activityType: "padeltennis",
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
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">🎾</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{partnerName}</h2>
              <div className="flex items-center gap-2 text-emerald-100 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                <span>{experience?.location || "Köln-Weiden"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-700">{partnerName}</span>
            </div>

            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger className="w-[130px] bg-white border-gray-200">
                <Clock className="h-4 w-4 text-gray-400 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1.5">
              🎾 Padel
            </Badge>

            <Badge variant="outline" className="bg-white text-gray-600 px-3 py-1.5">
              Einzelner Court
            </Badge>
          </div>
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

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateSelect(day)}
                    disabled={isPast}
                    className={`h-9 rounded-lg text-sm font-medium transition-all
                      ${!inMonth ? "text-gray-300" : ""}
                      ${isPast ? "text-gray-300 cursor-not-allowed" : "hover:bg-emerald-50 cursor-pointer"}
                      ${isSelected ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm" : ""}
                      ${isCurrentDay && !isSelected ? "border border-emerald-400 text-emerald-600" : ""}
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
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Verfügbare Zeitfenster – {format(selectedDate, "dd.MM.yyyy")}
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
                      isExpanded ? "bg-emerald-50 border-b border-emerald-100" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        isExpanded ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {court.id - (courtExperiences[0]?.id || 0) + 1}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">{court.name}</p>
                        <p className="text-xs text-gray-500">
                          {court.sport} · {availableSlots.length} verfügbar
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-emerald-600">
                        {availableSlots.length > 0 ? `ab ${cheapestPrice}€` : "ausgebucht"}
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-3.5 bg-white">
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6 gap-2">
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
                              className={`relative flex flex-col items-center p-2 rounded-lg text-center transition-all border
                                ${!slot.available
                                  ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                                  : isSlotSelected
                                    ? "bg-red-500 border-red-500 text-white shadow-md scale-[1.02]"
                                    : "bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                                }
                              `}
                            >
                              <span className={`text-xs font-bold ${
                                !slot.available ? "text-gray-300" : isSlotSelected ? "text-white" : "text-gray-800"
                              }`}>
                                {slot.time}
                              </span>
                              <span className={`text-[11px] font-semibold mt-0.5 ${
                                !slot.available ? "text-gray-300" : isSlotSelected ? "text-red-100" : "text-emerald-600"
                              }`}>
                                {slot.price}€
                              </span>
                              {isSlotSelected && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow">
                                  <Check className="h-2.5 w-2.5 text-red-500" />
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
          <div className="p-4 sm:p-5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-emerald-50/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Ihre Auswahl</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    {selectedCourtData?.name}
                  </Badge>
                  <Badge variant="outline" className="text-gray-600">
                    {format(selectedDate, "dd.MM.yyyy")}
                  </Badge>
                  <Badge variant="outline" className="text-gray-600">
                    {selectedTime} Uhr
                  </Badge>
                  <Badge variant="outline" className="text-gray-600">
                    {selectedDuration} Min.
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Gesamtpreis</p>
                  <p className="text-2xl font-bold text-emerald-700">{totalPrice.toFixed(2)}€</p>
                </div>
                <Button
                  onClick={handleBooking}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 shadow-md"
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
