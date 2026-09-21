import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminLayout from "./admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ClipboardCheck,
  Search,
  UserPlus,
  FileSignature,
  CreditCard,
  Package,
  Palette,
  Megaphone,
  TestTube,
  Rocket,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  ChevronRight,
  Building2,
  MapPin,
  Mail,
  Phone,
  AlertCircle,
  User,
  Filter,
  BarChart3,
  Loader2,
  CalendarDays,
  StickyNote,
  Download,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import type { Partner, PartnerOnboarding, PaymentAccount } from "@shared/schema";

const ACCENT = "#36C9C2";

interface OnboardingStep {
  key: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  fieldComplete: keyof PartnerOnboarding;
  fieldDate: keyof PartnerOnboarding;
  fieldNotes: keyof PartnerOnboarding;
  checklist: string[];
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    key: "registration",
    label: "1. Registrierung & Kontakt",
    description: "Partner-Konto anlegen, Kontaktdaten erfassen, Erstgespräch führen",
    icon: UserPlus,
    color: "#3b82f6",
    fieldComplete: "stepRegistration",
    fieldDate: "stepRegistrationDate",
    fieldNotes: "stepRegistrationNotes",
    checklist: [
      "Partner-Konto im System angelegt",
      "Kontaktdaten vollständig (Name, E-Mail, Telefon, Adresse)",
      "Erstgespräch / Kennenlernen durchgeführt",
      "Leistungsumfang und Kategorien besprochen",
      "Unternehmensform und Rechtsform geprüft",
    ],
  },
  {
    key: "contract",
    label: "2. Vertrag & Konditionen",
    description: "Partnervertrag unterzeichnen, Provisionsmodell vereinbaren",
    icon: FileSignature,
    color: "#8b5cf6",
    fieldComplete: "stepContract",
    fieldDate: "stepContractDate",
    fieldNotes: "stepContractNotes",
    checklist: [
      "Partnervertrag generiert (Vorlage herunterladen)",
      "Provisionsmodell besprochen und vereinbart",
      "AGB & Datenschutzvereinbarung unterzeichnet",
      "Vertrag von beiden Seiten unterschrieben",
      "Vertragskopie archiviert (Dokumentenmanagement)",
    ],
  },
  {
    key: "stripe",
    label: "3. Zahlungseinrichtung (Stripe)",
    description: "Stripe Connect Konto einrichten, KYC-Verifizierung, Bankdaten",
    icon: CreditCard,
    color: "#6366f1",
    fieldComplete: "stepStripe",
    fieldDate: "stepStripeDate",
    fieldNotes: "stepStripeNotes",
    checklist: [
      "Stripe Connect Express Konto angelegt",
      "Onboarding-Link an Partner gesendet",
      "Partner hat KYC-Verifizierung abgeschlossen",
      "Bankverbindung verifiziert",
      "Provisionsrate im System hinterlegt",
      "Testtransaktion erfolgreich durchgeführt",
    ],
  },
  {
    key: "experiences",
    label: "4. Angebote & Erlebnisse",
    description: "Erlebnisse anlegen, Preise festlegen, Kategorien zuordnen",
    icon: Package,
    color: "#f59e0b",
    fieldComplete: "stepExperiences",
    fieldDate: "stepExperiencesDate",
    fieldNotes: "stepExperiencesNotes",
    checklist: [
      "Mindestens 1 Erlebnis/Ticket angelegt",
      "Preise realistisch und marktgerecht",
      "Beschreibungen vollständig und ansprechend",
      "Kategorien korrekt zugeordnet",
      "Verfügbarkeit / Öffnungszeiten hinterlegt",
      "Buchungsparameter konfiguriert",
    ],
  },
  {
    key: "branding",
    label: "5. Branding & Medien",
    description: "Logo, Bilder, Beschreibungstexte und Partner-Profilseite",
    icon: Palette,
    color: "#ec4899",
    fieldComplete: "stepBranding",
    fieldDate: "stepBrandingDate",
    fieldNotes: "stepBrandingNotes",
    checklist: [
      "Partner-Logo hochgeladen (min. 400x400px)",
      "Erlebnisbilder in guter Qualität vorhanden",
      "Profilbeschreibung (Über uns) geschrieben",
      "Öffnungszeiten auf Profilseite aktuell",
      "Kontaktdaten auf Profilseite korrekt",
      "Partner-Shop Seite geprüft und freigegeben",
    ],
  },
  {
    key: "marketing",
    label: "6. Marketing & Sichtbarkeit",
    description: "Werbematerial bereitstellen, Listing aktivieren, SEO prüfen",
    icon: Megaphone,
    color: "#10b981",
    fieldComplete: "stepMarketing",
    fieldDate: "stepMarketingDate",
    fieldNotes: "stepMarketingNotes",
    checklist: [
      "Werbematerialien erstellt (Flyer, Social Media)",
      "Partner in Newsletter / Social Media angekündigt",
      "SEO-Optimierung der Profilseite geprüft",
      "Partner auf Startseite / Featured gelistet",
      "Google Maps / Standort-Daten korrekt",
    ],
  },
  {
    key: "testing",
    label: "7. Test & Qualitätssicherung",
    description: "Testbuchung durchführen, E-Mail-Flow prüfen, QR-Codes testen",
    icon: TestTube,
    color: "#f97316",
    fieldComplete: "stepTesting",
    fieldDate: "stepTestingDate",
    fieldNotes: "stepTestingNotes",
    checklist: [
      "Testbuchung erfolgreich durchgeführt",
      "Bestätigungs-E-Mail korrekt empfangen",
      "QR-Code auf Ticket scanbar und gültig",
      "Stornierung / Erstattung getestet",
      "Partner-Dashboard funktioniert",
      "Mobile Ansicht geprüft",
    ],
  },
  {
    key: "goLive",
    label: "8. Go-Live & Freischaltung",
    description: "Partner freischalten, isLive setzen, Launch kommunizieren",
    icon: Rocket,
    color: "#36C9C2",
    fieldComplete: "stepGoLive",
    fieldDate: "stepGoLiveDate",
    fieldNotes: "stepGoLiveNotes",
    checklist: [
      "Alle vorherigen Schritte abgeschlossen",
      "Partner-Status auf 'Live' gesetzt",
      "BaFin-Compliance geprüft (Stripe Connect aktiv)",
      "Launch-Kommunikation an Partner gesendet",
      "Partner in Monitoring aufgenommen",
      "Feedback-Gespräch nach 1 Woche geplant",
    ],
  },
];

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  hoch: { label: "Hoch", color: "bg-red-100 text-red-700" },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-700" },
  niedrig: { label: "Niedrig", color: "bg-gray-100 text-gray-600" },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  nicht_gestartet: { label: "Nicht gestartet", color: "bg-gray-100 text-gray-600" },
  in_bearbeitung: { label: "In Bearbeitung", color: "bg-blue-100 text-blue-700" },
  warten_auf_partner: { label: "Warten auf Partner", color: "bg-amber-100 text-amber-700" },
  abgeschlossen: { label: "Abgeschlossen", color: "bg-green-100 text-green-700" },
};

