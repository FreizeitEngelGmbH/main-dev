/**
 * Static data for the public "Mach-mit-Gruppen" pages (`/gruppen`, `/gruppen/:id`).
 *
 * Field names follow the backend's `/api/group-activities` rows, so a real API
 * can replace `groupActivities` / `getGroupActivity` later without touching the
 * pages. Read-only: nothing is written back (joining, creating and subscribing
 * are not available in this build). IDs 1–4 are the groups teased on `/home`
 * (GroupActivitiesSection), with the same titles, cities and participant counts.
 */

export type GroupActivityStatus = "open" | "confirmed";

export interface GroupActivityMember {
  id: number;
  name: string;
  isOrganizer: boolean;
}

export interface GroupActivity {
  id: number;
  category: string;
  title: string;
  description: string | null;
  city: string;
  location: string;
  /** ISO date-time, relative to today so the sample groups stay upcoming. */
  activityDate: string;
  durationMinutes: number;
  maxParticipants: number;
  minParticipants: number;
  currentParticipants: number;
  pricePerPerson: string;
  imageUrl: string | null;
  organizerName: string;
  status: GroupActivityStatus;
  members: GroupActivityMember[];
}

function inDays(days: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function members(names: string[]): GroupActivityMember[] {
  return names.map((name, i) => ({ id: i + 1, name, isOrganizer: i === 0 }));
}

export const groupActivities: GroupActivity[] = [
  {
    id: 1,
    category: "Escape Room",
    title: "Mission Mars – 60 Min Rätsel-Spaß",
    description:
      "Wer schafft es, in 60 Minuten den Mars-Mission-Raum zu lösen? Wir suchen noch zwei Leute mit Köpfchen und Spaß am Knobeln. Anschließend gerne noch was trinken!",
    city: "Bielefeld",
    location: "Escape Room Innenstadt",
    activityDate: inDays(1, 18, 30),
    durationMinutes: 90,
    maxParticipants: 5,
    minParticipants: 3,
    currentParticipants: 3,
    pricePerPerson: "24",
    imageUrl: null,
    organizerName: "Lukas M.",
    status: "open",
    members: members(["Lukas M.", "Sarah K.", "Jonas B."]),
  },
  {
    id: 2,
    category: "Bowling",
    title: "Feierabend-Bowling mit Cocktails",
    description:
      "Entspannter Bowling-Abend nach der Arbeit – egal ob Profi oder Anfänger. Danach noch ein Cocktail an der Bar.",
    city: "Dortmund",
    location: "Bowlingcenter Dortmund",
    activityDate: inDays(2, 19, 0),
    durationMinutes: 120,
    maxParticipants: 8,
    minParticipants: 4,
    currentParticipants: 5,
    pricePerPerson: "18",
    imageUrl: null,
    organizerName: "Anna S.",
    status: "open",
    members: members(["Anna S.", "Tim R.", "Mara L.", "Felix H.", "Nina W."]),
  },
  {
    id: 3,
    category: "Klettern",
    title: "Boulder-Session für Einsteiger",
    description:
      "Gemeinsam die ersten Boulder-Routen ausprobieren. Schuhe können vor Ort geliehen werden.",
    city: "Köln",
    location: "Boulderhalle Köln",
    activityDate: inDays(3, 17, 0),
    durationMinutes: 120,
    maxParticipants: 6,
    minParticipants: 3,
    currentParticipants: 6,
    pricePerPerson: "16",
    imageUrl: null,
    organizerName: "David P.",
    status: "confirmed",
    members: members(["David P.", "Lea M.", "Omar K.", "Julia F.", "Ben T.", "Clara N."]),
  },
  {
    id: 4,
    category: "Schwimmen",
    title: "Schwimm-Date nach der Arbeit",
    description: "Ein paar Bahnen ziehen und danach gemeinsam in die Sauna.",
    city: "Essen",
    location: "Hallenbad Essen",
    activityDate: inDays(4, 18, 0),
    durationMinutes: 90,
    maxParticipants: 10,
    minParticipants: 3,
    currentParticipants: 4,
    pricePerPerson: "12",
    imageUrl: null,
    organizerName: "Sophie R.",
    status: "open",
    members: members(["Sophie R.", "Paul G.", "Emma D.", "Luca V."]),
  },
  {
    id: 5,
    category: "Lasertag",
    title: "Lasertag Battle – Anfänger willkommen",
    description: "Zwei Runden Lasertag in gemischten Teams. Niemand muss Vorerfahrung haben.",
    city: "Bochum",
    location: "Lasertag Arena Bochum",
    activityDate: inDays(5, 20, 0),
    durationMinutes: 60,
    maxParticipants: 8,
    minParticipants: 4,
    currentParticipants: 2,
    pricePerPerson: "22",
    imageUrl: null,
    organizerName: "Kevin B.",
    status: "open",
    members: members(["Kevin B.", "Lina Z."]),
  },
  {
    id: 6,
    category: "Minigolf",
    title: "Minigolf unter Schwarzlicht",
    description: null,
    city: "Duisburg",
    location: "Schwarzlicht-Minigolf Duisburg",
    activityDate: inDays(6, 19, 30),
    durationMinutes: 60,
    maxParticipants: 6,
    minParticipants: 3,
    currentParticipants: 1,
    pricePerPerson: "14",
    imageUrl: null,
    organizerName: "Hannah E.",
    status: "open",
    members: members(["Hannah E."]),
  },
];

export function getGroupActivity(id: number): GroupActivity | undefined {
  return groupActivities.find((group) => group.id === id);
}
