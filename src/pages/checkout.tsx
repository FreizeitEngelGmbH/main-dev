import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Shield, CheckCircle2 } from "lucide-react";
import type { Experience } from "@shared/schema";

// STATIC: copied from EngelFolder's pages/checkout.tsx. Online payment (Stripe) is not connected in this
// build and the Stripe packages are not installed: payment stays "not available", the Stripe card form was
// removed, and no payment intent is requested.
const stripePromise = null;

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [serverAmount, setServerAmount] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState(false);
  const { toast } = useToast();

  // Read experienceId + participants from URL: /checkout?experienceId=123&participants=1
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const experienceId = parseInt(params.get("experienceId") || "0");
  const participants = Math.max(1, parseInt(params.get("participants") || "1"));

  const { data: experience, isLoading: expLoading } = useQuery<Experience>({
    queryKey: [`/api/experiences/${experienceId}`],
    enabled: experienceId > 0,
  });

  useEffect(() => {
    if (!stripePromise || !experienceId || !experience) return;
    apiRequest("POST", "/api/create-payment-intent", {
      experienceId,
      participants,
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setServerAmount(data.amount);
      })
      .catch(err => {
        toast({
          title: "Fehler bei der Zahlungsvorbereitung",
          description: "Bitte versuche es später erneut.",
          variant: "destructive",
        });
        console.error("Payment intent error:", err);
      });
  }, [experienceId, experience?.id]);

  const totalAmount = serverAmount ?? (experience ? experience.price * participants : 0);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setIsSuccess(true);
    // Create the booking server-side, verified against the paid PaymentIntent
    try {
      const res = await apiRequest("POST", "/api/bookings/stripe-confirm", { paymentIntentId });
      const data = await res.json();
      if (data?.booking?.id) {
        setBookingRef(`#FE-${data.booking.id}`);
      } else {
        setBookingError(true);
      }
    } catch (e) {
      console.error("Booking creation after payment failed:", e);
      setBookingError(true);
    }
  };

  if (!experienceId) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h1 className="text-xl font-bold mb-2">Kein Erlebnis ausgewählt</h1>
          <p className="text-gray-600 mb-6">Bitte wähle zuerst ein Erlebnis aus, das du buchen möchtest.</p>
          <Button onClick={() => navigate("/search")}>Erlebnisse entdecken</Button>
        </div>
      </div>
    );
  }

  if (isSuccess && experience) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg">
            <CardHeader className="bg-primary text-white">
              <div className="mb-2 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-white mb-2" />
              </div>
              <CardTitle className="text-center text-2xl">Zahlung erfolgreich!</CardTitle>
              <CardDescription className="text-center text-white/90">
                Vielen Dank für deine Buchung bei FreizeitEngel.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Erlebnis</p>
                  <p className="font-medium">{experience.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Buchungsnummer</p>
                  <p className="font-medium">{bookingRef ?? (bookingError ? "—" : "wird erstellt…")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teilnehmer</p>
                  <p className="font-medium">{participants} Person{participants !== 1 ? 'en' : ''}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gesamtpreis</p>
                  <p className="font-medium">{totalAmount.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-green-600">Bezahlt</p>
                </div>
              </div>
              {bookingError && (
                <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800" data-testid="text-booking-error">
                  Deine Zahlung war erfolgreich, aber die Buchung konnte noch nicht angelegt werden.
                  Bitte kontaktiere uns unter Angabe deiner Zahlung – dein Geld ist nicht verloren.
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
              <Button variant="outline" onClick={() => navigate("/")}>Zur Startseite</Button>
              <Button onClick={() => navigate("/search")}>Weitere Erlebnisse entdecken</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(`/experience/${experienceId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Erlebnis
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Schließe deine Buchung ab</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Zahlung
                </CardTitle>
                <CardDescription>
                  Bezahle sicher mit Karte oder weiteren Zahlungsmethoden
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!stripePromise ? (
                  <p className="text-sm text-red-600 py-4">
                    Online-Zahlung ist derzeit nicht verfügbar (Stripe nicht konfiguriert).
                  </p>
                ) : (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Zusammenfassung</CardTitle>
              </CardHeader>
              <CardContent>
                {expLoading || !experience ? (
                  <p className="text-sm text-gray-500">Lade Erlebnis…</p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">{experience.title}</h3>
                      <div className="text-sm text-gray-500">
                        <p>{experience.location}, {experience.city}</p>
                        <p>Teilnehmer: {participants}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Einzelpreis</span>
                        <span>{experience.price.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Teilnehmer</span>
                        <span>{participants}x</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium text-lg">
                        <span>Gesamtpreis</span>
                        <span>{totalAmount.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <div className="w-full text-xs text-gray-500">
                  <p>Mit der Buchung stimmst du unseren AGB und Datenschutzrichtlinien zu.</p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