function getCompletedSteps(ob: PartnerOnboarding): number {
  let count = 0;
  if (ob.stepRegistration) count++;
  if (ob.stepContract) count++;
  if (ob.stepStripe) count++;
  if (ob.stepExperiences) count++;
  if (ob.stepBranding) count++;
  if (ob.stepMarketing) count++;
  if (ob.stepTesting) count++;
  if (ob.stepGoLive) count++;
  return count;
}

function formatDate(d: string | Date | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AdminOnboarding() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("alle");
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [stepNotes, setStepNotes] = useState("");

  const partnersQuery = useQuery<Partner[]>({ queryKey: ["/api/partners"] });
  const onboardingsQuery = useQuery<PartnerOnboarding[]>({ queryKey: ["/api/admin/onboarding"] });
  const accountsQuery = useQuery<PaymentAccount[]>({ queryKey: ["/api/admin/payments/accounts"] });

  const allPartners = partnersQuery.data || [];
  const allOnboardings = onboardingsQuery.data || [];
  const allAccounts = accountsQuery.data || [];

  const getOnboarding = (partnerId: number) => allOnboardings.find((o) => o.partnerId === partnerId);
  const getPaymentAccount = (partnerId: number) => allAccounts.find((a) => a.partnerId === partnerId);

  const initMut = useMutation({
    mutationFn: async (partnerId: number) =>
      apiRequest("POST", "/api/admin/onboarding", {
        partnerId,
        stepRegistration: true,
        stepRegistrationDate: new Date(),
        overallStatus: "in_bearbeitung",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/onboarding"] });
      toast({ title: "Onboarding gestartet" });
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ partnerId, ...data }: any) =>
      apiRequest("PATCH", `/api/admin/onboarding/${partnerId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/onboarding"] });
      toast({ title: "Onboarding aktualisiert" });
    },
  });

  const handleToggleStep = (partnerId: number, step: OnboardingStep, currentValue: boolean) => {
    if (!currentValue) {
      setSelectedPartnerId(partnerId);
      setCurrentStep(step);
      setStepNotes("");
      setShowStepDialog(true);
    } else {
      updateMut.mutate({
        partnerId,
        [step.fieldComplete]: false,
        [step.fieldDate]: null,
      });
    }
  };

  const handleCompleteStep = () => {
    if (!selectedPartnerId || !currentStep) return;
    const ob = getOnboarding(selectedPartnerId);
    const data: any = {
      partnerId: selectedPartnerId,
      [currentStep.fieldComplete]: true,
      [currentStep.fieldDate]: new Date(),
    };
    if (stepNotes.trim()) {
      data[currentStep.fieldNotes] = stepNotes.trim();
    }
    const completedAfter = (ob ? getCompletedSteps(ob) : 0) + 1;
    if (completedAfter >= 8) {
      data.overallStatus = "abgeschlossen";
    } else if (completedAfter > 0) {
      data.overallStatus = "in_bearbeitung";
    }
    updateMut.mutate(data);
    setShowStepDialog(false);
  };

  const partnersWithStatus = useMemo(() => {
    return allPartners.map((p) => {
      const ob = getOnboarding(p.id);
      const completed = ob ? getCompletedSteps(ob) : 0;
      const progress = Math.round((completed / 8) * 100);
      return { partner: p, onboarding: ob, completed, progress };
    });
  }, [allPartners, allOnboardings]);

  const filteredPartners = partnersWithStatus.filter((pw) => {
    const matchSearch =
      !searchQuery ||
      pw.partner.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pw.partner.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      filterStatus === "alle" ||
      (filterStatus === "nicht_gestartet" && !pw.onboarding) ||
      (filterStatus === "in_bearbeitung" && pw.onboarding?.overallStatus === "in_bearbeitung") ||
      (filterStatus === "warten_auf_partner" && pw.onboarding?.overallStatus === "warten_auf_partner") ||
      (filterStatus === "abgeschlossen" && pw.onboarding?.overallStatus === "abgeschlossen");
    return matchSearch && matchStatus;
  });

  const statsAll = partnersWithStatus.length;
  const statsNotStarted = partnersWithStatus.filter((p) => !p.onboarding).length;
  const statsInProgress = partnersWithStatus.filter((p) => p.onboarding?.overallStatus === "in_bearbeitung").length;
  const statsWaiting = partnersWithStatus.filter((p) => p.onboarding?.overallStatus === "warten_auf_partner").length;
  const statsCompleted = partnersWithStatus.filter((p) => p.onboarding?.overallStatus === "abgeschlossen").length;

  const selectedPartnerData = selectedPartnerId
    ? partnersWithStatus.find((p) => p.partner.id === selectedPartnerId)
    : null;

  const isLoading = partnersQuery.isLoading || onboardingsQuery.isLoading;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ClipboardCheck className="w-7 h-7" style={{ color: ACCENT }} />
                Partner Onboarding
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Alle Onboarding-Schritte für neue Partner verwalten und nachverfolgen
              </p>
            </div>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="px-6 pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("alle")}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-4 w-4" style={{ color: ACCENT }} />
                  <span className="text-xs text-muted-foreground">Gesamt</span>
                </div>
                <p className="text-2xl font-bold">{statsAll}</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("nicht_gestartet")}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Circle className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-muted-foreground">Nicht gestartet</span>
                </div>
                <p className="text-2xl font-bold">{statsNotStarted}</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("in_bearbeitung")}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">In Bearbeitung</span>
                </div>
                <p className="text-2xl font-bold">{statsInProgress}</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("warten_auf_partner")}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground">Warten auf Partner</span>
                </div>
                <p className="text-2xl font-bold">{statsWaiting}</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("abgeschlossen")}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Abgeschlossen</span>
                </div>
                <p className="text-2xl font-bold">{statsCompleted}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Partner List (Left Panel) */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Partner</CardTitle>
                  <div className="space-y-2 mt-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Partner suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="text-xs h-8">
                        <Filter className="w-3 h-3 mr-1" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alle">Alle Partner</SelectItem>
                        <SelectItem value="nicht_gestartet">Nicht gestartet</SelectItem>
                        <SelectItem value="in_bearbeitung">In Bearbeitung</SelectItem>
                        <SelectItem value="warten_auf_partner">Warten auf Partner</SelectItem>
                        <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="max-h-[calc(100vh-380px)] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredPartners.length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground py-6">Keine Partner gefunden</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredPartners.map(({ partner, onboarding, completed, progress }) => {
                        const status = onboarding?.overallStatus || "nicht_gestartet";
                        const statusInfo = STATUS_MAP[status] || STATUS_MAP.nicht_gestartet;
                        return (
                          <button
                            key={partner.id}
                            className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-sm ${
                              selectedPartnerId === partner.id
                                ? "border-[#36C9C2] bg-[#36C9C2]/5 shadow-sm"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => setSelectedPartnerId(partner.id)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm truncate">{partner.companyName}</span>
                              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              {partner.city && (
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="w-3 h-3" /> {partner.city}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={progress} className="h-1.5 flex-1" />
                              <span className="text-xs font-medium text-muted-foreground">{completed}/8</span>
                            </div>
                            <div className="mt-1.5">
                              <Badge className={`text-[10px] ${statusInfo.color}`}>{statusInfo.label}</Badge>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Onboarding Detail (Right Panel) */}
            <div className="lg:col-span-2">
              {!selectedPartnerId ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <ClipboardCheck className="w-16 h-16 mx-auto mb-4" style={{ color: ACCENT, opacity: 0.3 }} />
                    <h3 className="text-lg font-medium text-gray-600">Partner auswählen</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Wähle einen Partner aus der Liste, um den Onboarding-Fortschritt zu sehen
                    </p>
                  </CardContent>
                </Card>
              ) : selectedPartnerData ? (
                <div className="space-y-4">
                  {/* Partner Header */}
                  <Card>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: ACCENT }}>
                            {selectedPartnerData.partner.companyName.charAt(0)}
                          </div>
                          <div>
                            <h2 className="text-lg font-bold">{selectedPartnerData.partner.companyName}</h2>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              {selectedPartnerData.partner.city && (
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedPartnerData.partner.city}</span>
                              )}
                              {selectedPartnerData.partner.email && (
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{selectedPartnerData.partner.email}</span>
                              )}
                              {selectedPartnerData.partner.phone && (
                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{selectedPartnerData.partner.phone}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <Progress value={selectedPartnerData.progress} className="w-24 h-2" />
                              <span className="text-sm font-bold" style={{ color: ACCENT }}>{selectedPartnerData.progress}%</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{selectedPartnerData.completed} von 8 Schritten</span>
                          </div>
                          {!selectedPartnerData.onboarding && (
                            <Button
                              onClick={() => initMut.mutate(selectedPartnerId!)}
                              disabled={initMut.isPending}
                              style={{ backgroundColor: ACCENT }}
                              className="text-white hover:opacity-90"
                            >
                              <Rocket className="w-4 h-4 mr-1" />
                              Onboarding starten
                            </Button>
                          )}
                          {selectedPartnerData.onboarding && (
                            <Select
                              value={selectedPartnerData.onboarding.overallStatus || "in_bearbeitung"}
                              onValueChange={(v) => updateMut.mutate({ partnerId: selectedPartnerId!, overallStatus: v })}
                            >
                              <SelectTrigger className="w-44 text-xs h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="nicht_gestartet">Nicht gestartet</SelectItem>
                                <SelectItem value="in_bearbeitung">In Bearbeitung</SelectItem>
                                <SelectItem value="warten_auf_partner">Warten auf Partner</SelectItem>
                                <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stripe Connect Status */}
                  {(() => {
                    const payAcc = getPaymentAccount(selectedPartnerId!);
                    return (
                      <Card className={payAcc?.stripeAccountId ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
                        <CardContent className="py-3">
                          <div className="flex items-center gap-3">
                            <ShieldCheck className={`w-5 h-5 ${payAcc?.stripeAccountId ? "text-green-600" : "text-amber-600"}`} />
                            <div className="flex-1">
                              <span className={`text-sm font-medium ${payAcc?.stripeAccountId ? "text-green-800" : "text-amber-800"}`}>
                                {payAcc?.stripeAccountId
                                  ? `Stripe Connect aktiv (${payAcc.stripeAccountId.substring(0, 12)}...)`
                                  : "Stripe Connect nicht eingerichtet - BaFin-Pflicht"}
                              </span>
                            </div>
                            {payAcc?.stripeAccountId ? (
                              <Badge className="bg-green-200 text-green-800">Verifiziert</Badge>
                            ) : (
                              <Badge className="bg-amber-200 text-amber-800">Aktion erforderlich</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}

                  {/* Onboarding Steps */}
                  <div className="space-y-3">
                    {ONBOARDING_STEPS.map((step, idx) => {
                      const ob = selectedPartnerData.onboarding;
                      const isComplete = ob ? (ob[step.fieldComplete] as boolean) : false;
                      const completedDate = ob ? (ob[step.fieldDate] as string | null) : null;
                      const notes = ob ? (ob[step.fieldNotes] as string | null) : null;
                      const StepIcon = step.icon;
                      const prevComplete = idx === 0 || (ob ? (ob[ONBOARDING_STEPS[idx - 1].fieldComplete] as boolean) : false);

                      return (
                        <Card
                          key={step.key}
                          className={`transition-all ${isComplete ? "border-green-200" : prevComplete && ob ? "border-blue-200 shadow-sm" : "opacity-60"}`}
                        >
                          <CardContent className="py-4">
                            <div className="flex items-start gap-4">
                              {/* Step indicator */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    isComplete ? "bg-green-100" : prevComplete && ob ? "bg-white border-2" : "bg-gray-100"
                                  }`}
                                  style={!isComplete && prevComplete && ob ? { borderColor: step.color } : undefined}
                                >
                                  {isComplete ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                  ) : (
                                    <StepIcon className="w-5 h-5" style={{ color: prevComplete && ob ? step.color : "#9ca3af" }} />
                                  )}
                                </div>
                                {idx < ONBOARDING_STEPS.length - 1 && (
                                  <div className={`w-0.5 h-6 mt-1 ${isComplete ? "bg-green-300" : "bg-gray-200"}`} />
                                )}
                              </div>

                              {/* Step content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className={`font-semibold text-sm ${isComplete ? "text-green-700" : "text-gray-900"}`}>
                                      {step.label}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {completedDate && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <CalendarDays className="w-3 h-3" />
                                        {formatDate(completedDate)}
                                      </span>
                                    )}
                                    {ob && (prevComplete || isComplete) && (
                                      <Button
                                        size="sm"
                                        variant={isComplete ? "outline" : "default"}
                                        className={isComplete ? "text-green-700 border-green-300" : "text-white"}
                                        style={!isComplete ? { backgroundColor: step.color } : undefined}
                                        onClick={() => handleToggleStep(selectedPartnerId!, step, isComplete)}
                                      >
                                        {isComplete ? (
                                          <>
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Erledigt
                                          </>
                                        ) : (
                                          <>
                                            <ArrowRight className="w-3 h-3 mr-1" /> Abschließen
                                          </>
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                {/* Checklist */}
                                {(prevComplete || isComplete) && ob && (
                                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-1">
                                    {step.checklist.map((item, ci) => (
                                      <div
                                        key={ci}
                                        className={`flex items-start gap-1.5 text-xs py-1 ${
                                          isComplete ? "text-green-700" : "text-gray-600"
                                        }`}
                                      >
                                        {isComplete ? (
                                          <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-500" />
                                        ) : (
                                          <Circle className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-400" />
                                        )}
                                        <span>{item}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Notes */}
                                {notes && (
                                  <div className="mt-2 p-2 rounded bg-gray-50 text-xs text-muted-foreground flex items-start gap-1">
                                    <StickyNote className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span>{notes}</span>
                                  </div>
                                )}

                                {/* Special actions for specific steps */}
                                {step.key === "contract" && ob && !isComplete && prevComplete && (
                                  <div className="mt-2">
                                    <a href="/api/download/partnervertrag" target="_blank" rel="noopener noreferrer">
                                      <Button size="sm" variant="outline" className="text-xs">
                                        <Download className="w-3 h-3 mr-1" /> Vertragsvorlage herunterladen
                                      </Button>
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Step Complete Dialog */}
        <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {currentStep && (() => {
                  const Icon = currentStep.icon;
                  return <Icon className="w-5 h-5" style={{ color: currentStep.color }} />;
                })()}
                {currentStep?.label}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-green-800">
                  Dieser Schritt wird als abgeschlossen markiert mit dem heutigen Datum.
                </p>
              </div>
              {currentStep && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Checkliste:</p>
                  {currentStep.checklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <label className="text-sm font-medium mb-1 block">Notizen (optional)</label>
                <Textarea
                  value={stepNotes}
                  onChange={(e) => setStepNotes(e.target.value)}
                  placeholder="Zusätzliche Informationen, Anmerkungen..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStepDialog(false)}>Abbrechen</Button>
              <Button
                onClick={handleCompleteStep}
                style={{ backgroundColor: currentStep?.color || ACCENT }}
                className="text-white hover:opacity-90"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" /> Als erledigt markieren
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
