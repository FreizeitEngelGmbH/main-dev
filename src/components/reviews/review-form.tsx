import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./star-rating";
import { Loader2 } from "lucide-react";

const reviewSchema = z.object({
  title: z.string().min(3, "Titel muss mindestens 3 Zeichen lang sein").max(100),
  content: z.string().min(10, "Bewertung muss mindestens 10 Zeichen lang sein").max(1000),
  rating: z.number().min(1, "Bitte geben Sie eine Bewertung ab").max(5),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  experienceId: number;
  onSubmit: (data: ReviewFormValues) => void;
  isSubmitting?: boolean;
  className?: string;
}

export function ReviewForm({
  experienceId,
  onSubmit,
  isSubmitting = false,
  className,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      title: "",
      content: "",
      rating: 0,
    },
  });
  
  const handleSubmit = (data: ReviewFormValues) => {
    onSubmit(data);
  };
  
  const handleRatingChange = (value: number) => {
    setRating(value);
    form.setValue("rating", value);
  };
  
  return (
    <div className={className}>
      <h3 className="text-lg font-medium mb-4">Ihre Bewertung abgeben</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <p className="font-medium">Gesamtbewertung:</p>
            <FormField
              control={form.control}
              name="rating"
              render={() => (
                <FormItem>
                  <FormControl>
                    <StarRating
                      value={rating}
                      onChange={handleRatingChange}
                      size="lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel Ihrer Bewertung</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="z.B. Großartige Erfahrung!" 
                    {...field} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ihre Bewertung</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Beschreiben Sie Ihre Erfahrung..."
                    className="min-h-[120px]"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              "Bewertung abschicken"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}