import { useState } from "react";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

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

interface ResourceSlot {
  time: string;
  resourceName?: string;
  available: boolean;
  price?: number;
}

interface TimeSlotPickerProps {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  bookingArchetype?: "slot_based" | "seat_based" | "capacity_based" | "course_based";
  resourceName?: string;
  availableSlots?: ResourceSlot[];
  showResourceName?: boolean;
}

export default function TimeSlotPicker({
  selectedTime,
  onTimeSelect,
  bookingArchetype = "slot_based",
  resourceName,
  availableSlots,
  showResourceName = false
}: TimeSlotPickerProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("ALLE");
  
  const filteredSlots = filterTimeSlots(timeFilter);
  
  const getSlotAvailability = (time: string): boolean => {
    if (!availableSlots) return true;
    const slot = availableSlots.find(s => s.time === time);
    return slot ? slot.available : true;
  };

  const getArchetypeLabel = (): string => {
    switch (bookingArchetype) {
      case "slot_based":
        return "Zeitslot wählen";
      case "seat_based":
        return "Vorstellung wählen";
      case "capacity_based":
        return "Einlasszeit wählen";
      case "course_based":
        return "Kurszeit wählen";
      default:
        return "Uhrzeit wählen";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 font-medium">
          <Clock className="h-4 w-4" />
          {getArchetypeLabel()}
        </label>
        {showResourceName && resourceName && (
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {resourceName}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
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
      
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {filteredSlots.map((time) => {
          const isAvailable = getSlotAvailability(time);
          const isSelected = selectedTime === time;
          
          return (
            <button
              key={time}
              type="button"
              onClick={() => isAvailable && onTimeSelect(time)}
              disabled={!isAvailable}
              className={cn(
                "px-2 py-2 text-sm font-medium rounded transition-all relative",
                isSelected
                  ? "bg-purple-600 text-white"
                  : isAvailable
                    ? "bg-[#9a9a6c] text-white hover:bg-[#8a8a5c]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
              data-testid={`time-slot-${time}`}
            >
              {time} Uhr
              {!isAvailable && (
                <span className="absolute -top-1 -right-1">
                  <XCircle className="h-3 w-3 text-red-500" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {selectedTime && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4" />
          Ausgewählt: {selectedTime} Uhr
        </p>
      )}
    </div>
  );
}
