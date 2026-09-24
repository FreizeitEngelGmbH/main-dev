import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Filter, MapPin, Search, Flame, ThumbsUp, Users, Calendar, ArrowDown, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SearchBox } from "@/components/ui/search-box";
import { ExperienceCard } from "@/components/ui/experience-card";
import { Experience, Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categoryGroups } from "@/components/layout/categories-navbar-grouped";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";

// Typen für die Begleitpersonen
type AttendeeType = "familie" | "partner" | "freunde" | "unternehmen" | null;

export default function SearchPage() {
  const [, params] = useLocation();
  const { toast } = useToast();
  const [location, setLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [attendeeType, setAttendeeType] = useState<AttendeeType>(null);
  // Datums-Filter wurde entfernt
  const [sortOrder, setSortOrder] = useState<string | null>("default");
  
  // Parse query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const locationParam = searchParams.get("location");
    const categoryParam = searchParams.get("category");
    
    if (locationParam) {
      setLocation(locationParam);
    }
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [params]);
  
  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch trending experiences with all active filters
  const { data: trendingExperiences } = useQuery<Experience[]>({
    queryKey: ["/api/experiences", { trending: true, location: location || undefined, category: selectedCategory || undefined }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('trending', 'true');
      if (location) params.append('location', location);
      if (selectedCategory) params.append('category', selectedCategory);
      return fetch(`/api/experiences?${params.toString()}`).then(res => res.json());
    },
  });

  // Fetch recommended experiences with all active filters
  const { data: recommendedExperiences } = useQuery<Experience[]>({
    queryKey: ["/api/experiences", { recommended: true, location: location || undefined, category: selectedCategory || undefined }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('recommended', 'true');
      if (location) params.append('location', location);
      if (selectedCategory) params.append('category', selectedCategory);
      return fetch(`/api/experiences?${params.toString()}`).then(res => res.json());
    },
  });
  
  // Construct query string based on filters
  const getQueryString = () => {
    const filters: string[] = [];
    
    if (location) {
      filters.push(`location=${encodeURIComponent(location)}`);
    }
    
    if (selectedCategory) {
      filters.push(`category=${encodeURIComponent(selectedCategory)}`);
    }
    
    // Neue Filter für die API
    if (priceRange) {
      // Preisspanne in min/max Werte umwandeln
      switch (priceRange) {
        case "under50":
          filters.push(`maxPrice=50`);
          break;
        case "50to100":
          filters.push(`minPrice=50&maxPrice=100`);
          break;
        case "100to200":
          filters.push(`minPrice=100&maxPrice=200`);
          break;
        case "over200":
          filters.push(`minPrice=200`);
          break;
      }
    }
    
    if (minRating !== null) {
      filters.push(`minRating=${minRating}`);
    }
    
    if (sortOrder) {
      filters.push(`sortBy=${sortOrder}`);
    }
    
    return filters.length > 0 ? `?${filters.join("&")}` : "";
  };
  
  // Fetch experiences based on filters
  const { data: experiences, isLoading: isLoadingExperiences } = useQuery<Experience[]>({
    queryKey: ["/api/experiences", { 
      location: location || undefined,
      category: selectedCategory || undefined,
      priceRange: priceRange || undefined,
      minRating: minRating || undefined,
      sortOrder: sortOrder || undefined
    }],
    queryFn: () => fetch(`/api/experiences${getQueryString()}`).then(res => res.json()),
  });
  
  // Filter experiences client-side based on price and rating
  const filteredExperiences = experiences?.filter(experience => {
    let matchesPrice = true;
    let matchesRating = true;
    
    if (priceRange) {
      switch (priceRange) {
        case "under50":
          matchesPrice = experience.price < 50;
          break;
        case "50to100":
          matchesPrice = experience.price >= 50 && experience.price <= 100;
          break;
        case "100to200":
          matchesPrice = experience.price > 100 && experience.price <= 200;
          break;
        case "over200":
          matchesPrice = experience.price > 200;
          break;
      }
    }
    
    if (minRating !== null) {
      matchesRating = (experience.rating || 0) >= minRating;
    }
    
    return matchesPrice && matchesRating;
  });
  
  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(prev => prev === categorySlug ? null : categorySlug);
  };
  
  const handlePriceChange = (value: string) => {
    setPriceRange(prev => prev === value ? null : value);
  };
  
  const handleRatingChange = (value: string) => {
    setMinRating(value ? parseInt(value) : null);
  };
  
  const handleAttendeeChange = (value: string) => {
    setAttendeeType(value as AttendeeType);
  };

  const handleSortOrder = (value: string) => {
    setSortOrder(value);
  };
  
  const resetFilters = () => {
    setSelectedCategory(null);
    setPriceRange(null);
    setMinRating(null);
    setAttendeeType(null);
    setSortOrder("default");
    toast({
      title: "Filter zurückgesetzt",
      description: "Alle Filter wurden zurückgesetzt."
    });
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
                      <MobileFilters 
                        selectedCategory={selectedCategory}
                        onCategoryChange={handleCategoryChange}
                        priceRange={priceRange}
                        onPriceChange={handlePriceChange}
                        minRating={minRating}
                        onRatingChange={handleRatingChange}
                        sortOrder={sortOrder}
                        onSortOrderChange={handleSortOrder}
                        onReset={resetFilters}
                        onApply={() => setShowMobileFilters(false)}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters (Desktop) */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <Card className="sticky top-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-center">
                  Filter
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters}
                    className="text-sm font-normal text-gray-500"
                  >
                    Zurücksetzen
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categories - Grouped */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Kategorien</h4>
                  <div className="space-y-1">
                    {categoryGroups.map((group) => (
                      <Collapsible key={group.id} className="border border-gray-100 rounded-md overflow-hidden">
                        <CollapsibleTrigger className="flex w-full items-center justify-between p-2 hover:bg-gray-50 text-left">
                          <div className="flex items-center">
                            <div className={`${group.color.bgColor} ${group.color.iconColor} p-1 rounded-full mr-2`}>
                              {group.icon}
                            </div>
                            <span className="text-xs font-medium">{group.name}</span>
                          </div>
                          <ChevronDown className="h-4 w-4 text-gray-500 shrink-0 transition-transform duration-200" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="border-t border-gray-100 bg-gray-50/50">
                          <div className="p-2 space-y-1">
                            {group.subcategories.map((subcategory) => (
                              <div key={subcategory.id} className="flex items-center space-x-2 py-1 pl-2">
                                <Checkbox 
                                  id={`category-${subcategory.slug}`} 
                                  checked={selectedCategory === subcategory.slug}
                                  onCheckedChange={() => handleCategoryChange(subcategory.slug)}
                                  className="h-3.5 w-3.5"
                                />
                                <Label 
                                  htmlFor={`category-${subcategory.slug}`}
                                  className="text-xs font-normal cursor-pointer flex items-center"
                                >
                                  <div className={group.color.iconColor + " mr-1.5"}>
                                    {subcategory.icon}
                                  </div>
                                  {subcategory.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Price Range */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Preis</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="price-under50" 
                        checked={priceRange === "under50"}
                        onCheckedChange={() => handlePriceChange("under50")}
                      />
                      <Label 
                        htmlFor="price-under50"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Unter €50
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="price-50to100" 
                        checked={priceRange === "50to100"}
                        onCheckedChange={() => handlePriceChange("50to100")}
                      />
                      <Label 
                        htmlFor="price-50to100"
                        className="text-sm font-normal cursor-pointer"
                      >
                        €50 - €100
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="price-100to200" 
                        checked={priceRange === "100to200"}
                        onCheckedChange={() => handlePriceChange("100to200")}
                      />
                      <Label 
                        htmlFor="price-100to200"
                        className="text-sm font-normal cursor-pointer"
                      >
                        €100 - €200
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="price-over200" 
                        checked={priceRange === "over200"}
                        onCheckedChange={() => handlePriceChange("over200")}
                      />
                      <Label 
                        htmlFor="price-over200"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Über €200
                      </Label>
                    </div>
                  </div>
                </div>
                
                <Separator />

                {/* Sortierung */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Sortierung</h4>
                  <Select value={sortOrder || "default"} onValueChange={handleSortOrder}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sortieren nach" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Relevanz</SelectItem>
                      <SelectItem value="price-asc">Preis: aufsteigend</SelectItem>
                      <SelectItem value="price-desc">Preis: absteigend</SelectItem>
                      <SelectItem value="rating-desc">Beste Bewertung</SelectItem>
                      <SelectItem value="newest">Neueste zuerst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                {/* Rating */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Bewertung</h4>
                  <RadioGroup 
                    value={minRating?.toString() || ""} 
                    onValueChange={handleRatingChange}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="5" id="r-5" />
                      <Label htmlFor="r-5" className="text-sm font-normal cursor-pointer flex items-center">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1">5</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="4" id="r-4" />
                      <Label htmlFor="r-4" className="text-sm font-normal cursor-pointer flex items-center">
                        <div className="flex">
                          {[...Array(4)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <span className="ml-1">4+</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3" id="r-3" />
                      <Label htmlFor="r-3" className="text-sm font-normal cursor-pointer flex items-center">
                        <div className="flex">
                          {[...Array(3)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          {[...Array(2)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1">3+</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Separator />
                
                {/* Mit Wem */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Mit Wem</h4>
                  <div className="space-y-2">
                    <Select value={attendeeType || "all"} onValueChange={handleAttendeeChange}>
                      <SelectTrigger className="w-full">
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-gray-400" />
                          <SelectValue placeholder="Mit wem?" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle</SelectItem>
                        <SelectItem value="familie">Familie</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="freunde">Freunde</SelectItem>
                        <SelectItem value="unternehmen">Unternehmen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                {/* Sortierung */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Sortierung</h4>
                  <Select value={sortOrder || "recommended"} onValueChange={handleSortOrder}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center">
                        <ArrowDown className="mr-2 h-4 w-4 text-gray-400" />
                        <SelectValue placeholder="Sortieren nach" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Empfohlen</SelectItem>
                      <SelectItem value="priceAsc">Preis: Niedrig zu Hoch</SelectItem>
                      <SelectItem value="priceDesc">Preis: Hoch zu Niedrig</SelectItem>
                      <SelectItem value="ratingDesc">Höchste Bewertung</SelectItem>
                      <SelectItem value="newest">Neueste zuerst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Search Results */}
          <div className="flex-grow">
            <div className="mb-8">
              <h2 className="text-xl font-semibold">
                {isLoadingExperiences ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span>Suche nach Erlebnissen...</span>
                  </div>
                ) : (
                  `${filteredExperiences?.length || 0} Erlebnisse gefunden ${location ? `in ${location}` : ''}`
                )}
              </h2>
            </div>
            
            {/* Trending Experiences Section - Authentic Data */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Flame className="h-5 w-5 text-secondary mr-2" />
                <h3 className="text-lg font-semibold">Im Trend</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {trendingExperiences?.slice(0, 3).map((experience) => {
                  const category = categories?.find(cat => cat.id === experience.categoryId);
                  return (
                    <ExperienceCard
                      key={experience.id}
                      id={experience.id}
                      title={experience.title}
                      shortDescription={experience.shortDescription}
                      location={experience.location}
                      city={experience.city}
                      price={experience.price}
                      imageUrl={experience.imageUrl || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400&q=80"}
                      rating={experience.rating || 0}
                      reviewCount={experience.reviewCount || 0}
                      featured={experience.featured || false}
                      trending={true}
                    />
                  );
                })}
              </div>
            </div>
            
            {/* Recommended Experiences Section - Authentic Data */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <ThumbsUp className="h-5 w-5 text-primary mr-2" />
                <h3 className="text-lg font-semibold">Empfehlungen</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recommendedExperiences?.slice(0, 3).map((experience) => {
                  const category = categories?.find(cat => cat.id === experience.categoryId);
                  return (
                    <ExperienceCard
                      key={experience.id}
                      id={experience.id}
                      title={experience.title}
                      shortDescription={experience.shortDescription}
                      location={experience.location}
                      city={experience.city}
                      price={experience.price}
                      imageUrl={experience.imageUrl || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400&q=80"}
                      rating={experience.rating || 0}
                      reviewCount={experience.reviewCount || 0}
                      featured={experience.featured || false}
                    />
                  );
                })}
              </div>
            </div>
            

            
            {isLoadingExperiences ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredExperiences && filteredExperiences.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredExperiences.map((experience) => {
                  const category = categories?.find(c => c.id === experience.categoryId);
                  return (
                    <ExperienceCard
                      key={experience.id}
                      id={experience.id}
                      title={experience.title}
                      shortDescription={experience.shortDescription}
                      location={experience.location}
                      city={experience.city}
                      price={experience.price}
                      imageUrl={experience.imageUrl || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400&q=80"}
                      rating={experience.rating || 0}
                      reviewCount={experience.reviewCount || 0}
                      featured={experience.featured || false}
                      trending={experience.trending || false}
                      recommended={experience.recommended || false}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Keine Erlebnisse gefunden</h3>
                <p className="text-gray-500 mb-6">
                  Leider konnten wir keine Erlebnisse mit den gewählten Filterkriterien finden.
                </p>
                <Button onClick={resetFilters}>Filter zurücksetzen</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile Filters Component
function MobileFilters({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  minRating,
  onRatingChange,
  sortOrder,
  onSortOrderChange,
  onReset,
  onApply
}: {
  selectedCategory: string | null;
  onCategoryChange: (category: string) => void;
  priceRange: string | null;
  onPriceChange: (price: string) => void;
  minRating: number | null;
  onRatingChange: (rating: string) => void;
  sortOrder: string | null;
  onSortOrderChange: (order: string) => void;
  onReset: () => void;
  onApply: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Categories - Grouped (Mobile) */}
      <div>
        <h4 className="font-medium text-sm mb-3">Kategorien</h4>
        <div className="space-y-1.5">
          {categoryGroups.map((group) => (
            <Collapsible key={group.id} className="border border-gray-100 rounded-md overflow-hidden">
              <CollapsibleTrigger className="flex w-full items-center justify-between p-2 hover:bg-gray-50 text-left">
                <div className="flex items-center">
                  <div className={`${group.color.bgColor} ${group.color.iconColor} p-1 rounded-full mr-2`}>
                    {group.icon}
                  </div>
                  <span className="text-xs font-medium">{group.name}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 shrink-0 transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t border-gray-100 bg-gray-50/50">
                <div className="p-2 space-y-1">
                  {group.subcategories.map((subcategory) => (
                    <div key={subcategory.id} className="flex items-center space-x-2 py-1 pl-2">
                      <Checkbox 
                        id={`mobile-category-${subcategory.slug}`} 
                        checked={selectedCategory === subcategory.slug}
                        onCheckedChange={() => onCategoryChange(subcategory.slug)}
                        className="h-3.5 w-3.5"
                      />
                      <Label 
                        htmlFor={`mobile-category-${subcategory.slug}`}
                        className="text-xs font-normal cursor-pointer flex items-center"
                      >
                        <div className={group.color.iconColor + " mr-1.5"}>
                          {subcategory.icon}
                        </div>
                        {subcategory.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
      
      <Separator />
      
      {/* Price Range */}
      <div>
        <h4 className="font-medium text-sm mb-3">Preis</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="mobile-price-under50" 
              checked={priceRange === "under50"}
              onCheckedChange={() => onPriceChange("under50")}
            />
            <Label 
              htmlFor="mobile-price-under50"
              className="text-sm font-normal cursor-pointer"
            >
              Unter €50
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="mobile-price-50to100" 
              checked={priceRange === "50to100"}
              onCheckedChange={() => onPriceChange("50to100")}
            />
            <Label 
              htmlFor="mobile-price-50to100"
              className="text-sm font-normal cursor-pointer"
            >
              €50 - €100
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="mobile-price-100to200" 
              checked={priceRange === "100to200"}
              onCheckedChange={() => onPriceChange("100to200")}
            />
            <Label 
              htmlFor="mobile-price-100to200"
              className="text-sm font-normal cursor-pointer"
            >
              €100 - €200
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="mobile-price-over200" 
              checked={priceRange === "over200"}
              onCheckedChange={() => onPriceChange("over200")}
            />
            <Label 
              htmlFor="mobile-price-over200"
              className="text-sm font-normal cursor-pointer"
            >
              Über €200
            </Label>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Rating */}
      <div>
        <h4 className="font-medium text-sm mb-3">Bewertung</h4>
        <RadioGroup 
          value={minRating?.toString() || ""} 
          onValueChange={onRatingChange}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="5" id="mobile-r-5" />
            <Label htmlFor="mobile-r-5" className="text-sm font-normal cursor-pointer flex items-center">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-1">5</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="4" id="mobile-r-4" />
            <Label htmlFor="mobile-r-4" className="text-sm font-normal cursor-pointer flex items-center">
              <div className="flex">
                {[...Array(4)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="ml-1">4+</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="3" id="mobile-r-3" />
            <Label htmlFor="mobile-r-3" className="text-sm font-normal cursor-pointer flex items-center">
              <div className="flex">
                {[...Array(3)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                {[...Array(2)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-1">3+</span>
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <Separator />
      
      {/* Sortierung */}
      <div>
        <h4 className="font-medium text-sm mb-3">Sortierung</h4>
        <Select value={sortOrder || "default"} onValueChange={onSortOrderChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sortieren nach" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Relevanz</SelectItem>
            <SelectItem value="price-asc">Preis: aufsteigend</SelectItem>
            <SelectItem value="price-desc">Preis: absteigend</SelectItem>
            <SelectItem value="rating-desc">Beste Bewertung</SelectItem>
            <SelectItem value="newest">Neueste zuerst</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-3 mt-8">
        <Button 
          onClick={onApply}
          className="w-full"
        >
          Filter anwenden
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onReset}
          className="w-full"
        >
          Alle zurücksetzen
        </Button>
      </div>
    </div>
  );
}
