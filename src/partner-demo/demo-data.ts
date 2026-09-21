import type { User } from "@shared/schema";
import bowlingImg from "@assets/images/bowling.png"; // DEMO: substituted for missing real stock photo
import minigolfImg from "@assets/images/minigolf.png"; // DEMO: substituted for missing real stock photo
import kinoImg from "@assets/images/kino.png"; // DEMO: substituted for missing real stock photo
import koelnBundleImg from "@assets/bundles/koeln-erlebnis-paket.jpg";
import duesseldorfBundleImg from "@assets/bundles/duesseldorf-action-paket.png";
import dortmundBundleImg from "@assets/bundles/dortmund-family-paket.jpg";

/**
 * All demo data for the mocked backend. Field names and shapes match the
 * real interfaces defined in the real, verbatim-copied partner-dashboard.tsx
 * (BookingWithDetails, PartnerStats, PartnerProfile, Settlement) exactly, so
 * that file required zero modification to consume this data.
 */

export const DEMO_CREDENTIALS = {
  username: "demo-partner",
  password: "demo1234",
};

export const demoUser: User = {
  id: 9001,
  username: "demo-partner",
  password: "",
  email: "sabine.hoffmann@vertical-dortmund.de",
  fullName: "Sabine Hoffmann",
  profileImage: null,
  role: "partner",
  createdAt: new Date().toISOString(),
};

export const demoPartnerProfile = {
  id: 501,
  companyName: "Kletterhalle Vertical Dortmund",
  contactPerson: "Sabine Hoffmann",
  email: "sabine.hoffmann@vertical-dortmund.de",
  phone: "0231 / 55 78 234",
  address: "Rheinische Straße 45",
  postalCode: "44137",
  city: "Dortmund",
  location: "Rheinische Straße 45, 44137 Dortmund",
  category: "Klettern & Bouldern",
  description:
    "Dortmunds größte Boulder- und Kletterhalle mit über 1.200 m² Kletterfläche, Kursen für Einsteiger und Profis sowie einem gemütlichen Café-Bereich.",
  website: "https://vertical-dortmund.de",
  logoUrl: "",
  logoBgColor: "black",
  approved: true,
};

export const demoPartnerStats = {
  totalBookings: 741,
  totalRevenue: 28430,
  monthlyBookings: 47,
  monthlyRevenue: 2140,
  averageRating: 4.7,
  totalExperiences: 5,
};

const names = [
  "Lena Brandt", "Tobias Wagner", "Julia Krüger", "Max Fischer", "Anna Schulz",
  "Felix Becker", "Nina Hartmann", "Jonas Weber", "Laura Meyer", "David König",
];

