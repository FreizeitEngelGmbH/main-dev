import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  PartyPopper,
  GraduationCap,
  Users,
  Calendar,
  Mail,
  Phone,
  User,
  Send,
  CheckCircle,
  Cake,
  School,
  Loader2,
  Sparkles,
  Clock,
  UtensilsCrossed,
  MessageSquare,
  Baby,
  Building2,
  Briefcase,
  Target
} from "lucide-react";
import { apiRequest } from "@/partner/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GroupInquiryFormProps {
  partnerId: number;
  partnerName: string;
  city?: string;
}

type InquiryType = "kindergeburtstag" | "schulklasse" | "firmenevent";

export default function GroupInquiryForm({ partnerId, partnerName, city }: GroupInquiryFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<InquiryType>("kindergeburtstag");
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    preferredDate: "",
    alternativeDate: "",
    groupSize: "",
    childrenAge: "",
    schoolName: "",
    className: "",
    companyName: "",
    department: "",
    eventGoal: "",
    budget: "",
    message: "",
    cateringWished: false,
    specialRequests: "",
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/group-inquiry", {
        partnerId,
        partnerName,
        inquiryType: activeTab,
        ...formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Fehler beim Senden");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setSubmitted(true);
      toast({ title: "Anfrage gesendet!", description: data.message });
    },
    onError: (error: Error) => {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contactName || !formData.contactEmail || !formData.groupSize) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie Name, E-Mail und Gruppengröße aus.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate();
  };

  const tabLabel = activeTab === "kindergeburtstag" ? "Kindergeburtstag" : activeTab === "schulklasse" ? "Schulklasse" : "Firmenevent";

  if (submitted) {
    return (
      <div className="py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-12 border border-green-100 shadow-lg shadow-green-500/5">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Anfrage erfolgreich gesendet!</h3>
            <p className="text-gray-600 mb-2">
              Ihre {tabLabel}-Anfrage wurde an <strong>{partnerName}</strong> weitergeleitet.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Der Partner wird sich innerhalb von 24-48 Stunden bei Ihnen melden.
            </p>
            <div className="bg-white rounded-xl p-4 border border-green-100 text-left max-w-sm mx-auto">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Anfrage:</span>
                  <span className="font-medium">{tabLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gruppengröße:</span>
                  <span className="font-medium">{formData.groupSize} Personen</span>
                </div>
                {formData.preferredDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Wunschtermin:</span>
                    <span className="font-medium">{new Date(formData.preferredDate).toLocaleDateString("de-DE")}</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  contactName: "", contactEmail: "", contactPhone: "",
                  preferredDate: "", alternativeDate: "", groupSize: "",
                  childrenAge: "", schoolName: "", className: "",
                  companyName: "", department: "", eventGoal: "", budget: "",
                  message: "", cateringWished: false, specialRequests: "",
                });
              }}
            >
              Weitere Anfrage senden
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const gradientClass =
    activeTab === "kindergeburtstag"
      ? "from-pink-500 to-purple-500"
      : activeTab === "schulklasse"
        ? "from-blue-500 to-indigo-500"
        : "from-emerald-500 to-teal-500";

  const hoverGradientClass =
    activeTab === "kindergeburtstag"
      ? "hover:from-pink-600 hover:to-purple-600"
      : activeTab === "schulklasse"
        ? "hover:from-blue-600 hover:to-indigo-600"
        : "hover:from-emerald-600 hover:to-teal-600";

  const shadowClass =
    activeTab === "kindergeburtstag"
      ? "shadow-pink-500/20"
      : activeTab === "schulklasse"
        ? "shadow-blue-500/20"
        : "shadow-emerald-500/20";

  const cardShadowClass =
    activeTab === "kindergeburtstag"
      ? "shadow-pink-500/5"
      : activeTab === "schulklasse"
        ? "shadow-blue-500/5"
        : "shadow-emerald-500/5";

  const accentBg =
    activeTab === "kindergeburtstag"
      ? "bg-pink-50/50 border-pink-100"
      : activeTab === "schulklasse"
        ? "bg-blue-50/50 border-blue-100"
        : "bg-emerald-50/50 border-emerald-100";

  const accentIconColor =
    activeTab === "kindergeburtstag"
      ? "text-pink-600"
      : activeTab === "schulklasse"
        ? "text-blue-600"
        : "text-emerald-600";

  const topBarGradient =
    activeTab === "kindergeburtstag"
      ? "bg-gradient-to-r from-pink-400 to-purple-500"
      : activeTab === "schulklasse"
        ? "bg-gradient-to-r from-blue-400 to-indigo-500"
        : "bg-gradient-to-r from-emerald-400 to-teal-500";

  return (
    <div className="bg-gradient-to-b from-white to-purple-50/30 py-16">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <Sparkles className="h-4 w-4" />
            Gruppenanfragen
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
            Ihr nächstes Event bei {partnerName} planen
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Senden Sie eine unverbindliche Anfrage und erhalten Sie ein individuelles Angebot für Ihre Gruppe.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => setActiveTab("kindergeburtstag")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 text-sm md:text-base ${
              activeTab === "kindergeburtstag"
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/20 scale-[1.02]"
                : "bg-white text-gray-600 border border-gray-200 hover:border-purple-200 hover:bg-purple-50"
            }`}
          >
            <PartyPopper className="h-4 w-4 md:h-5 md:w-5" />
            Kindergeburtstag
          </button>
          <button
            onClick={() => setActiveTab("schulklasse")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 text-sm md:text-base ${
              activeTab === "schulklasse"
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]"
                : "bg-white text-gray-600 border border-gray-200 hover:border-blue-200 hover:bg-blue-50"
            }`}
          >
            <GraduationCap className="h-4 w-4 md:h-5 md:w-5" />
            Schulklasse
          </button>
          <button
            onClick={() => setActiveTab("firmenevent")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 text-sm md:text-base ${
              activeTab === "firmenevent"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]"
                : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50"
            }`}
          >
            <Building2 className="h-4 w-4 md:h-5 md:w-5" />
            Firmenevent / Teamevent
          </button>
        </div>

        <Card className={`border-0 shadow-xl overflow-hidden ${cardShadowClass}`}>
          <div className={`h-1.5 ${topBarGradient}`} />

          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={`p-4 rounded-xl border ${accentBg}`}>
                <div className="flex items-center gap-3 mb-1">
                  {activeTab === "kindergeburtstag" ? (
                    <Cake className={`h-5 w-5 ${accentIconColor}`} />
                  ) : activeTab === "schulklasse" ? (
                    <School className={`h-5 w-5 ${accentIconColor}`} />
                  ) : (
                    <Briefcase className={`h-5 w-5 ${accentIconColor}`} />
                  )}
                  <h3 className="font-bold text-gray-900">
                    {activeTab === "kindergeburtstag"
                      ? "Kindergeburtstag anfragen"
                      : activeTab === "schulklasse"
                        ? "Schulklassen-Ausflug anfragen"
                        : "Firmenevent / Teamevent anfragen"}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 ml-8">
                  {activeTab === "kindergeburtstag"
                    ? "Feiern Sie den perfekten Kindergeburtstag bei " + partnerName
                    : activeTab === "schulklasse"
                      ? "Planen Sie einen unvergesslichen Ausflug für Ihre Schulklasse bei " + partnerName
                      : "Stärken Sie Ihr Team mit einem unvergesslichen Event bei " + partnerName}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    Ansprechpartner *
                  </Label>
                  <Input
                    value={formData.contactName}
                    onChange={(e) => updateField("contactName", e.target.value)}
                    placeholder={
                      activeTab === "kindergeburtstag"
                        ? "Name des Elternteils"
                        : activeTab === "schulklasse"
                          ? "Name der Lehrkraft"
                          : "Vor- und Nachname"
                    }
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    E-Mail-Adresse *
                  </Label>
                  <Input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => updateField("contactEmail", e.target.value)}
                    placeholder="ihre@email.de"
                    className="mt-1.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    Telefonnummer
                  </Label>
                  <Input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => updateField("contactPhone", e.target.value)}
                    placeholder="01XX / XXXXXXX"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    {activeTab === "kindergeburtstag"
                      ? "Anzahl Kinder *"
                      : activeTab === "schulklasse"
                        ? "Gruppengröße *"
                        : "Teamgröße *"}
                  </Label>
                  <Select value={formData.groupSize} onValueChange={(v) => updateField("groupSize", v)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder={
                        activeTab === "kindergeburtstag"
                          ? "Wie viele Kinder?"
                          : activeTab === "schulklasse"
                            ? "Wie viele Schüler?"
                            : "Wie viele Teilnehmer?"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {activeTab === "kindergeburtstag" ? (
                        <>
                          <SelectItem value="5-8">5 - 8 Kinder</SelectItem>
                          <SelectItem value="9-12">9 - 12 Kinder</SelectItem>
                          <SelectItem value="13-15">13 - 15 Kinder</SelectItem>
                          <SelectItem value="16-20">16 - 20 Kinder</SelectItem>
                          <SelectItem value="20+">Mehr als 20 Kinder</SelectItem>
                        </>
                      ) : activeTab === "schulklasse" ? (
                        <>
                          <SelectItem value="10-15">10 - 15 Schüler</SelectItem>
                          <SelectItem value="16-20">16 - 20 Schüler</SelectItem>
                          <SelectItem value="21-25">21 - 25 Schüler</SelectItem>
                          <SelectItem value="26-30">26 - 30 Schüler</SelectItem>
                          <SelectItem value="30+">Mehr als 30 Schüler</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="5-10">5 - 10 Teilnehmer</SelectItem>
                          <SelectItem value="11-20">11 - 20 Teilnehmer</SelectItem>
                          <SelectItem value="21-30">21 - 30 Teilnehmer</SelectItem>
                          <SelectItem value="31-50">31 - 50 Teilnehmer</SelectItem>
                          <SelectItem value="51-100">51 - 100 Teilnehmer</SelectItem>
                          <SelectItem value="100+">Mehr als 100 Teilnehmer</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    Wunschtermin
                  </Label>
                  <Input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => updateField("preferredDate", e.target.value)}
                    className="mt-1.5"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    Alternativtermin
                  </Label>
                  <Input
                    type="date"
                    value={formData.alternativeDate}
                    onChange={(e) => updateField("alternativeDate", e.target.value)}
                    className="mt-1.5"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {activeTab === "kindergeburtstag" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <Baby className="h-3.5 w-3.5 text-gray-400" />
                      Alter des Geburtstagskindes
                    </Label>
                    <Select value={formData.childrenAge} onValueChange={(v) => updateField("childrenAge", v)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Alter auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 14 }, (_, i) => i + 3).map((age) => (
                          <SelectItem key={age} value={age.toString()}>
                            {age} Jahre
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100 mt-auto">
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="h-4 w-4 text-amber-600" />
                      <div>
                        <Label className="text-sm font-medium">Verpflegung gewünscht?</Label>
                        <p className="text-xs text-gray-500">Kuchen, Getränke, Snacks</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.cateringWished}
                      onCheckedChange={(v) => updateField("cateringWished", v)}
                    />
                  </div>
                </div>
              )}

              {activeTab === "schulklasse" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <School className="h-3.5 w-3.5 text-gray-400" />
                      Schule
                    </Label>
                    <Input
                      value={formData.schoolName}
                      onChange={(e) => updateField("schoolName", e.target.value)}
                      placeholder="Name der Schule"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
                      Klasse / Jahrgang
                    </Label>
                    <Input
                      value={formData.className}
                      onChange={(e) => updateField("className", e.target.value)}
                      placeholder="z.B. 4a, Jahrgang 7"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              )}

              {activeTab === "firmenevent" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        Firmenname *
                      </Label>
                      <Input
                        value={formData.companyName}
                        onChange={(e) => updateField("companyName", e.target.value)}
                        placeholder="Name des Unternehmens"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                        Abteilung
                      </Label>
                      <Input
                        value={formData.department}
                        onChange={(e) => updateField("department", e.target.value)}
                        placeholder="z.B. Marketing, Vertrieb, gesamtes Team"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-gray-400" />
                        Anlass / Ziel des Events
                      </Label>
                      <Select value={formData.eventGoal} onValueChange={(v) => updateField("eventGoal", v)}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Was ist der Anlass?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="teambuilding">Teambuilding</SelectItem>
                          <SelectItem value="firmenevent">Firmenevent / Betriebsfeier</SelectItem>
                          <SelectItem value="incentive">Incentive / Belohnung</SelectItem>
                          <SelectItem value="weihnachtsfeier">Weihnachtsfeier</SelectItem>
                          <SelectItem value="sommerfest">Sommerfest</SelectItem>
                          <SelectItem value="kick-off">Kick-Off / Projektstart</SelectItem>
                          <SelectItem value="jubilaeum">Firmenjubiläum</SelectItem>
                          <SelectItem value="kundenveranstaltung">Kundenveranstaltung</SelectItem>
                          <SelectItem value="jga">JGA / Junggesellenabschied</SelectItem>
                          <SelectItem value="sonstiges">Sonstiges</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100 mt-auto">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-4 w-4 text-emerald-600" />
                        <div>
                          <Label className="text-sm font-medium">Catering gewünscht?</Label>
                          <p className="text-xs text-gray-500">Buffet, Getränke, Snacks</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.cateringWished}
                        onCheckedChange={(v) => updateField("cateringWished", v)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                  Nachricht / besondere Wünsche
                </Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  placeholder={
                    activeTab === "kindergeburtstag"
                      ? "z.B. Das Geburtstagskind liebt Dinosaurier, wir brauchen vegetarisches Essen, bevorzugte Uhrzeit..."
                      : activeTab === "schulklasse"
                        ? "z.B. Wir benötigen einen pädagogischen Rahmen, besondere Allergien, Anreise mit dem Bus..."
                        : "z.B. Wir suchen ein Event für unser 20-köpfiges Team, gerne mit Wettbewerbscharakter, Getränke inklusive..."
                  }
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-xs text-gray-400 max-w-sm">
                  Ihre Daten werden nur für die Bearbeitung dieser Anfrage verwendet und vertraulich behandelt.
                </p>
                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className={`px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 bg-gradient-to-r ${gradientClass} ${hoverGradientClass} ${shadowClass}`}
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Unverbindlich anfragen
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Kostenlos & unverbindlich</p>
              <p className="text-xs text-gray-500">Keine versteckten Kosten</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Schnelle Antwort</p>
              <p className="text-xs text-gray-500">Innerhalb von 24-48 Stunden</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Individuelles Angebot</p>
              <p className="text-xs text-gray-500">Maßgeschneidert für Ihre Gruppe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
