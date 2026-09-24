// REFERENCE COPY (not routed): copied from EngelFolder client/src/pages/experience-shop-page-backup.tsx.
// Also typed the query data and defined the getActivityTemplate/navigate calls the source used.
// Syntax repair: the source ended with mismatched closing tags (the offer item opened as <div> but
// closed as </Card>, and the tail closed an older layout). Lines 1211-1221 of the source were replaced by
// the closing tags TypeScript's parser identified as missing; no content lines were changed.
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, MapPin, Clock, Users, Shield, Waves, Euro, Calendar, Phone, Mail, CheckCircle, Heart, ChevronDown, ChevronUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Import Template Engine
import BookingTemplateEngine, { ACTIVITY_TEMPLATES } from "@/components/booking-systems/BookingTemplateEngine";

// Cinema Seating Chart Component (Kinoheld-style)
function CinemaSeatingChart({ 
  selectedTime, 
  selectedSeats, 
  onSeatsChange, 
  maxSeats,
  requiredSeats 
}: { 
  selectedTime: string;
  selectedSeats: string[];
  onSeatsChange: (seats: string[]) => void;
  maxSeats: number;
  requiredSeats?: number;
}) {
  // Generate cinema seating layout
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 12;
  
  // Mock occupied seats based on selected time
  const getOccupiedSeats = (time: string) => {
    const occupied = [];
    if (time === '14:30') occupied.push('A5', 'A6', 'B8', 'C2', 'C3', 'D10', 'E7', 'F4', 'F5');
    if (time === '17:45') occupied.push('A1', 'A2', 'B5', 'B6', 'C7', 'C8', 'D3', 'D4', 'E9', 'E10', 'F1', 'F2');
    if (time === '20:30') occupied.push('A3', 'A4', 'B1', 'B2', 'B9', 'B10', 'C5', 'C6', 'D7', 'D8', 'E3', 'E4', 'F8', 'F9');
    return occupied;
  };

  const occupiedSeats = getOccupiedSeats(selectedTime);

  const toggleSeat = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return;
    
    if (selectedSeats.includes(seatId)) {
      // Deselect seat
      onSeatsChange(selectedSeats.filter(seat => seat !== seatId));
    } else if (selectedSeats.length < maxSeats) {
      // Select seat if under limit
      onSeatsChange([...selectedSeats, seatId]);
    } else {
      // Replace last selected seat if at limit
      const newSeats = [...selectedSeats];
      newSeats[newSeats.length - 1] = seatId;
      onSeatsChange(newSeats);
    }
  };

  return (
    <div className="space-y-4">
      {/* Screen */}
      <div className="text-center">
        <div className="bg-gray-200 h-2 rounded-full mb-2"></div>
        <div className="text-sm text-gray-600">LEINWAND</div>
      </div>

      {/* Seating Chart */}
      <div className="space-y-2">
        {rows.map(row => (
          <div key={row} className="flex items-center justify-center gap-1">
            <div className="w-6 text-center text-sm font-medium">{row}</div>
            {Array.from({length: seatsPerRow}, (_, i) => {
              const seatNumber = i + 1;
              const seatId = `${row}${seatNumber}`;
              const isOccupied = occupiedSeats.includes(seatId);
              const isSelected = selectedSeats.includes(seatId);
              
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

      {/* Legend */}
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

      {selectedSeats.length > 0 && (
        <div className="text-sm text-center text-gray-600">
          {selectedSeats.length} von {maxSeats} Plätzen ausgewählt
          {selectedSeats.length < maxSeats && (
            <div className="text-xs text-orange-600 mt-1">
              Bitte wählen Sie {maxSeats - selectedSeats.length} weitere {maxSeats - selectedSeats.length === 1 ? 'Platz' : 'Plätze'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ShopOffer {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'ticket' | 'course' | 'wellness' | 'family' | 'bonuskarte';
  duration?: string;
  maxParticipants?: number;
  ageRestriction?: string;
  includes: string[];
  timeSlots: string[];
  popular?: boolean;
  freeEntry?: boolean;
  seatSelection?: boolean;
  movieDetails?: {
    genre: string;
    rating: string;
    language: string;
    format: string;
    poster?: string;
    trailer?: string;
  };
  ticketPricing?: {
    adult: number;
    youth: number;
    child: number;
  };
}

// Function to generate bowling offers based on authentic pricing
const generateBowlingOffers = (experienceId: number, title: string, city: string): ShopOffer[] => {
  const centerName = title.toLowerCase();
  
  const baseOffers: ShopOffer[] = [
    {
      id: 'sonntag_donnerstag_bis20',
      title: 'Sonntag bis Donnerstag (bis 20 Uhr)',
      description: 'Pro Spiel und Person, alle Wochentage bis 20:00 Uhr',
      price: 3.80,
      category: 'ticket',
      duration: 'Pro Spiel',
      maxParticipants: 1,
      includes: ['1 Bowlingspiel', 'Kugeln', 'Bowlingschuhe nicht enthalten'],
      timeSlots: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
    },
    {
      id: 'sonntag_donnerstag_ab20',
      title: 'Sonntag bis Donnerstag (ab 20 Uhr)',
      description: 'Pro Spiel und Person, alle Wochentage ab 20:00 Uhr',
      price: 4.40,
      category: 'ticket',
      duration: 'Pro Spiel',
      maxParticipants: 1,
      includes: ['1 Bowlingspiel', 'Kugeln', 'Bowlingschuhe nicht enthalten'],
      timeSlots: ['20:00', '21:00', '22:00']
    },
    {
      id: 'freitag_samstag_bis20',
      title: 'Freitag + Samstag (bis 20 Uhr)',
      description: 'Pro Spiel und Person, Wochenende bis 20:00 Uhr',
      price: 4.10,
      category: 'ticket',
      duration: 'Pro Spiel',
      maxParticipants: 1,
      includes: ['1 Bowlingspiel', 'Kugeln', 'Bowlingschuhe nicht enthalten'],
      timeSlots: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
      popular: true
    },
    {
      id: 'freitag_samstag_ab20',
      title: 'Freitag + Samstag (ab 20 Uhr)',
      description: 'Pro Spiel und Person, Wochenende ab 20:00 Uhr',
      price: 5.50,
      category: 'ticket',
      duration: 'Pro Spiel',
      maxParticipants: 1,
      includes: ['1 Bowlingspiel', 'Kugeln', 'Bowlingschuhe nicht enthalten'],
      timeSlots: ['20:00', '21:00', '22:00']
    },
    {
      id: 'schuhverleih',
      title: 'Leihgebühr Bowlingschuhe',
      description: 'Bowlingschuhe in allen Größen verfügbar',
      price: 2.40,
      category: 'ticket',
      duration: 'Pro Person',
      maxParticipants: 1,
      includes: ['Bowlingschuhe', 'Desinfiziert und gereinigt'],
      timeSlots: ['Bei Bedarf']
    },
    {
      id: 'super_bowling',
      title: 'Super Bowling (3 für 2)',
      description: 'Jeden Montag: 3x spielen = 2x zahlen',
      price: 7.60,
      originalPrice: 11.40,
      category: 'ticket',
      duration: '3 Spiele',
      maxParticipants: 1,
      includes: ['3 Bowlingspiele', '1 Spiel kostenlos', 'Kugeln', 'Bowlingschuhe nicht enthalten'],
      timeSlots: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
    },
    {
      id: 'students_bowl',
      title: 'Students Bowl (-50%)',
      description: 'Jeden Montag ab 18:00 Uhr: 50% Rabatt mit Studentenausweis',
      price: 1.90,
      originalPrice: 3.80,
      category: 'ticket',
      duration: 'Pro Spiel',
      maxParticipants: 1,
      ageRestriction: 'Studenten mit Ausweis',
      includes: ['1 Bowlingspiel', '50% Studentenrabatt', 'Kugeln', 'Bowlingschuhe nicht enthalten'],
      timeSlots: ['18:00', '19:00', '20:00', '21:00', '22:00']
    },
    {
      id: 'party_bowling',
      title: 'Party Bowling',
      description: 'Sonntag bis Donnerstag: 12,90€ pro Person, Freitag + Samstag: 14,90€',
      price: 12.90,
      category: 'family',
      duration: '2 Spiele inkl. Schuhe',
      maxParticipants: 1,
      includes: ['2 Bowlingspiele', 'Schuhverleih', '2 Getränke', 'Voranmeldung erforderlich'],
      timeSlots: ['12:00', '14:00', '16:00', '18:00']
    },
    {
      id: 'teen_bowling',
      title: 'Teen Bowling',
      description: 'Montag bis Donnerstag pro Spiel bis 20:00 Uhr, bis 18 Jahre',
      price: 2.90,
      category: 'ticket',
      duration: 'Pro Spiel',
      maxParticipants: 1,
      ageRestriction: 'Bis 18 Jahre',
      includes: ['1 Bowlingspiel', 'Jugendrabatt', 'Kugeln', 'Bowlingschuhe nicht enthalten'],
      timeSlots: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
    },
    {
      id: 'kids_party_basic',
      title: 'Kids Party Event-Paket',
      description: 'Sonntag bis Donnerstag: 15,40€ pro Kind, bis 16 Jahre, ab 6 Personen',
      price: 15.40,
      category: 'family',
      duration: '2 Spiele inkl. Extras',
      maxParticipants: 1,
      ageRestriction: 'Bis 16 Jahre, ab 6 Personen',
      includes: ['2 Spiele', 'Schuhverleih', 'Pizza', '1 Softgetränk 0,2l', 'Voranmeldung erforderlich'],
      timeSlots: ['14:00', '16:00']
    },
    {
      id: 'kids_party_xl',
      title: 'Kids Party XL Event-Paket',
      description: 'Sonntag bis Donnerstag: 20,40€ pro Kind, bis 16 Jahre, ab 6 Personen',
      price: 20.40,
      category: 'family',
      duration: '2 Spiele inkl. Premium-Extras',
      maxParticipants: 1,
      ageRestriction: 'Bis 16 Jahre, ab 6 Personen',
      includes: ['2 Spiele', 'Schuhverleih', 'Pizza', '3 Softgetränke 0,2l', 'Mixed Candy Dish', 'Voranmeldung erforderlich'],
      timeSlots: ['14:00', '16:00']
    }
  ];

  // Add Disco Bowling for weekend centers
  if (centerName.includes('dortmund') || centerName.includes('bowltreff') || centerName.includes('bowlorado')) {
    baseOffers.push({
      id: 'disco_bowling',
      title: 'Disco Bowling',
      description: 'Freitag & Samstag ab 20:00 Uhr mit Live-DJ und Specials',
      price: 5.50,
      category: 'ticket',
      duration: 'Pro Spiel',
      maxParticipants: 1,
      includes: ['1 Bowlingspiel', 'Live-DJ', 'Partymusik', 'Lässige Drinks', 'Kugeln', 'Bowlingschuhe nicht enthalten'],
      timeSlots: ['20:00', '21:00', '22:00']
    });
  }

  return baseOffers;
};

// Function to generate shop offers based on swimming pool type and location
const generateSwimmingPoolOffers = (experienceId: number, title: string, city: string): ShopOffer[] => {
  // Special case for WasserWelten Bochum - keep original detailed offers
  if (experienceId === 19) {
    return WasserWeltenOffers;
  }

  const poolType = title.toLowerCase();
  const baseOffers: ShopOffer[] = [
    {
      id: 'vollzahler',
      title: 'Einzeleintritt Vollzahler',
      description: 'Vollpreis-Eintritt für Erwachsene',
      price: poolType.includes('hallen') ? 4.50 : poolType.includes('frei') ? 3.50 : 5.00,
      category: 'ticket',
      duration: 'Ganzer Tag',
      ageRestriction: 'ab 16 Jahre',
      includes: ['Schwimmbecken', 'Umkleiden', 'Duschen'],
      timeSlots: poolType.includes('frei') ? ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] : ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
    },
    {
      id: 'ermaessigt',
      title: 'Einzeleintritt Ermäßigt',
      description: 'Ermäßigter Eintritt für Schüler, Studenten, Senioren',
      price: poolType.includes('hallen') ? 3.00 : poolType.includes('frei') ? 2.50 : 3.50,
      category: 'ticket',
      duration: 'Ganzer Tag',
      ageRestriction: 'berechtigt',
      includes: ['Schwimmbecken', 'Umkleiden', 'Duschen'],
      timeSlots: poolType.includes('frei') ? ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] : ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
    },
    {
      id: 'kinder',
      title: 'Eintritt Kinder',
      description: 'Eintritt für Kinder von 6-15 Jahren',
      price: poolType.includes('frei') ? 1.50 : 2.00,
      category: 'ticket',
      duration: 'Ganzer Tag',
      ageRestriction: '6-15 Jahre',
      includes: ['Schwimmbecken', 'Kinderbecken', 'Umkleiden', 'Duschen'],
      timeSlots: poolType.includes('frei') ? ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] : ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
    },
    {
      id: 'kleinkinder',
      title: 'Kleinkinder unter 6',
      description: 'Kostenfreier Eintritt für Kleinkinder unter 6 Jahren',
      price: 0,
      category: 'ticket',
      duration: 'Ganzer Tag',
      ageRestriction: 'unter 6 Jahre',
      includes: ['Schwimmbecken', 'Kinderbecken', 'Umkleiden', 'Duschen'],
      timeSlots: poolType.includes('frei') ? ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] : ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
      freeEntry: true
    },
    {
      id: 'familienkarte',
      title: 'Familienkarte',
      description: 'Familienticket für 2 Erwachsene & 2 Kinder',
      price: poolType.includes('hallen') ? 12.50 : poolType.includes('frei') ? 9.50 : 16.00,
      originalPrice: poolType.includes('hallen') ? 16.00 : poolType.includes('frei') ? 12.00 : 20.00,
      category: 'family',
      duration: 'Ganzer Tag',
      maxParticipants: 4,
      includes: ['Schwimmbecken', 'Kinderbecken', 'Familienumkleide', 'Umkleiden', 'Duschen'],
      timeSlots: poolType.includes('frei') ? ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] : ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
      popular: true
    }
  ];

  // Add special offers based on pool type
  if (poolType.includes('hallen') && !poolType.includes('frei')) {
    baseOffers.push({
      id: 'abendkarte',
      title: 'Abendkarte',
      description: 'Günstiger Eintritt ab 17:00 Uhr',
      price: 3.00,
      category: 'ticket',
      duration: 'Ab 17:00 Uhr',
      includes: ['Schwimmbecken', 'Umkleiden', 'Duschen'],
      timeSlots: ['17:00', '18:00', '19:00', '20:00']
    });
  }

  if (poolType.includes('querenburg') || poolType.includes('höntrop') || poolType.includes('nordbad')) {
    baseOffers.push({
      id: 'sauna',
      title: 'Schwimmen + Sauna',
      description: 'Zugang zu Schwimmbad und Sauna-Bereich',
      price: poolType.includes('nordbad') ? 11.00 : 9.50,
      category: 'wellness',
      duration: 'Ganzer Tag',
      ageRestriction: 'ab 16 Jahre',
      includes: ['Schwimmbecken', 'Sauna', 'Entspannungsbereich', 'Umkleiden', 'Duschen'],
      timeSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
    });
  }

  // Add 10er-Karte for regular pools
  if (!poolType.includes('schwimmverein') && !poolType.includes('frei')) {
    baseOffers.push({
      id: 'zehnerkarte',
      title: '10er-Karte Vollzahler',
      description: '10 Eintritte zum Vorteilspreis - 2 Eintritte sparen',
      price: poolType.includes('hallen') ? 36.00 : 40.00,
      originalPrice: poolType.includes('hallen') ? 45.00 : 50.00,
      category: 'bonuskarte',
      duration: '12 Monate gültig',
      includes: ['10 Eintritte', 'Schwimmbecken', 'Umkleiden', 'Duschen'],
      timeSlots: ['Flexibel nutzbar'],
      popular: true
    });
  }

  if (poolType.includes('schwimmverein')) {
    baseOffers.push({
      id: 'training',
      title: 'Trainingseinheit',
      description: 'Professionelles Schwimmtraining mit Anleitung',
      price: 8.50,
      category: 'course',
      duration: '90 Minuten',
      maxParticipants: 12,
      includes: ['Schwimmbecken', 'Trainer', 'Trainingsplan', 'Umkleiden', 'Duschen'],
      timeSlots: ['07:00', '08:30', '17:00', '18:30', '20:00']
    });
  }

  return baseOffers;
};

const WasserWeltenOffers: ShopOffer[] = [
  {
    id: 'vollzahler',
    title: 'Einzeleintritt Vollzahler',
    description: 'Zugang zum Hallenbad für Erwachsene ab 16 Jahren',
    price: 5.00,
    category: 'ticket',
    duration: 'Ganzer Tag',
    ageRestriction: 'ab 16 Jahre',
    includes: ['Schwimmbecken', 'Umkleiden', 'Duschen'],
    timeSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
  },
  {
    id: 'ermaessigt',
    title: 'Einzeleintritt Ermäßigt',
    description: 'Ermäßigter Eintritt für Jugendliche, Schüler, Studenten, Auszubildende, Bundesfreiwilligendienst, Wehrdienstleistende, Schwerbehinderte und Bochum Pass Inhaber',
    price: 3.00,
    category: 'ticket',
    duration: 'Ganzer Tag',
    ageRestriction: 'unter 29 Jahre oder berechtigt',
    includes: ['Schwimmbecken', 'Umkleiden', 'Duschen'],
    timeSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
  },
  {
    id: 'kinder',
    title: 'Einzeleintritt Kinder',
    description: 'Kostenfreier Eintritt für Kinder unter 6 Jahren, Begleitpersonen von Schwerbehinderten und Ferienpass-Inhaber',
    price: 0,
    category: 'ticket',
    duration: 'Ganzer Tag',
    ageRestriction: 'unter 6 Jahre',
    includes: ['Schwimmbecken', 'Kinderbecken', 'Umkleiden', 'Duschen'],
    timeSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
    freeEntry: true
  },
  {
    id: 'familienkarte',
    title: 'Familien-/Gruppenkarte',
    description: 'Familienticket für 2 Erwachsene & 2 Jugendliche unter 16 Jahren',
    price: 14.50,
    originalPrice: 18.00,
    category: 'family',
    duration: 'Ganzer Tag',
    maxParticipants: 4,
    includes: ['Schwimmbecken', 'Kinderbecken', 'Familienumkleide', 'Umkleiden', 'Duschen'],
    timeSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
    popular: true
  },
  {
    id: 'sauna',
    title: 'Vollzahler Sauna',
    description: 'Zugang zu Schwimmbad und Sauna-Bereich',
    price: 12.00,
    category: 'wellness',
    duration: 'Ganzer Tag',
    ageRestriction: 'ab 16 Jahre',
    includes: ['Schwimmbecken', 'Sauna', 'Entspannungsbereich', 'Umkleiden', 'Duschen'],
    timeSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
  },
  {
    id: 'sauna-ermaessigt',
    title: 'Ermäßigt Sauna',
    description: 'Ermäßigter Zugang zu Schwimmbad und Sauna',
    price: 7.00,
    category: 'wellness',
    duration: 'Ganzer Tag',
    ageRestriction: 'unter 29 Jahre oder berechtigt',
    includes: ['Schwimmbecken', 'Sauna', 'Entspannungsbereich', 'Umkleiden', 'Duschen'],
    timeSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
  },
  {
    id: 'bonuskarte-5',
    title: 'Bonuskarte 5% Rabatt',
    description: '10er Karte mit 5% Rabatt für regelmäßige Besucher',
    price: 47.50,
    originalPrice: 50.00,
    category: 'bonuskarte',
    duration: '10 Besuche',
    includes: ['10 Einzeleintritte', '5% Rabatt', 'Gültig 1 Jahr'],
    timeSlots: ['Flexibel nutzbar']
  },
  {
    id: 'bonuskarte-15',
    title: 'Bonuskarte 15% Rabatt',
    description: '20er Karte mit 15% Rabatt für Vielbesucher',
    price: 85.00,
    originalPrice: 100.00,
    category: 'bonuskarte',
    duration: '20 Besuche',
    includes: ['20 Einzeleintritte', '15% Rabatt', 'Gültig 1 Jahr'],
    timeSlots: ['Flexibel nutzbar']
  },
  {
    id: 'bonuskarte-20',
    title: 'Bonuskarte 20% Rabatt',
    description: '50er Karte mit 20% Rabatt für Premium-Kunden',
    price: 200.00,
    originalPrice: 250.00,
    category: 'bonuskarte',
    duration: '50 Besuche',
    includes: ['50 Einzeleintritte', '20% Rabatt', 'Gültig 2 Jahre', 'VIP-Service'],
    timeSlots: ['Flexibel nutzbar']
  }
];

// Function to generate cinema offers with movie showtimes (Kinoheld-style)
const generateCinemaOffers = (experienceId: number, title: string, city: string): ShopOffer[] => {
  return [
    {
      id: 'avatar-3-2d',
      title: 'Avatar: The Way of Water',
      description: '2D Version - Sci-Fi Blockbuster von James Cameron',
      price: 15.50, // Adult price
      category: 'ticket',
      duration: '192 Minuten',
      maxParticipants: 12, // Kinoheld-style: max. 12 Personen pro Buchung
      movieDetails: {
        genre: 'Sci-Fi, Action',
        rating: 'FSK 12',
        language: 'Deutsch',
        format: '2D',
        poster: 'https://via.placeholder.com/300x450/0066cc/ffffff?text=Avatar+2',
        trailer: 'https://www.youtube.com/watch?v=d9MyW72ELq0'
      },
      ticketPricing: {
        adult: 15.50,
        youth: 14.00, // 12-15 Jahre
        child: 12.50  // bis 11 Jahre
      },
      includes: ['Dolby Digital Sound', 'Große Leinwand', 'Klimatisiert'],
      timeSlots: ['14:30', '17:45', '20:30'],
      seatSelection: true
    },
    {
      id: 'top-gun-maverick',
      title: 'Top Gun: Maverick',
      description: 'Action-Drama mit Tom Cruise',
      price: 15.50, // Adult price
      category: 'ticket',
      duration: '131 Minuten',
      maxParticipants: 12,
      movieDetails: {
        genre: 'Action, Drama',
        rating: 'FSK 12',
        language: 'Deutsch',
        format: '2D',
        poster: 'https://via.placeholder.com/300x450/cc6600/ffffff?text=Top+Gun',
        trailer: 'https://www.youtube.com/watch?v=giXco2jaZ_4'
      },
      ticketPricing: {
        adult: 15.50,
        youth: 14.00, // 12-15 Jahre
        child: 12.50  // bis 11 Jahre
      },
      includes: ['Dolby Atmos', 'Premium Sound', 'Komfortsessel'],
      timeSlots: ['15:00', '17:30', '20:00'],
      seatSelection: true
    },
    {
      id: 'minions-rise-gru',
      title: 'Minions: Auf der Suche nach dem Mini-Boss',
      description: 'Animationsfilm für die ganze Familie',
      price: 15.50, // Adult price
      category: 'ticket',
      duration: '87 Minuten',
      maxParticipants: 12,
      movieDetails: {
        genre: 'Animation, Familie',
        rating: 'FSK 6',
        language: 'Deutsch',
        format: '2D',
        poster: 'https://via.placeholder.com/300x450/ffcc00/000000?text=Minions',
        trailer: 'https://www.youtube.com/watch?v=5VYb3B1ETZk'
      },
      ticketPricing: {
        adult: 15.50,
        youth: 14.00, // 12-15 Jahre
        child: 12.50  // bis 11 Jahre
      },
      includes: ['Familienfreundlich', 'Deutsche Synchronisation', 'Kurze Werbepause'],
      timeSlots: ['14:00', '16:15', '18:30'],
      seatSelection: true
    }
  ];
};

// Fields this page reads from GET /api/experiences/:id (added to compile).
interface BackupExperience {
  id?: number;
  title?: string;
  description?: string | null;
  city?: string | null;
  category?: string | null;
  categoryId?: number;
  rating?: number | null;
  reviewCount?: number | null;
}

export default function ExperienceShopPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedOffer, setSelectedOffer] = useState<ShopOffer | null>(null);
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [participants, setParticipants] = useState<number>(1);
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [shoeRental, setShoeRental] = useState<boolean>(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [ticketCounts, setTicketCounts] = useState({
    adult: 0,
    youth: 0,
    child: 0
  });
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');

  // Fetch experience details
  const { data: experience, isLoading } = useQuery<BackupExperience>({
    queryKey: [`/api/experiences/${id}`],
  });

  // Check experience type for appropriate shop system
  const isSwimmingPool = experience && (experience.category === 'swimming' || 
    experience.title?.toLowerCase().includes('schwimm') ||
    experience.title?.toLowerCase().includes('wasser') ||
    experience.title?.toLowerCase().includes('bad') ||
    experience.title?.toLowerCase().includes('pool'));

  const isBowling = experience && (
    experience.category === 'bowling' ||
    experience.title?.toLowerCase().includes('bowling') ||
    experience.title?.toLowerCase().includes('bowltreff') ||
    experience.title?.toLowerCase().includes('bowlorado')
  );

  const isCinema = experience && (
    experience.categoryId === 2 ||
    experience.title?.toLowerCase().includes('kino') ||
    experience.title?.toLowerCase().includes('cinema') ||
    experience.title?.toLowerCase().includes('film')
  );
  
  // The source calls getActivityTemplate() without defining it; this is the same mapping as in
  // experience-shop-page-old.tsx.
  const getActivityTemplate = () => {
    if (isCinema) return ACTIVITY_TEMPLATES.cinema;
    if (isBowling) return ACTIVITY_TEMPLATES.bowling;
    if (isSwimmingPool) return ACTIVITY_TEMPLATES.swimming;
    if (experience?.categoryId === 4) return ACTIVITY_TEMPLATES.zoo;
    if (experience?.title?.toLowerCase().includes('minigolf')) return ACTIVITY_TEMPLATES.minigolf;
    return ACTIVITY_TEMPLATES.swimming;
  };

  // Calculate total price including optional extras
  const calculateTotalPrice = (basePrice: number, participants: number, includeShoeRental: boolean = false) => {
    let total = basePrice * participants;
    if (includeShoeRental && isBowling) {
      total += 4.50; // Shoe rental per booking, not per person
    }
    return total;
  };
  
  // Generate appropriate shop offers
  const shopOffers = experience ? (
    isBowling 
      ? generateBowlingOffers(parseInt(id as string), experience.title || '', experience.city || '')
      : isCinema
      ? generateCinemaOffers(parseInt(id as string), experience.title || '', experience.city || '')
      : generateSwimmingPoolOffers(parseInt(id as string), experience.title || '', experience.city || '')
  ) : [];

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' })
      });
    }
    return dates;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ticket': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'course': return 'bg-green-100 text-green-800 border-green-200';
      case 'wellness': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'family': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'bonuskarte': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'ticket': return 'Eintrittskarte';
      case 'course': return 'Kurs';
      case 'wellness': return 'Wellness';
      case 'family': return 'Familie';
      case 'bonuskarte': return 'Bonuskarte';
      default: return category;
    }
  };

  const bookingMutation = useMutation({
    mutationFn: async (bookingRequest: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingRequest);
      return response.json();
    },
    onSuccess: (booking: any) => {
      toast({
        title: "Buchung erfolgreich!",
        description: `Ihre Buchung für ${selectedOffer?.title} wurde bestätigt.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      navigate(`/booking-confirmation/${booking.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Buchung fehlgeschlagen",
        description: error.message || "Es ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    },
  });

  const handleOfferSelect = (offer: ShopOffer) => {
    if (expandedOffer === offer.id) {
      // If already expanded, collapse it
      setExpandedOffer(null);
      setSelectedOffer(null);
    } else {
      // Expand this offer and select it
      setExpandedOffer(offer.id);
      setSelectedOffer(offer);
      setParticipants(1);
      setShowCheckout(false);
      // Reset cinema-specific state
      setTicketCounts({ adult: 0, youth: 0, child: 0 });
      setSelectedSeats([]);
      // Reset bowling-specific state
      setShoeRental(false);
    }
  };

  const handleBooking = (bookingData?: any) => {
    if (bookingData) {
      // Booking data from specific booking system
      setShowCheckout(true);
      return;
    }

    // Fallback for old booking flow
    if (!selectedOffer || !selectedDate || (!selectedTime && selectedOffer.timeSlots[0] !== 'Flexibel nutzbar')) {
      toast({
        title: "Unvollständige Auswahl",
        description: "Bitte wählen Sie ein Angebot, Datum und Uhrzeit aus.",
        variant: "destructive",
      });
      return;
    }
    setShowCheckout(true);
  };

  const handleCheckout = () => {
    if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email) {
      toast({
        title: "Pflichtfelder fehlen",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    const totalPrice = isCinema 
      ? selectedOffer!.price * participants 
      : selectedOffer!.price * participants + (shoeRental && isBowling ? 4.50 : 0);
    
    const bookingRequest = {
      experienceId: parseInt(id as string),
      offerTitle: selectedOffer!.title,
      date: selectedDate,
      time: selectedTime || '09:00',
      participants: participants,
      totalPrice,
      guestInfo,
      notes: guestInfo.notes,
      shoeRental: shoeRental && isBowling,
      selectedSeats: isCinema ? selectedSeats : undefined,
      ticketCounts: isCinema ? ticketCounts : undefined,
      paymentMethod: totalPrice === 0 ? 'free' : paymentMethod
    };

    bookingMutation.mutate(bookingRequest);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Erlebnis nicht gefunden</h1>
        <Button onClick={() => navigate('/')}>Zur Startseite</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-teal-600">
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <div className="relative container mx-auto px-4 py-20 text-center text-white">
          <div className="flex justify-center gap-2 mb-4">
            <Badge className="bg-teal-500 text-white">Schwimmbad</Badge>
            <Badge className="bg-orange-500 text-white">Bestseller</Badge>
          </div>
          <h1 className="text-4xl font-bold mb-4">{experience?.title || 'Laden...'}</h1>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{experience?.city || 'Laden...'}, Deutschland</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{experience?.rating || 0} ({experience?.reviewCount || 0} Bewertungen)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isBowling ? (
                    <>
                      <div className="h-5 w-5 text-orange-600 font-bold">🎳</div>
                      Über dieses Bowling-Center
                    </>
                  ) : (
                    <>
                      <Waves className="h-5 w-5 text-blue-600" />
                      Über dieses Erlebnis
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{experience?.description || 'Laden...'}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">Dauer</div>
                      <div className="text-xs text-gray-500">
                        {isBowling ? '1-2 Stunden' : '2-4 Stunden'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">
                        {isBowling ? 'Pro Bahn' : 'Gruppengröße'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isBowling ? '2-8 Personen' : '1-50'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">Standort</div>
                      <div className="text-xs text-gray-500">{experience?.city || 'Laden...'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">
                        {isBowling ? 'Bahnen' : 'Verfügbarkeit'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isBowling ? '8-12 Bahnen' : 'Ganzjährig verfügbar'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Offers Section - Online Shop Style */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Unsere Angebote</CardTitle>
                <p className="text-gray-600">Wählen Sie das passende Angebot für Ihren Besuch</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shopOffers.map((offer) => (
                    <div 
                      key={offer.id} 
                      className={`relative border-2 rounded-lg transition-all cursor-pointer ${
                        expandedOffer === offer.id 
                          ? 'border-blue-500 bg-blue-50 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      } ${offer.popular ? 'ring-2 ring-orange-200' : ''}`}
                      onClick={() => handleOfferSelect(offer)}
                    >
                      {offer.popular && (
                        <Badge className="absolute -top-2 left-4 bg-orange-500 text-white text-xs">
                          Beliebt
                        </Badge>
                      )}
                      
                      {/* Offer Header - Always Visible */}
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{offer.title}</h3>
                              <Badge className={`text-xs ${getCategoryColor(offer.category)}`}>
                                {getCategoryLabel(offer.category)}
                              </Badge>
                              <div className="ml-auto">
                                {expandedOffer === offer.id ? (
                                  <ChevronUp className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {offer.duration}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Users className="h-3 w-3" />
                                max. 12 Personen
                              </div>
                              {offer.ageRestriction && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Shield className="h-3 w-3" />
                                  {offer.ageRestriction}
                                </div>
                              )}
                              {offer.freeEntry && (
                                <Badge className="text-xs bg-green-100 text-green-800">
                                  Kostenlos
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right ml-4">
                            {offer.originalPrice && (
                              <div className="text-sm line-through text-gray-400">
                                {offer.originalPrice.toFixed(2)}€
                              </div>
                            )}
                            <div className="text-2xl font-bold text-blue-600">
                              {offer.freeEntry ? 'Kostenlos' : `${offer.price.toFixed(2)}€`}
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-3 mt-3">
                          <div className="text-xs text-gray-500 mb-2">Inkludiert:</div>
                          <div className="flex flex-wrap gap-1">
                            {offer.includes.map((item, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content with Booking Form */}
                      {expandedOffer === offer.id && (
                        <div className="border-t bg-white p-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Left Column - Offer Details */}
                            <div>
                              <h4 className="font-semibold text-lg mb-4">Details zum Angebot</h4>
                              
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <div className="text-sm font-medium">Dauer</div>
                                    <div className="text-xs text-gray-500">{offer.duration}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <div className="text-sm font-medium">
                                      {offer.maxParticipants === 1 ? 'Pro Person' : 'Teilnehmer'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      max. {offer.maxParticipants} {offer.maxParticipants === 1 ? 'Person' : 'Personen'}
                                    </div>
                                  </div>
                                </div>
                                {offer.ageRestriction && (
                                  <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-gray-500" />
                                    <div>
                                      <div className="text-sm font-medium">Altersbeschränkung</div>
                                      <div className="text-xs text-gray-500">{offer.ageRestriction}</div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right Column - Booking Form */}
                            <div>
                              <h4 className="font-semibold text-lg mb-4">Jetzt buchen</h4>
                              
                              {/* Complete Booking Form */}
                              <div className="booking-form" onClick={(e) => e.stopPropagation()}>
                                {!showCheckout ? (
                                  <form className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Datum</label>
                                        <Input 
                                          type="date" 
                                          className="w-full" 
                                          value={selectedDate}
                                          onChange={(e) => setSelectedDate(e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Zeit</label>
                                        <Select value={selectedTime} onValueChange={setSelectedTime}>
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
                                            {offer.timeSlots?.map((time, idx) => (
                                              <SelectItem 
                                                key={idx} 
                                                value={time}
                                                onClick={(e) => e.stopPropagation()}
                                                onPointerDown={(e) => e.stopPropagation()}
                                              >
                                                {time}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>

                                    {/* Template-based booking system */}
                                    <BookingTemplateEngine
                                      template={getActivityTemplate()}
                                      offer={offer}
                                      selectedDate={selectedDate}
                                      selectedTime={selectedTime}
                                      onBooking={handleBooking}
                                    />
                                  </form>
                                ) : (
                                  /* Checkout Form */
                                  <div className="space-y-4">
                                    <h4 className="font-semibold mb-4">Buchungsdetails</h4>
                                    
                                    <div className="space-y-3">
                                      <div>
                                        <Label htmlFor="firstName">Vorname *</Label>
                                        <Input 
                                          id="firstName" 
                                          name="firstName" 
                                          required 
                                          className="mt-1" 
                                        />
                                      </div>
                                      
                                      <div>
                                        <Label htmlFor="lastName">Nachname *</Label>
                                        <Input 
                                          id="lastName" 
                                          name="lastName" 
                                          required 
                                          className="mt-1" 
                                        />
                                      </div>
                                      
                                      <div>
                                        <Label htmlFor="email">E-Mail *</Label>
                                        <Input 
                                          id="email" 
                                          name="email" 
                                          type="email" 
                                          required 
                                          className="mt-1" 
                                        />
                                      </div>
                                      
                                      <div>
                                        <Label htmlFor="phone">Telefon</Label>
                                        <Input 
                                          id="phone" 
                                          name="phone" 
                                          type="tel" 
                                          className="mt-1" 
                                        />
                                      </div>
                                      
                                      <div>
                                        <Label htmlFor="notes">Anmerkungen</Label>
                                        <Textarea 
                                          id="notes" 
                                          name="notes" 
                                          rows={3} 
                                          className="mt-1" 
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="flex gap-2 pt-4">
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => setShowCheckout(false)}
                                        className="flex-1"
                                      >
                                        Zurück
                                      </Button>
                                      <Button 
                                        type="button" 
                                        onClick={() => navigate('/confirmation')}
                                        className="flex-1"
                                      >
                                        Jetzt buchen
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          </div>
                        )}
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}




