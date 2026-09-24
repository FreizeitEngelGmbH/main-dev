import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Users } from "lucide-react";

// Template Configuration Types
export interface BookingFieldConfig {
  type: 'personCount' | 'ticketSelection' | 'seatSelection' | 'checkbox' | 'movieDetails' | 'additionalService';
  id: string;
  label: string;
  required?: boolean;
  options?: any;
}

export interface ActivityTemplate {
  id: string;
  name: string;
  fields: BookingFieldConfig[];
  priceCalculation: 'perPerson' | 'perTicket' | 'fixed' | 'custom';
  customPricing?: {
    [key: string]: number;
  };
}

// Predefined Activity Templates
export const ACTIVITY_TEMPLATES: { [key: string]: ActivityTemplate } = {
  cinema: {
    id: 'cinema',
    name: 'Kino',
    fields: [
      {
        type: 'movieDetails',
        id: 'movieInfo',
        label: 'Film-Information',
        required: true
      },
      {
        type: 'ticketSelection',
        id: 'tickets',
        label: 'Tickets auswählen',
        required: true,
        options: {
          types: [
            { id: 'adult', label: 'Erwachsene', price: 15.50 },
            { id: 'youth', label: 'Jugend (12-15 J.)', price: 14.00 },
            { id: 'child', label: 'Kind (bis 11 J.)', price: 12.50 }
          ]
        }
      },
      {
        type: 'seatSelection',
        id: 'seats',
        label: 'Sitzplätze auswählen',
        required: true,
        options: {
          rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
          seatsPerRow: 12
        }
      }
    ],
    priceCalculation: 'perTicket'
  },
  
  bowling: {
    id: 'bowling',
    name: 'Bowling',
    fields: [
      {
        type: 'personCount',
        id: 'participants',
        label: 'Anzahl Personen',
        required: true
      },
      {
        type: 'checkbox',
        id: 'shoeRental',
        label: 'Schuhverleih',
        options: {
          price: 4.50,
          description: 'Optional - Bowlingschuhe ausleihen'
        }
      }
    ],
    priceCalculation: 'perPerson'
  },
  
  swimming: {
    id: 'swimming',
    name: 'Schwimmbad',
    fields: [
      {
        type: 'personCount',
        id: 'participants',
        label: 'Anzahl Personen',
        required: true
      }
    ],
    priceCalculation: 'perPerson'
  },
  
  zoo: {
    id: 'zoo',
    name: 'Zoo/Tierpark',
    fields: [
      {
        type: 'ticketSelection',
        id: 'tickets',
        label: 'Eintrittskarten',
        required: true,
        options: {
          types: [
            { id: 'adult', label: 'Erwachsene', price: 18.00 },
            { id: 'child', label: 'Kinder (4-14 J.)', price: 12.00 },
            { id: 'infant', label: 'Kleinkinder (bis 3 J.)', price: 0 }
          ]
        }
      }
    ],
    priceCalculation: 'perTicket'
  },
  
  minigolf: {
    id: 'minigolf',
    name: 'Minigolf',
    fields: [
      {
        type: 'personCount',
        id: 'participants',
        label: 'Anzahl Personen',
        required: true
      },
      {
        type: 'additionalService',
        id: 'equipment',
        label: 'Schläger-Set',
        options: {
          price: 2.00,
          description: 'Schläger und Bälle (falls nicht vorhanden)'
        }
      }
    ],
    priceCalculation: 'perPerson'
  }
};

