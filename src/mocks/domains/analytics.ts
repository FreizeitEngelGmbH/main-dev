import { registerMock } from "../mockEngine";
import { partnersSeed, experiencesSeed, bookingsSeed, categoriesSeed } from "../data/core";

// Shape matched against admin-analytics.tsx's local `AnalyticsData`/`PartnerRank`
// interfaces (nested `overview`, `monthlyTrends` not `sixMonthTrend`, etc.)
// — this page destructures fields directly with no optional-chaining in
// several spots, so every array/number below must actually be present.

function partnerRank(p: (typeof partnersSeed)[number]): {
  partnerId: number; companyName: string; bookings: number; revenue: number; avgRating: number; reviewCount: number; experienceCount: number;
} {
  const exps = experiencesSeed.filter((e) => e.partnerId === p.id);
  const partnerBookings = bookingsSeed.filter((b) => exps.some((e) => e.id === b.experienceId));
  return {
    partnerId: p.id,
    companyName: p.companyName,
    bookings: partnerBookings.length,
    revenue: partnerBookings.reduce((s, b) => s + b.totalPrice, 0),
    avgRating: exps.length ? Math.round((exps.reduce((s, e) => s + (e.rating ?? 0), 0) / exps.length) * 10) / 10 : 0,
    reviewCount: exps.reduce((s, e) => s + (e.reviewCount ?? 0), 0),
    experienceCount: exps.length,
  };
}

registerMock("GET", "/api/admin/analytics", () => {
  const totalRevenue = bookingsSeed.reduce((s, b) => s + b.totalPrice, 0);
  const cancelled = bookingsSeed.filter((b) => b.status === "cancelled").length;
  const ranked = partnersSeed.map(partnerRank);

  return {
    overview: {
      totalBookings: bookingsSeed.length,
      monthlyBookings: bookingsSeed.length,
      weeklyBookings: Math.round(bookingsSeed.length / 4),
      totalRevenue,
      monthlyRevenue: totalRevenue,
      avgOrderValue: bookingsSeed.length ? Math.round((totalRevenue / bookingsSeed.length) * 100) / 100 : 0,
      conversionRate: 3.8,
      cancellationRate: bookingsSeed.length ? Math.round((cancelled / bookingsSeed.length) * 1000) / 10 : 0,
      totalPartners: partnersSeed.length,
      activePartners: partnersSeed.filter((p) => p.approved).length,
      totalExperiences: experiencesSeed.length,
      totalReviews: experiencesSeed.reduce((s, e) => s + (e.reviewCount ?? 0), 0),
    },
    topPartnersByBookings: [...ranked].sort((a, b) => b.bookings - a.bookings),
    topPartnersByRevenue: [...ranked].sort((a, b) => b.revenue - a.revenue),
    topPartnersByRating: [...ranked].sort((a, b) => b.avgRating - a.avgRating),
    categoryDistribution: categoriesSeed.map((c) => ({
      name: c.name,
      count: experiencesSeed.filter((e) => e.categoryId === c.id).length,
    })),
    monthlyTrends: ["Feb", "Mär", "Apr", "Mai", "Jun", "Jul"].map((month, i) => ({
      month,
      bookings: 40 + i * 8,
      revenue: 2400 + i * 700,
    })),
  };
});
