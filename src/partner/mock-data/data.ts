import type {
  PartnerProfile,
  Booking,
  Experience,
  AvailabilitySlot,
  Payout,
  Message,
  DashboardStats,
} from "./types";

export const partnerProfile: PartnerProfile = {
  id: 1,
  companyName: "Kletterhalle Vertical Dortmund",
  contactPerson: "Sabine Hoffmann",
  email: "sabine.hoffmann@vertical-dortmund.de",
  phone: "0231 / 55 78 234",
  address: "Rheinische Straße 45",
  city: "Dortmund",
  postalCode: "44137",
  category: "Klettern & Bouldern",
  description:
    "Dortmunds größte Boulder- und Kletterhalle mit über 1.200 m² Kletterfläche, Kursen für Einsteiger und Profis sowie einem gemütlichen Café-Bereich.",
  website: "https://vertical-dortmund.de",
  logoInitials: "VD",
  openingHours: "Mo–Fr 10:00–23:00, Sa–So 09:00–22:00",
  rating: 4.7,
  reviewCount: 312,
  memberSince: "2025-03-14",
};

export const experiences: Experience[] = [
  {
    id: 1,
    title: "Tageskarte Boulderhalle",
    category: "Klettern & Bouldern",
    price: 16,
    duration: "Ganztags",
    maxParticipants: 1,
    active: true,
    bookingsCount: 284,
    rating: 4.8,
    imageColor: "#7c3aed",
  },
  {
    id: 2,
    title: "Schnupperkurs Klettern (2 Std.)",
    category: "Klettern & Bouldern",
    price: 39,
    duration: "2 Stunden",
    maxParticipants: 6,
    active: true,
    bookingsCount: 96,
    rating: 4.9,
    imageColor: "#a855f7",
  },
  {
    id: 3,
    title: "Kindergeburtstag Kletterparty",
    category: "Klettern & Bouldern",
    price: 149,
    duration: "3 Stunden",
    maxParticipants: 10,
    active: true,
    bookingsCount: 41,
    rating: 5.0,
    imageColor: "#c084fc",
  },
  {
    id: 4,
    title: "10er-Karte Bouldern",
    category: "Klettern & Bouldern",
    price: 135,
    duration: "Flexibel",
    maxParticipants: 1,
    active: true,
    bookingsCount: 58,
    rating: 4.6,
    imageColor: "#6b21a8",
  },
  {
    id: 5,
    title: "Vorstiegskurs für Fortgeschrittene",
    category: "Klettern & Bouldern",
    price: 69,
    duration: "3 Stunden",
    maxParticipants: 8,
    active: false,
    bookingsCount: 12,
    rating: 4.5,
    imageColor: "#9333ea",
  },
];

