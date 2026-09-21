import escapeRoomImg from "@assets/stock_images/escape_room_mystery__428a25a2.jpg";
import bowlingImg from "@assets/stock_images/bowling_alley_lanes__8651d53f.jpg";
import lasertagImg from "@assets/stock_images/laser_tag_arena_game_5fd26cf4.jpg";
import trampolinImg from "@assets/stock_images/trampoline_park_jump_58ef9cec.jpg";
import kletternImg from "@assets/stock_images/climbing_wall_indoor_76f05e36.jpg";
import minigolfImg from "@assets/stock_images/minigolf_adventure_g_93cab347.jpg";
import paintballImg from "@assets/stock_images/paintball_action_pla_8ec3b545.jpg";
import schwimmenImg from "@assets/stock_images/swimming_pool_indoor_03fbcff5.jpg";
import familyImg from "@assets/stock_images/family_outdoor_trip__f5998529.jpg";

/**
 * Real per-category stock photos for group activities ("Mach-mit-Gruppen"),
 * copied from the original FreizeitEngel source project's attached_assets/
 * stock_images/ (the same files and category mapping the real
 * GroupActivitiesSection.tsx uses) - not newly generated substitutes.
 * Shared by the homepage's GroupActivitiesSection and the partner-side
 * Group Activity card/detail pages so both resolve images the same way.
 */
const CATEGORY_PLACEHOLDER_IMAGES: Record<string, string> = {
  "escape room": escapeRoomImg,
  escape: escapeRoomImg,
  bowling: bowlingImg,
  lasertag: lasertagImg,
  "laser tag": lasertagImg,
  kart: lasertagImg,
  trampolin: trampolinImg,
  bubble: trampolinImg,
  klettern: kletternImg,
  minigolf: minigolfImg,
  paintball: paintballImg,
  schwimmen: schwimmenImg,
};
const DEFAULT_PLACEHOLDER_IMAGE = familyImg;

export function getGroupActivityImage(activity: {
  imageUrl?: string | null;
  category?: string | null;
}): string {
  return (
    activity.imageUrl ||
    CATEGORY_PLACEHOLDER_IMAGES[(activity.category || "").toLowerCase()] ||
    DEFAULT_PLACEHOLDER_IMAGE
  );
}
