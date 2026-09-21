import { demoShopPartners } from "@/partner-demo/demo-data";

/**
 * This demo only has a handful of fully working partner shop pages
 * (the entries in demoShopPartners). Any activity/category/partner card
 * whose real id has no matching shop page resolves to the closest
 * category match, or to the Bowling shop as the final fallback -
 * never to a broken/unknown route. Swap this out once real detail
 * pages/APIs exist for every category.
 */
export const DEFAULT_ACTIVITY_PARTNER_ID = 502; // Bowling Arena Dortmund
export const DEFAULT_ACTIVITY_DETAIL_ROUTE = `/partners/${DEFAULT_ACTIVITY_PARTNER_ID}`;

const CATEGORY_KEYWORDS: Array<[RegExp, number]> = [
  [/klett|boulder/i, 501],
  [/bowl|kegel/i, 502],
  [/escape/i, 503],
  [/kino|film|cinema/i, 504],
];

export function partnerIdExists(id: unknown): boolean {
  const n = Number(id);
  return Number.isFinite(n) && demoShopPartners.some((p) => p.id === n);
}

/** Best-matching existing partner shop id for a free-text category/badge/label. */
export function resolveCategoryPartnerId(category?: string | null): number {
  const text = category || "";
  for (const [pattern, id] of CATEGORY_KEYWORDS) {
    if (pattern.test(text)) return id;
  }
  return DEFAULT_ACTIVITY_PARTNER_ID;
}

export function resolveCategoryRoute(category?: string | null): string {
  return `/partners/${resolveCategoryPartnerId(category)}`;
}

/**
 * Route for a partner card: uses the real partner id when it has a working
 * shop page, otherwise falls back to the best category match (or Bowling).
 */
export function resolvePartnerRoute(partnerId: unknown, category?: string | null): string {
  if (partnerIdExists(partnerId)) return `/partners/${Number(partnerId)}`;
  return resolveCategoryRoute(category);
}
