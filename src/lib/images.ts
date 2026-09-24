// Use public images that are already available
export const categoryImages = {
  'kino': '/images/cinema-real-1.svg',
  'bowling': '/images/bowling-real-1.png', 
  'schwimmbad': '/attached_assets/image_1752783991795.png',
  'zoo': '/attached_assets/image_1749155001337.png',
  'minigolf': '/attached_assets/image_1749155584308.png',
  'sport': '/images/image_1749155868908.png',
  'kultur': '/images/cinema-real-2.svg',
  'wellness': '/attached_assets/image_1752784020928.png',
  'escape-rooms': '/images/image_1749154941807.png',
  'gastronomie': '/images/bowling-real-2.png'
};

export const experienceImages = {
  // Kino
  'kino': [
    '/attached_assets/image_1751828514571.png', // Menschen von hinten im Kino, bläuliche Beleuchtung
    '/attached_assets/image_1751828521734.png', // Kino von hinten mit roten Sitzen
    '/attached_assets/image_1751828534606.png', // Nahaufnahme von Menschen im Kino
    '/attached_assets/image_1751828547739.png', // Glückliche Menschen im Kino
    '/attached_assets/image_1751828549631.png'  // Lächelnde Menschen im Kino
  ],
  // Bowling
  'bowling': [
    '/images/bowling-real-1.png',
    '/images/bowling-real-2.png',
    '/images/bowling-real-3.png',
    '/images/bowling-real-1.png'
  ],
  // Schwimmbad
  'schwimmbad': [
    '/attached_assets/image_1752783973541.png', // Gruppe im türkisblauen Meer mit Korallen
    '/attached_assets/image_1752783991795.png', // Menschen im Pool mit Sonnenschirmen bei Sonnenuntergang
    '/attached_assets/image_1752784000592.png', // Frauen im Pool, lachend und spritzend
    '/attached_assets/image_1752784020928.png', // Luxuriöser Pool mit Palmen und blauem Himmel
    '/attached_assets/image_1752784035131.png'  // Tropischer Pool mit Palmen und Blumen
  ],
  // Zoo
  'zoo': [
    '/attached_assets/image_1749155001337.png'  // Familie streichelt Tiere im Streichelzoo
  ],
  // Minigolf
  'minigolf': [
    '/attached_assets/image_1749155584308.png', // Familie spielt Minigolf bei Sonnenuntergang
    '/attached_assets/image_1749155590469.png', // Große Gruppe am Minigolf-Loch
    '/attached_assets/image_1749155598656.png', // Männer beim Minigolf
    '/attached_assets/image_1749155606440.png'  // Frau konzentriert beim Minigolf
  ],
  // Sport
  'sport': [
    '/images/image_1749155868908.png',
    '/images/image_1749155875662.png',
    '/images/image_1749155936734.png'
  ],
  // Kultur
  'kultur': [
    '/attached_assets/image_1751828514571.png', // Menschen von hinten im Kino, bläuliche Beleuchtung
    '/attached_assets/image_1751828521734.png', // Kino von hinten mit roten Sitzen
    '/attached_assets/image_1751828534606.png', // Nahaufnahme von Menschen im Kino
    '/attached_assets/image_1751828547739.png', // Glückliche Menschen im Kino
    '/attached_assets/image_1751828549631.png'  // Lächelnde Menschen im Kino
  ],
  // Wellness
  'wellness': [
    '/attached_assets/image_1752784020928.png', // Luxuriöser Pool mit Palmen
    '/attached_assets/image_1752784035131.png', // Tropischer Pool mit Blumen
    '/attached_assets/image_1752784000592.png'  // Frauen entspannen im Pool
  ],
  // Gastronomie
  'gastronomie': [
    '/images/bowling-real-1.png',
    '/images/bowling-real-2.png',
    '/images/bowling-real-3.png'
  ]
};

export function getCategoryImage(categorySlug: string): string {
  return categoryImages[categorySlug as keyof typeof categoryImages] || '/images/image_1749154941807.png';
}

export function getExperienceImage(categorySlug: string, index: number = 0): string {
  const images = experienceImages[categorySlug as keyof typeof experienceImages];
  if (!images || images.length === 0) {
    return getCategoryImage(categorySlug);
  }
  return images[index % images.length];
}

export function getRandomExperienceImage(categorySlug: string): string {
  const images = experienceImages[categorySlug as keyof typeof experienceImages];
  if (!images || images.length === 0) {
    return getCategoryImage(categorySlug);
  }
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}