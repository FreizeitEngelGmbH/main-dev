import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Mail, Send, Plus, Trash2, Users, BarChart3, Eye, Clock, Download,
  FileText, GripVertical, Image, Type, ArrowUp, ArrowDown, Copy,
  Layout, Sparkles, ChevronRight, Palette, ExternalLink, X, Search, RotateCcw, Settings2
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface EmailCampaign {
  id: number;
  name: string;
  subject: string;
  content: string;
  recipientType: string;
  recipientSegment: string | null;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

interface NewsletterSubscriber {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
}

interface SystemEmailTemplate {
  key: string;
  name: string;
  category: string;
  subject: string;
  bodyHtml: string;
  enabled: boolean;
  variables: string[];
  customized: boolean;
}

const statusConfig: Record<string, { label: string; variant: "secondary" | "outline" | "default" | "destructive"; className?: string }> = {
  draft: { label: "Entwurf", variant: "secondary" },
  scheduled: { label: "Geplant", variant: "outline", className: "border-blue-500 text-blue-600" },
  sent: { label: "Versendet", variant: "default", className: "bg-green-600 hover:bg-green-700" },
  failed: { label: "Fehlgeschlagen", variant: "destructive" },
};

interface TemplateBlock {
  id: string;
  type: "header" | "text" | "image" | "button" | "divider" | "hero" | "features" | "footer" | "spacer";
  content: Record<string, string>;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  targetGroup: string;
  blocks: TemplateBlock[];
}

const PREDEFINED_TEMPLATES: EmailTemplate[] = [
  {
    id: "welcome-all",
    name: "Willkommens-Mail",
    subject: "Willkommen bei FreizeitEngel! Entdecke dein nächstes Abenteuer",
    targetGroup: "all",
    blocks: [
      { id: "h1", type: "hero", content: { title: "Willkommen bei FreizeitEngel!", subtitle: "Dein Portal für unvergessliche Freizeiterlebnisse in deiner Nähe", buttonText: "Erlebnisse entdecken", buttonUrl: "https://freizeitengel.com", bgColor: "#4f46e5" } },
      { id: "t1", type: "text", content: { text: "Hallo {{name}},\n\nschön, dass du dich bei FreizeitEngel angemeldet hast! Bei uns findest du die besten Freizeitangebote in deiner Region – von aufregenden Outdoor-Abenteuern bis zu entspannten Wellness-Erlebnissen." } },
      { id: "f1", type: "features", content: { feature1Title: "Über 400 Partner", feature1Text: "Entdecke hunderte lokale Anbieter", feature2Title: "Sofort buchbar", feature2Text: "QR-Code Tickets direkt aufs Handy", feature3Title: "Beste Preise", feature3Text: "Exklusive Angebote nur bei uns" } },
      { id: "b1", type: "button", content: { text: "Jetzt Erlebnisse entdecken", url: "https://freizeitengel.com", color: "#4f46e5" } },
      { id: "fo1", type: "footer", content: { text: "FreizeitEngel GmbH | Dein Freizeit-Portal\nDu erhältst diese E-Mail, weil du dich für unseren Newsletter angemeldet hast." } },
    ],
  },
  {
    id: "weekly-all",
    name: "Wöchentlicher Newsletter",
    subject: "Deine Freizeit-Highlights der Woche",
    targetGroup: "all",
    blocks: [
      { id: "h2", type: "header", content: { title: "Freizeit-Highlights der Woche", subtitle: "Die besten Angebote und neuen Erlebnisse" } },
      { id: "t2", type: "text", content: { text: "Hallo {{name}},\n\nhier sind deine persönlichen Freizeit-Empfehlungen für diese Woche. Entdecke neue Aktivitäten und sichere dir exklusive Angebote!" } },
      { id: "d1", type: "divider", content: {} },
      { id: "t3", type: "text", content: { text: "🎯 Top-Erlebnis der Woche: Kletterpark Biggesee\nErlebe den Nervenkitzel in luftiger Höhe mit verschiedenen Parcours für alle Schwierigkeitsgrade. Jetzt zum Spezialpreis!" } },
      { id: "b2", type: "button", content: { text: "Alle Highlights ansehen", url: "https://freizeitengel.com", color: "#059669" } },
      { id: "fo2", type: "footer", content: { text: "FreizeitEngel GmbH | Dein Freizeit-Portal\nAbmeldung jederzeit möglich." } },
    ],
  },
  {
    id: "seasonal-all",
    name: "Saisonale Aktion",
    subject: "Frühlings-Special: Outdoor-Erlebnisse zum Vorteilspreis!",
    targetGroup: "all",
    blocks: [
      { id: "h3", type: "hero", content: { title: "Frühlings-Special 2026", subtitle: "Entdecke die schönsten Outdoor-Erlebnisse in NRW mit bis zu 20% Rabatt!", buttonText: "Angebote sichern", buttonUrl: "https://freizeitengel.com", bgColor: "#059669" } },
      { id: "t4", type: "text", content: { text: "Der Frühling ist da und mit ihm die besten Outdoor-Erlebnisse! Ob Bootstour auf dem Biggesee, Paintball-Action oder ein Tag im Kletterpark – jetzt ist die perfekte Zeit für Abenteuer." } },
      { id: "f2", type: "features", content: { feature1Title: "Bootstouren", feature1Text: "Ab 12,50€ pro Person", feature2Title: "Kletterparks", feature2Text: "Familientickets ab 39,90€", feature3Title: "Paintball", feature3Text: "Gruppen ab 4 Personen" } },
      { id: "b3", type: "button", content: { text: "Alle Frühlingsangebote entdecken", url: "https://freizeitengel.com", color: "#059669" } },
      { id: "fo3", type: "footer", content: { text: "FreizeitEngel GmbH | Gültig bis Ende Mai 2026" } },
    ],
  },
  {
    id: "reactivation-all",
    name: "Reaktivierungs-Mail",
    subject: "Wir vermissen dich! Hier sind neue Erlebnisse für dich",
    targetGroup: "all",
    blocks: [
      { id: "h4", type: "header", content: { title: "Wir vermissen dich!", subtitle: "Es gibt so viele neue Erlebnisse zu entdecken" } },
      { id: "t5", type: "text", content: { text: "Hallo {{name}},\n\nes ist schon eine Weile her, seit du das letzte Mal bei FreizeitEngel vorbeigeschaut hast. In der Zwischenzeit haben wir viele neue Partner und Erlebnisse hinzugefügt!" } },
      { id: "t6", type: "text", content: { text: "Hier sind 3 Gründe, warum du zurückkommen solltest:\n\n1. 🆕 Über 50 neue Erlebnisse seit deinem letzten Besuch\n2. 🎫 Neue Partner in Olpe, Siegen und dem Sauerland\n3. 💰 Exklusive Rückkehrer-Angebote warten auf dich" } },
      { id: "b4", type: "button", content: { text: "Jetzt zurückkehren", url: "https://freizeitengel.com", color: "#7c3aed" } },
      { id: "fo4", type: "footer", content: { text: "FreizeitEngel GmbH | Dein Freizeit-Portal" } },
    ],
  },
  {
    id: "feedback-all",
    name: "Feedback & Bewertung",
    subject: "Wie war dein Erlebnis? Teile deine Erfahrung!",
    targetGroup: "all",
    blocks: [
      { id: "h5", type: "header", content: { title: "Wie war dein Erlebnis?", subtitle: "Deine Meinung ist uns wichtig" } },
      { id: "t7", type: "text", content: { text: "Hallo {{name}},\n\nwir hoffen, du hattest ein tolles Erlebnis! Dein Feedback hilft uns und unseren Partnern, das Angebot stetig zu verbessern." } },
      { id: "t8", type: "text", content: { text: "Nimm dir 2 Minuten Zeit und bewerte dein letztes Erlebnis. Als Dankeschön erhältst du einen 5€-Gutschein für deine nächste Buchung!" } },
      { id: "b5", type: "button", content: { text: "Jetzt bewerten", url: "https://freizeitengel.com", color: "#ea580c" } },
      { id: "fo5", type: "footer", content: { text: "FreizeitEngel GmbH | Gemeinsam für bessere Freizeit" } },
    ],
  },
  {
    id: "welcome-partners",
    name: "Partner Willkommen",
    subject: "Willkommen als FreizeitEngel Partner!",
    targetGroup: "partners",
    blocks: [
      { id: "hp1", type: "hero", content: { title: "Willkommen als Partner!", subtitle: "Gemeinsam erreichen wir mehr Kunden für Ihr Freizeitangebot", buttonText: "Partner-Dashboard öffnen", buttonUrl: "https://freizeitengel.com/partner", bgColor: "#1d4ed8" } },
      { id: "tp1", type: "text", content: { text: "Sehr geehrte/r Partner/in,\n\nherzlich willkommen bei FreizeitEngel! Ab sofort sind Ihre Erlebnisse für tausende Nutzer in NRW sichtbar und buchbar." } },
      { id: "fp1", type: "features", content: { feature1Title: "Mehr Reichweite", feature1Text: "Über 50.000 monatliche Besucher", feature2Title: "Einfache Verwaltung", feature2Text: "Partner-Dashboard für alle Buchungen", feature3Title: "QR-Tickets", feature3Text: "Digitale Eintrittskarten für Ihre Gäste" } },
      { id: "bp1", type: "button", content: { text: "Zum Partner-Dashboard", url: "https://freizeitengel.com/partner", color: "#1d4ed8" } },
      { id: "fop1", type: "footer", content: { text: "FreizeitEngel GmbH | Partner-Support: partner@freizeitengel.com" } },
    ],
  },
  {
    id: "report-partners",
    name: "Monatsbericht Partner",
    subject: "Ihr FreizeitEngel Monatsbericht – {{monat}} 2026",
    targetGroup: "partners",
    blocks: [
      { id: "hp2", type: "header", content: { title: "Monatsbericht {{monat}} 2026", subtitle: "Ihre Performance auf einen Blick" } },
      { id: "tp2", type: "text", content: { text: "Sehr geehrte/r Partner/in,\n\nhier ist Ihr monatlicher Leistungsbericht. Sehen Sie, wie Ihre Erlebnisse bei unseren Nutzern ankommen." } },
      { id: "fp2", type: "features", content: { feature1Title: "Buchungen", feature1Text: "{{buchungen}} neue Buchungen diesen Monat", feature2Title: "Umsatz", feature2Text: "{{umsatz}}€ generierter Umsatz", feature3Title: "Bewertung", feature3Text: "{{bewertung}} ⭐ Durchschnittsnote" } },
      { id: "tp3", type: "text", content: { text: "💡 Tipp: Erlebnisse mit Fotos werden 3x häufiger gebucht. Laden Sie hochwertige Bilder in Ihrem Dashboard hoch!" } },
      { id: "bp2", type: "button", content: { text: "Vollständigen Bericht ansehen", url: "https://freizeitengel.com/partner", color: "#1d4ed8" } },
      { id: "fop2", type: "footer", content: { text: "FreizeitEngel GmbH | Partner-Support" } },
    ],
  },
  {
    id: "tips-partners",
    name: "Partner-Tipps",
    subject: "5 Tipps für mehr Buchungen auf FreizeitEngel",
    targetGroup: "partners",
    blocks: [
      { id: "hp3", type: "header", content: { title: "Mehr Buchungen erzielen", subtitle: "5 bewährte Tipps für Ihren Erfolg" } },
      { id: "tp4", type: "text", content: { text: "Sehr geehrte/r Partner/in,\n\nmit diesen einfachen Schritten können Sie Ihre Buchungszahlen auf FreizeitEngel deutlich steigern:" } },
      { id: "tp5", type: "text", content: { text: "1. 📸 Hochwertige Fotos: Professionelle Bilder steigern die Buchungsrate um bis zu 300%\n\n2. 📝 Detaillierte Beschreibungen: Erklären Sie, was Gäste erwartet\n\n3. 💰 Familien-Angebote: Familienpackete sind besonders beliebt\n\n4. ⭐ Bewertungen aktiv sammeln: Bitten Sie zufriedene Gäste um Feedback\n\n5. 🗓️ Verfügbarkeit aktualisieren: Regelmäßige Updates verbessern Ihr Ranking" } },
      { id: "bp3", type: "button", content: { text: "Jetzt optimieren", url: "https://freizeitengel.com/partner", color: "#059669" } },
      { id: "fop3", type: "footer", content: { text: "FreizeitEngel GmbH | Ihr Erfolg ist unser Ziel" } },
    ],
  },
  {
    id: "promo-partners",
    name: "Partner Sonderaktion",
    subject: "Exklusive Aktion: Ihre Erlebnisse als Featured-Partner hervorheben",
    targetGroup: "partners",
    blocks: [
      { id: "hp4", type: "hero", content: { title: "Werden Sie Featured-Partner!", subtitle: "Ihre Erlebnisse prominent auf der Startseite präsentieren", buttonText: "Jetzt bewerben", buttonUrl: "https://freizeitengel.com/partner", bgColor: "#7c3aed" } },
      { id: "tp6", type: "text", content: { text: "Sehr geehrte/r Partner/in,\n\nals Featured-Partner präsentieren wir Ihre Erlebnisse prominent auf unserer Startseite und in unseren Empfehlungen. Das bedeutet bis zu 5x mehr Sichtbarkeit!" } },
      { id: "fp3", type: "features", content: { feature1Title: "Startseite", feature1Text: "Prominent platziert auf der Startseite", feature2Title: "Newsletter", feature2Text: "Erwähnung in unserem wöchentlichen Newsletter", feature3Title: "Social Media", feature3Text: "Vorstellung auf unseren Social-Media-Kanälen" } },
      { id: "bp4", type: "button", content: { text: "Featured-Partner werden", url: "https://freizeitengel.com/partner", color: "#7c3aed" } },
      { id: "fop4", type: "footer", content: { text: "FreizeitEngel GmbH | Premium Partner-Programm" } },
    ],
  },
  {
    id: "update-partners",
    name: "Plattform-Update",
    subject: "Neue Features für Ihr Partner-Dashboard",
    targetGroup: "partners",
    blocks: [
      { id: "hp5", type: "header", content: { title: "Neue Features verfügbar!", subtitle: "Ihr Partner-Dashboard wurde erweitert" } },
      { id: "tp7", type: "text", content: { text: "Sehr geehrte/r Partner/in,\n\nwir haben Ihr Partner-Dashboard mit neuen Funktionen erweitert, die Ihnen die Verwaltung Ihrer Erlebnisse noch einfacher machen." } },
      { id: "tp8", type: "text", content: { text: "🆕 Was ist neu:\n\n• QR-Code Scanner: Scannen Sie Tickets direkt mit Ihrem Smartphone\n• Buchungsübersicht: Alle Buchungen auf einen Blick\n• Echtzeit-Verfügbarkeit: Kapazitäten automatisch verwalten\n• Google Calendar: Buchungen direkt in Ihren Kalender" } },
      { id: "bp5", type: "button", content: { text: "Neue Features testen", url: "https://freizeitengel.com/partner", color: "#1d4ed8" } },
      { id: "fop5", type: "footer", content: { text: "FreizeitEngel GmbH | Feedback? Antworten Sie einfach auf diese Mail." } },
    ],
  },
  {
    id: "welcome-subscribers",
    name: "Newsletter Willkommen",
    subject: "Danke für deine Anmeldung zum FreizeitEngel Newsletter!",
    targetGroup: "subscribers",
    blocks: [
      { id: "hs1", type: "hero", content: { title: "Newsletter-Anmeldung bestätigt!", subtitle: "Ab jetzt verpasst du keine Freizeit-Highlights mehr", buttonText: "Erlebnisse entdecken", buttonUrl: "https://freizeitengel.com", bgColor: "#059669" } },
      { id: "ts1", type: "text", content: { text: "Hallo {{name}},\n\ndanke, dass du dich für unseren Newsletter angemeldet hast! Du erhältst ab sofort regelmäßig die besten Freizeitangebote und exklusive Aktionen direkt in dein Postfach." } },
      { id: "ts2", type: "text", content: { text: "Das erwartet dich:\n\n🎯 Personalisierte Freizeit-Empfehlungen\n🏷️ Exklusive Newsletter-Rabatte\n🆕 Neue Partner und Erlebnisse als Erstes erfahren\n📅 Saisonale Veranstaltungstipps" } },
      { id: "bs1", type: "button", content: { text: "Dein erstes Erlebnis buchen", url: "https://freizeitengel.com", color: "#059669" } },
      { id: "fos1", type: "footer", content: { text: "FreizeitEngel GmbH | Abmeldung jederzeit möglich" } },
    ],
  },
  {
    id: "deals-subscribers",
    name: "Exklusive Angebote",
    subject: "Nur für Newsletter-Abonnenten: Exklusive Deals!",
    targetGroup: "subscribers",
    blocks: [
      { id: "hs2", type: "hero", content: { title: "Exklusive Newsletter-Deals", subtitle: "Nur für dich als Abonnent – spare bis zu 30%!", buttonText: "Deals ansehen", buttonUrl: "https://freizeitengel.com", bgColor: "#dc2626" } },
      { id: "ts3", type: "text", content: { text: "Hallo {{name}},\n\nals treuer Newsletter-Abonnent hast du Zugang zu unseren exklusiven Angeboten. Diese Deals gibt es nur hier und nur für begrenzte Zeit!" } },
      { id: "fs1", type: "features", content: { feature1Title: "Zoo Tageskarte", feature1Text: "Statt 18,50€ nur 14,99€", feature2Title: "Bowling 2h", feature2Text: "Gruppe ab 4 Pers. -20%", feature3Title: "Freizeitbad", feature3Text: "Familienkarte zum Sparpreis" } },
      { id: "bs2", type: "button", content: { text: "Alle Deals sichern", url: "https://freizeitengel.com", color: "#dc2626" } },
      { id: "fos2", type: "footer", content: { text: "FreizeitEngel GmbH | Angebote gültig solange der Vorrat reicht" } },
    ],
  },
  {
    id: "local-subscribers",
    name: "Lokale Empfehlungen",
    subject: "Die besten Freizeittipps in deiner Nähe",
    targetGroup: "subscribers",
    blocks: [
      { id: "hs3", type: "header", content: { title: "Freizeit in deiner Nähe", subtitle: "Handverlesene Empfehlungen aus deiner Region" } },
      { id: "ts4", type: "text", content: { text: "Hallo {{name}},\n\nentdecke die besten Freizeitangebote direkt vor deiner Haustür! Wir haben die Top-Erlebnisse aus NRW für dich zusammengestellt." } },
      { id: "ts5", type: "text", content: { text: "🗺️ Sauerland: Kletterpark, Bootstouren, Wanderabenteuer\n🏙️ Ruhrgebiet: Escape Rooms, Lasertag, Bowling\n🌳 Bergisches Land: Tierparks, Schwimmbäder, Minigolf\n🏔️ Siegerland: Paintball, Freizeitbäder, Indoor-Action" } },
      { id: "bs3", type: "button", content: { text: "Meine Region entdecken", url: "https://freizeitengel.com", color: "#4f46e5" } },
      { id: "fos3", type: "footer", content: { text: "FreizeitEngel GmbH | Dein lokaler Freizeit-Guide" } },
    ],
  },
  {
    id: "event-subscribers",
    name: "Event-Einladung",
    subject: "Du bist eingeladen: FreizeitEngel Live-Event!",
    targetGroup: "subscribers",
    blocks: [
      { id: "hs4", type: "hero", content: { title: "FreizeitEngel Live-Event", subtitle: "Lerne unsere Partner kennen und erlebe Freizeit hautnah!", buttonText: "Platz sichern", buttonUrl: "https://freizeitengel.com", bgColor: "#ea580c" } },
      { id: "ts6", type: "text", content: { text: "Hallo {{name}},\n\nwir laden dich herzlich zu unserem ersten FreizeitEngel Live-Event ein! Triff unsere Partner persönlich, teste Erlebnisse vor Ort und sichere dir exklusive Rabatte." } },
      { id: "ts7", type: "text", content: { text: "📅 Datum: Samstag, 15. März 2026\n📍 Ort: Freizeitpark NRW\n🕐 Zeit: 10:00 - 18:00 Uhr\n🎫 Eintritt: Kostenlos für Newsletter-Abonnenten" } },
      { id: "bs4", type: "button", content: { text: "Jetzt anmelden", url: "https://freizeitengel.com", color: "#ea580c" } },
      { id: "fos4", type: "footer", content: { text: "FreizeitEngel GmbH | Begrenzte Plätze verfügbar" } },
    ],
  },
  {
    id: "survey-subscribers",
    name: "Umfrage & Feedback",
    subject: "Hilf uns, besser zu werden – 3 Minuten Umfrage",
    targetGroup: "subscribers",
    blocks: [
      { id: "hs5", type: "header", content: { title: "Deine Meinung zählt!", subtitle: "Hilf uns, FreizeitEngel noch besser zu machen" } },
      { id: "ts8", type: "text", content: { text: "Hallo {{name}},\n\nwir möchten FreizeitEngel stetig verbessern und brauchen dafür dein Feedback! Die Umfrage dauert nur 3 Minuten." } },
      { id: "ts9", type: "text", content: { text: "Als Dankeschön verlosen wir unter allen Teilnehmern:\n\n🏆 1x Freizeitpaket im Wert von 200€\n🎁 5x 25€ FreizeitEngel-Gutscheine\n🎫 10x kostenlose Erlebnisse bei unseren Partnern" } },
      { id: "bs5", type: "button", content: { text: "An Umfrage teilnehmen", url: "https://freizeitengel.com", color: "#7c3aed" } },
      { id: "fos5", type: "footer", content: { text: "FreizeitEngel GmbH | Teilnahmeschluss: Ende des Monats" } },
    ],
  },
];

const AVAILABLE_BLOCKS: { type: TemplateBlock["type"]; label: string; icon: any; description: string }[] = [
  { type: "header", label: "Überschrift", icon: Type, description: "Titel und Untertitel" },
  { type: "hero", label: "Hero-Banner", icon: Layout, description: "Großer Banner mit Button" },
  { type: "text", label: "Textblock", icon: FileText, description: "Freitext-Absatz" },
  { type: "image", label: "Bild", icon: Image, description: "Bild mit optionalem Text" },
  { type: "button", label: "Button", icon: ExternalLink, description: "Call-to-Action Button" },
  { type: "features", label: "3er Raster", icon: Layout, description: "Drei Features nebeneinander" },
  { type: "divider", label: "Trennlinie", icon: GripVertical, description: "Horizontale Trennlinie" },
  { type: "spacer", label: "Abstand", icon: ArrowDown, description: "Vertikaler Abstand" },
  { type: "footer", label: "Footer", icon: Mail, description: "E-Mail Fußzeile" },
];

function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createEmptyBlock(type: TemplateBlock["type"]): TemplateBlock {
  const id = generateBlockId();
  switch (type) {
    case "header":
      return { id, type, content: { title: "Überschrift hier", subtitle: "Untertitel hier" } };
    case "hero":
      return { id, type, content: { title: "Hero Titel", subtitle: "Hero Untertitel", buttonText: "Jetzt entdecken", buttonUrl: "https://freizeitengel.com", bgColor: "#4f46e5" } };
    case "text":
      return { id, type, content: { text: "Ihr Text hier..." } };
    case "image":
      return { id, type, content: { url: "https://via.placeholder.com/600x200", alt: "Bildbeschreibung" } };
    case "button":
      return { id, type, content: { text: "Button Text", url: "https://freizeitengel.com", color: "#4f46e5" } };
    case "features":
      return { id, type, content: { feature1Title: "Feature 1", feature1Text: "Beschreibung", feature2Title: "Feature 2", feature2Text: "Beschreibung", feature3Title: "Feature 3", feature3Text: "Beschreibung" } };
    case "divider":
      return { id, type, content: {} };
    case "spacer":
      return { id, type, content: { height: "20" } };
    case "footer":
      return { id, type, content: { text: "FreizeitEngel GmbH | Ihr Freizeit-Portal" } };
    default:
      return { id, type, content: {} };
  }
}

function renderBlockToHtml(block: TemplateBlock): string {
  switch (block.type) {
    case "header":
      return `<div style="text-align:center;padding:30px 20px;">
        <h1 style="font-size:28px;font-weight:700;color:#1a1a2e;margin:0 0 8px 0;">${block.content.title || ""}</h1>
        ${block.content.subtitle ? `<p style="font-size:16px;color:#6b7280;margin:0;">${block.content.subtitle}</p>` : ""}
      </div>`;
    case "hero":
      return `<div style="background:${block.content.bgColor || "#4f46e5"};padding:48px 32px;text-align:center;border-radius:12px;">
        <h1 style="font-size:32px;font-weight:700;color:#ffffff;margin:0 0 12px 0;">${block.content.title || ""}</h1>
        <p style="font-size:18px;color:rgba(255,255,255,0.9);margin:0 0 24px 0;">${block.content.subtitle || ""}</p>
        ${block.content.buttonText ? `<a href="${block.content.buttonUrl || "#"}" style="display:inline-block;background:#ffffff;color:${block.content.bgColor || "#4f46e5"};padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">${block.content.buttonText}</a>` : ""}
      </div>`;
    case "text":
      return `<div style="padding:16px 20px;font-size:15px;line-height:1.7;color:#374151;">${(block.content.text || "").replace(/\n/g, "<br/>")}</div>`;
    case "image":
      return `<div style="text-align:center;padding:16px 0;">
        <img src="${block.content.url || ""}" alt="${block.content.alt || ""}" style="max-width:100%;border-radius:8px;" />
      </div>`;
    case "button":
      return `<div style="text-align:center;padding:24px 0;">
        <a href="${block.content.url || "#"}" style="display:inline-block;background:${block.content.color || "#4f46e5"};color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">${block.content.text || "Button"}</a>
      </div>`;
    case "features":
      return `<div style="display:flex;gap:16px;padding:24px 20px;">
        <div style="flex:1;text-align:center;padding:16px;background:#f9fafb;border-radius:8px;">
          <div style="font-weight:600;color:#1a1a2e;margin-bottom:4px;">${block.content.feature1Title || ""}</div>
          <div style="font-size:13px;color:#6b7280;">${block.content.feature1Text || ""}</div>
        </div>
        <div style="flex:1;text-align:center;padding:16px;background:#f9fafb;border-radius:8px;">
          <div style="font-weight:600;color:#1a1a2e;margin-bottom:4px;">${block.content.feature2Title || ""}</div>
          <div style="font-size:13px;color:#6b7280;">${block.content.feature2Text || ""}</div>
        </div>
        <div style="flex:1;text-align:center;padding:16px;background:#f9fafb;border-radius:8px;">
          <div style="font-weight:600;color:#1a1a2e;margin-bottom:4px;">${block.content.feature3Title || ""}</div>
          <div style="font-size:13px;color:#6b7280;">${block.content.feature3Text || ""}</div>
        </div>
      </div>`;
    case "divider":
      return `<div style="padding:16px 20px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" /></div>`;
    case "spacer":
      return `<div style="height:${block.content.height || "20"}px;"></div>`;
    case "footer":
      return `<div style="text-align:center;padding:24px 20px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">${(block.content.text || "").replace(/\n/g, "<br/>")}</div>`;
    default:
      return "";
  }
}

function blocksToFullHtml(blocks: TemplateBlock[]): string {
  const inner = blocks.map(renderBlockToHtml).join("");
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
${inner}
</div></body></html>`;
}

function BlockEditor({ block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
  block: TemplateBlock;
  onChange: (content: Record<string, string>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const blockInfo = AVAILABLE_BLOCKS.find(b => b.type === block.type);
  const Icon = blockInfo?.icon || FileText;

  return (
    <div className="border rounded-lg bg-white group hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium flex-1">{blockInfo?.label || block.type}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMoveUp} disabled={isFirst}>
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMoveDown} disabled={isLast}>
            <ArrowDown className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {block.type === "header" && (
          <>
            <Input placeholder="Titel" value={block.content.title || ""} onChange={(e) => onChange({ ...block.content, title: e.target.value })} className="font-semibold" />
            <Input placeholder="Untertitel" value={block.content.subtitle || ""} onChange={(e) => onChange({ ...block.content, subtitle: e.target.value })} className="text-sm" />
          </>
        )}
        {block.type === "hero" && (
          <>
            <Input placeholder="Hero Titel" value={block.content.title || ""} onChange={(e) => onChange({ ...block.content, title: e.target.value })} className="font-bold" />
            <Input placeholder="Hero Untertitel" value={block.content.subtitle || ""} onChange={(e) => onChange({ ...block.content, subtitle: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Button Text" value={block.content.buttonText || ""} onChange={(e) => onChange({ ...block.content, buttonText: e.target.value })} />
              <Input placeholder="Button URL" value={block.content.buttonUrl || ""} onChange={(e) => onChange({ ...block.content, buttonUrl: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">Hintergrundfarbe:</Label>
              <input type="color" value={block.content.bgColor || "#4f46e5"} onChange={(e) => onChange({ ...block.content, bgColor: e.target.value })} className="h-8 w-12 rounded cursor-pointer" />
            </div>
          </>
        )}
        {block.type === "text" && (
          <Textarea placeholder="Text eingeben..." value={block.content.text || ""} onChange={(e) => onChange({ ...block.content, text: e.target.value })} rows={4} />
        )}
        {block.type === "image" && (
          <>
            <Input placeholder="Bild-URL" value={block.content.url || ""} onChange={(e) => onChange({ ...block.content, url: e.target.value })} />
            <Input placeholder="Alternativtext" value={block.content.alt || ""} onChange={(e) => onChange({ ...block.content, alt: e.target.value })} />
          </>
        )}
        {block.type === "button" && (
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Button Text" value={block.content.text || ""} onChange={(e) => onChange({ ...block.content, text: e.target.value })} />
            <Input placeholder="Button URL" value={block.content.url || ""} onChange={(e) => onChange({ ...block.content, url: e.target.value })} />
            <div className="flex items-center gap-2 col-span-2">
              <Label className="text-xs whitespace-nowrap">Farbe:</Label>
              <input type="color" value={block.content.color || "#4f46e5"} onChange={(e) => onChange({ ...block.content, color: e.target.value })} className="h-8 w-12 rounded cursor-pointer" />
            </div>
          </div>
        )}
        {block.type === "features" && (
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Input placeholder="Feature 1 Titel" value={block.content.feature1Title || ""} onChange={(e) => onChange({ ...block.content, feature1Title: e.target.value })} className="text-xs" />
              <Input placeholder="Feature 1 Text" value={block.content.feature1Text || ""} onChange={(e) => onChange({ ...block.content, feature1Text: e.target.value })} className="text-xs" />
            </div>
            <div className="space-y-1">
              <Input placeholder="Feature 2 Titel" value={block.content.feature2Title || ""} onChange={(e) => onChange({ ...block.content, feature2Title: e.target.value })} className="text-xs" />
              <Input placeholder="Feature 2 Text" value={block.content.feature2Text || ""} onChange={(e) => onChange({ ...block.content, feature2Text: e.target.value })} className="text-xs" />
            </div>
            <div className="space-y-1">
              <Input placeholder="Feature 3 Titel" value={block.content.feature3Title || ""} onChange={(e) => onChange({ ...block.content, feature3Title: e.target.value })} className="text-xs" />
              <Input placeholder="Feature 3 Text" value={block.content.feature3Text || ""} onChange={(e) => onChange({ ...block.content, feature3Text: e.target.value })} className="text-xs" />
            </div>
          </div>
        )}
        {block.type === "spacer" && (
          <div className="flex items-center gap-2">
            <Label className="text-xs">Höhe (px):</Label>
            <Input type="number" value={block.content.height || "20"} onChange={(e) => onChange({ ...block.content, height: e.target.value })} className="w-24" />
          </div>
        )}
        {block.type === "footer" && (
          <Textarea placeholder="Footer-Text" value={block.content.text || ""} onChange={(e) => onChange({ ...block.content, text: e.target.value })} rows={2} />
        )}
        {block.type === "divider" && (
          <div className="text-center text-xs text-muted-foreground py-1">Horizontale Trennlinie</div>
        )}
      </div>
    </div>
  );
}

export default function AdminMailingPage() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [systemEmailSearch, setSystemEmailSearch] = useState("");
  const [systemEmailCategory, setSystemEmailCategory] = useState("all");
  const [systemEmailDialogOpen, setSystemEmailDialogOpen] = useState(false);
  const [selectedSystemEmail, setSelectedSystemEmail] = useState<SystemEmailTemplate | null>(null);
  const [systemEmailDraft, setSystemEmailDraft] = useState({ subject: "", bodyHtml: "", enabled: true });
  const [testRecipient, setTestRecipient] = useState("");

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "",
    content: "",
    recipientType: "all",
  });

  const [builderBlocks, setBuilderBlocks] = useState<TemplateBlock[]>([]);
  const [builderName, setBuilderName] = useState("");
  const [builderSubject, setBuilderSubject] = useState("");
  const [builderRecipientType, setBuilderRecipientType] = useState("all");
  const [draggedBlockType, setDraggedBlockType] = useState<TemplateBlock["type"] | null>(null);

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<EmailCampaign[]>({
    queryKey: ["/api/admin/campaigns"],
  });

  const { data: subscribers = [], isLoading: subscribersLoading } = useQuery<NewsletterSubscriber[]>({
    queryKey: ["/api/newsletter/signups"],
  });

  const { data: systemEmailTemplates = [], isLoading: systemEmailsLoading } = useQuery<SystemEmailTemplate[]>({
    queryKey: ["/api/admin/system-email-templates"],
  });

  const refreshSystemEmails = () =>
    queryClient.invalidateQueries({ queryKey: ["/api/admin/system-email-templates"] });

  const saveSystemEmailMutation = useMutation({
    mutationFn: async ({ key, data }: { key: string; data: { subject: string; bodyHtml: string; enabled: boolean } }) => {
      await apiRequest("PATCH", `/api/admin/system-email-templates/${key}`, data);
    },
    onSuccess: () => {
      refreshSystemEmails();
      setSystemEmailDialogOpen(false);
      toast({ title: "Automatische E-Mail gespeichert" });
    },
    onError: () => toast({ title: "Speichern fehlgeschlagen", description: "Die Änderungen konnten nicht gespeichert werden.", variant: "destructive" }),
  });

  const resetSystemEmailMutation = useMutation({
    mutationFn: async (key: string) => {
      await apiRequest("POST", `/api/admin/system-email-templates/${key}/reset`);
    },
    onSuccess: () => {
      refreshSystemEmails();
      setSystemEmailDialogOpen(false);
      toast({ title: "Standardvorlage wiederhergestellt" });
    },
    onError: () => toast({ title: "Zurücksetzen fehlgeschlagen", variant: "destructive" }),
  });

  const previewSystemEmailMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await apiRequest("POST", `/api/admin/system-email-templates/${key}/preview`);
      return response.json() as Promise<{ subject: string; html: string }>;
    },
    onSuccess: (preview) => {
      setPreviewHtml(preview.html);
      setPreviewOpen(true);
    },
    onError: () => toast({ title: "Vorschau fehlgeschlagen", variant: "destructive" }),
  });

  const testSystemEmailMutation = useMutation({
    mutationFn: async ({ key, toEmail }: { key: string; toEmail: string }) => {
      await apiRequest("POST", `/api/admin/system-email-templates/${key}/test-send`, { toEmail });
    },
    onSuccess: () => toast({ title: "Test-E-Mail versendet", description: "Bitte prüfen Sie das angegebene Postfach." }),
    onError: () => toast({ title: "Testversand fehlgeschlagen", description: "Bitte prüfen Sie die E-Mail-Adresse und versuchen Sie es erneut.", variant: "destructive" }),
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/campaigns", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      setCreateDialogOpen(false);
      setNewCampaign({ name: "", subject: "", content: "", recipientType: "all" });
      toast({ title: "Kampagne erstellt" });
    },
    onError: () => {
      toast({ title: "Fehler", description: "Kampagne konnte nicht erstellt werden.", variant: "destructive" });
    },
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/admin/campaigns/${id}/send`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      toast({ title: "Kampagne versendet" });
    },
    onError: () => {
      toast({ title: "Fehler", description: "Versand fehlgeschlagen.", variant: "destructive" });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      toast({ title: "Kampagne gelöscht" });
    },
    onError: () => {
      toast({ title: "Fehler", variant: "destructive" });
    },
  });

  const downloadCSV = () => {
    const csvContent = [
      ["Name", "E-Mail", "Anmeldedatum"],
      ...subscribers.map(sub => [
        sub.name || "",
        sub.email,
        format(new Date(sub.createdAt), "dd.MM.yyyy HH:mm", { locale: de })
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `newsletter-abonnenten-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadTemplate = (template: EmailTemplate) => {
    setBuilderBlocks(template.blocks.map(b => ({ ...b, id: generateBlockId() })));
    setBuilderName(template.name);
    setBuilderSubject(template.subject);
    setBuilderRecipientType(template.targetGroup);
    toast({ title: "Vorlage geladen", description: `"${template.name}" wurde in den Builder geladen.` });
  };

  const openPreview = (html: string) => {
    setPreviewHtml(html);
    setPreviewOpen(true);
  };

  const previewTemplate = (template: EmailTemplate) => {
    const html = blocksToFullHtml(template.blocks);
    openPreview(html);
  };

  const previewBuilder = () => {
    if (builderBlocks.length === 0) {
      toast({ title: "Keine Blöcke", description: "Fügen Sie zuerst Blöcke zum Builder hinzu.", variant: "destructive" });
      return;
    }
    const html = blocksToFullHtml(builderBlocks);
    openPreview(html);
  };

  const saveBuilderAsCampaign = () => {
    if (!builderName || !builderSubject || builderBlocks.length === 0) {
      toast({ title: "Fehlende Angaben", description: "Name, Betreff und mindestens ein Block sind erforderlich.", variant: "destructive" });
      return;
    }
    const html = blocksToFullHtml(builderBlocks);
    createCampaignMutation.mutate({
      name: builderName,
      subject: builderSubject,
      content: html,
      recipientType: builderRecipientType,
    });
    setBuilderBlocks([]);
    setBuilderName("");
    setBuilderSubject("");
  };

  const addBlock = (type: TemplateBlock["type"]) => {
    setBuilderBlocks(prev => [...prev, createEmptyBlock(type)]);
  };

  const updateBlock = (index: number, content: Record<string, string>) => {
    setBuilderBlocks(prev => prev.map((b, i) => i === index ? { ...b, content } : b));
  };

  const deleteBlock = (index: number) => {
    setBuilderBlocks(prev => prev.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    setBuilderBlocks(prev => {
      const arr = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedBlockType) {
      addBlock(draggedBlockType);
      setDraggedBlockType(null);
    }
  };

  const sentCampaigns = campaigns.filter(c => c.status === "sent");
  const avgOpenRate = sentCampaigns.length > 0
    ? sentCampaigns.reduce((sum, c) => sum + (c.recipientCount > 0 ? (c.openCount / c.recipientCount) * 100 : 0), 0) / sentCampaigns.length
    : 0;

  const filteredTemplates = templateFilter === "all"
    ? PREDEFINED_TEMPLATES
    : PREDEFINED_TEMPLATES.filter(t => t.targetGroup === templateFilter);

  const targetGroupLabels: Record<string, string> = {
    all: "Alle Nutzer",
    subscribers: "Newsletter-Abonnenten",
    partners: "Partner",
  };

  const targetGroupColors: Record<string, string> = {
    all: "bg-blue-100 text-blue-700",
    subscribers: "bg-green-100 text-green-700",
    partners: "bg-purple-100 text-purple-700",
  };

  const systemEmailCategories = Array.from(new Set(systemEmailTemplates.map(template => template.category))).sort();
  const filteredSystemEmails = systemEmailTemplates.filter((template) => {
    const matchesCategory = systemEmailCategory === "all" || template.category === systemEmailCategory;
    const searchText = `${template.name} ${template.subject} ${template.key}`.toLocaleLowerCase("de");
    return matchesCategory && searchText.includes(systemEmailSearch.toLocaleLowerCase("de"));
  });

  const openSystemEmailEditor = (template: SystemEmailTemplate) => {
    setSelectedSystemEmail(template);
    setSystemEmailDraft({ subject: template.subject, bodyHtml: template.bodyHtml, enabled: template.enabled });
    setTestRecipient("");
    setSystemEmailDialogOpen(true);
  };

  const toggleSystemEmail = (template: SystemEmailTemplate, enabled: boolean) => {
    saveSystemEmailMutation.mutate({
      key: template.key,
      data: { subject: template.subject, bodyHtml: template.bodyHtml, enabled },
    });
  };

  const isLoading = campaignsLoading || subscribersLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">E-Mail Marketing</h1>
        <p className="text-muted-foreground mt-1">Newsletter-Kampagnen erstellen, Vorlagen nutzen und Abonnenten verwalten</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Abonnenten</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribers.length}</div>
            <p className="text-xs text-muted-foreground">
              +{subscribers.filter(sub => new Date(sub.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} diese Woche
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kampagnen</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">{campaigns.filter(c => c.status === "draft").length} Entwürfe</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Versendet</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">{sentCampaigns.reduce((sum, c) => sum + c.recipientCount, 0)} Empfänger</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Öffnungsrate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOpenRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Durchschnitt aller Kampagnen</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="system-emails" className="space-y-6">
        <TabsList className="grid h-auto w-full max-w-3xl grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="system-emails" className="flex items-center gap-1.5">
            <Settings2 className="h-4 w-4" />
            Automatische E-Mails
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            Vorlagen
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-1.5">
            <Layout className="h-4 w-4" />
            Builder
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-1.5">
            <Mail className="h-4 w-4" />
            Kampagnen
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            Abonnenten
          </TabsTrigger>
        </TabsList>

        {/* ===== AUTOMATISCHE E-MAILS TAB ===== */}
        <TabsContent value="system-emails" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Automatische E-Mails</CardTitle>
                  <CardDescription>
                    Diese Nachrichten werden durch Vorgänge auf der Plattform ausgelöst, z. B. bei Buchungen oder Kontoänderungen.
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={systemEmailSearch}
                      onChange={(event) => setSystemEmailSearch(event.target.value)}
                      placeholder="E-Mail suchen ..."
                      className="pl-9 sm:w-56"
                    />
                  </div>
                  <Select value={systemEmailCategory} onValueChange={setSystemEmailCategory}>
                    <SelectTrigger className="sm:w-48"><SelectValue placeholder="Kategorie" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Kategorien</SelectItem>
                      {systemEmailCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {systemEmailsLoading ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Automatische E-Mails werden geladen ...</div>
              ) : filteredSystemEmails.length === 0 ? (
                <div className="py-10 text-center">
                  <Mail className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="font-medium">Keine automatischen E-Mails gefunden</p>
                  <p className="text-sm text-muted-foreground">Passen Sie Suche oder Kategorie an.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSystemEmails.map((template) => (
                    <div key={template.key} className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{template.name}</p>
                          <Badge variant="secondary">{template.category}</Badge>
                          {template.customized && <Badge variant="outline">Angepasst</Badge>}
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">{template.subject}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={template.enabled}
                            onCheckedChange={(enabled) => toggleSystemEmail(template, enabled)}
                            disabled={saveSystemEmailMutation.isPending}
                            aria-label={`${template.name} ${template.enabled ? "deaktivieren" : "aktivieren"}`}
                          />
                          <span className="text-sm">{template.enabled ? "Aktiv" : "Inaktiv"}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => previewSystemEmailMutation.mutate(template.key)}>
                          <Eye className="mr-1.5 h-4 w-4" /> Vorschau
                        </Button>
                        <Button size="sm" onClick={() => openSystemEmailEditor(template)}>
                          Bearbeiten
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== VORLAGEN TAB ===== */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle>E-Mail Vorlagen</CardTitle>
                  <CardDescription>Vordefinierte E-Mail-Templates für jede Zielgruppe – anpassen, Vorschau ansehen und als Kampagne verwenden</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Zielgruppe:</Label>
                  <Select value={templateFilter} onValueChange={setTemplateFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Zielgruppen</SelectItem>
                      <SelectItem value="subscribers">Newsletter-Abonnenten</SelectItem>
                      <SelectItem value="partners">Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="border hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{template.name}</CardTitle>
                          <CardDescription className="text-xs mt-1 truncate">{template.subject}</CardDescription>
                        </div>
                        <Badge variant="secondary" className={`ml-2 text-xs shrink-0 ${targetGroupColors[template.targetGroup] || ""}`}>
                          {targetGroupLabels[template.targetGroup] || template.targetGroup}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <FileText className="h-3 w-3" />
                        {template.blocks.length} Blöcke
                        <span className="mx-1">·</span>
                        {template.blocks.map(b => b.type).filter((v, i, a) => a.indexOf(v) === i).join(", ")}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => previewTemplate(template)}>
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Vorschau
                        </Button>
                        <Button size="sm" className="flex-1" onClick={() => loadTemplate(template)}>
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          In Builder laden
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== BUILDER TAB ===== */}
        <TabsContent value="builder" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Block-Palette */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Bausteine</CardTitle>
                  <CardDescription className="text-xs">Blöcke per Drag & Drop oder Klick hinzufügen</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {AVAILABLE_BLOCKS.map((block) => {
                    const Icon = block.icon;
                    return (
                      <div
                        key={block.type}
                        draggable
                        onDragStart={() => setDraggedBlockType(block.type)}
                        onDragEnd={() => setDraggedBlockType(null)}
                        onClick={() => addBlock(block.type)}
                        className="flex items-center gap-2 p-2.5 rounded-lg border cursor-grab hover:bg-muted/50 hover:border-primary/30 transition-colors active:cursor-grabbing"
                      >
                        <div className="p-1.5 bg-muted rounded">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{block.label}</div>
                          <div className="text-xs text-muted-foreground">{block.description}</div>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Builder-Fläche */}
            <div className="lg:col-span-3 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Newsletter zusammenstellen</CardTitle>
                  <CardDescription className="text-xs">Kampagnendetails und Inhalt per Drag & Drop aufbauen</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Kampagnenname</Label>
                      <Input placeholder="z.B. Frühlings-Newsletter" value={builderName} onChange={(e) => setBuilderName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Betreff</Label>
                      <Input placeholder="E-Mail Betreffzeile" value={builderSubject} onChange={(e) => setBuilderSubject(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Empfängergruppe</Label>
                      <Select value={builderRecipientType} onValueChange={setBuilderRecipientType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Abonnenten</SelectItem>
                          <SelectItem value="subscribers">Nur Newsletter-Abonnenten</SelectItem>
                          <SelectItem value="partners">Partner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`space-y-3 min-h-[200px] rounded-lg border-2 border-dashed p-4 transition-colors ${
                      draggedBlockType ? "border-primary bg-primary/5" : "border-muted"
                    }`}
                  >
                    {builderBlocks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Layout className="h-12 w-12 text-muted-foreground/40 mb-4" />
                        <h3 className="font-medium text-muted-foreground mb-1">Newsletter-Builder</h3>
                        <p className="text-sm text-muted-foreground/70 max-w-sm">
                          Ziehen Sie Bausteine aus der linken Palette hierher oder klicken Sie auf einen Baustein, um ihn hinzuzufügen.
                          Alternativ können Sie eine Vorlage aus dem Vorlagen-Tab laden.
                        </p>
                      </div>
                    ) : (
                      builderBlocks.map((block, index) => (
                        <BlockEditor
                          key={block.id}
                          block={block}
                          onChange={(content) => updateBlock(index, content)}
                          onDelete={() => deleteBlock(index)}
                          onMoveUp={() => moveBlock(index, "up")}
                          onMoveDown={() => moveBlock(index, "down")}
                          isFirst={index === 0}
                          isLast={index === builderBlocks.length - 1}
                        />
                      ))
                    )}
                  </div>

                  {builderBlocks.length > 0 && (
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm text-muted-foreground">
                        {builderBlocks.length} {builderBlocks.length === 1 ? "Block" : "Blöcke"}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setBuilderBlocks([]); setBuilderName(""); setBuilderSubject(""); }}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Zurücksetzen
                        </Button>
                        <Button variant="outline" onClick={previewBuilder}>
                          <Eye className="h-4 w-4 mr-1" />
                          Vorschau
                        </Button>
                        <Button onClick={saveBuilderAsCampaign} disabled={createCampaignMutation.isPending}>
                          <Send className="h-4 w-4 mr-1" />
                          {createCampaignMutation.isPending ? "Speichern..." : "Als Kampagne speichern"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===== KAMPAGNEN TAB ===== */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>E-Mail Kampagnen</CardTitle>
                  <CardDescription>Alle erstellten Kampagnen verwalten und versenden</CardDescription>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Neue Kampagne
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Keine Kampagnen</h3>
                  <p className="text-muted-foreground mb-4">Erstellen Sie Ihre erste E-Mail-Kampagne oder nutzen Sie den Builder.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Betreff</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Empfänger</TableHead>
                        <TableHead>Öffnungen</TableHead>
                        <TableHead>Versendet</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((campaign) => {
                          const config = statusConfig[campaign.status] || statusConfig.draft;
                          return (
                            <TableRow key={campaign.id}>
                              <TableCell className="font-medium">{campaign.name}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{campaign.subject}</TableCell>
                              <TableCell>
                                <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
                              </TableCell>
                              <TableCell>{campaign.recipientCount}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3 text-muted-foreground" />
                                  {campaign.openCount}
                                </div>
                              </TableCell>
                              <TableCell>
                                {campaign.sentAt ? (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    {format(new Date(campaign.sentAt), "dd.MM.yyyy HH:mm", { locale: de })}
                                  </div>
                                ) : "–"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {campaign.content && campaign.content.startsWith("<!DOCTYPE") && (
                                    <Button size="sm" variant="ghost" onClick={() => openPreview(campaign.content)}>
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  {campaign.status === "draft" && (
                                    <Button size="sm" variant="outline" onClick={() => sendCampaignMutation.mutate(campaign.id)} disabled={sendCampaignMutation.isPending}>
                                      <Send className="h-3 w-3 mr-1" />
                                      Senden
                                    </Button>
                                  )}
                                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteCampaignMutation.mutate(campaign.id)} disabled={deleteCampaignMutation.isPending}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ABONNENTEN TAB ===== */}
        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Newsletter Abonnenten</CardTitle>
                  <CardDescription>Alle E-Mail-Adressen, die sich für den FreizeitEngel Newsletter angemeldet haben</CardDescription>
                </div>
                <Button onClick={downloadCSV} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  CSV Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {subscribers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Noch keine Abonnenten</h3>
                  <p className="text-muted-foreground">Sobald sich jemand für den Newsletter anmeldet, erscheinen die Daten hier.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>E-Mail Adresse</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Anmeldedatum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscribers
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((subscriber) => (
                          <TableRow key={subscriber.id}>
                            <TableCell className="font-medium">{subscriber.email}</TableCell>
                            <TableCell>{subscriber.name || <span className="text-muted-foreground italic">Nicht angegeben</span>}</TableCell>
                            <TableCell>{format(new Date(subscriber.createdAt), "dd.MM.yyyy 'um' HH:mm", { locale: de })}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Einfache Kampagne erstellen Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Neue Kampagne erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kampagnenname</Label>
              <Input placeholder="z.B. Frühlings-Newsletter 2026" value={newCampaign.name} onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Betreff</Label>
              <Input placeholder="z.B. Neue Freizeiterlebnisse in deiner Nähe!" value={newCampaign.subject} onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Inhalt</Label>
              <Textarea placeholder="E-Mail-Inhalt eingeben..." rows={6} value={newCampaign.content} onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Empfängergruppe</Label>
              <Select value={newCampaign.recipientType} onValueChange={(value) => setNewCampaign({ ...newCampaign, recipientType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Empfänger wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Abonnenten</SelectItem>
                  <SelectItem value="subscribers">Nur Newsletter-Abonnenten</SelectItem>
                  <SelectItem value="partners">Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={() => createCampaignMutation.mutate(newCampaign)} disabled={!newCampaign.name || !newCampaign.subject || !newCampaign.content || createCampaignMutation.isPending}>
              {createCampaignMutation.isPending ? "Erstellen..." : "Kampagne erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Automatische E-Mail bearbeiten */}
      <Dialog open={systemEmailDialogOpen} onOpenChange={setSystemEmailDialogOpen}>
        <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Automatische E-Mail bearbeiten</DialogTitle>
            {selectedSystemEmail && (
              <p className="text-sm text-muted-foreground">
                {selectedSystemEmail.name} · wird automatisch bei „{selectedSystemEmail.category}“ verwendet
              </p>
            )}
          </DialogHeader>
          {selectedSystemEmail && (
            <div className="grid gap-6 py-2 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                  <div>
                    <Label htmlFor="system-email-enabled">Automatischen Versand aktivieren</Label>
                    <p className="text-xs text-muted-foreground">Deaktivierte E-Mails werden nicht versendet.</p>
                  </div>
                  <Switch
                    id="system-email-enabled"
                    checked={systemEmailDraft.enabled}
                    onCheckedChange={(enabled) => setSystemEmailDraft(draft => ({ ...draft, enabled }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="system-email-subject">Betreff</Label>
                  <Input
                    id="system-email-subject"
                    value={systemEmailDraft.subject}
                    onChange={(event) => setSystemEmailDraft(draft => ({ ...draft, subject: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label htmlFor="system-email-body">E-Mail-Inhalt (HTML)</Label>
                    <span className="text-xs text-muted-foreground">HTML wird direkt als E-Mail dargestellt.</span>
                  </div>
                  <Textarea
                    id="system-email-body"
                    value={systemEmailDraft.bodyHtml}
                    onChange={(event) => setSystemEmailDraft(draft => ({ ...draft, bodyHtml: event.target.value }))}
                    className="min-h-[280px] font-mono text-xs"
                    spellCheck={false}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Verfügbare Platzhalter</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSystemEmail.variables.length > 0 ? selectedSystemEmail.variables.map((variable) => (
                      <Badge key={variable} variant="secondary" className="font-mono text-xs">{variable}</Badge>
                    )) : (
                      <span className="text-sm text-muted-foreground">Für diese E-Mail sind keine Platzhalter verfügbar.</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Kopieren Sie einen Platzhalter genau so in Betreff oder Inhalt.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Vorschau Ihrer Änderungen</Label>
                  <div className="overflow-hidden rounded-lg border bg-muted/30 p-2">
                    <iframe
                      title="Vorschau der automatischen E-Mail"
                      srcDoc={systemEmailDraft.bodyHtml}
                      className="h-[360px] w-full rounded bg-white"
                      sandbox=""
                    />
                  </div>
                </div>
                <div className="space-y-3 rounded-lg border p-4">
                  <div>
                    <Label htmlFor="system-email-test-recipient">Test-E-Mail senden</Label>
                    <p className="text-xs text-muted-foreground">Versendet die aktuell gespeicherte Vorlage an diese Adresse.</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="system-email-test-recipient"
                      type="email"
                      value={testRecipient}
                      onChange={(event) => setTestRecipient(event.target.value)}
                      placeholder="name@beispiel.de"
                    />
                    <Button
                      variant="outline"
                      onClick={() => testSystemEmailMutation.mutate({ key: selectedSystemEmail.key, toEmail: testRecipient })}
                      disabled={!testRecipient || testSystemEmailMutation.isPending}
                    >
                      <Send className="mr-1.5 h-4 w-4" />
                      {testSystemEmailMutation.isPending ? "Sende ..." : "Test senden"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <div>
              {selectedSystemEmail?.customized && (
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => resetSystemEmailMutation.mutate(selectedSystemEmail.key)}
                  disabled={resetSystemEmailMutation.isPending}
                >
                  <RotateCcw className="mr-1.5 h-4 w-4" />
                  {resetSystemEmailMutation.isPending ? "Setze zurück ..." : "Standard wiederherstellen"}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSystemEmailDialogOpen(false)}>Abbrechen</Button>
              <Button
                onClick={() => saveSystemEmailMutation.mutate({
                  key: selectedSystemEmail!.key,
                  data: systemEmailDraft,
                })}
                disabled={!systemEmailDraft.subject || !systemEmailDraft.bodyHtml || saveSystemEmailMutation.isPending}
              >
                {saveSystemEmailMutation.isPending ? "Speichere ..." : "Änderungen speichern"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vorschau Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              E-Mail Vorschau
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <div className="bg-gray-100 rounded-lg p-4 overflow-auto max-h-[65vh]">
              <div className="mx-auto max-w-[620px]" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
