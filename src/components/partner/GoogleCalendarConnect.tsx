import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/partner-demo/queryClient";
import { Calendar, Link2, Unlink, RefreshCw, CheckCircle2, XCircle, Loader2, Bell, BellOff, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

interface Experience {
  id: number;
  title: string;
}

export default function GoogleCalendarConnect() {
  const { toast } = useToast();
  const [selectedExperience, setSelectedExperience] = useState<string>("all");

  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useQuery<{ connected: boolean }>({
    queryKey: ["/api/google/status"],
    refetchInterval: 5000,
  });

  const { data: experiences } = useQuery<Experience[]>({
    queryKey: ["/api/partner/experiences"],
  });

  const { data: calendarEvents, isLoading: eventsLoading, refetch: refetchEvents } = useQuery<{ success: boolean; events: CalendarEvent[] }>({
    queryKey: ["/api/google/events"],
    enabled: status?.connected === true,
    refetchInterval: 15000,
  });

  const { data: webhookStatus, refetch: refetchWebhook } = useQuery<{ active: boolean; channelId?: string; expiration?: string }>({
    queryKey: ["/api/google/webhook/status"],
    enabled: status?.connected === true,
    refetchInterval: 30000,
  });

  const webhookRegisterMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/google/webhook/register");
    },
    onSuccess: (data: any) => {
      toast({ title: "Webhook aktiviert", description: data.message || "Push-Benachrichtigungen sind aktiv" });
      refetchWebhook();
    },
    onError: () => {
      toast({ title: "Hinweis", description: "Webhooks benötigen eine öffentliche HTTPS-URL. Nach dem Deployment wird dies automatisch funktionieren.", variant: "destructive" });
    },
  });

  const webhookStopMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/google/webhook/stop");
    },
    onSuccess: () => {
      toast({ title: "Webhook deaktiviert", description: "Push-Benachrichtigungen wurden gestoppt" });
      refetchWebhook();
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (experienceId: string) => {
      return apiRequest("POST", "/api/google/sync-slots", { experienceId });
    },
    onSuccess: (data: any) => {
      toast({ 
        title: "Synchronisiert", 
        description: data.message || `Slots synchronisiert` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/slots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
    },
    onError: () => {
      toast({ title: "Fehler", description: "Synchronisierung fehlgeschlagen", variant: "destructive" });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/google/disconnect");
    },
    onSuccess: () => {
      toast({ title: "Getrennt", description: "Google Calendar wurde getrennt" });
      refetchStatus();
    },
  });

  const handleConnect = async () => {
    // DEMO: real file called fetch("/api/google/auth") directly here,
    // bypassing the shared mocked queryClient, and would have opened a real
    // Google OAuth popup. Replaced with a simulated connect so this can
    // never issue a real network request or open a real external URL.
    try {
      toast({ title: "Demo-Modus", description: "Google Calendar-Verbindung wird in der Demo simuliert." });
      setTimeout(() => refetchStatus(), 800);
    } catch {
      toast({ title: "Fehler", description: "Verbindung konnte nicht hergestellt werden", variant: "destructive" });
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Google Calendar</CardTitle>
              <CardDescription>Synchronisiere deine Verfügbarkeit mit dem Google Kalender</CardDescription>
            </div>
          </div>
          <Badge variant={status?.connected ? "default" : "secondary"} className={status?.connected ? "bg-green-500" : ""}>
            {statusLoading ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : status?.connected ? (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            ) : (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            {status?.connected ? "Verbunden" : "Nicht verbunden"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status?.connected ? (
          <div className="space-y-4">
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Verbinde deinen Google Kalender, um deine bestehenden Termine automatisch mit deinen Zeitslots abzugleichen.
                Konflikte werden automatisch als "belegt" markiert. Externe Buchungen werden in Echtzeit erkannt.
              </AlertDescription>
            </Alert>
            <Button onClick={handleConnect} className="w-full">
              <Link2 className="h-4 w-4 mr-2" />
              Mit Google Calendar verbinden
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Dein Google Kalender ist verbunden. Externe Buchungen aus anderen Systemen werden automatisch in Echtzeit erkannt und blockieren die entsprechenden Zeitslots.
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-2">
              <select
                className="flex-1 p-2 border rounded-md text-sm"
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
              >
                <option value="all">Alle Erlebnisse</option>
                {experiences?.map((exp) => (
                  <option key={exp.id} value={exp.id.toString()}>
                    {exp.title}
                  </option>
                ))}
              </select>
              <Button
                onClick={() => syncMutation.mutate(selectedExperience)}
                disabled={syncMutation.isPending}
                size="sm"
              >
                {syncMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Jetzt synchronisieren
              </Button>
            </div>

            <p className="text-xs text-gray-500">
              Die Verfügbarkeit wird bei jedem Seitenaufruf live aus deinem Google Kalender gelesen. 
              Mit "Jetzt synchronisieren" kannst du zusätzlich Slot-Blockierungen manuell aktualisieren.
            </p>

            <div className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Echtzeit-Webhooks</span>
                  <Badge variant={webhookStatus?.active ? "default" : "secondary"} className={`text-xs ${webhookStatus?.active ? "bg-yellow-500" : ""}`}>
                    {webhookStatus?.active ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </div>
                {webhookStatus?.active ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => webhookStopMutation.mutate()}
                    disabled={webhookStopMutation.isPending}
                    className="text-gray-500 hover:text-red-600"
                  >
                    {webhookStopMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <BellOff className="h-3 w-3" />}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => webhookRegisterMutation.mutate()}
                    disabled={webhookRegisterMutation.isPending}
                  >
                    {webhookRegisterMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Bell className="h-3 w-3 mr-1" />
                    )}
                    Aktivieren
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {webhookStatus?.active
                  ? `Google benachrichtigt uns sofort bei Kalenderänderungen. Gültig bis ${new Date(webhookStatus.expiration!).toLocaleDateString("de-DE")}.`
                  : "Aktiviere Webhooks, damit Kalenderänderungen sofort erkannt werden - ohne Wartezeit. Benötigt eine öffentliche URL (nach Deployment)."}
              </p>
            </div>

            {eventsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : calendarEvents?.events && calendarEvents.events.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Nächste Kalender-Termine:</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {calendarEvents.events.slice(0, 8).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm"
                    >
                      <span className="font-medium truncate flex-1">{event.title}</span>
                      <span className="text-gray-500 text-xs whitespace-nowrap ml-2">
                        {formatDate(event.startTime)} {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Keine anstehenden Termine im Kalender
              </p>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetchEvents()} className="flex-1">
                <RefreshCw className="h-3 w-3 mr-2" />
                Kalender aktualisieren
              </Button>
              <Button variant="outline" size="sm" onClick={() => disconnectMutation.mutate()} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Unlink className="h-3 w-3 mr-2" />
                Trennen
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}