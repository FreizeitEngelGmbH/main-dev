import { Cake, GraduationCap, Briefcase, type LucideIcon } from "lucide-react";

import kidsBirthdayHero from "@assets/event_groups/hero/kids_birthday.png";
import schoolClassHero from "@assets/event_groups/hero/school_class.png";
import companyEventHero from "@assets/event_groups/hero/company_event.png";

import eloriaBottropLogo from "@assets/event_groups/logos/eloria_bottrop.png";
import jumpXlDortmundLogo from "@assets/event_groups/logos/jump_xl_dortmund.png";
import funplexDortmundLogo from "@assets/event_groups/logos/funplex_dortmund.png";
import laserzoneDuesseldorfLogo from "@assets/event_groups/logos/laserzone_duesseldorf.png";
import zooDuisburgLogo from "@assets/event_groups/logos/zoo_duisburg.png";
import zooDortmundLogo from "@assets/event_groups/logos/zoo_dortmund.png";
import lehmbruckMuseumLogo from "@assets/event_groups/logos/lehmbruck_museum.png";
import lasertagEvolutionLogo from "@assets/event_groups/logos/lasertag_evolution_dus.png";
import escapeRoomKeyFreeLogo from "@assets/event_groups/logos/escape_room_key_free_dortmund.png";
import placeholderLogo from "@assets/event_groups/logos/placeholder_logo.png";

export type EventPartner = {
  id: number;
  name: string;
  logo: string;
  city: string;
  badge?: string;
  description?: string;
};

export type EventStep = {
  title: string;
  text: string;
};

export type EventCategory = {
  key: string;
  title: string;
  subtitle: string;
  longDescription: string;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  ribbon: string;
  bgImage: string;
  bullets: string[];
  highlights: string[];
  steps: EventStep[];
  partners: EventPartner[];
  cta: string;
  metaTitle: string;
  metaDescription: string;
};

