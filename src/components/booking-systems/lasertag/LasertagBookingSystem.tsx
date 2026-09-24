import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Target, Users, Zap, Shield, Clock } from "lucide-react";

interface LasertagOffer {
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

interface LasertagBookingSystemProps {
  offer: LasertagOffer;
  selectedDate: string;
  selectedTime: string;
  onBooking: (bookingData: any) => void;
}

const GAME_MODES = [
  { id: "team-deathmatch", name: "Team Deathmatch", description: "2 Teams kämpfen gegeneinander", minPlayers: 4 },
  { id: "free-for-all", name: "Free for All", description: "Jeder gegen jeden", minPlayers: 2 },
  { id: "capture-flag", name: "Capture the Flag", description: "Erobere die gegnerische Flagge", minPlayers: 6 },
  { id: "zombie", name: "Zombie Modus", description: "Überlebe die Zombie-Welle", minPlayers: 4 },
  { id: "vip", name: "VIP Schutz", description: "Schütze den VIP deines Teams", minPlayers: 6 }
];

const ARENAS = [
  { id: "arena-a", name: "Arena Alpha", capacity: 20, theme: "Urbane Ruinen" },
  { id: "arena-b", name: "Arena Beta", capacity: 16, theme: "Raumstation" },
  { id: "arena-c", name: "Arena Gamma", capacity: 24, theme: "Dschungel" }
];

const EQUIPMENT_PACKAGES = [
  { id: "standard", name: "Standard", price: 0, includes: ["Lasertag-Weste", "Phaser"] },
  { id: "pro", name: "Pro-Ausrüstung", price: 5, includes: ["Premium-Weste", "Pro-Phaser", "Taktik-Handschuhe"] },
  { id: "elite", name: "Elite-Paket", price: 10, includes: ["Elite-Weste", "Sniper-Phaser", "Nachtsichtvisier", "Tarnanzug"] }
];

export default function LasertagBookingSystem({ offer, selectedDate, selectedTime, onBooking }: LasertagBookingSystemProps) {
  const [teamSize, setTeamSize] = useState(4);
  const [gameMode, setGameMode] = useState("team-deathmatch");
  const [rounds, setRounds] = useState(2);
  const [arena, setArena] = useState("arena-a");
  const [equipmentPackage, setEquipmentPackage] = useState("standard");
  const [safetyBriefing, setSafetyBriefing] = useState(true);

  const selectedEquipment = EQUIPMENT_PACKAGES.find(e => e.id === equipmentPackage)!;
  const basePrice = offer.price * teamSize;
  const equipmentCost = selectedEquipment.price * teamSize;
  const roundsCost = rounds > 2 ? (rounds - 2) * 3 * teamSize : 0;
  const totalPrice = basePrice + equipmentCost + roundsCost;

  const handleBooking = () => {
    onBooking({
      offerTitle: offer.title,
      date: selectedDate,
      time: selectedTime,
      teamSize,
      gameMode: GAME_MODES.find(g => g.id === gameMode)?.name,
      rounds,
      arena: ARENAS.find(a => a.id === arena)?.name,
      equipmentPackage: selectedEquipment.name,
      safetyBriefing,
      totalPrice,
      activityType: 'lasertag'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-purple-600 text-white p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-6 w-6" />
          <h2 className="text-xl font-bold">Lasertag Mission</h2>
        </div>
        <p className="text-red-100">Wähle deine Kampfkonfiguration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4 text-red-500" />
            Teamgröße
          </Label>
          <Select value={teamSize.toString()} onValueChange={(v) => setTeamSize(parseInt(v))}>
            <SelectTrigger className="border-red-200 focus:ring-red-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2, 3, 4, 5, 6, 8, 10, 12].map(size => (
                <SelectItem key={size} value={size.toString()}>
                  {size} Spieler
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Spielmodus
          </Label>
          <Select value={gameMode} onValueChange={setGameMode}>
            <SelectTrigger className="border-red-200 focus:ring-red-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GAME_MODES.map(mode => (
                <SelectItem 
                  key={mode.id} 
                  value={mode.id}
                  disabled={teamSize < mode.minPlayers}
                >
                  <div className="flex flex-col">
                    <span>{mode.name}</span>
                    <span className="text-xs text-gray-500">{mode.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Target className="h-4 w-4 text-purple-500" />
          Arena wählen
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ARENAS.map(a => (
            <button
              key={a.id}
              type="button"
              onClick={() => setArena(a.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                arena === a.id 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="font-medium">{a.name}</div>
              <div className="text-sm text-gray-500">{a.theme}</div>
              <div className="text-xs text-gray-400">Max. {a.capacity} Spieler</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            Anzahl Runden
          </Label>
          <Select value={rounds.toString()} onValueChange={(v) => setRounds(parseInt(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Runde (15 Min.)</SelectItem>
              <SelectItem value="2">2 Runden (30 Min.) - Standard</SelectItem>
              <SelectItem value="3">3 Runden (45 Min.) +{3 * teamSize}€</SelectItem>
              <SelectItem value="4">4 Runden (60 Min.) +{6 * teamSize}€</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-500" />
          Ausrüstungspaket
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {EQUIPMENT_PACKAGES.map(pkg => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => setEquipmentPackage(pkg.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                equipmentPackage === pkg.id 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{pkg.name}</span>
                {pkg.price > 0 && (
                  <span className="text-sm text-green-600">+{pkg.price}€/P.</span>
                )}
              </div>
              <ul className="text-xs text-gray-500 space-y-1">
                {pkg.includes.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <input
          type="checkbox"
          id="safetyBriefing"
          checked={safetyBriefing}
          onChange={(e) => setSafetyBriefing(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
        />
        <Label htmlFor="safetyBriefing" className="text-sm cursor-pointer">
          ⚠️ Sicherheitseinweisung (10 Min. vor Spielbeginn) - Pflicht für Erstbesucher
        </Label>
      </div>

      <div className="bg-gray-900 text-white p-4 rounded-lg space-y-3">
        <h3 className="font-bold text-lg">Mission Übersicht</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-gray-400">Spieler:</span>
          <span>{teamSize}</span>
          <span className="text-gray-400">Modus:</span>
          <span>{GAME_MODES.find(g => g.id === gameMode)?.name}</span>
          <span className="text-gray-400">Arena:</span>
          <span>{ARENAS.find(a => a.id === arena)?.name}</span>
          <span className="text-gray-400">Runden:</span>
          <span>{rounds}</span>
          <span className="text-gray-400">Ausrüstung:</span>
          <span>{selectedEquipment.name}</span>
        </div>
        <div className="border-t border-gray-700 pt-3 mt-3">
          <div className="flex justify-between text-sm">
            <span>Grundpreis ({teamSize}x {offer.price}€)</span>
            <span>{basePrice.toFixed(2)}€</span>
          </div>
          {equipmentCost > 0 && (
            <div className="flex justify-between text-sm text-green-400">
              <span>Ausrüstung ({teamSize}x {selectedEquipment.price}€)</span>
              <span>+{equipmentCost.toFixed(2)}€</span>
            </div>
          )}
          {roundsCost > 0 && (
            <div className="flex justify-between text-sm text-blue-400">
              <span>Zusatzrunden</span>
              <span>+{roundsCost.toFixed(2)}€</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-700">
            <span>Gesamt</span>
            <span className="text-red-400">{totalPrice.toFixed(2)}€</span>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleBooking}
        className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white py-6 text-lg"
      >
        <Target className="mr-2 h-5 w-5" />
        Mission starten
      </Button>
    </div>
  );
}
