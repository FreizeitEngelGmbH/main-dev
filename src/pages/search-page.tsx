import { useState, useEffect, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { Filter, MapPin, Search, Calendar, Loader2, Star, Ticket, Clock, Navigation, Zap, SlidersHorizontal, RotateCcw, Check, Baby, Dog, Accessibility, Car, Sun, Moon, CloudRain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { categoryGroups } from "@/data/categoryGroups";
import { searchExperiences, type SearchExperience } from "@/data/searchExperiences";
import { resolvePartnerRoute } from "@/lib/activity-route-resolver";

/**
 * Search results (`/search`), adapted from the source app's search-page.tsx with
 * the same layout and filters.
 *
 * STATIC: results come from `@/data/searchExperiences` instead of
 * `/api/experiences` and `/api/experiences/search`; the location, category and
 * free-text filters the server applied there are applied here in the browser.
 * Query parameters (`?query=`, `?category=`, `?location=`) are re-read whenever
 * the URL changes, so category links and Back/Forward update the results.
 */

// German names for the category slugs, so slug links match the German offer categories.
const SLUG_NAMES = new Map(
  categoryGroups.flatMap((group) => group.subcategories.map((sub) => [sub.slug, sub.name] as const)),
);

// Word stems (first 6 letters) so e.g. "Schwimmen" matches "Schwimmbad" and "Bowling & Kegeln" matches "Bowling".
function stems(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9äöüß]+/)
    .filter((word) => word.length >= 3)
    .map((word) => word.slice(0, 6));
}

function matchesTerms(experience: SearchExperience, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const haystack = [experience.category, experience.title, experience.partnerName, experience.description, experience.city]
    .join(" ")
    .toLowerCase();
  return terms.some((term) => haystack.includes(term));
}

type AttendeeType = "familie" | "partner" | "freunde" | "unternehmen" | null;

