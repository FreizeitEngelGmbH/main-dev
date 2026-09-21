import { User, Partner, Category, Experience, Booking } from "@shared/schema";

const now = () => new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000).toISOString();

export const usersSeed: User[] = [
  { id: 1, username: "admin", password: "", email: "admin@freizeitengel.demo", fullName: "Admin Demo", profileImage: null, role: "admin", createdAt: daysAgo(400) },
  { id: 2, username: "mschmidt", password: "", email: "m.schmidt@bowlorado.de", fullName: "Markus Schmidt", profileImage: null, role: "partner", createdAt: daysAgo(300) },
  { id: 3, username: "lweber", password: "", email: "l.weber@kletterhalle-do.de", fullName: "Laura Weber", profileImage: null, role: "partner", createdAt: daysAgo(280) },
  { id: 4, username: "tmueller", password: "", email: "t.mueller@escaperoom-bo.de", fullName: "Tobias Müller", profileImage: null, role: "partner", createdAt: daysAgo(260) },
  { id: 5, username: "jkoenig", password: "", email: "j.koenig@example.com", fullName: "Julia König", profileImage: null, role: "user", createdAt: daysAgo(120) },
  { id: 6, username: "fbraun", password: "", email: "f.braun@example.com", fullName: "Felix Braun", profileImage: null, role: "user", createdAt: daysAgo(90) },
];

export const categoriesSeed: Category[] = [
  { id: 1, name: "Bowling", slug: "bowling", imageUrl: null, bookingArchetype: "TIME_SLOT", defaultDurationMin: 60, requiresEquipment: true, maxGroupSize: 12, priceModel: "PER_HOUR" },
  { id: 2, name: "Kletterhalle", slug: "kletterhalle", imageUrl: null, bookingArchetype: "DAY_PASS", defaultDurationMin: 180, requiresEquipment: true, maxGroupSize: 20, priceModel: "PER_PERSON" },
  { id: 3, name: "Escape Room", slug: "escape-room", imageUrl: null, bookingArchetype: "TIME_SLOT", defaultDurationMin: 60, requiresEquipment: false, maxGroupSize: 6, priceModel: "PER_GROUP" },
  { id: 4, name: "Schwimmbad", slug: "schwimmbad", imageUrl: null, bookingArchetype: "DAY_PASS", defaultDurationMin: 240, requiresEquipment: false, maxGroupSize: 10, priceModel: "PER_PERSON" },
  { id: 5, name: "Minigolf", slug: "minigolf", imageUrl: null, bookingArchetype: "TIME_SLOT", defaultDurationMin: 60, requiresEquipment: false, maxGroupSize: 8, priceModel: "PER_PERSON" },
];

