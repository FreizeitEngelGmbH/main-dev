import { Review, User } from "@shared/schema";
import { ReviewCard } from "./review-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { useState } from "react";

// Erweiterte Review-Typen für Komponente
type ExtendedReview = Review & { 
  user: User;
  title: string;
  content: string;
  helpfulCount?: number;
};

interface ReviewListProps {
  reviews: ExtendedReview[];
  averageRating: number;
  reviewCount: number;
  className?: string;
  onLoadMore?: () => void;
  hasMoreReviews?: boolean;
  isLoadingMore?: boolean;
}

type SortOption = "newest" | "oldest" | "highest" | "lowest" | "most_helpful";

export function ReviewList({
  reviews,
  averageRating,
  reviewCount,
  className,
  onLoadMore,
  hasMoreReviews = false,
  isLoadingMore = false,
}: ReviewListProps) {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  
  // Implementierung der Sortierlogik
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime();
      case "oldest":
        return new Date(a.createdAt || new Date()).getTime() - new Date(b.createdAt || new Date()).getTime();
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      case "most_helpful":
        return ((b.helpfulCount ?? 0) - (a.helpfulCount ?? 0));
      default:
        return 0;
    }
  });
  
  const formatRating = (rating: number) => {
    return rating.toFixed(1).replace(".", ",");
  };
  
  // Generiere Bewertungsstatistik
  const ratingStats = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((r) => r.rating === rating).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating, count, percentage };
  });
  
  return (
    <div className={className}>
      <div className="border rounded-lg p-5 bg-white shadow-sm mb-6">
        <h3 className="text-xl font-semibold">
          Bewertungen ({reviewCount})
        </h3>
        
        <div className="flex flex-col md:flex-row gap-6 mt-4">
          {/* Bewertungsübersicht */}
          <div className="md:w-1/3">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{formatRating(averageRating)}</span>
              <span className="text-lg text-gray-500 ml-2">von 5</span>
            </div>
            
            <div className="mt-4 space-y-2">
              {ratingStats.map((stat) => (
                <div key={stat.rating} className="flex items-center gap-2">
                  <div className="w-12 text-sm">{stat.rating} Sterne</div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <div className="w-10 text-sm text-right">{stat.count}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Hinweise */}
          <div className="md:w-2/3 md:border-l md:pl-6">
            <h4 className="text-lg font-medium mb-2">Über Bewertungen</h4>
            <p className="text-gray-600 text-sm">
              Bewertungen helfen anderen Nutzern, die richtige Entscheidung zu treffen.
              Nur verifizierte Buchungen können Bewertungen abgeben, um die Qualität
              und Authentizität sicherzustellen.
            </p>
          </div>
        </div>
      </div>
      
      {/* Sortieroption */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Kundenbewertungen</h3>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-[180px] h-8 text-sm">
              <SelectValue placeholder="Sortieren nach" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Neueste zuerst</SelectItem>
              <SelectItem value="oldest">Älteste zuerst</SelectItem>
              <SelectItem value="highest">Höchste Bewertung</SelectItem>
              <SelectItem value="lowest">Niedrigste Bewertung</SelectItem>
              <SelectItem value="most_helpful">Hilfreichste</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Bewertungsliste */}
      {sortedReviews.length > 0 ? (
        <div className="space-y-4">
          {sortedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              userName={review.user.fullName || review.user.username}
              userImage={review.user.profileImage ?? undefined}
              rating={review.rating}
              date={new Date(review.createdAt ?? new Date())}
              title={review.title}
              content={review.content}
              helpfulCount={review.helpfulCount ?? 0}
            />
          ))}
          
          {hasMoreReviews && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={onLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Wird geladen..." : "Mehr Bewertungen laden"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg bg-gray-50">
          <p className="text-gray-500">
            Dieses Erlebnis hat noch keine Bewertungen.
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Seien Sie der Erste, der eine Bewertung hinterlässt!
          </p>
        </div>
      )}
    </div>
  );
}