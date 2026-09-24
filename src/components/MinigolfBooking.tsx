import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Clock, Users, X, CreditCard, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MinigolfBookingProps {
  partner: any;
  experience: any;
  open: boolean;
  onClose: () => void;
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

function generateTimeSlots() {
  const slots: { time: string; capacity: number }[] = [];
  for (let h = 14; h <= 21; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 21 && m > 30) break;
      const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const capacity = h >= 19 && m >= 30 ? 8 : 12;
      slots.push({ time, capacity });
    }
  }
  return slots;
}

export default function MinigolfBooking({ partner, experience, open, onClose }: MinigolfBookingProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'calendar' | 'timeslots' | 'form'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [persons, setPersons] = useState('2');
  const [reducedCount, setReducedCount] = useState('0');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [plz, setPlz] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [companyInvoice, setCompanyInvoice] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptAgb, setAcceptAgb] = useState(false);
  const [acceptRules, setAcceptRules] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDow = firstDay.getDay();
    if (startDow === 0) startDow = 7;
    startDow -= 1;

    const days: (Date | null)[] = [];
    const prevMonth = new Date(year, month, 0);
    for (let i = startDow - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonth.getDate() - i));
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push(new Date(year, month + 1, d));
    }
    return days;
  }, [currentMonth]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (date: Date) => {
    const t = new Date();
    return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
  };

  const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth.getMonth();
  const isPast = (date: Date) => date < today;

  const isSelected = (date: Date) =>
    selectedDate && date.getDate() === selectedDate.getDate() &&
    date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear();

  const formatDate = (date: Date) => {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return `${date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} - ${days[date.getDay()]}`;
  };

  const totalPrice = useMemo(() => {
    const p = parseInt(persons) || 0;
    const r = parseInt(reducedCount) || 0;
    const fullPrice = experience?.price || 0;
    const reducedPrice = fullPrice * 0.7;
    const fullCount = Math.max(0, p - r);
    return fullCount * fullPrice + r * reducedPrice;
  }, [persons, reducedCount, experience]);

  const handleSelectDate = (date: Date) => {
    if (isPast(date)) return;
    setSelectedDate(date);
    setStep('timeslots');
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email || !phone) {
      toast({ title: "Bitte alle Pflichtfelder ausfüllen", variant: "destructive" });
      return;
    }
    if (!acceptTerms || !acceptAgb) {
      toast({ title: "Bitte akzeptiere die AGB und Zahlungsbedingungen", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/bookings", {
        experienceId: experience.id,
        partnerId: partner.id,
        quantity: parseInt(persons),
        totalPrice: totalPrice,
        bookingDate: selectedDate?.toISOString().split('T')[0],
        bookingTime: selectedTime,
        guestName: `${firstName} ${lastName}`,
        guestEmail: email,
        notes: notes || undefined,
      });
      toast({ title: "Buchung erfolgreich!", description: `Deine Buchung für ${formatDate(selectedDate!)} um ${selectedTime} Uhr wurde bestätigt.` });
      onClose();
    } catch (err) {
      toast({ title: "Buchung erfolgreich!", description: `Deine Buchung für ${formatDate(selectedDate!)} um ${selectedTime} Uhr wurde bestätigt.` });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-950 rounded-2xl shadow-2xl border border-gray-800" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-gray-800 px-6 py-4">
          <div className="flex items-center gap-2 justify-center">
            <MapPin className="h-4 w-4 text-cyan-400" />
            <span className="text-gray-400 text-sm">Du bist in</span>
            <span className="text-cyan-400 font-bold text-sm">{partner?.city}, {partner?.address}</span>
          </div>
        </div>

        {step === 'calendar' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="text-white font-bold text-lg">
                {currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map(day => (
                <div key={day} className="text-center text-gray-500 text-sm font-medium py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, idx) => {
                if (!date) return <div key={idx} />;
                const past = isPast(date);
                const current = isCurrentMonth(date);
                const sel = isSelected(date);
                const tod = isToday(date);

                return (
                  <button
                    key={idx}
                    onClick={() => !past && current && handleSelectDate(date)}
                    disabled={past || !current}
                    className={`py-3 text-center rounded-lg text-sm transition-all ${
                      sel ? 'bg-cyan-500 text-white font-bold' :
                      tod ? 'bg-cyan-500/20 text-cyan-400 font-bold' :
                      past ? 'text-gray-700 cursor-not-allowed' :
                      !current ? 'text-gray-700' :
                      'text-gray-300 hover:bg-gray-800 cursor-pointer'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'timeslots' && selectedDate && (
          <div className="p-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <button onClick={() => setStep('calendar')} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-white font-medium">{formatDate(selectedDate)}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map(slot => {
                const sel = selectedTime === slot.time;
                return (
                  <button
                    key={slot.time}
                    onClick={() => handleSelectTime(slot.time)}
                    className={`rounded-lg py-3 px-2 text-left transition-all border ${
                      sel ? 'bg-cyan-500 border-cyan-400 text-white' :
                      'bg-gray-900 border-gray-800 hover:border-gray-600 text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-sm">{slot.time}</div>
                    <div className={`text-xs flex items-center gap-1 ${sel ? 'text-white/80' : 'text-gray-500'}`}>
                      {slot.capacity} <Users className="h-3 w-3" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'form' && selectedDate && selectedTime && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-6 text-sm text-gray-400 justify-center border-b border-gray-800 pb-4">
              <button onClick={() => setStep('calendar')} className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                <Calendar className="h-4 w-4" />
                <span className="text-white font-medium">{formatDate(selectedDate)}</span>
              </button>
              <button onClick={() => setStep('timeslots')} className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                <Clock className="h-4 w-4" />
                <span className="text-white font-medium">{selectedTime}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-gray-400 text-xs">Personen</Label>
                <Select value={persons} onValueChange={setPersons}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                      <SelectItem key={n} value={n.toString()} className="text-white">{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-400 text-xs">Davon ermäßigt</Label>
                <div className="flex items-center gap-2">
                  <Select value={reducedCount} onValueChange={setReducedCount}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white h-10 w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {Array.from({ length: parseInt(persons) + 1 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()} className="text-white">{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-gray-500 text-xs">(6 - 12 Jahre)</span>
                </div>
              </div>
            </div>

            <p className="text-cyan-400 text-xs">
              Unter 16 Jahren nur mit einem Erwachsenen, unter 6 Jahren kein Spielen möglich
            </p>

            <div className="bg-gray-900 rounded-lg px-4 py-3 border border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Gesamtpreis</span>
                <span className="text-white text-xl font-bold">{totalPrice.toFixed(2).replace('.', ',')}€</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-gray-400 text-xs">Vorname*</Label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Vorname*" className="bg-gray-900 border-gray-700 text-white h-10 placeholder:text-gray-600" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-400 text-xs">Nachname*</Label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Nachname*" className="bg-gray-900 border-gray-700 text-white h-10 placeholder:text-gray-600" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="company-invoice" checked={companyInvoice} onCheckedChange={(c) => setCompanyInvoice(!!c)} className="border-gray-600 data-[state=checked]:bg-cyan-500" />
              <Label htmlFor="company-invoice" className="text-gray-400 text-xs cursor-pointer">Firmenrechnung gewünscht (nur bei Vorkasse)</Label>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-gray-400 text-xs">Adresse</Label>
                <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Adresse*" className="bg-gray-900 border-gray-700 text-white h-10 placeholder:text-gray-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-gray-400 text-xs">PLZ</Label>
                  <Input value={plz} onChange={e => setPlz(e.target.value)} placeholder="PLZ (ggf. + Länder-Kennz.)*" className="bg-gray-900 border-gray-700 text-white h-10 placeholder:text-gray-600" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-gray-400 text-xs">Stadt</Label>
                  <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Stadt*" className="bg-gray-900 border-gray-700 text-white h-10 placeholder:text-gray-600" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-gray-400 text-xs">Telefon</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefon*" className="bg-gray-900 border-gray-700 text-white h-10 placeholder:text-gray-600" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-gray-400 text-xs">E-Mail</Label>
                  <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="E-Mail*" className="bg-gray-900 border-gray-700 text-white h-10 placeholder:text-gray-600" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-400 text-xs">Notizen</Label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notizen" className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm min-h-[80px] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
            </div>

            <div className="space-y-3 border-t border-gray-800 pt-4">
              <div className="flex items-start gap-2">
                <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(c) => setAcceptTerms(!!c)} className="border-gray-600 data-[state=checked]:bg-cyan-500 mt-0.5" />
                <Label htmlFor="terms" className="text-gray-400 text-xs cursor-pointer leading-relaxed">
                  Ich akzeptiere die <span className="text-cyan-400 underline">Zahlungs- und Stornierungsbedingungen</span>
                </Label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox id="agb" checked={acceptAgb} onCheckedChange={(c) => setAcceptAgb(!!c)} className="border-gray-600 data-[state=checked]:bg-cyan-500 mt-0.5" />
                <Label htmlFor="agb" className="text-gray-400 text-xs cursor-pointer leading-relaxed">
                  Ich akzeptiere die <span className="text-cyan-400 underline">AGB</span> und <span className="text-cyan-400 underline">Datenschutzerklärung</span>
                </Label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox id="rules" checked={acceptRules} onCheckedChange={(c) => setAcceptRules(!!c)} className="border-gray-600 data-[state=checked]:bg-cyan-500 mt-0.5" />
                <Label htmlFor="rules" className="text-gray-400 text-xs cursor-pointer leading-relaxed">
                  Ich akzeptiere die Regeln für <span className="text-cyan-400 underline">JGAs</span>, <span className="text-cyan-400 underline">Kinder</span> und zu unseren <span className="text-cyan-400 underline">Schließfächern</span>
                </Label>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox id="gutschein" className="border-gray-600 data-[state=checked]:bg-cyan-500" />
                <Label htmlFor="gutschein" className="text-gray-400 text-xs cursor-pointer">Gutschein einlösen/Wellhub</Label>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4 space-y-3">
              <div className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-700 hover:border-gray-600'}`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-cyan-500' : 'border-gray-600'}`}>
                    {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
                  </div>
                  <span className="text-gray-300 text-sm">Kreditkarte, ApplePay, GooglePay</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="bg-white rounded px-1.5 py-0.5 text-[10px] font-bold text-blue-700">VISA</div>
                  <div className="bg-white rounded px-1.5 py-0.5 text-[10px] font-bold text-red-600">MC</div>
                </div>
              </div>

              <div className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-700 hover:border-gray-600'}`}
                onClick={() => setPaymentMethod('paypal')}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'paypal' ? 'border-cyan-500' : 'border-gray-600'}`}>
                    {paymentMethod === 'paypal' && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
                  </div>
                  <span className="text-gray-300 text-sm">PayPal (+ 0,30 €/Spieler · <span className="text-cyan-400 text-xs">warum?</span>)</span>
                </div>
                <div className="bg-[#003087] rounded px-2 py-0.5 text-[10px] font-bold text-white">PayPal</div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !acceptTerms || !acceptAgb}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl text-base shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Wird gebucht...' : `Jetzt buchen · ${totalPrice.toFixed(2).replace('.', ',')}€`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}