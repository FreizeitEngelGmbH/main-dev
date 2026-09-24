import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  totalReviews?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showCount?: boolean;
}

export function StarRating({
  rating,
  totalReviews,
  size = "md",
  className,
  showCount = true,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  const starSizeClass = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];
  
  const textSizeClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];
  
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return (
              <Star
                key={i}
                className={cn("text-yellow-400 fill-current", starSizeClass)}
              />
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <StarHalf
                key={i}
                className={cn("text-yellow-400 fill-current", starSizeClass)}
              />
            );
          } else {
            return (
              <Star
                key={i}
                className={cn("text-gray-300", starSizeClass)}
              />
            );
          }
        })}
      </div>
      
      {showCount && (
        <span className={cn("ml-1 text-gray-600", textSizeClass)}>
          {rating.toFixed(1)}
          {totalReviews !== undefined && ` (${totalReviews})`}
        </span>
      )}
    </div>
  );
}
