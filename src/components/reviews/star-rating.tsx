import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  className?: string;
}

export function StarRating({
  value,
  onChange,
  size = "md",
  readOnly = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  
  const sizes = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };
  
  const starSize = sizes[size];
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {stars.map((star) => {
        const isActive = (hoverValue ?? value) >= star;
        return (
          <Star
            key={star}
            className={cn(
              starSize,
              "transition-colors cursor-pointer",
              isActive
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300",
              readOnly && "cursor-default"
            )}
            onClick={() => {
              if (!readOnly && onChange) {
                onChange(star);
              }
            }}
            onMouseEnter={() => {
              if (!readOnly) {
                setHoverValue(star);
              }
            }}
            onMouseLeave={() => {
              if (!readOnly) {
                setHoverValue(null);
              }
            }}
          />
        );
      })}
    </div>
  );
}