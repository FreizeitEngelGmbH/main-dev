import { useState } from "react";
import { 
  Rocket, Building2, Code, Megaphone, TestTube, Target, Calendar,
  ChevronDown, ChevronRight, CheckCircle, Circle, Clock, Shield,
  Briefcase, TrendingUp, Phone, Palette, Camera,
  PartyPopper, Edit3, Trash2, Plus,
  Handshake, Monitor, Smartphone, Heart,
  DollarSign, Settings, Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  status: "done" | "in_progress" | "planned" | "blocked";
  category: string;
  week?: string;
}

interface RoadmapPhase {
  id: string;
  month: string;
  monthShort: string;
  title: string;
  subtitle: string;
  color: string;
  gradient: string;
  icon: any;
  streams: {
    name: string;
    color: string;
    icon: any;
    tasks: RoadmapTask[];
  }[];
}

const initialPhases: RoadmapPhase[] = [
  {
    id: "mar",
    month: "März 2026",
    monthShort: "MÄR",
    title: "Gründung & Aufbau",
    subtitle: "Rechtliche Grundlagen & Infrastruktur",
    color: "emerald",
    gradient: "from-emerald-500 to-teal-600",
    icon: Building2,
    streams: [
      {
        name: "Gründung & Recht",
        color: "emerald",
        icon: Shield,
        tasks: [
          { id: "m1", title: "Rechtsform festlegen (GmbH/UG)", description: "Beratung mit Steuerberater, Gesellschaftsvertrag aufsetzen", status: "planned", category: "gründung" },
          { id: "m2", title: "Notartermin & Handelsregistereintrag", description: "Gesellschaftsvertrag notariell beurkunden lassen", status: "planned", category: "gründung" },
          { id: "m3", title: "Geschäftskonto eröffnen", description: "Stammkapital einzahlen, Geschäftskonto bei Bank einrichten", status: "planned", category: "gründung" },
          { id: "m4", title: "Gewerbeanmeldung", description: "Gewerbeanmeldung beim zuständigen Gewerbeamt", status: "planned", category: "gründung" },
          { id: "m5", title: "Steuerliche Erfassung", description: "Fragebogen zur steuerlichen Erfassung beim Finanzamt einreichen", status: "planned", category: "gründung" },
          { id: "m6", title: "Geschäftsadresse & Briefkasten", description: "Virtuelle Geschäftsadresse oder Büro einrichten", status: "planned", category: "gründung" },
        ]
      },
      {
        name: "Finanzen & Planung",
        color: "blue",
        icon: DollarSign,
        tasks: [
          { id: "m7", title: "Businessplan finalisieren", description: "Detaillierter Finanzplan, Break-Even-Analyse, Cashflow-Prognose", status: "planned", category: "finanzen" },
          { id: "m8", title: "Buchhaltung einrichten", description: "DATEV/Lexoffice Setup, Steuerberater beauftragen", status: "planned", category: "finanzen" },
          { id: "m9", title: "Versicherungen abschließen", description: "Betriebshaftpflicht, D&O, Cyber-Versicherung prüfen", status: "planned", category: "finanzen" },
          { id: "m10", title: "Budgetplanung 50.000€ aufteilen", description: "IT: 15k, Marketing: 12k, Vertrieb: 8k, Recht: 5k, Reserve: 10k", status: "planned", category: "finanzen" },
        ]
      },
      {
        name: "Vertrieb Vorbereitung",
        color: "orange",
        icon: Handshake,
        tasks: [
          { id: "m11", title: "Partnerliste erstellen (NRW)", description: "Recherche: Schwimmbäder, Kinos, Zoos, Bowling, Freizeitparks in NRW", status: "planned", category: "vertrieb" },
          { id: "m12", title: "Pitch-Deck erstellen", description: "Professionelle Partnervorstellung mit USPs und Konditionen", status: "planned", category: "vertrieb" },
          { id: "m13", title: "Vertragsvorlagen finalisieren", description: "Partnervertrag, AGB, Datenschutzvereinbarung", status: "planned", category: "vertrieb" },
          { id: "m14", title: "CRM-System einrichten", description: "Lead-Tracking, Pipeline-Management für Partnerakquise", status: "planned", category: "vertrieb" },
        ]
      }
    ]
  },
  {
    id: "apr",
    month: "April 2026",
    monthShort: "APR",
    title: "Partner-Akquise Hochphase",
    subtitle: "Intensiver Vertrieb & erste Partnerschaften",
    color: "orange",
    gradient: "from-orange-500 to-amber-600",
    icon: Handshake,
    streams: [
      {
        name: "Vertrieb & Akquise",
        color: "orange",
        icon: Phone,
        tasks: [
          { id: "a1", title: "Kaltakquise starten (50+ Kontakte/Woche)", description: "Telefonische Erstansprache, E-Mail-Outreach an Freizeitanbieter", status: "planned", category: "vertrieb", week: "KW 14-15" },
          { id: "a2", title: "Vor-Ort-Besuche bei Top-Partnern", description: "Persönliche Vorstellung bei 10-15 Premium-Partnern pro Woche", status: "planned", category: "vertrieb", week: "KW 14-17" },
          { id: "a3", title: "Erstgespräche & Produktpräsentationen", description: "Live-Präsentation der Plattform, Konditionen besprechen", status: "planned", category: "vertrieb", week: "KW 15-17" },
          { id: "a4", title: "Follow-Up-Prozess etablieren", description: "Automatisierte Follow-Ups nach 3, 7, 14 Tagen", status: "planned", category: "vertrieb", week: "KW 15" },
          { id: "a5", title: "Erste 10 Partnerverträge abschließen", description: "Ziel: 10 signierte Verträge bis Ende April", status: "planned", category: "vertrieb", week: "KW 16-17" },
          { id: "a6", title: "Branchen-Events & Messen besuchen", description: "Networking auf regionalen Freizeit- und Tourismusmessen", status: "planned", category: "vertrieb", week: "KW 16-17" },
        ]
      },
      {
        name: "Partnermaterial & Branding",
        color: "purple",
        icon: Palette,
        tasks: [
          { id: "a7", title: "Welcome-Box für Partner designen", description: "Flyer, Aufsteller, QR-Code-Materialien, Visitenkarten", status: "planned", category: "marketing" },
          { id: "a8", title: "Partner-Onboarding-Guide erstellen", description: "Schritt-für-Schritt-Anleitung für neue Partner", status: "planned", category: "marketing" },
          { id: "a9", title: "Social-Media-Kanäle aufbauen", description: "Instagram, Facebook, TikTok Accounts erstellen und Content-Plan", status: "planned", category: "marketing" },
          { id: "a10", title: "Webseite Landing Page optimieren", description: "SEO-Grundlagen, Partner-Seite, B2B-Landing-Page", status: "planned", category: "marketing" },
        ]
      },
      {
        name: "IT Vorbereitung",
        color: "blue",
        icon: Settings,
        tasks: [
          { id: "a11", title: "Technisches Anforderungsdokument", description: "Detailliertes Pflichtenheft für Entwicklungsteam erstellen", status: "planned", category: "it", week: "KW 17" },
          { id: "a12", title: "Entwicklerteam rekrutieren/briefen", description: "Freelancer oder Agentur auswählen, Kickoff vorbereiten", status: "planned", category: "it", week: "KW 17" },
          { id: "a13", title: "API-Schnittstellen definieren", description: "Payment (Stripe), E-Mail (SendGrid), Maps, Calendar APIs", status: "planned", category: "it", week: "KW 17-18" },
        ]
      }
    ]
  },
  {
    id: "may",
    month: "Mai 2026",
    monthShort: "MAI",
    title: "IT-Kickoff & Vertrieb Endspurt",
    subtitle: "Entwicklung beginnt, Partnerakquise abschließen",
    color: "blue",
    gradient: "from-blue-500 to-indigo-600",
    icon: Code,
    streams: [
      {
        name: "IT-Entwicklung Sprint 1",
        color: "blue",
        icon: Code,
        tasks: [
          { id: "may1", title: "Projekt-Setup & Architektur", description: "Tech-Stack aufsetzen, CI/CD Pipeline, Datenbank-Schema", status: "planned", category: "it", week: "KW 18-19" },
          { id: "may2", title: "User-Registration & Auth", description: "Login, Registrierung, Passwort-Reset, Session-Management", status: "planned", category: "it", week: "KW 19-20" },
          { id: "may3", title: "Partner-Dashboard Grundgerüst", description: "Partner-Login, Erlebnis-Verwaltung, Basis-Dashboard", status: "planned", category: "it", week: "KW 20-21" },
          { id: "may4", title: "Erlebnis-Katalog & Suche", description: "Kategorien, Filter, Standort-basierte Suche", status: "planned", category: "it", week: "KW 21-22" },
        ]
      },
      {
        name: "Vertrieb Endspurt",
        color: "orange",
        icon: Target,
        tasks: [
          { id: "may5", title: "Partnerakquise abschließen (Ziel: 30+)", description: "Restliche Verträge bis 31.05. unterschrieben", status: "planned", category: "vertrieb", week: "KW 18-22" },
          { id: "may6", title: "Partner-Daten sammeln", description: "Logos, Beschreibungen, Preise, Öffnungszeiten aller Partner", status: "planned", category: "vertrieb", week: "KW 20-22" },
          { id: "may7", title: "Partner-Fotos organisieren", description: "Professionelle Fotos der Partnerlocations sammeln/erstellen", status: "planned", category: "vertrieb", week: "KW 20-22" },
        ]
      },
      {
        name: "Organisation",
        color: "green",
        icon: Briefcase,
        tasks: [
          { id: "may8", title: "Kundenservice-Prozesse definieren", description: "FAQ, Support-Kanäle, Eskalationswege, Antwortzeiten", status: "planned", category: "orga" },
          { id: "may9", title: "Datenschutz & DSGVO", description: "Datenschutzerklärung, Cookie-Banner, Verarbeitungsverzeichnis", status: "planned", category: "orga" },
          { id: "may10", title: "AGB & Nutzungsbedingungen", description: "Rechtlich geprüfte AGB, Widerrufsbelehrung", status: "planned", category: "orga" },
        ]
      }
    ]
  },
  {
    id: "jun",
    month: "Juni 2026",
    monthShort: "JUN",
    title: "Kernentwicklung",
    subtitle: "Buchungssystem & Payment-Integration",
    color: "indigo",
    gradient: "from-indigo-500 to-violet-600",
    icon: Code,
    streams: [
      {
        name: "IT-Entwicklung Sprint 2-3",
        color: "indigo",
        icon: Monitor,
        tasks: [
          { id: "j1", title: "Buchungssystem implementieren", description: "Kalender, Zeitslots, Verfügbarkeit, Warenkorb", status: "planned", category: "it", week: "KW 23-24" },
          { id: "j2", title: "Payment-Integration (Stripe)", description: "Checkout, Stripe Connect für Partner-Auszahlungen", status: "planned", category: "it", week: "KW 24-25" },
          { id: "j3", title: "QR-Code Ticket-System", description: "QR-Generierung, Validierung, Mobile Ticket-Ansicht", status: "planned", category: "it", week: "KW 25-26" },
          { id: "j4", title: "E-Mail-System (Bestätigungen)", description: "Buchungsbestätigung, Erinnerungen, Partner-Benachrichtigungen", status: "planned", category: "it", week: "KW 26" },
          { id: "j5", title: "Admin-Dashboard", description: "Nutzer-Verwaltung, Buchungsübersicht, Partner-Management", status: "planned", category: "it", week: "KW 26-27" },
        ]
      },
      {
        name: "Vertrieb & Orga",
        color: "orange",
        icon: Briefcase,
        tasks: [
          { id: "j6", title: "Partner-Onboarding vorbereiten", description: "Onboarding-Materialien, Schulungsvideos erstellen", status: "planned", category: "vertrieb" },
          { id: "j7", title: "Preisstruktur finalisieren", description: "Provisionsmodell, Ticket-Preise mit Partnern abstimmen", status: "planned", category: "vertrieb" },
          { id: "j8", title: "Kundensupport aufbauen", description: "Helpdesk, FAQ-Seite, Kontaktformular, Telefon-Hotline", status: "planned", category: "orga" },
        ]
      }
    ]
  },
  {
    id: "jul",
    month: "Juli 2026",
    monthShort: "JUL",
    title: "Feature-Completion",
    subtitle: "Bewertungen, Mobile & Feinschliff",
    color: "violet",
    gradient: "from-violet-500 to-purple-600",
    icon: Smartphone,
    streams: [
      {
        name: "IT-Entwicklung Sprint 4-5",
        color: "violet",
        icon: Smartphone,
        tasks: [
          { id: "jul1", title: "Bewertungssystem", description: "Nutzer-Reviews, Sterne-Bewertung, Fotos hochladen", status: "planned", category: "it", week: "KW 27-28" },
          { id: "jul2", title: "Favoriten & Empfehlungen", description: "Merkliste, personalisierte Vorschläge, Ähnliche Aktivitäten", status: "planned", category: "it", week: "KW 28-29" },
          { id: "jul3", title: "Mobile Responsive Optimierung", description: "Alle Seiten für Mobile optimieren, Touch-Gesten", status: "planned", category: "it", week: "KW 29-30" },
          { id: "jul4", title: "SEO-Optimierung", description: "Meta-Tags, Structured Data, Sitemap, Performance", status: "planned", category: "it", week: "KW 30" },
          { id: "jul5", title: "Partner-Portal Erweiterung", description: "Analytics, Buchungsstatistiken, Umsatzberichte für Partner", status: "planned", category: "it", week: "KW 30-31" },
        ]
      },
      {
        name: "Marketing-Planung starten",
        color: "pink",
        icon: Megaphone,
        tasks: [
          { id: "jul6", title: "Content-Strategie entwickeln", description: "Blog-Plan, Social-Media-Redaktionsplan erstellen", status: "planned", category: "marketing" },
          { id: "jul7", title: "Influencer-Recherche starten", description: "NRW-Influencer identifizieren, Kooperationen vorbereiten", status: "planned", category: "marketing" },
          { id: "jul8", title: "PR-Strategie entwickeln", description: "Pressekontakte sammeln, Pressemitteilung Entwurf", status: "planned", category: "marketing" },
        ]
      }
    ]
  },
  {
    id: "aug",
    month: "August 2026",
    monthShort: "AUG",
    title: "Testing & Marketing-Detailplanung",
    subtitle: "Qualitätssicherung & Kampagnen vorbereiten",
    color: "amber",
    gradient: "from-amber-500 to-orange-600",
    icon: TestTube,
    streams: [
      {
        name: "Testing & QA",
        color: "amber",
        icon: TestTube,
        tasks: [
          { id: "aug1", title: "Funktionstest aller Buchungsflows", description: "End-to-End Testing: Suche → Buchung → Bezahlung → Ticket", status: "planned", category: "testing", week: "KW 31-32" },
          { id: "aug2", title: "Partner-Portal testen mit echten Partnern", description: "5 Beta-Partner einladen, Feedback sammeln", status: "planned", category: "testing", week: "KW 32-33" },
          { id: "aug3", title: "Payment-Tests (Stripe Sandbox)", description: "Zahlungsflows, Refunds, Partner-Auszahlungen testen", status: "planned", category: "testing", week: "KW 32" },
          { id: "aug4", title: "Mobile Testing auf allen Geräten", description: "iOS Safari, Android Chrome, verschiedene Bildschirmgrößen", status: "planned", category: "testing", week: "KW 33" },
          { id: "aug5", title: "Performance & Lasttest", description: "Ladezeiten optimieren, Server-Kapazitäten prüfen", status: "planned", category: "testing", week: "KW 33-34" },
          { id: "aug6", title: "Security Audit", description: "Penetrationstest, OWASP-Checkliste, Datenschutz-Check", status: "planned", category: "testing", week: "KW 34" },
        ]
      },
      {
        name: "Marketing Detailplanung",
        color: "pink",
        icon: Calendar,
        tasks: [
          { id: "aug7", title: "Social Media Redaktionsplan (Okt-Dez)", description: "Tagesgenauer Content-Plan: 3x/Woche Instagram, 2x Facebook, 3x TikTok", status: "planned", category: "marketing", week: "KW 31-32" },
          { id: "aug8", title: "Influencer-Kooperationen fixieren", description: "5-10 NRW-Influencer unter Vertrag nehmen, Briefings erstellen", status: "planned", category: "marketing", week: "KW 32-33" },
          { id: "aug9", title: "Google Ads Kampagnen planen", description: "Keywords, Anzeigentexte, Budget (2.000€/Monat), Targeting NRW", status: "planned", category: "marketing", week: "KW 33" },
          { id: "aug10", title: "Facebook/Instagram Ads vorbereiten", description: "Creatives designen, Zielgruppen definieren, A/B-Tests planen", status: "planned", category: "marketing", week: "KW 33-34" },
          { id: "aug11", title: "E-Mail-Marketing-Sequenzen erstellen", description: "Welcome-Serie, Abandoned Cart, Post-Booking, Re-Engagement", status: "planned", category: "marketing", week: "KW 34" },
          { id: "aug12", title: "PR-Maßnahmen planen", description: "Pressemitteilungen zeitlich planen, Medienliste finalisieren", status: "planned", category: "marketing", week: "KW 34-35" },
        ]
      }
    ]
  },
  {
    id: "sep",
    month: "September 2026",
    monthShort: "SEP",
    title: "Beta-Phase & Content-Produktion",
    subtitle: "Letzte Tests & Marketing-Assets erstellen",
    color: "cyan",
    gradient: "from-cyan-500 to-blue-600",
    icon: Camera,
    streams: [
      {
        name: "Beta & Bugfixing",
        color: "cyan",
        icon: TestTube,
        tasks: [
          { id: "s1", title: "Closed Beta mit 50 Nutzern", description: "Einladung per E-Mail, Feedback-Formular, Bug-Reports", status: "planned", category: "testing", week: "KW 36-37" },
          { id: "s2", title: "Bug-Fixing & Optimierung", description: "Kritische Bugs beheben, UX-Verbesserungen umsetzen", status: "planned", category: "it", week: "KW 37-38" },
          { id: "s3", title: "Partner-Onboarding durchführen", description: "Alle 30+ Partner auf Plattform einrichten, Tickets anlegen", status: "planned", category: "vertrieb", week: "KW 36-39" },
          { id: "s4", title: "Finale QA-Runde", description: "Vollständiger Regressionstest aller Features", status: "planned", category: "testing", week: "KW 39" },
        ]
      },
      {
        name: "Content-Produktion",
        color: "pink",
        icon: Camera,
        tasks: [
          { id: "s5", title: "Partner-Foto-Shootings", description: "Professionelle Fotos bei 10-15 Top-Partnern", status: "planned", category: "marketing", week: "KW 36-37" },
          { id: "s6", title: "Video-Content produzieren", description: "3-5 Kurzvideos: Behind the Scenes, Erlebnis-Highlights", status: "planned", category: "marketing", week: "KW 37-38" },
          { id: "s7", title: "Blog-Artikel vorschreiben (10 Stück)", description: "SEO-optimierte Artikel: 'Top 10 Aktivitäten in [Stadt]'", status: "planned", category: "marketing", week: "KW 38-39" },
          { id: "s8", title: "Social Media Content vorproduzieren", description: "30+ Posts für Oktober vorproduzieren, Stories, Reels", status: "planned", category: "marketing", week: "KW 38-39" },
          { id: "s9", title: "Launch-Video produzieren", description: "60-Sekunden Erklär-/Werbefilm für Launch-Kampagne", status: "planned", category: "marketing", week: "KW 39" },
        ]
      },
      {
        name: "Kampagnen-Vorbereitung",
        color: "purple",
        icon: Megaphone,
        tasks: [
          { id: "s10", title: "Launch-Event planen", description: "Location, Gästeliste, Catering, Programm für November", status: "planned", category: "marketing" },
          { id: "s11", title: "Gewinnspiel-Aktion vorbereiten", description: "Launch-Gewinnspiel: 10x Freizeiterlebnisse im Wert von 500€", status: "planned", category: "marketing" },
          { id: "s12", title: "Referral-Programm aufsetzen", description: "'Freunde werben' - 10€ Gutschein für beide Seiten", status: "planned", category: "marketing" },
        ]
      }
    ]
  },
  {
    id: "oct",
    month: "Oktober 2026",
    monthShort: "OKT",
    title: "Pre-Marketing & Hype",
    subtitle: "Aufmerksamkeit erzeugen & Community aufbauen",
    color: "rose",
    gradient: "from-rose-500 to-pink-600",
    icon: Megaphone,
    streams: [
      {
        name: "Pre-Launch Kampagnen",
        color: "rose",
        icon: Megaphone,
        tasks: [
          { id: "o1", title: "Teaser-Kampagne Social Media starten", description: "Countdown-Posts, Behind-the-Scenes, Partner-Vorstellungen", status: "planned", category: "marketing", week: "KW 40 (01.10.)" },
          { id: "o2", title: "Waitlist/Early-Access Kampagne", description: "Landing Page: 'Sei einer der Ersten' mit E-Mail-Signup", status: "planned", category: "marketing", week: "KW 40 (01.10.)" },
          { id: "o3", title: "Influencer-Content geht live", description: "Erste Influencer-Posts und Stories über FreizeitEngel", status: "planned", category: "marketing", week: "KW 41 (06.10.)" },
          { id: "o4", title: "Google Ads Kampagnen starten", description: "Brand-Kampagne + generische Keywords (Freizeit NRW)", status: "planned", category: "marketing", week: "KW 41 (08.10.)" },
          { id: "o5", title: "Facebook & Instagram Ads live", description: "Teaser-Ads: 'Bald verfügbar' mit Waitlist-CTA", status: "planned", category: "marketing", week: "KW 42 (13.10.)" },
          { id: "o6", title: "Pressemitteilung #1 versenden", description: "Lokale Medien NRW: 'Neues Startup revolutioniert Freizeitmarkt'", status: "planned", category: "marketing", week: "KW 42 (15.10.)" },
        ]
      },
      {
        name: "Community & Content",
        color: "purple",
        icon: Heart,
        tasks: [
          { id: "o7", title: "TikTok-Serie starten", description: "3x/Woche: 'Freizeit-Tipps NRW', Partner-Spotlights", status: "planned", category: "marketing", week: "KW 40-43" },
          { id: "o8", title: "Blog-Artikel veröffentlichen (2/Woche)", description: "SEO-Content: Stadtguides, Aktivitäten-Tipps, Saisonales", status: "planned", category: "marketing", week: "KW 40-43" },
          { id: "o9", title: "Newsletter an Waitlist (wöchentlich)", description: "Countdown zum Launch, exklusive Previews, Partner-Highlights", status: "planned", category: "marketing", week: "KW 41-44" },
          { id: "o10", title: "Partner-Highlight-Serie", description: "Jeden 2. Tag: ein Partner vorgestellt auf Social Media", status: "planned", category: "marketing", week: "KW 41-44" },
        ]
      },
      {
        name: "Launch-Vorbereitung",
        color: "amber",
        icon: Rocket,
        tasks: [
          { id: "o11", title: "Launch-Event Einladungen versenden", description: "200 Einladungen: Partner, Presse, Influencer, Freunde", status: "planned", category: "orga", week: "KW 42 (14.10.)" },
          { id: "o12", title: "Finale technische Prüfung", description: "Server-Skalierung, CDN, Monitoring-Tools einrichten", status: "planned", category: "it", week: "KW 43" },
          { id: "o13", title: "Kundenservice-Team briefen", description: "FAQ-Training, Eskalationsprozesse, Launch-Sonderregelungen", status: "planned", category: "orga", week: "KW 43" },
          { id: "o14", title: "Launch-Rabatte festlegen", description: "Eröffnungsangebot: 20% auf erste Buchung, Promo-Codes", status: "planned", category: "marketing", week: "KW 44 (27.10.)" },
        ]
      }
    ]
  },
  {
    id: "nov",
    month: "November 2026",
    monthShort: "NOV",
    title: "LAUNCH",
    subtitle: "Go-Live & Wachstum starten",
    color: "red",
    gradient: "from-red-500 to-rose-600",
    icon: Rocket,
    streams: [
      {
        name: "Launch-Woche (KW 45)",
        color: "red",
        icon: PartyPopper,
        tasks: [
          { id: "n1", title: "LAUNCH DAY - Plattform geht live!", description: "Montag 02.11. - 10:00 Uhr: Plattform für alle zugänglich", status: "planned", category: "launch", week: "Mo 02.11." },
          { id: "n2", title: "Launch-Newsletter an gesamte Waitlist", description: "E-Mail an alle Waitlist-Anmeldungen + 20% Rabattcode", status: "planned", category: "marketing", week: "Mo 02.11." },
          { id: "n3", title: "Pressemitteilung #2: Plattform ist live", description: "Alle Medien-Kontakte informieren, Interview-Angebote", status: "planned", category: "marketing", week: "Mo 02.11." },
          { id: "n4", title: "Influencer-Posts koordiniert launchen", description: "Alle Influencer posten gleichzeitig am Launch-Tag", status: "planned", category: "marketing", week: "Mo 02.11." },
          { id: "n5", title: "Launch-Event durchführen", description: "Abendveranstaltung mit Partnern, Presse, Influencern", status: "planned", category: "marketing", week: "Do 05.11." },
          { id: "n6", title: "Gewinnspiel-Kampagne starten", description: "Social Media Gewinnspiel: 10 Erlebnisse zu gewinnen", status: "planned", category: "marketing", week: "KW 45" },
        ]
      },
      {
        name: "Post-Launch Marketing",
        color: "pink",
        icon: TrendingUp,
        tasks: [
          { id: "n7", title: "Performance-Monitoring & Optimierung", description: "Täglich: KPIs prüfen, Ad-Budgets optimieren, A/B-Tests", status: "planned", category: "marketing", week: "KW 45-48" },
          { id: "n8", title: "Referral-Programm aktivieren", description: "'Freunde werben Freunde' - 10€ für beide Seiten", status: "planned", category: "marketing", week: "KW 46" },
          { id: "n9", title: "Erste Kundenbewertungen einsammeln", description: "Post-Booking E-Mail: 'Bewerte dein Erlebnis' + Incentive", status: "planned", category: "marketing", week: "KW 46-48" },
          { id: "n10", title: "Retargeting-Kampagnen starten", description: "Warenkorbabbrecher, Besucher ohne Buchung erneut ansprechen", status: "planned", category: "marketing", week: "KW 46" },
          { id: "n11", title: "Weihnachts-Kampagne vorbereiten", description: "Gutschein-Aktion: 'Erlebnisse verschenken' für Weihnachten", status: "planned", category: "marketing", week: "KW 47-48" },
        ]
      },
      {
        name: "Wachstum & Skalierung",
        color: "green",
        icon: TrendingUp,
        tasks: [
          { id: "n12", title: "KPI-Review & Strategie-Anpassung", description: "Wöchentlich: Buchungen, Umsatz, Conversion, CAC analysieren", status: "planned", category: "orga", week: "KW 46-48" },
          { id: "n13", title: "Partner-Feedback einholen", description: "Zufriedenheitsumfrage bei allen Partnern, Verbesserungen", status: "planned", category: "vertrieb", week: "KW 47" },
          { id: "n14", title: "Nächste Städte/Regionen evaluieren", description: "Expansion planen: Ruhrgebiet, Düsseldorf, Köln, Münster", status: "planned", category: "vertrieb", week: "KW 48" },
        ]
      }
    ]
  }
];

