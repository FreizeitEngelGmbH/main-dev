import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Euro,
  Eye,
  FileText,
  Globe,
  Image as ImageIcon,
  Info,
  Loader2,
  MapPin,
  Plus,
  Save,
  Tag,
  Ticket,
  Trash2,
  Video,
  Calendar,
  Copy,
  Edit,
  X
} from "lucide-react";
import { apiRequest, queryClient } from "@/partner-demo/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface TicketCategory {
  id: string;
  name: string;
  tickets: TicketItem[];
}

interface TicketItem {
  id: string;
  name: string;
  quantity: number;
  originalPrice: string;
  onlinePrice: string;
  vatRate: string;
  visible: boolean;
}

interface ValidityPeriod {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  label: string;
}

interface OpeningHours {
  [day: string]: { open: boolean; from: string; to: string; breakFrom?: string; breakTo?: string };
}

interface AngebotData {
  id?: number;
  title: string;
  description: string;
  shortDescription: string;
  location: string;
  city: string;
  postalCode: string;
  price: number;
  categoryId: number;
  imageUrl: string;
  duration: string;
  maxParticipants: string;
  specialNotes: string;
  instantBooking: boolean;
  active: boolean;
  ticketCategories: TicketCategory[];
  validityPeriods: ValidityPeriod[];
  openingHours: OpeningHours;
  youtubeUrl: string;
  pdfUrl: string;
}

const defaultOpeningHours: OpeningHours = {
  Montag: { open: true, from: "09:00", to: "18:00" },
  Dienstag: { open: true, from: "09:00", to: "18:00" },
  Mittwoch: { open: true, from: "09:00", to: "18:00" },
  Donnerstag: { open: true, from: "09:00", to: "18:00" },
  Freitag: { open: true, from: "09:00", to: "20:00" },
  Samstag: { open: true, from: "10:00", to: "18:00" },
  Sonntag: { open: false, from: "10:00", to: "16:00" },
};

const defaultAngebot: AngebotData = {
  title: "",
  description: "",
  shortDescription: "",
  location: "",
  city: "",
  postalCode: "",
  price: 0,
  categoryId: 0,
  imageUrl: "",
  duration: "",
  maxParticipants: "",
  specialNotes: "",
  instantBooking: true,
  active: true,
  ticketCategories: [],
  validityPeriods: [],
  openingHours: defaultOpeningHours,
  youtubeUrl: "",
  pdfUrl: "",
};

const STEPS = [
  { key: "basis", label: "Basisinfos", icon: Info },
  { key: "details", label: "Details", icon: FileText },
  { key: "tickets", label: "Tickets", icon: Ticket },
  { key: "validity", label: "Gültigkeit", icon: Calendar },
  { key: "hours", label: "Öffnungszeiten", icon: Clock },
  { key: "location", label: "Ort", icon: MapPin },
  { key: "media", label: "Bilder & Videos", icon: ImageIcon },
  { key: "preview", label: "Vorschau", icon: Eye },
];

interface AngebotEditorProps {
  experience?: any;
  onClose: () => void;
}

