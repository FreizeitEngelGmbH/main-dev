import { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar, Clock, Users, Film, MapPin, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLocation } from 'wouter';

interface Experience {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: number;
  maxParticipants: number;
  specialNotes?: string;
}

interface Partner {
  id: number;
  companyName: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
}

interface CinemaBookingFormProps {
  experience: Experience;
  partner: Partner;
}

interface TicketCategory {
  type: 'adult' | 'youth' | 'child';
  label: string;
  price: number;
  ageRange: string;
  count: number;
}

interface SeatSelection {
  row: string;
  seatNumber: number;
  isSelected: boolean;
  isOccupied: boolean;
}

interface FormData {
  selectedDate: Date | null;
  selectedTime: string;
  selectedMovie: string;
  tickets: TicketCategory[];
  selectedSeats: SeatSelection[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  message: string;
  paymentMethod: string;
}

export default function CinemaBookingForm({ experience, partner }: CinemaBookingFormProps) {
  const [, setLocation] = useLocation();
  
  // Realistische Kinodaten
  const availableMovies = [
    { id: 'avatar-3', title: 'Avatar: The Way of Water', duration: 192, genre: 'Sci-Fi', fsk: 'FSK 12' },
    { id: 'top-gun', title: 'Top Gun: Maverick', duration: 131, genre: 'Action', fsk: 'FSK 12' },
    { id: 'minions', title: 'Minions: Auf der Suche nach dem Mini-Boss', duration: 87, genre: 'Animation', fsk: 'FSK 0' },
    { id: 'thor', title: 'Thor: Love and Thunder', duration: 119, genre: 'Action', fsk: 'FSK 12' },
    { id: 'jurassic', title: 'Jurassic World: Ein neues Zeitalter', duration: 146, genre: 'Adventure', fsk: 'FSK 12' }
  ];

  const timeSlots = ['14:00', '16:30', '19:00', '21:30'];
  
  const defaultTickets: TicketCategory[] = [
    { type: 'adult', label: 'Erwachsene', price: 15.50, ageRange: 'ab 16 Jahre', count: 0 },
    { type: 'youth', label: 'Jugendliche', price: 14.00, ageRange: '12-15 Jahre', count: 0 },
    { type: 'child', label: 'Kinder', price: 12.50, ageRange: 'bis 11 Jahre', count: 0 }
  ];

  const [formData, setFormData] = useState<FormData>({
    selectedDate: null,
    selectedTime: '',
    selectedMovie: '',
    tickets: defaultTickets,
    selectedSeats: [],
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    message: '',
    paymentMethod: 'paypal'
  });

  // Sitzplan generieren (vereinfacht - 8 Reihen mit 12 Sitzen)
  const generateSeatMap = (): SeatSelection[] => {
    const seats: SeatSelection[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    
    rows.forEach(row => {
      for (let seatNum = 1; seatNum <= 12; seatNum++) {
        seats.push({
          row,
          seatNumber: seatNum,
          isSelected: false,
          isOccupied: Math.random() < 0.2 // 20% der Sitze sind bereits belegt
        });
      }
    });
    
    return seats;
  };

  const [seatMap, setSeatMap] = useState<SeatSelection[]>(generateSeatMap());

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateTicketCount = (ticketType: 'adult' | 'youth' | 'child', count: number) => {
    const updatedTickets = formData.tickets.map(ticket => 
      ticket.type === ticketType ? { ...ticket, count: Math.max(0, count) } : ticket
    );
    updateField('tickets', updatedTickets);
    
    // Sitzplätze zurücksetzen wenn sich Anzahl ändert
    if (formData.selectedSeats.length > 0) {
      setSeatMap(generateSeatMap());
      updateField('selectedSeats', []);
    }
  };

  const toggleSeat = (rowIndex: number, seatIndex: number) => {
    const totalTickets = formData.tickets.reduce((sum, ticket) => sum + ticket.count, 0);
    const currentSelectedSeats = seatMap.filter(seat => seat.isSelected).length;
    
    const updatedSeatMap = [...seatMap];
    const seatIdx = rowIndex * 12 + seatIndex;
    const seat = updatedSeatMap[seatIdx];
    
    if (seat.isOccupied) return;
    
    // Wenn Platz bereits ausgewählt ist, abwählen
    if (seat.isSelected) {
      seat.isSelected = false;
    } else {
      // Nur auswählen wenn noch Plätze frei sind
      if (currentSelectedSeats < totalTickets) {
        seat.isSelected = true;
      }
    }
    
    setSeatMap(updatedSeatMap);
    updateField('selectedSeats', updatedSeatMap.filter(s => s.isSelected));
  };

  const getTotalPrice = () => {
    return formData.tickets.reduce((total, ticket) => total + (ticket.count * ticket.price), 0);
  };

  const getTotalTickets = () => {
    return formData.tickets.reduce((total, ticket) => total + ticket.count, 0);
  };

  const isFormValid = () => {
    const totalTickets = getTotalTickets();
    return formData.selectedDate && 
           formData.selectedTime && 
           formData.selectedMovie &&
           totalTickets > 0 &&
           formData.selectedSeats.length === totalTickets &&
           formData.contactName && 
           formData.contactEmail;
  };

  const handleBooking = () => {
    if (!isFormValid()) return;

    const selectedMovie = availableMovies.find(m => m.id === formData.selectedMovie);
    
    setLocation('/confirmation', {
      state: {
        bookingData: {
          ...formData,
          selectedDate: formData.selectedDate ? format(formData.selectedDate, 'yyyy-MM-dd') : '',
          experience,
          partner,
          activityType: 'cinema',
          totalPrice: getTotalPrice(),
          movieDetails: selectedMovie,
          bookingType: 'cinema'
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Filmauswahl */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            Film auswählen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={formData.selectedMovie} onValueChange={(value) => updateField('selectedMovie', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Film auswählen" />
            </SelectTrigger>
            <SelectContent>
              {availableMovies.map(movie => (
                <SelectItem key={movie.id} value={movie.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{movie.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {movie.genre} • {movie.duration} Min • {movie.fsk}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Datum & Uhrzeit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Datum & Vorstellungszeit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Datum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.selectedDate ? (
                    format(formData.selectedDate, 'EEEE, dd. MMMM yyyy', { locale: de })
                  ) : (
                    <span>Datum wählen</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.selectedDate ?? undefined}
                  onSelect={(date) => updateField('selectedDate', date)}
                  disabled={(date) => date < new Date(Date.now() - 86400000)}
                  initialFocus
                  locale={de}
                  numberOfMonths={1}
                  showOutsideDays={true}
                  className="border-0"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Vorstellungszeit</Label>
            <Select value={formData.selectedTime} onValueChange={(value) => updateField('selectedTime', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Uhrzeit wählen" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(time => (
                  <SelectItem key={time} value={time}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {time} Uhr
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ticketauswahl */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Tickets auswählen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.tickets.map(ticket => (
            <div key={ticket.type} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{ticket.label}</div>
                <div className="text-sm text-muted-foreground">{ticket.ageRange}</div>
                <div className="text-lg font-bold text-primary">{ticket.price.toFixed(2)}€</div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateTicketCount(ticket.type, ticket.count - 1)}
                  disabled={ticket.count === 0}
                >
                  -
                </Button>
                <span className="w-8 text-center font-medium">{ticket.count}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateTicketCount(ticket.type, ticket.count + 1)}
                  disabled={ticket.count >= 8}
                >
                  +
                </Button>
              </div>
            </div>
          ))}
          
          {getTotalTickets() > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Gesamt: {getTotalTickets()} Tickets</span>
                <span className="text-xl font-bold text-primary">{getTotalPrice().toFixed(2)}€</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sitzplatzauswahl */}
      {getTotalTickets() > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Sitzplätze auswählen ({formData.selectedSeats.length}/{getTotalTickets()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Leinwand */}
              <div className="text-center">
                <div className="bg-gray-200 text-gray-600 py-2 px-4 rounded-lg text-sm font-medium mb-4">
                  LEINWAND
                </div>
              </div>
              
              {/* Sitzplan */}
              <div className="space-y-2">
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((row, rowIndex) => (
                  <div key={row} className="flex items-center gap-2">
                    <span className="w-6 text-center font-medium text-muted-foreground">{row}</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 12 }, (_, seatIndex) => {
                        const seatIdx = rowIndex * 12 + seatIndex;
                        const seat = seatMap[seatIdx];
                        
                        return (
                          <button
                            key={seatIndex}
                            className={`w-8 h-8 text-xs border rounded ${
                              seat.isOccupied 
                                ? 'bg-red-200 border-red-300 cursor-not-allowed'
                                : seat.isSelected
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                            }`}
                            onClick={() => toggleSeat(rowIndex, seatIndex)}
                            disabled={seat.isOccupied}
                          >
                            {seatIndex + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Legende */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                  <span>Frei</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded"></div>
                  <span>Ausgewählt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
                  <span>Belegt</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kontaktdaten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kontaktdaten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Name *</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => updateField('contactName', e.target.value)}
                placeholder="Ihr vollständiger Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">E-Mail *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                placeholder="ihre@email.de"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Telefon (optional)</Label>
            <Input
              id="contactPhone"
              value={formData.contactPhone}
              onChange={(e) => updateField('contactPhone', e.target.value)}
              placeholder="+49 123 456789"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Nachricht (optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => updateField('message', e.target.value)}
              placeholder="Besondere Wünsche oder Anmerkungen..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Zahlungsmethode */}
      <Card>
        <CardHeader>
          <CardTitle>Zahlungsmethode</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={formData.paymentMethod} onValueChange={(value) => updateField('paymentMethod', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="klarna">Klarna</SelectItem>
              <SelectItem value="sepa">SEPA Lastschrift</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Buchungs-Button */}
      <Button 
        onClick={handleBooking} 
        disabled={!isFormValid()}
        className="w-full py-6 text-lg font-semibold"
        size="lg"
      >
        {getTotalTickets() > 0 ? (
          `Jetzt buchen - ${getTotalPrice().toFixed(2)}€`
        ) : (
          'Tickets auswählen'
        )}
      </Button>
    </div>
  );
}