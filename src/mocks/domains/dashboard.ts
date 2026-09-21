import { registerMock } from "../mockEngine";
import { partnersSeed, experiencesSeed, bookingsSeed, usersSeed } from "../data/core";

function bookingsByStatus() {
  return {
    pending: bookingsSeed.filter((b) => b.status === "pending").length,
    confirmed: bookingsSeed.filter((b) => b.status === "confirmed").length,
    cancelled: bookingsSeed.filter((b) => b.status === "cancelled").length,
    completed: bookingsSeed.filter((b) => b.status === "completed").length,
  };
}

registerMock("GET", "/api/admin/stats", () => ({
  totalExperiences: experiencesSeed.length,
  totalBookings: bookingsSeed.length,
  totalPartners: partnersSeed.length,
  totalUsers: usersSeed.length,
  totalRevenue: bookingsSeed.reduce((sum, b) => sum + b.totalPrice, 0),
  bookingsByStatus: bookingsByStatus(),
}));

// Shape matched against admin-partner-overview.tsx's local `PlatformStats`
// and `PartnerOverview` interfaces — this page calls `.toFixed()` on
// several of these fields, so every numeric field must actually be a
// number (not undefined) even for a partner with zero bookings.
const platformTotalRevenue = bookingsSeed.reduce((sum, b) => sum + b.totalPrice, 0);

registerMock("GET", "/api/admin/platform-stats", () => ({
  totalPartners: partnersSeed.length,
  activePartners: partnersSeed.filter((p) => p.approved).length,
  pendingPartners: partnersSeed.filter((p) => !p.approved).length,
  totalRevenue: platformTotalRevenue,
  platformCommission: Math.round(platformTotalRevenue * 0.11 * 100) / 100,
  totalBookings: bookingsSeed.length,
  averagePartnerRating: experiencesSeed.length
    ? Math.round((experiencesSeed.reduce((s, e) => s + (e.rating ?? 0), 0) / experiencesSeed.length) * 10) / 10
    : 0,
}));

registerMock("GET", "/api/admin/partners-overview", () =>
  partnersSeed.map((p) => {
    const partnerBookings = bookingsSeed.filter((b) => experiencesSeed.find((e) => e.id === b.experienceId)?.partnerId === p.id);
    const totalRevenue = partnerBookings.reduce((s, b) => s + b.totalPrice, 0);
    return {
      id: p.id,
      companyName: p.companyName,
      contactPerson: p.contactPerson,
      email: p.email,
      totalExperiences: experiencesSeed.filter((e) => e.partnerId === p.id).length,
      totalBookings: partnerBookings.length,
      totalRevenue,
      monthlyRevenue: Math.round((totalRevenue / 3) * 100) / 100,
      averageRating: (() => {
        const exps = experiencesSeed.filter((e) => e.partnerId === p.id);
        return exps.length ? Math.round((exps.reduce((s, e) => s + (e.rating ?? 0), 0) / exps.length) * 10) / 10 : 0;
      })(),
      status: p.isLive ? "active" : p.approved ? "pending" : "inactive",
      joinedDate: p.createdAt,
    };
  })
);

registerMock("GET", "/api/admin/recent-bookings", () =>
  [...bookingsSeed]
    .sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime())
    .slice(0, 8)
    .map((b) => ({ ...b, experienceTitle: experiencesSeed.find((e) => e.id === b.experienceId)?.title }))
);