const experienceTitles = [
  "Tageskarte Boulderhalle",
  "Schnupperkurs Klettern (2 Std.)",
  "Kindergeburtstag Kletterparty",
  "10er-Karte Bouldern",
  "Vorstiegskurs für Fortgeschrittene",
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export const demoBookings = Array.from({ length: 14 }).map((_, i) => {
  const statuses = ["confirmed", "completed", "pending", "confirmed", "completed", "cancelled"];
  const date = new Date();
  date.setDate(date.getDate() + (10 - i));
  const people = 1 + (i % 4);
  const title = pick(experienceTitles, i);
  const price = [16, 39, 149, 135, 69][i % 5];
  return {
    id: 3000 + i,
    customerName: pick(names, i),
    customerEmail: `${pick(names, i).toLowerCase().replace(" ", ".")}@beispiel.de`,
    experienceTitle: title,
    experienceId: (i % 5) + 1,
    bookingDate: date.toISOString(),
    numberOfPeople: people,
    totalPrice: price * people,
    status: pick(statuses, i),
    notes: "",
    createdAt: new Date(date.getTime() - 5 * 86400000).toISOString(),
  };
});

const partnerLocation = "Rheinische Straße 45, 44137 Dortmund";

export const demoExperiences = [
  {
    id: 1,
    title: "Tageskarte Boulderhalle",
    category: "Klettern & Bouldern",
    categoryName: "Klettern & Bouldern",
    price: 16,
    active: true,
    shortDescription: "Freier Zugang zu allen Boulderbereichen für einen Tag.",
    location: partnerLocation,
    imageUrl: minigolfImg,
  },
  {
    id: 2,
    title: "Schnupperkurs Klettern (2 Std.)",
    category: "Klettern & Bouldern",
    categoryName: "Klettern & Bouldern",
    price: 39,
    active: true,
    shortDescription: "Geführter Einstieg fürs Seilklettern inkl. Ausrüstung.",
    location: partnerLocation,
    imageUrl: minigolfImg,
  },
  {
    id: 3,
    title: "Kindergeburtstag Kletterparty",
    category: "Klettern & Bouldern",
    categoryName: "Klettern & Bouldern",
    price: 149,
    active: true,
    shortDescription: "2,5 Stunden Kletterspaß inkl. Partyraum für bis zu 12 Kinder.",
    location: partnerLocation,
    imageUrl: minigolfImg,
  },
  {
    id: 4,
    title: "10er-Karte Bouldern",
    category: "Klettern & Bouldern",
    categoryName: "Klettern & Bouldern",
    price: 135,
    active: true,
    shortDescription: "10 Eintritte in die Boulderhalle, 12 Monate gültig.",
    location: partnerLocation,
    imageUrl: minigolfImg,
  },
  {
    id: 5,
    title: "Vorstiegskurs für Fortgeschrittene",
    category: "Klettern & Bouldern",
    categoryName: "Klettern & Bouldern",
    price: 69,
    active: false,
    shortDescription: "Vorstiegstechnik und Sicherung für erfahrene Kletterer.",
    location: partnerLocation,
    imageUrl: minigolfImg,
  },
];

export const demoPartnerResources = [
  { id: 9101, experienceId: 1, partnerId: 501, name: "Boulderbereich Haupthalle", description: "Hauptbereich mit Routen aller Schwierigkeitsgrade", capacity: 40, resourceType: "course", isActive: true },
  { id: 9102, experienceId: 1, partnerId: 501, name: "Boulderbereich Kids", description: "Niedrigere Wände für Kinder und Einsteiger", capacity: 15, resourceType: "course", isActive: true },
  { id: 9103, experienceId: 2, partnerId: 501, name: "Kletterwand A", description: "Seilklettern, Höhe bis 12 m", capacity: 8, resourceType: "course", isActive: true },
  { id: 9104, experienceId: 2, partnerId: 501, name: "Kletterwand B", description: "Seilklettern, Höhe bis 8 m, für Einsteiger", capacity: 8, resourceType: "course", isActive: true },
  { id: 9105, experienceId: 3, partnerId: 501, name: "Partyraum", description: "Eigener Raum inkl. Tischen für Kindergeburtstage", capacity: 12, resourceType: "room", isActive: true },
  { id: 9106, experienceId: 4, partnerId: 501, name: "Boulderbereich Haupthalle", description: "Hauptbereich mit Routen aller Schwierigkeitsgrade", capacity: 40, resourceType: "course", isActive: true },
  { id: 9107, experienceId: 5, partnerId: 501, name: "Kletterwand A", description: "Seilklettern, Höhe bis 12 m", capacity: 6, resourceType: "course", isActive: false },
];

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// Seed data for this demo partner's own "Mach-mit-Gruppen" listings
// (/api/partner/group-activities). This is the actual /api/group-activities
// response shape and sample rows from the real backend - kept verbatim
// (including the null partnerId/experienceId/decisionDeadline/
// cancellationReason and the string pricePerPerson) so the partner UI is
// built against the real field set, not an invented one. Kept as a plain
// array, not a frozen export, so queryClient.ts can mutate a copy of it
// when the demo's create-group dialog "creates" a new group.
export const demoPartnerGroupActivitiesSeed = [
  {
    id: 1,
    partnerId: null,
    experienceId: null,
    category: "Escape Room",
    title: "Mission Mars – 60 Min Rätsel-Spaß",
    description:
      "Wer schafft es, in 60 Minuten den Mars-Mission-Raum zu lösen? Suche 2 weitere mit Köpfchen und Spaß am Knobeln. Anschließend gerne noch was trinken!",
    city: "Bochum",
    location: "EscapeBochum, Wittener Str. 245",
    activityDate: "2026-05-07T06:21:15.565Z",
    durationMinutes: 120,
    maxParticipants: 5,
    minParticipants: 3,
    currentParticipants: 3,
    pricePerPerson: "24",
    imageUrl: null,
    organizerName: "Lukas M.",
    organizerUserId: null,
    organizerEmail: "lukas@example.de",
    status: "open",
    decisionDeadline: null,
    cancellationReason: null,
    notificationsSent: false,
    createdAt: "2026-05-04T11:21:15.565Z",
    updatedAt: "2026-09-06T15:02:47.151Z",
  },
  {
    id: 2,
    partnerId: null,
    experienceId: null,
    category: "Bowling",
    title: "Bowling Abend mit Pizza",
    description:
      "Mittwochabend gemütlich Bowlen, danach Pizza im Treff nebenan. Anfänger willkommen, wir spielen ohne Bande nicht 😉",
    city: "Hagen",
    location: "Bowling Room Hagen, Eckeseyer Str. 70",
    activityDate: "2026-05-08T05:51:15.565Z",
    durationMinutes: 120,
    maxParticipants: 6,
    minParticipants: 3,
    currentParticipants: 4,
    pricePerPerson: "15",
    imageUrl: null,
    organizerName: "Sarah K.",
    organizerUserId: null,
    organizerEmail: "sarah@example.de",
    status: "open",
    decisionDeadline: null,
    cancellationReason: null,
    notificationsSent: false,
    createdAt: "2026-05-04T11:21:15.565Z",
    updatedAt: "2026-06-29T12:02:30.655Z",
  },
  {
    id: 3,
    partnerId: null,
    experienceId: null,
    category: "Lasertag",
    title: "Lasertag Battle – Anfänger willkommen",
    description:
      "Suche nach Spielern für eine 2-Spiel-Session. 15 Min Briefing, dann 2x 20 Min Action. Egal ob Profi oder Newbie – Hauptsache Spaß!",
    city: "Bochum",
    location: "Lasertag Arena Bochum, Castroper Str. 110",
    activityDate: "2026-05-09T07:21:15.565Z",
    durationMinutes: 120,
    maxParticipants: 8,
    minParticipants: 4,
    currentParticipants: 5,
    pricePerPerson: "22",
    imageUrl: null,
    organizerName: "Tim H.",
    organizerUserId: null,
    organizerEmail: "tim@example.de",
    status: "open",
    decisionDeadline: null,
    cancellationReason: null,
    notificationsSent: false,
    createdAt: "2026-05-04T11:21:15.565Z",
    updatedAt: "2026-05-07T19:32:35.883Z",
  },
  {
    id: 4,
    partnerId: null,
    experienceId: null,
    category: "Trampolin",
    title: "Trampolin Training & Spaß-Springen",
    description:
      "Eine Stunde Trampolinhalle nutzen – dazwischen Spaßduelle und Foam Pit. Perfekt nach dem Feierabend!",
    city: "Essen",
    location: "JumpHouse Essen, Schederhofstr. 55",
    activityDate: "2026-05-10T04:21:15.565Z",
    durationMinutes: 120,
    maxParticipants: 6,
    minParticipants: 3,
    currentParticipants: 1,
    pricePerPerson: "18",
    imageUrl: null,
    organizerName: "Mira S.",
    organizerUserId: null,
    organizerEmail: "mira@example.de",
    status: "open",
    decisionDeadline: null,
    cancellationReason: null,
    notificationsSent: false,
    createdAt: "2026-05-04T11:21:15.565Z",
    updatedAt: "2026-05-04T11:21:15.565Z",
  },
  {
    id: 5,
    partnerId: null,
    experienceId: null,
    category: "Klettern",
    title: "Bouldern für Einsteiger",
    description:
      "Locker bouldern gehen – ich gebe gerne Tipps für die ersten Routen. Schuhe können geliehen werden.",
    city: "Dortmund",
    location: "Bergwerk Boulderhalle Dortmund",
    activityDate: "2026-05-11T05:21:15.565Z",
    durationMinutes: 120,
    maxParticipants: 4,
    minParticipants: 2,
    currentParticipants: 1,
    pricePerPerson: "14",
    imageUrl: null,
    organizerName: "Jonas B.",
    organizerUserId: null,
    organizerEmail: "jonas@example.de",
    status: "open",
    decisionDeadline: null,
    cancellationReason: null,
    notificationsSent: false,
    createdAt: "2026-05-04T11:21:15.565Z",
    updatedAt: "2026-05-04T11:21:15.565Z",
  },
  {
    id: 6,
    partnerId: null,
    experienceId: null,
    category: "Minigolf",
    title: "Indoor Minigolf Battle",
    description: "18 Loch Schwarzlicht-Minigolf. Wer den ersten Platz holt, zahlt nichts!",
    city: "Bochum",
    location: "Schwarzlichtviertel Bochum",
    activityDate: "2026-05-12T06:21:15.565Z",
    durationMinutes: 120,
    maxParticipants: 4,
    minParticipants: 2,
    currentParticipants: 1,
    pricePerPerson: "12",
    imageUrl: null,
    organizerName: "Anna R.",
    organizerUserId: null,
    organizerEmail: "anna@example.de",
    status: "open",
    decisionDeadline: null,
    cancellationReason: null,
    notificationsSent: false,
    createdAt: "2026-05-04T11:21:15.565Z",
    updatedAt: "2026-05-04T11:21:15.565Z",
  },
];

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function isoPlusHours(iso: string, hours: number): string {
  const d = new Date(iso);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

function futureGermanDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" });
}

const e3Created = daysAgo(1);
const e4Created = daysAgo(3);
const e5Created = daysAgo(5);
const e6Created = daysAgo(6);
const e7Created = daysAgo(9);

// Seed data for the Anfragemanagement inbox (/api/partner/inquiries). Kept as
// a plain array, not a frozen export, so queryClient.ts can mutate a copy of
// it when a reply is sent or a status/priority/notes change from the UI.
export const demoPartnerInquiriesSeed = [
  {
    id: 8501,
    partnerId: 501,
    experienceId: 3,
    type: "kindergeburtstag",
    status: "new",
    priority: "high",
    subject: "Kindergeburtstag für 9-jährige Tochter",
    message:
      "Hallo, meine Tochter wird bald 9 und möchte ihren Geburtstag gerne bei euch in der Kletterhalle feiern. Wir wären ca. 10 Kinder. Habt ihr an einem Samstagnachmittag noch Kapazität frei?",
    contactName: "Lena Brandt",
    contactEmail: "lena.brandt@beispiel.de",
    contactPhone: "0176 55512345",
    preferredDate: futureGermanDate(21),
    alternativeDate: futureGermanDate(28),
    preferredTime: "14:00 Uhr",
    groupSize: "10 Kinder + 2 Erwachsene",
    childrenAge: "8-9 Jahre",
    schoolName: null,
    className: null,
    companyName: null,
    budget: null,
    cateringWished: true,
    specialRequests: "Ein Kind hat eine Nussallergie, bitte bei den Snacks beachten.",
    internalNotes: "",
    source: "website",
    assignedTo: null,
    replyCount: 0,
    lastReplyBy: null,
    respondedAt: null,
    closedAt: null,
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
    replies: [] as any[],
  },
  {
    id: 8502,
    partnerId: 501,
    experienceId: null,
    type: "general",
    status: "new",
    priority: "normal",
    subject: "Öffnungszeiten an Feiertagen",
    message: "Guten Tag, habt ihr an Fronleichnam geöffnet? Und gibt es dafür ggf. Sonderpreise?",
    contactName: "Tobias Wagner",
    contactEmail: "tobias.wagner@beispiel.de",
    contactPhone: null,
    preferredDate: null,
    alternativeDate: null,
    preferredTime: null,
    groupSize: null,
    childrenAge: null,
    schoolName: null,
    className: null,
    companyName: null,
    budget: null,
    cateringWished: false,
    specialRequests: null,
    internalNotes: "",
    source: "website",
    assignedTo: null,
    replyCount: 0,
    lastReplyBy: null,
    respondedAt: null,
    closedAt: null,
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(6),
    replies: [] as any[],
  },
  {
    id: 8503,
    partnerId: 501,
    experienceId: 2,
    type: "schulklasse",
    status: "in_progress",
    priority: "normal",
    subject: "Anfrage Wandertag Klettern",
    message:
      "Wir planen unseren Wandertag Ende des Monats und würden gerne mit unserer 7. Klasse einen Vormittag bei euch klettern. Könnt ihr uns ein Angebot inkl. Betreuung machen?",
    contactName: "Julia Krüger",
    contactEmail: "julia.krueger@beispiel.de",
    contactPhone: "0231 4471023",
    preferredDate: futureGermanDate(18),
    alternativeDate: null,
    preferredTime: "09:00 - 12:00 Uhr",
    groupSize: "24 Schüler:innen + 2 Lehrkräfte",
    childrenAge: "12-13 Jahre",
    schoolName: "Gesamtschule Dortmund-Mitte",
    className: "7b",
    companyName: null,
    budget: "ca. 15€ pro Schüler:in",
    cateringWished: false,
    specialRequests: null,
    internalNotes: "Betreuungsschlüssel klären, dann Angebot raus.",
    source: "website",
    assignedTo: "Sabine Hoffmann",
    replyCount: 1,
    lastReplyBy: "partner",
    respondedAt: isoPlusHours(e3Created, 3),
    closedAt: null,
    createdAt: e3Created,
    updatedAt: isoPlusHours(e3Created, 3),
    replies: [
      {
        id: 9601,
        inquiryId: 8503,
        fromType: "partner",
        authorName: "Sabine Hoffmann",
        message:
          "Vielen Dank für Ihre Anfrage! Wir haben an diesem Vormittag noch Kapazitäten. Ich sende Ihnen in Kürze ein detailliertes Angebot inkl. Betreuungsschlüssel zu.",
        isInternal: false,
        emailSent: true,
        createdAt: isoPlusHours(e3Created, 3),
      },
    ],
  },
  {
    id: 8504,
    partnerId: 501,
    experienceId: 1,
    type: "firmenevent",
    status: "quoted",
    priority: "normal",
    subject: "Teambuilding-Event für 20 Mitarbeitende",
    message:
      "Wir suchen ein Teamevent für unsere Abteilung (ca. 20 Personen) im nächsten Monat. Bouldern und anschließend gemeinsames Essen wäre ideal. Was könnt ihr uns anbieten?",
    contactName: "Max Fischer",
    contactEmail: "max.fischer@beispiel.de",
    contactPhone: "0231 9988712",
    preferredDate: futureGermanDate(25),
    alternativeDate: futureGermanDate(32),
    preferredTime: "16:00 Uhr",
    groupSize: "20 Personen",
    childrenAge: null,
    schoolName: null,
    className: null,
    companyName: "Fischer & Partner Consulting GmbH",
    budget: "1500-2000€",
    cateringWished: true,
    specialRequests: "Zwei Kolleg:innen sind Vegetarier.",
    internalNotes: "Stammkunden-Rabatt bei Sabine erfragen.",
    source: "email",
    assignedTo: "Sabine Hoffmann",
    replyCount: 2,
    lastReplyBy: "partner",
    respondedAt: isoPlusHours(e4Created, 2),
    closedAt: null,
    createdAt: e4Created,
    updatedAt: isoPlusHours(e4Created, 26),
    replies: [
      {
        id: 9602,
        inquiryId: 8504,
        fromType: "partner",
        authorName: "Sabine Hoffmann",
        message:
          "Hallo Herr Fischer, gerne erstellen wir Ihnen ein Angebot: 2 Std. Bouldern inkl. Einweisung + Catering für 20 Personen kommt auf ca. 1.850€. Passt Ihnen der 16 Uhr Termin?",
        isInternal: false,
        emailSent: true,
        createdAt: isoPlusHours(e4Created, 2),
      },
      {
        id: 9603,
        inquiryId: 8504,
        fromType: "user",
        authorName: "Max Fischer",
        message: "Klingt gut, der Termin passt! Können wir das Catering noch etwas anpassen (2x vegetarisch)?",
        isInternal: false,
        emailSent: false,
        createdAt: isoPlusHours(e4Created, 25),
      },
      {
        id: 9604,
        inquiryId: 8504,
        fromType: "partner",
        authorName: "Sabine Hoffmann",
        message: "Rabatt-Nachfrage an Sabine weitergegeben — noch offen, vor finalem Angebot klären.",
        isInternal: true,
        emailSent: false,
        createdAt: isoPlusHours(e4Created, 26),
      },
    ],
  },
  {
    id: 8505,
    partnerId: 501,
    experienceId: 4,
    type: "gruppe",
    status: "won",
    priority: "normal",
    subject: "Gruppenausflug Kletterhalle",
    message: "Danke für das schnelle Angebot, wir buchen den Termin am Samstag für unsere Gruppe von 12 Personen.",
    contactName: "Anna Schulz",
    contactEmail: "anna.schulz@beispiel.de",
    contactPhone: "0151 22334455",
    preferredDate: futureGermanDate(9),
    alternativeDate: null,
    preferredTime: "11:00 Uhr",
    groupSize: "12 Personen",
    childrenAge: null,
    schoolName: null,
    className: null,
    companyName: null,
    budget: null,
    cateringWished: false,
    specialRequests: null,
    internalNotes: "",
    source: "website",
    assignedTo: "Sabine Hoffmann",
    replyCount: 1,
    lastReplyBy: "partner",
    respondedAt: isoPlusHours(e5Created, 1),
    closedAt: daysAgo(4),
    createdAt: e5Created,
    updatedAt: daysAgo(4),
    replies: [
      {
        id: 9605,
        inquiryId: 8505,
        fromType: "partner",
        authorName: "Sabine Hoffmann",
        message: "Freut uns! Der Termin ist für Sie reserviert, bis Samstag.",
        isInternal: false,
        emailSent: true,
        createdAt: isoPlusHours(e5Created, 1),
      },
    ],
  },
  {
    id: 8506,
    partnerId: 501,
    experienceId: null,
    type: "general",
    status: "lost",
    priority: "low",
    subject: "Preisanfrage Gruppenrabatt",
    message: "Wir haben uns leider für ein anderes Angebot entschieden, das besser zu unserem Termin gepasst hat. Danke trotzdem!",
    contactName: "Felix Becker",
    contactEmail: "felix.becker@beispiel.de",
    contactPhone: null,
    preferredDate: null,
    alternativeDate: null,
    preferredTime: null,
    groupSize: "15 Personen",
    childrenAge: null,
    schoolName: null,
    className: null,
    companyName: null,
    budget: null,
    cateringWished: false,
    specialRequests: null,
    internalNotes: "",
    source: "website",
    assignedTo: null,
    replyCount: 1,
    lastReplyBy: "partner",
    respondedAt: isoPlusHours(e6Created, 4),
    closedAt: daysAgo(5),
    createdAt: e6Created,
    updatedAt: daysAgo(5),
    replies: [
      {
        id: 9606,
        inquiryId: 8506,
        fromType: "partner",
        authorName: "Sabine Hoffmann",
        message: "Schade, aber verständlich! Wir würden uns freuen, Sie ein anderes Mal bei uns begrüßen zu dürfen.",
        isInternal: false,
        emailSent: true,
        createdAt: isoPlusHours(e6Created, 4),
      },
    ],
  },
  {
    id: 8507,
    partnerId: 501,
    experienceId: 3,
    type: "kindergeburtstag",
    status: "closed",
    priority: "normal",
    subject: "Kindergeburtstag – erledigt",
    message: "Vielen Dank, es war ein toller Nachmittag für unsere Tochter und ihre Freunde!",
    contactName: "Nina Hartmann",
    contactEmail: "nina.hartmann@beispiel.de",
    contactPhone: "0176 77812399",
    preferredDate: null,
    alternativeDate: null,
    preferredTime: null,
    groupSize: "8 Kinder",
    childrenAge: "7-8 Jahre",
    schoolName: null,
    className: null,
    companyName: null,
    budget: null,
    cateringWished: true,
    specialRequests: null,
    internalNotes: "",
    source: "website",
    assignedTo: null,
    replyCount: 1,
    lastReplyBy: "partner",
    respondedAt: isoPlusHours(e7Created, 2),
    closedAt: daysAgo(8),
    createdAt: e7Created,
    updatedAt: daysAgo(8),
    replies: [
      {
        id: 9607,
        inquiryId: 8507,
        fromType: "partner",
        authorName: "Sabine Hoffmann",
        message: "Das freut uns sehr zu hören! Bis zum nächsten Mal.",
        isInternal: false,
        emailSent: true,
        createdAt: isoPlusHours(e7Created, 2),
      },
    ],
  },
];

// Seed data for saved reply templates (/api/partner/inquiry-templates).
export const demoPartnerInquiryTemplatesSeed = [
  {
    id: 7201,
    partnerId: 501,
    name: "Begrüßung Standard",
    category: "greeting",
    subject: "Vielen Dank für Ihre Anfrage",
    body:
      "Hallo {{name}},\n\nvielen Dank für Ihre Anfrage bei der Kletterhalle Vertical Dortmund! Wir prüfen die Verfügbarkeit und melden uns innerhalb von 24 Stunden mit weiteren Details bei Ihnen.\n\nViele Grüße\nIhr Team von Vertical Dortmund",
    isDefault: true,
    createdAt: daysAgo(120),
  },
  {
    id: 7202,
    partnerId: 501,
    name: "Angebot Kindergeburtstag",
    category: "quote",
    subject: "Ihr Angebot für den Kindergeburtstag",
    body:
      "Hallo {{name}},\n\nvielen Dank für Ihre Anfrage! Für Ihren Kindergeburtstag bieten wir Ihnen unser Kletterparty-Paket an:\n\n- 2 Stunden exklusive Nutzung des Kinderbereichs\n- Betreuung durch geschultes Personal\n- Eigener Partyraum inkl. Tischen\n\nPreis: 15€ pro Kind (mind. 8 Kinder)\n\nSagen Sie gerne Bescheid, ob der Termin für Sie passt.\n\nViele Grüße",
    isDefault: false,
    createdAt: daysAgo(90),
  },
  {
    id: 7203,
    partnerId: 501,
    name: "Absage – Termin ausgebucht",
    category: "decline",
    subject: "Leider ausgebucht",
    body:
      "Hallo {{name}},\n\nvielen Dank für Ihr Interesse. Leider sind wir am gewünschten Termin bereits ausgebucht. Gerne bieten wir Ihnen einen Alternativtermin an – lassen Sie uns wissen, ob das für Sie infrage kommt.\n\nViele Grüße",
    isDefault: false,
    createdAt: daysAgo(60),
  },
  {
    id: 7204,
    partnerId: 501,
    name: "Nachfass nach Angebot",
    category: "follow_up",
    subject: "Kurze Rückfrage zu unserem Angebot",
    body:
      "Hallo {{name}},\n\nwir wollten kurz nachfragen, ob unser Angebot für Sie passt oder ob noch Fragen offen sind. Wir freuen uns auf Ihre Rückmeldung!\n\nViele Grüße",
    isDefault: false,
    createdAt: daysAgo(30),
  },
];

const categoryNames = [
  "Axtwerfen", "Billard", "Billard & Dart", "Bootstouren", "Bootsverleih", "Bouldern", "Bowling",
  "Day Spa", "Eissporthalle", "Escape Room", "Freibad", "Freizeitpark", "Fußballgolf", "Gaming Center",
  "Golf", "Indoorspielplatz", "Kartbahn", "Kegeln", "Kinderbauernhof", "Kino", "Kletterhalle",
  "Kletterpark", "Kultur & Events", "Lasertag", "Minigolf", "Museum", "Padel", "Paintball", "Reiten",
  "Schwimmbad", "Ski", "Soccer", "Swingolf", "Tennis", "Theater", "Töpfern", "Trampolinhalle",
  "VR Spiele", "Wasserski", "Wellness & Spa", "Zoo & Tierpark",
];

export const demoCategories = categoryNames.map((name, i) => ({
  id: i + 1,
  name,
  slug: name
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, ""),
}));

