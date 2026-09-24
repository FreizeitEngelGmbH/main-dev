import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Film, Calendar, ChevronLeft, ChevronRight, Armchair, Popcorn, Star } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { de } from "date-fns/locale";

interface CinemaExperience {
  id: number;
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

interface CinemaBookingSystemProps {
  experiences: CinemaExperience[];
  partnerName: string;
  onBooking: (bookingData: any) => void;
}

const CINEMA_PROGRAMS = [
  {
    id: "film1",
    title: "The Brutalist",
    genre: "Drama",
    duration: "215 Min.",
    fsk: "FSK 12",
    language: "OmU",
    description: "Ein episches Drama über einen ungarisch-jüdischen Architekten, der nach dem Zweiten Weltkrieg in Amerika ein neues Leben beginnt.",
    poster: "🎬",
    showtimes: ["17:00", "20:30"],
  },
  {
    id: "film2",
    title: "Flow",
    genre: "Animation",
    duration: "85 Min.",
    fsk: "FSK 0",
    language: "ohne Dialog",
    description: "Ein visuell atemberaubender Animationsfilm über eine Katze, die nach einer großen Flut auf einer Bootsreise mit anderen Tieren Abenteuer erlebt.",
    poster: "🐱",
    showtimes: ["14:30", "16:45"],
  },
  {
    id: "film3",
    title: "Anora",
    genre: "Komödie / Drama",
    duration: "139 Min.",
    fsk: "FSK 16",
    language: "OmU",
    description: "Eine junge Frau aus Brooklyn heiratet impulsiv den Sohn eines russischen Oligarchen – mit unerwarteten Konsequenzen.",
    poster: "💃",
    showtimes: ["19:30", "22:00"],
  },
  {
    id: "film4",
    title: "Kinderkino Special",
    genre: "Animation / Abenteuer",
    duration: "95 Min.",
    fsk: "FSK 0",
    language: "Deutsch",
    description: "Unser Kinderkino-Programm mit ausgewählten Filmen für die ganze Familie. Mit Plüschkino-Atmosphäre am Wochenende!",
    poster: "🧸",
    showtimes: ["11:00", "14:00"],
  },
];

function SeatMap({ 
  selectedSeats, 
  onSeatsChange, 
  maxSeats,
  showtime
}: { 
  selectedSeats: string[];
  onSeatsChange: (seats: string[]) => void;
  maxSeats: number;
  showtime: string;
}) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 10;

  const occupiedSeats = useMemo(() => {
    const hash = showtime.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const occupied: string[] = [];
    rows.forEach(row => {
      for (let i = 1; i <= seatsPerRow; i++) {
        if ((hash * i + row.charCodeAt(0)) % 7 === 0) {
          occupied.push(`${row}${i}`);
        }
      }
    });
    return occupied;
  }, [showtime]);

