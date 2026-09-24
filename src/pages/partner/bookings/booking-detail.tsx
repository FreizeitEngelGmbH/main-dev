import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Calendar, User, Users, Map, MessageSquare, Mail, Phone, CheckCircle, XCircle, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Booking, Experience } from "@shared/schema";

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string>("");

  // Fetch booking and related experience
  const { data: booking, isLoading } = useQuery<Booking>({
    queryKey: [`/api/partners/bookings/${id}`],
  });
  // TanStack Query v5 removed useQuery's onSuccess option; sync the status once the booking loads.
  useEffect(() => {
    if (booking) setStatus(booking.status);
  }, [booking]);

  const { data: experience } = useQuery<Experience>({
    queryKey: [`/api/experiences/${booking?.experienceId}`],
    enabled: !!booking,
  });

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/partners/bookings/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Status aktualisiert",
        description: "Der Buchungsstatus wurde erfolgreich aktualisiert.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/partners/bookings/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/partners/bookings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: `Fehler beim Aktualisieren des Status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Send notes to customer mutation
  const sendNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const res = await apiRequest("POST", `/api/partners/bookings/${id}/notes`, { notes });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Nachricht gesendet",
        description: "Deine Nachricht wurde erfolgreich an den Kunden gesendet.",
      });
      setNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: `Fehler beim Senden der Nachricht: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    if (booking) {
      updateStatusMutation.mutate({ id: booking.id, status: newStatus });
    }
  };

  const handleSendNotes = () => {
    if (booking && notes.trim()) {
      sendNotesMutation.mutate({ id: booking.id, notes });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3">Lade Buchungsdetails...</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Buchung nicht gefunden</h1>
          <p className="text-gray-500 mb-6">Die angeforderte Buchung konnte nicht gefunden werden.</p>
          <Button onClick={() => navigate("/partner/dashboard")}>
            Zurück zum Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/partner/dashboard")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Buchungsdetails</h1>
            <p className="text-gray-500">
              Buchungs-ID: #{booking.id} | Status:&nbsp;
              {booking.status === "confirmed" && (
                <Badge className="bg-green-50 text-green-700 border-green-200">
                  Bestätigt
                </Badge>
              )}
              {booking.status === "pending" && (
                <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Ausstehend
                </Badge>
              )}
              {booking.status === "canceled" && (
                <Badge className="bg-red-50 text-red-700 border-red-200">
                  Storniert
                </Badge>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main booking details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buchungsdetails</CardTitle>
                <CardDescription>
                  Übersicht der Buchungsdetails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500 block">Datum</Label>
                        <span className="block font-medium">{formatDate(booking.date)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Users className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500 block">Teilnehmer</Label>
                        <span className="block font-medium">{booking.participants} Personen</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500 block">Gesamtpreis</Label>
                        <span className="block font-medium">{booking.totalPrice.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Map className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500 block">Erlebnis</Label>
                        <span className="block font-medium">{experience?.title}</span>
                        <span className="block text-sm text-gray-500">{experience?.location}, {experience?.city}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MessageSquare className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500 block">Nachricht des Kunden</Label>
                        <p className="text-gray-700">
                          {booking.message || "Keine Nachricht hinterlassen"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Kundendaten</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500 block">Name</Label>
                        <span className="block font-medium">{booking.contactName}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500 block">E-Mail</Label>
                        <a 
                          href={`mailto:${booking.contactEmail}`} 
                          className="block font-medium text-primary hover:underline"
                        >
                          {booking.contactEmail}
                        </a>
                      </div>
                    </div>
                    
                    {/* Phone number would be added here if available in the schema */}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nachricht an Kunden</CardTitle>
                <CardDescription>
                  Sende eine Nachricht an den Kunden bezüglich dieser Buchung
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Schreibe eine Nachricht an den Kunden..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={handleSendNotes} 
                  disabled={!notes.trim() || sendNotesMutation.isPending}
                >
                  Nachricht senden
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Booking actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Buchungsaktionen</CardTitle>
                <CardDescription>
                  Verwalte den Status dieser Buchung
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="status">Status ändern</Label>
                  <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Status auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Ausstehend</SelectItem>
                      <SelectItem value="confirmed">Bestätigt</SelectItem>
                      <SelectItem value="canceled">Storniert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => handleStatusChange("confirmed")}
                    disabled={status === "confirmed"}
                  >
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Buchung bestätigen
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => handleStatusChange("canceled")}
                    disabled={status === "canceled"}
                  >
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                    Buchung stornieren
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Weitere Aktionen</h3>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => window.print()}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Buchungsdetails drucken
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}