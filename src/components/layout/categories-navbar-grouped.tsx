import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Film, 
  Theater, 
  Building, 
  Bug, 
  Droplet, 
  Flame, 
  Flower2, 
  Dumbbell, 
  Mountain, 
  Flag, 
  Footprints, 
  Ticket, 
  Key, 
  Target, 
  Gamepad, 
  Circle, 
  DraftingCompass, 
  Music, 
  Palmtree, 
  Heart, 
  Sparkles, 
  ChevronDown
} from "lucide-react";

// Kategorie-Struktur
export const categoryGroups = [
  {
    id: 'entertainment',
    name: 'Kultur & Unterhaltung',
    icon: <Music className="h-4 w-4" />,
    color: { iconColor: 'text-purple-500', bgColor: 'bg-purple-50' },
    subcategories: [
      { id: 'cinema', name: 'Kino', icon: <Film className="h-4 w-4" />, slug: 'cinema' },
      { id: 'theater', name: 'Theater', icon: <Theater className="h-4 w-4" />, slug: 'theater' },
      { id: 'museum', name: 'Museum', icon: <Building className="h-4 w-4" />, slug: 'museum' },
      { id: 'zoo', name: 'Zoo', icon: <Bug className="h-4 w-4" />, slug: 'zoo' }
    ]
  },
  {
    id: 'wellness',
    name: 'Entspannung & Wellness',
    icon: <Palmtree className="h-4 w-4" />,
    color: { iconColor: 'text-blue-500', bgColor: 'bg-blue-50' },
    subcategories: [
      { id: 'swimming', name: 'Schwimmen', icon: <Droplet className="h-4 w-4" />, slug: 'swimming' },
      { id: 'sauna', name: 'Sauna', icon: <Flame className="h-4 w-4" />, slug: 'sauna' },
      { id: 'spa', name: 'Spa', icon: <Flower2 className="h-4 w-4" />, slug: 'spa' }
    ]
  },
  {
    id: 'sports',
    name: 'Sport & Bewegung',
    icon: <Dumbbell className="h-4 w-4" />,
    color: { iconColor: 'text-green-500', bgColor: 'bg-green-50' },
    subcategories: [
      { id: 'soccerworld', name: 'Soccerworld', icon: <Flag className="h-4 w-4" />, slug: 'soccer' },
      { id: 'climbing', name: 'Klettern', icon: <Dumbbell className="h-4 w-4" />, slug: 'climbing' },
      { id: 'skiing', name: 'Skifahren', icon: <Mountain className="h-4 w-4" />, slug: 'skiing' },
      { id: 'hiking', name: 'Wandern', icon: <Footprints className="h-4 w-4" />, slug: 'hiking' }
    ]
  },
  {
    id: 'parks',
    name: 'Freizeitparks & Erlebnisse',
    icon: <Sparkles className="h-4 w-4" />,
    color: { iconColor: 'text-amber-500', bgColor: 'bg-amber-50' },
    subcategories: [
      { id: 'moviepark', name: 'Movie Park', icon: <Gamepad className="h-4 w-4" />, slug: 'movie-park' },
      { id: 'escape-room', name: 'Escape Room', icon: <Key className="h-4 w-4" />, slug: 'escape-room' },
      { id: 'paintball', name: 'Paintball', icon: <Target className="h-4 w-4" />, slug: 'lasertag-paintball' },
      { id: 'lasertag', name: 'Lasertag', icon: <Target className="h-4 w-4" />, slug: 'lasertag' }
    ]
  },
  {
    id: 'social',
    name: 'Gesellige Aktivitäten',
    icon: <Heart className="h-4 w-4" />,
    color: { iconColor: 'text-red-500', bgColor: 'bg-red-50' },
    subcategories: [
      { id: 'bowling', name: 'Bowling', icon: <Gamepad className="h-4 w-4" />, slug: 'bowling' },
      { id: 'billiards', name: 'Billard', icon: <Circle className="h-4 w-4" />, slug: 'billiards' },
      { id: 'minigolf', name: 'Minigolf', icon: <DraftingCompass className="h-4 w-4" />, slug: 'minigolf' }
    ]
  }
];

export function CategoriesNavbar() {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="hidden md:flex items-center py-0.5 overflow-x-auto scrollbar-hide">
          {/* Categories with dropdowns */}
          <div className="flex space-x-4">
            {categoryGroups.map((group) => (
              <DropdownMenu key={group.id}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center group">
                    <div className={cn(
                      "p-0.5 rounded-full mr-1 transition-colors",
                      group.color.bgColor,
                      "group-hover:bg-gray-100"
                    )}>
                      <div className={group.color.iconColor}>
                        {group.icon}
                      </div>
                    </div>
                    <span className="text-[0.7rem] font-medium text-gray-700 group-hover:text-primary mr-0.5">
                      {group.name}
                    </span>
                    <ChevronDown className="h-3 w-3 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  {group.subcategories.map((subcategory) => (
                    <Link key={subcategory.id} href={`/search?category=${subcategory.slug}`}>
                      <DropdownMenuItem className="cursor-pointer py-1">
                        <div className={group.color.iconColor}>
                          {subcategory.icon}
                        </div>
                        <span className="ml-2 text-[0.7rem]">{subcategory.name}</span>
                      </DropdownMenuItem>
                    </Link>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
            
            <Link 
              href="/search" 
              className="flex items-center group ml-1"
            >
              <span className="text-[0.7rem] font-medium text-primary group-hover:underline">
                Alle Kategorien
              </span>
              <ChevronDown className="h-3 w-3 text-primary ml-0.5 rotate-[-90deg]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}