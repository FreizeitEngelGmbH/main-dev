import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Review, User, Experience } from "@shared/schema";
import { ReviewList } from "./review-list";
import { ReviewForm } from "./review-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface ExperienceReviewsProps {
  experienceId: number;
  className?: string;
}

type ExtendedReview = Review & { 
  user: User;
  title: string;
  content: string;
  helpfulCount?: number;
};

export function ExperienceReviews({ experienceId, className }: ExperienceReviewsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Bewertungen abrufen
  const { 
    data: reviews = [], 
    isLoading,
    isError,
  } = useQuery<ExtendedReview[]>({
    queryKey: ["/api/reviews", experienceId],
    queryFn: () => 
      apiRequest("GET", `/api/reviews?experienceId=${experienceId}`)
        .then(res => res.json()),
  });
  
  // Erfahrung abrufen für durchschnittliche Bewertung
  const { data: experience } = useQuery<Experience>({
    queryKey: ["/api/experiences", experienceId],
    queryFn: () => 
      apiRequest("GET", `/api/experiences/${experienceId}`)
        .then(res => res.json()),
  });
  
  // Überprüfen, ob der Benutzer bereits eine Bewertung abgegeben hat
  const hasUserReviewed = user ? reviews.some(review => review.userId === user.id) : false;
  
  // Überprüfen, ob der Benutzer eine gültige Buchung für dieses Erlebnis hat
  const { data: userCanReview = false } = useQuery<boolean>({
    queryKey: ["/api/reviews/can-review", experienceId],
    queryFn: () => 
      apiRequest("GET", `/api/reviews/can-review?experienceId=${experienceId}`)
        .then(res => res.json())
        .then(data => data.canReview),
    enabled: !!user && !hasUserReviewed,
  });
  
  // Bewertung erstellen
  const createReviewMutation = useMutation({
    mutationFn: async (data: { 
      experienceId: number;
      rating: number;
      title: string;
      content: string;
    }) => {
      const response = await apiRequest("POST", "/api/reviews", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", experienceId] });
      queryClient.invalidateQueries({ queryKey: ["/api/experiences", experienceId] });
      toast({
        title: "Bewertung erfolgreich abgegeben",
        description: "Vielen Dank für Ihre Bewertung!",
      });
      setShowReviewForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler beim Absenden der Bewertung",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmitReview = (data: { 
    title: string;
    content: string;
    rating: number;
  }) => {
    if (!user) {
      toast({
        title: "Nicht angemeldet",
        description: "Sie müssen angemeldet sein, um eine Bewertung abzugeben.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    createReviewMutation.mutate({
      experienceId,
      ...data,
    });
  };
  
  const averageRating = experience?.rating || 0;
  const reviewCount = reviews.length;
  const canReview = user && !hasUserReviewed && userCanReview;
  
  if (isLoading) {
    return <div className="py-6 text-center">Bewertungen werden geladen...</div>;
  }
  
  if (isError) {
    return (
      <div className="py-6 text-center text-red-500">
        Fehler beim Laden der Bewertungen
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Bewertungen & Feedback</h2>
        <p className="text-gray-600">
          Erfahren Sie, was andere Nutzer über dieses Erlebnis berichten.
        </p>
      </div>
      
      {canReview && !showReviewForm && (
        <div className="mb-6">
          <Button
            onClick={() => setShowReviewForm(true)}
            variant="outline"
            className="w-full md:w-auto"
          >
            Bewertung abgeben
          </Button>
        </div>
      )}
      
      {showReviewForm && (
        <div className="mb-8 p-4 border rounded-lg bg-white shadow-sm">
          <ReviewForm
            experienceId={experienceId}
            onSubmit={handleSubmitReview}
            isSubmitting={createReviewMutation.isPending}
          />
        </div>
      )}
      
      <ReviewList
        reviews={reviews}
        averageRating={averageRating}
        reviewCount={reviewCount}
      />
    </div>
  );
}