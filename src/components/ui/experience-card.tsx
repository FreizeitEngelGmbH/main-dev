import { Link } from "wouter";
import { MapPin, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoritesButton } from "@/components/favorites-button";
// STATIC: getCategoryImage/getRandomExperienceImage import removed - depended on
// @/lib/images, a file with dozens of /attached_assets/* paths never uploaded.
// This component is not currently used by the trimmed home page; the import
// was dead code relative to what's wired up in this static build.

interface ExperienceCardProps {
  id: number;
  title: string;
  shortDescription: string;
  location: string;
  city: string;
  price: number;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  trending?: boolean;
  recommended?: boolean;
  categoryId?: number;
  partnerName?: string;
}

export function ExperienceCard({
  id,
  title,
  shortDescription,
  location,
  city,
  price,
  imageUrl,
  rating,
  reviewCount,
  featured,
  trending,
  recommended,
  categoryId,
  partnerName
}: ExperienceCardProps) {
  
  // Determine category from title or use fallback
  const getCategorySlug = () => {
    // Schwimmbad/Pool-Erkennung verbessern
    if (title.toLowerCase().includes('schwimm') || 
        title.toLowerCase().includes('freibad') || 
        title.toLowerCase().includes('hallenbad') || 
        title.toLowerCase().includes('pool') ||
        title.toLowerCase().includes('wasserwelten') ||
        title.toLowerCase().includes('bad')) return 'schwimmbad';
    
    if (title.toLowerCase().includes('kino') || 
        title.toLowerCase().includes('film') || 
        title.toLowerCase().includes('cinema')) return 'kino';
    if (title.toLowerCase().includes('bowling')) return 'bowling';
    if (title.toLowerCase().includes('tier') || title.toLowerCase().includes('zoo')) return 'zoo';
    if (title.toLowerCase().includes('minigolf')) return 'minigolf';
    if (title.toLowerCase().includes('sport')) return 'sport';
    if (title.toLowerCase().includes('kultur')) return 'kultur';
    if (title.toLowerCase().includes('wellness') || title.toLowerCase().includes('spa')) return 'wellness';
    return 'schwimmbad'; // Bei unklaren Fällen Schwimmbad bevorzugen für MVP
  };
  
  // Schwimmbad-Bilder haben Priorität - verwende immer Swimming-Pool-Bilder für Schwimmbäder
  const getCategoryImage = () => {
    if (getCategorySlug() === 'schwimmbad') {
      // Für Schwimmbäder: Verwende immer die korrekten Pool-Bilder
      const poolImages = [
        '/attached_assets/image_1752783973541.png', // Gruppe im türkisblauen Meer mit Korallen
        '/attached_assets/image_1752783991795.png', // Menschen im Pool mit Sonnenschirmen bei Sonnenuntergang
        '/attached_assets/image_1752784000592.png', // Frauen im Pool, lachend und spritzend
        '/attached_assets/image_1752784020928.png', // Luxuriöser Pool mit Palmen und blauem Himmel
        '/attached_assets/image_1752784035131.png'  // Tropischer Pool mit Palmen und Blumen
      ];
      // Verwende eine konsistente Auswahl basierend auf der Experience ID
      const poolIndex = id % poolImages.length;
      return poolImages[poolIndex];
    }
    return categoryFallback; // STATIC: static fallback, real getRandomExperienceImage() unavailable
  };
  const categoryFallback = "/src/assets/images/zoo.png";
  
  const finalImageUrl = imageUrl || getCategoryImage();
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48">
        <Link href={`/experience/${id}`}>
          <img
            src={finalImageUrl}
            alt={title}
            className="w-full h-full object-cover cursor-pointer"
          />
        </Link>
        {featured && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-primary text-white">Empfohlen</Badge>
          </div>
        )}
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
            <span className="text-sm font-semibold">{typeof price === 'number' ? price.toFixed(2).replace('.', ',') : String(price).replace('.', ',')}€</span>
          </div>
          <FavoritesButton 
            experienceId={id} 
            variant="ghost"
            size="icon"
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
          />
        </div>
      </div>
      
      <Link href={`/experience/${id}`}>
        <div className="p-4 cursor-pointer">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{partnerName || title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{shortDescription}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{city}</span>
            </div>
            
            {rating > 0 && (
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                <span>{rating.toFixed(1)}</span>
                {reviewCount > 0 && (
                  <span className="ml-1">({reviewCount})</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}