const names = [
  "Lena Brandt", "Tobias Wagner", "Julia Krüger", "Max Fischer", "Anna Schulz",
  "Felix Becker", "Nina Hartmann", "Jonas Weber", "Laura Meyer", "David König",
  "Sophie Lang", "Paul Richter", "Mia Neumann", "Leon Zimmermann", "Emma Klein",
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export const bookings: Booking[] = Array.from({ length: 18 }).map((_, i) => {
  const exp = pick(experiences, i);
  const statuses: Booking["status"][] = ["confirmed", "completed", "pending", "confirmed", "completed", "cancelled"];
  const daysOffset = 14 - i;
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const participants = 1 + (i % 4);
  return {
    id: 1000 + i,
    bookingReference: `FE-${(84200000 + i * 173).toString().slice(0, 8)}-${(1000 + i).toString().slice(-4)}`,
    experienceTitle: exp.title,
    customerName: pick(names, i),
    customerEmail: `${pick(names, i).toLowerCase().replace(" ", ".")}@beispiel.de`,
    date: date.toISOString().slice(0, 10),
    time: ["10:00", "12:30", "14:00", "16:30", "18:00"][i % 5],
    participants,
    totalPrice: exp.price * participants,
    status: pick(statuses, i),
    createdAt: new Date(date.getTime() - 6 * 86400000).toISOString(),
  };
});

export const availabilitySlots: AvailabilitySlot[] = Array.from({ length: 12 }).map((_, i) => {
  const exp = pick(experiences.filter((e) => e.active), i);
  const date = new Date();
  date.setDate(date.getDate() + i);
  const capacity = exp.maxParticipants === 1 ? 20 : exp.maxParticipants;
  return {
    id: 2000 + i,
    experienceTitle: exp.title,
    date: date.toISOString().slice(0, 10),
    time: ["10:00", "14:00", "17:00"][i % 3],
    capacity,
    booked: Math.min(capacity, Math.round(capacity * (0.2 + (i % 5) * 0.15))),
  };
});

export const payouts: Payout[] = [
  { id: 1, period: "August 2026", grossAmount: 4820, commission: 530.2, netAmount: 4289.8, status: "paid", paidOn: "2026-09-03", bookingsCount: 112 },
  { id: 2, period: "Juli 2026", grossAmount: 5310, commission: 584.1, netAmount: 4725.9, status: "paid", paidOn: "2026-08-04", bookingsCount: 128 },
  { id: 3, period: "Juni 2026", grossAmount: 3990, commission: 438.9, netAmount: 3551.1, status: "paid", paidOn: "2026-07-03", bookingsCount: 94 },
  { id: 4, period: "September 2026", grossAmount: 2140, commission: 235.4, netAmount: 1904.6, status: "processing", paidOn: null, bookingsCount: 47 },
];

export const messages: Message[] = [
  {
    id: 1,
    customerName: "Lena Brandt",
    subject: "Frage zu Gruppengröße Kindergeburtstag",
    preview: "Können wir auch mit 12 Kindern kommen, auch wenn die Karte...",
    body: "Hallo, können wir auch mit 12 Kindern kommen, auch wenn die Karte für 10 Personen ausgelegt ist? Wir würden auch gerne für zwei Kinder mehr bezahlen. Viele Grüße, Lena",
    date: "2026-09-09T14:22:00",
    unread: true,
    status: "new",
  },
  {
    id: 2,
    customerName: "Tobias Wagner",
    subject: "Umbuchung Schnupperkurs",
    preview: "Ich muss meinen Termin am Samstag leider verschieben...",
    body: "Hallo, ich muss meinen Termin am Samstag leider verschieben. Wäre der Sonntag zur gleichen Zeit noch frei? Danke und Grüße, Tobias",
    date: "2026-09-08T09:10:00",
    unread: true,
    status: "new",
  },
  {
    id: 3,
    customerName: "Julia Krüger",
    subject: "Kletterschuhe leihen möglich?",
    preview: "Ist im Preis der Verleih von Kletterschuhen enthalten...",
    body: "Hallo, ist im Preis der Verleih von Kletterschuhen und Gurt enthalten, oder muss das extra gebucht werden? Danke, Julia",
    date: "2026-09-07T18:45:00",
    unread: false,
    status: "answered",
  },
  {
    id: 4,
    customerName: "Felix Becker",
    subject: "Vielen Dank für den tollen Kurs!",
    preview: "Wollte mich nochmal für den Vorstiegskurs bedanken...",
    body: "Hallo, wollte mich nochmal für den Vorstiegskurs letzte Woche bedanken – der Trainer war super! Wir kommen gerne wieder. Beste Grüße, Felix",
    date: "2026-09-05T11:00:00",
    unread: false,
    status: "answered",
  },
  {
    id: 5,
    customerName: "Nina Hartmann",
    subject: "Parkmöglichkeiten vor Ort",
    preview: "Gibt es kostenlose Parkplätze direkt bei der Halle...",
    body: "Hallo, gibt es kostenlose Parkplätze direkt bei der Halle oder sollten wir mit der Bahn kommen? Danke, Nina",
    date: "2026-09-04T16:30:00",
    unread: false,
    status: "in_progress",
  },
];

export const dashboardStats: DashboardStats = {
  totalBookingsThisMonth: 47,
  bookingsChangePct: 12.4,
  revenueThisMonth: 2140,
  revenueChangePct: 8.1,
  avgRating: 4.7,
  reviewCount: 312,
  activeExperiences: experiences.filter((e) => e.active).length,
  pendingMessages: messages.filter((m) => m.status === "new").length,
};
