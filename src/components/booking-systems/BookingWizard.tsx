import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Clock, Users, CreditCard, CalendarIcon, ChevronLeft, ChevronRight, Loader2, Check, Ticket, Layers } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

export type BookingType = "TIME_SLOT" | "DAY_PASS" | "RESOURCE" | "EVENT";

interface BookingWizardProps {
  experience: any;
  partner: any;
  bookingType: BookingType;
  onComplete?: (bookingData: any) => void;
}

const WIZARD_STEPS = [
  { id: "date", title: "Datum & Zeit", icon: Calendar },
  { id: "participants", title: "Teilnehmer", icon: Users },
  { id: "details", title: "Kontaktdaten", icon: CreditCard },
  { id: "confirm", title: "Bestätigung", icon: Check },
];

const ALL_TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"
];

export default function BookingWizard({ 
  experience, 
  partner, 
  bookingType,
  onComplete 
}: BookingWizardProps) {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    selectedDate: null as Date | null,
    selectedTime: '',
    selectedResource: '',
    participants: 1,
    adultsCount: 1,
    childrenCount: 0,
    duration: 1,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const { data: resources } = useQuery({
    queryKey: ['/api/experiences', experience?.id, 'resources'],
    queryFn: () => fetch(`/api/experiences/${experience?.id}/resources`).then(r => r.json()),
    enabled: !!experience?.id && (bookingType === 'TIME_SLOT' || bookingType === 'RESOURCE'),
  });

  const { data: availability, isLoading: loadingAvailability } = useQuery({
    queryKey: ['/api/experiences', experience?.id, 'availability', formData.selectedDate?.toISOString()],
    queryFn: () => fetch(`/api/experiences/${experience?.id}/availability?date=${formData.selectedDate?.toISOString()}`).then(r => r.json()),
    enabled: !!experience?.id && !!formData.selectedDate,
  });

  const priceMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/calculate-price', {
        experienceId: experience?.id,
        date: formData.selectedDate?.toISOString(),
        adultsCount: formData.adultsCount,
        childrenCount: formData.childrenCount,
        participants: formData.participants,
        bookingType,
        duration: formData.duration
      });
      return response.json();
    }
  });

  useEffect(() => {
    if (experience?.id && formData.selectedDate) {
      priceMutation.mutate();
    }
  }, [formData.selectedDate, formData.adultsCount, formData.childrenCount, formData.participants, formData.duration]);

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        const hasDateTime = formData.selectedDate && formData.selectedTime;
        const needsResource = bookingType === 'TIME_SLOT' || bookingType === 'RESOURCE';
        return hasDateTime && (!needsResource || formData.selectedResource);
      case 1:
        if (bookingType === 'DAY_PASS') {
          return (formData.adultsCount + formData.childrenCount) > 0;
        }
        return formData.participants > 0;
      case 2:
        return formData.firstName && formData.lastName && formData.email;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    const bookingData = {
      ...formData,
      selectedDate: formData.selectedDate ? format(formData.selectedDate, 'yyyy-MM-dd') : '',
      experience,
      partner,
      bookingType,
      totalPrice: priceMutation.data?.totalPrice || experience?.price,
      priceBreakdown: priceMutation.data
    };

    if (onComplete) {
      onComplete(bookingData);
    } else {
      setLocation('/confirmation', { state: { bookingData } });
    }
  };

  const getParticipantCount = () => {
    return bookingType === 'DAY_PASS' 
      ? formData.adultsCount + formData.childrenCount 
      : formData.participants;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        {WIZARD_STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                isActive && "border-purple-600 bg-purple-600 text-white",
                isCompleted && "border-green-500 bg-green-500 text-white",
                !isActive && !isCompleted && "border-gray-300 text-gray-400"
              )}>
                {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
              </div>
              {index < WIZARD_STEPS.length - 1 && (
                <div className={cn(
                  "w-12 h-0.5 mx-2",
                  isCompleted ? "bg-green-500" : "bg-gray-200"
                )} />
              )}
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const StepIcon = WIZARD_STEPS[currentStep].icon;
              return <StepIcon className="h-5 w-5 text-purple-600" />;
            })()}
            {WIZARD_STEPS[currentStep].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <div className="space-y-6">
              {(bookingType === 'TIME_SLOT' || bookingType === 'RESOURCE') && resources?.length > 0 && (
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
                      {resources.map((resource: any) => (
                        <SelectItem key={resource.id} value={resource.id.toString()}>
                          {resource.name} {resource.capacity && `(max. ${resource.capacity} Pers.)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4" />
                    Datum
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
                          "Datum wählen"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.selectedDate || undefined}
                        onSelect={(date) => updateField('selectedDate', date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        locale={de}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    Uhrzeit
                  </Label>
                  <Select 
                    value={formData.selectedTime} 
                    onValueChange={(value) => updateField('selectedTime', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Uhrzeit wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_TIME_SLOTS.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {bookingType === 'RESOURCE' && (
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    Dauer (Stunden)
                  </Label>
                  <Select 
                    value={formData.duration.toString()} 
                    onValueChange={(value) => updateField('duration', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map(h => (
                        <SelectItem key={h} value={h.toString()}>{h} Stunde{h > 1 ? 'n' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              {bookingType === 'DAY_PASS' ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <Label className="flex items-center gap-2 font-medium mb-4">
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
                          <span className="text-sm text-gray-500">à {experience?.price?.toFixed(2)}€</span>
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
                          <span className="text-sm text-gray-500">à {(experience?.price * 0.5)?.toFixed(2)}€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    Anzahl Teilnehmer
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateField('participants', Math.max(1, formData.participants - 1))}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-medium text-lg">{formData.participants}</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateField('participants', formData.participants + 1)}
                    >
                      +
                    </Button>
                    <span className="text-gray-500">à {experience?.price?.toFixed(2)}€ pro Person</span>
                  </div>
                </div>
              )}

              {priceMutation.data && (
                <div className="bg-purple-50 p-4 rounded-lg mt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Grundpreis</span>
                      <span>{priceMutation.data.basePrice?.toFixed(2)}€</span>
                    </div>
                    {priceMutation.data.weekendSurcharge > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Wochenend-Zuschlag</span>
                        <span>+{priceMutation.data.weekendSurcharge?.toFixed(2)}€</span>
                      </div>
                    )}
                    {priceMutation.data.groupDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Gruppenrabatt</span>
                        <span>-{priceMutation.data.groupDiscount?.toFixed(2)}€</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Gesamt</span>
                      <span className="text-purple-600">{priceMutation.data.totalPrice?.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Vorname *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    placeholder="Max"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nachname *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    placeholder="Mustermann"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="max@beispiel.de"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+49 123 456789"
                />
              </div>
              <div>
                <Label htmlFor="specialRequests">Besondere Wünsche (optional)</Label>
                <Input
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => updateField('specialRequests', e.target.value)}
                  placeholder="z.B. Allergien, Barrierefreiheit..."
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium">Buchungsübersicht</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-600">Erlebnis:</span>
                  <span className="font-medium">{experience?.title}</span>
                  
                  <span className="text-gray-600">Datum:</span>
                  <span>{formData.selectedDate ? format(formData.selectedDate, 'PPP', { locale: de }) : '-'}</span>
                  
                  <span className="text-gray-600">Uhrzeit:</span>
                  <span>{formData.selectedTime}</span>
                  
                  <span className="text-gray-600">Teilnehmer:</span>
                  <span>{getParticipantCount()} Person(en)</span>
                  
                  <span className="text-gray-600">Kontakt:</span>
                  <span>{formData.firstName} {formData.lastName}</span>
                  
                  <span className="text-gray-600">E-Mail:</span>
                  <span>{formData.email}</span>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Gesamtpreis:</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {priceMutation.data?.totalPrice?.toFixed(2) || experience?.price?.toFixed(2)}€
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>

        {currentStep < WIZARD_STEPS.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Weiter
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={!canProceed()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4 mr-2" />
            Buchung abschließen
          </Button>
        )}
      </div>
    </div>
  );
}