  const toggleSeat = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return;
    if (selectedSeats.includes(seatId)) {
      onSeatsChange(selectedSeats.filter(s => s !== seatId));
    } else if (selectedSeats.length < maxSeats) {
      onSeatsChange([...selectedSeats, seatId]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-center mb-4">
        <div className="bg-gradient-to-r from-purple-300 via-purple-500 to-purple-300 h-1.5 rounded-full w-3/4 mx-auto mb-1"></div>
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Leinwand</span>
      </div>

      <div className="space-y-1.5 px-2">
        {rows.map(row => (
          <div key={row} className="flex items-center justify-center gap-0.5 sm:gap-1">
            <span className="w-5 text-center text-[10px] font-medium text-gray-400">{row}</span>
            <div className="flex gap-0.5 sm:gap-1">
              {Array.from({ length: seatsPerRow }, (_, i) => {
                const seatId = `${row}${i + 1}`;
                const isOccupied = occupiedSeats.includes(seatId);
                const isSelected = selectedSeats.includes(seatId);
                const isPremium = row === 'D' || row === 'E';
                return (
                  <button
                    key={seatId}
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSeat(seatId); }}
                    disabled={isOccupied}
                    className={`w-6 h-6 sm:w-7 sm:h-7 text-[9px] sm:text-[10px] rounded-t-md transition-all duration-150
                      ${isOccupied 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : isSelected 
                          ? 'bg-purple-600 text-white shadow-md scale-105' 
                          : isPremium 
                            ? 'bg-amber-50 border border-amber-200 hover:bg-amber-100 cursor-pointer text-amber-700' 
                            : 'bg-gray-50 border border-gray-200 hover:bg-purple-50 cursor-pointer text-gray-600'
                      }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <span className="w-5 text-center text-[10px] font-medium text-gray-400">{row}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4 text-[10px] mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded-t-sm"></div>
          <span className="text-gray-500">Frei</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-amber-50 border border-amber-200 rounded-t-sm"></div>
          <span className="text-gray-500">Premium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-purple-600 rounded-t-sm"></div>
          <span className="text-gray-500">Gewählt</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-200 rounded-t-sm"></div>
          <span className="text-gray-500">Belegt</span>
        </div>
      </div>
    </div>
  );
}

export default function CinemaBookingSystem({ experiences, partnerName, onBooking }: CinemaBookingSystemProps) {
  const [step, setStep] = useState<'program' | 'showtime' | 'tickets' | 'seats' | 'summary'>('program');
  const [selectedFilm, setSelectedFilm] = useState<typeof CINEMA_PROGRAMS[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [ticketCounts, setTicketCounts] = useState({ normal: 0, ermaessigt: 0, kind: 0 });

  const normalPrice = experiences.find(e => e.title.toLowerCase().includes('normal'))?.price || 10;
  const ermaessigtPrice = experiences.find(e => e.title.toLowerCase().includes('ermäßigt') || e.title.toLowerCase().includes('ermaessigt'))?.price || 8.50;
  const kindPrice = experiences.find(e => e.title.toLowerCase().includes('kinder') || e.title.toLowerCase().includes('kind'))?.price || 6;

  const totalTickets = ticketCounts.normal + ticketCounts.ermaessigt + ticketCounts.kind;
  const totalPrice = (ticketCounts.normal * normalPrice) + (ticketCounts.ermaessigt * ermaessigtPrice) + (ticketCounts.kind * kindPrice);

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const handleBooking = () => {
    onBooking({
      film: selectedFilm?.title,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      participants: totalTickets,
      totalPrice,
      ticketCounts,
      selectedSeats,
      activityType: 'cinema'
    });
  };

  const TicketCounter = ({ label, sublabel, price, count, onChange }: { label: string; sublabel: string; price: number; count: number; onChange: (n: number) => void }) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
      <div>
        <div className="font-medium text-sm text-gray-900">{label}</div>
        <div className="text-xs text-gray-500">{sublabel}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-purple-700 mr-2">{price.toFixed(2)}€</span>
        <button type="button" onClick={() => onChange(Math.max(0, count - 1))} className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600 transition-colors">−</button>
        <span className="w-6 text-center font-semibold text-sm">{count}</span>
        <button type="button" onClick={() => onChange(Math.min(10, count + 1))} className="w-7 h-7 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center text-sm font-bold text-purple-700 transition-colors">+</button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-950 text-white rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-purple-900 to-purple-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="h-5 w-5 text-purple-300" />
          <span className="font-bold text-sm">{partnerName}</span>
        </div>
        <div className="flex gap-1">
          {['program', 'showtime', 'tickets', 'seats', 'summary'].map((s, i) => (
            <div key={s} className={`w-2 h-2 rounded-full transition-colors ${step === s ? 'bg-purple-300' : i < ['program', 'showtime', 'tickets', 'seats', 'summary'].indexOf(step) ? 'bg-purple-400' : 'bg-purple-700'}`} />
          ))}
        </div>
      </div>

      <div className="p-4">
        {step === 'program' && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              Aktuelles Programm
            </h3>
            <div className="space-y-2">
              {CINEMA_PROGRAMS.map(film => (
                <button
                  key={film.id}
                  type="button"
                  onClick={() => { setSelectedFilm(film); setStep('showtime'); }}
                  className={`w-full text-left p-3 rounded-lg border transition-all hover:border-purple-500 hover:bg-purple-950/50 ${selectedFilm?.id === film.id ? 'border-purple-500 bg-purple-950/50' : 'border-gray-800 bg-gray-900'}`}
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-16 bg-gray-800 rounded flex items-center justify-center text-2xl flex-shrink-0">
                      {film.poster}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-white">{film.title}</h4>
                        <Badge variant="outline" className="text-[10px] border-gray-600 text-gray-400 flex-shrink-0">{film.fsk}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                        <span>{film.genre}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{film.duration}</span>
                        <span>•</span>
                        <span>{film.language}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{film.description}</p>
                      <div className="flex gap-1.5 mt-2">
                        {film.showtimes.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-purple-900/50 border border-purple-700 rounded text-[10px] text-purple-300 font-medium">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'showtime' && selectedFilm && (
          <div className="space-y-4">
            <button type="button" onClick={() => setStep('program')} className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300">
              <ChevronLeft className="h-4 w-4" /> Zurück zum Programm
            </button>

            <div className="flex gap-3 items-start">
              <div className="w-10 h-14 bg-gray-800 rounded flex items-center justify-center text-xl flex-shrink-0">{selectedFilm.poster}</div>
              <div>
                <h3 className="font-bold">{selectedFilm.title}</h3>
                <p className="text-xs text-gray-400">{selectedFilm.genre} • {selectedFilm.duration} • {selectedFilm.language}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Datum wählen</h4>
              <div className="flex gap-1.5 overflow-x-auto pb-2">
                {dates.map(date => (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 w-14 py-2 rounded-lg border text-center transition-all ${isSameDay(date, selectedDate) ? 'border-purple-500 bg-purple-900/50 text-purple-300' : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'}`}
                  >
                    <div className="text-[10px] uppercase">{format(date, 'EEE', { locale: de })}</div>
                    <div className="text-lg font-bold">{format(date, 'd')}</div>
                    <div className="text-[10px]">{format(date, 'MMM', { locale: de })}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Vorstellung wählen</h4>
              <div className="flex gap-2">
                {selectedFilm.showtimes.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => { setSelectedTime(time); setStep('tickets'); }}
                    className={`px-4 py-3 rounded-lg border transition-all ${selectedTime === time ? 'border-purple-500 bg-purple-600 text-white' : 'border-gray-700 bg-gray-900 text-gray-300 hover:border-purple-500 hover:bg-purple-950/50'}`}
                  >
                    <div className="text-lg font-bold">{time}</div>
                    <div className="text-[10px] text-gray-400">Saal 1</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'tickets' && (
          <div className="space-y-4">
            <button type="button" onClick={() => setStep('showtime')} className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300">
              <ChevronLeft className="h-4 w-4" /> Zurück
            </button>

            <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{selectedFilm?.title}</span>
                <span className="text-purple-300">{format(selectedDate, 'dd.MM.yyyy')} • {selectedTime} Uhr</span>
              </div>
            </div>

            <h3 className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              Tickets wählen
            </h3>

            <div className="space-y-2">
              <TicketCounter label="Erwachsene" sublabel="Regulärer Eintritt" price={normalPrice} count={ticketCounts.normal} onChange={(n) => setTicketCounts(p => ({ ...p, normal: n }))} />
              <TicketCounter label="Ermäßigt" sublabel="Schüler, Studierende, Senioren" price={ermaessigtPrice} count={ticketCounts.ermaessigt} onChange={(n) => setTicketCounts(p => ({ ...p, ermaessigt: n }))} />
              <TicketCounter label="Kind" sublabel="Bis 14 Jahre" price={kindPrice} count={ticketCounts.kind} onChange={(n) => setTicketCounts(p => ({ ...p, kind: n }))} />
            </div>

            {totalTickets > 0 && (
              <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 flex items-center justify-between">
                <span className="text-sm text-gray-300">{totalTickets} Ticket{totalTickets > 1 ? 's' : ''}</span>
                <span className="font-bold text-purple-300">{totalPrice.toFixed(2)}€</span>
              </div>
            )}

            <Button
              type="button"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={totalTickets === 0}
              onClick={() => { setSelectedSeats([]); setStep('seats'); }}
            >
              {totalTickets === 0 ? 'Bitte Tickets wählen' : 'Weiter zur Sitzplatzwahl'}
            </Button>
          </div>
        )}

        {step === 'seats' && (
          <div className="space-y-4">
            <button type="button" onClick={() => setStep('tickets')} className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300">
              <ChevronLeft className="h-4 w-4" /> Zurück
            </button>

            <h3 className="text-lg font-bold flex items-center gap-2">
              <Armchair className="h-5 w-5 text-purple-400" />
              Sitzplätze wählen
              <span className="text-sm font-normal text-gray-400">({selectedSeats.length}/{totalTickets})</span>
            </h3>

            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <SeatMap
                selectedSeats={selectedSeats}
                onSeatsChange={setSelectedSeats}
                maxSeats={totalTickets}
                showtime={selectedTime}
              />
            </div>

            {selectedSeats.length > 0 && (
              <div className="text-xs text-gray-400 text-center">
                Plätze: {selectedSeats.sort().join(', ')}
              </div>
            )}

            <Button
              type="button"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={selectedSeats.length !== totalTickets}
              onClick={() => setStep('summary')}
            >
              {selectedSeats.length === totalTickets
                ? 'Weiter zur Zusammenfassung'
                : `Noch ${totalTickets - selectedSeats.length} Platz${totalTickets - selectedSeats.length > 1 ? '̈e' : ''} wählen`
              }
            </Button>
          </div>
        )}

        {step === 'summary' && (
          <div className="space-y-4">
            <button type="button" onClick={() => setStep('seats')} className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300">
              <ChevronLeft className="h-4 w-4" /> Zurück
            </button>

            <h3 className="text-lg font-bold flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-400" />
              Buchungsübersicht
            </h3>

            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <div className="bg-purple-900/30 p-3 border-b border-gray-800">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-14 bg-gray-800 rounded flex items-center justify-center text-xl">{selectedFilm?.poster}</div>
                  <div>
                    <h4 className="font-bold">{selectedFilm?.title}</h4>
                    <p className="text-xs text-gray-400">{selectedFilm?.genre} • {selectedFilm?.duration}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Datum</span>
                  <span>{format(selectedDate, 'EEEE, dd. MMMM yyyy', { locale: de })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vorstellung</span>
                  <span>{selectedTime} Uhr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Plätze</span>
                  <span>{selectedSeats.sort().join(', ')}</span>
                </div>

                <div className="border-t border-gray-800 pt-2 mt-2 space-y-1">
                  {ticketCounts.normal > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">{ticketCounts.normal}× Erwachsene</span>
                      <span>{(ticketCounts.normal * normalPrice).toFixed(2)}€</span>
                    </div>
                  )}
                  {ticketCounts.ermaessigt > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">{ticketCounts.ermaessigt}× Ermäßigt</span>
                      <span>{(ticketCounts.ermaessigt * ermaessigtPrice).toFixed(2)}€</span>
                    </div>
                  )}
                  {ticketCounts.kind > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">{ticketCounts.kind}× Kind</span>
                      <span>{(ticketCounts.kind * kindPrice).toFixed(2)}€</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-800 pt-2 flex justify-between font-bold text-base">
                  <span>Gesamt</span>
                  <span className="text-purple-400">{totalPrice.toFixed(2)}€</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 flex items-center gap-2">
              <Popcorn className="h-5 w-5 text-amber-400 flex-shrink-0" />
              <div className="text-xs text-gray-400">
                <span className="text-amber-400 font-medium">Tipp:</span> Popcorn & Getränke können direkt an der Theke bestellt werden.
              </div>
            </div>

            <Button
              type="button"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 text-base font-bold"
              onClick={handleBooking}
            >
              Jetzt für {totalPrice.toFixed(2)}€ buchen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