export const demoCommissionInvoices = [
  {
    id: 1,
    invoiceNumber: "RE-2026-08-0501",
    periodMonth: 8,
    periodYear: 2026,
    bookingCount: 6,
    grossRevenue: 482000,
    commissionRate: 11,
    commissionNet: 53020,
    commissionTax: 10074,
    commissionGross: 63094,
    status: "bezahlt",
    issueDate: "2026-09-01",
    dueDate: "2026-09-15",
    paidDate: "2026-09-10",
  },
  {
    id: 2,
    invoiceNumber: "RE-2026-09-0501",
    periodMonth: 9,
    periodYear: 2026,
    bookingCount: 4,
    grossRevenue: 214000,
    commissionRate: 11,
    commissionNet: 23540,
    commissionTax: 4473,
    commissionGross: 28013,
    status: "offen",
    issueDate: "2026-10-01",
    dueDate: "2026-10-15",
    paidDate: null,
  },
];

/**
 * Home-screen browse/discovery data.
 *
 * The real app's home page reads `/api/experiences?featured=true`,
 * `/api/partners`, `/api/cities`, and `/api/bundles` to fill in its
 * "Empfohlene Freizeitangebote", "Mach-mit-Gruppen", and city-bundle
 * sections. None of those exist in this demo's mocked getQueryFn, so those
 * sections rendered empty. The data below plugs the same gap: realistic
 * NRW-themed listings, in the shapes home-page.tsx and BundlesPromoSection
 * already expect, so the home screen looks fully populated without any
 * network request.
 */

