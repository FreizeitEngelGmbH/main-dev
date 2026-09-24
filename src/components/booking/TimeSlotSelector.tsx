import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, startOfWeek, isSameDay, isToday, isBefore } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar, Clock, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  available: number;
  priceOverride?: number;
  isBlocked: boolean;
}

interface TimeSlotSelectorProps {
  experienceId: number;
  onSlotSelect: (slot: TimeSlot | null, date: Date | null) => void;
  selectedSlotId?: number;
}

export default function TimeSlotSelector({ experienceId, onSlotSelect, selectedSlotId }: TimeSlotSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showMoreSlots, setShowMoreSlots] = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: slotsData, isLoading: isLoadingSlots } = useQuery<{ slots: TimeSlot[] }>({
    queryKey: ["/api/slots", experienceId, format(selectedDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const res = await fetch(`/api/slots/${experienceId}?date=${dateStr}`);
      if (!res.ok) throw new Error("Failed to fetch slots");
      return res.json();
    },
    enabled: !!experienceId,
  });

  const { data: calendarData } = useQuery<{ dates: Array<{ date: string; hasSlots: boolean; availableSlots: number }> }>({
    queryKey: ["/api/slots", experienceId, "calendar", format(weekStart, "yyyy-MM")],
    queryFn: async () => {
      const month = weekStart.getMonth() + 1;
      const year = weekStart.getFullYear();
      const res = await fetch(`/api/slots/${experienceId}/calendar?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("Failed to fetch calendar");
      return res.json();
    },
    enabled: !!experienceId,
  });

  const slots = slotsData?.slots || [];
  const visibleSlots = showMoreSlots ? slots : slots.slice(0, 10);

  const getDateInfo = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return calendarData?.dates.find(d => d.date === dateStr);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available <= 0) return;
    onSlotSelect(slot, selectedDate);
  };

  const handleDateSelect = (date: Date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return;
    setSelectedDate(date);
    onSlotSelect(null, null);
  };

  return (
    <Card className="border-2 border-purple-100">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 text-purple-700">
          <Calendar className="h-5 w-5" />
          <span className="font-semibold">Datum auswählen</span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            disabled={isBefore(addDays(weekStart, -1), new Date())}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-gray-600">
            {format(weekStart, "MMMM yyyy", { locale: de })}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setWeekStart(addDays(weekStart, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, idx) => {
            const dateInfo = getDateInfo(day);
            const isPast = isBefore(day, new Date()) && !isToday(day);
            const isSelected = isSameDay(day, selectedDate);
            const hasAvailable = dateInfo?.availableSlots && dateInfo.availableSlots > 0;

            return (
              <button
                key={idx}
                onClick={() => handleDateSelect(day)}
                disabled={isPast}
                className={`
                  flex flex-col items-center p-2 rounded-lg transition-all
                  ${isPast ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-purple-50"}
                  ${isSelected ? "bg-purple-600 text-white hover:bg-purple-700" : ""}
                  ${!isSelected && hasAvailable ? "bg-green-50 border border-green-200" : ""}
                  ${!isSelected && !hasAvailable && !isPast ? "bg-gray-50" : ""}
                `}
              >
                <span className="text-xs uppercase">
                  {format(day, "EEE", { locale: de })}
                </span>
                <span className="text-lg font-semibold">
                  {format(day, "d")}
                </span>
                {hasAvailable && !isSelected && (
                  <span className="text-xs text-green-600 font-medium">
                    {dateInfo.availableSlots} frei
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center gap-2 text-purple-700 mb-3">
            <Clock className="h-5 w-5" />
            <span className="font-semibold">Termin wählen</span>
            <span className="text-sm text-gray-500">
              ({format(selectedDate, "EEEE, d. MMMM", { locale: de })})
            </span>
          </div>

          {isLoadingSlots ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Keine Zeitslots für diesen Tag verfügbar</p>
              <p className="text-sm">Wählen Sie einen anderen Tag oder kontaktieren Sie den Anbieter</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {visibleSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  const isBlocked = slot.isBlocked;
                  const isSoldOut = slot.available <= 0 && !isBlocked;

                  return (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      disabled={isBlocked || isSoldOut}
                      className={`
                        relative p-3 rounded-lg border-2 transition-all text-left
                        ${isBlocked
                          ? "bg-red-50 border-red-300 cursor-not-allowed"
                          : isSoldOut 
                            ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-60" 
                            : isSelected
                              ? "bg-purple-600 border-purple-600 text-white"
                              : "bg-white border-gray-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer"
                        }
                      `}
                    >
                      <div className={`font-semibold text-lg ${isBlocked ? "text-red-600" : ""}`}>
                        {slot.startTime}
                      </div>
                      <div className={`text-sm flex items-center gap-1 ${isSelected ? "text-purple-100" : "text-gray-500"}`}>
                        <Users className="h-3 w-3" />
                        {isBlocked ? (
                          <span className="text-red-500 font-medium">Nicht verfügbar</span>
                        ) : isSoldOut ? (
                          <span className="text-red-500 font-medium">Ausgebucht</span>
                        ) : (
                          <span className={slot.available <= 3 ? "text-orange-500 font-medium" : ""}>
                            {slot.available} übrig
                          </span>
                        )}
                      </div>
                      {slot.priceOverride && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {slot.priceOverride.toFixed(2)}€
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {slots.length > 10 && (
                <Button 
                  variant="ghost" 
                  className="w-full mt-2 text-purple-600"
                  onClick={() => setShowMoreSlots(!showMoreSlots)}
                >
                  {showMoreSlots ? "Weniger anzeigen" : `Zeige mehr Zeiten (${slots.length - 10} weitere)`}
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
