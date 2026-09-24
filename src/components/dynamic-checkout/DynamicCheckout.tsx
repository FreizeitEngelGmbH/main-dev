import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DynamicCheckoutProps {
  experienceId: number;
  onBookingComplete?: (bookingData: any) => void;
}

interface BookingParameter {
  id: number;
  name: string;
  parameterType: string;
  description?: string | null;
  required: boolean;
  possibleValues?: any;
  defaultValue?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  unit?: string | null;
  customLabel?: string | null;
  displayOrder: number | null;
  pricing: {
    pricingType: string;
    basePrice: number;
    pricePerUnit?: number;
    pricePerPerson?: number;
    multiplier?: number;
    tieredPricing?: any;
  };
}

interface BookingConfig {
  experience: {
    id: number;
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
  };
  parameters: BookingParameter[];
}

// Time slots with 20-minute intervals
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

export default function DynamicCheckout({ experienceId, onBookingComplete }: DynamicCheckoutProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("ALLE");
  const { toast } = useToast();

  // Fetch dynamic booking configuration
  const { data: bookingConfig, isLoading, error } = useQuery<BookingConfig>({
    queryKey: [`/api/experiences/${experienceId}/booking-config`],
    queryFn: async () => {
      const response = await fetch(`/api/experiences/${experienceId}/booking-config`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking configuration');
      }
      return response.json();
    },
    enabled: !!experienceId,
  });

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      return apiRequest('POST', '/api/bookings', {
        experienceId,
        userId: null, // Guest booking
        date: bookingData.date,
        time: bookingData.time,
        participants: bookingData.participants || 1,
        contactName: bookingData.contactName,
        contactEmail: bookingData.contactEmail,
        contactPhone: bookingData.contactPhone || null,
        message: null,
        isGuestBooking: true,
        paymentMethod: bookingData.paymentMethod || 'vor_ort',
        totalPrice: totalPrice,
        bookingDetails: {
          parameters: parameterValues,
          priceBreakdown: calculatePriceBreakdown()
        }
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Buchung erfolgreich!",
        description: "Ihre Buchung wurde erfolgreich erstellt.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      onBookingComplete?.(data);
    },
    onError: (error: any) => {
      console.error('Booking error:', error);
      toast({
        title: "Buchung fehlgeschlagen",
        description: error.message || "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    },
  });

  // Create dynamic form schema based on parameters
  const createFormSchema = (parameters: BookingParameter[]) => {
    const schemaFields: Record<string, any> = {
      date: z.date({
        required_error: "Bitte wählen Sie ein Datum",
      }),
      time: z.string().min(1, "Bitte wählen Sie eine Uhrzeit"),
      participants: z.preprocess((val) => {
        const num = parseInt(String(val));
        return isNaN(num) ? 1 : num;
      }, z.number().min(1, "Mindestens 1 Person").max(50, "Maximal 50 Personen")),
      contactName: z.string().min(2, "Name ist erforderlich"),
      contactEmail: z.string().email("Ungültige E-Mail-Adresse"),
      contactPhone: z.string().optional(),
      paymentMethod: z.enum(["vor_ort", "paypal"], {
        required_error: "Bitte wählen Sie eine Zahlungsmethode",
      }),
    };

    parameters.forEach((param) => {
      const fieldKey = `param_${param.id}`;
      
      switch (param.parameterType) {
        case 'number':
          schemaFields[fieldKey] = z.preprocess((val) => {
            const num = parseInt(String(val));
            return isNaN(num) ? 0 : num;
          }, z.number().min(param.minValue || 1, `Mindestens ${param.minValue || 1}`)
               .max(param.maxValue || 100, `Maximal ${param.maxValue || 100}`));
          break;
        case 'select':
          schemaFields[fieldKey] = param.required 
            ? z.string().min(1, "Bitte wählen Sie eine Option")
            : z.string().optional();
          break;
        case 'checkbox':
          schemaFields[fieldKey] = param.required 
            ? z.boolean().refine(val => val === true, "Diese Option muss ausgewählt werden")
            : z.boolean().optional();
          break;
        case 'text':
          schemaFields[fieldKey] = param.required 
            ? z.string().min(1, "Dieses Feld ist erforderlich")
            : z.string().optional();
          break;
        default:
          schemaFields[fieldKey] = z.any().optional();
      }
    });

    return z.object(schemaFields);
  };

  const form = useForm({
    resolver: bookingConfig ? zodResolver(createFormSchema(bookingConfig.parameters)) : undefined,
    defaultValues: {
      date: undefined,
      time: '',
      participants: 1,
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      paymentMethod: 'vor_ort',
    },
  });

  // Calculate price breakdown for booking details
  const calculatePriceBreakdown = () => {
    if (!bookingConfig) return [];
    
    const breakdown = [
      { name: 'Grundpreis', price: bookingConfig.experience.price }
    ];

    bookingConfig.parameters.forEach((param) => {
      const value = parameterValues[`param_${param.id}`];
      if (value === undefined || value === null || value === '') return;

      const pricing = param.pricing;
      let addedPrice = 0;

      switch (pricing.pricingType) {
        case 'fixed':
          if (value === true || value !== '') {
            addedPrice = pricing.basePrice;
            breakdown.push({ name: param.name, price: addedPrice });
          }
          break;
        case 'per_unit':
          const units = typeof value === 'string' ? parseInt(value) : value;
          addedPrice = pricing.basePrice + ((pricing.pricePerUnit || 0) * units);
          if (addedPrice > 0) {
            breakdown.push({ name: `${param.name} (${units})`, price: addedPrice });
          }
          break;
        case 'per_person':
          const persons = typeof value === 'string' ? parseInt(value) : value;
          addedPrice = (pricing.pricePerPerson || 0) * persons;
          if (addedPrice > 0) {
            breakdown.push({ name: `${param.name} (${persons} Personen)`, price: addedPrice });
          }
          break;
        case 'multiplier':
          const multiplier = typeof value === 'string' ? parseInt(value) : value;
          addedPrice = pricing.basePrice * (multiplier || 1);
          if (addedPrice > 0) {
            breakdown.push({ name: `${param.name} (${multiplier}x)`, price: addedPrice });
          }
          break;
      }
    });

    return breakdown;
  };

  // Calculate total price based on parameter values
  useEffect(() => {
    if (!bookingConfig) return;

    let calculatedPrice = bookingConfig.experience.price;

    bookingConfig.parameters.forEach((param) => {
      const value = parameterValues[`param_${param.id}`];
      if (value === undefined || value === null || value === '') return;

      const pricing = param.pricing;

      switch (pricing.pricingType) {
        case 'fixed':
          if (value === true || value !== '') { // For checkboxes or any truthy value
            calculatedPrice += pricing.basePrice;
          }
          break;
        case 'per_unit':
          const units = typeof value === 'string' ? parseInt(value) : value;
          calculatedPrice += pricing.basePrice + ((pricing.pricePerUnit || 0) * units);
          break;
        case 'per_person':
          const persons = typeof value === 'string' ? parseInt(value) : value;
          calculatedPrice += (pricing.pricePerPerson || 0) * persons;
          break;
        case 'multiplier':
          const multiplier = typeof value === 'string' ? parseInt(value) : value;
          calculatedPrice += pricing.basePrice * (multiplier || 1);
          break;
        case 'tiered':
          // Handle tiered pricing if needed
          break;
      }
    });

    setTotalPrice(calculatedPrice);
  }, [parameterValues, bookingConfig]);

  // Handle parameter value changes
  const handleParameterChange = (parameterId: number, value: any) => {
    const newValues = { ...parameterValues, [`param_${parameterId}`]: value };
    setParameterValues(newValues);
    
    // Update form values
    form.setValue(`param_${parameterId}` as any, value);
  };

  // Check if parameter should be displayed based on conditions
  const shouldDisplayParameter = (parameter: BookingParameter): boolean => {
    // Special case: Schuhgrößen should only show if Schuhverleih is checked
    if (parameter.name === 'Schuhgrößen') {
      const schuhverleihParam = bookingConfig?.parameters.find(p => p.name === 'Schuhverleih');
      if (schuhverleihParam) {
        const schuhverleihValue = parameterValues[`param_${schuhverleihParam.id}`];
        return schuhverleihValue === true;
      }
      return false;
    }
    return true;
  };

  // Render dynamic parameter field
  const renderParameterField = (parameter: BookingParameter) => {
    const fieldKey = `param_${parameter.id}`;
    const value = parameterValues[fieldKey];

    // Check if parameter should be displayed
    if (!shouldDisplayParameter(parameter)) {
      return null;
    }

    switch (parameter.parameterType) {
      case 'number':
        return (
          <FormField
            key={parameter.id}
            control={form.control}
            name={fieldKey as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {parameter.name}
                  {parameter.required && <span className="text-red-500 ml-1">*</span>}
                  {parameter.unit && <span className="text-sm text-gray-500 ml-1">({parameter.unit})</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={parameter.minValue || 1}
                    max={parameter.maxValue || 100}
                    placeholder={parameter.description || parameter.name}
                    {...field}
                    onChange={(e) => {
                      const numValue = parseInt(e.target.value) || 0;
                      field.onChange(numValue);
                      handleParameterChange(parameter.id, numValue);
                    }}
                    data-testid={`input-${parameter.name.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                </FormControl>
                {parameter.description && (
                  <p className="text-sm text-gray-600">{parameter.description}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'select':
        return (
          <FormField
            key={parameter.id}
            control={form.control}
            name={fieldKey as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {parameter.name}
                  {parameter.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <Select 
                  onValueChange={(selectedValue) => {
                    field.onChange(selectedValue);
                    handleParameterChange(parameter.id, selectedValue);
                  }} 
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger data-testid={`select-${parameter.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <SelectValue placeholder={parameter.description || `Wählen Sie ${parameter.name}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {parameter.possibleValues?.map((option: any) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {parameter.description && (
                  <p className="text-sm text-gray-600">{parameter.description}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'checkbox':
        return (
          <FormField
            key={parameter.id}
            control={form.control}
            name={fieldKey as any}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      handleParameterChange(parameter.id, checked);
                    }}
                    data-testid={`checkbox-${parameter.name.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{parameter.name}</FormLabel>
                  {parameter.description && (
                    <p className="text-sm text-gray-600">{parameter.description}</p>
                  )}
                </div>
              </FormItem>
            )}
          />
        );

      default:
        return (
          <FormField
            key={parameter.id}
            control={form.control}
            name={fieldKey as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {parameter.name}
                  {parameter.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={parameter.description || parameter.name}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleParameterChange(parameter.id, e.target.value);
                    }}
                    data-testid={`input-${parameter.name.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                </FormControl>
                {parameter.description && (
                  <p className="text-sm text-gray-600">{parameter.description}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  const handleSubmit = (data: any) => {
    bookingMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Lade Buchungskonfiguration...</span>
      </div>
    );
  }

  if (error || !bookingConfig) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Fehler beim Laden der Buchungskonfiguration</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Checkout Form */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ihre Auswahl</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg" data-testid="experience-title">
                  {bookingConfig.experience.title}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {bookingConfig.experience.description}
                </p>
              </div>

              <Separator />

              {/* Dynamic Parameters */}
              <div className="space-y-4">
                {bookingConfig.parameters
                  .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                  .map(renderParameterField)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kontaktdaten</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ihr vollständiger Name" {...field} data-testid="input-contact-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-Mail *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="ihre@email.de" {...field} data-testid="input-contact-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon (optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Ihre Telefonnummer" {...field} data-testid="input-contact-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Datum *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="button-date-picker"
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: de })
                                ) : (
                                  <span>Wählen Sie ein Datum</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date()
                              }
                              initialFocus
                              locale={de}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Uhrzeit *</FormLabel>
                        
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
                              onClick={() => field.onChange(time)}
                              className={cn(
                                "px-2 py-2 text-sm font-medium rounded transition-all",
                                field.value === time
                                  ? "bg-purple-600 text-white"
                                  : "bg-[#9a9a6c] text-white hover:bg-[#8a8a5c]"
                              )}
                              data-testid={`time-slot-${time}`}
                            >
                              {time} Uhr
                            </button>
                          ))}
                        </div>
                        
                        {field.value && (
                          <p className="text-sm text-green-600 mt-2">
                            Ausgewählt: {field.value} Uhr
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="participants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anzahl der Personen *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={50}
                            placeholder="Anzahl der Personen"
                            {...field}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              field.onChange(value);
                            }}
                            data-testid="input-participants"
                          />
                        </FormControl>
                        <p className="text-sm text-gray-500">Wie viele Personen nehmen teil?</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="my-4" />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zahlungsmethode *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-payment-method">
                              <SelectValue placeholder="Wählen Sie eine Zahlungsmethode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="vor_ort">Zahlung vor Ort</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Price Summary */}
        <div className="md:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Buchungsübersicht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Grundpreis</span>
                  <span data-testid="base-price">{bookingConfig.experience.price.toFixed(2)}€</span>
                </div>
                
                {/* Dynamic price breakdown */}
                {bookingConfig.parameters.map((param) => {
                  const value = parameterValues[`param_${param.id}`];
                  if (!value || value === '' || (param.parameterType === 'checkbox' && !value)) return null;

                  let addedPrice = 0;
                  const pricing = param.pricing;
                  
                  switch (pricing.pricingType) {
                    case 'fixed':
                      addedPrice = pricing.basePrice;
                      break;
                    case 'per_unit':
                      const units = typeof value === 'string' ? parseInt(value) : value;
                      addedPrice = pricing.basePrice + ((pricing.pricePerUnit || 0) * units);
                      break;
                    case 'per_person':
                      const persons = typeof value === 'string' ? parseInt(value) : value;
                      addedPrice = (pricing.pricePerPerson || 0) * persons;
                      break;
                    case 'multiplier':
                      const multiplier = typeof value === 'string' ? parseInt(value) : value;
                      addedPrice = pricing.basePrice * (multiplier || 1);
                      break;
                  }

                  if (addedPrice > 0) {
                    return (
                      <div key={param.id} className="flex justify-between text-sm">
                        <span>
                          {param.name}
                          {param.parameterType === 'select' && param.possibleValues ? 
                            ` (${param.possibleValues.find((opt: any) => opt.id === value)?.label || value})` :
                            param.parameterType === 'number' ? ` (${value})` : ''
                          }
                        </span>
                        <span data-testid={`price-${param.name.toLowerCase().replace(/\s+/g, '-')}`}>
                          +{addedPrice.toFixed(2)}€
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}

                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Gesamtsumme</span>
                  <span data-testid="total-price">{totalPrice.toFixed(2).replace('.', ',')}€</span>
                </div>
              </div>

              <Button 
                className="w-full mt-6" 
                size="lg"
                onClick={form.handleSubmit(handleSubmit)}
                data-testid="button-complete-booking"
              >
                Buchung abschließen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}