export const demoCities = [
  "Aachen",
  "Bielefeld",
  "Bochum",
  "Bonn",
  "Dortmund",
  "Duisburg",
  "Düsseldorf",
  "Essen",
  "Gelsenkirchen",
  "Köln",
  "Krefeld",
  "Mönchengladbach",
  "Münster",
  "Paderborn",
  "Recklinghausen",
  "Wuppertal",
];

// Each entry backs both a `/api/partners` row and a `/api/experiences`
// row - the real app models them as separate tables, but a 1:1 demo
// mapping keeps every listing's partner details and offer consistent.
const demoOffers = [
  {
    id: 601,
    partnerName: "Vertical Dortmund",
    category: "Klettern",
    city: "Dortmund",
    address: "Rheinische Straße 45, 44137 Dortmund",
    price: 16,
    rating: 4.7,
    reviewCount: 312,
    title: "Tageskarte Boulderhalle",
    description:
      "Dortmunds größte Boulder- und Kletterhalle mit über 1.200 m² Kletterfläche, Kursen für Einsteiger und Profis sowie gemütlichem Café-Bereich.",
  },
  {
    id: 602,
    partnerName: "AquaMagic Erlebnisbad",
    category: "Schwimmbad",
    city: "Essen",
    address: "Am Thermenpark 3, 45127 Essen",
    price: 14,
    rating: 4.5,
    reviewCount: 489,
    title: "Tageskarte Erlebnisbad",
    description:
      "Rutschen, Wellenbad und Außenbecken für einen Tag voller Wasserspaß - für die ganze Familie.",
  },
  {
    id: 603,
    partnerName: "Strike & Spare Bowlingcenter",
    category: "Bowling",
    city: "Bochum",
    address: "Kortumstraße 88, 44787 Bochum",
    price: 12,
    rating: 4.4,
    reviewCount: 176,
    title: "60 Minuten Bowling inkl. Schuhe",
    description:
      "Zwölf moderne Bahnen mitten in der Bochumer Innenstadt, Schuhverleih inklusive.",
  },
  {
    id: 604,
    partnerName: "LaserZone Köln",
    category: "Lasertag",
    city: "Köln",
    address: "Ehrenstraße 21, 50672 Köln",
    price: 18,
    rating: 4.6,
    reviewCount: 254,
    title: "Lasertag-Arena – 2 Runden",
    description:
      "Zwei Runden auf einem 600 m² Multi-Level-Parcours mit Nebel- und Lichteffekten.",
  },
  {
    id: 605,
    partnerName: "Jumpline Trampolinpark",
    category: "Trampolinhalle",
    city: "Düsseldorf",
    address: "Reisholzer Werftstraße 15, 40589 Düsseldorf",
    price: 15,
    rating: 4.5,
    reviewCount: 198,
    title: "90 Minuten Sprungzeit",
    description:
      "Über 40 vernetzte Trampoline, Dunk-Zone und Schaumstoffgrube für Groß und Klein.",
  },
  {
    id: 606,
    partnerName: "Minigolf am Kaiserberg",
    category: "Minigolf",
    city: "Duisburg",
    address: "Kaiserberg-Allee 2, 47057 Duisburg",
    price: 8,
    rating: 4.3,
    reviewCount: 87,
    title: "18-Loch-Runde Minigolf",
    description: "Parkanlage mit 18 liebevoll gestalteten Bahnen direkt am Kaiserberg.",
  },
  {
    id: 607,
    partnerName: "Escape Society",
    category: "Escape Rooms",
    city: "Bielefeld",
    address: "Niedernstraße 12, 33602 Bielefeld",
    price: 25,
    rating: 4.8,
    reviewCount: 231,
    title: "Mission Mars – 60 Min Rätsel-Spaß",
    description:
      "Ein havariertes Raumschiff, 60 Minuten und jede Menge Rätsel - für 2 bis 6 Spieler.",
  },
  {
    id: 608,
    partnerName: "Tierpark Münster",
    category: "Zoo & Tierpark",
    city: "Münster",
    address: "Sentruper Straße 315, 48161 Münster",
    price: 19,
    rating: 4.7,
    reviewCount: 560,
    title: "Tagesticket Zoo & Tierpark",
    description: "Über 3.000 Tiere aus aller Welt auf einem weitläufigen Parkgelände.",
  },
  {
    id: 609,
    partnerName: "CinemaxX Filmpalast",
    category: "Kino",
    city: "Wuppertal",
    address: "Alte Freiheit 9, 42103 Wuppertal",
    price: 11,
    rating: 4.2,
    reviewCount: 145,
    title: "Kinoticket + Popcorn-Menü",
    description: "Aktuelle Blockbuster auf großer Leinwand, inklusive Popcorn-Menü.",
  },
  {
    id: 610,
    partnerName: "Wellnessoase Rheinblick",
    category: "Wellness",
    city: "Bonn",
    address: "Rheinaustraße 5, 53225 Bonn",
    price: 29,
    rating: 4.6,
    reviewCount: 133,
    title: "Halbtags-Sauna & Spa-Zugang",
    description: "Vier Saunen, Dampfbad und Rheinblick-Loungebereich für einen entspannten Nachmittag.",
  },
  {
    id: 611,
    partnerName: "Soccerhalle Aachen",
    category: "Soccer",
    city: "Aachen",
    address: "Jülicher Straße 220, 52070 Aachen",
    price: 45,
    rating: 4.4,
    reviewCount: 76,
    title: "Hallenfußball – 1 Std. Platzmiete",
    description: "Zwei Indoor-Plätze mit Kunstrasen, ideal für Firmenevents und Geburtstage.",
  },
  {
    id: 612,
    partnerName: "Kinderland Indoorspielplatz",
    category: "Kinderpark",
    city: "Mönchengladbach",
    address: "Hindenburgstraße 60, 41061 Mönchengladbach",
    price: 9,
    rating: 4.5,
    reviewCount: 302,
    title: "Ganztagesticket Indoorspielplatz",
    description: "Kletterlandschaften, Rutschen und Bällebad auf 1.500 m² für Kinder bis 12 Jahre.",
  },
  {
    id: 613,
    partnerName: "Paintball Arena Ruhrgebiet",
    category: "Paintball",
    city: "Gelsenkirchen",
    address: "Ückendorfer Straße 190, 45886 Gelsenkirchen",
    price: 35,
    rating: 4.3,
    reviewCount: 118,
    title: "2 Std. Paintball inkl. Ausrüstung",
    description: "Vier Outdoor-Spielfelder mit Bunkern und Hindernissen, komplette Ausrüstung inklusive.",
  },
  {
    id: 614,
    partnerName: "Kletterpark Recklinghausen",
    category: "Klettern",
    city: "Recklinghausen",
    address: "Hohenhorster Weg 1, 45659 Recklinghausen",
    price: 22,
    rating: 4.6,
    reviewCount: 94,
    title: "Hochseilgarten – 3 Std. Ticket",
    description: "Acht Parcours in bis zu 12 Metern Höhe, mitten im Wald.",
  },
  {
    id: 615,
    partnerName: "Freibad Sonnenhang",
    category: "Schwimmbad",
    city: "Köln",
    address: "Militärringstraße 90, 50935 Köln",
    price: 6,
    rating: 4.1,
    reviewCount: 210,
    title: "Tageskarte Freibad",
    description: "Klassisches Freibad mit 50-Meter-Bahn, Sprungturm und großer Liegewiese.",
  },
  {
    id: 616,
    partnerName: "Bowling Palace Duisburg",
    category: "Bowling",
    city: "Duisburg",
    address: "Königstraße 45, 47051 Duisburg",
    price: 13,
    rating: 4.3,
    reviewCount: 88,
    title: "Bowlingbahn – 1 Std. für bis zu 6 Personen",
    description: "Bahn-Vermietung nach Zeit statt pro Spiel - ideal für Gruppen.",
  },
  {
    id: 617,
    partnerName: "Trampolino Dortmund",
    category: "Trampolinhalle",
    city: "Dortmund",
    address: "Brackeler Hellweg 100, 44309 Dortmund",
    price: 14,
    rating: 4.4,
    reviewCount: 150,
    title: "60 Minuten Trampolinpark",
    description: "Freispringen, Dodgeball-Arena und Airbag-Kissen auf zwei Etagen.",
  },
  {
    id: 618,
    partnerName: "VR & Games Lounge",
    category: "Escape Rooms",
    city: "Essen",
    address: "Rüttenscheider Straße 12, 45130 Essen",
    price: 27,
    rating: 4.7,
    reviewCount: 167,
    title: "VR-Erlebnisraum – 45 Minuten",
    description: "Free-Roam-VR auf 150 m² - mehrere Spielwelten für 1 bis 4 Spieler.",
  },
];

