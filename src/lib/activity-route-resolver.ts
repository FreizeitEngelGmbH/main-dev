import { shopPartners } from "@/partner/data";

/**
 * This static build only has a handful of fully working partner shop pages
 * (the entries in shopPartners).
 * - Category / free-text links go to the search page, as in the source app
 *   (`/search?category=...`).
 * - Partner cards use the partner's own shop page when it exists, else the
 *   shop of the same category (climbing, bowling, escape room, cinema), else
 *   the search results for the partner's category - never an unrelated shop
 *   or a broken/unknown route. Swap this out once every partner has a page.
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
  return Number.isFinite(n) && shopPartners.some((p) => p.id === n);
}

/** Best-matching existing partner shop id for a free-text category/badge/label. */
export function resolveCategoryPartnerId(category?: string | null): number {
  const text = category || "";
  for (const [pattern, id] of CATEGORY_KEYWORDS) {
    if (pattern.test(text)) return id;
  }
  return DEFAULT_ACTIVITY_PARTNER_ID;
}

/** Search results for a category or free-text label (source app: /search?category=...). */
export function resolveCategoryRoute(category?: string | null): string {
  const text = (category || "").trim();
  return text ? `/search?category=${encodeURIComponent(text)}` : "/search";
}

/**
 * Route for a partner card: uses the real partner id when it has a working
 * shop page, otherwise the shop of the same category, otherwise the search
 * results for the partner's category.
 */
export function resolvePartnerRoute(partnerId: unknown, category?: string | null): string {
  if (partnerIdExists(partnerId)) return `/partners/${Number(partnerId)}`;
  const text = category || "";
  const match = CATEGORY_KEYWORDS.find(([pattern]) => pattern.test(text));
  return match ? `/partners/${match[1]}` : resolveCategoryRoute(category);
}
