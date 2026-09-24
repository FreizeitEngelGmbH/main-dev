import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  experienceId?: number;
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
  onCancel?: (data: any) => void;
}

export function PayPalButton({
  amount,
  currency = "EUR",
  experienceId,
  onSuccess,
  onError,
  onCancel,
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadPayPalScript = () => {
      if (window.paypal) {
        initPayPalButton();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://www.paypal.com/sdk/js?client-id=sandbox&currency=EUR&intent=capture";
      script.async = true;
      script.onload = () => initPayPalButton();
      script.onerror = () => {
        setError("PayPal SDK konnte nicht geladen werden");
        setIsLoading(false);
      };
      document.body.appendChild(script);
    };

    const initPayPalButton = () => {
      if (!window.paypal) {
        setError("PayPal SDK nicht verfügbar");
        setIsLoading(false);
        return;
      }

      const container = document.getElementById("paypal-button-container");
      if (!container) return;

      // Clear existing content
      container.innerHTML = "";

      window.paypal
        .Buttons({
          createOrder: async () => {
            try {
              const response = await fetch("/api/paypal/order", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  amount: amount.toString(),
                  currency,
                  experienceId,
                }),
              });

              if (!response.ok) {
                throw new Error("Fehler beim Erstellen der Bestellung");
              }

              const orderData = await response.json();
              return orderData.id;
            } catch (error) {
              console.error("Error creating PayPal order:", error);
              toast({
                title: "Fehler",
                description: "Bestellung konnte nicht erstellt werden",
                variant: "destructive",
              });
              throw error;
            }
          },
          onApprove: async (data: any) => {
            try {
              const response = await fetch(`/api/paypal/order/${data.orderID}/capture`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
              });

              if (!response.ok) {
                throw new Error("Zahlung konnte nicht abgeschlossen werden");
              }

              const details = await response.json();
              
              toast({
                title: "Zahlung erfolgreich",
                description: "Ihre PayPal-Zahlung wurde erfolgreich verarbeitet",
              });

              if (onSuccess) {
                onSuccess(details);
              }
            } catch (error) {
              console.error("Error capturing PayPal payment:", error);
              toast({
                title: "Fehler",
                description: "Zahlung konnte nicht abgeschlossen werden",
                variant: "destructive",
              });
              if (onError) {
                onError(error);
              }
            }
          },
          onCancel: (data: any) => {
            toast({
              title: "Zahlung abgebrochen",
              description: "Sie haben die PayPal-Zahlung abgebrochen",
              variant: "destructive",
            });
            if (onCancel) {
              onCancel(data);
            }
          },
          onError: (err: any) => {
            console.error("PayPal error:", err);
            toast({
              title: "PayPal Fehler",
              description: "Ein Fehler ist bei der PayPal-Zahlung aufgetreten",
              variant: "destructive",
            });
            if (onError) {
              onError(err);
            }
          },
          style: {
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "paypal",
          },
        })
        .render("#paypal-button-container")
        .then(() => {
          setIsLoading(false);
        })
        .catch((err: any) => {
          console.error("Error rendering PayPal button:", err);
          setError("PayPal Button konnte nicht geladen werden");
          setIsLoading(false);
        });
    };

    loadPayPalScript();
  }, [amount, currency, experienceId, onSuccess, onError, onCancel, toast]);

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {isLoading && (
        <Button disabled className="w-full" variant="outline">
          PayPal wird geladen...
        </Button>
      )}
      <div id="paypal-button-container" className={isLoading ? "hidden" : ""} />
    </div>
  );
}