export const partnersSeed: Partner[] = [
  {
    id: 1, userId: 2, companyName: "Bowlorado Dortmund", contactPerson: "Markus Schmidt", email: "m.schmidt@bowlorado.de",
    phone: "+49 231 5550101", address: "Westfalendamm 12", postalCode: "44141", city: "Dortmund", location: "Dortmund",
    country: "Deutschland", category: "Bowling", description: "12-Bahnen Bowlingcenter mit Cocktailbar.", website: "https://bowlorado.de",
    foundedYear: 2012, status: "aktiv", approved: true, openingHours: "Mo-So 12:00-24:00", latitude: 51.5136, longitude: 7.4653,
    logoUrl: null, logoBgColor: "black", tourUrl: null, isLive: true, bookingSystem: "roller",
    rollerClientId: "demo-client-id", rollerClientSecret: null, rollerVenueId: "venue-001", rollerEnvironment: "production",
    regiondoApiKey: null, regiondoSecretKey: null, regiondoSupplierId: null, regiondoEnvironment: "production",
    eversportApiToken: null, eversportVenueId: null, eversportEnvironment: "production",
    pretixApiToken: null, pretixOrganizerSlug: null, pretixEventSlug: null, pretixEnvironment: "production",
    planyoApiKey: null, planyoHashKey: null, planyoSiteId: null, planyoEnvironment: "production",
    createdAt: daysAgo(300),
  },
  {
    id: 2, userId: 3, companyName: "Kletterhalle Dortmund", contactPerson: "Laura Weber", email: "l.weber@kletterhalle-do.de",
    phone: "+49 231 5550202", address: "Ruhrallee 45", postalCode: "44139", city: "Dortmund", location: "Dortmund",
    country: "Deutschland", category: "Klettern", description: "Boulder- und Seilkletterhalle für alle Level.", website: "https://kletterhalle-do.de",
    foundedYear: 2015, status: "aktiv", approved: true, openingHours: "Mo-Fr 10:00-23:00, Sa-So 09:00-21:00", latitude: 51.5045, longitude: 7.4739,
    logoUrl: null, logoBgColor: "black", tourUrl: null, isLive: true, bookingSystem: "eversport",
    rollerClientId: null, rollerClientSecret: null, rollerVenueId: null, rollerEnvironment: "production",
    regiondoApiKey: null, regiondoSecretKey: null, regiondoSupplierId: null, regiondoEnvironment: "production",
    eversportApiToken: "demo-token", eversportVenueId: "venue-002", eversportEnvironment: "production",
    pretixApiToken: null, pretixOrganizerSlug: null, pretixEventSlug: null, pretixEnvironment: "production",
    planyoApiKey: null, planyoHashKey: null, planyoSiteId: null, planyoEnvironment: "production",
    createdAt: daysAgo(280),
  },
  {
    id: 3, userId: 4, companyName: "Escape Room Bochum", contactPerson: "Tobias Müller", email: "t.mueller@escaperoom-bo.de",
    phone: "+49 234 5550303", address: "Kortumstraße 87", postalCode: "44787", city: "Bochum", location: "Bochum",
    country: "Deutschland", category: "Escape Room", description: "4 thematische Escape Rooms für 2-6 Spieler.", website: "https://escaperoom-bochum.de",
    foundedYear: 2018, status: "aktiv", approved: false, openingHours: "Mo-So 14:00-22:00", latitude: 51.4818, longitude: 7.2162,
    logoUrl: null, logoBgColor: "black", tourUrl: null, isLive: false, bookingSystem: "internal",
    rollerClientId: null, rollerClientSecret: null, rollerVenueId: null, rollerEnvironment: "production",
    regiondoApiKey: null, regiondoSecretKey: null, regiondoSupplierId: null, regiondoEnvironment: "production",
    eversportApiToken: null, eversportVenueId: null, eversportEnvironment: "production",
    pretixApiToken: null, pretixOrganizerSlug: null, pretixEventSlug: null, pretixEnvironment: "production",
    planyoApiKey: null, planyoHashKey: null, planyoSiteId: null, planyoEnvironment: "production",
    createdAt: daysAgo(90),
  },
  {
    id: 4, userId: 4, companyName: "AquaFun Essen", contactPerson: "Sandra Klein", email: "s.klein@aquafun-essen.de",
    phone: "+49 201 5550404", address: "Ruhrpark 3", postalCode: "45127", city: "Essen", location: "Essen",
    country: "Deutschland", category: "Schwimmbad", description: "Hallenbad mit Rutschen, Sauna und Außenbecken.", website: "https://aquafun-essen.de",
    foundedYear: 2005, status: "aktiv", approved: true, openingHours: "Mo-So 08:00-22:00", latitude: 51.4556, longitude: 7.0116,
    logoUrl: null, logoBgColor: "black", tourUrl: null, isLive: true, bookingSystem: "pretix",
    rollerClientId: null, rollerClientSecret: null, rollerVenueId: null, rollerEnvironment: "production",
    regiondoApiKey: null, regiondoSecretKey: null, regiondoSupplierId: null, regiondoEnvironment: "production",
    eversportApiToken: null, eversportVenueId: null, eversportEnvironment: "production",
    pretixApiToken: "demo-token", pretixOrganizerSlug: "aquafun", pretixEventSlug: "tagesticket", pretixEnvironment: "production",
    planyoApiKey: null, planyoHashKey: null, planyoSiteId: null, planyoEnvironment: "production",
    createdAt: daysAgo(60),
  },
  {
    id: 5, userId: 4, companyName: "Minigolfpark Bochum", contactPerson: "Peter Hoffmann", email: "p.hoffmann@minigolf-bo.de",
    phone: "+49 234 5550505", address: "Parkallee 9", postalCode: "44795", city: "Bochum", location: "Bochum",
    country: "Deutschland", category: "Minigolf", description: "18-Loch Schwarzlicht-Minigolf.", website: "https://minigolfpark-bochum.de",
    foundedYear: 2020, status: "aktiv", approved: false, openingHours: "Mi-So 13:00-21:00", latitude: 51.4818, longitude: 7.2380,
    logoUrl: null, logoBgColor: "black", tourUrl: null, isLive: false, bookingSystem: "planyo",
    rollerClientId: null, rollerClientSecret: null, rollerVenueId: null, rollerEnvironment: "production",
    regiondoApiKey: null, regiondoSecretKey: null, regiondoSupplierId: null, regiondoEnvironment: "production",
    eversportApiToken: null, eversportVenueId: null, eversportEnvironment: "production",
    pretixApiToken: null, pretixOrganizerSlug: null, pretixEventSlug: null, pretixEnvironment: "production",
    planyoApiKey: "demo-key", planyoHashKey: null, planyoSiteId: "site-005", planyoEnvironment: "production",
    createdAt: daysAgo(30),
  },
];