export const EVENT_CATEGORIES: EventCategory[] = [
  {
    key: "kids",
    title: "Kindergeburtstage",
    subtitle: "Unvergesslich für die Kids – stressfrei für Eltern.",
    longDescription:
      "Ob Trampolinpark, Lasertag, Escape Game oder Indoorspielplatz – bei diesen Anbietern feiert euer Kind einen Geburtstag, über den noch lange gesprochen wird. Ihr wählt den passenden Partner, wir kümmern uns um Anfrage, Terminabstimmung und Sammelzahlung.",
    icon: Cake,
    gradient: "from-[#6C2BD9] to-[#3D1A78]",
    iconBg: "bg-[#6C2BD9]",
    ribbon: "Ab 99 €",
    bgImage: kidsBirthdayHero,
    bullets: ["Eigener Bereich", "Kuchen & Getränke", "Betreuer inklusive"],
    highlights: [
      "Eigener Partybereich für eure Gruppe",
      "Betreuung durch geschultes Personal",
      "Kuchen, Snacks & Getränke buchbar",
      "Einladungskarten zum Ausdrucken",
      "Kleine Überraschung fürs Geburtstagskind",
      "Flexible Terminwahl auch am Wochenende",
    ],
    steps: [
      { title: "Anbieter wählen", text: "Sucht euch aus den Partnern unten euer Wunsch-Erlebnis aus." },
      { title: "Anfrage senden", text: "Datum, Uhrzeit und Anzahl der Kinder unverbindlich anfragen." },
      { title: "Feiern & entspannen", text: "Bestätigung erhalten, Sammelzahlung nutzen – und den Tag genießen." },
    ],
    partners: [
      { id: 273, name: "Eloria Erlebnisfabrik", logo: eloriaBottropLogo, city: "Bottrop", badge: "Escape Game", description: "Spannende Rätsel-Abenteuer für kleine Detektive." },
      { id: 176, name: "Jump XL Dortmund", logo: jumpXlDortmundLogo, city: "Dortmund", badge: "Trampolin", description: "Springen, toben und Spaß haben auf riesigen Trampolinen." },
      { id: 657, name: "Funplex Dortmund", logo: funplexDortmundLogo, city: "Dortmund", badge: "Indoorspielplatz", description: "Klettern, rutschen, spielen – wetterunabhängiger Riesenspaß." },
      { id: 215, name: "LaserZone Düsseldorf", logo: laserzoneDuesseldorfLogo, city: "Düsseldorf", badge: "Lasertag", description: "Action-Lasertag in coolen Arenen für ältere Kids." },
    ],
    cta: "Geburtstag planen",
    metaTitle: "Kindergeburtstag planen – Anbieter & Ideen | FreizeitEngel",
    metaDescription:
      "Kindergeburtstag feiern bei geprüften Anbietern: Trampolin, Lasertag, Escape Game & mehr. Jetzt Partner wählen, unverbindlich anfragen und mit Sammelzahlung feiern.",
  },
  {
    key: "school",
    title: "Schulklassen & Ausflüge",
    subtitle: "Lernen, erleben und Teamgeist stärken.",
    longDescription:
      "Vom Zoo über Museen bis zum Kletterzentrum: Diese Partner bieten pädagogisch begleitete Programme für Schulklassen und Gruppen. Lehrkräfte fahren oft frei mit, die Abrechnung läuft bequem über eine Sammelrechnung.",
    icon: GraduationCap,
    gradient: "from-[#6C2BD9] to-[#3D1A78]",
    iconBg: "bg-[#6C2BD9]",
    ribbon: "Gruppen-Rabatt",
    bgImage: schoolClassHero,
    bullets: ["Pädagogisches Begleitprogramm", "Lehrkraft frei", "Sammelrechnung"],
    highlights: [
      "Pädagogisch begleitete Programme",
      "Gruppen-Rabatte ab 10 Personen",
      "Freiplätze für begleitende Lehrkräfte",
      "Bequeme Sammelrechnung für die Schule",
      "Themen für jede Altersstufe",
      "Gut mit ÖPNV erreichbar",
    ],
    steps: [
      { title: "Ziel auswählen", text: "Passendes Erlebnis für eure Klassenstufe finden." },
      { title: "Termin anfragen", text: "Datum und Teilnehmerzahl angeben – wir prüfen die Verfügbarkeit." },
      { title: "Auf Rechnung buchen", text: "Bestätigung und Sammelrechnung für die Schule erhalten." },
    ],
    partners: [
      { id: 188, name: "Zoo Duisburg", logo: zooDuisburgLogo, city: "Duisburg", badge: "Zoo-Führung", description: "Tierische Erlebnisführungen mit Lerneffekt." },
      { id: 160, name: "Zoo Dortmund", logo: zooDortmundLogo, city: "Dortmund", badge: "Tierpark", description: "Entdeckungstouren durch die Tierwelt." },
      { id: 204, name: "Lehmbruck Museum", logo: lehmbruckMuseumLogo, city: "Duisburg", badge: "Museum", description: "Kunst zum Anfassen mit museumspädagogischem Programm." },
      { id: 151, name: "DAV Kletterzentrum", logo: placeholderLogo, city: "Siegen", badge: "Klettern", description: "Teamgeist und Bewegung an der Kletterwand." },
    ],
    cta: "Klassenausflug buchen",
    metaTitle: "Klassenausflug & Schulausflug buchen – Anbieter | FreizeitEngel",
    metaDescription:
      "Schulausflüge mit pädagogischem Programm: Zoo, Museum, Klettern & mehr. Gruppen-Rabatte, Lehrkraft frei und bequeme Sammelrechnung. Jetzt Anbieter anfragen.",
  },
  {
    key: "company",
    title: "Firmenevents & Teambuilding",
    subtitle: "Vom Sommerfest bis zum Incentive – alles möglich.",
    longDescription:
      "Stärkt euer Team mit einem gemeinsamen Erlebnis: Lasertag, Escape Rooms, Kartfahren oder ein individuelles Event-Paket. Räume und Catering sind buchbar, und für Firmen läuft alles bequem auf Rechnung.",
    icon: Briefcase,
    gradient: "from-[#6C2BD9] to-[#3D1A78]",
    iconBg: "bg-[#6C2BD9]",
    ribbon: "Auf Rechnung",
    bgImage: companyEventHero,
    bullets: ["Catering-Optionen", "Räume buchbar", "Rechnungskauf für Firmen"],
    highlights: [
      "Maßgeschneiderte Event-Pakete",
      "Räume & Locations buchbar",
      "Catering-Optionen für jede Gruppe",
      "Rechnungskauf für Firmen",
      "Persönlicher Event-Berater",
      "Teambuilding mit Wow-Effekt",
    ],
    steps: [
      { title: "Erlebnis wählen", text: "Aktivität passend zu Teamgröße und Ziel auswählen." },
      { title: "Paket anfragen", text: "Wünsche zu Catering, Räumen und Ablauf angeben." },
      { title: "Auf Rechnung buchen", text: "Individuelles Angebot erhalten und bequem auf Rechnung buchen." },
    ],
    partners: [
      { id: 216, name: "LaserTag Evolution", logo: lasertagEvolutionLogo, city: "Düsseldorf", badge: "Lasertag-Arena", description: "Adrenalin pur für Teams jeder Größe." },
      { id: 273, name: "Eloria Erlebnisfabrik", logo: eloriaBottropLogo, city: "Bottrop", badge: "Escape Rooms", description: "Gemeinsam knobeln und den Teamgeist testen." },
      { id: 175, name: "Escape Room Key&Free", logo: escapeRoomKeyFreeLogo, city: "Dortmund", badge: "Escape Game", description: "Spannende Missionen für clevere Teams." },
      { id: 316, name: "Kartarena GmbH", logo: placeholderLogo, city: "Dinslaken", badge: "Kartfahren", description: "Rennsport-Feeling auf der Indoor-Kartbahn." },
    ],
    cta: "Firmenevent anfragen",
    metaTitle: "Firmenevent & Teambuilding planen – Anbieter | FreizeitEngel",
    metaDescription:
      "Firmenevents & Teambuilding: Lasertag, Escape Rooms, Kartfahren & individuelle Pakete. Räume, Catering und Rechnungskauf für Firmen. Jetzt Anbieter anfragen.",
  },
];

export function getEventCategory(key: string | undefined): EventCategory | undefined {
  return EVENT_CATEGORIES.find((c) => c.key === key);
}
