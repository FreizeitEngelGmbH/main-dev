import { featuredExperiences, marketplacePartners } from "@/partner/data";
import { getGroupActivityImage } from "@/lib/group-activity-images";

/**
 * Static data for the search page (`/search`), built from the same offer
 * catalogue the home page shows. Field names follow the backend's
 * `/api/experiences` rows so a real API can replace this module later.
 */
export interface SearchExperience {
  id: number;
  title: string;
  description: string;
  city: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  partnerId: number;
  partnerName: string;
  category: string;
  imageUrl: string;
  duration?: string;
  instantBooking?: boolean;
}

// Maps offer categories onto the stock-photo keys of getGroupActivityImage.
const IMAGE_CATEGORY_STEMS: Array<[string, string]> = [
  ["klett", "klettern"],
  ["bowl", "bowling"],
  ["escape", "escape room"],
  ["laser", "lasertag"],
  ["trampo", "trampolin"],
  ["minigolf", "minigolf"],
  ["paintball", "paintball"],
  ["schwimm", "schwimmen"],
];

function imageFor(category: string): string {
  const lower = category.toLowerCase();
  const key = IMAGE_CATEGORY_STEMS.find(([stem]) => lower.includes(stem))?.[1] ?? category;
  return getGroupActivityImage({ category: key });
}

const categoryByPartner = new Map(marketplacePartners.map((p) => [p.id, p.category]));

export const searchExperiences: SearchExperience[] = featuredExperiences.map((e) => {
  const category = categoryByPartner.get(e.partnerId) ?? "";
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    city: e.city,
    location: e.location,
    price: e.price,
    rating: e.rating,
    reviewCount: e.reviewCount,
    partnerId: e.partnerId,
    partnerName: e.partnerName,
    category,
    imageUrl: imageFor(category),
  };
});
