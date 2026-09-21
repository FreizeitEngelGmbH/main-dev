import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Image as ImageIcon,
  Save,
  Palette,
  Clock,
  ExternalLink
} from "lucide-react";
import { apiRequest, queryClient } from "@/partner-demo/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface PartnerProfile {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  location: string;
  country: string;
  category: string;
  description: string;
  website: string;
  logoUrl: string;
  logoBgColor: string;
  openingHours: string;
  approved: boolean;
}

const colorOptions = [
  { value: "black", label: "Schwarz", hex: "#000000" },
  { value: "white", label: "Weiß", hex: "#ffffff" },
  { value: "blue", label: "Blau", hex: "#3b82f6" },
  { value: "red", label: "Rot", hex: "#ef4444" },
  { value: "green", label: "Grün", hex: "#22c55e" },
  { value: "purple", label: "Lila", hex: "#8b5cf6" },
  { value: "orange", label: "Orange", hex: "#f97316" },
  { value: "gray", label: "Grau", hex: "#6b7280" },
];

export default function PartnerProfileSettings() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Partial<PartnerProfile>>({});

  const { data: savedProfile, isLoading } = useQuery<PartnerProfile>({
    queryKey: ['/api/partner/profile'],
  });

  useEffect(() => {
    if (savedProfile) {
      setProfile(savedProfile);
    }
  }, [savedProfile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PATCH', '/api/partner/profile', {
        companyName: profile.companyName,
        contactPerson: profile.contactPerson,
        phone: profile.phone,
        address: profile.address,
        postalCode: profile.postalCode,
        city: profile.city,
        location: profile.location,
        description: profile.description,
        website: profile.website,
        logoUrl: profile.logoUrl,
        logoBgColor: profile.logoBgColor,
        openingHours: profile.openingHours,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partner/profile'] });
      toast({
        title: "Profil gespeichert",
        description: "Ihre Änderungen wurden erfolgreich übernommen.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Profil konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  });

  const updateField = (field: keyof PartnerProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-40 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Unternehmensprofil</h2>
          <p className="text-gray-600">Verwalten Sie Ihre Firmeninformationen und Ihren Auftritt</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/partners/${profile.id}`}>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Shop-Vorschau
            </Button>
          </Link>
          <Button 
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Speichern..." : "Speichern"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Firmeninformationen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-purple-600" />
              Firmeninformationen
            </CardTitle>
            <CardDescription>Grundlegende Unternehmensdaten</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Firmenname</Label>
              <Input
                value={profile.companyName || ""}
                onChange={(e) => updateField('companyName', e.target.value)}
                placeholder="Muster GmbH"
              />
            </div>
            <div>
              <Label>Kategorie</Label>
              <Input
                value={profile.category || ""}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Kategorie kann nur vom Admin geändert werden</p>
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Textarea
                value={profile.description || ""}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Beschreiben Sie Ihr Unternehmen..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Kontaktdaten */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-purple-600" />
              Ansprechpartner
            </CardTitle>
            <CardDescription>Kontaktinformationen für Kunden</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Ansprechpartner</Label>
              <Input
                value={profile.contactPerson || ""}
                onChange={(e) => updateField('contactPerson', e.target.value)}
                placeholder="Max Mustermann"
              />
            </div>
            <div>
              <Label>E-Mail</Label>
              <Input
                value={profile.email || ""}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">E-Mail kann nur vom Admin geändert werden</p>
            </div>
            <div>
              <Label>Telefon</Label>
              <Input
                value={profile.phone || ""}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+49 123 456789"
              />
            </div>
            <div>
              <Label>Website</Label>
              <div className="flex gap-2">
                <Input
                  value={profile.website || ""}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://www.beispiel.de"
                />
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon">
                      <Globe className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adresse */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-purple-600" />
              Standort
            </CardTitle>
            <CardDescription>Ihre Geschäftsadresse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Straße & Hausnummer</Label>
              <Input
                value={profile.address || ""}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Musterstraße 1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>PLZ</Label>
                <Input
                  value={profile.postalCode || ""}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  placeholder="48149"
                />
              </div>
              <div>
                <Label>Stadt</Label>
                <Input
                  value={profile.city || ""}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Münster"
                />
              </div>
            </div>
            <div>
              <Label>Standort (für Anzeige)</Label>
              <Input
                value={profile.location || ""}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Münster Innenstadt"
              />
            </div>
          </CardContent>
        </Card>

        {/* Öffnungszeiten */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-purple-600" />
              Öffnungszeiten
            </CardTitle>
            <CardDescription>Wann sind Sie erreichbar?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={profile.openingHours || ""}
              onChange={(e) => updateField('openingHours', e.target.value)}
              placeholder={`Mo-Fr: 09:00 - 18:00\nSa: 10:00 - 16:00\nSo: geschlossen`}
              rows={5}
            />
            <p className="text-xs text-gray-500 mt-2">
              Tipp: Geben Sie Ihre Öffnungszeiten übersichtlich formatiert an
            </p>
          </CardContent>
        </Card>

        {/* Logo & Branding */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="h-5 w-5 text-purple-600" />
              Logo & Branding
            </CardTitle>
            <CardDescription>Gestalten Sie Ihren visuellen Auftritt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Logo-URL</Label>
                  <Input
                    value={profile.logoUrl || ""}
                    onChange={(e) => updateField('logoUrl', e.target.value)}
                    placeholder="https://beispiel.de/logo.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Geben Sie die URL zu Ihrem Logo ein (empfohlen: PNG oder SVG, quadratisch)
                  </p>
                </div>
                <div>
                  <Label>Logo-Hintergrundfarbe</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => updateField('logoBgColor', color.value)}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          profile.logoBgColor === color.value 
                            ? 'border-purple-600 ring-2 ring-purple-200' 
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Logo-Vorschau */}
              <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-500 mb-4">Vorschau</p>
                <div 
                  className="w-32 h-32 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: colorOptions.find(c => c.value === profile.logoBgColor)?.hex || '#000000' }}
                >
                  {profile.logoUrl ? (
                    <img 
                      src={profile.logoUrl} 
                      alt="Logo" 
                      className="w-24 h-24 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Building2 className="w-12 h-12 text-white opacity-50" />
                  )}
                </div>
                <p className="text-sm font-medium mt-4">{profile.companyName || "Ihr Firmenname"}</p>
                <p className="text-xs text-gray-500">{profile.city || "Stadt"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}