const statusConfig = {
  done: { label: "Erledigt", color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  in_progress: { label: "In Arbeit", color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  planned: { label: "Geplant", color: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" },
  blocked: { label: "Blockiert", color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
};

const categoryColors: Record<string, string> = {
  gründung: "bg-emerald-50 text-emerald-700",
  finanzen: "bg-blue-50 text-blue-700",
  vertrieb: "bg-orange-50 text-orange-700",
  marketing: "bg-pink-50 text-pink-700",
  it: "bg-indigo-50 text-indigo-700",
  orga: "bg-green-50 text-green-700",
  testing: "bg-amber-50 text-amber-700",
  launch: "bg-red-50 text-red-700",
};

export default function AdminRoadmap() {
  const [phases, setPhases] = useState<RoadmapPhase[]>(initialPhases);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(phases.map(p => p.id)));
  const [editTask, setEditTask] = useState<{ phaseId: string; streamIdx: number; task: RoadmapTask } | null>(null);
  const [addTask, setAddTask] = useState<{ phaseId: string; streamIdx: number } | null>(null);
  const [newTask, setNewTask] = useState({ title: "", description: "", category: "marketing", status: "planned" as const, week: "" });
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const togglePhase = (id: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateTaskStatus = (phaseId: string, streamIdx: number, taskId: string, status: RoadmapTask["status"]) => {
    setPhases(prev => prev.map(p => {
      if (p.id !== phaseId) return p;
      return {
        ...p,
        streams: p.streams.map((s, i) => {
          if (i !== streamIdx) return s;
          return { ...s, tasks: s.tasks.map(t => t.id === taskId ? { ...t, status } : t) };
        })
      };
    }));
  };

  const deleteTask = (phaseId: string, streamIdx: number, taskId: string) => {
    setPhases(prev => prev.map(p => {
      if (p.id !== phaseId) return p;
      return {
        ...p,
        streams: p.streams.map((s, i) => {
          if (i !== streamIdx) return s;
          return { ...s, tasks: s.tasks.filter(t => t.id !== taskId) };
        })
      };
    }));
  };

  const handleAddTask = () => {
    if (!addTask || !newTask.title) return;
    const id = `custom_${Date.now()}`;
    setPhases(prev => prev.map(p => {
      if (p.id !== addTask.phaseId) return p;
      return {
        ...p,
        streams: p.streams.map((s, i) => {
          if (i !== addTask.streamIdx) return s;
          return { ...s, tasks: [...s.tasks, { ...newTask, id }] };
        })
      };
    }));
    setAddTask(null);
    setNewTask({ title: "", description: "", category: "marketing", status: "planned", week: "" });
  };

  const handleEditTask = () => {
    if (!editTask) return;
    setPhases(prev => prev.map(p => {
      if (p.id !== editTask.phaseId) return p;
      return {
        ...p,
        streams: p.streams.map((s, i) => {
          if (i !== editTask.streamIdx) return s;
          return { ...s, tasks: s.tasks.map(t => t.id === editTask.task.id ? editTask.task : t) };
        })
      };
    }));
    setEditTask(null);
  };

  const totalTasks = phases.reduce((sum, p) => sum + p.streams.reduce((s, st) => s + st.tasks.length, 0), 0);
  const doneTasks = phases.reduce((sum, p) => sum + p.streams.reduce((s, st) => s + st.tasks.filter(t => t.status === "done").length, 0), 0);
  const inProgressTasks = phases.reduce((sum, p) => sum + p.streams.reduce((s, st) => s + st.tasks.filter(t => t.status === "in_progress").length, 0), 0);
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Launch Roadmap 2026</h1>
              <p className="text-gray-500 text-sm">FreizeitEngel - Von der Gründung bis zum Launch</p>
            </div>
          </div>
        </div>

        {/* KPI Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Fortschritt</div>
            <div className="text-2xl font-black text-gray-900">{progressPercent}%</div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Gesamt</div>
            <div className="text-2xl font-black text-gray-900">{totalTasks}</div>
            <div className="text-xs text-gray-400 mt-1">Maßnahmen</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Erledigt</div>
            <div className="text-2xl font-black text-emerald-600">{doneTasks}</div>
            <div className="text-xs text-gray-400 mt-1">abgeschlossen</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">In Arbeit</div>
            <div className="text-2xl font-black text-blue-600">{inProgressTasks}</div>
            <div className="text-xs text-gray-400 mt-1">aktive Tasks</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Monate</div>
            <div className="text-2xl font-black text-purple-600">9</div>
            <div className="text-xs text-gray-400 mt-1">März → November</div>
          </div>
        </div>

        {/* Timeline Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {phases.map((phase) => {
            const Icon = phase.icon;
            const phaseDone = phase.streams.reduce((s, st) => s + st.tasks.filter(t => t.status === "done").length, 0);
            const phaseTotal = phase.streams.reduce((s, st) => s + st.tasks.length, 0);
            return (
              <button
                key={phase.id}
                onClick={() => {
                  setExpandedPhases(new Set([phase.id]));
                  document.getElementById(`phase-${phase.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`flex-shrink-0 bg-gradient-to-r ${phase.gradient} text-white rounded-xl px-4 py-3 min-w-[140px] text-left hover:shadow-lg transition-all duration-300 hover:scale-105`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4" />
                  <span className="font-bold text-sm">{phase.monthShort}</span>
                </div>
                <div className="text-[10px] text-white/80 leading-tight">{phase.title}</div>
                <div className="text-[10px] text-white/60 mt-1">{phaseDone}/{phaseTotal} Tasks</div>
              </button>
            );
          })}
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "all", label: "Alle" },
            { key: "planned", label: "Geplant" },
            { key: "in_progress", label: "In Arbeit" },
            { key: "done", label: "Erledigt" },
            { key: "blocked", label: "Blockiert" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus === f.key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Timeline Phases */}
        <div className="space-y-6">
          {phases.map((phase, phaseIdx) => {
            const Icon = phase.icon;
            const isExpanded = expandedPhases.has(phase.id);
            const phaseDone = phase.streams.reduce((s, st) => s + st.tasks.filter(t => t.status === "done").length, 0);
            const phaseTotal = phase.streams.reduce((s, st) => s + st.tasks.length, 0);
            const phasePercent = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;

            return (
              <div key={phase.id} id={`phase-${phase.id}`} className="relative">
                {phaseIdx < phases.length - 1 && (
                  <div className="absolute left-6 top-[80px] bottom-0 w-0.5 bg-gradient-to-b from-gray-200 to-transparent z-0" />
                )}

                <button
                  onClick={() => togglePhase(phase.id)}
                  className={`w-full bg-gradient-to-r ${phase.gradient} rounded-2xl p-5 text-white text-left hover:shadow-xl transition-all duration-300 relative z-10`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-white/70 text-xs font-medium">{phase.month}</div>
                        <div className="text-xl font-black">{phase.title}</div>
                        <div className="text-white/70 text-sm">{phase.subtitle}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <div className="text-2xl font-black">{phasePercent}%</div>
                        <div className="text-xs text-white/70">{phaseDone}/{phaseTotal} Tasks</div>
                      </div>
                      <div className="w-16 h-16 hidden md:flex items-center justify-center">
                        <svg className="w-14 h-14 -rotate-90">
                          <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                          <circle cx="28" cy="28" r="24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${phasePercent * 1.508} 150.8`} />
                        </svg>
                      </div>
                      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-3 ml-0 md:ml-6 space-y-4">
                    {phase.streams.map((stream, streamIdx) => {
                      const StreamIcon = stream.icon;
                      const filteredTasks = filterStatus === "all" ? stream.tasks : stream.tasks.filter(t => t.status === filterStatus);
                      if (filteredTasks.length === 0 && filterStatus !== "all") return null;

                      return (
                        <div key={streamIdx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                          <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <StreamIcon className="h-4 w-4 text-gray-600" />
                              <h3 className="font-bold text-sm text-gray-900">{stream.name}</h3>
                              <Badge variant="outline" className="text-[10px]">{filteredTasks.length} Tasks</Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-gray-500 hover:text-gray-900"
                              onClick={() => setAddTask({ phaseId: phase.id, streamIdx })}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Hinzufügen
                            </Button>
                          </div>
                          <div className="divide-y divide-gray-50">
                            {filteredTasks.map((task) => {
                              const sc = statusConfig[task.status];
                              return (
                                <div key={task.id} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50/50 transition-colors group">
                                  <button
                                    className="mt-0.5 flex-shrink-0"
                                    onClick={() => {
                                      const next = task.status === "done" ? "planned" : task.status === "planned" ? "in_progress" : task.status === "in_progress" ? "done" : "planned";
                                      updateTaskStatus(phase.id, streamIdx, task.id, next);
                                    }}
                                  >
                                    {task.status === "done" ? (
                                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                                    ) : task.status === "in_progress" ? (
                                      <Clock className="h-5 w-5 text-blue-500" />
                                    ) : task.status === "blocked" ? (
                                      <Shield className="h-5 w-5 text-red-500" />
                                    ) : (
                                      <Circle className="h-5 w-5 text-gray-300 group-hover:text-gray-400" />
                                    )}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`font-medium text-sm ${task.status === "done" ? "line-through text-gray-400" : "text-gray-900"}`}>
                                        {task.title}
                                      </span>
                                      {task.week && (
                                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{task.week}</span>
                                      )}
                                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${categoryColors[task.category] || "bg-gray-50 text-gray-600"}`}>
                                        {task.category}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{task.description}</p>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      className="p-1 rounded hover:bg-gray-100"
                                      onClick={() => setEditTask({ phaseId: phase.id, streamIdx, task: { ...task } })}
                                    >
                                      <Edit3 className="h-3.5 w-3.5 text-gray-400" />
                                    </button>
                                    <button
                                      className="p-1 rounded hover:bg-red-50"
                                      onClick={() => deleteTask(phase.id, streamIdx, task.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Launch Milestone */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-3xl px-12 py-8 text-white shadow-xl shadow-red-500/20">
            <PartyPopper className="h-12 w-12 mb-3" />
            <h2 className="text-3xl font-black">LAUNCH: November 2026</h2>
            <p className="text-white/80 mt-1">FreizeitEngel geht live in NRW</p>
            <div className="flex items-center gap-6 mt-4 text-sm text-white/70">
              <span>30+ Partner</span>
              <span>50+ Aktivitäten</span>
              <span>NRW-weit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={!!editTask} onOpenChange={() => setEditTask(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aufgabe bearbeiten</DialogTitle>
          </DialogHeader>
          {editTask && (
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Titel</label>
                <Input value={editTask.task.title} onChange={(e) => setEditTask({ ...editTask, task: { ...editTask.task, title: e.target.value } })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Beschreibung</label>
                <Textarea value={editTask.task.description} onChange={(e) => setEditTask({ ...editTask, task: { ...editTask.task, description: e.target.value } })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select value={editTask.task.status} onValueChange={(v: any) => setEditTask({ ...editTask, task: { ...editTask.task, status: v } })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Geplant</SelectItem>
                      <SelectItem value="in_progress">In Arbeit</SelectItem>
                      <SelectItem value="done">Erledigt</SelectItem>
                      <SelectItem value="blocked">Blockiert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Zeitraum</label>
                  <Input value={editTask.task.week || ""} onChange={(e) => setEditTask({ ...editTask, task: { ...editTask.task, week: e.target.value } })} placeholder="z.B. KW 14-15" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Kategorie</label>
                <Select value={editTask.task.category} onValueChange={(v) => setEditTask({ ...editTask, task: { ...editTask.task, category: v } })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gründung">Gründung</SelectItem>
                    <SelectItem value="finanzen">Finanzen</SelectItem>
                    <SelectItem value="vertrieb">Vertrieb</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="orga">Organisation</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="launch">Launch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleEditTask} className="w-full">Speichern</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={!!addTask} onOpenChange={() => setAddTask(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Neue Aufgabe hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Titel</label>
              <Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Aufgabe eingeben..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Beschreibung</label>
              <Textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Details zur Aufgabe..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Kategorie</label>
                <Select value={newTask.category} onValueChange={(v) => setNewTask({ ...newTask, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gründung">Gründung</SelectItem>
                    <SelectItem value="finanzen">Finanzen</SelectItem>
                    <SelectItem value="vertrieb">Vertrieb</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="orga">Organisation</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="launch">Launch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Zeitraum</label>
                <Input value={newTask.week} onChange={(e) => setNewTask({ ...newTask, week: e.target.value })} placeholder="z.B. KW 14-15" />
              </div>
            </div>
            <Button onClick={handleAddTask} className="w-full">Hinzufügen</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
