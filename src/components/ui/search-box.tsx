import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Users, Star, Filter } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

interface SearchBoxProps {
  variant?: "hero" | "compact";
  initialLocation?: string;
  initialAttendeeType?: string;
  initialCategory?: string;
  className?: string;
  showAdvancedFilters?: boolean;
}

export function SearchBox({ 
  variant = "hero", 
  initialLocation = "", 
  initialAttendeeType = "",
  initialCategory = "",
  className,
  showAdvancedFilters = false
}: SearchBoxProps) {
  const [location, setLocation] = useState(initialLocation);
  const [attendeeType, setAttendeeType] = useState(initialAttendeeType);
  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(showAdvancedFilters);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [minRating, setMinRating] = useState(0);
  const [, navigate] = useLocation();
  
  // Fetch categories for the activity dropdown
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Attendee types
  const attendeeTypes = [
    { value: "familie", label: "Familie" },
    { value: "partner", label: "Partner" },
    { value: "freunde", label: "Freunde" },
    { value: "unternehmen", label: "Unternehmen" }
  ];
  
  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (location.trim()) {
      params.append("location", location.trim());
    }
    
    if (searchQuery.trim()) {
      params.append("query", searchQuery.trim());
    }
    
    if (attendeeType) {
      params.append("with", attendeeType);
    }
    
    if (priceRange[0] > 0 || priceRange[1] < 100) {
      params.append("priceRange", `${priceRange[0]}-${priceRange[1]}`);
    }
    
    if (minRating > 0) {
      params.append("minRating", minRating.toString());
    }
    
    const queryString = params.toString();
    navigate(`/search${queryString ? `?${queryString}` : ""}`);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  
  if (variant === "hero") {
    return (
      <div className={`bg-white p-6 rounded-xl shadow-lg ${className}`}>
        <div className="text-left mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Deine Freizeit beginnt hier</h2>
          <p className="text-gray-600">Lass uns dein perfektes Erlebnis finden</p>
        </div>
        
        <div className="space-y-4">
          {/* Smart Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 py-3 h-12 text-base"
              placeholder="Suche nach Aktivitäten: Kino, Bowling, Schwimmen..."
            />
          </div>

          {/* Location Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 py-3 h-12 text-base"
              placeholder="Stadt eingeben: Dortmund, Bochum..."
            />
          </div>
          
          {/* Mit Wem Filter */}
          <div>
            <Select value={attendeeType} onValueChange={setAttendeeType}>
              <SelectTrigger className="h-12">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="Mit wem?" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {attendeeTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Suchen Button */}
          <Button 
            onClick={handleSearch}
            className="w-full h-12 px-6 text-base"
          >
            <Search className="h-5 w-5 mr-2" />
            Erlebnisse suchen
          </Button>
          
          {/* Beliebte Orte */}
          <div className="mt-4 text-center">
            <span className="text-gray-600 text-sm mr-3">Beliebte Orte:</span>
            <button 
              onClick={() => setLocation("Dortmund")}
              className="text-[#4dd0e1] hover:text-[#26c6da] text-sm font-medium mr-3 transition-colors"
            >
              Dortmund
            </button>
            <button 
              onClick={() => setLocation("Bochum")}
              className="text-[#4dd0e1] hover:text-[#26c6da] text-sm font-medium transition-colors"
            >
              Bochum
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Compact variant for search page header
  return (
    <div className={`flex items-center flex-wrap gap-2 ${className}`}>
      <div className="relative flex-grow min-w-[200px]">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MapPin className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-9"
          placeholder="PLZ oder Stadt eingeben..."
        />
      </div>
      
      <div className="relative min-w-[200px]">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-9"
          placeholder="Suche nach Aktivitäten..."
        />
      </div>
      
      <Button onClick={handleSearch}>
        <Search className="h-4 w-4 mr-2" />
        Suchen
      </Button>
    </div>
  );
}