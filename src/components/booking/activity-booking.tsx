import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, MapPin, Calendar, Euro } from "lucide-react";
import type { 
  CinemaBookingConfig, 
  SwimmingBookingConfig, 
  ZooBookingConfig, 
  BowlingBookingConfig,
  ActivityBookingConfig,
  ActivityBookingDetails 
} from "@shared/schema";

interface ActivityBookingProps {
  config: ActivityBookingConfig;
  onBookingChange: (details: ActivityBookingDetails, totalPrice: number) => void;
}

export function ActivityBooking({ config, onBookingChange }: ActivityBookingProps) {
  if (!config) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Standardbuchung - Wählen Sie Datum und Teilnehmer</p>
        </CardContent>
      </Card>
    );
  }

  switch (config.type) {
    case 'cinema':
      return <CinemaBooking config={config} onBookingChange={onBookingChange} />;
    case 'swimming':
      return <SwimmingBooking config={config} onBookingChange={onBookingChange} />;
    case 'zoo':
      return <ZooBooking config={config} onBookingChange={onBookingChange} />;
    case 'bowling':
      return <BowlingBooking config={config} onBookingChange={onBookingChange} />;
    default:
      return (
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">Allgemeine Buchung</p>
          </CardContent>
        </Card>
      );
  }
}

