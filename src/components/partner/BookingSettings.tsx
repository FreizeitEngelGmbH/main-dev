import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Clock, Users, Percent, Save } from "lucide-react";
import { apiRequest, queryClient } from "@/partner-demo/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BookingSettingsType {
  id?: number;
  partnerId?: number;
  minAdvanceBookingHours: number;
  maxAdvanceBookingDays: number;
  cancellationHours: number;
  partialCancellationPercent: number;
  defaultOpeningTime: string;
  defaultClosingTime: string;
  weekendSurchargePercent: number;
  holidaySurchargePercent: number;
  groupDiscountThreshold: number;
  groupDiscountPercent: number;
  largeGroupDiscountThreshold: number;
  largeGroupDiscountPercent: number;
}

const defaultSettings: BookingSettingsType = {
  minAdvanceBookingHours: 2,
  maxAdvanceBookingDays: 90,
  cancellationHours: 24,
  partialCancellationPercent: 50,
  defaultOpeningTime: "09:00",
  defaultClosingTime: "22:00",
  weekendSurchargePercent: 15,
  holidaySurchargePercent: 15,
  groupDiscountThreshold: 6,
  groupDiscountPercent: 5,
  largeGroupDiscountThreshold: 10,
  largeGroupDiscountPercent: 10,
};

export default function BookingSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<BookingSettingsType>(defaultSettings);

  const { data: savedSettings, isLoading } = useQuery<BookingSettingsType>({
    queryKey: ['/api/partner/booking-settings'],
  });

  useEffect(() => {
    if (savedSettings && Object.keys(savedSettings).length > 0) {
      setSettings({ ...defaultSettings, ...savedSettings });
    }
  }, [savedSettings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/partner/booking-settings', settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partner/booking-settings'] });
      toast({
        title: "Einstellungen gespeichert",
        description: "Ihre Buchungseinstellungen wurden erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  });

  const updateSetting = (key: keyof BookingSettingsType, value: number | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <div className="text-center py-8">Lade Einstellungen...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Buchungseinstellungen</h2>
          <p className="text-gray-600">Konfigurieren Sie Öffnungszeiten, Preise und Rabatte</p>
        </div>
        <Button 
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {saveMutation.isPending ? "Speichern..." : "Speichern"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-purple-600" />
              Öffnungszeiten
            </CardTitle>
            <CardDescription>Standard-Öffnungszeiten für Buchungen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Öffnung</Label>
                <Input
                  type="time"
                  value={settings.defaultOpeningTime}
                  onChange={(e) => updateSetting('defaultOpeningTime', e.target.value)}
                />
              </div>
              <div>
                <Label>Schließung</Label>
                <Input
                  type="time"
                  value={settings.defaultClosingTime}
                  onChange={(e) => updateSetting('defaultClosingTime', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-purple-600" />
              Buchungsregeln
            </CardTitle>
            <CardDescription>Vorlaufzeiten und Stornierungsbedingungen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Mindest-Vorlaufzeit (Stunden)</Label>
              <Input
                type="number"
                min={0}
                value={settings.minAdvanceBookingHours}
                onChange={(e) => updateSetting('minAdvanceBookingHours', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Maximale Vorausbuchung (Tage)</Label>
              <Input
                type="number"
                min={1}
                value={settings.maxAdvanceBookingDays}
                onChange={(e) => updateSetting('maxAdvanceBookingDays', parseInt(e.target.value) || 90)}
              />
            </div>
            <div>
              <Label>Kostenlose Stornierung bis (Stunden vorher)</Label>
              <Input
                type="number"
                min={0}
                value={settings.cancellationHours}
                onChange={(e) => updateSetting('cancellationHours', parseInt(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Percent className="h-5 w-5 text-orange-600" />
              Zuschläge
            </CardTitle>
            <CardDescription>Wochenend- und Feiertagszuschläge</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Wochenend-Zuschlag (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={settings.weekendSurchargePercent}
                onChange={(e) => updateSetting('weekendSurchargePercent', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Feiertags-Zuschlag (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={settings.holidaySurchargePercent}
                onChange={(e) => updateSetting('holidaySurchargePercent', parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-green-600" />
              Gruppenrabatte
            </CardTitle>
            <CardDescription>Rabatte für größere Gruppen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ab Personen (Gruppe)</Label>
                <Input
                  type="number"
                  min={2}
                  value={settings.groupDiscountThreshold}
                  onChange={(e) => updateSetting('groupDiscountThreshold', parseInt(e.target.value) || 6)}
                />
              </div>
              <div>
                <Label>Rabatt (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={settings.groupDiscountPercent}
                  onChange={(e) => updateSetting('groupDiscountPercent', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ab Personen (Großgruppe)</Label>
                <Input
                  type="number"
                  min={2}
                  value={settings.largeGroupDiscountThreshold}
                  onChange={(e) => updateSetting('largeGroupDiscountThreshold', parseInt(e.target.value) || 10)}
                />
              </div>
              <div>
                <Label>Rabatt (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={settings.largeGroupDiscountPercent}
                  onChange={(e) => updateSetting('largeGroupDiscountPercent', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
