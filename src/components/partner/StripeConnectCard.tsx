import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/partner/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface StripeStatus {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  onboardingComplete: boolean;
}

export default function StripeConnectCard() {
  const { toast } = useToast();

  const { data: status, isLoading, refetch } = useQuery<StripeStatus>({
    queryKey: ["/api/partner/stripe/status"],
  });

  const onboardMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/partner/stripe/onboarding-link", {});
      return res.json();
    },
    onSuccess: (data: { url?: string }) => {
      // STATIC: real file opens a real Stripe onboarding URL here. The mocked
      // apiRequest never returns a real url, so guard explicitly rather than
      // rely on window.open(undefined, ...) being harmless by accident.
      if (data?.url) {
        const win = window.open(data.url, "_blank", "noopener");
        if (!win) window.location.href = data.url;
      } else {
        toast({ title: "Nicht verfügbar", description: "Die Stripe-Verbindung ist noch nicht verfügbar." });
      }
    },
    onError: (err: any) => {
      toast({
        title: "Stripe-Verbindung fehlgeschlagen",
        description: err?.message || "Bitte versuche es später erneut.",
        variant: "destructive",
      });
    },
  });

  const ready = status?.connected && status?.chargesEnabled;

  return (
    <Card className="border-[#6C2BD9]/20" data-testid="card-stripe-connect">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-5 w-5 text-[#6C2BD9]" />
          Online-Zahlungen (Stripe)
          {isLoading ? null : ready ? (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aktiv</Badge>
          ) : status?.connected ? (
            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Verifizierung offen</Badge>
          ) : (
            <Badge variant="outline">Nicht verbunden</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Verbinde dein Stripe-Konto, um Online-Zahlungen zu empfangen. Auszahlungen gehen direkt auf dein Bankkonto.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {ready ? (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Dein Konto ist verifiziert – du kannst Zahlungen empfangen.
            {!status?.payoutsEnabled && (
              <span className="text-yellow-700">(Auszahlungen noch in Prüfung)</span>
            )}
          </div>
        ) : status?.connected ? (
          <div className="flex items-center gap-2 text-sm text-yellow-700">
            <AlertCircle className="h-4 w-4" />
            Die Verifizierung ist noch nicht abgeschlossen.
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {!ready && (
            <Button
              onClick={() => onboardMutation.mutate()}
              disabled={onboardMutation.isPending}
              className="bg-[#6C2BD9] hover:bg-[#5a23b8]"
              data-testid="button-stripe-onboard"
            >
              {onboardMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              {status?.connected ? "Verifizierung fortsetzen" : "Mit Stripe verbinden"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-stripe-refresh">
            Status aktualisieren
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
