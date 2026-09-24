import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "./star-rating";
import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ReviewCardProps {
  userName: string;
  userImage?: string;
  rating: number;
  date: Date;
  title: string;
  content: string;
  helpfulCount?: number;
  onMarkHelpful?: () => void;
  className?: string;
}

export function ReviewCard({
  userName,
  userImage,
  rating,
  date,
  title,
  content,
  helpfulCount = 0,
  onMarkHelpful,
  className,
}: ReviewCardProps) {
  const [isHelpful, setIsHelpful] = useState(false);
  const [localHelpfulCount, setLocalHelpfulCount] = useState(helpfulCount);
  
  const handleMarkHelpful = () => {
    if (!isHelpful) {
      setIsHelpful(true);
      setLocalHelpfulCount((prev) => prev + 1);
      if (onMarkHelpful) {
        onMarkHelpful();
      }
    }
  };
  
  const timeAgo = formatDistanceToNow(date, { 
    addSuffix: true,
    locale: de 
  });
  
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  
  return (
    <div className={cn("border rounded-lg p-4 bg-white shadow-sm", className)}>
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          {userImage ? (
            <AvatarImage src={userImage} alt={userName} />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{userName}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <StarRating value={rating} readOnly size="sm" />
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>
          
          <h4 className="font-medium mt-2">{title}</h4>
          <p className="mt-1 text-gray-700">{content}</p>
          
          <div className="mt-3 flex items-center gap-1">
            <button
              onClick={handleMarkHelpful}
              disabled={isHelpful}
              className={cn(
                "flex items-center gap-1 text-sm py-1 px-2 rounded-md",
                isHelpful
                  ? "bg-gray-100 text-gray-600"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>Hilfreich</span>
              {localHelpfulCount > 0 && (
                <span className="ml-1">({localHelpfulCount})</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}