export const demoPartners = demoOffers.map((o) => ({
  id: o.id,
  companyName: o.partnerName,
  category: o.category,
  city: o.city,
  address: o.address,
  location: o.address,
  description: o.description,
  logoUrl: "",
  logoBgColor: "black",
}));

export const demoFeaturedExperiences = demoOffers.map((o, i) => ({
  id: o.id,
  title: o.title,
  description: o.description,
  shortDescription: o.description,
  location: o.address,
  city: o.city,
  price: o.price,
  categoryId: i + 1,
  partnerId: o.id,
  partnerName: o.partnerName,
  rating: o.rating,
  reviewCount: o.reviewCount,
  featured: true,
  active: true,
}));

export const demoBundles = [
  {
    id: 1,
    slug: "koeln-erlebnis-paket",
    city: "Köln",
    title: "Köln Erlebnis-Paket",
    tagline: "5 kuratierte Aktivitäten + 1 Überraschung – wir planen, ihr genießt",
    hero_image_url: koelnBundleImg,
    num_activities: 5,
    num_surprises: 1,
    duration_weeks: 6,
    price_per_person: "149.00",
  },
  {
    id: 2,
    slug: "duesseldorf-action-paket",
    city: "Düsseldorf",
    title: "Düsseldorf Action-Paket",
    tagline: "5 Top-Aktivitäten + 1 Überraschung für euer Team",
    hero_image_url: duesseldorfBundleImg,
    num_activities: 5,
    num_surprises: 1,
    duration_weeks: 6,
    price_per_person: "139.00",
  },
  {
    id: 3,
    slug: "dortmund-family-paket",
    city: "Dortmund",
    title: "Dortmund Family-Paket",
    tagline: "5 Familien-Highlights + 1 Überraschung für Kinder & Eltern",
    hero_image_url: dortmundBundleImg,
    num_activities: 5,
    num_surprises: 1,
    duration_weeks: 6,
    price_per_person: "119.00",
  },
];

