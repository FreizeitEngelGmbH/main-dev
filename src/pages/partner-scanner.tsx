import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { NativeQRScanner } from "@/components/native-qr-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/partner/queryClient";
import {
  QrCode,
  Camera,
  CameraOff,
  Check,
  X,
  User,
  Calendar,
  Clock,
  Users,
  Euro,
  Ticket,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Smartphone
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface BookingValidation {
  valid: boolean;
  booking?: {
    id: number;
    bookingReference: string;
    contactName: string;
    contactEmail: string;
    experienceTitle: string;
    experienceId: number;
    date: string;
    startTime?: string;
    endTime?: string;
    participants: number;
    adultsCount?: number;
    childrenCount?: number;
    totalPrice: number;
    status: string;
    checkedIn: boolean;
    checkedInAt?: string;
  };
  error?: string;
}

export default function QRScanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [invalidCodeError, setInvalidCodeError] = useState<string | null>(null);

  const { data: validationResult, isLoading: isValidating, refetch: revalidate } = useQuery<BookingValidation>({
    queryKey: [`/api/partner/validate-booking/${scannedCode}`],
    enabled: !!scannedCode,
  });

  const checkInMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest("POST", `/api/partner/check-in/${bookingId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Check-in erfolgreich!",
        description: "Der Gast wurde erfolgreich eingecheckt.",
      });
      revalidate();
    },
    onError: (error: Error) => {
      toast({
        title: "Check-in fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleScan = useCallback((code: string) => {
    if (code.startsWith("FE-")) {
      setScannedCode(code);
      setInvalidCodeError(null);
      setIsScanning(false);
    } else {
      setInvalidCodeError("Dies ist kein FreizeitEngel QR-Code. Bitte einen FE-Code scannen.");
      setIsScanning(false);
    }
  }, []);

  const handleScanError = useCallback((error: string) => {
    setScannerError(error);
    setIsScanning(false);
  }, []);

  const startScanner = () => {
    setScannerError(null);
    setScannedCode(null);
    setInvalidCodeError(null);
    setIsScanning(true);
  };

  const stopScanner = () => {
    setIsScanning(false);
  };

  const resetScanner = () => {
    setScannedCode(null);
    setScannerError(null);
    setInvalidCodeError(null);
  };

  if (!user || user.role !== "partner") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold mb-2">Zugriff verweigert</h2>
              <p className="text-muted-foreground mb-4">
                Nur Partner können den QR-Scanner verwenden.
              </p>
              <Link href="/auth">
                <Button>Zum Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const booking = validationResult?.booking;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Link href="/partner/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            <span className="font-semibold">QR-Scanner</span>
          </div>
          <div className="w-20" />
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Ticket scannen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {scannerError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-700">{scannerError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setScannerError(null);
                        startScanner();
                      }}
                    >
                      Erneut versuchen
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {invalidCodeError && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-700">{invalidCodeError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setInvalidCodeError(null);
                        startScanner();
                      }}
                    >
                      Anderen Code scannen
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isScanning ? (
              <div className="space-y-4">
                <NativeQRScanner
                  isActive={isScanning}
                  onScan={handleScan}
                  onError={handleScanError}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={stopScanner}
                >
                  <CameraOff className="w-4 h-4 mr-2" />
                  Scanner stoppen
                </Button>
              </div>
            ) : !scannedCode && !scannerError && !invalidCodeError ? (
              <div className="text-center py-8">
                <Smartphone className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-500 mb-6">
                  Halte die Kamera auf den QR-Code des Gastes
                </p>
                <Button
                  onClick={startScanner}
                  size="lg"
                  className="w-full"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Kamera starten
                </Button>
              </div>
            ) : null}

            {scannedCode && (
              <div className="space-y-4">
                <div className="bg-slate-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Ticket className="w-4 h-4 text-primary" />
                    <span className="font-mono font-semibold">{scannedCode}</span>
                  </div>
                </div>

                {isValidating && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}

                {validationResult && !isValidating && (
                  <>
                    {validationResult.valid && booking ? (
                      <div className="space-y-4">
                        {booking.checkedIn ? (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-amber-700">
                              <AlertCircle className="w-5 h-5" />
                              <span className="font-medium">Bereits eingecheckt</span>
                            </div>
                            {booking.checkedInAt && (
                              <p className="text-sm text-amber-600 mt-1">
                                Check-in am {format(new Date(booking.checkedInAt), "dd.MM.yyyy 'um' HH:mm", { locale: de })} Uhr
                              </p>
                            )}
                          </div>
                        ) : booking.status === "cancelled" ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-red-700">
                              <X className="w-5 h-5" />
                              <span className="font-medium">Buchung storniert</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="font-medium">Gültige Buchung</span>
                            </div>
                          </div>
                        )}

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-sm text-slate-500">Gast</p>
                              <p className="font-medium">{booking.contactName}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Ticket className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-sm text-slate-500">Erlebnis</p>
                              <p className="font-medium">{booking.experienceTitle}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-sm text-slate-500">Datum</p>
                              <p className="font-medium">
                                {format(new Date(booking.date), "EEEE, dd. MMMM yyyy", { locale: de })}
                              </p>
                            </div>
                          </div>

                          {booking.startTime && (
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <div>
                                <p className="text-sm text-slate-500">Uhrzeit</p>
                                <p className="font-medium">
                                  {booking.startTime}{booking.endTime ? ` - ${booking.endTime}` : ""} Uhr
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-sm text-slate-500">Teilnehmer</p>
                              <p className="font-medium">
                                {booking.participants} Person{booking.participants !== 1 ? "en" : ""}
                                {booking.adultsCount && booking.childrenCount && (
                                  <span className="text-sm text-slate-500 ml-1">
                                    ({booking.adultsCount} Erw., {booking.childrenCount} Kind{booking.childrenCount !== 1 ? "er" : ""})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Euro className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-sm text-slate-500">Preis</p>
                              <p className="font-medium">{booking.totalPrice.toFixed(2)} €</p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex gap-2">
                          {!booking.checkedIn && booking.status !== "cancelled" && (
                            <Button
                              className="flex-1"
                              onClick={() => checkInMutation.mutate(booking.id)}
                              disabled={checkInMutation.isPending}
                            >
                              {checkInMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 mr-2" />
                              )}
                              Einchecken
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={resetScanner}
                            className={!booking.checkedIn && booking.status !== "cancelled" ? "" : "flex-1"}
                          >
                            Neuen Code scannen
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-red-700">Ungültige Buchung</p>
                            <p className="text-sm text-red-600 mt-1">
                              {validationResult.error || "Diese Buchung existiert nicht oder gehört nicht zu Ihrem Unternehmen."}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3"
                              onClick={resetScanner}
                            >
                              Anderen Code scannen
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center text-sm text-slate-500">
              <p className="flex items-center justify-center gap-2 mb-2">
                <QrCode className="w-4 h-4" />
                FreizeitEngel QR-Code Scanner
              </p>
              <p>Scannt nur Codes mit FE-Präfix</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
