import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft, ChevronRight, Clock, Users, User, UserMinus,
  Calendar, CheckCircle, Mail, Phone, Info, Zap, Trophy
} from "lucide-react";

interface Experience {
  id: number;
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

interface GoKartBookingSystemProps {
  experiences: Experience[];
  partnerName: string;
  partnerEmail?: string;
  onBooking: (bookingData: any) => void;
}

type Step = "spieler" | "datum" | "zeit" | "daten";

const WEEKDAY_SLOTS = [
  "14:00", "14:15", "14:30", "14:45",
  "15:00", "15:15", "15:30", "15:45",
  "16:00", "16:15", "16:30", "16:45",
  "17:00", "17:15", "17:30", "17:45",
  "18:00", "18:15", "18:30", "18:45",
  "19:00", "19:15", "19:30", "19:45",
  "20:00", "20:15", "20:30", "20:45",
];

const WEEKEND_SLOTS = [
  "10:00", "10:15", "10:30", "10:45",
  "11:00", "11:15", "11:30", "11:45",
  "12:00", "12:15", "12:30", "12:45",
  "13:00", "13:15", "13:30", "13:45",
  "14:00", "14:15", "14:30", "14:45",
  "15:00", "15:15", "15:30", "15:45",
  "16:00", "16:15", "16:30", "16:45",
  "17:00", "17:15", "17:30", "17:45",
  "18:00", "18:15", "18:30", "18:45",
  "19:00", "19:15", "19:30", "19:45",
  "20:00", "20:15", "20:30", "20:45",
  "21:00", "21:15",
];

const MONTH_NAMES = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const DAY_NAMES = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function isWeekday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day >= 1 && day <= 4;
}

function isWeekend(dateStr: string): boolean {
  return !isWeekday(dateStr);
}

function getPriceForDay(experiences: Experience[], dateStr: string): { adultPrice: number; childPrice: number; adultExp: Experience | null; childExp: Experience | null } {
  const weekday = isWeekday(dateStr);

  const adultWeekday = experiences.find(e => e.title.includes('Mo-Do') && !e.title.includes('Gruppe') && !e.title.includes('Kind'));
  const adultWeekend = experiences.find(e => !e.title.includes('Mo-Do') && !e.title.includes('Gruppe') && !e.title.includes('Kind') && e.title.includes('Erwachsene'));
  const childWeekday = experiences.find(e => e.title.includes('Mo-Do') && !e.title.includes('Gruppe') && e.title.includes('Kind'));
  const childWeekend = experiences.find(e => !e.title.includes('Mo-Do') && !e.title.includes('Gruppe') && e.title.includes('Kind'));

  if (weekday) {
    return {
      adultPrice: adultWeekday?.price || adultWeekend?.price || 19,
      childPrice: childWeekday?.price || childWeekend?.price || 16,
      adultExp: adultWeekday || adultWeekend || null,
      childExp: childWeekday || childWeekend || null
    };
  }
  return {
    adultPrice: adultWeekend?.price || 22,
    childPrice: childWeekend?.price || 19,
    adultExp: adultWeekend || null,
    childExp: childWeekend || null
  };
}

