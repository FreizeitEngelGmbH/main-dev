import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, CheckCircle, ChevronRight, ChevronLeft, Clock, Users, Mountain, Mail, Phone, CakeSlice } from "lucide-react";

interface Experience {
  id: number;
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

interface EquipmentItem {
  id: string;
  name: string;
  price: number;
  icon: string;
}

interface BoulderingBookingSystemProps {
  experiences: Experience[];
  partnerName: string;
  partnerEmail?: string;
  equipmentOptions?: EquipmentItem[];
  onBooking: (bookingData: any) => void;
}

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
];

const DEFAULT_EQUIPMENT: EquipmentItem[] = [
  { id: "schuhe", name: "Kletterschuhe", price: 5, icon: "👟" },
  { id: "chalk", name: "Chalkbag + Chalk", price: 3, icon: "🧴" },
  { id: "gurt", name: "Klettergurt", price: 4, icon: "🔗" },
  { id: "schliessfach", name: "Schließfach", price: 2, icon: "🔐" },
];

type Step = "datum" | "daten" | "beenden";

export default function BoulderingBookingSystem({ experiences, partnerName, partnerEmail, equipmentOptions, onBooking }: BoulderingBookingSystemProps) {
  const EQUIPMENT = equipmentOptions || DEFAULT_EQUIPMENT;
  const [step, setStep] = useState<Step>("datum");
  const [selectedTicket, setSelectedTicket] = useState<Experience | null>(experiences.length === 1 ? experiences[0] : null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [participantCount, setParticipantCount] = useState(1);

  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [email, setEmail] = useState("");
  const [handy, setHandy] = useState("");
  const [geburtsdatum, setGeburtsdatum] = useState("");

  const [participants, setParticipants] = useState<Array<{ vorname: string; nachname: string; email: string; handy: string }>>([]);

  const toggleEquipment = (id: string) => {
    setEquipment(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const equipmentTotal = equipment.reduce((sum, id) => {
    const item = EQUIPMENT.find(e => e.id === id);
    return sum + (item?.price || 0);
  }, 0) * participantCount;

  const ticketTotal = (selectedTicket?.price || 0) * participantCount;
  const totalPrice = ticketTotal + equipmentTotal;

  const updateParticipantCount = (count: number) => {
    setParticipantCount(count);
    const newParticipants = Array.from({ length: Math.max(0, count - 1) }, (_, i) => 
      participants[i] || { vorname: "", nachname: "", email: "", handy: "" }
    );
    setParticipants(newParticipants);
  };

  const updateParticipant = (index: number, field: string, value: string) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const canGoToStep2 = selectedTicket && selectedDate && selectedTime;
  const canGoToStep3 = vorname && nachname && email && handy;

  const today = new Date().toISOString().split("T")[0];

  const handleBooking = () => {
    onBooking({
      ticketTitle: selectedTicket?.title,
      ticketId: selectedTicket?.id,
      date: selectedDate,
      time: selectedTime,
      participantCount,
      equipment: equipment.map(id => EQUIPMENT.find(e => e.id === id)?.name),
      contact: { vorname, nachname, email, handy, geburtsdatum },
      participants,
      totalPrice,
      activityType: "bouldern"
    });
  };

  const steps: { id: Step; label: string }[] = [
    { id: "datum", label: "DATUM" },
    { id: "daten", label: "DATEN" },
    { id: "beenden", label: "BEENDEN" },
  ];

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-lg">
      <div className="bg-stone-800 text-white p-4 text-center">
        <h3 className="text-lg font-bold">{partnerName}</h3>
        {partnerEmail && <p className="text-stone-400 text-sm">/ {partnerEmail}</p>}
      </div>

      <div className="flex border-b border-stone-200">
        {steps.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              if (s.id === "datum") setStep("datum");
              if (s.id === "daten" && canGoToStep2) setStep("daten");
              if (s.id === "beenden" && canGoToStep2 && canGoToStep3) setStep("beenden");
            }}
            className={`flex-1 py-3 text-sm font-bold tracking-wider transition-all ${
              step === s.id
                ? "bg-[#6b7c3e] text-white"
                : i < steps.findIndex(x => x.id === step)
                  ? "bg-stone-100 text-stone-700"
                  : "bg-stone-800 text-white hover:bg-stone-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {step === "datum" && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-black text-stone-800">DEIN TERMIN</h2>
              <p className="text-stone-500 text-sm">Wähle Ticket, Datum und Uhrzeit</p>
            </div>

            {experiences.length === 1 ? (
              <div className="p-3 rounded-lg border border-[#6b7c3e] bg-[#6b7c3e]/10">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-stone-800 text-sm">{experiences[0].title}</span>
                    {experiences[0].description && (
                      <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{experiences[0].description}</p>
                    )}
                  </div>
                  <span className="font-bold text-[#6b7c3e] text-sm whitespace-nowrap ml-3">
                    {experiences[0].price.toFixed(2).replace(".", ",")}€
                  </span>
                </div>
              </div>
            ) : (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <Mountain className="h-4 w-4" /> Ticket auswählen
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {experiences.map(exp => (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setSelectedTicket(exp)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedTicket?.id === exp.id
                        ? "border-[#6b7c3e] bg-[#6b7c3e]/10 ring-2 ring-[#6b7c3e]/30"
                        : "border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-stone-800 text-sm">{exp.title}</span>
                        {exp.description && (
                          <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{exp.description}</p>
                        )}
                      </div>
                      <span className="font-bold text-[#6b7c3e] text-sm whitespace-nowrap ml-3">
                        {exp.price.toFixed(2).replace(".", ",")}€
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Datum
                </Label>
                <Input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="border-stone-300 focus:border-[#6b7c3e] focus:ring-[#6b7c3e]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Uhrzeit
                </Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="border-stone-300 focus:border-[#6b7c3e] focus:ring-[#6b7c3e]">
                    <SelectValue placeholder="Uhrzeit wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time}>{time} Uhr</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-stone-700">Equipment-Verleih (optional)</Label>
              <div className="grid grid-cols-2 gap-2">
                {EQUIPMENT.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleEquipment(item.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-sm transition-all ${
                      equipment.includes(item.id)
                        ? "border-[#6b7c3e] bg-[#6b7c3e]/10"
                        : "border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="text-xs font-medium">{item.name}</span>
                    </span>
                    <span className="text-xs font-bold text-[#6b7c3e]">+{item.price}€</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep("daten")}
                disabled={!canGoToStep2}
                className="bg-[#6b7c3e] hover:bg-[#5a6a34] text-white px-8 py-2 font-bold tracking-wider"
              >
                WEITER <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === "daten" && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-black text-stone-800">DEINE DATEN</h2>
              <p className="text-stone-500 text-sm">Bitte die *-Felder ausfüllen.</p>
            </div>

            <p className="text-xs text-stone-500 text-center">
              Bitte nur die * Felder ausfüllen. Daten weiterer Teilnehmender müssen nicht eingegeben werden!
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-stone-600">Vorname:*</Label>
                <Input
                  value={vorname}
                  onChange={e => setVorname(e.target.value)}
                  placeholder="Vorname"
                  className="border-stone-300 focus:border-[#6b7c3e] focus:ring-[#6b7c3e]"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-stone-600">E-Mail:*</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="E-Mail"
                  className="border-stone-300 focus:border-[#6b7c3e] focus:ring-[#6b7c3e]"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-stone-600">Nachname:*</Label>
                <Input
                  value={nachname}
                  onChange={e => setNachname(e.target.value)}
                  placeholder="Nachname"
                  className="border-stone-300 focus:border-[#6b7c3e] focus:ring-[#6b7c3e]"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-stone-600">Handy:*</Label>
                <Input
                  type="tel"
                  value={handy}
                  onChange={e => setHandy(e.target.value)}
                  placeholder="Handy"
                  className="border-stone-300 focus:border-[#6b7c3e] focus:ring-[#6b7c3e]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-stone-600">Geburtsdatum:</Label>
                <Input
                  type="date"
                  value={geburtsdatum}
                  onChange={e => setGeburtsdatum(e.target.value)}
                  className="border-stone-300 focus:border-[#6b7c3e] focus:ring-[#6b7c3e]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-stone-600 flex items-center gap-1">
                  <Users className="h-3 w-3" /> TeilnehmerInnen:*
                </Label>
                <Select value={String(participantCount)} onValueChange={v => updateParticipantCount(parseInt(v))}>
                  <SelectTrigger className="border-stone-300 focus:border-[#6b7c3e] focus:ring-[#6b7c3e]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {participants.length > 0 && (
              <div className="space-y-4 pt-3 border-t border-stone-200">
                <h3 className="text-lg font-black text-stone-800 text-center">TEILNEHMER</h3>
                {participants.map((p, i) => (
                  <div key={i} className="space-y-2 p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <p className="text-xs font-semibold text-stone-600">Teilnehmer {i + 2}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={p.vorname}
                        onChange={e => updateParticipant(i, "vorname", e.target.value)}
                        placeholder="Vorname"
                        className="border-stone-200 text-sm"
                      />
                      <Input
                        value={p.email}
                        onChange={e => updateParticipant(i, "email", e.target.value)}
                        placeholder="E-Mail"
                        className="border-stone-200 text-sm"
                      />
                      <Input
                        value={p.nachname}
                        onChange={e => updateParticipant(i, "nachname", e.target.value)}
                        placeholder="Nachname"
                        className="border-stone-200 text-sm"
                      />
                      <Input
                        value={p.handy}
                        onChange={e => updateParticipant(i, "handy", e.target.value)}
                        placeholder="Handy"
                        className="border-stone-200 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep("datum")}
                className="border-stone-300 text-stone-600"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> ZURÜCK
              </Button>
              <Button
                onClick={() => setStep("beenden")}
                disabled={!canGoToStep3}
                className="bg-[#6b7c3e] hover:bg-[#5a6a34] text-white px-8 font-bold tracking-wider"
              >
                WEITER <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === "beenden" && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-black text-stone-800">ZUSAMMENFASSUNG</h2>
              <p className="text-stone-500 text-sm">Bitte überprüfe deine Buchung</p>
            </div>

            <div className="space-y-3 bg-stone-50 p-4 rounded-lg border border-stone-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-stone-800">{selectedTicket?.title}</p>
                  <p className="text-xs text-stone-500">{selectedTicket?.description}</p>
                </div>
                <span className="font-bold text-[#6b7c3e]">
                  {selectedTicket?.price.toFixed(2).replace(".", ",")}€
                </span>
              </div>

              <div className="border-t border-stone-200 pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" /> Datum
                  </span>
                  <span className="font-medium">
                    {selectedDate ? new Date(selectedDate).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : ""}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> Uhrzeit
                  </span>
                  <span className="font-medium">{selectedTime} Uhr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600 flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" /> Teilnehmer
                  </span>
                  <span className="font-medium">{participantCount} Person{participantCount > 1 ? "en" : ""}</span>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600 flex items-center gap-2">
                    <User className="h-3.5 w-3.5" /> Kontakt
                  </span>
                  <span className="font-medium">{vorname} {nachname}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600 flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> E-Mail
                  </span>
                  <span className="font-medium text-xs">{email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600 flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" /> Handy
                  </span>
                  <span className="font-medium">{handy}</span>
                </div>
              </div>

              {equipment.length > 0 && (
                <div className="border-t border-stone-200 pt-2 space-y-1">
                  <p className="text-xs font-semibold text-stone-600">Equipment:</p>
                  {equipment.map(id => {
                    const item = EQUIPMENT.find(e => e.id === id);
                    return item ? (
                      <div key={id} className="flex justify-between text-sm">
                        <span className="text-stone-600">{item.icon} {item.name}</span>
                        <span className="font-medium">+{(item.price * participantCount).toFixed(2).replace(".", ",")}€</span>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              <div className="border-t-2 border-stone-300 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Tickets ({participantCount}×)</span>
                  <span>{ticketTotal.toFixed(2).replace(".", ",")}€</span>
                </div>
                {equipmentTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Equipment</span>
                    <span>{equipmentTotal.toFixed(2).replace(".", ",")}€</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-black mt-2 text-stone-800">
                  <span>GESAMT</span>
                  <span className="text-[#6b7c3e]">{totalPrice.toFixed(2).replace(".", ",")}€</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-500 text-center">
              Sicherheitseinweisung für Erstbesucher ist Pflicht (ca. 15 Min). Kinder unter 14 Jahren nur mit Begleitung.
            </p>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep("daten")}
                className="border-stone-300 text-stone-600"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> ZURÜCK
              </Button>
              <Button
                onClick={handleBooking}
                className="bg-[#6b7c3e] hover:bg-[#5a6a34] text-white px-8 py-2 font-bold tracking-wider"
              >
                JETZT BUCHEN <CheckCircle className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
