import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Droplet, 
  Film, 
  Gamepad, 
  Key, 
  Bug, // Ersatz für Cat
  Target, 
  Building, 
  Mountain, 
  Zap
} from "lucide-react";

interface CategoryCardProps {
  id: number;
  name: string;
  slug: string;
  count?: number;
  className?: string;
  // imageUrl wird optional, da wir jetzt mit Icons arbeiten
  imageUrl?: string;
}

// Hilfsfunktion um Hintergrundfarbe aus Icon-Farbe zu generieren
const getBgColorClass = (iconColor: string): string => {
  const color = iconColor.split('-')[1];
  
  switch (color) {
    case 'blue': return 'bg-blue-50';
    case 'purple': return 'bg-purple-50';
    case 'amber': return 'bg-amber-50';
    case 'indigo': return 'bg-indigo-50';
    case 'green': return 'bg-green-50';
    case 'red': return 'bg-red-50';
    case 'slate': return 'bg-slate-50';
    case 'orange': return 'bg-orange-50';
    default: return 'bg-gray-50';
  }
};

// Icon-Zuordnung für jede Kategorie im Flaschenpost-Stil
const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'swimming':
      return <Droplet className="h-10 w-10" />;
    case 'cinema':
      return <Film className="h-10 w-10" />;
    case 'bowling':
      return <Gamepad className="h-10 w-10" />;
    case 'escape-room':
      return <Key className="h-10 w-10" />;
    case 'zoo':
      return <Bug className="h-10 w-10" />;
    case 'lasertag-paintball':
      return <Target className="h-10 w-10" />;
    case 'museum':
      return <Building className="h-10 w-10" />;
    case 'skiing':
      return <Mountain className="h-10 w-10" />;
    case 'trampoline':
      return <Zap className="h-10 w-10" />;
    default:
      return <Target className="h-10 w-10" />;
  }
};

// Map für Kategorie-Slugs zu Icon-Farben (Flaschenpost-Stil)
const CATEGORY_COLORS: Record<string, { iconColor: string, textColor: string }> = {
  'swimming': { iconColor: 'text-blue-500', textColor: 'text-blue-700' },
  'cinema': { iconColor: 'text-purple-500', textColor: 'text-purple-700' },
  'bowling': { iconColor: 'text-amber-500', textColor: 'text-amber-700' },
  'escape-room': { iconColor: 'text-indigo-500', textColor: 'text-indigo-700' },
  'zoo': { iconColor: 'text-green-500', textColor: 'text-green-700' },
  'lasertag-paintball': { iconColor: 'text-red-500', textColor: 'text-red-700' },
  'museum': { iconColor: 'text-slate-500', textColor: 'text-slate-700' },
  'skiing': { iconColor: 'text-blue-600', textColor: 'text-blue-800' },
  'trampoline': { iconColor: 'text-orange-500', textColor: 'text-orange-700' },
};

export function CategoryCard({
  name,
  slug,
  count,
  className,
}: CategoryCardProps) {
  const categoryStyle = CATEGORY_COLORS[slug] || { iconColor: 'text-gray-500', textColor: 'text-gray-700' };
  
  // Flaschenpost-style category card
  return (
    <Link href={`/search?category=${slug}`}>
      <div className={cn(
        "flex flex-col items-center bg-white rounded-xl p-4 shadow-md cursor-pointer transition hover:shadow-lg border border-gray-100",
        "min-w-[100px] max-w-[120px]",
        className
      )}>
        {/* Icon Container mit heller Hintergrundfarbe */}
        <div className={cn(
          "rounded-full p-3 mb-3 flex items-center justify-center",
          getBgColorClass(categoryStyle.iconColor)
        )}>
          <div className={cn(categoryStyle.iconColor)}>
            {getCategoryIcon(slug)}
          </div>
        </div>
        
        {/* Kategoriename und Anzahl */}
        <h3 className={cn(
          "font-medium text-center text-sm leading-tight",
          categoryStyle.textColor
        )}>
          {name}
        </h3>
        
        {count !== undefined && (
          <p className="text-gray-500 text-xs text-center mt-1">
            {count} Erlebnisse
          </p>
        )}
      </div>
    </Link>
  );
}