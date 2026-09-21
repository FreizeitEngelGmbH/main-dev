import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowRight, Compass, Send, Loader2, MapPin, Ticket, Clock, Star, Search, Calendar, ChevronDown, ChevronRight, Heart, Navigation, Share2, Waves, Film, Target, Mountain, Zap, Gamepad2, TreePine, Paintbrush, Bike, Sparkles, Ship, Baby, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/ui/search-box";
import { ExperienceCard } from "@/components/ui/experience-card";
import GroupActivitiesSection from "@/components/GroupActivitiesSection";
import EventGroupsSection from "@/components/EventGroupsSection";
import BundlesPromoSection from "@/components/BundlesPromoSection";
import { Experience } from "@shared/schema";
import { apiRequest } from "@/partner-demo/queryClient";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { resolvePartnerRoute, resolveCategoryRoute, DEFAULT_ACTIVITY_DETAIL_ROUTE } from "@/lib/activity-route-resolver";

import heroBackground from "@assets/image_1767891623582.png";
// Real per-category stock photos restored from the original source
// project's attached_assets/stock_images/ (previously substituted with
// mismatched generic images - e.g. bowling/escape used a zoo-animal photo).
import swimmingImg from "@assets/stock_images/swimming_pool_indoor_03fbcff5.jpg";
import bowlingImg from "@assets/stock_images/bowling_alley_lanes__8651d53f.jpg";
import trampolineImg from "@assets/stock_images/trampoline_park_jump_58ef9cec.jpg";
import climbingImg from "@assets/stock_images/climbing_wall_indoor_76f05e36.jpg";
import wellnessImg from "@assets/stock_images/spa_wellness_relaxat_fa0316de.jpg";
import familyImg from "@assets/stock_images/family_outdoor_trip__f5998529.jpg";
import zooImg from "@assets/stock_images/tierpark_zoo.jpg";
import lasertag from "@assets/stock_images/laser_tag_arena_game_5fd26cf4.jpg";
import escapeImg from "@assets/stock_images/escape_room_mystery__428a25a2.jpg";
import cinemaImg from "@assets/stock_images/cinema_movie_theater_9f412305.jpg";
import minigolfImg from "@assets/stock_images/minigolf_adventure_g_93cab347.jpg";
import paintballImg from "@assets/stock_images/paintball_action_pla_8ec3b545.jpg";
import soccerImg from "@assets/stock_images/indoor_soccer_footba_e81faf88.jpg";
import waterslideImg from "@assets/stock_images/swimming_pool_indoor_03fbcff5.jpg";
import kidsPartyImg from "@assets/stock_images/hapik_birthday_kids.jpg";
import boulderlImg from "@assets/stock_images/bouldern_1.jpg";

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  experiences?: {
    id: number;
    title: string;
    price: string;
    imageUrl: string;
    shortDescription: string;
  }[];
}

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [activityFilter, setActivityFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [showAllCities, setShowAllCities] = useState(false);

  const partnerCategoryStats: { name: string; slug: string; count: number; icon: LucideIcon; bgColor: string; iconColor: string }[] = useMemo(() => [
    { name: "Schwimmbad", slug: "schwimmen", count: 4, icon: Waves, bgColor: "bg-blue-100", iconColor: "text-blue-600" },
    { name: "Lasertag", slug: "lasertag", count: 3, icon: Zap, bgColor: "bg-red-100", iconColor: "text-red-600" },
    { name: "Trampolinhalle", slug: "trampolin", count: 2, icon: Sparkles, bgColor: "bg-yellow-100", iconColor: "text-yellow-600" },
    { name: "Minigolf", slug: "minigolf", count: 2, icon: Target, bgColor: "bg-green-100", iconColor: "text-green-600" },
    { name: "Bowling", slug: "bowling", count: 2, icon: Ticket, bgColor: "bg-orange-100", iconColor: "text-orange-600" },
    { name: "Kultur & Events", slug: "kultur", count: 2, icon: Star, bgColor: "bg-pink-100", iconColor: "text-pink-600" },
    { name: "Kino", slug: "kino", count: 1, icon: Film, bgColor: "bg-purple-100", iconColor: "text-purple-600" },
    { name: "Kletterpark", slug: "klettern", count: 1, icon: Mountain, bgColor: "bg-emerald-100", iconColor: "text-emerald-600" },
    { name: "Escape Room", slug: "escape-room", count: 1, icon: Gamepad2, bgColor: "bg-indigo-100", iconColor: "text-indigo-600" },
    { name: "Indoorspielplatz", slug: "indoorspielplatz", count: 1, icon: Baby, bgColor: "bg-amber-100", iconColor: "text-amber-600" },
    { name: "Zoo & Tierpark", slug: "zoo", count: 1, icon: TreePine, bgColor: "bg-lime-100", iconColor: "text-lime-600" },
    { name: "Wellness & Spa", slug: "wellness", count: 1, icon: Heart, bgColor: "bg-rose-100", iconColor: "text-rose-600" },
    { name: "Bootstouren", slug: "bootstouren", count: 1, icon: Ship, bgColor: "bg-cyan-100", iconColor: "text-cyan-600" },
    { name: "Tennis", slug: "tennis", count: 1, icon: Bike, bgColor: "bg-teal-100", iconColor: "text-teal-600" },
    { name: "Paintball", slug: "paintball", count: 1, icon: Target, bgColor: "bg-slate-100", iconColor: "text-slate-600" },
  ], []);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: "Hey! Was hast du heute vor? Ich helfe dir, das perfekte Erlebnis zu finden! 🎯"
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fetch featured experiences
  const { data: featuredExperiences, isLoading: isLoadingExperiences } = useQuery<Experience[]>({
    queryKey: ["/api/experiences?featured=true"],
  });

  // Fetch all partners for detailed info
  const { data: allPartners } = useQuery<any[]>({
    queryKey: ["/api/partners"],
  });

  // Fetch all available cities
  const { data: cities } = useQuery<string[]>({
    queryKey: ["/api/cities"],
  });

  // Category fallback images using local assets
  const getCategoryFallbackImage = (category: string): string => {
    const fallbacks: Record<string, string> = {
      'Schwimmbad': swimmingImg,
      'Schwimmen': swimmingImg,
      'Zoo': zooImg,
      'Zoo & Tierpark': zooImg,
      'Lasertag': lasertag,
      'Paintball': paintballImg,
      'Minigolf': minigolfImg,
      'Kletterhalle': boulderlImg,
      'Klettern': climbingImg,
      'Theater': cinemaImg,
      'Billard': bowlingImg,
      'Billard & Dart': bowlingImg,
      'Bowling': bowlingImg,
      'Kino': cinemaImg,
      'Escape Rooms': escapeImg,
      'Trampolinhalle': trampolineImg,
      'Wellness': wellnessImg,
      'Soccer': soccerImg,
      'Kinderpark': kidsPartyImg,
    };
    return fallbacks[category] || familyImg;
  };

  const labelOptions = ["Geheimtipp", "Top bewertet", "Beliebtes Geschenk", "Bestseller", "Neu bei uns"] as const;

  // Group experiences by partner and merge partner details
  const partnerGroups = useMemo(() => {
    if (!featuredExperiences) return [];
    
    const partnerLookup = (allPartners || []).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<number, any>);
    
    const grouped = featuredExperiences.reduce((acc, exp) => {
      const partnerId = (exp as any).partnerId;
      const partnerName = (exp as any).partnerName || 'Unbekannter Partner';
      const partnerDetails = partnerLookup[partnerId] || {};
      
      if (!acc[partnerId]) {
        const seed = partnerId * 7;
        const distance = Math.round((3 + (seed % 45)) * 10) / 10;
        const labelIdx = seed % labelOptions.length;
        acc[partnerId] = {
          partnerId,
          partnerName,
          city: exp.city,
          imageUrl: exp.imageUrl || getCategoryFallbackImage(partnerDetails.category || ''),
          description: partnerDetails.description || '',
          address: partnerDetails.address || '',
          location: partnerDetails.location || '',
          category: partnerDetails.category || '',
          logoUrl: partnerDetails.logoUrl || null,
          logoBgColor: partnerDetails.logoBgColor || 'black',
          rating: 0,
          reviewCount: 0,
          distance,
          label: labelOptions[labelIdx],
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
    }, {} as Record<number, { partnerId: number; partnerName: string; city: string; imageUrl: string | null; description: string; address: string; location: string; category: string; logoUrl: string | null; logoBgColor: string; rating: number; reviewCount: number; distance: number; label: string; tickets: { id: number; title: string; price: number }[] }>);
    
    return Object.values(grouped);
  }, [featuredExperiences, allPartners]);

  // Get one partner per city for the "Unsere Partner" section
  const onePartnerPerCity = useMemo(() => {
    const seenCities = new Set<string>();
    return partnerGroups.filter(partner => {
      if (seenCities.has(partner.city)) {
        return false;
      }
      seenCities.add(partner.city);
      return true;
    });
  }, [partnerGroups]);

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/chat', { message });
      return response.json();
    },
    onSuccess: (data) => {
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        content: data.message,
        experiences: data.experiences
      };
      setMessages(prev => [...prev, botMessage]);
    },
    onError: () => {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'bot',
        content: "Entschuldigung, da ist etwas schief gelaufen. Bitte versuche es erneut."
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  // Scroll to bottom when new messages arrive (only within chat container)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || chatMutation.isPending) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: searchQuery.trim()
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to API
    chatMutation.mutate(searchQuery.trim());
    setSearchQuery("");
  };

  const handleQuickAction = (query: string) => {
    if (chatMutation.isPending) return;
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query
    };
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(query);
  };
  
  const highlightsOfWeek = [
    { name: "Schwimmbäder", image: swimmingImg, price: 15, link: "/swimming-pools" },
    { name: "Bowling", image: bowlingImg, price: 18, link: "/bowling" },
    { name: "Lasertag", image: lasertag, price: 20, link: "/search?category=lasertag" },
    { name: "Escape Rooms", image: escapeImg, price: 25, link: "/search?category=escape" },
    { name: "Trampolinhallen", image: trampolineImg, price: 18, link: "/search?category=trampolin" },
    { name: "Kino", image: cinemaImg, price: 12, link: "/search?category=kino" },
  ];
  
  const recommendations = [
    { name: "Wellness & Spa", image: wellnessImg, price: 25, link: "/search?category=wellness" },
    { name: "Minigolf", image: minigolfImg, price: 8, link: "/search?category=minigolf" },
    { name: "Kletterparks", image: climbingImg, price: 18, link: "/search?category=klettern" },
    { name: "Paintball", image: paintballImg, price: 35, link: "/search?category=paintball" },
    { name: "Fußball Soccer", image: soccerImg, price: 15, link: "/search?category=soccer" },
    { name: "Familienausflüge", image: familyImg, price: 25, link: "/search?category=familie" },
  ];
  
  const trending = [
    { name: "Erlebnisbäder", image: waterslideImg, price: 18, link: "/search?category=schwimmbad" },
    { name: "Kindergeburtstage", image: kidsPartyImg, price: 15, link: "/search?category=kinder" },
    { name: "Bouldern", image: boulderlImg, price: 15, link: "/search?category=klettern" },
    { name: "Bowling Partys", image: bowlingImg, price: 20, link: "/bowling" },
    { name: "Lasertag Events", image: lasertag, price: 22, link: "/search?category=lasertag" },
    { name: "Escape Abenteuer", image: escapeImg, price: 28, link: "/search?category=escape" },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      'Schwimmbad': { bg: 'bg-blue-600', text: 'text-white' },
      'Schwimmen': { bg: 'bg-blue-600', text: 'text-white' },
      'Erlebnisbad': { bg: 'bg-blue-500', text: 'text-white' },
      'Freibad': { bg: 'bg-sky-500', text: 'text-white' },
      'Zoo': { bg: 'bg-green-700', text: 'text-white' },
      'Zoo & Tierpark': { bg: 'bg-green-700', text: 'text-white' },
      'Kino': { bg: 'bg-purple-700', text: 'text-white' },
      'Bowling': { bg: 'bg-red-600', text: 'text-white' },
      'Lasertag': { bg: 'bg-red-500', text: 'text-white' },
      'Minigolf': { bg: 'bg-emerald-600', text: 'text-white' },
      'Escape Rooms': { bg: 'bg-gray-800', text: 'text-white' },
      'Escape Room': { bg: 'bg-gray-800', text: 'text-white' },
      'Klettern': { bg: 'bg-orange-600', text: 'text-white' },
      'Kletterhalle': { bg: 'bg-orange-600', text: 'text-white' },
      'Kletterpark': { bg: 'bg-orange-500', text: 'text-white' },
      'Wellness': { bg: 'bg-teal-600', text: 'text-white' },
      'Day Spa': { bg: 'bg-teal-500', text: 'text-white' },
      'Paintball': { bg: 'bg-amber-700', text: 'text-white' },
      'Soccer': { bg: 'bg-green-600', text: 'text-white' },
      'Theater': { bg: 'bg-rose-700', text: 'text-white' },
      'Museum': { bg: 'bg-indigo-700', text: 'text-white' },
      'Freizeitpark': { bg: 'bg-pink-600', text: 'text-white' },
      'Eissporthalle': { bg: 'bg-cyan-600', text: 'text-white' },
      'Indoorspielplatz': { bg: 'bg-yellow-500', text: 'text-gray-900' },
      'Kinderpark': { bg: 'bg-yellow-500', text: 'text-gray-900' },
      'Kartbahn': { bg: 'bg-gray-700', text: 'text-white' },
      'Go Kart': { bg: 'bg-gray-700', text: 'text-white' },
      'Padel Tennis': { bg: 'bg-lime-600', text: 'text-white' },
      'Billard': { bg: 'bg-emerald-800', text: 'text-white' },
      'Golf': { bg: 'bg-green-800', text: 'text-white' },
      'SKI': { bg: 'bg-sky-700', text: 'text-white' },
      'Reiten': { bg: 'bg-amber-800', text: 'text-white' },
      'Games': { bg: 'bg-violet-600', text: 'text-white' },
    };
    return colors[category] || { bg: 'bg-purple-600', text: 'text-white' };
  };

  const getInitials = (name: string) => {
    return name.split(/[\s\-&]+/).filter(w => w.length > 0).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  };

  const isPlaceholderLogo = (url: string | null) => {
    if (!url) return true;
    return url.includes('placeholder_logo');
  };

  const getLabelStyle = (label: string) => {
    switch (label) {
      case "Geheimtipp": return "bg-amber-500 text-white";
      case "Top bewertet": return "bg-emerald-600 text-white";
      case "Beliebtes Geschenk": return "bg-purple-600 text-white";
      case "Bestseller": return "bg-rose-600 text-white";
      case "Neu bei uns": return "bg-sky-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.3;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : i === fullStars && hasHalf
                ? "fill-yellow-400/50 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  // Every card below is grouped from demoFeaturedExperiences (partnerId 601+,
  // from demoOffers), which has no matching entry in demoShopPartners (the
  // data backing the real /partners/:id Shop page, id 501+). resolvePartnerRoute
  // sends each card to the closest category match among the working shop
  // pages (or the Bowling shop as a last resort) instead of a dead link.
  const renderPartnerCard = (partner: typeof partnerGroups[0], showLabel = true) => (
    <Link key={partner.partnerId} href={resolvePartnerRoute(partner.partnerId, partner.category)}>
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group h-full flex flex-col">
        <div className="relative h-24 sm:h-36 overflow-hidden">
          {partner.imageUrl ? (
            <img 
              src={partner.imageUrl} 
              alt={partner.partnerName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white text-2xl sm:text-4xl font-bold">{partner.partnerName.charAt(0)}</span>
            </div>
          )}
          {showLabel && (
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1">
              <span className={`inline-flex items-center gap-0.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold shadow-sm ${getLabelStyle(partner.label)}`}>
                {partner.label === "Beliebtes Geschenk" && "🎁 "}
                {partner.label === "Geheimtipp" && "💎 "}
                {partner.label === "Top bewertet" && "⭐ "}
                {partner.label}
              </span>
              {partner.category && (
                <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold shadow-sm bg-white/90 text-gray-800 backdrop-blur-sm">
                  {partner.category}
                </span>
              )}
            </div>
          )}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1.5 sm:gap-2">
            <button 
              className="w-7 h-7 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 hover:text-rose-500 transition-colors" />
            </button>
            <button 
              className="hidden sm:flex w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center shadow-md hover:bg-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                const url = `${window.location.origin}/partners/${partner.partnerId}`;
                const text = `${partner.partnerName} – ${partner.category || "Freizeiterlebnis"} in ${partner.city}`;
                if (navigator.share) {
                  navigator.share({ title: partner.partnerName, text, url });
                } else {
                  navigator.clipboard.writeText(url);
                  const btn = e.currentTarget;
                  btn.classList.add("bg-green-100");
                  setTimeout(() => btn.classList.remove("bg-green-100"), 1500);
                }
              }}
            >
              <Share2 className="w-4 h-4 text-gray-500 hover:text-purple-600 transition-colors" />
            </button>
          </div>
          {partner.logoUrl && !isPlaceholderLogo(partner.logoUrl) ? (
            <div className={`absolute bottom-2 sm:bottom-3 right-2 sm:right-3 rounded-lg p-1 sm:p-1.5 shadow-lg ${partner.logoBgColor === 'white' ? 'bg-white' : 'bg-black/80'}`}>
              <img 
                src={partner.logoUrl} 
                alt={`${partner.partnerName} Logo`}
                className="h-5 sm:h-7 w-auto object-contain"
              />
            </div>
          ) : (
            <div className={`absolute bottom-2 sm:bottom-3 right-2 sm:right-3 rounded-lg shadow-lg ${getCategoryColor(partner.category).bg} px-1.5 sm:px-2 py-1 sm:py-1.5 flex items-center gap-1`}>
              <span className={`text-[10px] sm:text-xs font-bold ${getCategoryColor(partner.category).text} tracking-wide`}>
                {getInitials(partner.partnerName)}
              </span>
            </div>
          )}
        </div>
        <div className="p-2.5 sm:p-4 flex-1 flex flex-col">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">{partner.category || partner.partnerName}</p>
          <h3 className="font-bold text-xs sm:text-base text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2 mb-1 sm:mb-1.5">
            {partner.partnerName}
          </h3>
          <div className="text-[11px] sm:text-sm text-gray-500 flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{partner.city}</span>
            <span className="hidden sm:inline mx-1 text-gray-300">|</span>
            <Navigation className="hidden sm:block w-3 h-3 flex-shrink-0 text-purple-500" />
            <span className="hidden sm:inline text-purple-600 font-medium whitespace-nowrap">{partner.distance} km</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
            {renderStars(partner.rating)}
            <span className="text-xs sm:text-sm font-semibold text-gray-800">{partner.rating.toFixed(1)}</span>
            {partner.reviewCount > 0 && (
              <span className="text-[10px] sm:text-xs text-gray-400">({partner.reviewCount})</span>
            )}
          </div>
          {partner.tickets.length > 0 && (
            <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-100 space-y-1">
              {partner.tickets.slice(0, 2).map((ticket) => (
                <div key={ticket.id} className="flex justify-between items-center text-[11px] sm:text-sm">
                  <span className="text-gray-600 truncate flex-1 mr-1 sm:mr-2">{ticket.title}</span>
                  <span className="font-bold text-purple-700 whitespace-nowrap">ab {(ticket.price).toFixed(2)}€</span>
                </div>
              ))}
              {partner.tickets.length > 2 && (
                <p className="text-[10px] sm:text-xs text-purple-600 font-medium pt-0.5">
                  + {partner.tickets.length - 2} weitere →
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );

  const handleSearch = () => {
    // DEMO: no /search results page exists yet - route to the closest
    // matching (or Bowling, as a last resort) working partner shop
    // instead of a dead /search?... link.
    setLocation(resolveCategoryRoute(activityFilter || locationFilter));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[350px] sm:min-h-[400px] md:min-h-[450px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBackground})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-white"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-24 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            Freizeit einfach buchen!
          </h1>
          <p className="text-lg sm:text-xl text-white mb-8">
            Finde die besten Aktivitäten in deiner Nähe
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl md:rounded-full shadow-xl p-3 sm:p-2 max-w-4xl mx-auto flex flex-col md:flex-row items-stretch md:items-center gap-1 md:gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 md:py-2 border-b md:border-b-0 border-gray-100">
              <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Ort eingeben"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                data-testid="input-location"
              />
            </div>
            
            <div className="hidden md:block w-px h-8 bg-gray-200"></div>
            
            <div className="flex-1 border-b md:border-b-0 border-gray-100">
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="border-none shadow-none bg-transparent focus:ring-0 py-2.5 md:py-2 text-sm sm:text-base" data-testid="select-activity">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-gray-400" />
                    <SelectValue placeholder="Aktivität auswählen" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <SelectItem value="axtwerfen">Axtwerfen</SelectItem>
                  <SelectItem value="billard">Billard</SelectItem>
                  <SelectItem value="billard-dart">Billard & Dart</SelectItem>
                  <SelectItem value="bootstouren">Bootstouren</SelectItem>
                  <SelectItem value="bootsverleih">Bootsverleih</SelectItem>
                  <SelectItem value="bouldern">Bouldern</SelectItem>
                  <SelectItem value="bowling">Bowling</SelectItem>
                  <SelectItem value="day-spa">Day Spa</SelectItem>
                  <SelectItem value="eissporthalle">Eissporthalle</SelectItem>
                  <SelectItem value="escape-rooms">Escape Room</SelectItem>
                  <SelectItem value="freibad">Freibad</SelectItem>
                  <SelectItem value="freizeitpark">Freizeitpark</SelectItem>
                  <SelectItem value="fussballgolf">Fußballgolf</SelectItem>
                  <SelectItem value="games">Gaming Center</SelectItem>
                  <SelectItem value="golf">Golf</SelectItem>
                  <SelectItem value="indoorspielplatz">Indoorspielplatz</SelectItem>
                  <SelectItem value="kartbahn">Kartbahn</SelectItem>
                  <SelectItem value="kegeln">Kegeln</SelectItem>
                  <SelectItem value="kinderbauernhof">Kinderbauernhof</SelectItem>
                  <SelectItem value="kino">Kino</SelectItem>
                  <SelectItem value="kletterhalle">Kletterhalle</SelectItem>
                  <SelectItem value="kletterpark">Kletterpark</SelectItem>
                  <SelectItem value="kultur">Kultur & Events</SelectItem>
                  <SelectItem value="lasertag">Lasertag</SelectItem>
                  <SelectItem value="minigolf">Minigolf</SelectItem>
                  <SelectItem value="museum">Museum</SelectItem>
                  <SelectItem value="padeltennis">Padel</SelectItem>
                  <SelectItem value="paintball">Paintball</SelectItem>
                  <SelectItem value="reiten">Reiten</SelectItem>
                  <SelectItem value="schwimmbad">Schwimmbad</SelectItem>
                  <SelectItem value="ski">Ski</SelectItem>
                  <SelectItem value="soccer">Soccer</SelectItem>
                  <SelectItem value="swingolf">Swingolf</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="theater">Theater</SelectItem>
                  <SelectItem value="toepfern">Töpfern</SelectItem>
                  <SelectItem value="trampolinhalle">Trampolinhalle</SelectItem>
                  <SelectItem value="vr-spiele">VR Spiele</SelectItem>
                  <SelectItem value="wasserski">Wasserski</SelectItem>
                  <SelectItem value="wellness">Wellness & Spa</SelectItem>
                  <SelectItem value="zoo">Zoo & Tierpark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="hidden md:block w-px h-8 bg-gray-200"></div>
            
            <div className="flex-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left font-normal px-4 py-2.5 md:py-2 h-auto hover:bg-transparent text-sm sm:text-base",
                      !dateFilter && "text-gray-400"
                    )}
                    data-testid="input-date"
                  >
                    <Calendar className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                    {dateFilter ? format(dateFilter, "d. MMMM yyyy", { locale: de }) : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    locale={de}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button 
              onClick={handleSearch}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold whitespace-nowrap w-full md:w-auto mt-1 md:mt-0"
              data-testid="btn-search"
            >
              Jetzt entdecken
            </Button>
          </div>
        </div>
      </section>

      {/* Mach-mit-Gruppen / Find People */}
      <div className="-mt-8 relative z-20 rounded-t-3xl bg-white pt-2">
        <GroupActivitiesSection />
        <EventGroupsSection />
        <BundlesPromoSection />
      </div>

      {/* Empfohlene Freizeitangebote */}
      <section className="py-6 sm:py-8 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-purple-700 rounded-full"></div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Empfohlene Freizeitangebote</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {partnerGroups.slice(0, 4).map((partner) => renderPartnerCard(partner, true))}
          </div>
        </div>
      </section>

      {/* Beliebte Angebote */}
      <section className="py-6 sm:py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-cyan-500 rounded-full"></div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Beliebte Angebote</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {partnerGroups.slice(4, 8).map((partner) => renderPartnerCard(partner))}
          </div>
        </div>
      </section>

      {/* Weitere Freizeitaktivitäten */}
      <section className="py-6 sm:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-purple-600 rounded-full"></div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Weitere Freizeitaktivitäten</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {partnerGroups.slice(8, 16).map((partner) => renderPartnerCard(partner))}
          </div>
        </div>
      </section>

      {/* Alle Partner */}
      <section className="bg-gray-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-4 sm:mb-6 gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-800 lg:text-3xl">
                Was erlebst du heute in deiner Stadt?
              </h2>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                Entdecke {onePartnerPerCity.length} Städte voller Abenteuer
              </p>
            </div>
            <Link href="/search" className="hidden sm:block">
              <Button variant="link" className="gap-1 text-primary">
                Alle anzeigen
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoadingExperiences ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                  <div className="h-24 sm:h-36 bg-gray-200"></div>
                  <div className="p-2.5 sm:p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:hidden">
                {onePartnerPerCity.slice(0, 6).map((partner) => renderPartnerCard(partner))}
              </div>
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {onePartnerPerCity.map((partner) => renderPartnerCard(partner))}
              </div>
            </>
          )}
          
          <div className="text-center mt-6 sm:mt-10">
            <Link href="/search">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all">
                Jetzt weitere Aktivitäten anschauen
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="bg-white py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl">
              Entdecke Erlebnisse in deiner Stadt
            </h2>
            <p className="mt-1 text-base text-gray-600">
              {cities?.length || 0} Städte mit tollen Freizeitangeboten
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {(showAllCities ? cities : cities?.slice(0, 18))?.map((city) => (
              // DEMO: no per-city /search results page exists yet - route to
              // the working Bowling shop instead of a dead ?location= link.
              <Link key={city} href={DEFAULT_ACTIVITY_DETAIL_ROUTE}>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer group">
                  <MapPin className="h-3.5 w-3.5 text-purple-400 group-hover:text-purple-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 group-hover:text-purple-700 truncate">{city}</span>
                </div>
              </Link>
            ))}
          </div>
          {cities && cities.length > 18 && (
            <div className="text-center mt-4">
              <Button
                variant="ghost"
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                onClick={() => setShowAllCities(!showAllCities)}
              >
                {showAllCities ? 'Weniger anzeigen' : `Alle ${cities.length} Städte anzeigen`}
                <ChevronRight className={cn("ml-1 h-4 w-4 transition-transform", showAllCities && "rotate-90")} />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Authentic Partners Section */}
      <section className="bg-gray-50 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl">
              Unsere Kategorien
            </h2>
            <p className="mt-1 text-base text-gray-600">
              Entdecke vielfältige Freizeitaktivitäten in ganz NRW
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
            {partnerCategoryStats.map((cat) => (
              <Link key={cat.name} href={resolveCategoryRoute(cat.name)}>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-5 flex flex-col items-center justify-center hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group">
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full ${cat.bgColor} flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                    <cat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${cat.iconColor}`} />
                  </div>
                  <span className="font-semibold text-gray-900 text-xs sm:text-sm text-center leading-tight">{cat.name}</span>
                  <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{cat.count} Partner</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mb-3">
            Biete deine eigenen Erlebnisse an
          </h2>
          <p className="max-w-2xl mx-auto text-base text-white/80 mb-6">
            Bist du ein Anbieter von Freizeitaktivitäten oder Erlebnissen? Werde Partner und
            erreiche neue Kunden.
          </p>
          <Link href="/partner">
            <Button variant="secondary" size="lg" className="font-medium">
              Partner werden
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl">
              Wie es funktioniert
            </h2>
            <p className="mt-1 max-w-2xl mx-auto text-base text-gray-600">
              In nur wenigen Schritten zu deinem nächsten Abenteuer
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-8">
            <div className="text-center">
              <div className="bg-blue-50 rounded-full w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Compass className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-sm sm:text-xl font-bold mb-1 sm:mb-2">1. Entdecken</h3>
              <p className="text-xs sm:text-base text-gray-600 hidden sm:block">
                Suche nach Erlebnissen in deiner Nähe oder entdecke neue Orte und Aktivitäten für 
                deine Freizeit.
              </p>
              <p className="text-[11px] text-gray-600 sm:hidden leading-tight">
                Finde Erlebnisse in deiner Nähe
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-50 rounded-full w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-sm sm:text-lg font-bold mb-1 sm:mb-1.5">2. Buchen</h3>
              <p className="text-xs sm:text-base text-gray-600 hidden sm:block">
                Wähle die Anzahl der Teilnehmer und buche direkt online. Du erhältst sofort eine Bestätigung.
              </p>
              <p className="text-[11px] text-gray-600 sm:hidden leading-tight">
                Buche direkt online
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-50 rounded-full w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm sm:text-lg font-bold mb-1 sm:mb-1.5">3. Erleben</h3>
              <p className="text-xs sm:text-base text-gray-600 hidden sm:block">
                Genieße dein Erlebnis! Zeige einfach deinen QR-Code vor Ort und schon kann dein
                Abenteuer beginnen.
              </p>
              <p className="text-[11px] text-gray-600 sm:hidden leading-tight">
                Zeige deinen QR-Code vor Ort
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}