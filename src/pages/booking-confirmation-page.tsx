import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Clock, Users, Euro, MapPin, Mail, Phone, Download, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

// Fields this page reads from GET /api/bookings/:id.
type ConfirmedBooking = {
  id: number;
  bookingReference?: string | null;
  offerTitle?: string | null;
  experience?: { title?: string; description?: string; location?: string } | null;
  date: string;
  participants: number;
  totalPrice: number;
  status: string;
  paymentStatus?: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  message?: string | null;
};

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const { data: booking, isLoading } = useQuery<ConfirmedBooking>({
    queryKey: [`/api/bookings/${id}`],
  });

  // Generate QR code for the booking using the booking reference
  useEffect(() => {
    if (booking) {
      // Use the bookingReference for the QR code so partners can scan it
      const qrData = booking.bookingReference || `FE-${booking.id}`;
      
      // Generate QR code using a simple service
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
      setQrCodeUrl(qrUrl);
    }
  }, [booking]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Buchung nicht gefunden</h1>
        <p className="text-gray-600">Die angeforderte Buchung existiert nicht oder wurde entfernt.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Buchung bestätigt!</h1>
        <p className="text-gray-600">Ihre Buchung wurde erfolgreich abgeschlossen.</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Buchungsdetails
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{booking.offerTitle || booking.experience?.title}</h3>
            <p className="text-gray-600">{booking.experience?.description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Datum</div>
                <div className="text-gray-600">
                  {new Date(booking.date).toLocaleDateString('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Uhrzeit</div>
                <div className="text-gray-600">
                  {new Date(booking.date).toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Personen</div>
                <div className="text-gray-600">{booking.participants}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Euro className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Gesamtpreis</div>
                <div className="text-gray-600 font-semibold">
                  {booking.totalPrice === 0 ? 'Kostenlos' : `${booking.totalPrice.toFixed(2)}€`}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                className={booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
              >
                {booking.status === 'confirmed' ? 'Bestätigt' : booking.status}
              </Badge>
              <Badge 
                variant={booking.paymentStatus === 'completed' ? 'default' : 'secondary'}
                className={booking.paymentStatus === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}
              >
                {booking.paymentStatus === 'completed' ? 'Bezahlt' : 'Zahlung ausstehend'}
              </Badge>
            </div>
          </div>

          {booking.experience?.location && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                <div>
                  <div className="font-medium">Standort</div>
                  <div className="text-gray-600">{booking.experience.location}</div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Kontaktdaten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="font-medium">Name</div>
            <div className="text-gray-600">{booking.contactName}</div>
          </div>
          <div>
            <div className="font-medium">E-Mail</div>
            <div className="text-gray-600">{booking.contactEmail}</div>
          </div>
          {booking.contactPhone && (
            <div>
              <div className="font-medium">Telefon</div>
              <div className="text-gray-600">{booking.contactPhone}</div>
            </div>
          )}
          {booking.message && (
            <div>
              <div className="font-medium">Anmerkungen</div>
              <div className="text-gray-600">{booking.message}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code E-Ticket */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Ihr E-Ticket
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 mb-4">
            {qrCodeUrl ? (
              <div className="space-y-4">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code für Buchung" 
                  className="mx-auto w-48 h-48"
                />
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Zeigen Sie diesen QR-Code beim Besuch vor</p>
                  <p>Buchungs-ID: {booking?.id}</p>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <QrCode className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">QR-Code wird generiert...</p>
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              if (qrCodeUrl) {
                const link = document.createElement('a');
                link.href = qrCodeUrl;
                link.download = `ticket-${booking?.id}.png`;
                link.click();
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            E-Ticket herunterladen
          </Button>
        </CardContent>
      </Card>

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Was passiert als nächstes?</h3>
        <ul className="space-y-1 text-blue-800 text-sm">
          <li>• Sie erhalten eine E-Mail-Bestätigung an {booking.contactEmail}</li>
          <li>• Der Anbieter wird über Ihre Buchung informiert</li>
          {booking.paymentStatus === 'pending' && (
            <li>• Die Zahlung erfolgt nach gewählter Zahlungsmethode</li>
          )}
          <li>• Bei Fragen können Sie den Anbieter direkt kontaktieren</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => window.location.href = '/'}
        >
          Zur Startseite
        </Button>
        <Button 
          className="flex-1"
          onClick={() => window.location.href = '/'}
        >
          Weitere Erlebnisse entdecken
        </Button>
      </div>
    </div>
  );
}