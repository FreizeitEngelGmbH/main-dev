export const PARTNER_BASE = "/partner";

export const partnerPaths = {
  dashboard: PARTNER_BASE,
  bookings: `${PARTNER_BASE}/bookings`,
  experiences: `${PARTNER_BASE}/experiences`,
  availability: `${PARTNER_BASE}/availability`,
  payouts: `${PARTNER_BASE}/payouts`,
  messages: `${PARTNER_BASE}/messages`,
  profile: `${PARTNER_BASE}/profile`,
} as const;
