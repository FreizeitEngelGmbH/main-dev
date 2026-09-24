import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, MapPin, Clock, Users, Mail, Phone, Calendar } from "lucide-react";
import QRCode from "qrcode";

export default function ConfirmationPage() {
  const [, setLocation] = useLocation();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  
  // Get activity type from URL params or local storage
  const getActivityType = () => {
    const currentPath = window.location.pathname;
    const experienceId = localStorage.getItem('currentExperienceId');
    const experienceTitle = localStorage.getItem('currentExperienceTitle') || '';
    
    // Determine activity type from title
    const title = experienceTitle.toLowerCase();
    if (title.includes('kino') || title.includes('cinema') || title.includes('bermuda')) {
      return 'cinema';
    } else if (title.includes('bowling')) {
      return 'bowling';
    } else if (title.includes('schwimm') || title.includes('wellness') || title.includes('spa')) {
      return 'swimming';
    } else if (title.includes('zoo') || title.includes('tier')) {
      return 'zoo';
    } else if (title.includes('minigolf')) {
      return 'minigolf';
    }
    return 'generic';
  };

  const activityType = getActivityType();
  
  // Generate dynamic booking data based on activity type
  const getBookingData = () => {
    const baseData = {
      id: "FE-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: "2025-06-26",
      time: "15:00",
      participants: 2,
      customerName: "Max Mustermann",
      customerEmail: "max@beispiel.de",
      customerPhone: "0123 456789",
      bookingDate: new Date().toLocaleDateString('de-DE'),
      status: "bestätigt"
    };

    switch (activityType) {
      case 'cinema':
        return {
          ...baseData,
          experienceName: "Kinoerlebnis bei Bermuda Filmpalast",
          time: "20:30",
          totalPrice: 31.00,
          specialNotes: "Bitte 15 Minuten vor Vorstellungsbeginn erscheinen",
          venue: {
            name: "Bermuda Filmpalast",
            address: "Bermudadreieck 1, 44787 Bochum",
            phone: "0234 123456"
          }
        };
      
      case 'bowling':
        return {
          ...baseData,
          experienceName: "Bowling-Erlebnis bei Bowlorado",
          time: "18:00",
          totalPrice: 28.00,
          specialNotes: "Bowlingschuhe sind im Preis enthalten",
          venue: {
            name: "Bowlorado Bowling Center",
            address: "Universitätsstraße 142, 44799 Bochum",
            phone: "0234 987654"
          }
        };
      
      case 'swimming':
        return {
          ...baseData,
          experienceName: "Wellness & Spa Erlebnis",
          time: "14:00",
          totalPrice: 24.00,
          specialNotes: "Bitte Badebekleidung und Handtuch mitbringen",
          venue: {
            name: "WasserWelten Bochum",
            address: "An der Jahrhunderthalle 1, 44793 Bochum",
            phone: "0234 555123"
          }
        };
      
      case 'zoo':
        return {
          ...baseData,
          experienceName: "Zoo-Erlebnis für die ganze Familie",
          time: "10:00",
          totalPrice: 32.00,
          specialNotes: "Gültig für den ganzen Tag, letzter Einlass 16:00 Uhr",
          venue: {
            name: "Tierpark Bochum",
            address: "Klinikstraße 49, 44791 Bochum",
            phone: "0234 950280"
          }
        };
      
      case 'minigolf':
        return {
          ...baseData,
          experienceName: "Minigolf-Abenteuer",
          time: "16:00",
          totalPrice: 18.00,
          specialNotes: "Schläger und Bälle werden gestellt",
          venue: {
            name: "Adventure Minigolf",
            address: "Freizeitpark Kemnade, 44797 Bochum",
            phone: "0234 777888"
          }
        };
      
      default:
        return {
          ...baseData,
          experienceName: localStorage.getItem('currentExperienceTitle') || "Erlebnis-Buchung",
          totalPrice: 25.00,
          specialNotes: "Weitere Details erhalten Sie vor Ort",
          venue: {
            name: "FreizeitEngel Partner",
            address: "Bochum, Deutschland",
            phone: "0234 123456"
          }
        };
    }
  };

  const bookingData = getBookingData();

  useEffect(() => {
    // Generate QR Code
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          bookingId: bookingData.id,
          experienceName: bookingData.experienceName,
          date: bookingData.date,
          time: bookingData.time,
          participants: bookingData.participants,
          customerName: bookingData.customerName
        });
        
        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        
        setQrCodeUrl(qrCodeDataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, []);

  const downloadTicket = () => {
    // Create a simple ticket as HTML and convert to downloadable content
    const ticketContent = `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 2px solid #3b82f6; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #3b82f6; margin: 0;">FreizeitEngel</h1>
          <h2 style="color: #1f2937; margin: 10px 0;">E-Ticket</h2>
        </div>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">${bookingData.experienceName}</h3>
          <p style="margin: 5px 0;"><strong>Buchungs-ID:</strong> ${bookingData.id}</p>
          <p style="margin: 5px 0;"><strong>Datum:</strong> ${new Date(bookingData.date).toLocaleDateString('de-DE')}</p>
          <p style="margin: 5px 0;"><strong>Uhrzeit:</strong> ${bookingData.time}</p>
          <p style="margin: 5px 0;"><strong>Teilnehmer:</strong> ${bookingData.participants} Person(en)</p>
          <p style="margin: 5px 0;"><strong>Gesamtpreis:</strong> ${bookingData.totalPrice.toFixed(2)}€</p>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 150px;" />
          <p style="font-size: 12px; color: #6b7280; margin: 10px 0;">QR-Code für Check-in</p>
        </div>
        
        <div style="border-top: 1px solid #d1d5db; padding-top: 15px;">
          <h4 style="margin: 0 0 10px 0; color: #1f2937;">Veranstaltungsort:</h4>
          <p style="margin: 5px 0; font-size: 14px;">${bookingData.venue.name}</p>
          <p style="margin: 5px 0; font-size: 14px;">${bookingData.venue.address}</p>
          <p style="margin: 5px 0; font-size: 14px;">Tel: ${bookingData.venue.phone}</p>
        </div>
        
        <div style="background: #fef3c7; padding: 10px; border-radius: 6px; margin-top: 15px;">
          <p style="margin: 0; font-size: 12px; color: #92400e;">
            <strong>Wichtig:</strong> ${bookingData.specialNotes}
          </p>
        </div>
      </div>
    `;

    const blob = new Blob([ticketContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FreizeitEngel-Ticket-${bookingData.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Buchung erfolgreich!
          </h1>
          <p className="text-gray-600">
            Ihre Buchung wurde bestätigt und Sie erhalten in Kürze eine E-Mail mit allen Details.
          </p>
        </div>

        {/* Booking Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Buchungsdetails</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {bookingData.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Experience Info */}
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                {bookingData.experienceName}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{new Date(bookingData.date).toLocaleDateString('de-DE')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{bookingData.time} Uhr</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>{bookingData.participants} Person(en)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Gesamtpreis: {bookingData.totalPrice.toFixed(2)}€</span>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="text-center py-4 border-t border-b border-gray-200">
              <h4 className="font-semibold mb-3">Ihr E-Ticket</h4>
              {qrCodeUrl && (
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code für Check-in" 
                    className="mx-auto"
                  />
                </div>
              )}
              <p className="text-xs text-gray-600 mt-2">
                Zeigen Sie diesen QR-Code beim Check-in vor
              </p>
            </div>

            {/* Customer Info */}
            <div>
              <h4 className="font-semibold mb-3">Kundendaten</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Name:</span>
                  <span>{bookingData.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{bookingData.customerEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{bookingData.customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Venue Info */}
            <div>
              <h4 className="font-semibold mb-3">Veranstaltungsort</h4>
              <div className="space-y-2 text-sm">
                <div className="font-medium">{bookingData.venue.name}</div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                  <span>{bookingData.venue.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{bookingData.venue.phone}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-600 text-sm font-bold">!</span>
              </div>
              <div>
                <h4 className="font-semibold text-orange-800 mb-1">Wichtige Hinweise</h4>
                <p className="text-orange-700 text-sm">
                  {bookingData.specialNotes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={downloadTicket}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Ticket herunterladen
          </Button>
          <Button 
            variant="outline"
            onClick={() => setLocation('/')}
          >
            Zur Startseite
          </Button>
        </div>

        {/* Booking Reference */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Buchungs-ID: <span className="font-mono font-semibold">{bookingData.id}</span></p>
          <p>Gebucht am: {bookingData.bookingDate}</p>
        </div>
      </div>
    </div>
  );
}