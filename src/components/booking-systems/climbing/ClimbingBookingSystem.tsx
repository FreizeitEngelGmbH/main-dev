import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import { Calendar, Clock, Users, CreditCard, Ticket, Mountain, Package } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface RentalItem {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface ClimbingBookingSystemProps {
  offer: any;
  partner: any;
  categoryName: string;
  rentalItems?: RentalItem[];
}

const DEFAULT_RENTAL_ITEMS: RentalItem[] = [
  { id: "gurt", name: "Klettergurt", price: 300, description: "Leihgurt" },
  { id: "schuhe", name: "Kletterschuhe", price: 400, description: "Leihschuhe" },
  { id: "sicherung", name: "Sicherungsgerät", price: 250, description: "Sicherungsgerät" },
  { id: "chalkbag", name: "Chalkbag", price: 150, description: "Chalkbag mit Chalk" },
  { id: "expressen", name: "Expressen", price: 400, description: "Expressen-Set" },
  { id: "ohm", name: "Edelrid Ohm", price: 400, description: "Gewichtsausgleich" },
];

const PARTNER_RENTAL_ITEMS: Record<number, RentalItem[]> = {
  875: [
    { id: "gurt", name: "Klettergurt", price: 300 },
    { id: "schuhe", name: "Kletterschuhe", price: 400 },
    { id: "sicherung", name: "Sicherungsgerät", price: 250 },
    { id: "chalkbag", name: "Chalkbag", price: 150 },
    { id: "expressen", name: "Expressen", price: 400 },
    { id: "ohm", name: "Edelrid Ohm", price: 400 },
  ],
};

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
];

export default function ClimbingBookingSystem({
  offer,
  partner,
  categoryName,
  rentalItems,
}: ClimbingBookingSystemProps) {
  const [, setLocation] = useLocation();

  const items = rentalItems || PARTNER_RENTAL_ITEMS[partner?.id] || DEFAULT_RENTAL_ITEMS;

  const [formData, setFormData] = useState({
    selectedDate: null as Date | null,
    selectedTime: "",
    participants: 1,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    selectedRentals: {} as Record<string, boolean>,
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleRental = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedRentals: {
        ...prev.selectedRentals,
        [id]: !prev.selectedRentals[id],
      },
    }));
  };

  const rentalTotal = items.reduce(
    (sum, item) =>
      sum + (formData.selectedRentals[item.id] ? item.price * formData.participants : 0),
    0
  );

  const ticketTotal = offer.price * formData.participants;
  const totalPrice = ticketTotal + rentalTotal;

  const isFormValid =
    formData.selectedDate &&
    formData.selectedTime &&
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.participants > 0;

  const handleBooking = () => {
    if (!isFormValid) return;

    const selectedRentalNames = items
      .filter((item) => formData.selectedRentals[item.id])
      .map((item) => item.name);

    setLocation("/confirmation", {
      state: {
        bookingData: {
          ...formData,
          selectedDate: formData.selectedDate
            ? format(formData.selectedDate, "yyyy-MM-dd")
            : "",
          offers: [offer],
          totalPrice,
          participants: formData.participants,
          bookingType: "DAY_PASS",
          equipmentRental: selectedRentalNames.length > 0,
          equipmentDetails: selectedRentalNames,
          rentalTotal,
          partner,
          activityType: categoryName,
        },
      },
    });
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2).replace(".", ",") + "€";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
        <Mountain className="h-4 w-4" />
        <span className="font-medium">Kletter- & Boulder-Buchung</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              Datum wählen *
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
                  <Calendar className="h-4 w-4 mr-2" />
                  {formData.selectedDate
                    ? format(formData.selectedDate, "PPP", { locale: de })
                    : "Datum auswählen"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.selectedDate || undefined}
                  onSelect={(date) => updateField("selectedDate", date)}
                  disabled={(date) => date < new Date()}
                  locale={de}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4" />
              Uhrzeit wählen *
            </Label>
            <div className="grid grid-cols-5 gap-1.5 max-h-[200px] overflow-y-auto p-1">
              {TIME_SLOTS.map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant={formData.selectedTime === time ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "text-xs",
                    formData.selectedTime === time &&
                      "bg-purple-600 hover:bg-purple-700"
                  )}
                  onClick={() => updateField("selectedTime", time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4" />
              Anzahl Personen *
            </Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  updateField("participants", Math.max(1, formData.participants - 1))
                }
              >
                -
              </Button>
              <span className="w-8 text-center font-bold text-lg">
                {formData.participants}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateField("participants", formData.participants + 1)}
              >
                +
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <Label className="flex items-center gap-2 mb-3 text-orange-800 font-semibold">
              <Package className="h-4 w-4" />
              Zubehör & Verleih (optional)
            </Label>
            <p className="text-xs text-orange-600 mb-3">
              Preis pro Person · wird {formData.participants > 1 ? `${formData.participants}x` : "1x"} berechnet
            </p>
            <div className="space-y-2">
              {items.map((item) => (
                <label
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all",
                    formData.selectedRentals[item.id]
                      ? "bg-orange-100 border-orange-400"
                      : "bg-white border-gray-200 hover:border-orange-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={!!formData.selectedRentals[item.id]}
                      onCheckedChange={() => toggleRental(item.id)}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-orange-700">
                    {formatPrice(item.price)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Kontaktdaten
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Vorname *</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="Max"
            />
          </div>
          <div>
            <Label>Nachname *</Label>
            <Input
              value={formData.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Mustermann"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>E-Mail *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="max@beispiel.de"
            />
          </div>
          <div>
            <Label>Telefon</Label>
            <Input
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="0170 1234567"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            {formData.participants}x {offer.title}
          </span>
          <span>{formatPrice(ticketTotal)}</span>
        </div>
        {items
          .filter((item) => formData.selectedRentals[item.id])
          .map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-orange-700">
              <span>
                {formData.participants}x {item.name}
              </span>
              <span>{formatPrice(item.price * formData.participants)}</span>
            </div>
          ))}
        <div className="flex justify-between font-bold text-lg pt-2 border-t">
          <span>Gesamtpreis</span>
          <span className="text-purple-700">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <Button
        onClick={handleBooking}
        disabled={!isFormValid}
        className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6"
      >
        <Ticket className="h-5 w-5 mr-2" />
        Jetzt buchen · {formatPrice(totalPrice)}
      </Button>
    </div>
  );
}
