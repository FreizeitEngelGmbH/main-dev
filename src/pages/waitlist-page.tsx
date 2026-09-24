import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Bell, Mail, MapPin, ArrowLeft, CheckCircle2, Heart,
  Clock, Sparkles, Users, Shield
} from "lucide-react";

interface Experience {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  imageUrl: string;
  basePrice: number;
  partnerId: number;
}

interface Partner {
  id: number;
  companyName: string;
  description: string;
  city: string;
  logoUrl: string;
}

export default function WaitlistPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/waitlist/:experienceId");
  const experienceId = params?.experienceId ? parseInt(params.experienceId) : null;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: experience } = useQuery<Experience>({
    queryKey: ["/api/experiences", experienceId],
    enabled: !!experienceId,
  });

  const { data: partner } = useQuery<Partner>({
    queryKey: ["/api/partners", experience?.partnerId],
    enabled: !!experience?.partnerId,
  });

  const signupMutation = useMutation({
    mutationFn: async (data: { email: string; name: string | null; experienceId: number | null; partnerId: number | null; partnerName: string | null; experienceName: string | null }) => {
      const res = await apiRequest("POST", "/api/waitlist", data);
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Erfolgreich eingetragen!", description: "Wir benachrichtigen Sie, sobald dieser Partner bei uns live ist." });
    },
    onError: (error: any) => {
      const msg = error?.message || "";
      if (msg.includes("409")) {
        setSubmitted(true);
        toast({ title: "Bereits eingetragen", description: "Sie stehen bereits auf der Warteliste für dieses Angebot." });
      } else if (msg.includes("400")) {
        toast({ title: "Ungültige E-Mail", description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.", variant: "destructive" });
      } else {
        toast({ title: "Fehler", description: "Bitte versuchen Sie es erneut.", variant: "destructive" });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "E-Mail fehlt", description: "Bitte geben Sie Ihre E-Mail-Adresse ein.", variant: "destructive" });
      return;
    }
    signupMutation.mutate({
      email,
      name: name || null,
      experienceId: experienceId,
      partnerId: experience?.partnerId || null,
      partnerName: partner?.companyName || null,
      experienceName: experience?.title || null,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>


        {submitted ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Vielen Dank!</h2>
              <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                Wir haben Ihre E-Mail-Adresse gespeichert und benachrichtigen Sie,
                sobald <strong>{partner?.companyName || "dieser Partner"}</strong> bei FreizeitEngel buchbar ist.
              </p>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 justify-center mb-3">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <span className="font-semibold">Was passiert als Nächstes?</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-sm mx-auto">
                  <li className="flex items-start gap-2">
                    <Bell className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    Sie erhalten eine E-Mail, sobald der Partner live geht
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    Als Erster erfahren Sie von exklusiven Angeboten
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    Ihre Daten werden sicher und vertraulich behandelt
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Weitere Erlebnisse entdecken
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-3">
                  Bald bei FreizeitEngel verfügbar!
                </h1>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  {partner?.companyName ? (
                    <>
                      <strong>{partner.companyName}</strong> ist aktuell noch nicht auf unserer Plattform buchbar.
                      Tragen Sie sich ein und wir benachrichtigen Sie, sobald es losgeht!
                    </>
                  ) : (
                    <>
                      Dieser Partner ist aktuell noch nicht auf unserer Plattform buchbar.
                      Tragen Sie sich ein und wir benachrichtigen Sie, sobald es losgeht!
                    </>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Bell className="h-5 w-5 text-purple-600 mx-auto mb-1.5" />
                  <span className="text-xs text-muted-foreground">Sofort benachrichtigt</span>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Sparkles className="h-5 w-5 text-purple-600 mx-auto mb-1.5" />
                  <span className="text-xs text-muted-foreground">Exklusive Angebote</span>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Users className="h-5 w-5 text-purple-600 mx-auto mb-1.5" />
                  <span className="text-xs text-muted-foreground">Kostenlos & unverbindlich</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Name (optional)</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ihr Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">E-Mail-Adresse *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="ihre@email.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl"
                >
                  {signupMutation.isPending ? (
                    "Wird eingetragen..."
                  ) : (
                    <>
                      <Bell className="h-5 w-5 mr-2" />
                      Benachrichtigung erhalten
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-3">
                  Wir verwenden Ihre E-Mail-Adresse ausschließlich, um Sie über die Verfügbarkeit
                  zu informieren. Kein Spam, versprochen.
                </p>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
