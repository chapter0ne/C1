import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createReview } from "@/hooks/useReviews";
import { useQueryClient } from "@tanstack/react-query";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  themeColor?: string;
}

const ReviewModal = ({ isOpen, onClose, bookId, themeColor = "#000000" }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createReviewMutation = createReview(bookId);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setHoveredRating(0);
      setReviewText("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createReviewMutation.mutateAsync({
        book: bookId,
        rating,
        reviewText: reviewText.trim(),
      });
      
      toast({
        title: "Review Submitted!",
        description: "Thank you for your review. It has been submitted successfully.",
        duration: 3000,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['reviews', bookId] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', bookId] });
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div>
            <label className="text-sm font-medium mb-2 block">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= displayRating
                        ? 'fill-current'
                        : 'fill-none'
                    }`}
                    style={{
                      color: star <= displayRating ? themeColor : '#d1d5db',
                    }}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {rating} {rating === 1 ? 'star' : 'stars'}
                </span>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Review (optional)
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => {
                if (e.target.value.length <= 280) {
                  setReviewText(e.target.value);
                }
              }}
              placeholder="Share your thoughts about this book..."
              className="min-h-[120px] resize-none"
              maxLength={280}
              disabled={isSubmitting}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {reviewText.length}/280 characters
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              style={{ backgroundColor: themeColor }}
              className="text-white hover:opacity-90"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