// Kino-Buchungskomponente
function CinemaBooking({ 
  config, 
  onBookingChange 
}: { 
  config: CinemaBookingConfig; 
  onBookingChange: (details: any, totalPrice: number) => void;
}) {
  const [selectedMovie, setSelectedMovie] = useState<string>("");
  const [selectedShowing, setSelectedShowing] = useState<string>("");
  const [ticketCounts, setTicketCounts] = useState({
    adult: 0,
    child: 0,
    student: 0
  });

  const selectedMovieData = config.movies.find(m => m.id === selectedMovie);
  const selectedShowingData = selectedMovieData?.showings.find(s => s.id === selectedShowing);

  const calculateTotal = () => {
    if (!selectedShowingData) return 0;
    return (
      ticketCounts.adult * selectedShowingData.priceAdult +
      ticketCounts.child * selectedShowingData.priceChild +
      ticketCounts.student * selectedShowingData.priceStudent
    );
  };

  useEffect(() => {
    if (selectedMovie && selectedShowing && calculateTotal() > 0) {
      const bookingDetails = {
        movieId: selectedMovie,
        showingId: selectedShowing,
        ticketTypes: [
          { type: 'adult' as const, quantity: ticketCounts.adult, price: selectedShowingData!.priceAdult },
          { type: 'child' as const, quantity: ticketCounts.child, price: selectedShowingData!.priceChild },
          { type: 'student' as const, quantity: ticketCounts.student, price: selectedShowingData!.priceStudent }
        ].filter(ticket => ticket.quantity > 0)
      };
      onBookingChange(bookingDetails, calculateTotal());
    }
  }, [selectedMovie, selectedShowing, ticketCounts, onBookingChange]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Film auswählen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {config.movies.map(movie => (
              <div
                key={movie.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedMovie === movie.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedMovie(movie.id);
                  setSelectedShowing("");
                }}
              >
                <h3 className="font-semibold text-lg">{movie.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {movie.duration} Min.
                  </div>
                  <Badge variant="outline">{movie.genre}</Badge>
                  <Badge variant="outline">FSK {movie.rating}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedMovieData && (
        <Card>
          <CardHeader>
            <CardTitle>Vorstellung wählen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedMovieData.showings.map(showing => {
                const showingDate = new Date(showing.datetime);
                const isAvailable = showing.availableSeats > 0;
                
                return (
                  <div
                    key={showing.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      !isAvailable ? 'opacity-50 cursor-not-allowed' :
                      selectedShowing === showing.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => isAvailable && setSelectedShowing(showing.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">
                          {showingDate.toLocaleDateString('de-DE')}
                        </div>
                        <div className="text-lg font-bold">
                          {showingDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4" />
                          {showing.hall}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-4 w-4" />
                          {showing.availableSeats}/{showing.totalSeats}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedShowingData && (
        <Card>
          <CardHeader>
            <CardTitle>Tickets auswählen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'adult', label: 'Erwachsene', price: selectedShowingData.priceAdult },
                { type: 'child', label: 'Kinder (bis 12)', price: selectedShowingData.priceChild },
                { type: 'student', label: 'Studenten', price: selectedShowingData.priceStudent }
              ].map(({ type, label, price }) => (
                <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold">{label}</div>
                    <div className="text-sm text-gray-600">{price.toFixed(2)}€ pro Ticket</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTicketCounts(prev => ({ 
                        ...prev, 
                        [type]: Math.max(0, prev[type as keyof typeof ticketCounts] - 1) 
                      }))}
                      disabled={ticketCounts[type as keyof typeof ticketCounts] === 0}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-semibold">
                      {ticketCounts[type as keyof typeof ticketCounts]}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTicketCounts(prev => ({ 
                        ...prev, 
                        [type]: Math.min(10, prev[type as keyof typeof ticketCounts] + 1) 
                      }))}
                      disabled={ticketCounts[type as keyof typeof ticketCounts] >= 10}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
              
              {calculateTotal() > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Gesamtpreis:</span>
                    <span className="text-xl font-bold text-blue-600">{calculateTotal().toFixed(2)}€</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Schwimmbad-Buchungskomponente
function SwimmingBooking({ 
  config, 
  onBookingChange 
}: { 
  config: SwimmingBookingConfig; 
  onBookingChange: (details: any, totalPrice: number) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [ticketCounts, setTicketCounts] = useState({
    adult: 0,
    child: 0,
    family: 0,
    senior: 0
  });

  const calculateTotal = () => {
    return (
      ticketCounts.adult * config.pricing.adult +
      ticketCounts.child * config.pricing.child +
      ticketCounts.family * config.pricing.family +
      ticketCounts.senior * config.pricing.senior
    );
  };

  useEffect(() => {
    if (selectedDate && calculateTotal() > 0) {
      const bookingDetails = {
        ticketTypes: [
          { type: 'adult' as const, quantity: ticketCounts.adult, price: config.pricing.adult },
          { type: 'child' as const, quantity: ticketCounts.child, price: config.pricing.child },
          { type: 'family' as const, quantity: ticketCounts.family, price: config.pricing.family },
          { type: 'senior' as const, quantity: ticketCounts.senior, price: config.pricing.senior }
        ].filter(ticket => ticket.quantity > 0),
        visitDate: selectedDate.toISOString().split('T')[0]
      };
      onBookingChange(bookingDetails, calculateTotal());
    }
  }, [selectedDate, ticketCounts, onBookingChange]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Besuchsdatum wählen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded-lg"
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Öffnungszeiten</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {config.openingHours.map(hours => {
                  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
                  return (
                    <div key={hours.dayOfWeek} className="flex justify-between">
                      <span>{days[hours.dayOfWeek]}:</span>
                      <span>{hours.closed ? 'Geschlossen' : `${hours.open} - ${hours.close}`}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Ausstattung</h4>
              <div className="flex flex-wrap gap-2">
                {config.facilities.map(facility => (
                  <Badge key={facility} variant="secondary">{facility}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tickets auswählen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'adult', label: 'Erwachsene', price: config.pricing.adult },
              { type: 'child', label: 'Kinder (bis 16)', price: config.pricing.child },
              { type: 'family', label: 'Familienkarte (2 Erw. + 3 Kinder)', price: config.pricing.family },
              { type: 'senior', label: 'Senioren (ab 65)', price: config.pricing.senior }
            ].map(({ type, label, price }) => (
              <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">{label}</div>
                  <div className="text-sm text-gray-600">{price.toFixed(2)}€</div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTicketCounts(prev => ({ 
                      ...prev, 
                      [type]: Math.max(0, prev[type as keyof typeof ticketCounts] - 1) 
                    }))}
                    disabled={ticketCounts[type as keyof typeof ticketCounts] === 0}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-semibold">
                    {ticketCounts[type as keyof typeof ticketCounts]}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTicketCounts(prev => ({ 
                      ...prev, 
                      [type]: Math.min(type === 'family' ? 5 : 10, prev[type as keyof typeof ticketCounts] + 1) 
                    }))}
                    disabled={ticketCounts[type as keyof typeof ticketCounts] >= (type === 'family' ? 5 : 10)}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
            
            {calculateTotal() > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Gesamtpreis:</span>
                  <span className="text-xl font-bold text-blue-600">{calculateTotal().toFixed(2)}€</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Zoo-Buchungskomponente
function ZooBooking({ 
  config, 
  onBookingChange 
}: { 
  config: ZooBookingConfig; 
  onBookingChange: (details: any, totalPrice: number) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({});

  const calculateTotal = () => {
    return config.ticketTypes.reduce((total, ticket) => {
      return total + (ticketCounts[ticket.id] || 0) * ticket.price;
    }, 0);
  };

  useEffect(() => {
    if (selectedDate && calculateTotal() > 0) {
      const bookingDetails = {
        ticketTypes: config.ticketTypes
          .filter(ticket => ticketCounts[ticket.id] > 0)
          .map(ticket => ({
            ticketId: ticket.id,
            quantity: ticketCounts[ticket.id],
            price: ticket.price
          })),
        visitDate: selectedDate.toISOString().split('T')[0]
      };
      onBookingChange(bookingDetails, calculateTotal());
    }
  }, [selectedDate, ticketCounts, onBookingChange]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Besuchsdatum wählen</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-2 border rounded-lg"
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tickets auswählen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {config.ticketTypes.map(ticket => (
              <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">{ticket.name}</div>
                  <div className="text-sm text-gray-600">{ticket.description}</div>
                  <div className="text-sm font-medium">{ticket.price.toFixed(2)}€</div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTicketCounts(prev => ({ 
                      ...prev, 
                      [ticket.id]: Math.max(0, (prev[ticket.id] || 0) - 1) 
                    }))}
                    disabled={(ticketCounts[ticket.id] || 0) === 0}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-semibold">
                    {ticketCounts[ticket.id] || 0}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTicketCounts(prev => ({ 
                      ...prev, 
                      [ticket.id]: Math.min(10, (prev[ticket.id] || 0) + 1) 
                    }))}
                    disabled={(ticketCounts[ticket.id] || 0) >= 10}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
            
            {calculateTotal() > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Gesamtpreis:</span>
                  <span className="text-xl font-bold text-blue-600">{calculateTotal().toFixed(2)}€</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Bowling-Buchungskomponente
function BowlingBooking({ 
  config, 
  onBookingChange 
}: { 
  config: BowlingBookingConfig; 
  onBookingChange: (details: any, totalPrice: number) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: string; end: string } | null>(null);
  const [duration, setDuration] = useState(1);
  const [shoeRentals, setShoeRentals] = useState(0);

  const calculateTotal = () => {
    const basePrice = duration * config.pricing.hourlyRate;
    const shoePrice = shoeRentals * config.pricing.shoeRental;
    return basePrice + shoePrice;
  };

  useEffect(() => {
    if (selectedDate && selectedTimeSlot && duration > 0) {
      const bookingDetails = {
        timeSlot: selectedTimeSlot,
        totalHours: duration,
        shoeRentals: shoeRentals
      };
      onBookingChange(bookingDetails, calculateTotal());
    }
  }, [selectedDate, selectedTimeSlot, duration, shoeRentals, onBookingChange]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Datum und Zeit wählen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded-lg"
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />
            
            {selectedDate && (
              <div className="grid grid-cols-2 gap-2">
                {config.availability.find(a => a.dayOfWeek === selectedDate.getDay())?.timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    className={`p-3 border rounded-lg text-sm ${
                      selectedTimeSlot === slot ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTimeSlot(slot)}
                  >
                    {slot.start} - {slot.end}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buchungsdetails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-semibold">Spieldauer</div>
                <div className="text-sm text-gray-600">{config.pricing.hourlyRate.toFixed(2)}€ pro Stunde</div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDuration(Math.max(1, duration - 1))}
                  disabled={duration === 1}
                >
                  -
                </Button>
                <span className="w-8 text-center font-semibold">{duration}h</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDuration(Math.min(4, duration + 1))}
                  disabled={duration >= 4}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-semibold">Schuhverleih</div>
                <div className="text-sm text-gray-600">{config.pricing.shoeRental.toFixed(2)}€ pro Paar</div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShoeRentals(Math.max(0, shoeRentals - 1))}
                  disabled={shoeRentals === 0}
                >
                  -
                </Button>
                <span className="w-8 text-center font-semibold">{shoeRentals}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShoeRentals(Math.min(8, shoeRentals + 1))}
                  disabled={shoeRentals >= 8}
                >
                  +
                </Button>
              </div>
            </div>
            
            {calculateTotal() > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Gesamtpreis:</span>
                  <span className="text-xl font-bold text-blue-600">{calculateTotal().toFixed(2)}€</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {duration}h Bowling + {shoeRentals} Schuhe
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}