export default function GoKartBookingSystem({ experiences, partnerName, partnerEmail, onBooking }: GoKartBookingSystemProps) {
  const [step, setStep] = useState<Step>("spieler");
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [email, setEmail] = useState("");
  const [handy, setHandy] = useState("");

  const totalPlayers = adults + children;

  const pricing = useMemo(() => {
    if (!selectedDate) {
      const today = new Date().toISOString().split("T")[0];
      return getPriceForDay(experiences, today);
    }
    return getPriceForDay(experiences, selectedDate);
  }, [selectedDate, experiences]);

  const totalPrice = (adults * pricing.adultPrice) + (children * pricing.childPrice);

  const isGroupDiscount = totalPlayers >= 10;
  const discountedTotal = isGroupDiscount ? Math.round(totalPrice * 0.9 * 100) / 100 : totalPrice;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const days: { date: Date; inMonth: boolean }[] = [];

    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(calendarYear, calendarMonth, -i);
      days.push({ date: d, inMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(calendarYear, calendarMonth, i), inMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(calendarYear, calendarMonth + 1, i), inMonth: false });
    }
    return days;
  }, [calendarMonth, calendarYear]);

  const timeSlots = useMemo(() => {
    if (!selectedDate) return WEEKDAY_SLOTS;
    return isWeekend(selectedDate) ? WEEKEND_SLOTS : WEEKDAY_SLOTS;
  }, [selectedDate]);

  const canGoToDate = totalPlayers > 0;
  const canGoToTime = canGoToDate && selectedDate;
  const canGoToData = canGoToTime && selectedTime;
  const canBook = canGoToData && vorname && nachname && email && handy;

  const prevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
    else setCalendarMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
    else setCalendarMonth(m => m + 1);
  };

  const handleBooking = () => {
    const mainExp = pricing.adultExp || experiences[0];
    onBooking({
      ticketTitle: mainExp?.title || 'GoKart Session',
      ticketId: mainExp?.id || experiences[0]?.id,
      date: selectedDate,
      time: selectedTime,
      participantCount: totalPlayers,
      adults,
      children,
      totalPrice: discountedTotal,
      isGroupDiscount,
      contact: { vorname, nachname, email, handy },
      activityType: "gokart"
    });
  };

  const steps: { id: Step; label: string; icon: any }[] = [
    { id: "spieler", label: "SPIELER", icon: Users },
    { id: "datum", label: "DATUM", icon: Calendar },
    { id: "zeit", label: "ZEIT", icon: Clock },
    { id: "daten", label: "BUCHEN", icon: CheckCircle },
  ];

  const stepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Zap className="h-5 w-5" />
          <h3 className="text-lg font-black tracking-wide">{partnerName}</h3>
        </div>
        {partnerEmail && <p className="text-purple-200 text-xs mt-1">{partnerEmail}</p>}
      </div>

      <div className="flex">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isPast = i < stepIndex;
          return (
            <button
              key={s.id}
              onClick={() => {
                if (s.id === "spieler") setStep("spieler");
                if (s.id === "datum" && canGoToDate) setStep("datum");
                if (s.id === "zeit" && canGoToTime) setStep("zeit");
                if (s.id === "daten" && canGoToData) setStep("daten");
              }}
              className={`flex-1 py-3 text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                isActive
                  ? "bg-purple-500 text-white"
                  : isPast
                    ? "bg-slate-700 text-purple-400"
                    : "bg-slate-800 text-slate-500"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-5">
        {step === "spieler" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white tracking-wide">PREISE</h2>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-800 border-2 border-purple-500/30 rounded-xl p-4">
                <div className="text-center mb-3">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-black tracking-wider">
                    WOCHENTAGS
                  </span>
                  <p className="text-slate-400 text-xs mt-1">(Montag – Donnerstag)</p>
                </div>
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-slate-400 text-xs font-semibold">Erwachsene</p>
                    <p className="text-xs text-slate-500">(ab 16 J)</p>
                    <p className="text-3xl font-black text-purple-400 mt-1">
                      {(getPriceForDay(experiences, (() => { const d = new Date(); while(d.getDay() === 0 || d.getDay() === 5 || d.getDay() === 6) d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; })()).adultPrice).toFixed(2).replace(".", ",")}€
                    </p>
                  </div>
                  <div className="text-center text-slate-500">
                    <p className="text-xs font-bold">pro Session</p>
                    <p className="text-[10px] mt-1">★ 15 Min inkl. Boarding</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-xs font-semibold">Kinder</p>
                    <p className="text-xs text-slate-500">(unter 15 J)</p>
                    <p className="text-3xl font-black text-purple-400 mt-1">
                      {(getPriceForDay(experiences, (() => { const d = new Date(); while(d.getDay() === 0 || d.getDay() === 5 || d.getDay() === 6) d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; })()).childPrice).toFixed(2).replace(".", ",")}€
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 border-2 border-purple-500/30 rounded-xl p-4">
                <div className="text-center mb-3">
                  <span className="bg-gradient-to-r from-purple-600 to-violet-500 text-white px-4 py-1 rounded-full text-sm font-black tracking-wider">
                    WOCHENENDE & FEIERTAGE
                  </span>
                  <p className="text-slate-400 text-xs mt-1">(Freitag – Sonntag)</p>
                </div>
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-slate-400 text-xs font-semibold">Erwachsene</p>
                    <p className="text-xs text-slate-500">(ab 16 J)</p>
                    <p className="text-3xl font-black text-purple-400 mt-1">
                      {(getPriceForDay(experiences, (() => { const d = new Date(); while(d.getDay() !== 6) d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; })()).adultPrice).toFixed(2).replace(".", ",")}€
                    </p>
                  </div>
                  <div className="text-center text-slate-500">
                    <p className="text-xs font-bold">pro Session</p>
                    <p className="text-[10px] mt-1">★ 15 Min inkl. Boarding</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-xs font-semibold">Kinder</p>
                    <p className="text-xs text-slate-500">(unter 15 J)</p>
                    <p className="text-3xl font-black text-purple-400 mt-1">
                      {(getPriceForDay(experiences, (() => { const d = new Date(); while(d.getDay() !== 6) d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; })()).childPrice).toFixed(2).replace(".", ",")}€
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <Trophy className="h-4 w-4 text-purple-400 flex-shrink-0" />
                <p className="text-purple-300 text-xs font-semibold">
                  10% Rabatt für Gruppen ab 10 Personen – wird automatisch berechnet!
                </p>
              </div>

              <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <Info className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                <p className="text-yellow-300 text-xs">
                  Mindestgröße: 1,45m. Bitte 15 Min vor der Session für das Safety-Briefing erscheinen.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-bold text-center text-sm tracking-wider">ANZAHL SPIELER</h3>

              <div className="flex items-center justify-between bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <User className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Erwachsene</p>
                    <p className="text-slate-400 text-xs">ab 16 Jahre</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAdults(Math.max(0, adults - 1))}
                    className="w-10 h-10 rounded-lg bg-slate-700 text-white font-bold text-xl hover:bg-slate-600 transition-all flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="text-white font-black text-xl w-8 text-center">{adults}</span>
                  <button
                    onClick={() => setAdults(adults + 1)}
                    className="w-10 h-10 rounded-lg bg-purple-500 text-white font-bold text-xl hover:bg-purple-600 transition-all flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <UserMinus className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Kinder</p>
                    <p className="text-slate-400 text-xs">unter 15 Jahre</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="w-10 h-10 rounded-lg bg-slate-700 text-white font-bold text-xl hover:bg-slate-600 transition-all flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="text-white font-black text-xl w-8 text-center">{children}</span>
                  <button
                    onClick={() => setChildren(children + 1)}
                    className="w-10 h-10 rounded-lg bg-purple-500 text-white font-bold text-xl hover:bg-purple-600 transition-all flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep("datum")}
              disabled={!canGoToDate}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-black py-6 text-lg tracking-wider disabled:opacity-40"
            >
              WEITER <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}

        {step === "datum" && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white tracking-wide">DATUM WÄHLEN</h2>
            </div>

            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="text-slate-400 hover:text-white transition-colors p-2">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="text-white font-black text-lg">
                  {MONTH_NAMES[calendarMonth]} {calendarYear}
                </h3>
                <button onClick={nextMonth} className="text-slate-400 hover:text-white transition-colors p-2">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_NAMES.map(d => (
                  <div key={d} className="text-center text-xs font-black text-slate-500 py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  const dateStr = day.date.toISOString().split("T")[0];
                  const isPast = day.date < today;
                  const isSelected = dateStr === selectedDate;
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  const dayOfWeek = day.date.getDay();
                  const isFriday = dayOfWeek === 5;
                  const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;

                  return (
                    <button
                      key={i}
                      onClick={() => !isPast && day.inMonth && setSelectedDate(dateStr)}
                      disabled={isPast || !day.inMonth}
                      className={`
                        aspect-square rounded-lg text-sm font-bold transition-all flex items-center justify-center
                        ${!day.inMonth ? 'text-slate-700 cursor-default' : ''}
                        ${isPast && day.inMonth ? 'text-slate-600 cursor-not-allowed' : ''}
                        ${isSelected ? 'bg-purple-500 text-white ring-2 ring-purple-400 scale-110' : ''}
                        ${isToday && !isSelected ? 'bg-green-600/30 text-green-400 ring-1 ring-green-500/50' : ''}
                        ${!isPast && day.inMonth && !isSelected && !isToday && isFriday ? 'text-green-400 hover:bg-slate-700' : ''}
                        ${!isPast && day.inMonth && !isSelected && !isToday && isWeekendDay ? 'text-purple-400 hover:bg-slate-700' : ''}
                        ${!isPast && day.inMonth && !isSelected && !isToday && !isFriday && !isWeekendDay ? 'text-slate-300 hover:bg-slate-700' : ''}
                      `}
                    >
                      {day.date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-4 mt-3 text-[10px]">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-slate-400">Heute</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-slate-400">Wochenende</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-400">Wochentag</span>
                </div>
              </div>
            </div>

            {selectedDate && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
                <p className="text-purple-300 text-sm font-semibold">
                  {new Date(selectedDate).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  {isWeekday(selectedDate) ? 'Wochentags-Preise' : 'Wochenend-Preise'} • {adults} Erw. × {pricing.adultPrice.toFixed(2).replace('.', ',')}€ {children > 0 ? `+ ${children} Kind × ${pricing.childPrice.toFixed(2).replace('.', ',')}€` : ''}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setStep("spieler")}
                variant="outline"
                className="flex-1 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 py-5"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> ZURÜCK
              </Button>
              <Button
                onClick={() => setStep("zeit")}
                disabled={!canGoToTime}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-black py-5 tracking-wider disabled:opacity-40"
              >
                WEITER <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === "zeit" && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white tracking-wide">ZEITSLOT WÄHLEN</h2>
              <p className="text-slate-400 text-xs mt-1">
                📅 {selectedDate && new Date(selectedDate).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-600" />
                <span>Verfügbar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-purple-500" />
                <span>Ausgewählt</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 max-h-[320px] overflow-y-auto pr-1">
              {timeSlots.map(slot => {
                const isSelected = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`
                      py-3 px-2 rounded-lg text-sm font-bold transition-all border
                      ${isSelected
                        ? 'bg-purple-500 text-white border-purple-400 ring-2 ring-purple-400/50 scale-105'
                        : 'bg-green-700/30 text-green-300 border-green-600/30 hover:bg-green-600/40 hover:border-green-500/50'
                      }
                    `}
                  >
                    <Clock className="h-3 w-3 mx-auto mb-1 opacity-60" />
                    <span>{slot}</span>
                    <p className="text-[9px] mt-0.5 opacity-70">15 Min</p>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep("datum")}
                variant="outline"
                className="flex-1 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 py-5"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> ZURÜCK
              </Button>
              <Button
                onClick={() => setStep("daten")}
                disabled={!canGoToData}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-black py-5 tracking-wider disabled:opacity-40"
              >
                WEITER <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === "daten" && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white tracking-wide">ZUSAMMENFASSUNG</h2>
            </div>

            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">📅 Datum</span>
                <span className="text-white font-bold">
                  {selectedDate && new Date(selectedDate).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">🕐 Uhrzeit</span>
                <span className="text-white font-bold">{selectedTime} Uhr</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">⏱️ Dauer</span>
                <span className="text-white font-bold">15 Minuten</span>
              </div>
              <div className="border-t border-slate-700 my-2" />
              {adults > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">{adults}× Erwachsene</span>
                  <span className="text-purple-400 font-bold">{(adults * pricing.adultPrice).toFixed(2).replace(".", ",")}€</span>
                </div>
              )}
              {children > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">{children}× Kinder</span>
                  <span className="text-purple-400 font-bold">{(children * pricing.childPrice).toFixed(2).replace(".", ",")}€</span>
                </div>
              )}
              {isGroupDiscount && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-400">🎉 10% Gruppenrabatt</span>
                  <span className="text-green-400 font-bold">-{(totalPrice - discountedTotal).toFixed(2).replace(".", ",")}€</span>
                </div>
              )}
              <div className="border-t border-slate-700 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-white font-black text-lg">GESAMT</span>
                <span className="text-purple-400 font-black text-2xl">{discountedTotal.toFixed(2).replace(".", ",")}€</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-white font-bold text-sm tracking-wider text-center">KONTAKTDATEN</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-400 text-xs">Vorname *</Label>
                  <Input value={vorname} onChange={e => setVorname(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white mt-1" placeholder="Max" />
                </div>
                <div>
                  <Label className="text-slate-400 text-xs">Nachname *</Label>
                  <Input value={nachname} onChange={e => setNachname(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white mt-1" placeholder="Mustermann" />
                </div>
              </div>
              <div>
                <Label className="text-slate-400 text-xs flex items-center gap-1">
                  <Mail className="h-3 w-3" /> E-Mail *
                </Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email"
                  className="bg-slate-800 border-slate-600 text-white mt-1" placeholder="max@beispiel.de" />
              </div>
              <div>
                <Label className="text-slate-400 text-xs flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Telefon *
                </Label>
                <Input value={handy} onChange={e => setHandy(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white mt-1" placeholder="0176 12345678" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep("zeit")}
                variant="outline"
                className="flex-1 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 py-5"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> ZURÜCK
              </Button>
              <Button
                onClick={handleBooking}
                disabled={!canBook}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-black py-5 text-base tracking-wider disabled:opacity-40"
              >
                🏎️ JETZT BUCHEN
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
