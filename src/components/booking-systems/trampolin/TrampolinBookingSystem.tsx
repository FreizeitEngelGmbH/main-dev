import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, ArrowLeft, Clock, Calendar } from "lucide-react";
// MISSING ASSET: the source imports @assets/image_1772483333827.png, which does not exist in EngelFolder either;
// uses the current image helper's local trampoline placeholder instead.
import { getGroupActivityImage } from "@/lib/group-activity-images";
const jumpSocksImg = getGroupActivityImage({ category: "trampolin" });

interface TrampolinBookingSystemProps {
  offer: {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    duration: string;
    maxParticipants: number;
    includes: string[];
    timeSlots: string[];
  };
  selectedDate: string;
  selectedTime: string;
  onBooking: (bookingData: any) => void;
}

const TIME_SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00",
  "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00",
  "17:30", "18:00", "18:30", "19:00"
];

const WEEKDAYS = ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."];
const MONTHS = ["JANUAR", "FEBRUAR", "MÄRZ", "APRIL", "MAI", "JUNI", "JULI", "AUGUST", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DEZEMBER"];

function getWeekDays(startDate: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function TrampolinBookingSystem({ offer, selectedDate, selectedTime, onBooking }: TrampolinBookingSystemProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(today);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  });

  const [chosenDate, setChosenDate] = useState<Date>(today);
  const [chosenTime, setChosenTime] = useState<string>("");
  const [ticketCount, setTicketCount] = useState(1);
  const [socksCount, setSocksCount] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const durationMatch = offer.title.match(/(\d+)\s*Min/i);
  const duration = durationMatch ? parseInt(durationMatch[1]) : 60;

  const ticketPrice = offer.price;
  const socksPrice = 3.0;
  const totalPrice = (ticketCount * ticketPrice) + (socksCount * socksPrice);

  const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

  const isPast = (d: Date) => d < today;

  const handlePrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    if (d >= today || getWeekDays(d).some(day => day >= today)) {
      setWeekStart(d);
    }
  };

  const handleNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const handleBooking = () => {
    onBooking({
      offerTitle: offer.title,
      date: formatDate(chosenDate),
      time: chosenTime,
      tickets: ticketCount,
      jumpsocks: socksCount,
      totalPrice,
      activityType: 'trampolinhalle'
    });
  };

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen">
      <div className="p-4 border-b flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          Y
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{offer.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ab 2 Jahren | {duration} Min. Zugang zu allen Sprungstraßen
          </p>
          <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-1">
            Weiterlesen
          </button>
        </div>
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white p-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Jump Ticket</div>
            <div className="text-lg font-black leading-none mt-0.5">{duration} MIN.</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Datum auswählen</h2>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
          >
            <Calendar className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          {MONTHS[weekDays[0].getMonth()]} {weekDays[0].getFullYear()}
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevWeek}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 flex-shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex-1 grid grid-cols-7 gap-1">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, chosenDate);
              const isDisabled = isPast(day);
              const isToday = isSameDay(day, today);
              return (
                <button
                  key={day.toISOString()}
                  disabled={isDisabled}
                  onClick={() => { setChosenDate(day); setChosenTime(""); }}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-md'
                      : isDisabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={`text-[10px] font-medium uppercase ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>
                    {WEEKDAYS[day.getDay()]}
                  </span>
                  <span className={`text-lg font-bold mt-0.5 ${isSelected ? 'text-white' : ''}`}>
                    {day.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextWeek}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 flex-shrink-0"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4 pt-2">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Termin wählen</h2>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {TIME_SLOTS.map((time) => {
            const isSelected = chosenTime === time;
            return (
              <button
                key={time}
                onClick={() => setChosenTime(time)}
                className={`py-2.5 px-2 rounded-lg text-sm font-medium transition-all border ${
                  isSelected
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 pt-2">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tickets auswählen</h2>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-semibold text-gray-900">{offer.title}</p>
            <p className="text-gray-500 text-sm">{ticketPrice.toFixed(2).replace('.', ',')} €</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
              className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
              {ticketCount}
            </span>
            <button
              onClick={() => setTicketCount(ticketCount + 1)}
              className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 pt-2">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Zusatzoptionen</h2>

        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide">Jumpsocken</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Beim Springen ist ein Paar rutschfester Socken verpflichtet. Du hast die Möglichkeit, eigene Stoppersocken mitzubringen oder welche vor Ort zu erwerben.
              </p>
            </div>
            <div className="w-16 h-16 flex-shrink-0">
              <img src={jumpSocksImg} alt="Jumpsocken" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Jumpsocken</p>
              <p className="text-gray-500 text-sm">{socksPrice.toFixed(2).replace('.', ',')} €</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSocksCount(Math.max(0, socksCount - 1))}
                className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className={`w-10 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                socksCount > 0 ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {socksCount}
              </span>
              <button
                onClick={() => setSocksCount(socksCount + 1)}
                className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-24" />

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Gesamtsumme Warenkorb</p>
            <p className="text-lg font-bold text-gray-900">{totalPrice.toFixed(2).replace('.', ',')} €</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
            >
              Weiter einkaufen
            </button>
            <Button
              onClick={handleBooking}
              disabled={!chosenTime}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md"
            >
              Kasse
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
