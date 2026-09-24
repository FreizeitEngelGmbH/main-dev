import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BowlingOffer {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  duration: string;
  maxParticipants: number;
  includes: string[];
  timeSlots: string[];
}

interface BowlingBookingSystemProps {
  offer: BowlingOffer;
  selectedDate: string;
  selectedTime: string;
  onBooking: (bookingData: any) => void;
}

export default function BowlingBookingSystem({ offer, selectedDate, selectedTime, onBooking }: BowlingBookingSystemProps) {
  const [participants, setParticipants] = useState(1);
  const [shoeRental, setShoeRental] = useState(false);

  const totalPrice = (offer.price * participants) + (shoeRental ? 4.50 : 0);
  const isBookingValid = participants > 0;

  const handleBooking = () => {
    if (!isBookingValid) return;

    onBooking({
      offerTitle: offer.title,
      date: selectedDate,
      time: selectedTime,
      participants,
      totalPrice,
      shoeRental,
      activityType: 'bowling'
    });
  };

  return (
    <div className="space-y-4">
      {/* Person Selection */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Anzahl Personen
        </label>
        <Select value={participants.toString()} onValueChange={(value) => setParticipants(parseInt(value))}>
          <SelectTrigger 
            className="select-trigger"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <SelectValue placeholder="Wählen..." />
          </SelectTrigger>
          <SelectContent 
            className="select-content"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {Array.from({length: 12}, (_, i) => i + 1).map(num => (
              <SelectItem 
                key={num} 
                value={num.toString()}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {num} {num === 1 ? 'Person' : 'Personen'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
        <strong>Bowling-Erlebnis:</strong> Keine Sitzplatzreservierung erforderlich. 
        Sie erhalten bei Ankunft eine freie Bowling-Bahn zugewiesen.
      </div>

      {/* Shoe Rental Option */}
      <div className="border rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className={`w-5 h-5 rounded border-2 cursor-pointer transition-colors ${
                shoeRental ? 'bg-blue-500 border-blue-500' : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setShoeRental(!shoeRental);
              }}
            >
              {shoeRental && (
                <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <div className="text-sm font-medium">Schuhverleih</div>
              <div className="text-xs text-gray-500">Optional - Bowlingschuhe ausleihen</div>
            </div>
          </div>
          <div className="text-sm font-semibold text-blue-600">+4,50€</div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span>{offer.title} × {participants}</span>
          <span>{(offer.price * participants).toFixed(2)}€</span>
        </div>
        
        {shoeRental && (
          <div className="flex justify-between text-sm">
            <span>Schuhverleih</span>
            <span>4,50€</span>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-medium">Gesamtpreis:</span>
          <span className="text-xl font-bold text-blue-600">
            {totalPrice.toFixed(2)}€
          </span>
        </div>
      </div>

      {/* Booking Button */}
      <Button 
        type="button"
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        onClick={handleBooking}
        disabled={!isBookingValid}
      >
        Weiter zur Buchung
      </Button>
    </div>
  );
}