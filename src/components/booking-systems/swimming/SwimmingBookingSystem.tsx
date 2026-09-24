import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SwimmingOffer {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  duration: string;
  maxParticipants: number;
  includes: string[];
  timeSlots: string[];
  freeEntry?: boolean;
  originalPrice?: number;
}

interface SwimmingBookingSystemProps {
  offer: SwimmingOffer;
  selectedDate: string;
  selectedTime: string;
  onBooking: (bookingData: any) => void;
}

export default function SwimmingBookingSystem({ offer, selectedDate, selectedTime, onBooking }: SwimmingBookingSystemProps) {
  const [participants, setParticipants] = useState(1);

  const totalPrice = offer.freeEntry ? 0 : (offer.price * participants);
  const isBookingValid = participants > 0;

  const handleBooking = () => {
    if (!isBookingValid) return;

    onBooking({
      offerTitle: offer.title,
      date: selectedDate,
      time: selectedTime,
      participants,
      totalPrice,
      activityType: 'swimming'
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

      {/* Swimming Pool Info */}
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
        <strong>Schwimmbad-Erlebnis:</strong> Entspannung und Spaß im Wasser. 
        Handtücher und Badebekleidung bitte selbst mitbringen.
      </div>

      {/* Price Summary */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span>{offer.title} × {participants}</span>
          <span>{offer.freeEntry ? 'Kostenlos' : `${(offer.price * participants).toFixed(2)}€`}</span>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-medium">Gesamtpreis:</span>
          <span className="text-xl font-bold text-blue-600">
            {offer.freeEntry ? 'Kostenlos' : `${totalPrice.toFixed(2)}€`}
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