export default function SearchPage() {
  const [location, setLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [priceSlider, setPriceSlider] = useState<number[]>([0, 200]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [attendeeType, setAttendeeType] = useState<AttendeeType>(null);
  const [sortOrder, setSortOrder] = useState<string | null>("default");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [distance, setDistance] = useState<number>(50);
  const [duration, setDuration] = useState<string | null>(null);
  const [availability, setAvailability] = useState<string | null>(null);
  const [instantBooking, setInstantBooking] = useState(false);
  const [freeParking, setFreeParking] = useState(false);
  const [kidsFriendly, setKidsFriendly] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [indoorOutdoor, setIndoorOutdoor] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  
  // Parse query parameters (re-run when the URL's query string changes)
  const search = useSearch();
  useEffect(() => {
    const searchParams = new URLSearchParams(search);
    setLocation(searchParams.get("location") ?? "");
    setSelectedCategory(searchParams.get("category"));
    setSearchQuery(searchParams.get("query") ?? "");
  }, [search]);

  const isLoadingExperiences = false;
  const experiences = useMemo(() => {
    const categoryTerms = selectedCategory
      ? stems(`${selectedCategory} ${SLUG_NAMES.get(selectedCategory) ?? ""}`)
      : [];
    const queryTerms = stems(searchQuery);
    const locationText = location.trim().toLowerCase();
    const matches = searchExperiences.filter((experience) =>
      (!locationText || `${experience.city} ${experience.location}`.toLowerCase().includes(locationText)) &&
      matchesTerms(experience, categoryTerms) &&
      matchesTerms(experience, queryTerms)
    );
    switch (sortOrder) {
      case "priceAsc": return [...matches].sort((a, b) => a.price - b.price);
      case "priceDesc": return [...matches].sort((a, b) => b.price - a.price);
      case "ratingDesc": return [...matches].sort((a, b) => b.rating - a.rating);
      case "popular": return [...matches].sort((a, b) => b.reviewCount - a.reviewCount);
      default: return matches;
    }
  }, [location, selectedCategory, searchQuery, sortOrder]);
  
  // Filter experiences client-side based on all active filters
  const filteredExperiences = experiences?.filter(experience => {
    // Price filter using slider values
    const matchesPrice = experience.price >= priceSlider[0] && 
      (priceSlider[1] >= 200 ? true : experience.price <= priceSlider[1]);
    
    // Rating filter
    const matchesRating = minRating === null || (experience.rating || 0) >= minRating;
    
    // Duration filter (based on experience duration if available)
    let matchesDuration = true;
    if (duration) {
      const expDuration = (experience.duration || '').toLowerCase();
      if (expDuration) {
        switch (duration) {
          case 'short':
            matchesDuration = expDuration.includes('1') || expDuration.includes('2') || expDuration.includes('std') || expDuration.includes('stunde');
            break;
          case 'medium':
            matchesDuration = expDuration.includes('3') || expDuration.includes('4') || expDuration.includes('halb');
            break;
          case 'halfday':
            matchesDuration = expDuration.includes('halb') || expDuration.includes('5') || expDuration.includes('6');
            break;
          case 'fullday':
            matchesDuration = expDuration.includes('tag') || expDuration.includes('ganz') || expDuration.includes('8');
            break;
        }
      }
    }
    
    // Instant booking filter
    const matchesInstant = !instantBooking || experience.instantBooking === true;
    
    return matchesPrice && matchesRating && matchesDuration && matchesInstant;
  });

  // Group filtered experiences by partner
  const partnerGroups = useMemo(() => {
    if (!filteredExperiences) return [];
    
    const grouped = filteredExperiences.reduce((acc, exp) => {
      const partnerId = exp.partnerId;
      const partnerName = exp.partnerName || 'Unbekannter Partner';
      
      if (!acc[partnerId]) {
        acc[partnerId] = {
          partnerId,
          partnerName,
          city: exp.city,
          location: exp.location,
          imageUrl: exp.imageUrl,
          category: exp.category,
          rating: 0,
          reviewCount: 0,
          tickets: []
        };
      }
      
      acc[partnerId].rating = ((acc[partnerId].rating * acc[partnerId].tickets.length) + (exp.rating || 4.5)) / (acc[partnerId].tickets.length + 1);
      acc[partnerId].reviewCount += (exp.reviewCount || 0);
      
      acc[partnerId].tickets.push({
        id: exp.id,
        title: exp.title,
        price: exp.price
      });
      return acc;
    }, {} as Record<number, { partnerId: number; partnerName: string; city: string; location: string; imageUrl: string | null; category: string; rating: number; reviewCount: number; tickets: { id: number; title: string; price: number }[] }>);
    
    return Object.values(grouped);
  }, [filteredExperiences]);
  
  const handleCategoryChange = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
  };
  
  const handlePriceChange = (value: string) => {
    setPriceRange(priceRange === value ? null : value);
  };
  
  const handleRatingChange = (value: string) => {
    const rating = parseInt(value);
    setMinRating(minRating === rating ? null : rating);
  };
  
  const handleSortOrder = (value: string) => {
    setSortOrder(value);
  };
  
  const resetFilters = () => {
    setSelectedCategory(null);
    setPriceRange(null);
    setPriceSlider([0, 200]);
    setMinRating(null);
    setSortOrder("default");
    setDistance(50);
    setDuration(null);
    setAvailability(null);
    setInstantBooking(false);
    setFreeParking(false);
    setKidsFriendly(false);
    setPetFriendly(false);
    setWheelchairAccessible(false);
    setIndoorOutdoor(null);
  };

  const activeFilterCount = [
    selectedCategory,
    priceRange || (priceSlider[0] > 0 || priceSlider[1] < 200),
    minRating,
    duration,
    availability,
    instantBooking,
    freeParking,
    kidsFriendly,
    petFriendly,
    wheelchairAccessible,
    indoorOutdoor,
    distance < 50
  ].filter(Boolean).length;

  const toggleCategoryOpen = (id: string) => {
    setOpenCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-grow">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Nach Ort suchen (z.B. Dortmund, Bochum)..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {location && (
                    <button
                      onClick={() => setLocation("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 md:hidden">
                <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filter</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                      {/* Mobile filter content would go here */}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters (Desktop) - Modern Minimalist Sidebar */}
          <div className="hidden md:block w-72 flex-shrink-0">
            <div className="sticky top-6 bg-white rounded-2xl shadow-sm border border-gray-100 max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-violet-500" />
                    <span className="font-semibold text-gray-900">Filter</span>
                    {activeFilterCount > 0 && (
                      <Badge className="bg-violet-500 text-white text-xs px-2 py-0.5">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </div>
                  <button 
                    onClick={resetFilters}
                    className="text-xs text-gray-400 hover:text-violet-500 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Zurücksetzen
                  </button>
                </div>
              </div>
              
              <div className="overflow-y-auto flex-1 p-5 space-y-6">
                {/* Price Range Slider */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">Preis</span>
                    <span className="text-xs text-violet-600 font-medium bg-violet-50 px-2 py-1 rounded-full">
                      {priceSlider[0]}€ - {priceSlider[1] >= 200 ? '200+' : priceSlider[1]}€
                    </span>
                  </div>
                  <Slider
                    value={priceSlider}
                    onValueChange={setPriceSlider}
                    max={200}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>0€</span>
                    <span>100€</span>
                    <span>200€+</span>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Rating - Modern Chips */}
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-3">Bewertung</span>
                  <div className="flex flex-wrap gap-2">
                    {[5, 4, 3].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(minRating === rating ? null : rating)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                          minRating === rating 
                            ? 'bg-violet-500 text-white shadow-sm' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${minRating === rating ? 'fill-white' : 'fill-yellow-400 text-yellow-400'}`} />
                        {rating}+
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Categories - Compact Dropdown Style */}
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-2">Kategorien</span>
                  <Select value={selectedCategory || "all"} onValueChange={(value) => handleCategoryChange(value === "all" ? null : value)}>
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder="Alle Kategorien" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Kategorien</SelectItem>
                      {categoryGroups.map((group) => (
                        <SelectGroup key={group.id}>
                          <SelectLabel className="text-xs text-gray-500 font-medium">{group.name}</SelectLabel>
                          {group.subcategories.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.slug} className="text-sm">
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Duration */}
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-3">Dauer</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'short', label: '< 2 Std.', icon: <Clock className="w-3.5 h-3.5" /> },
                      { id: 'medium', label: '2-4 Std.', icon: <Clock className="w-3.5 h-3.5" /> },
                      { id: 'halfday', label: 'Halber Tag', icon: <Sun className="w-3.5 h-3.5" /> },
                      { id: 'fullday', label: 'Ganzer Tag', icon: <Calendar className="w-3.5 h-3.5" /> },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setDuration(duration === item.id ? null : item.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                          duration === item.id
                            ? 'bg-violet-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Availability */}
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-3">Verfügbarkeit</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'today', label: 'Heute' },
                      { id: 'tomorrow', label: 'Morgen' },
                      { id: 'weekend', label: 'Wochenende' },
                      { id: 'week', label: 'Diese Woche' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setAvailability(availability === item.id ? null : item.id)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                          availability === item.id
                            ? 'bg-violet-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Indoor/Outdoor */}
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-3">Ort</span>
                  <div className="flex gap-2">
                    {[
                      { id: 'indoor', label: 'Indoor', icon: <Moon className="w-3.5 h-3.5" /> },
                      { id: 'outdoor', label: 'Outdoor', icon: <Sun className="w-3.5 h-3.5" /> },
                      { id: 'both', label: 'Beides', icon: <CloudRain className="w-3.5 h-3.5" /> },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setIndoorOutdoor(indoorOutdoor === item.id ? null : item.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all ${
                          indoorOutdoor === item.id
                            ? 'bg-violet-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Features Toggle */}
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-3">Besonderheiten</span>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-gray-600">Sofort buchbar</span>
                      </div>
                      <Switch checked={instantBooking} onCheckedChange={setInstantBooking} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Kostenloser Parkplatz</span>
                      </div>
                      <Switch checked={freeParking} onCheckedChange={setFreeParking} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Baby className="w-4 h-4 text-pink-500" />
                        <span className="text-sm text-gray-600">Kinderfreundlich</span>
                      </div>
                      <Switch checked={kidsFriendly} onCheckedChange={setKidsFriendly} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Dog className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-600">Haustiere erlaubt</span>
                      </div>
                      <Switch checked={petFriendly} onCheckedChange={setPetFriendly} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Accessibility className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Barrierefrei</span>
                      </div>
                      <Switch checked={wheelchairAccessible} onCheckedChange={setWheelchairAccessible} />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Distance Slider */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-violet-500" />
                      <span className="text-sm font-medium text-gray-700">Entfernung</span>
                    </div>
                    <span className="text-xs text-violet-600 font-medium bg-violet-50 px-2 py-1 rounded-full">
                      {distance >= 50 ? '50+ km' : `${distance} km`}
                    </span>
                  </div>
                  <Slider
                    value={[distance]}
                    onValueChange={(val) => setDistance(val[0])}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>5 km</span>
                    <span>25 km</span>
                    <span>50+ km</span>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Sort */}
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-3">Sortierung</span>
                  <Select value={sortOrder || "default"} onValueChange={handleSortOrder}>
                    <SelectTrigger className="w-full bg-gray-50 border-0">
                      <SelectValue placeholder="Sortieren nach" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Empfohlen</SelectItem>
                      <SelectItem value="priceAsc">Preis aufsteigend</SelectItem>
                      <SelectItem value="priceDesc">Preis absteigend</SelectItem>
                      <SelectItem value="ratingDesc">Beste Bewertung</SelectItem>
                      <SelectItem value="newest">Neueste</SelectItem>
                      <SelectItem value="popular">Beliebteste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Footer with Apply Button */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <Button className="w-full bg-violet-500 hover:bg-violet-600 text-white">
                  <Check className="w-4 h-4 mr-2" />
                  {activeFilterCount > 0 ? `${activeFilterCount} Filter anwenden` : 'Filter anwenden'}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Search Results */}
          <div className="flex-grow">
            <div className="mb-8">
              <h2 className="text-xl font-semibold">
                {isLoadingExperiences ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span>Suche nach Partnern...</span>
                  </div>
                ) : (
                  `${partnerGroups.length} Partner gefunden ${location ? `in ${location}` : ''}`
                )}
              </h2>
            </div>
            
            {/* Partner Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partnerGroups.length > 0 ? (
                partnerGroups.map((partner) => {
                  // STATIC: partners without their own shop page resolve like the home page's partner cards.
                  const partnerLink = resolvePartnerRoute(partner.partnerId, partner.category);
                  return (
                  <Link key={partner.partnerId} href={partnerLink}>
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group h-full flex flex-col">
                      {/* Partner Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={partner.imageUrl || undefined}
                          alt={partner.partnerName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-semibold text-purple-700">
                          ab {(Math.min(...partner.tickets.map(t => t.price))).toFixed(0)}€
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <h3 className="text-white font-bold text-lg">{partner.partnerName}</h3>
                        </div>
                      </div>
                      
                      {/* Partner Info */}
                      <div className="p-4 flex-grow flex flex-col">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <MapPin className="h-4 w-4 text-purple-500" />
                          <span>{partner.city}</span>
                          <span className="mx-1">•</span>
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span>{partner.rating.toFixed(1)}</span>
                        </div>
                        
                        {/* Tickets Preview */}
                        <div className="space-y-1.5 mt-auto pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Ticket className="h-4 w-4 text-purple-500" />
                            <span>{partner.tickets.length} Angebote verfügbar</span>
                          </div>
                          {partner.tickets.slice(0, 2).map((ticket) => (
                            <div key={ticket.id} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 truncate flex-1 mr-2">{ticket.title}</span>
                              <span className="font-semibold text-purple-600 whitespace-nowrap">{(ticket.price).toFixed(2)}€</span>
                            </div>
                          ))}
                          {partner.tickets.length > 2 && (
                            <p className="text-xs text-purple-600 font-medium pt-1">
                              + {partner.tickets.length - 2} weitere Angebote →
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                  );
                })
              ) : (
                isLoadingExperiences ? (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">Keine Partner gefunden.</p>
                    <Button variant="outline" onClick={resetFilters} className="mt-4">
                      Filter zurücksetzen
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}