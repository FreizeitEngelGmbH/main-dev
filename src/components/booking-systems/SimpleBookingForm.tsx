import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useLocation } from "wouter";
import { Calendar, Clock, Users, CreditCard, CalendarIcon, Ticket, Armchair, GraduationCap, Layers } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Blueprint Booking Types
export type BookingType = "TIME_SLOT" | "DAY_PASS" | "RESOURCE" | "EVENT";

// Alias for backwards compatibility
export type BookingArchetype = BookingType | "slot_based" | "seat_based" | "capacity_based" | "course_based";

// Normalize legacy archetype values to new BookingType
const normalizeBookingType = (archetype: BookingArchetype): BookingType => {
  switch (archetype) {
    case "slot_based":
      return "TIME_SLOT";
    case "seat_based":
    case "capacity_based":
      return "DAY_PASS";
    case "course_based":
      return "EVENT";
    case "TIME_SLOT":
    case "DAY_PASS":
    case "RESOURCE":
    case "EVENT":
      return archetype;
    default:
      return "TIME_SLOT";
  }
};

const ALL_TIME_SLOTS = [
  "09:00", "09:20", "09:40", "10:00", "10:20", "10:40", "11:00", "11:20", "11:40", "12:00",
  "12:20", "12:40", "13:00", "13:20", "13:40", "14:00", "14:20", "14:40", "15:00", "15:20",
  "15:40", "16:00", "16:20", "16:40", "17:00", "17:20", "17:40", "18:00", "18:20", "18:40",
  "19:00", "19:20", "19:40", "20:00", "20:20", "20:40", "21:00", "21:20", "21:40", "22:00",
  "22:20", "22:40"
];

type TimeFilter = "ALLE" | "MORGENS" | "MITTAGS" | "ABENDS";

const filterTimeSlots = (filter: TimeFilter): string[] => {
  switch (filter) {
    case "MORGENS":
      return ALL_TIME_SLOTS.filter(t => {
        const hour = parseInt(t.split(":")[0]);
        return hour >= 9 && hour < 12;
      });
    case "MITTAGS":
      return ALL_TIME_SLOTS.filter(t => {
        const hour = parseInt(t.split(":")[0]);
        return hour >= 12 && hour < 17;
      });
    case "ABENDS":
      return ALL_TIME_SLOTS.filter(t => {
        const hour = parseInt(t.split(":")[0]);
        return hour >= 17;
      });
    default:
      return ALL_TIME_SLOTS;
  }
};

const getBookingTypeIcon = (type: BookingType) => {
  switch (type) {
    case "TIME_SLOT":
      return <Clock className="h-4 w-4" />;
    case "DAY_PASS":
      return <Ticket className="h-4 w-4" />;
    case "RESOURCE":
      return <Layers className="h-4 w-4" />;
    case "EVENT":
      return <GraduationCap className="h-4 w-4" />;
  }
};

const getBookingTypeLabel = (type: BookingType): string => {
  switch (type) {
    case "TIME_SLOT":
      return "Zeitfenster-Buchung";
    case "DAY_PASS":
      return "Tagespass";
    case "RESOURCE":
      return "Ressourcen-Buchung";
    case "EVENT":
      return "Kurs/Event-Buchung";
  }
};

interface SimpleBookingFormProps {
  offer: any;
  partner: any;
  activityType: string;
  cart?: any[];
  cartTotal?: number;
  bookingArchetype?: BookingArchetype;
  category?: any;
}

