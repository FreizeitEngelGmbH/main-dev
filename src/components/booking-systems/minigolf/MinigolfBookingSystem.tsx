import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Flag, Users, Sun, Moon, TreePine, Sparkles } from "lucide-react";

interface MinigolfOffer {
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

interface MinigolfBookingSystemProps {
  offer: MinigolfOffer;
  selectedDate: string;
  selectedTime: string;
  onBooking: (bookingData: any) => void;
}

const COURSES = [
  { 
    id: "classic", 
    name: "Klassischer Parcours", 
    holes: 18,
    difficulty: "Leicht",
    theme: "Traditional",
    icon: Flag,
    description: "Der Klassiker für die ganze Familie"
  },
  { 
    id: "adventure", 
    name: "Abenteuer-Parcours", 
    holes: 18,
    difficulty: "Mittel",
    theme: "Dschungel",
    icon: TreePine,
    description: "Durch Wasserfälle und Höhlen"
  },
  { 
    id: "glow", 
    name: "Schwarzlicht-Minigolf", 
    holes: 18,
    difficulty: "Mittel",
    theme: "Neon",
    icon: Sparkles,
    description: "Leuchtende Bahnen im Dunkeln",
    extraPrice: 3
  },
  { 
    id: "pro", 
    name: "Pro-Challenge", 
    holes: 12,
    difficulty: "Schwer",
    theme: "Competition",
    icon: Flag,
    description: "Für echte Minigolf-Profis",
    extraPrice: 2
  }
];

export default function MinigolfBookingSystem({ offer, selectedDate, selectedTime, onBooking }: MinigolfBookingSystemProps) {
  const [selectedCourse, setSelectedCourse] = useState("classic");
  const [players, setPlayers] = useState(2);
  const [equipmentRental, setEquipmentRental] = useState(true);
  const [timeSlot, setTimeSlot] = useState("afternoon");
  const [snackPackage, setSnackPackage] = useState("none");

  const course = COURSES.find(c => c.id === selectedCourse)!;
  const courseExtra = course.extraPrice || 0;
  const basePrice = (offer.price + courseExtra) * players;
  const equipmentCost = equipmentRental ? 0 : 0;
  const snackCost = snackPackage === "family" ? 15 : snackPackage === "duo" ? 8 : 0;
  const totalPrice = basePrice + equipmentCost + snackCost;

  const handleBooking = () => {
    onBooking({
      offerTitle: offer.title,
      date: selectedDate,
      time: selectedTime,
      course: course.name,
      holes: course.holes,
      players,
      equipmentRental,
      timeSlot,
      snackPackage,
      totalPrice,
      activityType: 'minigolf'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Flag className="h-6 w-6" />
          <h2 className="text-xl font-bold">Minigolf Buchung</h2>
        </div>
        <p className="text-green-100">Wähle deinen Parcours und starte das Spiel</p>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-lg font-medium">
          <Flag className="h-5 w-5 text-green-600" />
          Parcours wählen
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COURSES.map(c => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCourse(c.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedCourse === c.id 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    c.id === 'glow' ? 'bg-purple-100' : 'bg-green-100'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      c.id === 'glow' ? 'text-purple-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold">{c.name}</div>
                        <div className="text-sm text-gray-500">{c.holes} Bahnen • {c.difficulty}</div>
                      </div>
                      {c.extraPrice && (
                        <span className="text-sm font-medium text-green-600">+{c.extraPrice}€/P.</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-500" />
            Anzahl Spieler
          </Label>
          <Select value={players.toString()} onValueChange={(v) => setPlayers(parseInt(v))}>
            <SelectTrigger className="border-green-200 focus:ring-green-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'Spieler' : 'Spieler'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            {timeSlot === "evening" ? (
              <Moon className="h-4 w-4 text-indigo-500" />
            ) : (
              <Sun className="h-4 w-4 text-yellow-500" />
            )}
            Tageszeit
          </Label>
          <Select value={timeSlot} onValueChange={setTimeSlot}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Vormittag (10:00 - 12:00)</SelectItem>
              <SelectItem value="afternoon">Nachmittag (12:00 - 17:00)</SelectItem>
              <SelectItem value="evening">Abend (17:00 - 21:00)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-lg font-medium">🍿 Snack-Paket (optional)</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: "none", name: "Kein Paket", price: 0, items: [] },
            { id: "duo", name: "Duo-Paket", price: 8, items: ["2x Getränk", "1x Snack zum Teilen"] },
            { id: "family", name: "Familien-Paket", price: 15, items: ["4x Getränk", "2x Snack", "1x Eis pro Person"] }
          ].map(pkg => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => setSnackPackage(pkg.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                snackPackage === pkg.id 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{pkg.name}</span>
                {pkg.price > 0 && (
                  <span className="text-sm text-orange-600">+{pkg.price}€</span>
                )}
              </div>
              {pkg.items.length > 0 && (
                <ul className="text-xs text-gray-500">
                  {pkg.items.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
        <input
          type="checkbox"
          id="equipmentRental"
          checked={equipmentRental}
          onChange={(e) => setEquipmentRental(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <Label htmlFor="equipmentRental" className="text-sm cursor-pointer">
          ⛳ Schläger & Ball inklusive (im Preis enthalten)
        </Label>
      </div>

      <div className="bg-gradient-to-r from-green-800 to-emerald-700 text-white p-4 rounded-lg space-y-3">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Flag className="h-5 w-5" />
          Spielübersicht
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-green-200">Parcours:</span>
          <span>{course.name}</span>
          <span className="text-green-200">Bahnen:</span>
          <span>{course.holes}</span>
          <span className="text-green-200">Spieler:</span>
          <span>{players}</span>
          <span className="text-green-200">Tageszeit:</span>
          <span>{timeSlot === "morning" ? "Vormittag" : timeSlot === "afternoon" ? "Nachmittag" : "Abend"}</span>
        </div>
        <div className="border-t border-green-600 pt-3 mt-3">
          <div className="flex justify-between text-sm">
            <span>Grundpreis ({players}x {offer.price + courseExtra}€)</span>
            <span>{basePrice.toFixed(2)}€</span>
          </div>
          {snackCost > 0 && (
            <div className="flex justify-between text-sm text-orange-300">
              <span>Snack-Paket</span>
              <span>+{snackCost.toFixed(2)}€</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-green-600">
            <span>Gesamt</span>
            <span className="text-yellow-300">{totalPrice.toFixed(2)}€</span>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleBooking}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 text-lg"
      >
        <Flag className="mr-2 h-5 w-5" />
        Abschlag buchen
      </Button>
    </div>
  );
}