export const demoSettlements = [
  {
    id: "2026-08",
    month: "August 2026",
    bookings: demoBookings.slice(0, 6).map((b) => ({
      id: b.id,
      experienceTitle: b.experienceTitle,
      customerName: b.customerName,
      date: b.bookingDate,
      numberOfPeople: b.numberOfPeople,
      totalPrice: b.totalPrice,
      commission: Math.round(b.totalPrice * 0.11 * 100) / 100,
      net: Math.round(b.totalPrice * 0.89 * 100) / 100,
      status: "bezahlt",
    })),
    totalRevenue: 4820,
    commission: 530.2,
    netPayout: 4289.8,
    status: "bezahlt",
  },
  {
    id: "2026-09",
    month: "September 2026",
    bookings: demoBookings.slice(6, 10).map((b) => ({
      id: b.id,
      experienceTitle: b.experienceTitle,
      customerName: b.customerName,
      date: b.bookingDate,
      numberOfPeople: b.numberOfPeople,
      totalPrice: b.totalPrice,
      commission: Math.round(b.totalPrice * 0.11 * 100) / 100,
      net: Math.round(b.totalPrice * 0.89 * 100) / 100,
      status: "offen",
    })),
    totalRevenue: 2140,
    commission: 235.4,
    netPayout: 1904.6,
    status: "offen",
  },
];