// Field Components
function PersonCountField({ value, onChange, max = 12 }: { value: number; onChange: (value: number) => void; max?: number }) {
  return (
    <Select value={value.toString()} onValueChange={(val) => onChange(parseInt(val))}>
      <SelectTrigger onClick={(e) => e.stopPropagation()}>
        <SelectValue placeholder="Wählen..." />
      </SelectTrigger>
      <SelectContent onClick={(e) => e.stopPropagation()}>
        {Array.from({length: max}, (_, i) => i + 1).map(num => (
          <SelectItem key={num} value={num.toString()}>
            {num} {num === 1 ? 'Person' : 'Personen'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TicketSelectionField({ config, value, onChange }: { 
  config: BookingFieldConfig; 
  value: { [key: string]: number }; 
  onChange: (value: { [key: string]: number }) => void 
}) {
  const ticketTypes = config.options?.types || [];
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
      {ticketTypes.map((type: any) => (
        <div key={type.id} className="flex items-center justify-between p-3 bg-white rounded border">
          <div>
            <div className="font-medium">{type.label}</div>
            <div className="text-sm text-gray-600">{type.price.toFixed(2)}€ / Ticket</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...value, [type.id]: Math.max(0, (value[type.id] || 0) - 1) })}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
            >
              −
            </button>
            <span className="w-8 text-center font-medium">{value[type.id] || 0}</span>
            <button
              type="button"
              onClick={() => onChange({ ...value, [type.id]: Math.min(12, (value[type.id] || 0) + 1) })}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SeatSelectionField({ 
  config, 
  selectedTime, 
  totalTickets, 
  value, 
  onChange 
}: { 
  config: BookingFieldConfig; 
  selectedTime: string; 
  totalTickets: number; 
  value: string[]; 
  onChange: (value: string[]) => void 
}) {
  const rows = config.options?.rows || ['A', 'B', 'C', 'D'];
  const seatsPerRow = config.options?.seatsPerRow || 10;
  
  const getOccupiedSeats = (time: string) => {
    const occupied = [];
    if (time === '14:30') occupied.push('A5', 'A6', 'B8', 'C2');
    if (time === '17:45') occupied.push('A1', 'A2', 'B5', 'B6');
    if (time === '20:30') occupied.push('A3', 'A4', 'B1', 'B2');
    return occupied;
  };

  const occupiedSeats = getOccupiedSeats(selectedTime);

  const toggleSeat = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return;
    
    if (value.includes(seatId)) {
      onChange(value.filter(seat => seat !== seatId));
    } else if (value.length < totalTickets) {
      onChange([...value, seatId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="bg-gray-200 h-2 rounded-full mb-2"></div>
        <div className="text-sm text-gray-600">LEINWAND</div>
      </div>

      <div className="space-y-2">
        {rows.map((row: string) => (
          <div key={row} className="flex items-center justify-center gap-1">
            <div className="w-6 text-center text-sm font-medium">{row}</div>
            {Array.from({length: seatsPerRow}, (_, i) => {
              const seatNumber = i + 1;
              const seatId = `${row}${seatNumber}`;
              const isOccupied = occupiedSeats.includes(seatId);
              const isSelected = value.includes(seatId);
              
              return (
                <button
                  key={seatId}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSeat(seatId);
                  }}
                  disabled={isOccupied}
                  type="button"
                  className={`
                    w-6 h-6 text-xs rounded-sm border transition-colors
                    ${isOccupied ? 'bg-red-200 border-red-300 cursor-not-allowed' : 
                      isSelected ? 'bg-blue-500 border-blue-600 text-white' : 
                      'bg-gray-100 border-gray-300 hover:bg-gray-200 cursor-pointer'}
                  `}
                >
                  {seatNumber}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded-sm"></div>
          <span>Frei</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded-sm"></div>
          <span>Ausgewählt</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-200 border border-red-300 rounded-sm"></div>
          <span>Belegt</span>
        </div>
      </div>
    </div>
  );
}

function CheckboxField({ config, value, onChange }: { 
  config: BookingFieldConfig; 
  value: boolean; 
  onChange: (value: boolean) => void 
}) {
  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className={`w-5 h-5 rounded border-2 cursor-pointer transition-colors ${
              value ? 'bg-blue-500 border-blue-500' : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onChange(!value);
            }}
          >
            {value && (
              <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div>
            <div className="text-sm font-medium">{config.label}</div>
            <div className="text-xs text-gray-500">{config.options?.description}</div>
          </div>
        </div>
        <div className="text-sm font-semibold text-blue-600">+{config.options?.price?.toFixed(2)}€</div>
      </div>
    </div>
  );
}

function MovieDetailsField({ offer }: { offer: any }) {
  if (!offer.movieDetails) return null;
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <img 
            src={offer.movieDetails.poster} 
            alt={offer.title}
            className="w-20 h-28 object-cover rounded-md shadow-md"
          />
        </div>
        
        <div className="flex-1 space-y-2">
          <h3 className="font-bold text-lg text-gray-800">{offer.title}</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{offer.duration}</span>
              <Users className="w-4 h-4 ml-2" />
              <span>max. {offer.maxParticipants} Personen</span>
            </div>
            <div><strong>Genre:</strong> {offer.movieDetails.genre}</div>
            <div><strong>FSK:</strong> {offer.movieDetails.rating}</div>
            <div><strong>Sprache:</strong> {offer.movieDetails.language}</div>
            <div><strong>Format:</strong> {offer.movieDetails.format}</div>
          </div>
          
          {offer.movieDetails.trailer && (
            <a 
              href={offer.movieDetails.trailer} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ▶ Trailer ansehen
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Template Engine Component
interface BookingTemplateEngineProps {
  template: ActivityTemplate;
  offer: any;
  selectedDate: string;
  selectedTime: string;
  onBooking: (bookingData: any) => void;
}

export default function BookingTemplateEngine({ 
  template, 
  offer, 
  selectedDate, 
  selectedTime, 
  onBooking 
}: BookingTemplateEngineProps) {
  const [formData, setFormData] = useState<{ [key: string]: any }>({
    participants: 1,
    tickets: {},
    seats: [],
    shoeRental: false,
    equipment: false
  });

  const updateField = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const calculateTotalPrice = () => {
    let total = 0;
    
    if (template.priceCalculation === 'perPerson') {
      total = offer.price * (formData.participants || 1);
    } else if (template.priceCalculation === 'perTicket') {
      const ticketTypes = template.fields.find(f => f.type === 'ticketSelection')?.options?.types || [];
      for (const type of ticketTypes) {
        total += (formData.tickets[type.id] || 0) * type.price;
      }
    } else if (template.priceCalculation === 'fixed') {
      total = offer.price;
    }
    
    // Add additional services
    template.fields.forEach(field => {
      if ((field.type === 'checkbox' || field.type === 'additionalService') && formData[field.id] && field.options?.price) {
        total += field.options.price;
      }
    });
    
    return total;
  };

  const getTotalTickets = () => {
    return Object.values(formData.tickets).reduce((sum: number, count: any) => sum + (count || 0), 0);
  };

  const isFormValid = () => {
    for (const field of template.fields) {
      if (field.required) {
        if (field.type === 'personCount' && (!formData.participants || formData.participants <= 0)) {
          return false;
        }
        if (field.type === 'ticketSelection' && getTotalTickets() <= 0) {
          return false;
        }
        if (field.type === 'seatSelection' && formData.seats.length !== getTotalTickets()) {
          return false;
        }
      }
    }
    return true;
  };

  const handleBooking = () => {
    if (!isFormValid()) return;

    onBooking({
      offerTitle: offer.title,
      date: selectedDate,
      time: selectedTime,
      totalPrice: calculateTotalPrice(),
      formData,
      activityType: template.id
    });
  };

  // Add safety check for template
  if (!template || !template.fields) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Buchungsformular wird geladen...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {template.fields.map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-medium mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {field.type === 'movieDetails' && (
            <MovieDetailsField offer={offer} />
          )}
          
          {field.type === 'personCount' && (
            <PersonCountField
              value={formData[field.id] || 1}
              onChange={(value) => updateField(field.id, value)}
            />
          )}
          
          {field.type === 'ticketSelection' && (
            <TicketSelectionField
              config={field}
              value={formData[field.id] || {}}
              onChange={(value) => updateField(field.id, value)}
            />
          )}
          
          {field.type === 'seatSelection' && getTotalTickets() > 0 && (
            <SeatSelectionField
              config={field}
              selectedTime={selectedTime}
              totalTickets={getTotalTickets()}
              value={formData[field.id] || []}
              onChange={(value) => updateField(field.id, value)}
            />
          )}
          
          {(field.type === 'checkbox' || field.type === 'additionalService') && (
            <CheckboxField
              config={field}
              value={formData[field.id] || false}
              onChange={(value) => updateField(field.id, value)}
            />
          )}
        </div>
      ))}

      {/* Price Summary */}
      <div className="space-y-2 mb-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="font-medium">Gesamtpreis:</span>
          <span className="text-xl font-bold text-blue-600">
            {calculateTotalPrice().toFixed(2)}€
          </span>
        </div>
      </div>

      {/* Booking Button */}
      <Button 
        type="button"
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        onClick={handleBooking}
        disabled={!isFormValid()}
      >
        {!isFormValid() ? 'Bitte alle Pflichtfelder ausfüllen' : 'Weiter zur Buchung'}
      </Button>
    </div>
  );
}