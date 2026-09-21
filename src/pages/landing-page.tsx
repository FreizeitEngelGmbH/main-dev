import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowDownRight, ArrowRight, BadgeCheck, Building2, Check, Compass,
  LogIn, Mail, MapPin, MoveUpRight, ShieldCheck, Sparkles, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoPath from "@assets/email-logo.png";
import swimmingImage from "@assets/stock_images/swimming_pool_indoor_03fbcff5.jpg";
import bowlingImage from "@assets/stock_images/bowling_familie.jpg";
import escapeRoomImage from "@assets/generated_images/mission60minutes_escape_room.png";

const newsletterSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
});
const partnerSchema = z.object({
  companyName: z.string().min(2, "Bitte gib den Unternehmensnamen ein."),
  contactPerson: z.string().min(2, "Bitte gib einen Ansprechpartner ein."),
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
  phone: z.string().optional(),
  city: z.string().min(2, "Bitte gib deinen Standort ein."),
  category: z.string().min(1, "Bitte wähle eine Kategorie."),
  description: z.string().min(10, "Erzähl uns bitte kurz von deinem Angebot."),
  terms: z.boolean().refine(Boolean, "Bitte stimme den Bedingungen zu."),
});
type NewsletterValues = z.infer<typeof newsletterSchema>;
type PartnerValues = z.infer<typeof partnerSchema>;
const categories = ["Action & Abenteuer", "Bowling & Kegeln", "Kino & Kultur", "Outdoor & Natur", "Schwimmen & Wellness", "Sport & Fitness", "Sonstiges"];
const activityPreviews = [
  { name: "Schwimmen", image: swimmingImage, label: "Gemeinsam abtauchen", description: "Badespaß für die ganze Familie" },
  { name: "Bowling", image: bowlingImage, label: "Gemeinsam jubeln", description: "Ein Abend voller guter Würfe" },
  { name: "Escape Room", image: escapeRoomImage, label: "Gemeinsam rätseln", description: "Spannung, Teamgeist und Abenteuer" },
];

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node?.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add("is-visible");
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`editorial-reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function NewsletterForm({ done, onSubmit, pending }: { done: boolean; onSubmit: (values: NewsletterValues) => void; pending: boolean }) {
  const form = useForm<NewsletterValues>({ resolver: zodResolver(newsletterSchema), defaultValues: { name: "", email: "" } });
  if (done) return <div className="py-7 text-center" role="status"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#d8f1ef]"><Check className="h-6 w-6 text-[#176b68]" /></div><h3 className="mt-4 font-display text-2xl font-bold text-[#211735]">Du bist vorgemerkt.</h3><p className="mt-2 text-sm text-[#756b88]">Wir melden uns, sobald dein erstes freies Wochenende gefunden werden kann.</p></div>;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-3">
        <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormControl><Input {...field} placeholder="Dein Name (optional)" className="h-12 rounded-none border-0 border-b border-[#cfc2e5] bg-transparent px-0 text-[#211735] placeholder:text-[#8e84a2] focus-visible:ring-0" /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormControl><Input {...field} type="email" placeholder="deine@email.de" className="h-12 rounded-none border-0 border-b border-[#cfc2e5] bg-transparent px-0 text-[#211735] placeholder:text-[#8e84a2] focus-visible:ring-0" /></FormControl><FormMessage /></FormItem>} />
        <Button disabled={pending} className="mt-3 h-12 w-full rounded-none bg-[#6d28d9] text-sm font-bold text-[#fffaff] shadow-[4px_4px_0_#5520ad] hover:bg-[#5b1fba]">{pending ? "Wird eingetragen …" : <>Zum Start benachrichtigen <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
      </form>
    </Form>
  );
}

export default function LandingPage() {
  const { toast } = useToast();
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [partnerDone, setPartnerDone] = useState(false);
  const [activeActivity, setActiveActivity] = useState(0);
  const newsletterMutation = useMutation({
    mutationFn: async (data: NewsletterValues) => (await apiRequest("POST", "/api/newsletter/signup", data)).json(),
    onSuccess: () => setNewsletterDone(true),
    onError: (error: Error) => toast({ title: "Anmeldung nicht möglich", description: error.message, variant: "destructive" }),
  });
  const partnerMutation = useMutation({
    mutationFn: async ({ terms: _terms, category, city, phone, ...data }: PartnerValues) => (await apiRequest("POST", "/api/partners", { ...data, category, city, phone, location: city, website: "" })).json(),
    onSuccess: () => { setPartnerDone(true); toast({ title: "Vielen Dank!", description: "Wir melden uns persönlich bei dir." }); },
    onError: (error: Error) => toast({ title: "Bewerbung nicht möglich", description: error.message, variant: "destructive" }),
  });
  const partnerForm = useForm<PartnerValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: { companyName: "", contactPerson: "", email: "", phone: "", city: "", category: "", description: "", terms: false },
  });
  const scrollToPartner = () => document.getElementById("partner-werden")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="freizeit-page min-h-[100dvh] overflow-hidden bg-[#fbf9ff] text-[#211735]">
      <style>{`
        .freizeit-page { --ink:#211735; --coral:#6d28d9; --sage:#e5ddff; --cream:#fbf9ff; --deep:#34115f; font-family: "DM Sans", sans-serif; }
        .freizeit-page .font-display { font-family: "Fraunces", Georgia, serif; }
        .editorial-reveal { opacity:0; transform:translateY(28px); transition:opacity .75s ease, transform .75s cubic-bezier(.22,1,.36,1); }
        .editorial-reveal.is-visible { opacity:1; transform:none; }
        @media (prefers-reduced-motion: reduce) { .editorial-reveal { opacity:1; transform:none; transition:none; } html { scroll-behavior:auto !important; } }
        @keyframes drift { 0%,100% { transform:translateY(0) rotate(-2deg); } 50% { transform:translateY(-10px) rotate(2deg); } }
        .drift { animation:drift 7s ease-in-out infinite; }
        .freizeit-card { background:#eee9ff; }
        .freizeit-card:nth-child(2n) { background:#e2d7ff; }
        .freizeit-card:hover { background:#d5c4ff; }
        @media (prefers-reduced-motion: reduce) { .drift { animation:none; } }
      `}</style>

      <header className="relative z-20 mx-auto flex max-w-[1440px] items-center justify-between bg-white px-5 py-5 md:px-10 md:py-7">
        <a href="/landing" aria-label="FreizeitEngel Startseite" className="bg-[#fffaff] px-3 py-2 shadow-[5px_5px_0_#d8c9ef]"><img src={logoPath} alt="FreizeitEngel" className="h-12 w-auto md:h-14" /></a>
        <nav className="hidden items-center gap-8 text-xs font-bold uppercase tracking-[.16em] text-[#514767] md:flex">
          <a href="#entdecken" className="transition-colors hover:text-[#6d28d9]">Für Entdecker</a>
          <a href="#partner-werden" className="transition-colors hover:text-[#6d28d9]">Für Anbieter</a>
          <button onClick={scrollToPartner} className="border-b-2 border-[#6d28d9] pb-1 text-[#211735]">Dabei sein <ArrowDownRight className="ml-1 inline h-3 w-3" /></button>
          <Link href="/auth" className="border-2 border-[#34115f] px-4 py-2.5 text-[#34115f] transition-colors hover:bg-[#34115f] hover:text-[#fffaff]">Anmelden</Link>
        </nav>
        <div className="flex items-center gap-4 md:hidden">
          <button onClick={scrollToPartner} className="text-xs font-bold uppercase tracking-[.12em] text-[#211735]">Partner werden <ArrowRight className="ml-1 inline h-4 w-4" /></button>
          <Link href="/auth" aria-label="Anmelden" title="Anmelden" className="inline-flex items-center border-2 border-[#34115f] px-2.5 py-2 text-xs font-bold uppercase tracking-[.12em] text-[#34115f]"><LogIn className="h-4 w-4 sm:hidden" /><span className="hidden sm:inline sm:px-0.5">Anmelden</span></Link>
        </div>
      </header>

      <section className="border-y border-[#ddd1ef] bg-[#f2ecff] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <Reveal><div className="max-w-md"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#6d28d9]">Coming soon</p><h2 className="font-display mt-4 text-5xl leading-[.95] md:text-7xl">Dein nächstes<br /><span className="text-[#6d28d9]">Lieblingsding.</span></h2><p className="mt-6 text-base leading-7 text-[#514767]">Wir starten regional und wachsen mit den Menschen, die Lust auf ihre Umgebung haben. Trag dich ein — dann weißt du als Erste:r, wann es losgeht.</p></div></Reveal>
          <Reveal delay={120}><div className="bg-[#fffaff] p-7 shadow-[8px_8px_0_#e5ddff] md:p-10"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#6d28d9]">Auf die Liste</p><h3 className="font-display mt-2 text-3xl">Sei beim Start dabei.</h3></div><Mail className="h-6 w-6 text-[#6d28d9]" /></div><NewsletterForm done={newsletterDone} onSubmit={(data) => newsletterMutation.mutate(data)} pending={newsletterMutation.isPending} /><p className="mt-4 text-xs text-[#8e84a2]">Kein Spam. Nur gute Neuigkeiten zum Start.</p></div></Reveal>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-[1440px] gap-12 px-5 pb-24 pt-10 md:px-10 md:pb-32 md:pt-20 lg:grid-cols-[1.06fr_.94fr] lg:items-center">
        <div className="relative z-10">
           <p className="mb-8 flex items-center gap-3 text-xs font-bold uppercase tracking-[.22em] text-[#6d28d9]"><span className="h-px w-10 bg-[#6d28d9]" />Ein neuer Blick auf deine Region</p>
           <h1 className="font-display max-w-4xl text-[clamp(3.8rem,8vw,8.4rem)] font-semibold leading-[.88] tracking-[-.065em] text-[#211735]">Freizeit<br /><em className="font-display text-[#6d28d9]">entdecken.</em><br /><span className="ml-[12%]">Lokal erleben.</span></h1>
           <p className="mt-10 max-w-lg text-lg leading-relaxed text-[#514767] md:text-xl">Dein Online-Marktplatz für lokale Freizeitaktivitäten.</p>
           <p className="mt-4 max-w-md text-sm leading-6 text-[#756b88]">Für die Tage, an denen noch nichts im Kalender steht. Finde schöne Dinge in deiner Nähe, die du sonst vielleicht verpasst hättest.</p>
          <div className="mt-10 flex flex-wrap gap-4">
             <a href="#entdecken" className="inline-flex items-center bg-[#34115f] px-6 py-4 text-sm font-bold text-[#fffaff] transition-transform hover:-translate-y-1">Was kommt in deiner Nähe? <ArrowRight className="ml-3 h-4 w-4" /></a>
             <button onClick={scrollToPartner} className="inline-flex items-center border-b border-[#34115f] px-2 py-4 text-sm font-bold text-[#34115f]">Als Anbieter mitmachen <MoveUpRight className="ml-2 h-4 w-4" /></button>
          </div>
        </div>
        <div className="relative min-h-[520px] md:min-h-[580px]">
          <div className="absolute right-0 top-0 h-[88%] w-[86%] bg-[#e5ddff]" />
          <div className="absolute left-0 top-10 z-10 h-[72%] w-[78%] overflow-hidden bg-[#34115f] shadow-[12px_12px_0_#6d28d9]">
            {activityPreviews.map((activity, index) => (
              <img
                key={activity.name}
                src={activity.image}
                alt={`${activity.name}: ${activity.description}`}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${activeActivity === index ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#211735]/90 via-transparent to-[#211735]/10" />
            <div className="absolute bottom-7 left-7 text-white">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#77d5dc]">{activityPreviews[activeActivity].name}</p>
              <p className="font-display mt-2 text-4xl leading-none">{activityPreviews[activeActivity].label}</p>
              <p className="mt-2 text-sm text-white/80">{activityPreviews[activeActivity].description}</p>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 z-20 grid w-[72%] gap-2">
            {activityPreviews.map((activity, index) => (
              <button
                key={activity.name}
                type="button"
                onClick={() => setActiveActivity(index)}
                aria-pressed={activeActivity === index}
                className={`group flex items-center gap-3 border-l-4 p-2 text-left shadow-lg transition-all ${
                  activeActivity === index
                    ? "translate-x-0 border-[#77d5dc] bg-[#34115f] text-white"
                    : "translate-x-5 border-transparent bg-white text-[#211735] hover:translate-x-2"
                }`}
              >
                <img src={activity.image} alt="" className="h-12 w-16 object-cover" />
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[.14em]">{activity.name}</span>
                  <span className={`mt-0.5 block text-xs ${activeActivity === index ? "text-white/65" : "text-[#756b88]"}`}>{activity.description}</span>
                </span>
                <ArrowRight className="ml-auto mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>
      </section>

       <section id="entdecken" className="mx-auto max-w-[1240px] px-5 py-24 md:px-10 md:py-32">
         <Reveal><div className="flex flex-col justify-between gap-6 border-b border-[#d8cbed] pb-8 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#6d28d9]">Für freie Tage</p><h2 className="font-display mt-3 text-5xl leading-none md:text-7xl">Was möchtest<br /><em>du erleben?</em></h2></div><p className="max-w-xs text-sm leading-6 text-[#756b88]">Keine endlosen Listen. Ideen, die zu deiner Stadt, deiner Zeit und deinen Menschen passen.</p></div></Reveal>
         <div className="mt-12 grid gap-0 border-t border-l border-[#d8cbed] sm:grid-cols-2 lg:grid-cols-4">
          {[{ icon: Compass, n: "01", title: "Neues probieren", text: "Kleine Abenteuer, große Geschichten." }, { icon: MapPin, n: "02", title: "Nah dran bleiben", text: "Orte, die du wirklich erreichen kannst." }, { icon: Star, n: "03", title: "Gutes auswählen", text: "Angebote von Menschen aus der Region." }, { icon: ShieldCheck, n: "04", title: "Sicher planen", text: "Transparent von der Idee bis zur Buchung." }].map(({ icon: Icon, n, title, text }, index) => <Reveal key={title} delay={index * 80}><article className="freizeit-card group min-h-[245px] border-b border-r border-[#d8cbed] p-6 transition-colors md:p-8"><div className="flex items-center justify-between"><span className="font-mono text-xs text-[#6d28d9]">{n}</span><Icon className="h-5 w-5 text-[#34115f]" /></div><h3 className="font-display mt-16 text-3xl leading-none">{title}</h3><p className="mt-3 text-sm leading-6 text-[#756b88]">{text}</p></article></Reveal>)}
        </div>
      </section>

       <section id="partner-werden" className="bg-[#6d28d9] px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-[.75fr_1.25fr]">
           <Reveal><div className="sticky top-8"><p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[.2em] text-[#fffaff]"><Building2 className="h-4 w-4" />Für Freizeitanbieter</p><h2 className="font-display mt-6 text-5xl leading-[.95] text-[#fffaff] md:text-7xl">Deine Freizeitaktivität<br /><em>gehört dazu.</em></h2><p className="mt-7 max-w-md text-lg leading-7 text-[#eadfff]">Menschen suchen nicht nach Werbung. Sie suchen nach einem guten Grund, am Samstag loszugehen. Zeig ihnen, was es bei dir zu erleben gibt.</p><div className="mt-10 space-y-4 text-sm text-[#fffaff]">{["Mehr Sichtbarkeit in deiner Region", "Persönlicher Einstieg ohne Vorabkosten", "Faire Partnerschaft auf Augenhöhe"].map((item) => <p key={item} className="flex items-center gap-3"><Check className="h-4 w-4 text-[#77d5dc]" />{item}</p>)}</div></div></Reveal>
           <Reveal delay={100}><div className="bg-[#fffaff] p-6 shadow-[10px_10px_0_#34115f] md:p-10">{partnerDone ? <div className="py-24 text-center" role="status"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d8f1ef]"><BadgeCheck className="h-8 w-8 text-[#176b68]" /></div><h3 className="font-display mt-6 text-4xl">Bewerbung erhalten.</h3><p className="mx-auto mt-3 max-w-md text-[#756b88]">Vielen Dank für dein Interesse. Unser Partner-Team meldet sich persönlich bei dir.</p></div> : <><p className="text-xs font-bold uppercase tracking-[.2em] text-[#6d28d9]">Partner werden</p><h3 className="font-display mt-3 text-4xl">Erzähl uns von deinem Angebot.</h3><p className="mt-3 text-[#756b88]">Kostenlos und unverbindlich. Wir melden uns persönlich.</p><Form {...partnerForm}><form onSubmit={partnerForm.handleSubmit((data) => partnerMutation.mutate(data))} className="mt-8 space-y-5"><div className="grid gap-5 sm:grid-cols-2"><FormField control={partnerForm.control} name="companyName" render={({ field }) => <FormItem><FormLabel>Unternehmen *</FormLabel><FormControl><Input {...field} placeholder="Name deines Unternehmens" className="h-12 rounded-none border-[#d8cbed] bg-transparent" /></FormControl><FormMessage /></FormItem>} /><FormField control={partnerForm.control} name="category" render={({ field }) => <FormItem><FormLabel>Kategorie *</FormLabel><FormControl><select {...field} className="flex h-12 w-full rounded-none border border-[#d8cbed] bg-transparent px-3 text-sm"><option value="">Bitte auswählen</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></FormControl><FormMessage /></FormItem>} /><FormField control={partnerForm.control} name="contactPerson" render={({ field }) => <FormItem><FormLabel>Ansprechpartner *</FormLabel><FormControl><Input {...field} placeholder="Vor- und Nachname" className="h-12 rounded-none border-[#d8cbed] bg-transparent" /></FormControl><FormMessage /></FormItem>} /><FormField control={partnerForm.control} name="city" render={({ field }) => <FormItem><FormLabel>Stadt / Standort *</FormLabel><FormControl><Input {...field} placeholder="z. B. Düsseldorf" className="h-12 rounded-none border-[#d8cbed] bg-transparent" /></FormControl><FormMessage /></FormItem>} /><FormField control={partnerForm.control} name="email" render={({ field }) => <FormItem><FormLabel>E-Mail *</FormLabel><FormControl><Input {...field} type="email" placeholder="kontakt@unternehmen.de" className="h-12 rounded-none border-[#d8cbed] bg-transparent" /></FormControl><FormMessage /></FormItem>} /><FormField control={partnerForm.control} name="phone" render={({ field }) => <FormItem><FormLabel>Telefon</FormLabel><FormControl><Input {...field} placeholder="+49 …" className="h-12 rounded-none border-[#d8cbed] bg-transparent" /></FormControl><FormMessage /></FormItem>} /></div><FormField control={partnerForm.control} name="description" render={({ field }) => <FormItem><FormLabel>Was bietest du an? *</FormLabel><FormControl><Textarea {...field} placeholder="Beschreibe dein Freizeitangebot in wenigen Sätzen …" className="min-h-28 rounded-none border-[#d8cbed] bg-transparent" /></FormControl><FormMessage /></FormItem>} /><FormField control={partnerForm.control} name="terms" render={({ field }) => <FormItem className="flex items-start gap-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div><FormLabel className="text-sm font-normal leading-relaxed text-[#756b88]">Ich stimme den <a className="text-[#6d28d9] underline" href="/agb">AGB</a> und der <a className="text-[#6d28d9] underline" href="/datenschutz">Datenschutzerklärung</a> zu. *</FormLabel><FormMessage /></div></FormItem>} /><Button disabled={partnerMutation.isPending} size="lg" className="h-14 w-full rounded-none bg-[#34115f] font-bold text-[#fffaff] hover:bg-[#250b46]">{partnerMutation.isPending ? "Wird gesendet …" : <>Kostenlos als Partner bewerben <ArrowRight className="ml-2 h-5 w-5" /></>}</Button><p className="text-center text-xs text-[#8e84a2]">Kostenlos · Unverbindlich · Persönliche Rückmeldung</p></form></Form></>}</div></Reveal>
        </div>
      </section>

       <footer className="bg-[#211735] px-5 py-10 text-[#fffaff] md:px-10"><div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-7 md:flex-row md:items-center"><img src={logoPath} alt="FreizeitEngel" className="h-14 w-auto bg-[#fffaff] p-1" /><div className="flex flex-wrap gap-5 text-xs text-[#c8bfe0]"><a href="/impressum" className="hover:text-white">Impressum</a><a href="/datenschutz" className="hover:text-white">Datenschutz</a><a href="/agb" className="hover:text-white">AGB</a></div><p className="text-xs text-[#8e84a2]">Für freie Tage in deiner Nähe.</p></div></footer>
    </main>
  );
}