/**
 * Public storefront data for the "Shop ansehen" page (client/src/pages/
 * partner-shop-page.tsx in the real app, GET /api/partners/:id + GET
 * /api/experiences there). This is the public listing a customer sees,
 * as opposed to demoPartnerProfile/demoExperiences above which back the
 * partner's own private dashboard. Id 501 is the same demo partner as
 * demoPartnerProfile so "Shop ansehen" shows a consistent storefront;
 * 502-504 are a few other Dortmund partners that only exist to populate
 * the shop page's own "Beliebte Aktivitäten in Dortmund" cross-sell
 * section with something to show.
 */
const climbingImg =
  "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&h=800&fit=crop"; // DEMO: substituted for missing real stock photo
const escapeRoomImg =
  "https://images.unsplash.com/photo-1587825140708-dfaf18c4f8e0?w=1200&h=800&fit=crop"; // DEMO: substituted for missing real stock photo

export const demoShopPartners = [
  {
    id: 501,
    companyName: "Kletterhalle Vertical Dortmund",
    city: "Dortmund",
    postalCode: "44137",
    address: "Rheinische Straße 45",
    category: "Klettern & Bouldern",
    description:
      "Dortmunds größte Boulder- und Kletterhalle mit über 1.200 m² Kletterfläche, Kursen für Einsteiger und Profis sowie einem gemütlichen Café-Bereich.",
    logoUrl: "",
    phone: "0231 / 55 78 234",
    email: "sabine.hoffmann@vertical-dortmund.de",
    website: "https://vertical-dortmund.de",
    latitude: 51.5136,
    longitude: 7.4653,
    openingHours: JSON.stringify({
      monday: "14:00 - 22:00",
      tuesday: "14:00 - 22:00",
      wednesday: "14:00 - 22:00",
      thursday: "14:00 - 22:00",
      friday: "14:00 - 22:00",
      saturday: "10:00 - 22:00",
      sunday: "10:00 - 20:00",
    }),
    isLive: true,
  },
  {
    id: 502,
    companyName: "Bowling Arena Dortmund",
    city: "Dortmund",
    postalCode: "44135",
    address: "Kampstraße 63",
    category: "Bowling",
    description: "Zwölf moderne Bahnen mitten in der Dortmunder Innenstadt, Schuhverleih inklusive.",
    logoUrl: "",
    phone: "0231 / 55 12 990",
    email: "info@bowling-arena-do.de",
    website: "",
    latitude: 51.5147,
    longitude: 7.4632,
    openingHours: JSON.stringify({
      monday: "16:00 - 23:00",
      tuesday: "16:00 - 23:00",
      wednesday: "16:00 - 23:00",
      thursday: "16:00 - 23:00",
      friday: "14:00 - 00:00",
      saturday: "12:00 - 00:00",
      sunday: "12:00 - 22:00",
    }),
    isLive: true,
  },
  {
    id: 503,
    companyName: "Escape Rooms Dortmund",
    city: "Dortmund",
    postalCode: "44137",
    address: "Hansastraße 18",
    category: "Escape Room",
    description: "Drei mysteriöse Themenräume, 60 Minuten und jede Menge Rätsel - für 2 bis 6 Spieler.",
    logoUrl: "",
    phone: "0231 / 55 33 210",
    email: "info@escape-dortmund.de",
    website: "",
    latitude: 51.5122,
    longitude: 7.4661,
    openingHours: JSON.stringify({
      monday: "15:00 - 22:00",
      tuesday: "15:00 - 22:00",
      wednesday: "15:00 - 22:00",
      thursday: "15:00 - 22:00",
      friday: "15:00 - 23:00",
      saturday: "11:00 - 23:00",
      sunday: "11:00 - 21:00",
    }),
    isLive: true,
  },
  {
    id: 504,
    companyName: "CineStar Dortmund",
    city: "Dortmund",
    postalCode: "44135",
    address: "Ostwall 5",
    category: "Kino",
    description: "Aktuelle Blockbuster auf großer Leinwand, inklusive Popcorn-Menü.",
    logoUrl: "",
    phone: "0231 / 55 87 440",
    email: "info@cinestar-dortmund.de",
    website: "",
    latitude: 51.5165,
    longitude: 7.4658,
    openingHours: JSON.stringify({
      monday: "13:00 - 23:00",
      tuesday: "13:00 - 23:00",
      wednesday: "13:00 - 23:00",
      thursday: "13:00 - 23:00",
      friday: "13:00 - 00:00",
      saturday: "11:00 - 00:00",
      sunday: "11:00 - 23:00",
    }),
    isLive: true,
  },
];

