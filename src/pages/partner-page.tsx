import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Check, ArrowRight, Star, TrendingUp, Shield, Zap, BarChart3, 
  Globe, Users, CreditCard, Headphones, Clock, MapPin, ChevronDown,
  Sparkles, Target, Award, Building2, Phone, Mail, BadgeCheck,
  Waves, Film, TreePine, Gamepad2, Dumbbell, UtensilsCrossed,
  Palette, Music, Camera, Mountain, Bike, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/partner/queryClient";
import { insertPartnerSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const partnerFormSchema = insertPartnerSchema.extend({
  phone: z.string().optional(),
  website: z.string().optional(),
  category: z.string().min(1, "Bitte wähle eine Kategorie"),
  city: z.string().min(1, "Bitte gib deine Stadt an"),
  terms: z.boolean().refine((val) => val === true, {
    message: "Du musst den AGB zustimmen",
  }),
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

const CATEGORIES = [
  { value: "schwimmen", label: "Schwimmbad & Wellness", icon: Waves },
  { value: "kino", label: "Kino & Film", icon: Film },
  { value: "zoo", label: "Zoo & Tierpark", icon: TreePine },
  { value: "bowling", label: "Bowling & Kegeln", icon: Target },
  { value: "escape-room", label: "Escape Room", icon: Gamepad2 },
  { value: "minigolf", label: "Minigolf", icon: Target },
  { value: "trampolin", label: "Trampolinpark", icon: Zap },
  { value: "klettern", label: "Klettern & Bouldern", icon: Mountain },
  { value: "lasertag", label: "Lasertag", icon: Target },
  { value: "fitness", label: "Fitness & Sport", icon: Dumbbell },
  { value: "gastronomie", label: "Gastronomie & Kulinarik", icon: UtensilsCrossed },
  { value: "kunst", label: "Kunst & Kultur", icon: Palette },
  { value: "musik", label: "Konzerte & Events", icon: Music },
  { value: "outdoor", label: "Outdoor & Natur", icon: Bike },
  { value: "fotografie", label: "Fotografie & Erlebnisse", icon: Camera },
  { value: "sonstiges", label: "Sonstiges", icon: Sparkles },
];

const STEPS = [
  { 
    step: "01", 
    title: "Registriere dich", 
    description: "Fülle das Formular aus und erzähle uns von deinem Erlebnis. Kostenlos und unverbindlich.",
    icon: Building2 
  },
  { 
    step: "02", 
    title: "Wir richten alles ein", 
    description: "Unser Team erstellt deinen professionellen Shop mit Bildern, Preisen und Buchungssystem.",
    icon: Sparkles 
  },
  { 
    step: "03", 
    title: "Empfange Buchungen", 
    description: "Kunden finden und buchen dein Erlebnis. Du erhältst Benachrichtigungen und Auszahlungen automatisch.",
    icon: CreditCard 
  },
];

const BENEFITS = [
  { icon: Globe, title: "Maximale Reichweite", description: "Tausende Nutzer entdecken täglich neue Erlebnisse auf FreizeitEngel. Dein Angebot wird sofort sichtbar." },
  { icon: CreditCard, title: "Automatische Zahlungen", description: "Stripe Connect wickelt Zahlungen ab — 89% landen direkt auf deinem Konto, ohne Aufwand." },
  { icon: BarChart3, title: "Eigenes Dashboard", description: "Verwalte Buchungen, sieh Umsätze ein und optimiere deine Angebote in Echtzeit." },
  { icon: Shield, title: "Keine Vorabkosten", description: "Null Grundgebühr, null Setup-Kosten. Du zahlst nur eine faire Provision pro erfolgreicher Buchung." },
  { icon: Headphones, title: "Persönlicher Support", description: "Unser Partner-Team hilft dir beim Onboarding und steht dir jederzeit zur Seite." },
  { icon: Zap, title: "QR-Code Tickets", description: "Automatische QR-Code-Tickets per E-Mail — professionell und papierlos für deine Kunden." },
];

const STATS = [
  { value: "50+", label: "Kategorien" },
  { value: "500+", label: "Partner" },
  { value: "89%", label: "Auszahlung" },
  { value: "48h", label: "Freischaltung" },
];

const TESTIMONIALS = [
  { name: "Marco K.", role: "Betreiber Trampolinpark", text: "Seit wir auf FreizeitEngel sind, haben wir 30% mehr Buchungen. Das Dashboard ist super übersichtlich.", rating: 5 },
  { name: "Sandra L.", role: "Escape Room Inhaberin", text: "Endlich eine Plattform, die unsere Buchungen automatisch abwickelt. Wir können uns auf das Wesentliche konzentrieren.", rating: 5 },
  { name: "Thomas B.", role: "Minigolf-Anlage", text: "Die Zusammenarbeit ist fair und transparent. Keine versteckten Kosten, toller Support.", rating: 5 },
];

const FAQ_ITEMS = [
  { q: "Was kostet die Partnerschaft?", a: "Die Registrierung und Nutzung ist komplett kostenlos. Wir berechnen lediglich 11% Provision auf erfolgreiche Buchungen. Keine Grundgebühr, keine Setup-Kosten, keine versteckten Gebühren." },
  { q: "Wie funktioniert die Bezahlung?", a: "Kunden bezahlen sicher über Stripe. 89% des Buchungsbetrags werden automatisch auf dein Stripe-Connect-Konto überwiesen. Auszahlungen erfolgen regelmäßig auf dein Bankkonto." },
  { q: "Wie schnell werde ich freigeschaltet?", a: "Nach Eingang deiner Bewerbung prüfen wir deine Daten innerhalb von 48 Stunden. Anschließend richten wir deinen Shop ein und du kannst sofort Buchungen empfangen." },
  { q: "Kann ich mehrere Erlebnisse anbieten?", a: "Ja, du kannst beliebig viele Erlebnisse, Tickets und Preiskategorien anlegen. Jedes Angebot kann individuell konfiguriert werden — mit eigenen Bildern, Beschreibungen und Preisen." },
  { q: "Brauche ich technische Kenntnisse?", a: "Nein. Wir kümmern uns um die komplette technische Einrichtung. Du brauchst nur deine Angebotsinformationen und Bilder — den Rest erledigen wir." },
  { q: "Welche Erlebnisse kann ich anbieten?", a: "Alle legalen Freizeitaktivitäten in Deutschland. Von Schwimmbädern über Escape Rooms bis hin zu Outdoor-Abenteuern — über 50 Kategorien stehen zur Verfügung." },
];

export default function PartnerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: categories } = useQuery<any[]>({ queryKey: ['/api/categories'] });

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      companyName: "",
      contactPerson: user?.fullName || "",
      email: user?.email || "",
      phone: "",
      website: "",
      location: "",
      city: "",
      category: "",
      description: "",
      terms: false,
    },
  });

  const partnerMutation = useMutation({
    mutationFn: async (formData: PartnerFormValues) => {
      const { terms, website, phone, category, city, ...partnerData } = formData;
      const res = await apiRequest("POST", "/api/partners", {
        ...partnerData,
        city,
        category,
      });
      return await res.json();
    },
    onSuccess: () => {
      setApplicationSubmitted(true);
      toast({ title: "Bewerbung erfolgreich gesendet!", description: "Wir melden uns innerhalb von 48 Stunden bei dir." });
    },
    onError: (error: Error) => {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    },
  });

  const scrollToForm = () => {
    document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (applicationSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center px-4">
        <Card className="max-w-lg w-full shadow-2xl border-0">
          <CardContent className="pt-10 pb-10 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bewerbung erhalten!</h1>
            <p className="text-gray-600 mb-8">
              Vielen Dank für dein Interesse an einer Partnerschaft mit FreizeitEngel. Unser Team wird sich innerhalb von 48 Stunden bei dir melden.
            </p>
            <div className="bg-purple-50 rounded-xl p-5 mb-8 text-left">
              <h3 className="font-semibold text-sm text-purple-900 mb-3">Nächste Schritte:</h3>
              <div className="space-y-3">
                {["Prüfung deiner Bewerbung (1-2 Werktage)", "Persönliches Onboarding-Gespräch", "Einrichtung deines Partner-Shops", "Erste Buchungen empfangen"].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setLocation("/")} variant="outline" className="flex-1">
                Zur Startseite
              </Button>
              <Button onClick={() => window.location.href = "mailto:partner@freizeitengel.com"} className="flex-1 bg-purple-700 hover:bg-purple-800">
                <Mail className="h-4 w-4 mr-2" /> Kontakt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-sm">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span>Deutschlands Marktplatz für Freizeiterlebnisse</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                Biete dein Erlebnis<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">tausenden Kunden</span> an
              </h1>
              <p className="text-lg md:text-xl text-purple-200 mb-8 max-w-xl leading-relaxed">
                Registriere dein Freizeitangebot auf FreizeitEngel und empfange automatisch Buchungen. Keine Vorabkosten — du zahlst nur bei Erfolg.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={scrollToForm} size="lg" className="bg-white text-purple-900 hover:bg-purple-50 font-bold text-base px-8 py-6 rounded-xl shadow-xl">
                  Jetzt kostenlos bewerben <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-medium text-base px-8 py-6 rounded-xl">
                  So funktioniert's
                </Button>
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
                  <div className="text-3xl font-black mb-1">{stat.value}</div>
                  <div className="text-purple-300 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <div className="lg:hidden max-w-7xl mx-auto px-4 -mt-8 relative z-10 mb-12">
        <div className="grid grid-cols-4 gap-2">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white shadow-lg rounded-xl p-3 text-center border">
              <div className="text-xl font-black text-purple-800">{stat.value}</div>
              <div className="text-gray-500 text-[10px]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">In 3 Schritten zum Erfolg</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Von der Registrierung bis zur ersten Buchung — wir machen es dir so einfach wie möglich.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.step} className="relative group">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-100 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="text-5xl font-black text-purple-200 mb-4">{step.step}</div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-purple-700" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-purple-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Warum FreizeitEngel?</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Alles was du brauchst, um dein Freizeitangebot erfolgreich online zu vermarkten.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300">
                <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="h-5 w-5 text-purple-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Über 50 Kategorien</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Egal welches Erlebnis du anbietest — bei uns findest du die passende Kategorie.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CATEGORIES.slice(0, 12).map((cat) => (
              <div key={cat.value} className="bg-purple-50 hover:bg-purple-100 rounded-xl p-4 text-center transition-colors cursor-default border border-purple-100">
                <cat.icon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <span className="text-xs font-medium text-gray-700">{cat.label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-6">...und viele weitere Kategorien wie Kartbahn, Tennis, Padel, Golf, Sauna, Gaming und mehr</p>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Das sagen unsere Partner</h2>
            <p className="text-lg text-purple-300">Echte Erfahrungen von echten Partnern</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-purple-100 mb-4 text-sm leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">{t.name.charAt(0)}</div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-purple-300 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 grid md:grid-cols-3 gap-8 items-center border border-purple-100">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Transparentes Provisions-Modell</h3>
              <p className="text-gray-600 mb-4">Keine Grundgebühr, kein Risiko. Du zahlst nur bei erfolgreichen Buchungen über FreizeitEngel.</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium flex items-center gap-1"><Check className="h-3 w-3" /> Keine Setup-Kosten</span>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium flex items-center gap-1"><Check className="h-3 w-3" /> Keine Grundgebühr</span>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium flex items-center gap-1"><Check className="h-3 w-3" /> Jederzeit kündbar</span>
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white">
              <div className="text-sm text-purple-200 mb-1">Provision pro Buchung</div>
              <div className="text-5xl font-black">11%</div>
              <div className="text-sm text-purple-200 mt-1">zzgl. MwSt.</div>
              <div className="text-xs text-purple-300 mt-3">89% für dich</div>
            </div>
          </div>
        </div>
      </section>

      <section id="partner-form" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-1.5 mb-4 text-sm text-purple-700 font-medium">
              <BadgeCheck className="h-4 w-4" /> Kostenlose Registrierung
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Jetzt Partner werden</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Fülle das Formular aus und wir melden uns innerhalb von 48 Stunden bei dir.</p>
          </div>

          <Card className="shadow-xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 to-purple-800 p-4 text-white text-center text-sm font-medium">
              Bereits über 500 Partner vertrauen FreizeitEngel
            </div>
            <CardContent className="p-6 md:p-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => partnerMutation.mutate(data))} className="space-y-8">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-purple-600" /> Unternehmensdaten
                    </h3>
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="companyName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unternehmensname *</FormLabel>
                          <FormControl><Input placeholder="z.B. Adventure Minigolf Bochum" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategorie *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Kategorie wählen" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORIES.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-5 mt-5">
                      <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stadt *</FormLabel>
                          <FormControl><Input placeholder="z.B. Bochum" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse</FormLabel>
                          <FormControl><Input placeholder="Straße und Hausnummer" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="mt-5">
                      <FormField control={form.control} name="website" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl><Input placeholder="https://www.deine-website.de" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="border-t pt-8">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" /> Kontaktdaten
                    </h3>
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="contactPerson" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ansprechpartner *</FormLabel>
                          <FormControl><Input placeholder="Vor- und Nachname" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-Mail *</FormLabel>
                          <FormControl><Input type="email" placeholder="partner@beispiel.de" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="mt-5">
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl><Input placeholder="+49 123 456789" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="border-t pt-8">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" /> Dein Erlebnis
                    </h3>
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beschreibung deines Angebots *</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={5}
                            placeholder="Beschreibe kurz, welche Erlebnisse du anbietest, was sie besonders macht und für wen sie geeignet sind..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="border-t pt-6">
                    <FormField control={form.control} name="terms" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="leading-none">
                          <FormLabel className="text-sm font-normal text-gray-600">
                            Ich stimme den <a href="/agb" className="text-purple-600 hover:underline">AGB</a> und <a href="/datenschutz" className="text-purple-600 hover:underline">Datenschutzbestimmungen</a> zu und bin einverstanden, von FreizeitEngel kontaktiert zu werden. *
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )} />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-base py-6 rounded-xl shadow-lg"
                    disabled={partnerMutation.isPending}
                  >
                    {partnerMutation.isPending ? "Wird gesendet..." : "Kostenlos bewerben"}
                    {!partnerMutation.isPending && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    * Pflichtfelder · Keine Kosten · Keine Verpflichtung
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Häufige Fragen</h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Bereit, durchzustarten?</h2>
          <p className="text-lg text-purple-200 mb-8 max-w-2xl mx-auto">
            Werde Teil von FreizeitEngel und erreiche tausende neue Kunden. Kostenlos, fair und einfach.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={scrollToForm} size="lg" className="bg-white text-purple-900 hover:bg-purple-50 font-bold text-base px-8 py-6 rounded-xl">
              Jetzt Partner werden <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button onClick={() => window.location.href = "mailto:partner@freizeitengel.com"} size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base px-8 py-6 rounded-xl">
              <Phone className="mr-2 h-5 w-5" /> Kontakt aufnehmen
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
