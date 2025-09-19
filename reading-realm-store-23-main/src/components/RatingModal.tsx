
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Star, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import { useToast } from "@/hooks/use-toast";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: any;
  onRatingSubmit?: () => void;
  canReview?: boolean;
}

const RatingModal = ({ isOpen, onClose, book, onRatingSubmit, canReview = false }: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleSubmit = async () => {
    if (!user || !book || rating === 0) return;

    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (canReview) {
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      });

      // Reset form
      setRating(0);
      setReview("");
      onRatingSubmit?.();
      onClose();
    } else {
      toast({
        title: "Review not allowed",
        description: "You must have this book in your library to leave a review.",
        variant: "destructive"
      });
    }

    setIsSubmitting(false);
  };

  if (!book) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Rate This Book</DialogTitle>
          <DialogDescription>
            Share your thoughts and rate this book to help other readers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{book.title}</h3>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Your rating</h4>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "text-black fill-black"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>



          {/* Review functionality permanently disabled */}
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">Review functionality is currently disabled</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