export default function AngebotEditor({ experience, onClose }: AngebotEditorProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AngebotData>(defaultAngebot);
  const [priceEuro, setPriceEuro] = useState("0,00");
  const isEditing = !!experience?.id;

  const { data: categories } = useQuery<Category[]>({ queryKey: ["/api/categories"] });
  const { data: partnerProfile } = useQuery<any>({ queryKey: ["/api/partner/profile"] });

  useEffect(() => {
    if (experience) {
      setFormData({
        ...defaultAngebot,
        ...experience,
        ticketCategories: experience.ticketCategories || [],
        validityPeriods: experience.validityPeriods || [],
        openingHours: experience.openingHours || defaultOpeningHours,
      });
      setPriceEuro(experience.price?.toFixed(2).replace(".", ",") || "0,00");
    } else if (partnerProfile) {
      setFormData({
        ...defaultAngebot,
        location: partnerProfile.location || partnerProfile.city || "",
        city: partnerProfile.city || "",
        postalCode: partnerProfile.postalCode || "",
      });
    }
  }, [experience, partnerProfile]);

  const updateField = (field: keyof AngebotData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (value: string) => {
    const cleaned = value.replace(/[^0-9,\.]/g, "");
    setPriceEuro(cleaned);
    const numericStr = cleaned.replace(",", ".");
    const euros = parseFloat(numericStr);
    if (!isNaN(euros)) {
      setFormData((prev) => ({ ...prev, price: euros }));
    }
  };

  const addTicketCategory = () => {
    const newCat: TicketCategory = {
      id: `cat-${Date.now()}`,
      name: "Neue Ticket-Kategorie",
      tickets: [
        {
          id: `ticket-${Date.now()}`,
          name: "Standardticket",
          quantity: 100,
          originalPrice: "0,00",
          onlinePrice: "0,00",
          vatRate: "19",
          visible: true,
        },
      ],
    };
    updateField("ticketCategories", [...formData.ticketCategories, newCat]);
  };

  const removeTicketCategory = (catId: string) => {
    updateField("ticketCategories", formData.ticketCategories.filter((c) => c.id !== catId));
  };

  const updateTicketCategory = (catId: string, field: string, value: any) => {
    updateField("ticketCategories",
      formData.ticketCategories.map((c) => (c.id === catId ? { ...c, [field]: value } : c))
    );
  };

  const addTicketToCategory = (catId: string) => {
    updateField("ticketCategories",
      formData.ticketCategories.map((c) =>
        c.id === catId
          ? {
              ...c,
              tickets: [
                ...c.tickets,
                {
                  id: `ticket-${Date.now()}`,
                  name: "Neues Ticket",
                  quantity: 100,
                  originalPrice: "0,00",
                  onlinePrice: "0,00",
                  vatRate: "19",
                  visible: true,
                },
              ],
            }
          : c
      )
    );
  };

  const updateTicket = (catId: string, ticketId: string, field: string, value: any) => {
    updateField("ticketCategories",
      formData.ticketCategories.map((c) =>
        c.id === catId
          ? {
              ...c,
              tickets: c.tickets.map((t) => (t.id === ticketId ? { ...t, [field]: value } : t)),
            }
          : c
      )
    );
  };

  const removeTicket = (catId: string, ticketId: string) => {
    updateField("ticketCategories",
      formData.ticketCategories.map((c) =>
        c.id === catId ? { ...c, tickets: c.tickets.filter((t) => t.id !== ticketId) } : c
      )
    );
  };

  const addValidityPeriod = () => {
    const newPeriod: ValidityPeriod = {
      id: `vp-${Date.now()}`,
      type: "Festgelegte Öffnungszeiten",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
      label: "Standardzeitraum",
    };
    updateField("validityPeriods", [...formData.validityPeriods, newPeriod]);
  };

  const duplicateValidityPeriod = (vpId: string) => {
    const original = formData.validityPeriods.find((v) => v.id === vpId);
    if (original) {
      const copy = { ...original, id: `vp-${Date.now()}`, label: `${original.label} (Kopie)` };
      updateField("validityPeriods", [...formData.validityPeriods, copy]);
    }
  };

  const removeValidityPeriod = (vpId: string) => {
    updateField("validityPeriods", formData.validityPeriods.filter((v) => v.id !== vpId));
  };

  const updateValidityPeriod = (vpId: string, field: string, value: string) => {
    updateField("validityPeriods",
      formData.validityPeriods.map((v) => (v.id === vpId ? { ...v, [field]: value } : v))
    );
  };

  const updateOpeningHour = (day: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: { ...prev.openingHours[day], [field]: value },
      },
    }));
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        location: formData.location,
        city: formData.city,
        postalCode: formData.postalCode,
        price: Number(formData.price),
        categoryId: Number(formData.categoryId),
        imageUrl: formData.imageUrl,
        duration: formData.duration,
        maxParticipants: formData.maxParticipants,
        specialNotes: formData.specialNotes,
        instantBooking: formData.instantBooking,
        active: formData.active,
      };
      const response = await apiRequest("POST", "/api/partner/experiences", payload);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Fehler beim Erstellen");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partner/experiences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/stats"] });
      toast({ title: "Angebot erstellt", description: "Ihr neues Angebot wurde erfolgreich angelegt." });
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        location: formData.location,
        city: formData.city,
        postalCode: formData.postalCode,
        price: Number(formData.price),
        categoryId: Number(formData.categoryId),
        imageUrl: formData.imageUrl,
        duration: formData.duration,
        maxParticipants: formData.maxParticipants,
        specialNotes: formData.specialNotes,
        instantBooking: formData.instantBooking,
        active: formData.active,
      };
      const response = await apiRequest("PATCH", `/api/partner/experiences/${experience?.id}`, payload);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Fehler beim Aktualisieren");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partner/experiences"] });
      toast({ title: "Angebot aktualisiert", description: "Die Änderungen wurden gespeichert." });
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!formData.title || !formData.shortDescription || !formData.location || !formData.city || !formData.postalCode || !formData.categoryId) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus (Titel, Kurzbeschreibung, Kategorie, Standort, PLZ, Stadt).",
        variant: "destructive",
      });
      setCurrentStep(0);
      return;
    }
    if (isEditing) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const categoryName = categories?.find((c) => c.id === formData.categoryId)?.name || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-lg font-semibold text-gray-900">
                {isEditing ? "Angebot bearbeiten" : "Neues Angebot erstellen"}
              </h1>
              {formData.title && (
                <Badge variant="outline" className="text-purple-700 border-purple-200">
                  {formData.title}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose} disabled={isPending}>
                Abbrechen
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSave} disabled={isPending}>
                {isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Speichern...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />{isEditing ? "Speichern" : "Angebot erstellen"}</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1 sticky top-24">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === index;
                const isCompleted = index < currentStep;
                return (
                  <button
                    key={step.key}
                    onClick={() => setCurrentStep(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      isActive
                        ? "bg-purple-100 text-purple-700 font-medium border border-purple-200"
                        : isCompleted
                        ? "text-green-700 bg-green-50 hover:bg-green-100"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? "bg-purple-600 text-white"
                          : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : <span className="text-sm font-medium">{index + 1}</span>}
                    </div>
                    <div>
                      <span className="text-sm">{step.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex-1 min-w-0">
            {currentStep === 0 && (
              <StepBasisinfos formData={formData} updateField={updateField} categories={categories || []} />
            )}
            {currentStep === 1 && (
              <StepDetails formData={formData} updateField={updateField} />
            )}
            {currentStep === 2 && (
              <StepTickets
                formData={formData}
                addTicketCategory={addTicketCategory}
                removeTicketCategory={removeTicketCategory}
                updateTicketCategory={updateTicketCategory}
                addTicketToCategory={addTicketToCategory}
                updateTicket={updateTicket}
                removeTicket={removeTicket}
                priceEuro={priceEuro}
                handlePriceChange={handlePriceChange}
              />
            )}
            {currentStep === 3 && (
              <StepValidity
                formData={formData}
                addValidityPeriod={addValidityPeriod}
                duplicateValidityPeriod={duplicateValidityPeriod}
                removeValidityPeriod={removeValidityPeriod}
                updateValidityPeriod={updateValidityPeriod}
              />
            )}
            {currentStep === 4 && (
              <StepOpeningHours formData={formData} updateOpeningHour={updateOpeningHour} />
            )}
            {currentStep === 5 && (
              <StepLocation formData={formData} updateField={updateField} />
            )}
            {currentStep === 6 && (
              <StepMedia formData={formData} updateField={updateField} />
            )}
            {currentStep === 7 && (
              <StepPreview formData={formData} categoryName={categoryName} />
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                Schritt {currentStep + 1} von {STEPS.length}
              </div>
              {currentStep < STEPS.length - 1 ? (
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Weiter
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave} disabled={isPending}>
                  {isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Speichern...</>
                  ) : (
                    <><Check className="h-4 w-4 mr-2" />{isEditing ? "Änderungen speichern" : "Angebot veröffentlichen"}</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepBasisinfos({ formData, updateField, categories }: { formData: AngebotData; updateField: (f: keyof AngebotData, v: any) => void; categories: Category[] }) {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-purple-600" />
          Basisinformationen
        </CardTitle>
        <CardDescription>Grundlegende Informationen zu Ihrem Angebot</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Angebotsname / Titel *</Label>
          <Input
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="z.B. Zoo Familienkarte, Bowling 1 Std., Tageskarte Erwachsene..."
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">Der Name wird in der Suche und auf Ihrer Shop-Seite angezeigt</p>
        </div>

        <div>
          <Label className="text-sm font-medium">Kategorie *</Label>
          <Select value={formData.categoryId?.toString() || ""} onValueChange={(v) => updateField("categoryId", parseInt(v))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Kategorie auswählen" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Kurzbeschreibung *</Label>
          <Input
            value={formData.shortDescription}
            onChange={(e) => updateField("shortDescription", e.target.value)}
            placeholder="Kurze Info zum Angebot (max. 200 Zeichen)"
            maxLength={200}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/200 Zeichen</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Dauer</Label>
            <Input
              value={formData.duration}
              onChange={(e) => updateField("duration", e.target.value)}
              placeholder="z.B. 1 Stunde, Ganztags, 90 Min."
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Max. Teilnehmer</Label>
            <Input
              value={formData.maxParticipants}
              onChange={(e) => updateField("maxParticipants", e.target.value)}
              placeholder="z.B. 1, 6, unbegrenzt"
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div>
            <Label className="text-sm font-medium">Sofortbuchung</Label>
            <p className="text-xs text-gray-500">Buchungen werden automatisch bestätigt</p>
          </div>
          <Switch
            checked={formData.instantBooking}
            onCheckedChange={(checked) => updateField("instantBooking", checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div>
            <Label className="text-sm font-medium">Angebot aktiv</Label>
            <p className="text-xs text-gray-500">Deaktivierte Angebote sind für Kunden nicht sichtbar</p>
          </div>
          <Switch
            checked={formData.active}
            onCheckedChange={(checked) => updateField("active", checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StepDetails({ formData, updateField }: { formData: AngebotData; updateField: (f: keyof AngebotData, v: any) => void }) {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Detailbeschreibung
        </CardTitle>
        <CardDescription>Ausführliche Informationen für die Detailseite Ihres Angebots</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Ausführliche Beschreibung</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Beschreiben Sie Ihr Angebot ausführlich. Was erwartet die Besucher? Welche Highlights gibt es? Was ist im Preis enthalten?"
            rows={8}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">Wird auf der Detailseite des Angebots angezeigt</p>
        </div>

        <div>
          <Label className="text-sm font-medium">Besondere Hinweise</Label>
          <Textarea
            value={formData.specialNotes}
            onChange={(e) => updateField("specialNotes", e.target.value)}
            placeholder="z.B. Altersbeschränkungen, Leihschuhe zzgl., Parkmöglichkeiten, was mitzubringen ist..."
            rows={4}
            className="mt-1"
          />
        </div>

        <Card className="border border-blue-100 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">Tipp: Gute Beschreibungen verkaufen besser</p>
                <p className="text-xs text-blue-700 mt-1">
                  Nennen Sie konkrete Details: Was macht Ihr Angebot besonders? Welche Altersgruppen sind geeignet?
                  Gibt es Parkplätze? Ist das Angebot barrierefrei?
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

function StepTickets({
  formData,
  addTicketCategory,
  removeTicketCategory,
  updateTicketCategory,
  addTicketToCategory,
  updateTicket,
  removeTicket,
  priceEuro,
  handlePriceChange,
}: {
  formData: AngebotData;
  addTicketCategory: () => void;
  removeTicketCategory: (id: string) => void;
  updateTicketCategory: (id: string, field: string, value: any) => void;
  addTicketToCategory: (id: string) => void;
  updateTicket: (catId: string, ticketId: string, field: string, value: any) => void;
  removeTicket: (catId: string, ticketId: string) => void;
  priceEuro: string;
  handlePriceChange: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-green-600" />
            Standardpreis
          </CardTitle>
          <CardDescription>Der Hauptpreis für dieses Angebot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Label className="text-sm font-medium">Online-Preis (€)</Label>
            <div className="relative mt-1">
              <Input value={priceEuro} onChange={(e) => handlePriceChange(e.target.value)} placeholder="0,00" className="pr-8 text-lg font-semibold" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">0,00€ = Kostenlos / Preis auf Anfrage</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-purple-600" />
                Ticket-Kategorien
              </CardTitle>
              <CardDescription>Erstellen Sie verschiedene Ticketkategorien mit unterschiedlichen Preisen</CardDescription>
            </div>
            <Button onClick={addTicketCategory} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Kategorie hinzufügen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {formData.ticketCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
              <Ticket className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Noch keine Ticket-Kategorien</p>
              <p className="text-sm mt-1">Erstellen Sie Ticketkategorien wie "Erwachsene", "Kinder", "Familienkarte"</p>
              <Button onClick={addTicketCategory} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Erste Kategorie erstellen
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.ticketCategories.map((cat) => (
                <div key={cat.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
                    <Input
                      value={cat.name}
                      onChange={(e) => updateTicketCategory(cat.id, "name", e.target.value)}
                      className="font-semibold bg-transparent border-0 p-0 h-auto text-base focus-visible:ring-0 max-w-md"
                      placeholder="Kategoriename..."
                    />
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => addTicketToCategory(cat.id)}>
                        <Plus className="h-3 w-3 mr-1" />
                        Ticket
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => removeTicketCategory(cat.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Ticket</th>
                          <th className="text-center px-3 py-2 font-medium text-gray-600 w-20">Anzahl</th>
                          <th className="text-center px-3 py-2 font-medium text-gray-600 w-28">Originalpreis</th>
                          <th className="text-center px-3 py-2 font-medium text-gray-600 w-28">Online-Preis</th>
                          <th className="text-center px-3 py-2 font-medium text-gray-600 w-20">MwSt.</th>
                          <th className="text-center px-3 py-2 font-medium text-gray-600 w-20">Sichtbar</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cat.tickets.map((ticket) => (
                          <tr key={ticket.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <Input
                                value={ticket.name}
                                onChange={(e) => updateTicket(cat.id, ticket.id, "name", e.target.value)}
                                className="border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
                                placeholder="Ticketname..."
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                value={ticket.quantity}
                                onChange={(e) => updateTicket(cat.id, ticket.id, "quantity", parseInt(e.target.value) || 0)}
                                className="text-center h-8 text-sm"
                                min={0}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <div className="relative">
                                <Input
                                  value={ticket.originalPrice}
                                  onChange={(e) => updateTicket(cat.id, ticket.id, "originalPrice", e.target.value)}
                                  className="text-center h-8 text-sm pr-6"
                                  placeholder="0,00"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="relative">
                                <Input
                                  value={ticket.onlinePrice}
                                  onChange={(e) => updateTicket(cat.id, ticket.id, "onlinePrice", e.target.value)}
                                  className="text-center h-8 text-sm pr-6 font-semibold text-green-700"
                                  placeholder="0,00"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <Select value={ticket.vatRate} onValueChange={(v) => updateTicket(cat.id, ticket.id, "vatRate", v)}>
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">0%</SelectItem>
                                  <SelectItem value="7">7%</SelectItem>
                                  <SelectItem value="19">19%</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <Switch
                                checked={ticket.visible}
                                onCheckedChange={(v) => updateTicket(cat.id, ticket.id, "visible", v)}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-600" onClick={() => removeTicket(cat.id, ticket.id)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StepValidity({
  formData,
  addValidityPeriod,
  duplicateValidityPeriod,
  removeValidityPeriod,
  updateValidityPeriod,
}: {
  formData: AngebotData;
  addValidityPeriod: () => void;
  duplicateValidityPeriod: (id: string) => void;
  removeValidityPeriod: (id: string) => void;
  updateValidityPeriod: (id: string, field: string, value: string) => void;
}) {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Gültigkeitszeiträume
            </CardTitle>
            <CardDescription>Definieren Sie, wann Ihr Angebot buchbar ist</CardDescription>
          </div>
          <Button onClick={addValidityPeriod} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Gültigkeit hinzufügen
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {formData.validityPeriods.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Keine Gültigkeitszeiträume definiert</p>
            <p className="text-sm mt-1">Ohne Einschränkung ist das Angebot dauerhaft gültig</p>
            <Button onClick={addValidityPeriod} variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Zeitraum erstellen
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.validityPeriods.map((vp) => (
              <div key={vp.id} className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Input
                      value={vp.label}
                      onChange={(e) => updateValidityPeriod(vp.id, "label", e.target.value)}
                      className="font-semibold border-0 p-0 h-auto focus-visible:ring-0 text-base bg-transparent"
                      placeholder="Name des Zeitraums..."
                    />
                    <Badge variant="outline" className="mt-2 text-xs">{vp.type}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => duplicateValidityPeriod(vp.id)} title="Gültigkeit kopieren">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => removeValidityPeriod(vp.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Startdatum</Label>
                    <Input
                      type="date"
                      value={vp.startDate}
                      onChange={(e) => updateValidityPeriod(vp.id, "startDate", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Enddatum</Label>
                    <Input
                      type="date"
                      value={vp.endDate}
                      onChange={(e) => updateValidityPeriod(vp.id, "endDate", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <Label className="text-xs text-gray-500">Typ</Label>
                  <Select value={vp.type} onValueChange={(v) => updateValidityPeriod(vp.id, "type", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Festgelegte Öffnungszeiten">Festgelegte Öffnungszeiten</SelectItem>
                      <SelectItem value="Saisonzeitraum">Saisonzeitraum</SelectItem>
                      <SelectItem value="Sonderöffnungszeiten">Sonderöffnungszeiten</SelectItem>
                      <SelectItem value="Feiertage">Feiertage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StepOpeningHours({
  formData,
  updateOpeningHour,
}: {
  formData: AngebotData;
  updateOpeningHour: (day: string, field: string, value: any) => void;
}) {
  const days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Öffnungszeiten
          </CardTitle>
          <CardDescription>Legen Sie die regulären Öffnungszeiten für dieses Angebot fest</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {days.map((day) => {
              const hours = formData.openingHours[day] || { open: false, from: "09:00", to: "18:00" };
              return (
                <div key={day} className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${hours.open ? "bg-white" : "bg-gray-50 opacity-60"}`}>
                  <div className="w-28 flex-shrink-0">
                    <span className={`text-sm font-medium ${hours.open ? "text-gray-900" : "text-gray-400"}`}>{day}</span>
                  </div>
                  <Switch
                    checked={hours.open}
                    onCheckedChange={(v) => updateOpeningHour(day, "open", v)}
                  />
                  {hours.open ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={hours.from}
                        onChange={(e) => updateOpeningHour(day, "from", e.target.value)}
                        className="w-32 h-9"
                      />
                      <span className="text-gray-400 text-sm">bis</span>
                      <Input
                        type="time"
                        value={hours.to}
                        onChange={(e) => updateOpeningHour(day, "to", e.target.value)}
                        className="w-32 h-9"
                      />
                      <Separator orientation="vertical" className="h-6 mx-2" />
                      <span className="text-xs text-gray-400">Pause:</span>
                      <Input
                        type="time"
                        value={hours.breakFrom || ""}
                        onChange={(e) => updateOpeningHour(day, "breakFrom", e.target.value)}
                        className="w-28 h-9"
                        placeholder="--:--"
                      />
                      <span className="text-gray-400 text-xs">-</span>
                      <Input
                        type="time"
                        value={hours.breakTo || ""}
                        onChange={(e) => updateOpeningHour(day, "breakTo", e.target.value)}
                        className="w-28 h-9"
                        placeholder="--:--"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Geschlossen</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Feiertage & Betriebsurlaub</CardTitle>
          <CardDescription>Spezielle Schließtage oder geänderte Öffnungszeiten</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Feiertage und Betriebsurlaub können über die Gültigkeitszeiträume definiert werden</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StepLocation({ formData, updateField }: { formData: AngebotData; updateField: (f: keyof AngebotData, v: any) => void }) {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Standort
        </CardTitle>
        <CardDescription>Wo findet das Angebot statt?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Adresse / Standort *</Label>
          <Input
            value={formData.location}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="Musterstraße 1"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">PLZ *</Label>
            <Input
              value={formData.postalCode}
              onChange={(e) => updateField("postalCode", e.target.value)}
              placeholder="50667"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Stadt *</Label>
            <Input
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="Köln"
              className="mt-1"
            />
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border">
          <div className="text-center text-gray-400">
            <Globe className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">Kartenvorschau</p>
            <p className="text-xs mt-1">{formData.location ? `${formData.location}, ${formData.postalCode} ${formData.city}` : "Adresse eingeben für Vorschau"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StepMedia({ formData, updateField }: { formData: AngebotData; updateField: (f: keyof AngebotData, v: any) => void }) {
  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-orange-600" />
            Hauptbild
          </CardTitle>
          <CardDescription>Das Hauptbild wird in der Suche und auf der Detailseite angezeigt</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Bild-URL</Label>
            <Input
              value={formData.imageUrl}
              onChange={(e) => updateField("imageUrl", e.target.value)}
              placeholder="https://beispiel.de/bild.jpg"
              className="mt-1"
            />
          </div>

          {formData.imageUrl ? (
            <div className="relative group">
              <img
                src={formData.imageUrl}
                alt="Vorschau"
                className="w-full h-56 object-cover rounded-lg border"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button variant="secondary" size="sm" onClick={() => updateField("imageUrl", "")}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Entfernen
                </Button>
              </div>
              <Badge className="absolute top-2 left-2 bg-purple-600">Hauptbild</Badge>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-12 text-center text-gray-400">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Bild-URL eingeben</p>
              <p className="text-sm mt-1">Empfohlene Größe: 1200 x 800 Pixel</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-red-600" />
            Video
          </CardTitle>
          <CardDescription>Optional: YouTube-Video einbinden</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-sm font-medium">YouTube-Link</Label>
            <Input
              value={formData.youtubeUrl || ""}
              onChange={(e) => updateField("youtubeUrl", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-1"
            />
          </div>
          {formData.youtubeUrl && (
            <div className="mt-4 rounded-lg overflow-hidden border">
              <iframe
                src={`https://www.youtube.com/embed/${formData.youtubeUrl.split("v=")[1]?.split("&")[0] || ""}`}
                className="w-full h-64"
                allowFullScreen
                title="Video-Vorschau"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            PDF-Dokument
          </CardTitle>
          <CardDescription>Optional: PDF-Datei (Flyer, Programm, Speisekarte)</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-sm font-medium">PDF-URL</Label>
            <Input
              value={formData.pdfUrl || ""}
              onChange={(e) => updateField("pdfUrl", e.target.value)}
              placeholder="https://beispiel.de/flyer.pdf"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StepPreview({ formData, categoryName }: { formData: AngebotData; categoryName: string }) {
  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-600" />
            Vorschau
          </CardTitle>
          <CardDescription>So sieht Ihr Angebot für Kunden aus</CardDescription>
        </CardHeader>
      </Card>

      <Card className="border shadow-sm overflow-hidden">
        {formData.imageUrl && (
          <div className="h-64 bg-gray-200">
            <img src={formData.imageUrl} alt={formData.title} className="w-full h-full object-cover" />
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {categoryName && <Badge variant="outline" className="mb-2">{categoryName}</Badge>}
              <h2 className="text-2xl font-bold text-gray-900">{formData.title || "Angebotstitel"}</h2>
              <p className="text-gray-600 mt-1">{formData.shortDescription || "Kurzbeschreibung..."}</p>

              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                {formData.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {formData.location}, {formData.postalCode} {formData.city}
                  </span>
                )}
                {formData.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formData.duration}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right ml-6">
              <div className="text-3xl font-bold text-purple-700">
                {formData.price > 0 ? `${formData.price.toFixed(2).replace(".", ",")}€` : "Kostenlos"}
              </div>
              <Button className="mt-3 bg-purple-600 hover:bg-purple-700">
                Jetzt buchen
              </Button>
            </div>
          </div>

          {formData.description && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-2">Beschreibung</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{formData.description}</p>
            </div>
          )}

          {formData.specialNotes && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-lg">
              <h3 className="font-semibold text-amber-900 mb-1">Hinweise</h3>
              <p className="text-amber-800 text-sm">{formData.specialNotes}</p>
            </div>
          )}

          {formData.ticketCategories.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3">Verfügbare Tickets</h3>
              <div className="space-y-3">
                {formData.ticketCategories.map((cat) => (
                  <div key={cat.id}>
                    <p className="text-sm font-medium text-gray-700 mb-2">{cat.name}</p>
                    {cat.tickets.filter((t) => t.visible).map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg mb-1">
                        <span className="text-sm">{ticket.name}</span>
                        <div className="flex items-center gap-3">
                          {ticket.originalPrice !== ticket.onlinePrice && ticket.originalPrice !== "0,00" && (
                            <span className="text-sm text-gray-400 line-through">{ticket.originalPrice}€</span>
                          )}
                          <span className="font-semibold text-purple-700">{ticket.onlinePrice}€</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.entries(formData.openingHours).some(([_, h]) => h.open) && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3">Öffnungszeiten</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(formData.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between py-1">
                    <span className="text-gray-600">{day}</span>
                    <span className={hours.open ? "font-medium" : "text-gray-400"}>
                      {hours.open ? `${hours.from} - ${hours.to}` : "Geschlossen"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-green-100 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-900">Bereit zur Veröffentlichung</p>
              <p className="text-xs text-green-700 mt-1">
                Klicken Sie auf "Angebot veröffentlichen" um das Angebot für Kunden sichtbar zu machen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}