export const demoShopExperiences = [
  {
    id: 1,
    partnerId: 501,
    title: "Tageskarte Boulderhalle",
    categoryId: 6,
    categoryName: "Bouldern",
    price: 16,
    shortDescription: "Freier Zugang zu allen Boulderbereichen für einen Tag.",
    imageUrl: climbingImg,
  },
  {
    id: 2,
    partnerId: 501,
    title: "Schnupperkurs Klettern (2 Std.)",
    categoryId: 21,
    categoryName: "Bouldern",
    price: 39,
    shortDescription: "Geführter Einstieg fürs Seilklettern inkl. Ausrüstung.",
    imageUrl: climbingImg,
  },
  {
    id: 3,
    partnerId: 501,
    title: "Kindergeburtstag Kletterparty",
    categoryId: 6,
    categoryName: "Bouldern",
    price: 149,
    shortDescription: "2,5 Stunden Kletterspaß inkl. Partyraum für bis zu 12 Kinder.",
    imageUrl: climbingImg,
  },
  {
    id: 4,
    partnerId: 501,
    title: "10er-Karte Bouldern",
    categoryId: 6,
    categoryName: "Bouldern",
    price: 135,
    shortDescription: "10 Eintritte in die Boulderhalle, 12 Monate gültig.",
    imageUrl: climbingImg,
  },
  {
    id: 5,
    partnerId: 502,
    title: "60 Minuten Bowling inkl. Schuhe",
    categoryId: 7,
    categoryName: "Bowling",
    price: 12,
    shortDescription: "Zwölf moderne Bahnen, Schuhverleih inklusive.",
    imageUrl: bowlingImg,
  },
  {
    id: 6,
    partnerId: 503,
    title: "Escape Room – 60 Min Rätselspaß",
    categoryId: 10,
    categoryName: "Escape Room",
    price: 25,
    shortDescription: "Drei Themenräume für 2 bis 6 Spieler.",
    imageUrl: escapeRoomImg,
  },
  {
    id: 7,
    partnerId: 504,
    title: "Kinoticket + Popcorn-Menü",
    categoryId: 20,
    categoryName: "Kino",
    price: 11,
    shortDescription: "Aktuelle Blockbuster inklusive Popcorn-Menü.",
    imageUrl: kinoImg,
  },
];
