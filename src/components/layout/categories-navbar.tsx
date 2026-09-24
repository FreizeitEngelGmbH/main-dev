import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Category } from "@shared/schema";
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
  Zap,
  ChevronRight
} from "lucide-react";

// Icon-Zuordnung für jede Kategorie
const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'swimming':
      return <Droplet className="h-5 w-5" />;
    case 'cinema':
      return <Film className="h-5 w-5" />;
    case 'bowling':
      return <Gamepad className="h-5 w-5" />;
    case 'escape-room':
      return <Key className="h-5 w-5" />;
    case 'zoo':
      return <Bug className="h-5 w-5" />;
    case 'lasertag-paintball':
      return <Target className="h-5 w-5" />;
    case 'museum':
      return <Building className="h-5 w-5" />;
    case 'skiing':
      return <Mountain className="h-5 w-5" />;
    case 'trampoline':
      return <Zap className="h-5 w-5" />;
    default:
      return <Target className="h-5 w-5" />;
  }
};

// Map für Kategorie-Slugs zu Icon-Farben
const CATEGORY_COLORS: Record<string, { iconColor: string, bgColor: string }> = {
  'swimming': { iconColor: 'text-blue-500', bgColor: 'bg-blue-50' },
  'cinema': { iconColor: 'text-purple-500', bgColor: 'bg-purple-50' },
  'bowling': { iconColor: 'text-amber-500', bgColor: 'bg-amber-50' },
  'escape-room': { iconColor: 'text-indigo-500', bgColor: 'bg-indigo-50' },
  'zoo': { iconColor: 'text-green-500', bgColor: 'bg-green-50' },
  'lasertag-paintball': { iconColor: 'text-red-500', bgColor: 'bg-red-50' },
  'museum': { iconColor: 'text-slate-500', bgColor: 'bg-slate-50' },
  'skiing': { iconColor: 'text-blue-600', bgColor: 'bg-blue-50' },
  'trampoline': { iconColor: 'text-orange-500', bgColor: 'bg-orange-50' },
};

export function CategoriesNavbar() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="hidden md:flex items-center py-2 overflow-x-auto scrollbar-hide">
          {isLoading ? (
            // Loading state
            <div className="flex space-x-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-2 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            // Categories list
            <div className="flex space-x-8">
              {categories?.map((category) => {
                const categoryStyle = CATEGORY_COLORS[category.slug] || 
                  { iconColor: 'text-gray-500', bgColor: 'bg-gray-50' };
                
                return (
                  <Link 
                    key={category.id} 
                    href={`/search?category=${category.slug}`}
                    className="flex items-center group"
                  >
                    <div className={cn(
                      "p-1.5 rounded-full mr-2 transition-colors",
                      categoryStyle.bgColor,
                      "group-hover:bg-gray-100"
                    )}>
                      <div className={categoryStyle.iconColor}>
                        {getCategoryIcon(category.slug)}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
              <Link 
                href="/search" 
                className="flex items-center group ml-2"
              >
                <span className="text-sm font-medium text-primary group-hover:underline">
                  Alle Kategorien
                </span>
                <ChevronRight className="h-4 w-4 text-primary ml-1" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}