export const experiencesSeed: Experience[] = [
  { id: 1, title: "Bowling Abend (2 Std.)", description: "Zwei Stunden Bowling inkl. Schuhe für bis zu 6 Personen.", shortDescription: "2 Std. Bowling inkl. Schuhe", location: "Westfalendamm 12", city: "Dortmund", postalCode: "44141", country: "Deutschland", price: 18.5, imageUrl: null, categoryId: 1, partnerId: 1, partnerName: "Bowlorado Dortmund", rating: 4.6, reviewCount: 128, createdAt: daysAgo(250), featured: true, trending: true, recommended: true, active: true, duration: "120", maxParticipants: "6", specialNotes: null, partnerContact: null, instantBooking: true, requiresApproval: false, bookingConfig: null },
  { id: 2, title: "Tagesticket Boulderhalle", description: "Ganztägiger Zugang zu allen Boulder- und Kletterbereichen.", shortDescription: "Ganztages-Zugang", location: "Ruhrallee 45", city: "Dortmund", postalCode: "44139", country: "Deutschland", price: 15, imageUrl: null, categoryId: 2, partnerId: 2, partnerName: "Kletterhalle Dortmund", rating: 4.8, reviewCount: 94, createdAt: daysAgo(240), featured: true, trending: false, recommended: true, active: true, duration: "480", maxParticipants: "1", specialNotes: null, partnerContact: null, instantBooking: true, requiresApproval: false, bookingConfig: null },
  { id: 3, title: "Escape Room: Pharaograb", description: "60 Minuten, um dem verfluchten Grab zu entkommen.", shortDescription: "60 Min. Escape Room", location: "Kortumstraße 87", city: "Bochum", postalCode: "44787", country: "Deutschland", price: 29, imageUrl: null, categoryId: 3, partnerId: 3, partnerName: "Escape Room Bochum", rating: 4.9, reviewCount: 61, createdAt: daysAgo(80), featured: false, trending: true, recommended: false, active: true, duration: "60", maxParticipants: "6", specialNotes: null, partnerContact: null, instantBooking: false, requiresApproval: true, bookingConfig: null },
  { id: 4, title: "Tagesticket Schwimmbad", description: "Ganztageszugang zu Becken, Rutschen und Sauna.", shortDescription: "Ganztages-Badespaß", location: "Ruhrpark 3", city: "Essen", postalCode: "45127", country: "Deutschland", price: 12, imageUrl: null, categoryId: 4, partnerId: 4, partnerName: "AquaFun Essen", rating: 4.4, reviewCount: 203, createdAt: daysAgo(55), featured: false, trending: false, recommended: true, active: true, duration: "240", maxParticipants: "1", specialNotes: null, partnerContact: null, instantBooking: true, requiresApproval: false, bookingConfig: null },
  { id: 5, title: "Minigolf Runde (18 Bahnen)", description: "Eine Runde Schwarzlicht-Minigolf über 18 Bahnen.", shortDescription: "18 Bahnen Schwarzlicht-Minigolf", location: "Parkallee 9", city: "Bochum", postalCode: "44795", country: "Deutschland", price: 9.5, imageUrl: null, categoryId: 5, partnerId: 5, partnerName: "Minigolfpark Bochum", rating: 4.3, reviewCount: 37, createdAt: daysAgo(25), featured: false, trending: false, recommended: false, active: false, duration: "60", maxParticipants: "8", specialNotes: null, partnerContact: null, instantBooking: true, requiresApproval: false, bookingConfig: null },
];

const bookingStatuses = ["pending", "confirmed", "completed", "cancelled"] as const;

export const bookingsSeed: Booking[] = Array.from({ length: 14 }).map((_, i) => {
  const exp = experiencesSeed[i % experiencesSeed.length];
  const status = bookingStatuses[i % bookingStatuses.length];
  const participants = 2 + (i % 4);
  return {
    id: i + 1,
    bookingReference: `BK-${(100000 + i).toString(36).toUpperCase()}`,
    userId: i % 3 === 0 ? null : usersSeed[4 + (i % 2)].id,
    experienceId: exp.id,
    slotId: null,
    resourceId: null,
    date: i % 2 === 0 ? daysFromNow(i) : daysAgo(i),
    startTime: null,
    endTime: null,
    participants,
    adultsCount: participants,
    childrenCount: 0,
    unitPrice: exp.price,
    totalPrice: Math.round(exp.price * participants * 100) / 100,
    discountAmount: 0,
    discountReason: null,
    status,
    contactName: i % 3 === 0 ? "Gast Buchung" : usersSeed[4 + (i % 2)].fullName,
    contactEmail: i % 3 === 0 ? `gast${i}@example.com` : usersSeed[4 + (i % 2)].email,
    contactPhone: null,
    message: null,
    specialRequests: null,
    paymentMethod: i % 2 === 0 ? "stripe" : "paypal",
    paymentStatus: status === "cancelled" ? "refunded" : "paid",
    paymentId: `pay_demo_${i}`,
    stripePaymentIntentId: null,
    stripeChargeId: null,
    stripeTransferId: null,
    isGuestBooking: i % 3 === 0,
    qrCode: null,
    bookingDetails: null,
    createdAt: daysAgo(20 - i),
    confirmedAt: status !== "pending" ? daysAgo(19 - i) : null,
    cancelledAt: status === "cancelled" ? daysAgo(18 - i) : null,
  };
});

export { now, daysAgo, daysFromNow };
