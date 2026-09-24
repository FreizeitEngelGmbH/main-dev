import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { MapPin, Star, Clock, Users, ChevronRight, Shield, Truck, RotateCcw, Heart, Share2, Minus, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Experience, Category, Review } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { FavoritesButton } from "@/components/favorites-button";

interface ExperienceDetailProps {
  id: number;
}

interface ExperienceWithDetails extends Experience {
  category: Category;
  reviews: Review[];
}

export default function ExperienceDetailPage({ id }: ExperienceDetailProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const { data: experience, isLoading } = useQuery<ExperienceWithDetails>({
    queryKey: [`/api/experiences/${id}`],
  });

  const { data: partnerInfo } = useQuery<any>({
    queryKey: [`/api/partners/${experience?.partnerId}`],
    enabled: !!experience?.partnerId,
  });
  
  if (isLoading) {
    return <ExperienceDetailSkeleton />;
  }
  
  if (!experience) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12 px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erlebnis nicht gefunden</h2>
          <p className="text-gray-600 mb-6">Das gesuchte Erlebnis existiert nicht.</p>
          <Button onClick={() => navigate("/search")}>Zurück zur Suche</Button>
        </div>
      </div>
    );
  }

  const totalPrice = (experience.price * quantity).toFixed(2);
  
  const galleryImages = [
    experience.imageUrl || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    "https://images.unsplash.com/photo-1540539234-c14a20fb7c7b?w=800",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/search" className="hover:text-primary transition-colors">Erlebnisse</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-900 font-medium truncate max-w-xs">{experience.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* Left: Image Gallery */}
            <div className="p-6 lg:p-8 bg-gray-50">
              {/* Main Image */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-white">
                <img
                  src={galleryImages[selectedImage]}
                  alt={experience.title}
                  className="w-full h-full object-cover"
                  data-testid="img-main-product"
                />
                {experience.featured && (
                  <Badge className="absolute top-4 left-4 bg-purple-600 hover:bg-purple-700">
                    Bestseller
                  </Badge>
                )}
                {experience.trending && (
                  <Badge className="absolute top-4 right-4 bg-red-500 hover:bg-red-600">
                    Beliebt
                  </Badge>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="flex gap-3">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    data-testid={`button-thumbnail-${idx}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="p-6 lg:p-8 flex flex-col">
              {/* Category & Rating */}
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className="text-xs font-normal">
                  {experience.category.name}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-sm">{experience.rating?.toFixed(1) || "Neu"}</span>
                  <span className="text-gray-400 text-sm">({experience.reviewCount || 0} Bewertungen)</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2" data-testid="text-product-title">
                {experience.title}
              </h1>

              {/* Location */}
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{experience.location}, {experience.city}</span>
              </div>

              {/* Price Section */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-5 mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold text-primary" data-testid="text-product-price">
                    {experience.price.toFixed(2).replace('.', ',')}€
                  </span>
                  <span className="text-gray-500">pro Person</span>
                </div>
                <p className="text-sm text-gray-600">inkl. MwSt. • Sofortige Bestätigung</p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Anzahl Personen</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                      data-testid="button-quantity-minus"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-6 py-3 font-medium min-w-[60px] text-center" data-testid="text-quantity">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="p-3 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= 10}
                      data-testid="button-quantity-plus"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    Gesamt: <span className="text-primary" data-testid="text-total-price">{totalPrice} €</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Button 
                  size="lg" 
                  className="flex-1 h-14 text-lg font-semibold"
                  onClick={() => navigate(partnerInfo?.isLive ? `/checkout?experienceId=${experience.id}&participants=${quantity}` : `/waitlist/${experience.id}`)}
                  data-testid="button-book-now"
                >
                  {partnerInfo?.isLive ? 'Jetzt buchen' : 'Interesse anmelden'}
                </Button>
                <FavoritesButton 
                  experienceId={experience.id} 
                  variant="outline"
                  size="lg"
                  className="h-14 px-6"
                  showText={false}
                />
                <Button variant="outline" size="lg" className="h-14 px-6" data-testid="button-share">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-600">Sichere Buchung</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-600">Digitaler Versand</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <RotateCcw className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-xs text-gray-600">Flexible Termine</span>
                </div>
              </div>

              {/* Quick Info */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Sofortige Buchungsbestätigung per E-Mail</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">QR-Code Ticket zum Vorzeigen</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Keine versteckten Gebühren</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Description */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 lg:p-8">
            <h2 className="text-xl font-bold mb-4">Beschreibung</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line" data-testid="text-description">
              {experience.description}
            </p>
            
            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <Clock className="h-5 w-5 text-primary mb-2" />
                <h3 className="font-medium text-sm mb-1">Dauer</h3>
                <p className="text-gray-600 text-sm">Nach Verfügbarkeit</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <Users className="h-5 w-5 text-primary mb-2" />
                <h3 className="font-medium text-sm mb-1">Teilnehmer</h3>
                <p className="text-gray-600 text-sm">1-10 Personen</p>
              </div>
            </div>
          </div>

          {/* Location & Partner Info */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Standort</h2>
            <div className="bg-gray-100 rounded-xl h-40 flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{experience.location}</p>
              <p className="text-gray-600">{experience.postalCode} {experience.city}</p>
              <p className="text-gray-600">{experience.country}</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Kundenbewertungen</h2>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-lg">{experience.rating?.toFixed(1) || "–"}</span>
              <span className="text-gray-500">({experience.reviewCount || 0})</span>
            </div>
          </div>

          {experience.reviews && experience.reviews.length > 0 ? (
            <div className="space-y-6">
              {experience.reviews.slice(0, 3).map((review, index) => (
                <div key={index} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-medium text-primary">U{review.userId}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Benutzer {review.userId}</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{(review as any).content || (review as any).comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Star className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Noch keine Bewertungen vorhanden</p>
              <p className="text-gray-400 text-sm mt-1">Seien Sie der Erste!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExperienceDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-8 bg-gray-50">
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <div className="flex gap-3 mt-4">
                <Skeleton className="w-20 h-20 rounded-lg" />
                <Skeleton className="w-20 h-20 rounded-lg" />
                <Skeleton className="w-20 h-20 rounded-lg" />
              </div>
            </div>
            <div className="p-8">
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-4 w-48 mb-6" />
              <Skeleton className="h-24 w-full rounded-xl mb-6" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
