import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Ticket, 
  MapPin, 
  Euro, 
  Clock, 
  Users, 
  Image as ImageIcon,
  Save,
  X,
  Loader2,
  Tag
} from "lucide-react";
import { apiRequest, queryClient } from "@/partner/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Experience {
  id?: number;
  title: string;
  description: string;
  shortDescription: string;
  location: string;
  city: string;
  postalCode: string;
  price: number;
  categoryId: number;
  imageUrl?: string;
  duration?: string;
  maxParticipants?: string;
  specialNotes?: string;
  instantBooking?: boolean;
  active?: boolean;
}

interface ExperienceFormProps {
  experience?: Experience | null;
  isOpen: boolean;
  onClose: () => void;
}

const defaultExperience: Experience = {
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
};

export default function ExperienceForm({ experience, isOpen, onClose }: ExperienceFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Experience>(defaultExperience);
  const [priceEuro, setPriceEuro] = useState("0");
  const isEditing = !!experience?.id;

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: partnerProfile } = useQuery<any>({
    queryKey: ['/api/partner/profile'],
  });

  useEffect(() => {
    if (experience) {
      setFormData({
        ...defaultExperience,
        ...experience,
      });
      setPriceEuro(experience.price.toFixed(2).replace('.', ','));
    } else if (partnerProfile) {
      setFormData({
        ...defaultExperience,
        location: partnerProfile.location || partnerProfile.city || "",
        city: partnerProfile.city || "",
        postalCode: partnerProfile.postalCode || "",
      });
      setPriceEuro("0,00");
    } else {
      setPriceEuro("0,00");
    }
  }, [experience, partnerProfile, isOpen]);

  const handlePriceChange = (value: string) => {
    const cleaned = value.replace(/[^0-9,\.]/g, '');
    setPriceEuro(cleaned);
    const numericStr = cleaned.replace(',', '.');
    const euros = parseFloat(numericStr);
    if (!isNaN(euros)) {
      setFormData(prev => ({ ...prev, price: Math.round(euros * 100) }));
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/partner/experiences', {
        ...formData,
        price: Number(formData.price),
        categoryId: Number(formData.categoryId),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Fehler beim Erstellen");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partner/experiences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/stats'] });
      toast({
        title: "Erlebnis erstellt",
        description: "Ihr neues Erlebnis wurde erfolgreich angelegt.",
      });
      onClose();
      setFormData(defaultExperience);
      setPriceEuro("0,00");
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message || "Das Erlebnis konnte nicht erstellt werden.",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PATCH', `/api/partner/experiences/${experience?.id}`, {
        ...formData,
        price: Number(formData.price),
        categoryId: Number(formData.categoryId),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Fehler beim Aktualisieren");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partner/experiences'] });
      toast({
        title: "Erlebnis aktualisiert",
        description: "Die Änderungen wurden gespeichert.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message || "Das Erlebnis konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.shortDescription || 
        !formData.location || !formData.city || !formData.postalCode || 
        !formData.categoryId) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus (Titel, Kurzbeschreibung, Kategorie, Standort, PLZ, Stadt).",
        variant: "destructive",
      });
      return;
    }

    if (isEditing) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const updateField = (field: keyof Experience, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-purple-600" />
            {isEditing ? "Erlebnis bearbeiten" : "Neues Erlebnis / Ticket erstellen"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Aktualisieren Sie die Details Ihres Erlebnisses" 
              : "Erstellen Sie ein neues Ticket oder Erlebnis für Ihre Kunden"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-0 shadow-none bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4 text-purple-600" />
                Grundinformationen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Ticket-Name / Titel *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="z.B. Tageskarte Erwachsene, Familienkarte, Bowling 1 Std..."
                  required
                />
              </div>

              <div>
                <Label>Kategorie *</Label>
                <Select 
                  value={formData.categoryId?.toString()} 
                  onValueChange={(value) => updateField('categoryId', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Kurzbeschreibung *</Label>
                <Input
                  value={formData.shortDescription}
                  onChange={(e) => updateField('shortDescription', e.target.value)}
                  placeholder="Kurze Info zum Ticket (z.B. 'Erw. ab 18 Jahre', 'inkl. Leihschuhe')"
                  maxLength={500}
                  required
                />
              </div>

              <div>
                <Label>Ausführliche Beschreibung</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Detaillierte Beschreibung (optional, wird auf der Detailseite angezeigt)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Euro className="h-4 w-4 text-green-600" />
                Preis & Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preis (€) *</Label>
                  <div className="relative">
                    <Input
                      value={priceEuro}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder="0,00"
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    0,00€ = Kostenlos / Preis auf Anfrage
                  </p>
                </div>
                <div>
                  <Label>Dauer</Label>
                  <Input
                    value={formData.duration || ""}
                    onChange={(e) => updateField('duration', e.target.value)}
                    placeholder="z.B. 1 Stunde, Ganztags, 90 Min."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max. Teilnehmer</Label>
                  <Input
                    value={formData.maxParticipants || ""}
                    onChange={(e) => updateField('maxParticipants', e.target.value)}
                    placeholder="z.B. 1, 6, unbegrenzt"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={formData.instantBooking !== false}
                    onCheckedChange={(checked) => updateField('instantBooking', checked)}
                  />
                  <div>
                    <Label className="text-sm">Sofortbuchung</Label>
                    <p className="text-xs text-gray-500">Automatisch bestätigt</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Standort
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Standort / Adresse *</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="z.B. Musterstraße 1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>PLZ *</Label>
                  <Input
                    value={formData.postalCode}
                    onChange={(e) => updateField('postalCode', e.target.value)}
                    placeholder="50667"
                    required
                  />
                </div>
                <div>
                  <Label>Stadt *</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Köln"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-orange-600" />
                Bild & Hinweise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Bild-URL</Label>
                <Input
                  value={formData.imageUrl || ""}
                  onChange={(e) => updateField('imageUrl', e.target.value)}
                  placeholder="https://beispiel.de/bild.jpg"
                />
              </div>

              {formData.imageUrl && (
                <div className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={formData.imageUrl} 
                    alt="Vorschau" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div>
                <Label>Besondere Hinweise</Label>
                <Textarea
                  value={formData.specialNotes || ""}
                  onChange={(e) => updateField('specialNotes', e.target.value)}
                  placeholder="z.B. Altersbeschränkungen, Leihschuhe zzgl., was mitzubringen ist..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {isEditing && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>Erlebnis aktiv</Label>
                <p className="text-xs text-gray-500">Deaktivierte Erlebnisse sind für Kunden nicht sichtbar</p>
              </div>
              <Switch
                checked={formData.active !== false}
                onCheckedChange={(checked) => updateField('active', checked)}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              <X className="h-4 w-4 mr-2" />
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Änderungen speichern" : "Erlebnis erstellen"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
