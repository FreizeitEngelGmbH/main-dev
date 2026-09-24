import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Key, Users, Clock, Skull, Brain, Lock } from "lucide-react";

interface EscapeRoomOffer {
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

interface EscapeRoomBookingSystemProps {
  offer: EscapeRoomOffer;
  selectedDate: string;
  selectedTime: string;
  onBooking: (bookingData: any) => void;
}

const ROOMS = [
  { 
    id: "prison-break", 
    name: "Prison Break", 
    theme: "Gefängnis",
    difficulty: 4,
    duration: 60,
    minPlayers: 2,
    maxPlayers: 6,
    description: "Entkomme aus der Hochsicherheitszelle bevor die Wachen zurückkehren",
    successRate: 35
  },
  { 
    id: "haunted-mansion", 
    name: "Das Geisterhaus", 
    theme: "Horror",
    difficulty: 5,
    duration: 60,
    minPlayers: 3,
    maxPlayers: 6,
    description: "Überlebe die Nacht im verfluchten Herrenhaus",
    successRate: 22
  },
  { 
    id: "bank-heist", 
    name: "Der große Bankraub", 
    theme: "Krimi",
    difficulty: 3,
    duration: 60,
    minPlayers: 2,
    maxPlayers: 5,
    description: "Knacke den Tresor und entwische bevor der Alarm losgeht",
    successRate: 48
  },
  { 
    id: "mad-scientist", 
    name: "Labor des Wahnsinns", 
    theme: "Sci-Fi",
    difficulty: 4,
    duration: 75,
    minPlayers: 3,
    maxPlayers: 8,
    description: "Stoppe das Experiment bevor es die Stadt zerstört",
    successRate: 31
  },
  { 
    id: "pharaoh-tomb", 
    name: "Grabkammer des Pharaos", 
    theme: "Abenteuer",
    difficulty: 2,
    duration: 45,
    minPlayers: 2,
    maxPlayers: 4,
    description: "Finde den Schatz und entkomme den antiken Fallen - perfekt für Anfänger",
    successRate: 65
  }
];

export default function EscapeRoomBookingSystem({ offer, selectedDate, selectedTime, onBooking }: EscapeRoomBookingSystemProps) {
  const [selectedRoom, setSelectedRoom] = useState("");
  const [teamSize, setTeamSize] = useState(2);
  const [hintPackage, setHintPackage] = useState("standard");
  const [privateSession, setPrivateSession] = useState(false);

  const room = ROOMS.find(r => r.id === selectedRoom);
  
  const basePrice = room ? offer.price * teamSize : 0;
  const hintCost = hintPackage === "unlimited" ? 15 : hintPackage === "extra" ? 8 : 0;
  const privateCost = privateSession ? 25 : 0;
  const totalPrice = basePrice + hintCost + privateCost;

  const handleBooking = () => {
    if (!room) return;
    
    onBooking({
      offerTitle: offer.title,
      date: selectedDate,
      time: selectedTime,
      room: room.name,
      theme: room.theme,
      difficulty: room.difficulty,
      duration: room.duration,
      teamSize,
      hintPackage,
      privateSession,
      totalPrice,
      activityType: 'escape-room'
    });
  };

  const renderDifficulty = (level: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <Skull 
            key={i} 
            className={`h-4 w-4 ${i <= level ? 'text-red-500' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Key className="h-6 w-6 text-yellow-400" />
          <h2 className="text-xl font-bold">Escape Room Buchung</h2>
        </div>
        <p className="text-gray-300">Wähle deine Herausforderung und stelle dein Team zusammen</p>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-lg font-medium">
          <Lock className="h-5 w-5 text-amber-600" />
          Raum wählen
        </Label>
        <div className="grid grid-cols-1 gap-4">
          {ROOMS.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setSelectedRoom(r.id);
                if (teamSize < r.minPlayers) setTeamSize(r.minPlayers);
                if (teamSize > r.maxPlayers) setTeamSize(r.maxPlayers);
              }}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedRoom === r.id 
                  ? 'border-amber-500 bg-amber-50' 
                  : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">{r.name}</div>
                  <div className="text-sm text-purple-600 font-medium">{r.theme}</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {r.duration} Min.
                  </div>
                  {renderDifficulty(r.difficulty)}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{r.description}</p>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  <Users className="h-4 w-4 inline mr-1" />
                  {r.minPlayers}-{r.maxPlayers} Spieler
                </span>
                <span className="text-sm font-medium text-green-600">
                  Erfolgsquote: {r.successRate}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {room && (
        <>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Teamgröße
            </Label>
            <Select value={teamSize.toString()} onValueChange={(v) => setTeamSize(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: room.maxPlayers - room.minPlayers + 1 }, 
                  (_, i) => room.minPlayers + i
                ).map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} Spieler
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              Hinweis-Paket
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: "standard", name: "Standard", price: 0, hints: "3 Hinweise inklusive" },
                { id: "extra", name: "Extra Hinweise", price: 8, hints: "5 Hinweise + 1 Joker" },
                { id: "unlimited", name: "Unlimited", price: 15, hints: "Unbegrenzte Hinweise" }
              ].map(pkg => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setHintPackage(pkg.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    hintPackage === pkg.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{pkg.name}</span>
                    {pkg.price > 0 && (
                      <span className="text-sm text-purple-600">+{pkg.price}€</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{pkg.hints}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="privateSession"
              checked={privateSession}
              onChange={(e) => setPrivateSession(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <div>
              <Label htmlFor="privateSession" className="font-medium cursor-pointer">
                🔒 Private Session (+25€)
              </Label>
              <p className="text-sm text-gray-500">Keine anderen Gruppen - nur ihr im Raum</p>
            </div>
          </div>

          <div className="bg-gray-900 text-white p-4 rounded-lg space-y-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Key className="h-5 w-5 text-yellow-400" />
              Buchungsübersicht
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-400">Raum:</span>
              <span>{room.name}</span>
              <span className="text-gray-400">Dauer:</span>
              <span>{room.duration} Minuten</span>
              <span className="text-gray-400">Team:</span>
              <span>{teamSize} Spieler</span>
              <span className="text-gray-400">Schwierigkeit:</span>
              <span>{renderDifficulty(room.difficulty)}</span>
            </div>
            <div className="border-t border-gray-700 pt-3 mt-3">
              <div className="flex justify-between text-sm">
                <span>Grundpreis ({teamSize}x {offer.price}€)</span>
                <span>{basePrice.toFixed(2)}€</span>
              </div>
              {hintCost > 0 && (
                <div className="flex justify-between text-sm text-purple-400">
                  <span>Hinweis-Paket</span>
                  <span>+{hintCost.toFixed(2)}€</span>
                </div>
              )}
              {privateCost > 0 && (
                <div className="flex justify-between text-sm text-amber-400">
                  <span>Private Session</span>
                  <span>+{privateCost.toFixed(2)}€</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-700">
                <span>Gesamt</span>
                <span className="text-yellow-400">{totalPrice.toFixed(2)}€</span>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleBooking}
            className="w-full bg-gradient-to-r from-gray-800 to-amber-600 hover:from-gray-900 hover:to-amber-700 text-white py-6 text-lg"
          >
            <Key className="mr-2 h-5 w-5" />
            Raum reservieren
          </Button>
        </>
      )}

      {!room && (
        <div className="text-center py-8 text-gray-500">
          <Lock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Wähle einen Escape Room aus, um fortzufahren</p>
        </div>
      )}
    </div>
  );
}