export default function SimpleBookingForm({ 
  offer, 
  partner, 
  activityType, 
  cart = [], 
  cartTotal = 0,
  bookingArchetype = "TIME_SLOT",
  category
}: SimpleBookingFormProps) {
  const [, setLocation] = useLocation();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("ALLE");
  
  const bookingType = normalizeBookingType(bookingArchetype);
  
  const [formData, setFormData] = useState({
    participants: 1,
    selectedDate: null as Date | null,
    selectedTime: '',
    specialRequests: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    paymentMethod: 'paypal',
    selectedResource: '',
    adultsCount: 1,
    childrenCount: 0,
    ticketType: 'standard',
    selectedCourse: '',
    equipmentRental: false
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    const baseValid = formData.selectedDate && 
           formData.selectedTime && 
           formData.firstName && 
           formData.lastName && 
           formData.email;
    
    if (!baseValid) return false;
    
    switch (bookingType) {
      case "TIME_SLOT":
        return formData.selectedResource && formData.participants > 0;
      case "DAY_PASS":
        return (formData.adultsCount + formData.childrenCount) > 0;
      case "EVENT":
        return formData.selectedCourse && formData.participants > 0;
      case "RESOURCE":
        return formData.selectedResource && formData.participants > 0;
      default:
        return formData.participants > 0;
    }
  };

  const handleBooking = () => {
    if (!isFormValid()) return;

    const calculatedTotal = calculateTotalPrice();
    const participantCount = bookingType === "DAY_PASS" 
      ? formData.adultsCount + formData.childrenCount 
      : formData.participants;

    setLocation('/confirmation', {
      state: {
        bookingData: {
          ...formData,
          selectedDate: formData.selectedDate ? format(formData.selectedDate, 'yyyy-MM-dd') : '',
          offers: cart.length > 0 ? cart : [offer],
          totalPrice: calculatedTotal,
          participants: participantCount,
          bookingType: bookingType,
          equipmentRental: formData.equipmentRental,
          partner: partner,
          activityType: activityType
        }
      }
    });
  };

  const calculateTotalPrice = () => {
    if (cart.length > 0) return cartTotal;
    
    if (bookingType === "DAY_PASS") {
      const adultPrice = offer.price;
      const childPrice = offer.price * 0.5;
      let basePrice = (formData.adultsCount * adultPrice) + (formData.childrenCount * childPrice);
      if (category?.requiresEquipment && formData.equipmentRental) {
        basePrice += (formData.adultsCount + formData.childrenCount) * 5;
      }
      return basePrice;
    }
    
    let basePrice = offer.price * formData.participants;
    if (category?.requiresEquipment && formData.equipmentRental) {
      basePrice += formData.participants * 5;
    }
    return basePrice;
  };

  const totalPrice = calculateTotalPrice();

  const getResourceOptions = () => {
    switch (activityType.toLowerCase()) {
      case "bowling":
        return ["Bahn 1", "Bahn 2", "Bahn 3", "Bahn 4", "Bahn 5", "Bahn 6"];
      case "minigolf":
        return ["Parcours A", "Parcours B", "Outdoor-Bahn"];
      case "billard & dart":
        return ["Tisch 1", "Tisch 2", "Tisch 3", "Dart-Bereich 1", "Dart-Bereich 2"];
      case "escape rooms":
        return ["Raum: Das Geheimnis", "Raum: Der Tresor", "Raum: Das Labor"];
      case "kegelbahn":
        return ["Kegelbahn 1", "Kegelbahn 2"];
      case "lasertag":
        return ["Arena A", "Arena B"];
      default:
        return ["Ressource 1", "Ressource 2", "Ressource 3"];
    }
  };

  return (
    <div className="space-y-6">
      {bookingType && (
        <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
          {getBookingTypeIcon(bookingType)}
          <span className="font-medium">{getBookingTypeLabel(bookingType)}</span>
        </div>
      )}

      {(bookingType === "TIME_SLOT" || bookingType === "RESOURCE") && 
       activityType.toLowerCase() !== "bowling" && (
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Layers className="h-4 w-4" />
            Ressource auswählen
          </Label>
          <Select 
            value={formData.selectedResource} 
            onValueChange={(value) => updateField('selectedResource', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wählen Sie eine Ressource" />
            </SelectTrigger>
            <SelectContent>
              {getResourceOptions().map(resource => (
                <SelectItem key={resource} value={resource}>
                  {resource}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {activityType.toLowerCase() === "bowling" && (
        <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded">
          Eine freie Bowling-Bahn wird automatisch zugewiesen
        </p>
      )}

      {bookingType === "DAY_PASS" && (
        <div className="bg-blue-50 p-4 rounded-lg space-y-4">
          <Label className="flex items-center gap-2 font-medium">
            <Ticket className="h-4 w-4" />
            Ticketauswahl
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-600">Erwachsene</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => updateField('adultsCount', Math.max(0, formData.adultsCount - 1))}
                >
                  -
                </Button>
                <span className="w-8 text-center font-medium">{formData.adultsCount}</span>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => updateField('adultsCount', formData.adultsCount + 1)}
                >
                  +
                </Button>
                <span className="text-sm text-gray-500">à {offer.price.toFixed(2)}€</span>
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Kinder (bis 14 J.)</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => updateField('childrenCount', Math.max(0, formData.childrenCount - 1))}
                >
                  -
                </Button>
                <span className="w-8 text-center font-medium">{formData.childrenCount}</span>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => updateField('childrenCount', formData.childrenCount + 1)}
                >
                  +
                </Button>
                <span className="text-sm text-gray-500">à {(offer.price * 0.5).toFixed(2)}€</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mt-3">
            {["standard", "familienkarte", "gruppenticket"].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => updateField('ticketType', type)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full border transition-colors",
                  formData.ticketType === type
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-purple-400"
                )}
              >
                {type === "standard" ? "Einzelticket" : type === "familienkarte" ? "Familienkarte" : "Gruppenticket"}
              </button>
            ))}
          </div>
        </div>
      )}

      {bookingType === "EVENT" && (
        <div className="bg-green-50 p-4 rounded-lg space-y-4">
          <Label className="flex items-center gap-2 font-medium">
            <GraduationCap className="h-4 w-4" />
            Kursauswahl
          </Label>
          <Select 
            value={formData.selectedCourse} 
            onValueChange={(value) => updateField('selectedCourse', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Kurs wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anfaenger">Anfänger-Kurs</SelectItem>
              <SelectItem value="fortgeschritten">Fortgeschrittenen-Kurs</SelectItem>
              <SelectItem value="einzelstunde">Einzelstunde</SelectItem>
              <SelectItem value="gruppenkurs">Gruppenkurs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {category?.requiresEquipment && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="equipmentRental"
            checked={formData.equipmentRental}
            onChange={(e) => updateField('equipmentRental', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <Label htmlFor="equipmentRental" className="text-sm cursor-pointer">
            Leihausrüstung benötigt (+5,00€ pro Person)
          </Label>
        </div>
      )}

      {/* Datum & Zeit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date" className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4" />
            Datum auswählen
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.selectedDate ? (
                  format(formData.selectedDate, "PPP", { locale: de })
                ) : (
                  <span>Datum auswählen</span>
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

      </div>

      {/* Uhrzeitauswahl mit Filter */}
      <div>
        <Label className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4" />
          Uhrzeit auswählen
        </Label>
        
        {/* Time Filter Buttons */}
        <div className="flex items-center gap-4 mb-3">
          <span className="text-sm text-gray-600 font-medium">Filtern:</span>
          {(["ALLE", "MORGENS", "MITTAGS", "ABENDS"] as TimeFilter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setTimeFilter(filter)}
              className={cn(
                "text-sm font-medium transition-colors",
                timeFilter === filter 
                  ? "text-green-600" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
        
        {/* Time Slots Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {filterTimeSlots(timeFilter).map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => updateField('selectedTime', time)}
              className={cn(
                "px-2 py-2 text-sm font-medium rounded transition-all",
                formData.selectedTime === time
                  ? "bg-purple-600 text-white"
                  : "bg-[#9a9a6c] text-white hover:bg-[#8a8a5c]"
              )}
              data-testid={`time-slot-${time}`}
            >
              {time} Uhr
            </button>
          ))}
        </div>
        
        {formData.selectedTime && (
          <p className="text-sm text-green-600 mt-2">
            Ausgewählt: {formData.selectedTime} Uhr
          </p>
        )}
      </div>

      {/* Anzahl Personen */}
      <div>
        <Label htmlFor="participants" className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4" />
          Anzahl der Personen
        </Label>
        <Select 
          value={formData.participants.toString()} 
          onValueChange={(value) => updateField('participants', parseInt(value))}
        >
          <SelectTrigger data-testid="select-participants">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: offer?.maxParticipants || 10 }, (_, i) => i + 1).map(num => (
              <SelectItem key={num} value={num.toString()}>
                {num} {num === 1 ? 'Person' : 'Personen'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sonstige Wünsche */}
      <div>
        <Label htmlFor="specialRequests" className="mb-2 block">
          Sonstige Wünsche
        </Label>
        <textarea
          id="specialRequests"
          value={formData.specialRequests || ''}
          onChange={(e) => updateField('specialRequests', e.target.value)}
          placeholder="Haben Sie besondere Wünsche oder Anmerkungen? (optional)"
          className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          data-testid="input-special-requests"
        />
      </div>

      {/* Persönliche Daten */}
      <div className="border-t pt-6">
        <h3 className="font-medium mb-4">Kontaktdaten</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Vorname *</Label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              placeholder="Ihr Vorname"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Nachname *</Label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              placeholder="Ihr Nachname"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">E-Mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="ihre@email.de"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+49 123 456789"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Zahlungsmethode */}
      <div className="border-t pt-6">
        <Label className="flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4" />
          Zahlungsmethode
        </Label>
        <Select value={formData.paymentMethod} onValueChange={(value) => updateField('paymentMethod', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paypal">PayPal</SelectItem>
            <SelectItem value="credit">Kreditkarte</SelectItem>
            <SelectItem value="bank">Banküberweisung</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Preis-Übersicht */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-3">Buchungsübersicht</h3>
        
        {cart.length > 0 ? (
          <>
            {cart.map((item: any) => (
              <div key={item.id} className="flex justify-between py-2">
                <span>{item.title} (x{item.quantity})</span>
                <span>{(item.price * item.quantity).toFixed(2)}€</span>
              </div>
            ))}
          </>
        ) : (
          <div className="flex justify-between py-2">
            <span>{offer.title} ({formData.participants} {formData.participants === 1 ? 'Person' : 'Personen'})</span>
            <span>{(offer.price * formData.participants).toFixed(2)}€</span>
          </div>
        )}
        
        <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
          <span>Gesamtpreis:</span>
          <span>{totalPrice.toFixed(2)}€</span>
        </div>
      </div>

      {/* Buchungsbutton */}
      <Button 
        onClick={handleBooking}
        disabled={!isFormValid()}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg font-medium"
      >
        Jetzt verbindlich buchen - {totalPrice.toFixed(2)}€
      </Button>

      <div className="text-xs text-gray-500 text-center">
        Mit der Buchung akzeptieren Sie unsere AGB. Die Buchung ist sofort gültig.
      </div>
    </div>
  );
}